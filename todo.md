
## F3 — Cockpit cinematográfico com Jarvis conversacional

- [ ] Criar `server/sunPlan.ts` com dados estruturados do Plano Operacional SUN (3 Missões Ativas + Radar + Pausadas + Descartadas) e regras 3+1
- [ ] Adicionar handler `/api/sun/plan` que devolve o plano SUN
- [ ] Atualizar `/api/brain/status` para opcionalmente incluir o plano SUN
- [ ] Gerar imagem futurística: nebulosa cosmic-blue como background HUD principal
- [ ] Gerar imagem futurística: anel orbital holográfico para envolver o HUD
- [ ] Gerar avatar holograma estilizado (silhueta abstrata do Jarvis)
- [ ] Reconstruir Cockpit.tsx fundindo HUD pulsante + chat de voz + cards SUN/Brain
- [ ] Implementar drop multimodal de PDF/DOCX/JPG/PNG/MP3 no centro do HUD
- [ ] Adaptar persona do Jarvis (system prompt) para copiloto de gestão NowGo Holding
- [ ] Conectar tools de leitura do Brain (oportunidades quentes, top score, follow-ups, bloqueios) ao chat
- [ ] Conectar tools de escrita com protocolo preview→confirma (atualizar oportunidade, criar tarefa, registrar ata)
- [ ] Adicionar tool `sun_consultar_plano` que devolve a classificação de uma oportunidade segundo o SUN
- [ ] Animar entrada cascade dos cards (stagger 80ms)
- [ ] Implementar waveform de voz quando Jarvis fala
- [ ] Remover `/api/brain/diag` (foi só para debug)
- [ ] Atualizar README com identidade NowGo Sovereign Stack (sem expor fornecedores externos)
- [ ] Renomear `package.json` para `jarvis-nowgo-ai`
- [ ] Vitest para `/api/sun/plan`
- [ ] Vitest para tools de Brain integradas ao chat
- [ ] Deploy + smoke test produção

## F4 — Pesquisas + tools de Brain + acionamento do SUN

- [ ] Habilitar Grok Live Search no proxy server quando o usuário pedir fato externo/cotação/notícia
- [ ] Tool `pesquisa_externa` que aciona Live Search do Grok com query refinada
- [ ] Tools de leitura Brain: brain_oportunidades_quentes, brain_top_score, brain_bloqueios_criticos
- [ ] Tools de escrita preview→confirma: brain_atualizar_oportunidade, brain_registrar_ata, brain_criar_tarefa
- [ ] Tool `sun_executar_missao` (dispara SUN/Manus para tarefas longas em background)
- [ ] Tool `sun_regenerar_relatorio` (regenera Plano SUN)
- [ ] Tool `sun_status_missao`
- [ ] Persona do Jarvis: copiloto de gestão NowGo Holding (sistema prompt blindado)

## F5 — Integração Google Drive (NowGo Sovereign Stack)
- [ ] Criar Service Account no Google Cloud com escopo Drive (Domain-wide Delegation se aplicável)
- [ ] Compartilhar pasta raiz "Arquivos_NowGo_AI/" do Drive da NowGo com a Service Account
- [ ] Subpastas: Apresentacoes/, Propostas/, Contratos/, OnePages/, PitchDecks/
- [ ] Adicionar segredo GOOGLE_DRIVE_SA_KEY no Vercel (JSON da service account)
- [ ] Criar server/googleDrive.ts: helpers ensureFolder, uploadFile, listFiles, getShareLink
- [ ] Endpoint /api/drive/test que valida credenciais e lista a pasta raiz
- [ ] Indexar todo arquivo gerado como Documento no Brain (com link Drive + pageId)

## F6 — Geração de documentos por voz (Apresentações, Propostas, Contratos, One-Pages, Pitch Decks)
- [ ] Tool jarvis.criar_apresentacao (PPTX, 10-25 slides com identidade NowGo, executada via SUN)
- [ ] Tool jarvis.criar_proposta_comercial (DOCX, capa+sumário+escopo+entregáveis+cronograma+investimento+CTA)
- [ ] Tool jarvis.criar_contrato (DOCX, MSA/SOW/NDA com cláusulas-padrão NowGo + variáveis)
- [ ] Tool jarvis.criar_one_page (PDF/PNG executive summary 1 página com identidade NowGo)
- [ ] Tool jarvis.criar_pitch_deck (PPTX, problem/solution/market/traction/team/ask)
- [ ] Cada tool segue protocolo preview→confirma→executa
- [ ] Templates Master NowGo (capa, paleta, logo, fontes) — definir junto com o Hélio
- [ ] Resultado: arquivo no Drive + link compartilhado + indexação no Brain + frase falada de confirmação
- [ ] Painel "Arquivos NowGo" no Cockpit (lista os últimos 10 documentos gerados, abre por clique/voz)

## F9 — OAuth Google + autenticação NowGo Holding (whitelist por e-mail)

- [ ] Criar OAuth Client Web no Google Cloud (mesmo projeto agentes-490013)
- [ ] Adicionar `NOWGO_OAUTH_CLIENT_ID` e `NOWGO_OAUTH_CLIENT_SECRET` no Vercel (production + preview)
- [ ] Adicionar `NOWGO_JWT_SECRET` (64 chars aleatórios)
- [ ] Criar tabela `nowgo_users` (id, email, name, picture_url, role, active, created_at, last_login_at)
- [ ] Seed: helio@nowgo.com.br como `superadmin`
- [ ] `/api/auth/google/start` (redirect para consent)
- [ ] `/api/auth/google/callback` (troca code → token → valida whitelist → emite JWT cookie)
- [ ] `/api/auth/me` (retorna usuário ou 401)
- [ ] `/api/auth/logout`
- [ ] Hook `useAuth()` no frontend (com revalidação)

