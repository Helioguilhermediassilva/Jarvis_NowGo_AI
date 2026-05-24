# Jarvis NowGo · Entrega F30 + F34

**Data:** 24 de maio de 2026
**Repositório:** `Helioguilhermediassilva/Jarvis_NowGo_AI`
**Produção:** `https://cockpitcrmnowgoai.com`
**Commits desta sessão:** `e1725aa` (F31) → `ab3a026` (F34 fluidez) → `b43a015` + `729e6dd` + `1e0acf4` (F30) → `76ec17f` (F34 tuning)

---

## F30 · Decisor + Resolver com Nota Final + Auto-Promoção

### Schema (Notion · DB Pipeline NowGo Brain)

Foram criadas duas propriedades novas na base **Pipeline**, ambas `rich_text`:

| Propriedade | Conteúdo esperado |
|---|---|
| `Decisor` | Nome do tomador de decisão do lado cliente (ex.: "Ana Silva") |
| `Contato Decisor` | Cargo + canal + contato (ex.: "Diretora de TI · WhatsApp +55 61 99...") |

A criação foi feita via endpoint admin temporário `/api/admin/setup-decisor-props-pipeline`, que foi removido após o uso. As mesmas propriedades já existiam previamente na base ATIVOS CRM IA, mas a UI Deal Rooms opera sobre Pipeline, por isso a escolha.

### Tools LLM (voz)

Três novas tools agora estão disponíveis ao Jarvis no fluxo conversacional:

1. **`brain_atualizar_decisor`** — registra nome e contato do decisor numa oportunidade.
   - Argumentos: `pageId`, `decisor`, `contato`, `confirmedByUser`.
   - Fluxo: preview → confirmação verbal → escrita.

2. **`brain_resolver_deal`** — marca oportunidade como `Fechado-Ganho`, registra nota final opcional em "Notas" e retorna metadados do próximo candidato a Deal Room.
   - Argumentos: `pageId`, `notaFinal?`, `confirmedByUser`.
   - Fluxo: preview → confirmação verbal → escrita + auto-promoção.

3. **`brain_proximo_deal_room`** — consulta o próximo candidato a Deal Room (top score fora dos 5 atuais) sem efetuar escrita. Útil para o Jarvis antecipar "quem sobe ao Top 5".

### UI Cockpit (Deal Rooms · Brain Live)

O componente `BrainDealRoomsLive.tsx` foi estendido com duas linhas adicionais em cada card:

- **Linha "DECISOR"** — mostra `decisor · contato`. Botão `EDITAR` abre dois inputs inline (nome + contato), com `SALVAR` e `CANCELAR`.
- **Botão "✓ MARCAR COMO RESOLVIDO"** — abre uma textarea opcional "Nota Final" (aprendizados, valor final, condições, próximos passos pós-fechamento) e ao confirmar dispara o fluxo de resolução.

A interação respeita o controle de acesso: apenas usuários com role `operador` ou `superadmin` veem os botões; `leitor` enxerga os dados em modo somente-leitura. O `role` da sessão é propagado do `useAuth()` no Cockpit até o painel direito (`ControlPanelRightColumn`).

### API REST

O endpoint `/api/brain/deal-rooms` agora suporta três verbos:

| Verbo | Função | Auth |
|---|---|---|
| `GET ?limit=5` | Lista top 5 Deal Rooms ativos (Pipeline) | obrigatória (cookie sessão) |
| `PATCH` | Atualiza `Decisor` + `Contato Decisor` por `pageId` | role ≥ operador |
| `POST ?action=resolve` | Move para Fechado-Ganho com `notaFinal?` opcional | role ≥ operador |

Após `PATCH` ou `POST`, o frontend dispara `cockpit:refresh` para revalidar todos os painéis em tempo real.

### Multi-modal por design

Conforme preferência registrada do usuário, **todas as operações de F30 são acessíveis por três canais simétricos**:

