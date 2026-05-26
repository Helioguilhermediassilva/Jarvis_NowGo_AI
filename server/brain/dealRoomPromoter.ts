/**
 * server/brain/dealRoomPromoter.ts
 *
 * Mantém o invariante "Top 5 Deal Rooms ativos por tenant", conforme
 * decisão de produto F47:
 *
 *   • Quando um deal room transiciona para `resolved`, `lost` ou `paused`,
 *     o promoter procura a próxima oportunidade do mesmo tenant com
 *     `priority_category = 'foco_imediato'` que ainda não está em deal room
 *     ativo, ordenada por `computed_score DESC`, e a promove a deal room.
 *
 *   • Toda operação roda em uma transação SERIALIZABLE com `withTenant`,
 *     garantindo isolamento e impedindo que dois requests concorrentes
 *     promovam dois candidatos para o mesmo slot.
 *
 *   • Cada transição (manual ou automática) gera uma linha em
 *     `deal_room_audit` no mesmo escopo da transação para preservar o
 *     histórico imutável.
 *
 *  Este módulo encapsula APENAS a regra de negócio — a UI/voz/comando que
 *  dispara a transição (resolve, lose, pause) deve chamar
 *  `transitionDealRoomStatus` aqui.
 */
import { sql, and, eq, desc, isNull, inArray } from "drizzle-orm";
import { withTenant } from "../db/client.js";
import {
  dealRooms,
  dealRoomAudit,
  opportunities,
  type DealRoomRow,
} from "../db/schema.js";

export type DealRoomStatus = "active" | "resolved" | "lost" | "paused";
export type DealRoomTransitionReason =
  | "manual"
  | "auto-promote"
  | "auto-demote";

export interface TransitionInput {
  /** Tenant proprietário do deal room (RLS depende disso). */
  tenantId: string;
  /** Deal room a transicionar. */
  dealRoomId: string;
  /** Status alvo. */
  toStatus: DealRoomStatus;
  /** Usuário que disparou a transição (cockpit, voz, admin). */
  triggeredBy: string;
  /** Notas opcionais de resolução/perda. */
  resolutionNotes?: string;
}

export interface PromotionInput {
  tenantId: string;
  /** Usuário responsável pelo novo deal room (default: o mesmo `triggeredBy`). */
  ownerUserId: string;
  /** Quem disparou a promoção (para audit). */
  triggeredBy: string;
}

export interface PromoterOutcome {
  /** Deal room atualizado (status novo). `null` quando a promoção foi pura. */
  updatedDealRoom: DealRoomRow | null;
  /** Deal room recém-criado pela reposição automática. `null` se nenhum slot foi liberado ou se não havia candidato `foco_imediato`. */
  promotedDealRoom: DealRoomRow | null;
  /** Quantos slots ativos o tenant tem após a operação. */
  activeCount: number;
}

const MAX_ACTIVE_DEAL_ROOMS = 5;
const TERMINAL_STATUSES: DealRoomStatus[] = ["resolved", "lost", "paused"];

/**
 * Transiciona um deal room para um novo status e, se o status alvo é terminal
 * e existe candidato `foco_imediato` no pipeline, promove automaticamente o
 * próximo candidato para preencher o slot liberado.
 */
