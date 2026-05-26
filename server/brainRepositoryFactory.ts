/**
 * server/brainRepositoryFactory.ts
 *
 * Devolve a implementação ativa do NowGoBrainRepository baseada na variável
 * de ambiente `NOWGO_BRAIN_REPO`:
 *
 *   notion   (default) → NotionBrainRepository
 *   postgres           → PostgresBrainRepository
 *   shadow             → leituras pelo Notion, escritas espelhadas no Postgres
 *                         (a ser implementado em fase 1.2 — por enquanto cai
 *                         no Notion)
 *
 * Esta camada é o ÚNICO lugar do código que conhece os fornecedores concretos.
 * Tudo a montante depende apenas da interface NowGoBrainRepository.
 */
import type { NowGoBrainRepository } from "./nowgoBrainRepository.js";
import { NotionBrainRepository } from "./notionBrainRepository.js";
import { PostgresBrainRepository } from "./postgresBrainRepository.js";

export type BrainRepoMode = "notion" | "postgres" | "shadow";

let _instance: NowGoBrainRepository | null = null;
let _mode: BrainRepoMode | null = null;

export function getBrainRepository(): NowGoBrainRepository {
  const mode = ((process.env.NOWGO_BRAIN_REPO || "notion") as string).toLowerCase() as BrainRepoMode;
  if (_instance && mode === _mode) return _instance;

  switch (mode) {
    case "postgres":
      _instance = new PostgresBrainRepository();
      break;
    case "shadow":
      // Fase 1.1: shadow ainda usa Notion como leitura. Quando o sync
      // bidirecional estiver pronto, esta implementação muda.
      _instance = new NotionBrainRepository();
      break;
    case "notion":
    default:
      _instance = new NotionBrainRepository();
      break;
  }
  _mode = mode;
  return _instance;
}

/** Útil em testes ou hot-swap em runtime. */
export function resetBrainRepository(): void {
  _instance = null;
  _mode = null;
}
