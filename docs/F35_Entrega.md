# F35 — Landing institucional trilíngue + Ecossistema NVIDIA + páginas funcionais

**Status:** entregue e ativo em produção.
**Commit:** `f767171`
**Domínio:** [cockpitcrmnowgoai.com](https://cockpitcrmnowgoai.com)
**Bundle ativo:** `index-D8oU2Feg.js`

---

## Escopo entregue

### 1. Internacionalização — agora trilíngue (PT · EN · ES)

| Item | Antes | Depois |
|---|---|---|
| Idiomas | PT, EN | PT, EN, **ES** |
| Toggle | 2 botões | 3 botões com persistência |
| Detecção automática | apenas PT/EN do navegador | inclui ES |
| Strings traduzidas | ~80 | ~110 (com novas seções e páginas) |

A escolha do idioma persiste em `localStorage` e é aplicada também nas páginas institucionais.

---

### 2. Reorganização da seção Verticais

A seção foi dividida em duas frentes claras, alinhada ao posicionamento estratégico:

#### Smart Cities (frente pública)
- Plataformas Públicas Integradas, gabinetes digitais, atendimento ao cidadão.
- Foco em soberania de dados nacional e cuidado pelos invisíveis e vulneráveis.

#### Enterprise AI-Native (frente privada/corporativa)
Sete verticais corporativos:
1. **Health** — agentes de voz hospitalares, triagem, prontuários
2. **Education** — tutores adaptativos, automação acadêmica
3. **Environment** — ESG operacional, monitoramento ambiental
4. **Agro** — otimização de safra, gestão rural preditiva
5. **Finance** — automação documental, KYC/AML, operações regulatórias
6. **Entertainment** — fan engagement, produção AI-assisted, experiências imersivas
7. **Real Estate** — análise de portfólio, valuation, agentes para incorporadoras

---

### 3. Nova seção: Ecossistema NVIDIA (prova social transitiva)

Oito referências do ecossistema NVIDIA do qual a nowgo ai é parceira (NVIDIA Partner Expert), no estilo enxuto:

| Tag | Título | Vertical correspondente |
|---|---|---|
| PUBLIC · SMART CITIES | Cidades em quatro continentes | Smart Cities |
| ENTERPRISE · HEALTHCARE | Redes hospitalares globais com IA generativa | Health |
| ENTERPRISE · EDUCATION | Universidades de pesquisa com DGX e LLMs próprios | Education |
| ENTERPRISE · ENVIRONMENT | Gêmeos digitais ambientais e ESG operacional | Environment |
| ENTERPRISE · AGRO | Cooperativas com visão computacional | Agro |
| ENTERPRISE · FINANCE | Bancos globais com IA preditiva e detecção de fraude | Finance |
| ENTERPRISE · ENTERTAINMENT | Estúdios de cinema e TV com modelos generativos próprios | Entertainment |
| ENTERPRISE · REAL ESTATE | Incorporadoras com gêmeos digitais e analytics preditivo | Real Estate |

Cada card traz uma descrição da capacidade NVIDIA + nota em itálico explicando como a nowgo ai aplica a mesma base. Link "Ver mais cases na NVIDIA ↗" leva para a página oficial NVIDIA.

**Importante:** a redação foi cuidadosamente neutra — não menciona clientes nominais da NVIDIA (Mercedes, Pfizer, etc.). Apenas descreve setores e capacidades, evitando claim falso ou conflito de uso de marca.

---

### 4. Rodapé funcional

Os 12 links que antes eram `<li>` plain agora são `<a>` reais com destinos lógicos:

| Coluna | Link | Destino |
|---|---|---|
| Plataforma | Custom LLMs · Tailored IaaS · Autonomous Agents | âncora `#platform` |
| Plataforma | Smart City 2036 | âncora `#verticals` |
| Empresa | Sobre | rota `/sobre` (nova) |
| Empresa | Cases | âncora `#cases` |
| Empresa | Carreiras · Imprensa | mailtos para careers@ e press@ |
| Recursos | Cockpit interno | rota `/cockpit` |
| Recursos | Manifesto | rota `/manifesto` (nova) |
| Recursos | Política de Privacidade | rota `/privacidade` (nova) |
| Recursos | Contato | mailto para contato@ |

---

### 5. Hero e Final CTA atualizados

**Hero (PT):**
> Tecnologia que serve, conecta e transforma vidas — para cidades, empresas e pessoas, com cuidado especial pelos invisíveis e vulneráveis. Construímos LLMs proprietárias, infraestrutura de IA sob medida e agentes autônomos com dados sob jurisdição nacional e operação 24/7.

**Final CTA (PT):**
> Construir hoje o futuro que vale a pena.

Versões equivalentes em EN e ES seguem o mesmo padrão.

---

### 6. Novas páginas institucionais

#### `/sobre` (e alias `/about`)
- Hero institucional + bio narrativa da nowgo ai
- Seção sobre Hélio Guilherme (fundador)
- Filosofia operacional ("Sovereign · Human · Productive")
- CTA dual: e-mail + WhatsApp

#### `/manifesto`
Versão web do quadro **"Construtor de Futuro"**:
- Pilares Propósito · Missão · Visão (cards destaque)
- Lousas Forças · Valores · Foco
- Lousas Princípios Inegociáveis · Lembretes
- Closing: *"Construir hoje o futuro que vale a pena. — Hélio Guilherme"*

Inclui as inclusões discutidas:
- "empresas" ao lado de cidades e cidadãos
- "Enterprise AI-Native" como pauta de Foco de Hoje
- "Dignidade para os invisíveis" como item de Foco

#### `/privacidade` (e alias `/privacy`)
Política de Privacidade completa em LGPD + GDPR:
1. Quem somos · 2. Dados coletados · 3. Finalidades · 4. Bases legais · 5. Compartilhamento · 6. Segurança · 7. Direitos do titular · 8. Cookies · 9. Retenção · 10. DPO · 11. Atualizações.

Todas as três páginas reutilizam o **LandingShell** (header + footer compartilhado) e respondem aos 3 idiomas via `useLang`.

---

## Arquivos criados/modificados

```
client/src/landing/copy.ts          ← +ES bloc, hero+CTA atualizados, ecosystem novo, verticals reorganizado
client/src/landing/copyPages.ts     ← NOVO — strings de Sobre, Manifesto, Privacidade (PT/EN/ES)
client/src/landing/LandingShell.tsx ← NOVO — wrapper com header+footer reutilizável
client/src/landing/useLang.ts       ← suporte a "es" + detecção navegador
client/src/landing/styles/design-system.css ← novo CSS para verticais e páginas institucionais
client/src/pages/LandingPage.tsx    ← refatorada (verticals, ecosystem, footer funcional)
client/src/pages/Sobre.tsx          ← NOVA
client/src/pages/Manifesto.tsx      ← NOVA
client/src/pages/Privacidade.tsx    ← NOVA
client/src/App.tsx                  ← rotas /sobre, /manifesto, /privacidade + aliases EN
```

---

## Validação

| Verificação | Resultado |
|---|---|
| `tsc --noEmit` | ✅ sem erros |
| `pnpm build` | ✅ 5,05 s |
| `pnpm test --run` | ✅ 31 testes verdes |
| Rota `/` (200) | ✅ |
| Rota `/sobre` (200) | ✅ |
| Rota `/manifesto` (200) | ✅ |
| Rota `/privacidade` (200) | ✅ |
| Aliases `/about` e `/privacy` | ✅ |
| Toggle PT/EN/ES | ✅ visualmente confirmado |
| Bundle deployed `index-D8oU2Feg.js` | ✅ produção |

---

## Observações operacionais

1. **Email de commit:** o primeiro push do F35 (commit `cdfa923`) foi bloqueado pelo Vercel porque usava email `helio@nowgoai.com` (sem ponto), não associado à conta GitHub. Corrigido para `helio@nowgo.com.br` (commit `f767171`) e o deploy foi liberado. Anotado para próximos pushes.

2. **Mailtos do rodapé** apontam para `contato@nowgo.com.br`, `careers@nowgo.com.br` e `press@nowgo.com.br`. Verificar se essas caixas existem ou se precisam ser criadas.

3. **Sem mudança de identidade visual:** todos os tokens de design (cores, tipografia, espaçamento, bordas, sombras) foram preservados. Apenas extensões mínimas no CSS para acomodar os novos blocos (verticais reorganizados, ecossistema, páginas institucionais).

4. **SEO:** títulos das páginas atualizados via `document.title`. Para SSR ou meta tags mais ricas, futuro F36 pode adicionar React Helmet ou rota com pré-render.

---

## Próximos passos sugeridos (futuro)

- **Carreiras**: criar página `/carreiras` com vagas abertas (hoje é mailto)
- **Imprensa**: criar página `/imprensa` com kit de marca, releases e contato (hoje é mailto)
- **SEO**: adicionar meta tags Open Graph + Twitter Cards para `/sobre`, `/manifesto`, `/privacidade`
- **Sitemap.xml** atualizado para incluir as novas rotas
- **Analytics** específico por idioma (medir taxa de uso de PT/EN/ES)

---

*Entregue em 25 de maio de 2026.*