export async function transitionDealRoomStatus(
  input: TransitionInput,
): Promise<PromoterOutcome> {
  const {
    tenantId,
    dealRoomId,
    toStatus,
    triggeredBy,
    resolutionNotes = null,
  } = input;

  return withTenant(tenantId, async (tx, raw) => {
    // Força isolamento serializable — a checagem de slot disponível +
    // promoção devem ser atômicas.
    await raw.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    // 1. Localiza o deal room atual e bloqueia para update.
    const lockResult = await raw.query<{
      id: string;
      tenant_id: string;
      status: string;
      score_at_promotion: string;
    }>(
      `SELECT id, tenant_id, status, score_at_promotion
         FROM nowgo_brain.deal_rooms
        WHERE id = $1 AND tenant_id = $2
        FOR UPDATE`,
      [dealRoomId, tenantId],
    );
    if (lockResult.rowCount === 0) {
      throw new Error(
        `dealRoomPromoter: deal room ${dealRoomId} não encontrado no tenant ${tenantId}`,
      );
    }
    const current = lockResult.rows[0]!;
    const fromStatus = current.status as DealRoomStatus;

    if (fromStatus === toStatus) {
      throw new Error(
        `dealRoomPromoter: transição idempotente (status já é ${toStatus})`,
      );
    }

    // 2. Aplica a transição no deal room atual.
    const isTerminal = TERMINAL_STATUSES.includes(toStatus);
    const [updatedDealRoom] = await tx
      .update(dealRooms)
      .set({
        status: toStatus,
        resolvedAt: isTerminal ? new Date() : null,
        resolutionNotes: isTerminal ? resolutionNotes : null,
        updatedAt: new Date(),
      })
      .where(eq(dealRooms.id, dealRoomId))
      .returning();

    // 3. Audit append-only.
    await tx.insert(dealRoomAudit).values({
      tenantId,
      dealRoomId,
      fromStatus,
      toStatus,
      scoreSnapshot: current.score_at_promotion,
      triggeredBy,
      reason: "manual",
    });

    // 4. Se o status alvo é terminal, tenta promover próximo candidato.
    let promoted: DealRoomRow | null = null;
    if (isTerminal) {
      promoted = await promoteNextCandidateInTx(
        tx,
        raw,
        tenantId,
        triggeredBy,
        triggeredBy, // owner default = quem disparou a transição
      );
    }

    // 5. Conta slots ativos finais.
    const activeRows = await tx
      .select({ id: dealRooms.id })
      .from(dealRooms)
      .where(and(eq(dealRooms.tenantId, tenantId), eq(dealRooms.status, "active")));

    return {
      updatedDealRoom: updatedDealRoom ?? null,
      promotedDealRoom: promoted,
      activeCount: activeRows.length,
    };
  });
}

/**
 * Promove explicitamente o próximo candidato (sem transição prévia) — útil
 * quando o tenant tem menos de 5 ativos e o operador quer encher os slots.
 * No-op se já há 5 ativos.
 */
export async function promoteNextCandidate(
  input: PromotionInput,
): Promise<PromoterOutcome> {
  const { tenantId, ownerUserId, triggeredBy } = input;

  return withTenant(tenantId, async (tx, raw) => {
    await raw.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    const promoted = await promoteNextCandidateInTx(
      tx,
      raw,
      tenantId,
      triggeredBy,
      ownerUserId,
    );
    const activeRows = await tx
      .select({ id: dealRooms.id })
      .from(dealRooms)
      .where(and(eq(dealRooms.tenantId, tenantId), eq(dealRooms.status, "active")));
    return {
      updatedDealRoom: null,
      promotedDealRoom: promoted,
      activeCount: activeRows.length,
    };
  });
}

/**
 * Lógica de promoção, reutilizável dentro de uma transação já aberta.
 * Não abre nova transação — confia no `withTenant` do chamador.
 */
