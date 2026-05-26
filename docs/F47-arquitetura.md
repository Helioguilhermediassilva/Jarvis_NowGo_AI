# F47 — Onboarding de Clientes Externos com Cockpit Próprio

**Autor:** Manus AI, em colaboração com Hélio Guilherme Dias Silva
**Última revisão:** 26 de maio de 2026
**Status:** Fase 2 — Desenho de arquitetura aprovado (com MFA TOTP intermediário e Resend para e-mail transacional), pronto para implementação
**Antecedentes:** F46 Fase 1.1 entregue ([commit `a9a5a24`](https://github.com/Helioguilhermediassilva/Jarvis_NowGo_AI/commit/a9a5a24)) — schema multi-tenant em `nowgo_brain` no Supabase Cockpit_NowGo, interface `NowGoBrainRepository`, fábrica com switch por env, dois endpoints validados em produção em `cockpitcrmnowgoai.com`.

## 1. Visão geral

A F47 abre o NowGo AI para **clientes externos** mediante convite formal, entregando a cada cliente um **cockpit isolado** com CRUD próprio do portfólio de oportunidades e dos cinco *deal rooms* prioritários, persistido integralmente no Postgres multi-tenant. O cockpit interno do Hélio, que hoje lê do Notion via `NotionBrainRepository`, permanece intocado — clientes externos não compartilham dados nem visões com o tenant interno `nowgo-ai`.

A fundação para esta entrega já está pronta: as doze tabelas em `nowgo_brain` carregam RLS por `tenant_id`, a interface `NowGoBrainRepository` permite alternar entre Notion e Postgres por simples mudança de variável de ambiente, e a função `withTenant()` em `server/db/client.ts` aplica `SET LOCAL app.current_tenant_id` por transação, garantindo que cada cliente só enxerga o que é seu.

## 2. Decisões de produto

| Eixo | Decisão | Implicação |
|---|---|---|
| Acesso inicial | Convite-only emitido pelo Hélio | Zero auto-cadastro público; reduz superfície de ataque e impede enumeração de e-mails |
| Métodos de login | Google OAuth e e-mail/senha (ambos no mesmo usuário, à escolha) | Cliente sem Google corporativo continua atendido; senha local exige Argon2id, rate limit e verificação de e-mail |
| Segundo fator | TOTP obrigatório para `superadmin`, `owner` e `admin`; opcional para `member` | Mitiga conta comprometida em roles que decidem ou destroem dados; reduz fricção no role mais comum (`member`) |
| Provedor de e-mail | Resend (free tier 3k/mês) para convites, verificação, recuperação de senha e reset MFA | API moderna, integração simples, auditável; secret `RESEND_API_KEY` solicitado via `webdev_request_secrets` no momento certo |
| Isolamento | Cada cliente externo é um tenant Postgres isolado | RLS força filtro por `tenant_id`; tenants não se enxergam mesmo em caso de bug de aplicação |
| Persistência | Cockpit do cliente externo escreve apenas no Postgres | Notion permanece exclusivo do tenant interno `nowgo-ai`; sem sincronia bidirecional para clientes |
| Top 5 Deal Rooms | Sempre cinco slots ativos por tenant | Quando um é resolvido, o sistema promove automaticamente o próximo candidato com maior score, conforme o blueprint |
| Algoritmo de score | Fórmula oficial: Score = U·0,20 + IF·0,25 + IE·0,25 + R·0,10 + D·0,10 + P·0,10 | Implementação determinística em TypeScript no server-side, espelhando a lógica do Notion |
| Categorias | `> 85` Foco Imediato, `60-85` Radar Estratégico, `< 60` Backlog | Apenas oportunidades com Score > 85 são elegíveis a Deal Room ativo |

## 3. Modelo de dados — seis tabelas novas

A F47 acrescenta **seis tabelas** ao schema `nowgo_brain`. As tabelas `deal_rooms` e `deal_room_audit` carregam RLS por `tenant_id`. As tabelas `invitations`, `sessions`, `password_credentials` e `mfa_credentials` são operadas apenas pelo backend usando a `service_role` key, com RLS deny-all como defesa em profundidade.

> **Nota:** a tabela `opportunities` já existe na F46 e ganha agora seis colunas para suportar o vetor de scoring oficial. Não é uma tabela nova, é uma extensão.

### 3.1 invitations

Armazena convites emitidos pelo Hélio para clientes externos. O token é gerado com 256 bits de entropia (`crypto.randomBytes(32).toString('base64url')`) e nunca persistido em texto claro — guardamos apenas o hash SHA-256.

```
invitations
├── id                uuid PK
├── token_hash        text NOT NULL UNIQUE   -- SHA-256 do token bruto
├── email             text NOT NULL          -- destinatário
├── tenant_id         uuid NOT NULL FK → tenants(id)
├── role              text NOT NULL          -- 'owner' | 'admin' | 'member'
├── invited_by        uuid NOT NULL FK → users(id)
├── expires_at        timestamptz NOT NULL
├── used_at           timestamptz NULL
├── used_by           uuid NULL FK → users(id)
├── created_at        timestamptz NOT NULL DEFAULT now()
└── revoked_at        timestamptz NULL
```

A política de RLS em `invitations` é restritiva: apenas o `service_role` (backend) lê e escreve. O frontend nunca toca diretamente nesta tabela; a página `/convite/<token>` chama um endpoint server-side que valida o token contra o hash.

### 3.2 sessions

Sessões de usuário com cookie httpOnly. Cada login bem-sucedido produz uma linha; logout invalida.

```
sessions
├── id                  uuid PK
├── user_id             uuid NOT NULL FK → users(id)
├── tenant_id           uuid NOT NULL FK → tenants(id)
├── session_token_hash  text NOT NULL UNIQUE   -- SHA-256 do cookie
├── ip                  inet NULL
├── user_agent          text NULL
├── created_at          timestamptz NOT NULL DEFAULT now()
├── expires_at          timestamptz NOT NULL    -- TTL 7 dias renováveis
├── last_seen_at        timestamptz NOT NULL
└── revoked_at          timestamptz NULL
```

### 3.3 password_credentials

Credenciais de senha local. Existe apenas para usuários que optaram pelo método e-mail/senha; usuários só-Google não têm linha aqui.

```
password_credentials
├── user_id            uuid PK FK → users(id)
├── argon2_hash        text NOT NULL          -- argon2id, m=64MB t=3 p=4
├── verified_at        timestamptz NULL       -- e-mail confirmado
├── verification_token_hash text NULL
├── verification_sent_at    timestamptz NULL
├── password_changed_at     timestamptz NOT NULL
├── failed_attempts    int NOT NULL DEFAULT 0
└── locked_until       timestamptz NULL
```

A flag `locked_until` é atualizada por um rate limiter server-side: após cinco tentativas de senha incorreta em janela de quinze minutos, a conta entra em cooldown de uma hora.

### 3.4 deal_rooms

Os cinco Deal Rooms ativos por tenant, mais o histórico de resolvidos/fechados/perdidos.

```
deal_rooms
├── id                 uuid PK
├── tenant_id          uuid NOT NULL FK → tenants(id)
├── opportunity_id     uuid NOT NULL FK → opportunities(id)
├── owner_user_id      uuid NOT NULL FK → users(id)        -- decisor
├── status             text NOT NULL                       -- 'active' | 'resolved' | 'lost' | 'paused'
├── promoted_at        timestamptz NOT NULL                -- entrada no top 5
├── score_at_promotion numeric(5,2) NOT NULL
├── resolved_at        timestamptz NULL
├── resolution_notes   text NULL
├── created_at         timestamptz NOT NULL DEFAULT now()
└── updated_at         timestamptz NOT NULL DEFAULT now()
```

Constraint composta: `(tenant_id, status) WHERE status = 'active'` limitada a cinco linhas, garantida em nível de aplicação por uma função `withTenant()` que abre transação serializável, conta os ativos atuais e só permite inserir/promover se há slot.

### 3.5 mfa_credentials

Segundo fator TOTP por usuário. Existe apenas para usuários que ativaram MFA — obrigatório para roles `superadmin`/`owner`/`admin`, opcional para `member`. O segredo TOTP é criptografado em rest com AES-256-GCM antes de persistir; a chave de criptografia vive em variável de ambiente do servidor e nunca toca o banco.

```
mfa_credentials
├── user_id                 uuid PK FK → users(id)
├── totp_secret_encrypted   bytea NOT NULL          -- AES-256-GCM
├── backup_codes_hashed     text[] NOT NULL         -- 8 códigos SHA-256 uso único
├── enabled_at              timestamptz NOT NULL
├── last_used_at            timestamptz NULL
└── reset_count             int NOT NULL DEFAULT 0  -- quantas vezes superadmin resetou
```

A política RLS é deny-all: apenas o backend lê/escreve. O endpoint `/admin/mfa/reset/<userId>` (gated por `superadmin`) permite resetar quando o cliente perde o celular e os backup codes simultaneamente, após verificação fora-de-banda da identidade.

### 3.6 deal_room_audit

Snapshots históricos de cada transição de estado de deal room. Imutável; jamais é editada.

```
deal_room_audit
├── id              uuid PK
├── tenant_id       uuid NOT NULL FK → tenants(id)
├── deal_room_id    uuid NOT NULL FK → deal_rooms(id)
├── from_status     text NULL
├── to_status       text NOT NULL
├── score_snapshot  numeric(5,2) NOT NULL
├── triggered_by    uuid NOT NULL FK → users(id)
├── reason          text NULL                     -- 'manual' | 'auto-promote' | 'auto-demote'
└── created_at      timestamptz NOT NULL DEFAULT now()
```

### 3.7 Extensão de `opportunities`

A tabela existente ganha seis colunas para suportar a fórmula oficial de scoring, mais o score computado.

```
ALTER TABLE nowgo_brain.opportunities
  ADD COLUMN urgency_score          smallint NULL CHECK (urgency_score          BETWEEN 0 AND 100),
  ADD COLUMN financial_impact_score smallint NULL CHECK (financial_impact_score BETWEEN 0 AND 100),
  ADD COLUMN strategic_impact_score smallint NULL CHECK (strategic_impact_score BETWEEN 0 AND 100),
  ADD COLUMN risk_score             smallint NULL CHECK (risk_score             BETWEEN 0 AND 100),
  ADD COLUMN dependency_score       smallint NULL CHECK (dependency_score       BETWEEN 0 AND 100),
  ADD COLUMN probability_score      smallint NULL CHECK (probability_score      BETWEEN 0 AND 100),
  ADD COLUMN computed_score         numeric(5,2) NULL,
  ADD COLUMN priority_category      text NULL CHECK (priority_category IN ('foco_imediato','radar_estrategico','backlog'));
```

O `computed_score` e o `priority_category` são preenchidos por trigger ou pela camada de aplicação a cada `INSERT/UPDATE` que toque um dos seis vetores.

## 4. Engine de classificação inteligente

A classificação é um módulo TypeScript puro, sem dependência de banco, exportado de `server/brain/scoringEngine.ts`. Recebe seis números e devolve `{ score, category }`. Sua única responsabilidade é aplicar a fórmula oficial, e isso o torna fácil de testar e de versionar.

```ts
export function computeOpportunityScore(input: ScoringVector): ScoringResult {
  const { urgency, financialImpact, strategicImpact, risk, dependency, probability } = input;
  const score =
    urgency * 0.20 +
    financialImpact * 0.25 +
    strategicImpact * 0.25 +
    risk * 0.10 +
    dependency * 0.10 +
    probability * 0.10;
  const category = score > 85 ? "foco_imediato" : score >= 60 ? "radar_estrategico" : "backlog";
  return { score: Math.round(score * 100) / 100, category };
}
```

Um segundo módulo, `server/brain/dealRoomPromoter.ts`, orquestra a promoção automática:

> Sempre que um deal room muda para status `resolved`, `lost` ou `paused`, o promoter consulta as oportunidades do tenant com `priority_category = 'foco_imediato'` que ainda não estão em deal rooms ativos, ordena por `computed_score DESC` e promove a de maior score. A operação é envelopada em transação serializável que checa o slot disponível e grava `deal_room_audit` no mesmo escopo, evitando race conditions.

## 5. Fluxo de autenticação e segundo fator

O Hélio (com role `superadmin`) acessa o painel administrativo em `/admin/convites`, preenche destinatário, tenant alvo e role, e o backend gera um token bruto, calcula o hash SHA-256, persiste a linha em `invitations` e retorna a URL única `https://cockpitcrmnowgoai.com/convite/<token>` exatamente uma vez. O token bruto nunca é armazenado.

O destinatário recebe o link pelo canal escolhido (e-mail, WhatsApp, Telegram). Ao acessar, a página `/convite/<token>` recalcula o hash, compara com a base, e, se válido e não expirado, oferece dois caminhos de login:

1. **Google OAuth.** Redireciona ao OAuth Server da NowGo; ao voltar, o callback verifica que o e-mail do Google bate com o destinatário do convite, cria a linha em `users` (se ainda não existe), insere a membership em `tenant_members`, marca o convite como usado e abre sessão.
2. **E-mail e senha.** Oferece formulário para definir senha local. A senha é validada contra política mínima (doze caracteres, ao menos uma letra maiúscula, um número e um símbolo), hashada com Argon2id (m=64MB, t=3, p=4), e gravada em `password_credentials`. Um e-mail de confirmação é enviado contendo um token de verificação distinto do convite original. O primeiro login só completa após o usuário clicar em "Confirmar e-mail".

Em ambos os caminhos, o cookie de sessão é httpOnly, Secure, SameSite=Lax, com TTL de sete dias renovável a cada requisição autenticada. A sessão é vinculada ao `tenant_id` original do convite — o usuário não pode pular para outro tenant sem novo convite.

### 5.1 Segundo fator (TOTP)

Se a role do usuário exige MFA (`superadmin`, `owner` ou `admin`) e ele ainda não configurou, o login fica em estado *pending* e o usuário é redirecionado para `/mfa/setup`. Nesta página, o servidor gera um segredo TOTP de 160 bits, o exibe como QR code (Base32) compatível com Google Authenticator, Authy, 1Password e similares, e pede ao usuário que digite o código de seis dígitos atual. Ao validar, o backend persiste `mfa_credentials` com o segredo criptografado e oito backup codes hashados em SHA-256. Os backup codes são exibidos uma única vez para download/impressão; depois disso somente seus hashes ficam no banco.

Nos logins subsequentes, após validar senha ou Google OAuth, o servidor checa se há linha em `mfa_credentials` para o usuário. Se sim, redireciona para `/mfa/challenge` e cria sessão apenas se o código de seis dígitos for válido (janela de tolerância de ±1 step de 30 segundos para acomodar relógios dessincronizados). Backup codes podem substituir o código TOTP em qualquer challenge; cada backup code é marcado como usado e não pode ser reaproveitado.

Se o usuário perde celular e backup codes simultaneamente, o procedimento de recuperação exige que ele contate o Hélio fora-de-banda (e-mail corporativo, telefone, vídeo) para verificação de identidade. Confirmada a identidade, o Hélio acessa `/admin/mfa/reset/<userId>` que zera a linha em `mfa_credentials` e incrementa `reset_count`. O usuário é obrigado a refazer `/mfa/setup` no próximo login. O evento de reset é registrado em `audit_log` com `triggered_by = helio`.

### 5.2 E-mail transacional (Resend)

Quatro tipos de e-mail são enviados via Resend ([resend.com](https://resend.com)): convite com link único, verificação de e-mail após definir senha local, recuperação de senha com token expirável em uma hora, e notificação de reset MFA executado pelo `superadmin`. Templates são estaticamente renderizados em TypeScript, sem injeção de HTML do usuário. O secret `RESEND_API_KEY` será solicitado via `webdev_request_secrets` quando a fase de envio real for atingida (Fase 4), permitindo que o ambiente local rode em modo *log-only* (escreve o conteúdo no console) até lá.

## 6. Interface multi-modal

Pelas memórias de conversas anteriores, o Hélio espera editar portfólio e deal rooms **na tela, no Notion e por voz**. A F47 entrega a camada de tela; o canal de voz já existe via Jarvis e ganhará uma extensão para escrever no Postgres assim que o backend tRPC estiver pronto. A integração com Notion permanece apenas para o tenant interno `nowgo-ai`, conforme decidido na seção 2.

A interface tem três páginas:

- `/cockpit/portfolio` — lista paginada das oportunidades do tenant, com sliders para os seis vetores, score computado em tempo real e botão de promoção a deal room (habilitado apenas quando `priority_category = 'foco_imediato'` e há slot disponível).
- `/cockpit/deal-rooms` — visão dedicada dos cinco ativos, com card por deal room, owner, notas de resolução e botão de marcar como `resolved`/`lost`. A promoção do próximo candidato acontece sem refresh, via mutação tRPC com invalidação otimista.
- `/admin/convites` — disponível apenas para `role = superadmin` ou `tenant_members.role = owner`. Lista convites pendentes, usados e revogados, com botão de revogação imediata e geração de novo convite.

## 7. Auditoria e observabilidade

Toda ação sensível grava em `audit_log` (tabela já existente) com `actor_user_id`, `tenant_id`, `action`, `target`, `before`, `after`. Adicionalmente, `deal_room_audit` mantém o histórico de promoções e demoções automáticas com `score_snapshot` no momento exato, permitindo reconstrução temporal precisa de qualquer decisão do promoter.

Em produção, `/api/brain/repo-info` continua sendo o endpoint de health check operacional, ganhando agora um campo `dealRoomsActiveCount` quando o modo for `postgres` ou `shadow`.

## 8. Critérios de aceitação

A F47 é considerada entregue quando todos os critérios abaixo estiverem verdadeiros simultaneamente:

A primeira pessoa convidada pelo Hélio (um sócio real ou um cliente real) consegue clicar no link, autenticar-se com Google ou senha, aterrissar no `/cockpit/portfolio` do tenant dela, criar uma oportunidade preenchendo os seis vetores, ver o score e a categoria calculados em tempo real, promover essa oportunidade a deal room quando a categoria for `foco_imediato`, marcar o deal room como resolvido e observar o próximo candidato sendo promovido automaticamente sem refresh manual. Nesse mesmo fluxo, o cockpit interno do Hélio (Notion) permanece inalterado, e os endpoints legados em `/api/brain/*` continuam respondendo com os dados do Notion conforme antes. A suíte vitest cobre cada um desses passos com pelo menos um teste, e o tsc passa sem erros.

## 9. Fora de escopo (futuras fases)

Os itens abaixo são desejáveis e foram considerados durante o desenho, mas ficam para iterações posteriores:

- **MFA WebAuthn / Passkey** como opção adicional ao TOTP, principalmente para clientes com YubiKey ou Touch ID (F48)
- **Sincronia bidirecional Notion ↔ Postgres** para o tenant `nowgo-ai` (F46 Fase 1.2)
- **Self-service signup** com aprovação manual no painel admin (F48)
- **Suporte a SSO corporativo (SAML/OIDC)** para clientes enterprise (F49)
- **Painel de impersonate** que permita ao Hélio entrar como qualquer tenant em modo somente-leitura (Fase 2.1)
- **Cobrança e gestão de plano por tenant** (F50)

## 10. Próximos passos imediatos

A Fase 3 começa pela aplicação da migração `0005_f47_invitations_sessions_deal_rooms.sql`, que cria as cinco tabelas novas e estende `opportunities` com os seis vetores. Em seguida, a Fase 4 implementa o backend de auth, e a Fase 5 entrega os routers tRPC de CRUD multi-tenant. A entrega final passa pelo critério de aceitação descrito na seção 8, e o deploy em produção fecha o épico.

---

*Documento mantido em `docs/F47-arquitetura.md` no repositório `Helioguilhermediassilva/Jarvis_NowGo_AI`. Última revisão por Manus AI em 26 de maio de 2026.*
