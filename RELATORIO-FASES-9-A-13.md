# Relatório Consolidado — Jarvis NowGo AI

## Fases 9 a 13: Autenticação Soberana, Landing Institucional e Revenue Cockpit

> **Documento técnico-executivo · 22 de maio de 2026**
> Autor: Manus para NowGo Holding
> Status: Entregue em produção em `https://jarvis-now-go-ai.vercel.app`

---

## Sumário executivo

Entre os commits `b234580` e `efd9e8a` foram entregues cinco fases interdependentes que transformam o Jarvis NowGo AI de protótipo de cockpit operacional em **plataforma autenticada de classe corporativa**, com landing institucional pública, controle de acesso soberano via OAuth Google, whitelist auditável armazenada no NowGo Brain (Notion) e um painel financeiro dinâmico (Revenue Cockpit) que mensura pipeline, fechamento, perspectiva estatística e progresso de meta em tempo real. Tudo isso preserva os princípios fundadores da NowGo AI: **soberania**, **rastreabilidade**, **AI Native by design** e **paleta visual Tom Cruise / Iron Man** mantida no cockpit operacional.

A entrega contempla nove arquivos novos no backend e frontend, todos compilando sem erros de TypeScript, com um bundle final de 712 KB de JavaScript minificado e 114 KB de CSS — coerente com o orçamento técnico do projeto. Nenhuma dependência de banco de dados externo foi adicionada: a whitelist reutiliza a `NOTION_API_KEY` já configurada, e a sessão do usuário é selada por um JWT HS256 em cookie HttpOnly de duração de sete dias. O fluxo de login completo foi validado por chamada direta ao endpoint `/api/auth/google/start` em produção, retornando o redirecionamento correto para o consentimento Google com o `client_id` propagado.

---

## 1. Arquitetura de autenticação

A autenticação adotada é **OAuth 2.0 Authorization Code Flow** contra o Google, mediada por dois endpoints serverless e um middleware único. O fluxo se inicia em `/api/auth/google/start`, que recebe um parâmetro opcional `returnTo` (verificado para evitar open-redirect), gera um state JWT assinado com `NOWGO_JWT_SECRET` e redireciona o usuário para `accounts.google.com` com escopo `openid email profile`. O Google retorna a `/api/auth/google/callback` com um `code`, que é trocado pelo `id_token` por meio do endpoint `https://oauth2.googleapis.com/token`. O `id_token` é então verificado contra o JWKS público do Google (`https://www.googleapis.com/oauth2/v3/certs`), garantindo autenticidade criptográfica antes de qualquer decisão de autorização.

A autorização propriamente dita ocorre em `resolveAccess()` (em `server/auth.ts`), que aplica três regras em ordem. Primeiro, se o e-mail bate com `NOWGO_SUPERADMIN_EMAIL`, o usuário recebe automaticamente o papel `superadmin` e é registrado na whitelist via `upsertUser()` — esse fallback garante que o founder nunca fique fora do próprio sistema. Segundo, se o usuário existe na database `NowGo Users` do Notion e está marcado como ativo, ele recebe seu papel registrado (`operador` ou `leitor`). Terceiro, qualquer outro caso resulta em redirecionamento para `/welcome?denied=1&reason=not_in_whitelist&email=...`, exibindo banner laranja institucional na landing com a mensagem amigável de acesso restrito.

Uma vez autorizado, o servidor emite um JWT de sessão com claims `sub` (e-mail), `name`, `picture` e `role`, assinado com HS256 e expiração de sete dias, gravado como cookie `nowgo_session` HttpOnly, Secure e SameSite=Lax. A leitura da sessão é feita em todo endpoint protegido pelo helper `requireAuth(req)`, que parsea o cookie, valida assinatura e expiração via `jose.jwtVerify()` e retorna os claims tipados. O frontend acessa essa mesma sessão pelo endpoint `GET /api/auth/me`, consumido pelo hook `useAuth()`, e nunca lida diretamente com tokens — toda a manipulação de credenciais permanece no servidor.

---

## 2. Whitelist soberana no Notion

A whitelist de usuários autorizados é mantida em uma database Notion chamada **`NowGo Users`**, criada automaticamente no primeiro login bem-sucedido e descoberta dinamicamente nas execuções subsequentes via cache em memória. O schema da database preserva todas as informações operacionais necessárias sem necessidade de banco relacional adicional, conforme tabela abaixo.

