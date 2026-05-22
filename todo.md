
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
- Meta 2026: R$ 100.000.000 (R$ 100MM)
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
- [ ] Meta R$ 100MM com barra de progresso (% atingido) e gauge "quanto falta"
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
