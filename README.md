# Jarvis NowGo AI — Cockpit Interno da NowGo Holding

> **Confidencial — uso interno NowGo Holding.**
> Este repositório implementa o cockpit operacional do *founder* e o copiloto conversacional **J.A.R.V.I.S.**, suportado pela **NowGo Sovereign Stack**.

O **Jarvis NowGo AI** é a interface única através da qual o *founder* da NowGo Holding conversa em tempo real com o portfólio inteiro da empresa. A tela principal funde, num único campo de visão cinematográfico, três camadas operacionais que antes viviam em ferramentas separadas: o **Plano Operacional SUN** (controlador estratégico assíncrono), o **NowGo Brain** (CRM e base canônica de oportunidades, projetos, atas e tarefas) e o **núcleo conversacional Jarvis**, que ouve, fala com a voz clonada do *founder* e executa ações reais no Brain a partir de comandos de voz. Tudo é alimentado pela **NowGo Sovereign Stack**, a infraestrutura cognitiva proprietária da NowGo que abstrai modelos de linguagem, síntese de voz, busca em tempo real, base de conhecimento e armazenamento documental sob uma única camada interna.

---

## Visão de Produto

A NowGo Holding opera com um portfólio de mais de cem oportunidades distribuídas entre governo, saúde, infraestrutura soberana e parcerias internacionais. O risco operacional não está mais na falta de oportunidades, e sim na **dispersão da atenção do *founder***. O Jarvis NowGo AI nasce para resolver essa dispersão: ele é simultaneamente um **escudo**, que afasta tudo que não pertence à missão ativa, e um **acelerador**, que executa em segundos tarefas que antes consumiam horas — atualizar o CRM, registrar uma ata de reunião, redigir uma proposta comercial, montar um pitch deck, classificar uma oportunidade segundo o blueprint NowGo, ou disparar uma varredura assíncrona do portfólio.

A experiência foi desenhada para fazer o *founder* sentir que dirige uma operação inteligente em tempo real, e não que opera planilhas. O cockpit abre fullscreen com o núcleo Jarvis pulsando ao centro, as três Missões Ativas em destaque na faixa superior, o pipeline classificado pelo SUN à esquerda e o painel de controle operacional (Deal Rooms, cadência, plano dos próximos sete dias, agenda a remover) à direita. Toda a informação visível na tela é a verdade canônica do dia: prioridades vêm do Brain, classificações vêm do SUN, e ambas se atualizam automaticamente sempre que o Jarvis executa uma ação.

---

## Arquitetura — NowGo Sovereign Stack

A NowGo Sovereign Stack é a abstração interna que sustenta toda a inteligência do Jarvis. O sistema é organizado em sete camadas, todas operadas em nome da NowGo Holding e expostas internamente como serviços nomeados.

| Camada | Função interna | Nomeação NowGo |
|---|---|---|
| Cognição | Raciocínio em linguagem natural, *tool-calling*, redação extensa, expansão de briefings em documentos | NowGo Cognition |
| Voz | Síntese vocal com a voz clonada do *founder* e reconhecimento de fala em português brasileiro com *wake-word* | NowGo Voice |
| Brain | Base canônica de oportunidades, projetos, contatos, atas, tarefas, riscos e relatórios SUN | NowGo Brain |
| Controlador assíncrono | Agente que regenera o Plano Operacional, executa pesquisas profundas e redatoria longa em background | NowGo SUN |
| Pesquisa em tempo real | Busca web e em redes sociais com janela temporal e filtros por idioma | NowGo Discovery |
| Documentos | Geração de apresentações, propostas, contratos, *one-pages* e *pitch decks* com identidade visual NowGo | NowGo Studio |
| Arquivos | Armazenamento dedicado da pasta `Arquivos_NowGo_AI/` no domínio Drive corporativo da Holding | NowGo Vault |

Em runtime, o Jarvis é o **maestro síncrono** que roteia para essas camadas. O **SUN** é o **controlador assíncrono** que pode executar tarefas longas em background sem bloquear a conversa. Os dois lados conversam através do Brain, que serve como memória compartilhada e fila de eventos.