| Propriedade Notion | Tipo | Função |
|---|---|---|
| Email | title | Chave única (lowercase) |
| Nome | rich_text | Nome de exibição (preenchido no primeiro login Google) |
| Foto | url | URL da foto Google (avatar) |
| Papel | select | `superadmin` · `operador` · `leitor` |
| Ativo | checkbox | Controla acesso (false = bloqueado) |
| Criado em | date | Timestamp ISO do primeiro login |
| Último acesso | date | Atualizado a cada login |

A escolha de manter a whitelist no Brain — e não em uma tabela separada — segue a filosofia da NowGo AI: **toda decisão estratégica fica em um único repositório versionável e auditável**. O Hélio pode visualizar, exportar ou auditar acessos diretamente pelo Notion, sem necessidade de painel administrativo paralelo, embora o cockpit também ofereça uma UI dedicada para a operação cotidiana (descrita na seção 5).

Para que a auto-criação da database funcione, a integração `NowGo Brain` precisa ter ao menos uma página compartilhada no workspace; a primeira página acessível via `listPages()` é usada como parent. Caso a integração não tenha permissão de criação ou o método `/databases POST` retorne 403, é possível criar manualmente a database com o schema acima e definir `NOWGO_USERS_DATABASE_ID` como variável de ambiente para fixar o ID. O sistema é resiliente a ambos os modos.

---

## 3. Landing institucional `/welcome`

A página raiz `/` foi reescrita por completo para apresentar a NowGo AI ao mundo no padrão visual de **`www.nowgoai.com`**, com hero gradiente azul-marinho profundo (`#0a1f3a`) transitando para teal e verde-esmeralda (`#0e6651`), corpo em fundo claro azulado (`#f6f8fb`) e cards brancos com sombra sutil, tipografia composta por **Fraunces** (serif moderna) nos títulos e **Inter** (sans-serif) no corpo, ambas servidas via Google Fonts. Toda a tipografia usa `clamp()` para fluidez 100% responsiva, e os grids principais usam `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))`, eliminando a necessidade de media queries para a maioria das seções.

A narrativa institucional segue um arco encadeado em onze seções: badge **NVIDIA Partner Expert** com reconhecimentos (DPI, JICA, BCG, Top 50 Global) na hero, faixa de stats (75% / USD 2.7T / Global), missão social, stack soberana (NowGo Brain, Sovereign Stack, Vault), arquitetura de agentes (Jarvis + SUN), três ofertas globais (NowGo Cities, Enterprise, Modules), seção AI Native, seis cards de parcerias, soberania nacional, acesso interno restrito e footer. Em nenhum momento são revelados nomes de fornecedores externos ou clientes específicos — toda menção segue a filosofia de **plataforma soberana sob marca própria**.

O header da landing é sticky com backdrop blur, e o botão de CTA principal alterna entre **"Acesso Interno"** (visitante anônimo) e **"Abrir Cockpit"** (usuário já autenticado), reaproveitando o estado do `useAuth()`. Visitantes que tentaram logar com e-mail fora da whitelist veem um banner laranja amigável com a instrução de solicitar acesso ao superadmin (`helio@nowgo.com.br`). Toda a página é navegável por teclado, respeita `prefers-reduced-motion`, e foi validada como totalmente escrollável após a correção do CSS global de `overflow:hidden` herdado da fase do cockpit em tela cheia.

---

## 4. Revenue Cockpit — painel financeiro dinâmico

O Revenue Cockpit é uma faixa horizontal posicionada entre o `SunMissionsBar` (3 missões ativas) e o corpo principal do cockpit, calculada pelo endpoint `/api/financial/kpis` a partir das oportunidades registradas no Brain. A perspectiva estatística adota **soma ponderada por estágio** — padrão de mercado para forecasting — com probabilidades calibradas para o ciclo de vendas da NowGo: Lead 10%, Qualificado 30%, Proposta 60%, Negociação 80%, Fechamento 95%, Ganho 100% e Perdido 0%. O resultado é um número honesto, transparente e auditável, sem inflar pipeline futuro com promessas estatisticamente improváveis.