## F10 — Landing page institucional NowGo AI Native Company

- [ ] Rota raiz `/` com landing page completa
- [ ] Hero: "AI Native Company para um mundo soberano e humano"
- [ ] Seção Missão: servir os mais vulneráveis e invisíveis
- [ ] Seção Visão e Origem: alta demanda forçou plataforma operacional própria
- [ ] Seção Stack Soberana (Software + Hardware sem revelar fornecedores)
- [ ] Seção Arquitetura de Agentes (Topologia A: Jarvis + SUN)
- [ ] Seção Como Operamos (AI Native Company)
- [ ] Seção Parcerias e Reconhecimentos (NVIDIA Partner Expert + DPI + JICA + BCG + Gates + Top 50 Global)
- [ ] Seção Soberania Nacional (dados sob jurisdição nacional)
- [ ] Seção 3 Ofertas: NowGo Cities, NowGo Enterprise, NowGo Modules
- [ ] Seção Acesso Interno com CTA "Entrar com Google" (justificativa: alto volume + sensibilidade IA + soberania)
- [ ] Footer institucional NowGo Holding
- [ ] Animações de entrada (scroll-triggered)

## F11 — Proteção de rotas e endpoints

- [ ] Middleware `requireAuth` para handlers serverless
- [ ] Endpoints de escrita (Brain mutations, Doc generators) exigem auth
- [ ] Guard frontend: `/cockpit` redireciona para `/` se não logado
- [ ] Auditoria: cada mutação Brain/Doc registra `user_id` + `user_email`

## F12 — UI Gestão de Acesso (superadmin)

- [ ] Drawer `<UserManagementDrawer/>` acessível só ao superadmin
- [ ] Listar/adicionar/desativar usuários
- [ ] Endpoints `/api/users` (GET/POST/PATCH) protegidos por superadmin

## F13 — Validação end-to-end e entrega

- [ ] Testar fluxo: anônimo → / → Google login → /cockpit → logout
- [ ] Testar bloqueio de e-mails fora da whitelist (mostrar mensagem amigável)
- [ ] Testar mutação Brain registra user_email correto
- [ ] Smoke test em produção

## F13 — Painel de Indicadores Financeiros (Revenue Cockpit)

**Parâmetros confirmados pelo founder:**
- Meta 2026 (inicial): R$ 10.000.000 (R$ 10MM) — revisada em 22/mai/2026 para v1.1
- Realizado YTD 2026 (snapshot inicial 22/mai/2026): R$ 640.000
- Ticket médio esperado pós-case GDF: R$ 10MM a R$ 12MM por solução
- Deals necessários para meta (estimativa): 8 a 10 contratos fechados em 2026
- Origem dos números: NowGo Brain (Notion) — soma dinâmica
- Metodologia da perspectiva: ponderada por estágio
  - Lead: 10%
  - Qualificado: 30%
  - Proposta enviada: 60%
  - Negociação: 80%
  - Fechamento iminente: 95%
  - Ganho: 100%

**Indicadores a renderizar (faixa horizontal entre SunMissionsBar e o corpo do cockpit):**

- [ ] Volume total em negociação (pipeline aberto, R$) — Empresa + por Missão
- [ ] Total fechado YTD 2026 (R$) — Empresa + por Missão
- [ ] Perspectiva estatística end-of-year (R$) — Empresa + por Missão
- [ ] Meta R$ 10MM (inicial) com barra de progresso (% atingido) e gauge "quanto falta"
- [ ] Quantidade de novas oportunidades (mês corrente)
- [ ] Quantidade de reuniões agendadas (próximos 14 dias)
- [ ] Quantidade de propostas em curso
- [ ] Quantidade de propostas fechadas (YTD)
- [ ] Sparkline mensal de faturamento (últimos 12 meses)
- [ ] Indicador "Deals para meta" (= (meta − realizado) ÷ ticket_médio)
- [ ] Auto-refresh ao mutar Brain (mesmo `cockpit:refresh`)

**Backend:**
- [ ] `server/financialKpis.ts` com função `calcularKpis(opps, fechadas)` (pure function)
- [ ] `/api/financial/kpis` (GET) que combina Brain + snapshot e retorna o JSON dos KPIs
- [ ] Vitest cobrindo a função de ponderação por estágio

**Frontend:**
- [ ] `client/src/components/cockpit/FinancialKpisBar.tsx` (faixa horizontal cinematográfica)
- [ ] `client/src/components/cockpit/RevenueGauge.tsx` (gauge meta 2026)
- [ ] `client/src/components/cockpit/RevenueSparkline.tsx` (sparkline 12 meses)
- [ ] Inserir no `Cockpit.tsx` entre `SunMissionsBar` e o grid principal


## Correções e ajustes (22/mai/2026)