```
        +------------------------------------------------+
        |              COCKPIT (browser)                 |
        |   HUD pulsante + chat de voz + 3 colunas       |
        +-------------------+----------------------------+
                            |
                            v
        +------------------------------------------------+
        |  J.A.R.V.I.S. (maestro sincrono)               |
        |  - Conversa em tempo real (NowGo Voice)        |
        |  - Tool-calling (NowGo Cognition)              |
        |  - Aciona Brain, SUN, Studio, Discovery        |
        +-------------------+----------------------------+
                            |
       +--------+-----------+----------+---------+--------+
       |        |           |          |         |        |
       v        v           v          v         v        v
    Brain    SUN async   Discovery   Studio    Vault    Voice
   (CRM)   (controlador)  (pesquisa) (docs)   (Drive)  (TTS/STT)
```

---

## Cockpit — A Tela Cinematográfica

O cockpit foi desenhado em três zonas verticais sobre uma estética de centro de comando: nebulosa cosmic-blue como fundo, anel orbital ciano girando devagar atrás do núcleo Jarvis, *wireframe* geodésico sutil e tipografia mono tabular para os números do dia.

A **faixa superior** apresenta as três Missões Ativas vigentes do portfólio — designadas internamente como *Missão 1*, *Missão 2* e *Missão 3*, cada uma representando um vetor estratégico distinto da Holding (plataforma pública integrada, infraestrutura soberana e replicabilidade vertical) — cada uma com seu *glow* lateral colorido, oportunidades vinculadas, critérios de ativação e ação operacional vigente. A regra **3+1** do SUN, que limita o portfólio a três missões ativas e o foco do *founder* a uma única missão por vez, é exibida como *guardrail* permanente: se uma quarta missão tentar entrar, o Jarvis recita a regra e exige decisão sobre qual pausar.

A **coluna esquerda** apresenta o pipeline classificado pelo SUN, dividido em duas abas: o portfólio geral, com cerca de cem oportunidades em estados RADAR, RADAR CONDICIONADO, PAUSADA, DESCARTADA, e o dossiê de oportunidades vinculadas ao ciclo de governo, com trinta e quatro entradas específicas para o horizonte 2036. Cada linha exibe um selo colorido pelo status SUN, o nome do cliente, o estágio Brain, a ação operacional vinculante e um botão para o Jarvis ler em voz alta a posição daquela oportunidade.

A **zona central** é ocupada pelo núcleo Jarvis. Um *canvas* HUD pulsa a 0,8 Hz quando ocioso e vibra com a forma de onda da voz quando ele fala. Abaixo do *canvas*, o *stream* de conversa exibe as últimas trocas em estilo terminal cyberpunk, com bolhas em ciano para o *founder* e em azul-marinho para o Jarvis. A *drop zone* multimodal aceita PDF, DOCX, JPG, PNG e MP3 arrastados — o Jarvis transcreve áudio, extrai texto de documentos e usa o conteúdo como contexto da conversa imediatamente seguinte. Um botão de microfone gigante captura voz com *wake-word* "Ei Jarvis" em português brasileiro.

A **coluna direita** é o painel de controle operacional. Reúne, de cima para baixo, os cinco Deal Rooms prioritários (com risco, próximo passo e *owner*), os cinco rituais de cadência mínima (frequência, *owner*, saída esperada), o plano dos próximos sete dias em formato de *timeline* horizontal e a lista vermelha de itens a remover imediatamente da agenda do *founder*. Tudo é fonte da verdade SUN — não há reinterpretação no caminho.

Por fim, um **ticker animado** roda no rodapé com o **Comando Final SUN**, recitando como mantra a diretriz do controlador: *"Nada novo entra na agenda ativa até que um dos cinco Deal Rooms avance, seja pausado ou seja descartado. O founder deve ser protegido como ativo estratégico, não usado como sistema operacional humano da empresa."*

---

## Capacidades por Voz

O Jarvis ouve em português brasileiro com *wake-word* "Ei Jarvis", interpreta intenções com NowGo Cognition, executa ações no NowGo Brain e responde com a voz clonada do *founder* via NowGo Voice. Toda ação que altera dados segue o protocolo **preview → confirma → grava**: o Jarvis primeiro descreve o que vai fazer, espera confirmação verbal ou textual, e só então executa. Quando a tarefa é longa demais para uma fala, ele aciona o SUN como *job* assíncrono e devolve o controle imediatamente, prometendo notificar quando o resultado estiver pronto.

### Leitura do portfólio

O Jarvis acessa o NowGo Brain para responder em segundos perguntas como *"qual minha Missão 1?"*, *"lista as três oportunidades quentes"*, *"qual o status da oportunidade prioritária do trimestre?"*, *"tem follow-up atrasado?"* ou *"o que está bloqueado hoje?"*. Cada resposta cita o número da oportunidade no Brain, o estágio atual, o *score*, o último contato e a ação operacional definida pelo SUN.