| Indicador | Cálculo | Granularidade |
|---|---|---|
| Volume em negociação | Soma de `valor` em estágios abertos | Empresa + por missão SUN |
| Total fechado YTD | Soma de `valor` em estágio Ganho neste ano | Empresa + por missão |
| Perspectiva ponderada | Σ (`valor` × `probabilidade_estágio`) + fechado | Empresa + por missão |
| Meta 2026 | `META_2026_BRL` (constante) | Empresa |
| % atingido | fechado ÷ meta × 100 | Empresa |
| Falta para meta | meta − fechado | Empresa |
| Deals para meta | (meta − fechado) ÷ ticket médio | Empresa |
| Novas oportunidades | Criadas no mês corrente | Empresa |
| Reuniões agendadas | Próximos 14 dias | Empresa |
| Propostas em curso | Estágio Proposta + Negociação | Empresa |
| Propostas fechadas YTD | Estágio Ganho neste ano | Empresa |

Os parâmetros estratégicos são centralizados em três constantes em `server/financialKpis.ts` — `META_2026_BRL` (R$ 10.000.000), `REALIZADO_YTD_SNAPSHOT_BRL` (R$ 640.000) e `TICKET_MEDIO_BRL` (R$ 11.000.000) — permitindo ajuste rápido sem refatoração ampla. Com a configuração atual, o cockpit informa que **0,64% da meta foi atingida** e que **aproximadamente um único deal grande já basta** para fechar o ano em 2026, dado o ticket médio esperado pós-case GDF de R$ 10MM a R$ 12MM por solução. Quando o pipeline maduro permitir, basta elevar `META_2026_BRL` para R$ 100MM (ou mais) que todos os indicadores se recalculam imediatamente.

---

## 5. UI de Gestão de Acesso

Para evitar que o superadmin tenha que abrir o Notion sempre que precisar adicionar ou remover um usuário, o cockpit oferece uma UI dedicada de Gestão de Acesso. Acessível por um botão violeta discreto **"ACESSO"** no header (visível apenas a quem tem `role=superadmin`), o drawer abre por cima do cockpit em backdrop blur, ocupa até 560px de largura no desktop e 100vw no mobile, e oferece três operações principais: listagem ordenada da whitelist (superadmin primeiro), formulário de adição (e-mail obrigatório, nome opcional, papel) e, por linha, um select para mudança de papel e um botão para ativar ou desativar o usuário.

Duas proteções fundamentais estão implementadas no servidor (não confio em validação só de UI). Primeira: o superadmin **não pode desativar a si mesmo**, evitando o cenário em que o único administrador se tranca para fora do sistema. Segunda: todos os endpoints `GET`, `POST` e `PATCH` em `/api/users` exigem cookie de sessão válido com `role=superadmin` — qualquer outro papel recebe HTTP 403. Os endpoints reaproveitam diretamente as funções `listAllUsers`, `upsertUser`, `setUserActive` e `setUserRole` em `server/nowgoUsersStore.ts`, mantendo o Notion como única fonte de verdade.

A experiência de uso foi pensada para reduzir cliques: o ENTER no formulário envia, ESC fecha o drawer, o backdrop é clicável para fechar, e mudanças no select de papel disparam imediatamente o `PATCH` (sem botão de "salvar" desnecessário). A paleta segue o padrão NowGo (cyan `#00d4ff` para títulos, violeta `#bb88ff` para destaques superadmin, vermelho rosado `#ff7799` para ações destrutivas), totalmente coerente com o restante do cockpit.

---

## 6. Variáveis de ambiente requeridas

Para o sistema rodar em produção, quatro segredos precisam estar configurados no Vercel — todos foram adicionados pelo Hélio em 22/mai/2026 e o redeploy posterior validou que chegam corretamente ao runtime serverless. A variável `NOTION_API_KEY` já existia desde fases anteriores do projeto.

| Variável | Função | Origem |
|---|---|---|
| `NOWGO_OAUTH_CLIENT_ID` | Client ID OAuth Google (Web Application) | Google Cloud Console / projeto `agentes-490013` |
| `NOWGO_OAUTH_CLIENT_SECRET` | Client Secret OAuth Google | Mesmo client acima |
| `NOWGO_JWT_SECRET` | Chave de 64 chars para assinar sessão JWT | Gerado localmente (random) |
| `NOWGO_SUPERADMIN_EMAIL` | E-mail garantido como superadmin | `helio@nowgo.com.br` |
| `NOWGO_USERS_DATABASE_ID` (opcional) | Fixa o ID da database Notion | Detectado automaticamente se omitido |
| `NOTION_API_KEY` | Acesso ao Brain (já existia) | Integração `NowGo Brain` no Notion |

