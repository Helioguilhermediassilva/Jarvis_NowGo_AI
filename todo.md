
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