### Atualização do CRM por voz

Comandos como *"atualize a oportunidade prioritária para fechado-ganho"*, *"marque a oportunidade vertical Saúde como em proposta"*, *"registre uma ata da reunião de hoje com o parceiro estratégico da Missão 2"* ou *"crie uma tarefa para preparar o briefing executivo até quinta-feira"* disparam mutações reais no Brain. O Jarvis mostra um *preview* falado, espera confirmação e grava. O cockpit detecta a mutação automaticamente via evento *server-sent* `brain_mutated` e refresca os painéis em tempo real, sem necessidade de F5.

### Geração documental por voz

Cinco famílias de documentos podem ser produzidas a partir de um briefing falado de poucas frases, com o NowGo Cognition expandindo o conteúdo, o NowGo Studio aplicando a identidade visual NowGo e o NowGo Vault armazenando o resultado na pasta `Arquivos_NowGo_AI/` do Drive corporativo.

| Família | Formato | Uso típico |
|---|---|---|
| Apresentação institucional | PPTX | Reuniões executivas, *kickoff* de projeto, *update* de board |
| Proposta comercial | DOCX | Propostas para órgãos públicos, *enterprise* e parceiros estratégicos |
| Contrato preliminar (MSA, SOW, NDA) | DOCX | Versão preliminar para revisão jurídica obrigatória antes de assinatura |
| One-page executivo | PDF | Resumo de uma página para CEOs, governadores e conselhos antes de reunião |
| Pitch deck | PPTX | Apresentações a investidores, parceiros estratégicos e oportunidades de aceleração |

A pasta-raiz `Arquivos_NowGo_AI/` é organizada automaticamente em subpastas (`Apresentacoes/`, `Propostas/`, `Contratos/`, `OnePages/`, `PitchDecks/`, `AtasReunioes/`, `Briefings/`). Quando a credencial do NowGo Vault não está configurada, os documentos são entregues como *download* direto via *fallback* em `data:` base64, garantindo que a operação nunca trave.

### Pesquisa em tempo real

Quando o *founder* pergunta sobre um fato externo recente — uma notícia, uma cotação, uma decisão de governo, um lançamento concorrente — o Jarvis aciona o NowGo Discovery, que realiza busca web e em redes sociais em tempo real com janela temporal configurável e devolve uma síntese factual com fontes citadas.

### Acionamento do SUN

Tarefas longas — regenerar o Plano Operacional completo, varredura profunda de oportunidades em um setor inteiro, redigir um documento extenso a partir de múltiplas fontes — são despachadas como *job* assíncrono ao NowGo SUN. O Jarvis devolve o controle ao *founder* imediatamente e notifica quando o resultado está disponível no Brain ou no Vault.

---

## Plano Operacional SUN

O Plano Operacional SUN é a fonte autoritativa que classifica todo o portfólio da NowGo. A versão **v1.0** (22 de maio de 2026) está materializada como dado servido pelo *endpoint* `/api/sun/plan` e contém: três Missões Ativas com critérios de ativação e ação operacional vigente; cerca de cem oportunidades classificadas entre os estados RADAR, RADAR CONDICIONADO, PAUSADA, DESCARTADA e DESCARTADA AGORA, cada uma com a ação operacional vinculante; trinta e quatro oportunidades vinculadas ao ciclo de governo no horizonte 2036; cinco Deal Rooms prioritários com risco, próximo passo e *owner* atribuído; cinco rituais de cadência mínima (Standup Diário, Deal Room Weekly, Pulse Founder, Revisão SUN, Health Check Pipeline); plano de execução dos próximos sete dias dia a dia; lista de remoção imediata da agenda do *founder*; e o Comando Final SUN exibido como ticker permanente no cockpit.

O plano é regenerado periodicamente pelo NowGo SUN a partir do estado atual do Brain e dos *frameworks* operacionais NowGo. Em versão futura, a cadência será configurável (sob demanda, semanal ou em gatilhos definidos pelo *founder*) e cada nova versão é versionada no Brain com *diff* automático contra a anterior, permitindo navegação histórica.

---

## Estrutura do Repositório