1. **Tela do cockpit** — botões e formulários inline no card Deal Room.
2. **Voz (Jarvis)** — "Jarvis, marcar a WLM como resolvida; aprendizado foi que o decisor real era o CFO." → Jarvis recita preview ("Vou marcar a WLM como ganha e gravar a nota. Posso confirmar?"), usuário diz "sim", Jarvis confirma.
3. **Notion direto** — edição manual no Notion também é refletida no cockpit em até 30s (polling de live panel) ou imediatamente via `cockpit:refresh`.

### Auto-promoção do Top 5

Quando uma oportunidade é resolvida (por qualquer canal), o próximo refresh do painel:
- Remove a oportunidade resolvida do ranking.
- Promove automaticamente a 6ª de maior score para o slot vago.
- A animação suave de reordenação (FLIP via translate, já existente no componente) preserva a continuidade visual.

---

## F34 · Tuning Performance e Naturalidade Jarvis

### Correção crítica de silêncio em confirmações

**Sintoma reportado:** após o Jarvis pedir "Posso confirmar?", o usuário respondia "sim", "ok" ou "pode" — e o Jarvis ficava em silêncio.

**Diagnóstico:** o filtro `NOISE_PATTERNS` em `JarvisCore.tsx` descartava exatamente essas palavras como "interjeições de ruído". Adicionalmente, a salvaguarda "muito curto" (`length < 6 && wordCount < 2`) também eliminava respostas de 1–2 caracteres.

**Correção:** introduzida whitelist explícita `SHORT_CONFIRMATIONS` que permite passagem de respostas curtas semanticamente válidas — `sim, não, nao, ok, pode, manda, grava, vai, isso, correto, confirma, confirmo, deixa, cancela, para`. Tanto o filtro de tamanho quanto o regex de ruído agora **honram a whitelist**.

### Pre-warm de cache TTS

**Problema:** primeira execução de cada frase pagava ~900ms de TTFB do ElevenLabs.

**Solução:** novo módulo `client/src/lib/ttsWarmup.ts`. Ao ativar o Jarvis (botão ATIVAR), dispara em background um pool de 4 workers paralelos que pre-populam o IndexedDB com 10 frases canônicas:

```
"À disposição, senhor."
"Sim, senhor."
"Compreendido, senhor."
"Em andamento, senhor."
"Em que posso ajudar?"
"Um momento, senhor."
"Consultando o Brain, senhor."
"Concluído, senhor."
"Confirma?"
"Posso prosseguir?"
```

Idempotente (TTL 7 dias via `localStorage`), falhas silenciosas, custo negligenciável (~140 KB de áudio cacheado). Após esse warmup, todas essas frases tocam **em ~50ms** (leitura IndexedDB) em vez de ~900ms (rede ElevenLabs).

### Compactação do system prompt

| Métrica | Antes | Depois | Variação |
|---|---|---|---|
| Caracteres | 4.355 | 2.706 | -38% |
| Palavras | 591 | 325 | -45% |
| Tokens estimados | 1.244 | 773 | -38% |
| Ganho TTFT LLM esperado | — | — | 50–100 ms / turno |

O prompt foi reorganizado em blocos hierarquizados (`ESTILO`, `CONTEXTO`, `FERRAMENTAS`, `DADOS FINANCEIROS`, `DECISORES`, `RESOLUÇÃO DE DEAL`, `FLUXO DE ESCRITA`) sem perda semântica. O fluxo `PREVIEW → CONFIRMA` virou uma sequência numerada explícita de 5 passos.

### Latências medidas (produção, baseline)

Medições reais via `curl` em três tentativas:

| Métrica | p50 | Observação |
|---|---|---|
| TCP connect | 5 ms | CDN regional |
| TTS TTFB (frase curta) | 902 ms | Tempo até o 1º byte de áudio |
| TTS TTFB (frase média) | 889 ms | Constante mesmo com texto maior |
| TTS total (frase curta) | 2.224 ms | 17 KB MP3 |
| TTS total (frase média) | 3.185 ms | 140–157 KB MP3 |

