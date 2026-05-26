# NowGo Brain — Camada de persistência multi-tenant

Esta pasta documenta a camada de banco de dados do **Cockpit_NowGo**
(Supabase PostgreSQL `jfeqkgdimjhbwaqmzxpu`, região us-west-1) e o
contrato agnóstico que isola o restante da aplicação dos detalhes de
fornecedor.

## Visão de 30 segundos

```
┌────────────────────────────────────┐
│  Resto da aplicação (financialKpis,│
│  jarvisBrainTools, /cockpit, ...)  │
└─────────────┬──────────────────────┘
              │ depende apenas da interface
              ▼
┌────────────────────────────────────┐
│  NowGoBrainRepository (interface)  │
│  server/nowgoBrainRepository.ts    │
└──┬───────────────────┬─────────────┘
   │                   │
   ▼                   ▼
NotionBrainRepository  PostgresBrainRepository
(source-of-truth      (shadow mirror, futuro
 atual, fase 1)        primário on-prem)
```

A escolha da implementação ativa acontece em
`server/brainRepositoryFactory.ts`, controlada pela env
`NOWGO_BRAIN_REPO`:

| Valor      | Implementação                | Quando usar                   |
|------------|------------------------------|-------------------------------|
| `notion`   | `NotionBrainRepository`       | **Default** (fase 1)          |
| `postgres` | `PostgresBrainRepository`     | Após validar shadow mirror    |
| `shadow`   | leituras Notion, writes ambos | Migração gradual (fase 1.2)   |

## Schema

Source-of-truth do schema é o SQL em `db/migrations/000{1..4}_*.sql`.
O Drizzle TS em `server/db/schema.ts` apenas espelha o SQL para tipagem.

Tabelas no schema `nowgo_brain`:

| Tabela              | Função                                                   | RLS |
|---------------------|----------------------------------------------------------|-----|
| `tenants`           | Espaço de trabalho de um cliente (1 cockpit)             | deny-all anon |
| `users`             | Pessoas que fazem login                                  | deny-all anon |
| `tenant_members`    | Relação user ↔ tenant com role contextual                | deny-all anon |
| `audit_log`         | Registro imutável de ações                               | por `tenant_id` |
| `opportunities`     | Pipeline (espelha base Notion "pipeline")                | por `tenant_id` |
| `crm_assets`        | CRM IA (espelha base Notion "ativosCrmIa")               | por `tenant_id` |
| `projects`          | Projetos                                                 | por `tenant_id` |
| `companies`         | Empresas                                                 | por `tenant_id` |
| `tasks`             | Tarefas                                                  | por `tenant_id` |
| `documents`         | Documentos                                               | por `tenant_id` |
| `risks`             | Riscos                                                   | por `tenant_id` |
| `financial_entries` | Lançamentos financeiros                                  | por `tenant_id` |

## Isolamento entre tenants (RLS)

As 8 tabelas de domínio + `audit_log` têm uma policy chamada
`tenant_isolation` que filtra `tenant_id` baseado em
`current_setting('app.current_tenant_id')`. O backend define esse
setting **a cada transação** via:

```ts
import { withTenant } from "./db/client.js";

await withTenant(tenantId, async (tx) => {
  // Toda query aqui só vê linhas do tenant ativo.
  const opps = await tx.select().from(opportunities);
});
```

Sem `withTenant()`, qualquer SELECT em tabelas RLS retorna `[]`. Isso é
o cinturão de segurança principal contra vazamento entre cockpits.

As 3 tabelas administrativas (`tenants`, `users`, `tenant_members`) têm
RLS deny-all para roles `anon` e `authenticated`. O backend acessa-as
com a service role, que bypassa RLS por design.

## Variáveis de ambiente

| Variável                       | Origem                            | Onde usar                |
|--------------------------------|-----------------------------------|--------------------------|
| `NOWGO_BRAIN_DB_URL`           | Supabase project URL              | (futuro) clientes JS     |
| `NOWGO_BRAIN_DB_PUBLIC_KEY`    | Supabase publishable key          | (futuro) clientes JS     |
| `NOWGO_BRAIN_DB_SECRET_KEY`    | Supabase service role key         | (futuro) admin tasks     |
| `NOWGO_BRAIN_PG_URL`           | Connection string PG (pooler 6543)| **server/db/client.ts**  |
| `NOWGO_BRAIN_REPO`             | `notion` (default) / `postgres` / `shadow` | factory   |

Todas estão configuradas no Vercel do projeto `jarvis-now-go-ai`. Para
rodar testes localmente contra o Postgres real, exporte
`NOWGO_BRAIN_PG_URL` no shell antes de `npx vitest run`.

## Como aplicar uma nova migração

1. Crie o arquivo `db/migrations/000N_descricao.sql` com SQL idempotente.
2. Aplique via MCP Supabase:
   ```bash
   manus-mcp-cli tool call apply_migration --server supabase \\
     --input '{"project_id":"jfeqkgdimjhbwaqmzxpu","name":"000N_descricao","query":"..."}'
   ```
3. Sincronize o `server/db/schema.ts` se a estrutura mudar.
4. Rode `npx tsc --noEmit && npx vitest run` para validar.

## Portabilidade futura

A interface `NowGoBrainRepository` é deliberadamente agnóstica de
fornecedor. Para migrar para NVIDIA + Nomad on-prem, basta:

1. Implementar `OnPremBrainRepository` que satisfaça o contrato.
2. Adicionar `onprem` ao switch de `brainRepositoryFactory.ts`.
3. Trocar a env `NOWGO_BRAIN_REPO=onprem` no Vercel.

Nenhum chamador no resto do código precisa mudar.