```
Jarvis_NowGo_AI/
├── api/                              ← Funções serverless (entrypoints HTTP)
│   ├── brain/
│   │   ├── status.ts                 ← Snapshot Brain (prioridades, atenção, aceleração)
│   │   └── diag.ts                   ← Diagnóstico de credenciais (apenas debug)
│   ├── sun/
│   │   └── plan.ts                   ← Snapshot completo do Plano Operacional SUN
│   ├── jarvis/
│   │   ├── chat.ts                   ← Chat síncrono com tool-calling
│   │   ├── chat/stream.ts            ← Chat com streaming SSE
│   │   └── tts.ts                    ← Síntese de voz NowGo
│   └── drive/
│       └── test.ts                   ← Validação de credenciais NowGo Vault
├── server/                           ← Lógica de negócio reutilizável
│   ├── jarvisProxy.ts                ← Maestro: tool-calling, system prompt, dispatcher
│   ├── jarvisBrainTools.ts           ← Tools de leitura/escrita do NowGo Brain
│   ├── jarvisDocTools.ts             ← Tools de geração documental NowGo Studio
│   ├── docGenerators.ts              ← Geradores PPTX, DOCX, PDF com identidade NowGo
│   ├── googleDrive.ts                ← Cliente NowGo Vault (Drive corporativo)
│   ├── notionBrain.ts                ← Cliente do NowGo Brain
│   ├── brainQueries.ts               ← Consultas canônicas do Brain
│   ├── brainMutations.ts             ← Mutações com protocolo preview→confirma→grava
│   ├── brainSchema.ts                ← Schemas e validações
│   ├── sunPlan.ts                    ← Snapshot v1.0 do Plano SUN servido por /api/sun/plan
│   └── grokProxy.ts                  ← Cliente NowGo Cognition + cache
├── client/                           ← Frontend do cockpit
│   ├── src/
│   │   ├── pages/
│   │   │   └── Cockpit.tsx           ← Tela principal cinematográfica
│   │   ├── components/cockpit/
│   │   │   ├── SunMissionsBar.tsx    ← Faixa superior com 3 Missões Ativas
│   │   │   ├── SunPipelinePanel.tsx  ← Coluna esquerda — pipeline classificado
│   │   │   ├── SunControlPanel.tsx   ← Coluna direita — Deal Rooms, cadência, 7 dias
│   │   │   └── JarvisCore.tsx        ← Núcleo central com HUD + voz + multimodal
│   │   ├── hooks/                    ← STT pt-BR, TTS NowGo, wake-word
│   │   └── lib/
│   │       ├── jarvisLLM.ts          ← Cliente do chat-stream
│   │       └── sunTypes.ts           ← Tipos compartilhados frontend
└── README.md
```

---

## Variáveis de Ambiente

Todas as credenciais são armazenadas como segredos criptografados na borda da NowGo Sovereign Stack. Os nomes abaixo são os identificadores internos.

| Variável | Função | Status |
|---|---|---|
| `NOWGO_BRAIN_KEY` | Chave de acesso ao NowGo Brain | Obrigatória |
| `NOWGO_COGNITION_KEY` | Chave do NowGo Cognition (motor cognitivo) | Obrigatória |
| `NOWGO_VOICE_KEY` | Chave do NowGo Voice (síntese vocal clonada) | Obrigatória |
| `NOWGO_VAULT_KEY` | Chave do NowGo Vault (arquivos corporativos) | Opcional (sem ela, *fallback* para *download* direto) |

Os nomes acima são os identificadores **canonicos** da NowGo Sovereign Stack. Em deploys legados, variáveis com nomes anteriores ainda são aceitas como *fallback* temporário até a migração completa.

A configuração da chave do NowGo Vault é feita em duas etapas: provisionar uma identidade de serviço no console corporativo do domínio NowGo, exportar o segredo correspondente e armazená-lo como `NOWGO_VAULT_KEY`; depois compartilhar a pasta-raiz `Arquivos_NowGo_AI/` do domínio corporativo da Holding com a identidade gerada, atribuindo permissão de *Editor*. Quando o segredo está ausente, o cockpit continua funcional e os documentos gerados são entregues por *download* direto.

---

## Endpoints Operacionais

| Endpoint | Método | Função |
|---|---|---|
| `/api/sun/plan` | `GET` | Snapshot completo do Plano Operacional SUN (versão atual + dados estruturados) |
| `/api/brain/status` | `GET` | Prioridades, pontos de atenção e padrões de aceleração extraídos do Brain |
| `/api/jarvis/chat` | `POST` | Chat síncrono com *tool-calling* (uso programático) |
| `/api/jarvis/chat/stream` | `POST` | Chat com *streaming* SSE para a UI do cockpit |
| `/api/jarvis/tts` | `POST` | Síntese de voz NowGo (voz clonada do *founder*) |
| `/api/drive/test` | `GET` | Diagnóstico de credenciais do NowGo Vault |

