# Blueprint Operacional NowGo AI — Sistema de Prioridade Inteligente

Fonte: NowGo Brain → "🧠 Blueprint Operacional NowGo AI" → "🎯 Sistema de Prioridade Inteligente"
(página Notion 3581e87b-1609-8137-ac5c-d808e0fe102d). Owner: Hélio Guilherme Dias Silva.

## Fórmula oficial de Score (0-100)
Score = U×0,20 + IF×0,25 + IE×0,25 + R×0,10 + D×0,10 + P×0,10

Cada vetor de 0 a 100.

| Vetor | Sigla | Peso | Descrição |
|---|---|---|---|
| Urgência | U | 20% | Pressão temporal (prazo contratual, janela de oportunidade) |
| Impacto Financeiro | IF | 25% | Receita esperada, ponderada pela probabilidade |
| Impacto Estratégico | IE | 25% | Alinhamento com a tese de longo prazo |
| Risco (invertido) | R | 10% | Alto risco reduz score |
| Dependências | D | 10% | Bloqueios externos |
| Probabilidade | P | 10% | Likelihood de fechamento |

## Categorias de Prioridade (a partir do Score)
| Score | Categoria | Comportamento |
|---|---|---|
| > 85 | 🔥 Foco Imediato | Projeto ativo, atenção P0 |
| 60–85 | 📡 Radar Estratégico | Pipeline, revisão semanal |
| < 60 | 📦 Backlog | Ideias, revisão mensal |

## Escalas por vetor (resumo)
- **U**: 100 (≤7d/janela única), 70 (8–30d), 40 (31–90d), 10 (>90d/sem prazo)
- **IF**: 100 (≥R$1M ou pipeline ponderado ≥R$500k), 70 (R$250k–1M), 40 (R$50k–250k), 10 (<R$50k)
- **IE**: 100 (define posicionamento setorial — Governo/Saúde), 70 (marca/novo mercado), 40 (pontual), 10 (manutenção)
- **R (invertido)**: 100 (risco baixo), 70 (médio), 40 (alto), 10 (crítico)
- **D**: 100 (nenhuma), 70 (1–2), 40 (3–5), 10 (bloqueado sem prazo)
- **P**: 100 (assinado/firmado), 70 (verbal/iminente), 40 (negociação avançada), 10 (lead inicial)

## Mapeamento para Classificação SUN do cockpit (4 classes)
O cockpit usa 4 classes (Missão Ativa / Radar / Pausada / Descartada). Mapeamento a partir
das categorias do blueprint + status do funil:
- **Missão Ativa** = 🔥 Foco Imediato (Score > 85). São as missões críticas.
- **Radar** = 📡 Radar Estratégico (60–85).
- **Pausada** = 📦 Backlog (< 60) ainda vivo.
- **Descartada** = status Lost / Fechado-Perdido.

## Derivação dos vetores a partir de ATIVOS CRM IA (campos disponíveis)
ATIVOS CRM IA tem: status (Lead/Qualified/Proposal/Negotiation/Closed/Lost), priority
(Low/Medium/High), estimatedValueBrl, expectedClose, lastContact, mrr/arr, type.
- **P (Probabilidade)** ← status: Closed=100, Negotiation=70, Proposal=40, Qualified=30, Lead=10, Lost=0
- **IF (Impacto Financeiro)** ← estimatedValueBrl nas faixas acima
- **U (Urgência)** ← expectedClose (dias até fechar) nas faixas acima; sem data → 10
- **IE (Impacto Estratégico)** ← type/segmento: Governo/Saúde=100; senão priority High=70/Medium=40/Low=10
- **R (Risco)** ← priority como proxy inverso: High prioridade → risco baixo (100); Medium=70; Low=40
- **D (Dependências)** ← default 70 (1–2 controláveis) na ausência de dado específico