async function promoteNextCandidateInTx(
  tx: Parameters<Parameters<typeof withTenant>[1]>[0],
  raw: Parameters<Parameters<typeof withTenant>[1]>[1],
  tenantId: string,
  triggeredBy: string,
  ownerUserId: string,
): Promise<DealRoomRow | null> {
  // 1. Conta slots ativos. Se >= 5, não promove.
  const activeRows = await tx
    .select({ id: dealRooms.id, opportunityId: dealRooms.opportunityId })
    .from(dealRooms)
    .where(and(eq(dealRooms.tenantId, tenantId), eq(dealRooms.status, "active")));

  if (activeRows.length >= MAX_ACTIVE_DEAL_ROOMS) {
    return null;
  }

  const occupiedOppIds = activeRows.map((r) => r.opportunityId);

  // 2. Busca a oportunidade `foco_imediato` com maior score que ainda
  //    não está em deal room ativo.
  const baseFilter = and(
    eq(opportunities.tenantId, tenantId),
    eq(opportunities.priorityCategory, "foco_imediato"),
  );

  const candidateRows = await tx
    .select({
      id: opportunities.id,
      computedScore: opportunities.computedScore,
    })
    .from(opportunities)
    .where(
      occupiedOppIds.length > 0
        ? and(baseFilter, sql`${opportunities.id} NOT IN ${occupiedOppIds}`)
        : baseFilter,
    )
    .orderBy(desc(opportunities.computedScore))
    .limit(1);

  const candidate = candidateRows[0];
  if (!candidate || candidate.computedScore == null) {
    return null;
  }

  // 3. Insere novo deal room ativo.
  const [newRoom] = await tx
    .insert(dealRooms)
    .values({
      tenantId,
      opportunityId: candidate.id,
      ownerUserId,
      status: "active",
      scoreAtPromotion: candidate.computedScore,
    })
    .returning();

  if (!newRoom) {
    throw new Error("dealRoomPromoter: insert do novo deal room não retornou row");
  }

  // 4. Audit append-only.
  await tx.insert(dealRoomAudit).values({
    tenantId,
    dealRoomId: newRoom.id,
    fromStatus: null,
    toStatus: "active",
    scoreSnapshot: candidate.computedScore,
    triggeredBy,
    reason: "auto-promote",
  });

  return newRoom;
}

/**
 * Promove explicitamente uma oportunidade específica (sem reposição
 * automática). Falha se já há 5 ativos ou se a oportunidade não existe
 * ou não está em `foco_imediato`.
 */
export async function promoteOpportunityToDealRoom(input: {
  tenantId: string;
  opportunityId: string;
  ownerUserId: string;
  triggeredBy: string;
}): Promise<DealRoomRow> {
  const { tenantId, opportunityId, ownerUserId, triggeredBy } = input;

  return withTenant(tenantId, async (tx, raw) => {
    await raw.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    const activeRows = await tx
      .select({ id: dealRooms.id })
      .from(dealRooms)
      .where(and(eq(dealRooms.tenantId, tenantId), eq(dealRooms.status, "active")));

    if (activeRows.length >= MAX_ACTIVE_DEAL_ROOMS) {
      throw new Error(
        `dealRoomPromoter: tenant ${tenantId} já tem ${MAX_ACTIVE_DEAL_ROOMS} deal rooms ativos`,
      );
    }

    const oppRows = await tx
      .select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.tenantId, tenantId),
          eq(opportunities.id, opportunityId),
        ),
      )
      .limit(1);

    const opp = oppRows[0];
    if (!opp) {
      throw new Error(
        `dealRoomPromoter: oportunidade ${opportunityId} não encontrada no tenant ${tenantId}`,
      );
    }
    if (opp.priorityCategory !== "foco_imediato" || opp.computedScore == null) {
      throw new Error(
        `dealRoomPromoter: oportunidade ${opportunityId} não é foco_imediato (categoria=${opp.priorityCategory})`,
      );
    }

    const [newRoom] = await tx
      .insert(dealRooms)
      .values({
        tenantId,
        opportunityId,
        ownerUserId,
        status: "active",
        scoreAtPromotion: opp.computedScore,
      })
      .returning();

    if (!newRoom) {
      throw new Error("dealRoomPromoter: insert manual não retornou row");
    }

    await tx.insert(dealRoomAudit).values({
      tenantId,
      dealRoomId: newRoom.id,
      fromStatus: null,
      toStatus: "active",
      scoreSnapshot: opp.computedScore,
      triggeredBy,
      reason: "manual",
    });

    return newRoom;
  });
}

/**
 * Lista todos os deal rooms ativos de um tenant, ordenados por score
 * desc. Conveniência para a UI e para o agente de voz.
 */
export async function listActiveDealRooms(
  tenantId: string,
): Promise<DealRoomRow[]> {
  return withTenant(tenantId, async (tx) => {
    return await tx
      .select()
      .from(dealRooms)
      .where(and(eq(dealRooms.tenantId, tenantId), eq(dealRooms.status, "active")))
      .orderBy(desc(dealRooms.scoreAtPromotion));
  });
}

// Reexporta constantes úteis para os testes.
export const _internal = {
  MAX_ACTIVE_DEAL_ROOMS,
  TERMINAL_STATUSES,
};