---

## Fluxos Críticos

### Fluxo conversacional com mutação no Brain

> *"Jarvis, marque a oportunidade prioritária da Missão 1 como fechado-ganho com valor de R$ 2,5 milhões e prazo de seis meses."*

O Jarvis identifica a oportunidade no Brain pelo nome, dispara a tool `brain_atualizar_oportunidade` em modo *preview*, recita verbalmente os campos a serem alterados e pede confirmação. Após o "confirmo" do *founder*, executa a mutação real, emite o evento SSE `brain_mutated`, e o cockpit re-busca `/api/brain/status` e `/api/sun/plan` para refletir o novo estado em tempo real. A confirmação verbal final do Jarvis cita o número da página atualizada e o *timestamp*.

### Fluxo de geração documental por voz

> *"Jarvis, prepare uma proposta comercial para a oportunidade-piloto da Missão 3, com investimento estimado de R$ 800 mil e prazo de quatro meses."*

O Jarvis cita o briefing reconhecido em forma resumida, pede confirmação e, ao receber o "sim", dispara a tool `criar_proposta_comercial`. O NowGo Cognition expande o briefing em uma proposta DOCX completa (sumário executivo, escopo, entregáveis, cronograma, investimento, próximos passos), o NowGo Studio aplica a identidade visual NowGo e o NowGo Vault armazena o arquivo em `Arquivos_NowGo_AI/Propostas/2026-05-22-missao-3-proposta-piloto.docx`. O Jarvis recita o nome do arquivo e oferece ler o sumário executivo em voz alta.

### Fluxo de regeneração do SUN

> *"Jarvis, regenere o Plano Operacional SUN com base no estado atual do Brain."*

O Jarvis aciona o NowGo SUN como *job* assíncrono, devolve o controle imediatamente e segue conversando. Ao final da execução (poucos minutos depois), o SUN escreve a nova versão `v1.x` no Brain com *diff* automático contra a versão anterior, e o Jarvis interrompe educadamente a conversa em curso para recitar as principais mudanças.

---

## Segurança e Governança

Toda a operação do Jarvis é confidencial e restrita à NowGo Holding, e segue as seguintes cláusulas de governança.

A **persona é blindada**: o Jarvis nunca revela fornecedores externos. Quando perguntado sobre infraestrutura, responde sempre em termos da NowGo Sovereign Stack. Caso o *founder* peça explicitamente, ele apenas confirma que a *stack* é proprietária e que detalhes de implementação são sigilosos.

Toda **mutação exige confirmação obrigatória**: ações que alteram o Brain ou produzem documento exigem confirmação verbal antes da execução. Não há mutação silenciosa. Cada mutação no Brain registra autor, *timestamp* e prompt original que disparou a ação, permitindo auditoria e rastreabilidade completa.

A **voz clonada tem uso restrito**: a voz clonada do *founder* é utilizada exclusivamente neste cockpit interno. A chave do NowGo Voice é segredo criptografado e não é exposta ao *frontend*.

Toda saída de **contrato é preliminar**: documentos jurídicos gerados pelo NowGo Studio são marcados como *preliminares* e exigem revisão jurídica antes de qualquer assinatura. O Jarvis recita explicitamente esse aviso ao final da geração.

---

## Roadmap

A próxima fase da plataforma contempla três expansões. A primeira é o **NowGo SUN automatizado em cadência configurável**, com regeneração periódica do Plano Operacional sem comando manual e gatilhos definidos pelo *founder* (semanal, diário ou eventos específicos no Brain). A segunda é a **integração definitiva do NowGo Vault**, com a identidade de serviço do domínio corporativo configurada e a pasta `Arquivos_NowGo_AI/` operando como repositório oficial de documentos da Holding. A terceira é o **modo embedded full-duplex**, em que o cockpit roda em hardware proprietário NowGo, resultado de parceria estratégica de infraestrutura, com mais de cento e vinte bilhões de parâmetros pré-treinados localmente, garantindo soberania cognitiva e latência mínima.

---

## Identidade Institucional

O Jarvis NowGo AI é **propriedade intelectual da NowGo Holding**. Todo o código, identidade visual, *prompts* operacionais, *frameworks* de classificação e capacidades cognitivas aqui implementadas são de uso exclusivo interno da Holding e seus *stakeholders* autorizados. A distribuição, *fork* ou cópia parcial deste repositório é vedada sem autorização formal escrita.

> **NowGo Holding · NowGo Sovereign Stack · CONFIDENCIAL**