- [ ] Cor MIC OFF do JarvisCore: trocar vermelho (#ff3355) por violeta NowGo (#bb88ff)
- [ ] Re-skin landing `/welcome` no padrão visual de www.nowgoai.com
  - [ ] Visitar nowgoai.com e extrair paleta, tipografia, hierarquia, blocos
  - [ ] Reconstruir Welcome.tsx mantendo todo o conteúdo já aprovado
  - [ ] Garantir contraste, espaçamentos e legibilidade total

- [ ] Garantir 100% de responsividade em todas as páginas (mobile, tablet, desktop, ultra-wide) — landing, cockpit e Revenue Cockpit


## F14 — CRUD Multimodal (voz + UI + Notion)

Princípio: cada elemento operacional é editável por 3 canais simultâneos. Notion = fonte de verdade. UI dispara mutação via API. Voz dispara via tool calling. Toda mutação propaga via `cockpit:refresh` em <2s.

### Pipeline SUN (SunPipelinePanel à esquerda)
- [ ] Backend: helpers `addOpportunity`, `updateOpportunity`, `deleteOpportunity` em `server/notionBrain.ts`
- [ ] Endpoints: `POST /api/brain/opportunities`, `PATCH /api/brain/opportunities`, `DELETE /api/brain/opportunities`
- [ ] UI: ícones de editar (✎) e excluir (🗑) em cada linha do SunPipelinePanel
- [ ] UI: botão `+ Nova oportunidade` no topo do painel
- [ ] UI: drawer/modal de edição com campos (cliente, valor, estágio, missão, próxima ação, próxima data)
- [ ] Voz: tool `add_opportunity`, `update_opportunity`, `delete_opportunity` no JarvisCore

### Top 5 Deal Rooms
- [ ] Backend: ranking automático top-5 por score + override manual via Notion
- [ ] Endpoints: `POST/PATCH/DELETE /api/brain/deal-rooms`
- [ ] UI: card editável com `+`, ✎ e 🗑
- [ ] Voz: tools `add_deal_room`, `update_deal_room`, `remove_deal_room`

### Missões Ativas (CRUD completo)
- [ ] Backend: helpers `addMission`, `updateMission`, `deleteMission`
- [ ] Endpoints: `POST/PATCH/DELETE /api/sun/missions`
- [ ] UI: SunMissionsBar com botão `+` e cada card com menu contextual
- [ ] UI: drawer de edição (nome, codinome, status, % progresso, próxima ação, deadline, owner)
- [ ] Voz: tools `add_mission`, `update_mission`, `delete_mission`
- [ ] Validação: máximo 5 missões ativas

### Metas Financeiras (override manual)
- [ ] Backend: database `NowGo Configs` (key/value) no Notion
- [ ] `server/financialKpis.ts` lê override antes do default
- [ ] `REALIZADO_YTD_SNAPSHOT_BRL` lê automaticamente das oportunidades em Ganho (fallback snapshot)
- [ ] Endpoint: `POST /api/financial/config` (somente superadmin)
- [ ] UI: clicar no card "Meta 2026" abre mini-form
- [ ] UI: indicador 📌 quando há override ativo + botão "voltar ao automático"
- [ ] Voz: tools `set_target_2026`, `set_avg_ticket`, `reset_target` (superadmin only)

### Sincronização e auditoria
- [ ] Toda mutação dispara `cockpit:refresh`
- [ ] `server/auditLog.ts` registra autor, ação, timestamp, payload
- [ ] Endpoint `/api/audit-log` (somente superadmin)

### RBAC (Role-Based Access Control)
- [ ] `leitor`: GET only (read-only no cockpit)
- [ ] `operador`: CRUD em opps, deals e missões; NÃO edita metas
- [ ] `superadmin`: tudo, inclusive resetar overrides


## F14.2 — Missões + Top 5 Deal Rooms (decisão: caminho 2 — reuso)

Decisão arquitetural confirmada em 22/mai/2026:
- Top 5 Deal Rooms = ranking automático top-5 das oportunidades ativas (estágio ≠ Fechado) por score
- Missões SUN = reuso da database `📁 Projetos` filtrando por `Vertical = "Missão SUN"`
- Encerramento de deal = mudança de estágio para Fechado-Ganho/Perdido → próximo refresh recalcula → animação suave do 6º subindo
- Override opcional: campo `Pinar Top 5 = true` no Notion para destacar fora do ranking

### Backend
- [ ] `server/brainQueries.ts`: helper `listarTopDealRooms(5)` (top 5 ativos por score, exclui fechados)
- [ ] `server/brainQueries.ts`: helper `listarMissoesAtivas()` (Projetos com Vertical=Missão SUN, status=Ativo)
- [ ] `server/brainMutations.ts`: `criarMissao`, `atualizarMissao`, `arquivarMissao` (reusam Projetos)
- [ ] `api/brain/deal-rooms.ts`: endpoint GET (lista top 5 atual)
- [ ] `api/brain/missions.ts`: endpoint GET/POST/PATCH/DELETE com RBAC

### UI Frontend
- [ ] `BrainDealRoomsLive.tsx`: painel com 5 cards reativos a `cockpit:refresh` + polling 30s
- [ ] `BrainMissionsBar.tsx`: barra de missões CRUD (substitui SunMissionsBar hardcoded)
- [ ] Toggle Snapshot/Live em ambos os painéis (mesmo padrão do Pipeline)
- [ ] Animação de reordenação quando ranking muda (FLIP/transform)
- [ ] Validação: máximo 5 missões ativas

### Voz (JarvisCore tools)
- [ ] `brain_criar_missao` (com preview→confirma)
- [ ] `brain_atualizar_missao` (preview→confirma)
- [ ] `brain_arquivar_missao` (preview→confirma)

### Sincronização
- [ ] Toda mutação dispara `cockpit:refresh`
- [ ] Cache TTL ≤ 30s para garantir reflexo de mudanças no Notion


## F15 — Diagnóstico e Melhoria de UX Conversacional

Reportado pelo founder em 22/mai/2026:
- Jarvis está demorando para responder
- Às vezes parece não entender o que o usuário falou
- Responde algo "dentro do raciocínio dele", como se não tivesse ouvido a pergunta

### Diagnóstico
- [ ] Inspecionar pipeline de voz (qual STT, qual modelo, latência média)
- [ ] Inspecionar pipeline de chat (modelo xAI usado, system prompt size, tools count)
- [ ] Inspecionar VAD (Voice Activity Detection): timeouts, threshold de silêncio
- [ ] Medir latência ponta-a-ponta (clique → STT → LLM primeiro token → TTS → reprodução)

### Correções
- [ ] Adicionar exibição da transcrição STT na tela (você vê o que o Jarvis ouviu)
- [ ] Adicionar indicador visual "pensando..." com timer de latência
- [ ] Avaliar troca de modelo xAI para mais rápido em conversação leve (grok-4-fast?)
- [ ] Reduzir o tamanho do system prompt se for o caso
- [ ] Otimizar VAD para não cortar a fala antes do fim
- [ ] Permitir interromper o Jarvis falando (barge-in) caso ainda não esteja implementado

### Validação
- [ ] Testar 10 turnos seguidos com cronômetro
- [ ] Confirmar com o founder que latência percebida diminuiu


## F16 — Classificador SUN + Sincronização ATIVOS CRM IA

Objetivo: tornar o cockpit fiel ao filtro determinístico SUN aplicado sobre a database `ATIVOS CRM IA` no Notion. O cockpit reflete apenas a saída do classificador, não os ativos brutos. Carregamentos do cockpit forçam refresh dos dados do Brain.

### Arquitetura
- ATIVOS CRM IA (Notion) é a fonte única de oportunidades (em BRL, founder converte no Notion)
- Cada linha tem um campo Classificação SUN (Select: MISSÃO ATIVA, RADAR, PAUSADA, DESCARTADA)
- Classificador automático em server/sunClassifier.ts aplica as 5 perguntas para casos óbvios
- Casos limítrofes recebem flag `Revisar = true` e aparecem em painel dedicado para revisão humana
- Cockpit lê apenas Classificação SUN = MISSÃO ATIVA para Pipeline / Realizado / Perspectiva / Top 5 Deal Rooms
- Cache: bypass no page-load do cockpit (?fresh=1); 30s nos polling internos

### Backend (Notion + classificador)
- [ ] Descobrir database ID de ATIVOS CRM IA via API (search Notion ou env var)
- [ ] Inspecionar schema atual e mapear campos (Status, Valor BRL, Cliente, Estágio)
- [ ] Adicionar campo Classificação SUN (Select 4 opções) via Notion API (capability update_database_schema)
- [ ] Adicionar campo Revisar SUN (Checkbox) via Notion API
- [ ] Seed inicial: importar ~60 classificações dos PDFs como ground-truth
- [ ] Implementar server/sunClassifier.ts com as 5 perguntas-filtro
- [ ] Implementar regras determinísticas para casos óbvios
- [ ] Implementar fallback Revisar = true para casos limítrofes
- [ ] Vitest cobrindo as 5 perguntas com casos do PDF

### Backend (cache e fonte de verdade)
- [ ] Adicionar parametro ?fresh=1 em /api/brain/status (bypass cache)
- [ ] Cockpit dispara fetch com fresh=1 no page-load
- [ ] Refatorar server/financialKpis.ts para usar ATIVOS CRM IA filtrado por MISSÃO ATIVA
- [ ] Refatorar server/brainQueries.ts.listarTopDealRooms para usar mesma fonte
- [ ] Refatorar server/brainQueries.ts.listarMissoesAtivas para enxergar 3 missões SUN canônicas

### Frontend
- [ ] Painel "Revisar Classificação SUN" no cockpit (visível ao founder/superadmin)
- [ ] Cada linha do painel oferece 4 botões para classificar manualmente
- [ ] Após classificar, oportunidade some do painel e entra no cockpit principal

### Validação
- [ ] Testar carregamento do cockpit reflete o Notion atual
- [ ] Testar mudança no Notion (mover oportunidade de Negotiation → Closed) atualiza Realizado em ≤30s
- [ ] Testar reclassificação SUN move oportunidade entre painéis
- [ ] Validar com founder os totais (Pipeline, Realizado, Perspectiva)


## F16 — Refinamento (ATIVOS CRM IA como fonte humana, Pipeline/Opportunities como visão SUN processada)

Fluxo correto descoberto após inspecao do NowGo Brain:
- ATIVOS CRM IA (1041e87b1609806faf78e9102e86e231) e a fonte editavel pelo founder
- Pipeline / Opportunities (ba81237b7bec4b00984b39b628615e6b, filha do NowGo Brain) e a visao processada pelo SUN Controller
- Cockpit le da Pipeline / Opportunities (ja classificada e scored)

Acoes imediatas:
- [ ] Listar todas as linhas atuais da ATIVOS CRM IA via MCP Notion
- [ ] Converter Estimated Value de USD para BRL (cotacao 5.20) em cada linha via notion-update-page
- [ ] Mudar format da coluna Estimated Value de dollar para real via notion-update-data-source
- [ ] Adicionar campo Mission (Select: Missao 1 GDF / Missao 2 Infra / Missao 3 Health-Voice) na Pipeline/Opportunities
- [ ] Adicionar campo Classificacao SUN (Select: MISSAO ATIVA / RADAR / PAUSADA / DESCARTADA) na Pipeline/Opportunities
- [ ] Adicionar campo Estimated Value BRL (number, BRL) na Pipeline/Opportunities
- [ ] Adicionar campo Source CRM ID (text) na Pipeline/Opportunities (link de volta para ATIVOS CRM IA)
- [ ] Implementar server/sunClassifier.ts (5 perguntas-filtro do SUN Plan)
- [ ] Implementar server/sunSync.ts (ATIVOS CRM IA -> Pipeline/Opportunities)
- [ ] Endpoint /api/sun/sync com botao manual + auto-sync 5min
- [ ] Seed: importar ~60 classificacoes do SUN_Execution_Controller PDF como ground-truth
- [ ] Refatorar server/financialKpis.ts para usar Pipeline/Opportunities filtrada por Classificacao SUN = MISSAO ATIVA
- [ ] Refatorar server/brainQueries.ts.listarTopDealRooms para mesma fonte
- [ ] Cache bypass no page-load do cockpit (?fresh=1)
- [ ] Painel Revisar Classificacao SUN no cockpit
- [ ] Botao Sync agora no cockpit
- [ ] Vitest cobrindo classificador e sincronizacao

## F17 — Receita Recorrente (MRR / ARR)

- [x] Trocar formato Estimated Value de dollar para real (BRL) na ATIVOS CRM IA
- [ ] Marcar duplicata Celina Leao - GDF como Lost (mantem FAP-DF)
- [ ] Adicionar coluna MRR (number, format real) na ATIVOS CRM IA
- [ ] Adicionar coluna ARR (formula MRR*12, format real) na ATIVOS CRM IA
- [ ] Preencher Triad com MRR = 3500
- [ ] Replicar MRR/ARR na Pipeline/Opportunities
- [ ] Cockpit: card dedicado Receita Recorrente (MRR total, ARR total, deals com recorrencia)


## F17.1 — Refatorar fonte primária dos KPIs (ATIVOS CRM IA)

- [ ] Adicionar mapeamento estágios ATIVOS CRM IA → PipelineStage canônico
- [ ] Adicionar helper `ativosCrmIaToOportunidades()` em brainQueries
- [ ] Refatorar /api/financial/kpis para usar ATIVOS CRM IA como fonte primária
- [ ] Validar typecheck
- [ ] Commit + push
- [ ] Validar números em produção


## F18 — Limpeza do Realizado YTD (Gabinete Fase 1 = unico Closed)

- [ ] Identificar os 4 deals atuais em status Closed na ATIVOS CRM IA
- [ ] Confirmar qual card representa Gabinete Fase 1 (provavel: Serena - Automacao de Gabinete)
- [ ] Reclassificar os demais Closed para Negotiation
- [ ] Atualizar Gabinete Fase 1: Estimated Value = 1580000, Status = Closed
- [ ] Validar Realizado YTD = R$ 1.580.000 na API e cockpit


## F19 — Novas oportunidades Saúde (via Christiano Vinuales)

- [ ] Criar card HDIA (Hospital Dia) na ATIVOS CRM IA — Qualified — contato Christiano Vinuales +55 61 99459-5052
- [ ] Criar card IA Saúde RN na ATIVOS CRM IA — Lead — mesmo contato, reunião próxima semana
- [ ] Validar no cockpit (contagem +2 deals em pipeline aberto)


## F20 — Playbook de Vendas WhatsApp Agent (PDF de treinamento)

- [ ] Pesquisar copy oficial NowGo AI no site nowgoai.com
- [ ] Escrever playbook completo (Markdown): identidade, produtos, cases reais, scripts WhatsApp, objeções, FAQ
- [ ] Aplicar branding: nowgo ai + Nvidia Partner Expert + Top 50 Global (DPI/JICA/BCG/Gates)
- [ ] Cases REAIS verificáveis: Smart City Fase 1 (R$ 1,58MM), Triad (R$ 100K + MRR R$ 3,5K), Cartório RN (R$ 10K)
- [ ] Não inventar métricas/percentuais — usar apenas dados verificáveis
- [ ] Converter MD → PDF com manus-md-to-pdf
- [ ] Entregar PDF como anexo


## F21 — Design System + Landing Page profissional global

- [ ] Extrair HTML/CSS/JS exatos da referência Asimov AI Intelligence SaaS
- [ ] Construir design-system.html (Hero + Typography + Colors + Components + Layout + Motion + Icons)
- [ ] Mapear rota / da landing page atual no projeto
- [ ] Reconstruir landing page com Design System + conteúdo nowgo ai (cases reais, NVIDIA, Top 50 Global)
- [ ] NÃO tocar no cockpit (rotas autenticadas e dashboards)
- [ ] 100% responsivo
- [ ] Validar typecheck, commit, push e deploy
- [ ] Entregar URL ao vivo


## F21 — Landing Page bilíngue (PT/EN) com Design System Asimov

- [x] Extrair design-system.css/js da referência Asimov AI
- [x] Construir design-system.html (Hero + Tokens + Components)
- [ ] Mapear arquivo da landing page atual (Welcome.tsx ou Home.tsx)
- [ ] Criar LandingPage.tsx com toggle PT|EN persistido em localStorage
- [ ] Implementar i18n com objeto `copy.pt` e `copy.en` para todas as strings
- [ ] Aplicar Design System: dark theme + tokens + Outfit/Inter + ambient glow + grid layer
- [ ] Hero com globo canvas (igual referência) + headline gradient + 2 CTAs (Solicitar Acesso / Acessar Cockpit)
- [ ] Seção Plataforma (3 pilares: Custom LLMs, Tailored IaaS, Autonomous Agents)
- [ ] Seção Verticais (6 setores: Smart Cities, Health, Education, Environment, Agri, Entertainment)
- [ ] Seção Cases (Smart City Fase 1, Triad MRR, Cartório RN — números reais do CRM)
- [ ] Seção Selos (NVIDIA Partner Expert + Top 50 Global DPI/JICA/BCG/Gates)
- [ ] Seção Pricing (Piloto, Enterprise, Programa)
- [ ] Seção CTA final + Footer
- [ ] Garantir 100% responsividade (mobile-first)
- [ ] NÃO tocar em /cockpit, /welcome, /api/* ou qualquer rota autenticada
- [ ] Typecheck, commit, push, deploy Vercel
- [ ] Validar visualmente em produção (PT e EN)

## F22 — Bloqueio de acesso ao cockpit (allowlist)
- [x] Adicionar guard ALLOWED_COCKPIT_EMAILS no RequireAuth (somente helio@nowgo.com.br)
- [x] Mensagem amigável quando bloqueado + redirecionamento para /
- [x] Não tocar em nada visual do cockpit

## F23 — Correções na landing
- [ ] Globe 3D fluido (sem frame quadrado)
- [ ] Renomear Agri → Agro em PT/EN
- [ ] Triad reposicionada como Fintech
- [ ] Remover valores em reais de Cases Auditáveis e Modelos Comerciais


## F30 — Deal Room: Owner editável, status Resolvido e promoção automática

- [ ] Mapear propriedades do Notion Pipeline: Owner (Decisor), Cargo (Decisor) e Canal (Decisor)
- [ ] Adicionar propriedades acima na base Notion Pipeline se ainda não existirem
- [ ] Backend: rota tRPC `dealRoom.updateOwner` para gravar nome+cargo+canal num deal
- [ ] Backend: rota tRPC `dealRoom.markResolved` (move estágio para 'Pós-venda', registra timestamp e nota)
- [ ] Backend: função `nextTopDealRoom` que ordena por (valor × score/100) desc, excluindo deals já no top-5
- [ ] Backend: rota tRPC `dealRoom.list` que devolve sempre top-5 ativos com owner expandido
- [ ] Frontend: card de Deal Room mostra Nome + Cargo + Canal do decisor (linha extra abaixo do título)
- [ ] Frontend: botão "Editar Owner" abre modal/popover com 3 inputs (nome, cargo, canal)
- [ ] Frontend: botão "Marcar como resolvido" com confirmação; ao confirmar, anima saída do card e o próximo deal entra
- [ ] Auto-refresh do TOP 5 após qualquer mutação (invalidate query)
- [ ] Vitest para nextTopDealRoom (ordenação valor×score)
- [ ] Build, deploy e validação em prod


## F31 — Jarvis com dados financeiros do Pipeline (NowGo Brain)

- [ ] `derivarSituacaoFinanceira()` em `server/brainQueries.ts`: lê todas oportunidades, agrega métricas
- [ ] Métricas: pipeline ponderado, valor bruto, qty por estágio, realizado YTD, ticket médio, top 3 deals
- [ ] Tool `brain_situacao_financeira` em `server/jarvisBrainTools.ts`
- [ ] Injetar resumo financeiro no `cockpitCtxMsg` do `jarvisProxy.ts`
- [ ] Reforçar system prompt: "se perguntarem sobre situação financeira, use brain_situacao_financeira"
- [ ] Build + deploy + validar

## F32 — Tools genéricas de consulta cross-base no NowGo Brain

- [ ] Tool `brain_listar_empresas` (filtros opcionais: segmento, região, status)
- [ ] Tool `brain_listar_pessoas` (filtros: empresa, cargo, último contato)
- [ ] Tool `brain_listar_missoes` (filtros: status, vertical, owner)
- [ ] Tool `brain_consultar_base` (genérica: dbName + filtros simples)
- [ ] Tool `brain_relacionar_oportunidade_empresa` (busca empresa+contatos via relação)
- [ ] System prompt: "se a pergunta envolve qualquer dado do Brain (empresa, pessoa, missão, deal), use as tools brain_*"
- [ ] Build + deploy + validar

## F33 — Bridge Jarvis ↔ Manus (Sun) para dados externos

- [ ] Helper `server/sunBridge.ts` que chama API Manus via MCP/HTTP
- [ ] Tool `sun_pesquisar` (query livre → Manus retorna síntese de fontes externas)
- [ ] Tool `sun_validar_oportunidade` (Manus avalia ICP, sentimento de mercado, contexto)
- [ ] Tool `sun_pesquisar_empresa` (info corporativa, decisores conhecidos, notícias recentes)
- [ ] Protocolo: Manus retorna texto + fontes; Jarvis cita ao usuário
- [ ] Tratamento de timeout (Manus pode demorar; usar 30s + fallback "ainda processando")
- [ ] Build + deploy + validar


## F34 — Otimização da fluidez conversacional (transversal)

- [ ] Encurtar respostas: system prompt force "1 a 3 frases curtas" salvo se usuário pedir profundidade
- [ ] Variar abertura: evitar repetir "senhor" em toda resposta
- [ ] Streaming TTS imediato: já implementado (chunk-by-sentence) — validar que latência do 1º áudio < 1.5s
- [ ] Pré-carregar contexto pesado (financeiro, top deals) no `cockpitCtxMsg` para evitar tool calls em perguntas frequentes
- [ ] Rever cooldown pós-TTS: tentar 200ms (vs 250ms atual) sem causar eco
- [ ] Validar com 10 turnos seguidos cronometrados


## F30 — Decisor + Resolver com nota + auto-promoção (em andamento)

- [ ] Schema Notion: adicionar `Decisor` e `Contato Decisor` na Pipeline DB
- [ ] brainSchema.ts: registrar nomes dessas props
- [ ] brainQueries.ts: ler decisor/contato no AtivoCrmResumo
- [ ] brainMutations.ts: atualizarDecisor + resolverDeal(notaFinal?)
- [ ] brainQueries.ts: proximoDealRoomCandidato (fora top5, melhor valor×prob)
- [ ] jarvisBrainTools.ts: brain_atualizar_decisor (preview→confirma)
- [ ] jarvisBrainTools.ts: brain_resolver_deal (preview→confirma, retorna próximo)
- [ ] jarvisBrainTools.ts: brain_proximo_deal_room
- [ ] jarvisProxy.ts: incluir tools no system prompt
- [ ] UI cockpit: editar decisor/contato inline no Deal Room
- [ ] UI cockpit: botão "Marcar como Resolvido" com modal nota final
- [ ] UI cockpit: animação de promoção do próximo deal
- [ ] Testes vitest
- [ ] Build + commit + push + verificar deploy READY
- [ ] Teste real via API stream

## F35 — Performance audit + tuning (próxima)

- [ ] Medir latência STT→TTS primeira sílaba
- [ ] Identificar gargalos (LLM TTFT, tool exec, TTS TTFB)
- [ ] Otimizar tokens de saída
- [ ] Avaliar barge-in
- [ ] Documentar baseline e ganhos


## F35 — Landing: rodapé funcional + páginas institucionais

### Entrega 1 (rodapé funcional + privacidade)
- [ ] Refatorar `client/src/landing/copy.ts`: footer.colA/colB/colC com objetos {label, href} ao invés de strings
- [ ] Renderizar links do rodapé como `<a href>` reais
- [ ] Coluna A (Plataforma): todos âncoram para #platform / #verticals
- [ ] Coluna B (Empresa): Sobre→/sobre, Cases→#cases, Carreiras→mailto, Imprensa→mailto
- [ ] Coluna C (Recursos): Cockpit→/cockpit, Manifesto→/manifesto, Privacidade→/privacidade, Contato→#contact
- [ ] Criar `client/src/pages/Privacidade.tsx` com texto LGPD/GDPR padrão (PT) e suporte EN
- [ ] Adicionar rota `/privacidade` em App.tsx
- [ ] Footer suporta âncoras (#) e rotas (/) via `<a>` simples (âncoras) ou `<Link>` (rotas internas)

### Entrega 2 (páginas /sobre e /manifesto + ajustes hero/CTA)
- [ ] Criar `client/src/pages/Sobre.tsx` (bio narrativa + propósito + reconhecimentos) bilíngue
- [ ] Criar `client/src/pages/Manifesto.tsx` (Construtor de Futuro completo, estilo lousa) bilíngue
- [ ] Adicionar rotas `/sobre` e `/manifesto` em App.tsx
- [ ] Hero: ajustar subtítulo PT/EN para incluir "empresas" + "invisíveis e vulneráveis"
- [ ] Final CTA: trocar título PT/EN para "Construir hoje o futuro que vale a pena."
- [ ] Manifesto inclui: Enterprise AI-Native + Dignidade para os invisíveis 👑

### Validação
- [ ] Build sem warnings
- [ ] Tsc strict OK
- [ ] Testes verde
- [ ] Smoke test em produção (todos os 12 links funcionais)


## F36 — /sobre reescrita + Energy + cleanup ecossistema NVIDIA

- [x] Reescrever /sobre PT/EN/ES com história aprovada (Brasil de muitos Brasis, edtech vendida, Top 50 Global, NVIDIA Partner Expert, FATEC, AACMB, 14 universidades africanas, Banco Mundial passado, MEC LLM)
- [x] Linkar nome "Hélio Guilherme" para https://www.linkedin.com/in/helioguilherme/ em /sobre
- [x] Atualizar email contato para helio@nowgo.com.br em /sobre
- [x] Manter Entertainment e adicionar Energy aos verticais Enterprise (8 cards) PT/EN/ES
- [x] Ajustar grid CSS para acomodar 8 cards equilibradamente (4×2 desktop, 2×4 tablet, 1×8 mobile)
- [x] Remover links externos "Ver mais cases na NVIDIA" dos 8 cases da seção Ecossistema (PT/EN/ES)
- [x] Remover frase final "Cases listados na página oficial da NVIDIA…" da seção Ecossistema (PT/EN/ES)
- [x] Build TypeScript + Vite + testes (31 passed, 6 skipped)
- [x] Commit e push com email helio@nowgo.com.br (commit 0037643)
- [x] Aguardar deploy Vercel READY (bundle index-C1y5VzY1.js em produção)
- [x] Validar em produção: /sobre, verticais com 8 cards, ecossistema sem links externos


## F37 — KPIs hero (opção A) + menu Empresa no header

- [ ] Substituir KPI A/B/C do hero (PT/EN/ES) pela opção A: "Brasil · jurisdição soberana", "NVIDIA Partner Expert 2026", "Top 50 Global · DPI"
- [ ] Adicionar dropdown "Empresa" no header esquerdo com sublinks Sobre/Cases/Carreiras/Imprensa (PT/EN/ES) reutilizando t.footer.colB
- [ ] CSS do dropdown coerente com design system (hover, animação ease-out <300ms)
- [ ] Garantir EN aponta para /sobre (já corrigido)
- [ ] Build TypeScript + Vite + testes
- [ ] Commit e push (helio@nowgo.com.br)
- [ ] Validar em produção: hero KPIs e dropdown Empresa funcionando em PT/EN/ES


## F38 — Refatoração do Cockpit alinhada ao Blueprint Operacional do nowgo brain

- [ ] Descartar rascunhos não commitados (menu Empresa header + KPIs hero rascunho)
- [ ] Localizar Blueprint Operacional do nowgo brain no Notion (busca via MCP)
- [ ] Ler e extrair pilares operacionais, política de receita (MRR/ARR), métricas canônicas
- [ ] Mapear ATIVOS CRM IA atualizado: schema, status values, deals com MRR > 0
- [ ] Mapear estado atual do Cockpit (componentes, queries, fontes Notion/SUN/DB)
- [ ] Consolidar references/nowgo-brain-blueprint.md (fonte canônica versionada)
- [ ] Propor plano de refatoração em fases ao Hélio e aguardar aprovação
- [ ] Executar refatoração incremental (financeiro → pipeline → operacional → comando)
- [ ] Build TypeScript + Vite + testes vitest
- [ ] Commit e push (helio@nowgo.com.br) com checkpoints por fase
- [ ] Validar Cockpit em produção


## F37 — Landing: header e KPIs hero
- [x] Substituir 3 KPIs do hero (PT/EN/ES) pela opção A: Brasil/Brazil · jurisdição soberana, NVIDIA Partner Expert 2026, Top 50 Global · DPI
- [x] Adicionar dropdown "Empresa" como primeiro item do nav no header (lado esquerdo) reusando t.footer.colB (Sobre/About/Acerca de · Cases/Cases/Casos · Carreiras/Careers/Carreras · Imprensa/Press/Prensa)
- [x] Implementar dropdown em LandingShell.tsx (todas as páginas internas) e LandingPage.tsx (landing principal)
- [x] CSS do dropdown: hover/focus, animação suave, transform-origin top-left, prefers-reduced-motion
- [x] Corrigir EN /about para /sobre (rota real)
- [x] Build TypeScript + Vite + testes (31 passed, 6 skipped)
- [ ] Commit + push e aguardar deploy Vercel
- [ ] Validar em produção: dropdown funcional + KPIs novos em PT/EN/ES

## F38 — Cockpit: corrigir MRR/ARR inflado por deal Lead
- [x] Diagnosticar causa: campo MRR preenchido em deal "NowGo Estate — Prédios de Luxo AI-Native" (status Lead)
- [x] Aplicar correção no Notion: zerar MRR do deal Lead (Notion como fonte de verdade)
- [x] Validar em produção via /api/financial/kpis: MRR 33.500→3.500, ARR 402.000→42.000, dealsComRecorrencia 2→1
- [x] Política: MRR só preenchido quando status = Closed 💪 (contrato assinado)


## F38 — Página /carreiras + UX dropdown Empresa + Pipeline via MCP

- [ ] Corrigir usabilidade do dropdown Empresa (bridge hover + toggle por click + fechar ao clicar fora + Escape)
- [ ] Criar página /carreiras (PT/EN/ES) com 2 vagas: Estágio ADM e Dev AI First
- [ ] Registrar rota /carreiras em App.tsx
- [ ] Atualizar link footer.colB "Carreiras" para /carreiras nos 3 idiomas (PT/EN/ES)
- [ ] Build TypeScript + Vite + testes vitest
- [x] Commit + push (helio@nowgo.com.br)
- [ ] Aguardar deploy Vercel READY
- [ ] Validar /carreiras em produção (PT/EN/ES) e usabilidade do dropdown
- [ ] Coletar Pipeline via Notion MCP (paralelo limitado)
- [ ] Entregar tabela Top 5 + candidatos ordenada por Score

## F40 — Página /imprensa (PT/EN/ES) com artigo Gazeta Mercantil
- [x] Adicionar tipos PressArticle e ImprensaContent em copyPages.ts
- [x] Adicionar bloco imprensa em PT/EN/ES (copyPages.ts) com artigo Gazeta Mercantil + placeholder Em breve
- [x] Criar client/src/pages/Imprensa.tsx com cards escaláveis (link externo target=_blank + estado upcoming)
- [x] Adicionar estilos .ng-press-list / .ng-press-card / .ng-press-meta / .ng-press-badge-soon em design-system.css
- [x] Registrar rotas /imprensa, /press, /prensa em App.tsx
- [x] Atualizar link "Imprensa/Press/Prensa" do footer.colB de mailto: para /imprensa em copy.ts (PT/EN/ES)
- [x] Build TypeScript + Vite + testes vitest (31 passed)
- [x] Commit + push (helio@nowgo.com.br)
- [x] Aguardar deploy Vercel READY (~3 min)
- [x] Validar /imprensa em produção (PT/EN/ES) e link externo Gazeta Mercantil

## F41 — Refino visual da página /manifesto
- [x] Auditar Manifesto.tsx (classes CSS, hierarquia de títulos)
- [x] Auditar design-system.css (paleta atual: --ng-violet, --ng-cyan, --ng-blue, eyebrows, gradientes)
- [x] Comparar com /sobre, /carreiras, /imprensa para identificar inconsistências de títulos e cores
- [x] Refatorar Manifesto.tsx + design-system.css aplicando tokens consistentes
- [x] Build TS + Vite + testes vitest
- [x] Commit + push + validar em produção (PT/EN/ES, mobile/desktop)


## F42 — Sobre: enriquecer trecho InovaSkill / Bluefields / Grupo Jacto
- [x] Pesquisar Grupo Jacto (origem, escala, atuação)
- [x] Pesquisar Bluefields (relação com Jacto, papel, programa InovaSkill)
- [x] Confirmar relação InovaSkill ↔ FATEC Pompeia
- [x] Redigir versões enriquecidas PT/EN/ES e apresentar antes do deploy
- [x] Após aprovação: aplicar em copyPages.ts + build + commit + push + validar produção


## F43 — CTAs: trocar "Acesso Estratégico" por "Agendar reunião" + WhatsApp 61 99970-8833
- [x] Auditar todos os CTAs atuais (acesso estratégico, WhatsApp, e-mail) no copy.ts e copyPages.ts
- [x] Apresentar proposta de fluxo (Calendly externo vs formulário interno + WhatsApp) e obter aprovação
- [x] Aplicar substituições nos 3 idiomas (copy.ts + copyPages.ts + páginas)
- [x] Atualizar número de WhatsApp para +55 61 99970-8833 em todos os pontos
- [x] Build TS + Vite + testes vitest
- [x] Commit + push + validar em produção (PT/EN/ES)
