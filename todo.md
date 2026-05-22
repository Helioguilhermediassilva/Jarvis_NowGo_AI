
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