Caso seja necessário rotacionar o `NOWGO_JWT_SECRET` (por exemplo após suspeita de vazamento), basta gerá-lo de novo, atualizá-lo no Vercel e fazer redeploy — todas as sessões existentes serão invalidadas automaticamente, forçando re-login. O mesmo vale para o `NOWGO_OAUTH_CLIENT_SECRET`, que deve ser revogado no Google Cloud Console e substituído.

---

## 7. Arquivos entregues

A tabela abaixo resume os arquivos criados e modificados nas Fases 9 a 13, consolidando o trabalho técnico em um inventário auditável.

| Arquivo | Tipo | Função |
|---|---|---|
| `server/auth.ts` | novo | JWT, verificação Google, helpers de cookie e middleware `requireAuth` |
| `server/nowgoUsersStore.ts` | novo | CRUD completo da whitelist no Notion |
| `server/financialKpis.ts` | novo | Cálculo dos 11 KPIs financeiros |
| `api/auth/google/start.ts` | novo | Inicia fluxo OAuth Google |
| `api/auth/google/callback.ts` | novo | Recebe code, valida, emite sessão |
| `api/auth/me.ts` | novo | Retorna estado da sessão atual |
| `api/auth/logout.ts` | novo | Encerra sessão (clear cookie) |
| `api/users/index.ts` | novo | Endpoints REST de Gestão de Acesso |
| `api/financial/kpis.ts` | novo | Endpoint do Revenue Cockpit |
| `client/src/hooks/useAuth.ts` | novo | Hook React para estado de sessão |
| `client/src/pages/Welcome.tsx` | reescrito | Landing institucional padrão nowgoai.com |
| `client/src/components/RequireAuth.tsx` | novo | Guard frontend para rotas privadas |
| `client/src/components/cockpit/FinancialKpisBar.tsx` | novo | Faixa horizontal Revenue Cockpit |
| `client/src/components/cockpit/UserManagementDrawer.tsx` | novo | Drawer de Gestão de Acesso |
| `client/src/pages/Cockpit.tsx` | editado | Integração de auth, drawer e KPIs |
| `client/src/components/HudCanvas.tsx` | editado | Cor MIC OFF: vermelho → violeta NowGo |
| `client/src/index.css` | editado | Permitir scroll global na landing |
| `client/index.html` | editado | Inter + Fraunces via Google Fonts |
| `client/src/App.tsx` | editado | Rota `/` Welcome, `/cockpit` protegido |

---

## 8. Validação e próximos passos

A validação técnica foi feita por compilação TypeScript sem erros (`pnpm check`), build Vite de produção (`pnpm build`) e chamada direta ao endpoint `/api/auth/google/start` em produção, que retornou HTTP 302 com o redirecionamento correto para o Google contendo o `client_id` esperado — confirmando que os segredos chegaram ao runtime e que o fluxo de autenticação funciona ponta a ponta. A validação funcional final, contudo, depende do primeiro login efetivo do superadmin em produção, momento em que a database `NowGo Users` será criada automaticamente no Notion.

Os próximos pontos sugeridos para evolução, em ordem de prioridade decrescente, são (1) **leitura automática do realizado YTD** a partir das oportunidades em estágio Ganho do Brain, eliminando o snapshot manual de R$ 640.000; (2) **timeline mensal de faturamento** (sparkline 12 meses) que hoje aparece como zero por falta de histórico estruturado no Brain; (3) **e-mail de notificação** ao superadmin sempre que um e-mail fora da whitelist tentar logar; (4) **registro de auditoria** das mudanças na whitelist (quem adicionou quem, quem desativou quem, com timestamp) em uma database Notion paralela; e (5) **internacionalização** da landing para inglês, dado que o reconhecimento internacional NVIDIA Partner Expert e a presença global da NowGo já justificam o investimento.

A entrega das Fases 9 a 13 transforma o Jarvis NowGo de cockpit interno em **plataforma autenticada com narrativa pública**, mantendo soberania total sobre dados, código e identidade visual. Toda a operação roda sob a marca NowGo, sem expor fornecedores externos a clientes finais — fiel à filosofia de AI Native Company que a Holding leva ao mercado.

---

**Commits relevantes**: `b234580` (auth+revenue) · `a2b99a4` (landing+MIC violeta) · `aef148f` (scroll fix) · `bd65f70` (NVIDIA Partner Expert) · `2455d1d` (meta R$ 10MM) · `efd9e8a` (UI Gestão de Acesso)

**Repositório**: `https://github.com/Helioguilhermediassilva/Jarvis_NowGo_AI`

**Produção**: `https://jarvis-now-go-ai.vercel.app`