Após F34, frases comuns (cobertas pelo warmup) caem de **~2.000 ms** para **~50 ms** percebidos. Frases novas seguem o baseline.

---

## Status consolidado

| Feature | Descrição | Status |
|---|---|---|
| F31 | KPIs financeiros via tool dedicada (`brain_situacao_financeira`) | ✅ produção |
| F32 | Queries cross-base no Brain (cobertas pelas tools de leitura existentes) | ✅ produção |
| F33 | Pesquisa externa via Grok Live Search (`pesquisa_externa`) | ✅ produção |
| F34 | Fluidez conversacional: silêncio multi-turno + pre-warm TTS + prompt -38% | ✅ produção |
| F30 | Decisor + Resolver com nota final + auto-promoção | ✅ produção |

Bundle ativo: `index-jcOttvVg.js`. Endpoints verificados: `/api/brain/deal-rooms` (GET/PATCH/POST), `/api/jarvis/chat/stream` (POST), `/api/jarvis/tts` (POST).

---

## Como testar (sugestão)

### F30 · Tela
1. Abrir `cockpitcrmnowgoai.com/cockpit`, alternar painel direito para "Brain · Live".
2. Em qualquer card, clicar `EDITAR` na linha DECISOR — preencher nome ("Ana Silva") e contato ("Diretora de TI · WhatsApp +55 61 99...") — `SALVAR`.
3. Verificar refletido instantaneamente no card e em até alguns segundos no Notion.
4. Clicar `✓ MARCAR COMO RESOLVIDO`, escrever uma nota final ("Aprendizado: decisor real era o CFO; valor final 2.4M; iniciar onboarding semana 25"), `CONFIRMAR FECHAMENTO`.
5. Observar a oportunidade sair do top 5 e a 6ª subir.

### F30 · Voz
1. Ativar Jarvis, dizer "Jarvis, o decisor da WLM é a Ana, diretora de TI no WhatsApp 61 99888 7766".
2. Jarvis deve recitar: "Vou registrar Ana como decisora da WLM com contato Diretora de TI WhatsApp 61 99888 7766. Posso confirmar?"
3. Responder "sim". Jarvis: "Atualizado, senhor. O cockpit reflete agora."
4. "Jarvis, marcar a WLM como resolvida — aprendizado foi que o decisor real era o CFO" → preview → "sim" → confirmação.

### F34 · Fluidez
1. Qualquer fluxo PREVIEW→CONFIRMA. Responder "sim" / "ok" / "pode" deve agora prosseguir sem silêncio.
2. Após ATIVAR e ~1.5s, frases canônicas ("Sim, senhor.", "À disposição, senhor.") tocam instantaneamente.
3. Conversação multi-turno: várias perguntas em sequência devem fluir sem pausas estranhas.

---

## Próximos passos (sugestões)

1. **Telemetria de latência client-side** — instrumentar `performance.now()` em pontos chave (mic→stt, stt→llm, llm→1º áudio) e enviar agregados ao backend. Vai permitir saber se o tuning está produzindo os ganhos esperados em condições reais.
2. **Cache server-side de Brain reads** — `brain_oportunidades_quentes` e similares poderiam ter cache de 30–60s no servidor, reduzindo round-trips ao Notion quando o usuário pergunta a mesma coisa em sequência.
3. **Streaming bidirecional** (WebSocket ou Server-Sent Events parcialmente já em uso) — explorar `eleven_v3_turbo` (quando disponível) ou input streaming do ElevenLabs (frases truncadas em chegada) para reduzir o TTFB de ~900ms.
4. **Histórico persistente de conversações** — hoje vive apenas em memória (`historyRef`), perdido ao recarregar. Persistir últimos 20 turnos em IndexedDB daria continuidade entre sessões.
5. **Métrica de "frases novas vs. cached"** no painel admin — dashboard mostrando quantas frases vão para cache, hit rate, top N frases novas (candidatas a entrar no warmup).
