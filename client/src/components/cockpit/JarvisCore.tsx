import { useCallback, useEffect, useRef, useState } from "react";
import HudCanvas, { type HudState } from "@/components/HudCanvas";
import FileDropZone from "@/components/FileDropZone";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useElevenLabsTTS } from "@/hooks/useElevenLabsTTS";
import {
  jarvisChatStream,
  fileToAttachment,
  type ChatMessage,
  type AttachmentRef,
} from "@/lib/jarvisLLM";
import { matchWakeWord, WakeWordArmedWindow } from "@/lib/wakeWord";

interface Props {
  /** Texto enviado externamente para o Jarvis processar (ex.: clique em card SUN). */
  externalPrompt: string | null;
  /** Callback chamado depois que o externalPrompt for consumido. */
  onPromptConsumed: () => void;
  /** Mensagem inicial / contexto do cockpit injetado no system prompt. */
  cockpitSystemContext: string;
}

const C = {
  PANEL: "rgba(8,18,30,0.85)",
  BORDER: "rgba(0,212,255,0.22)",
  PRI: "#00d4ff",
  TEXT: "#8ffcff",
  TEXT_DIM: "#5ab8cc",
  WHITE: "#d8f8ff",
  GREEN: "#00ff88",
  RED: "#ff3355",
};

/**
 * Núcleo central do cockpit — Jarvis conversacional.
 * Reúne: HUD pulsante + mic STT + voz clonada (ElevenLabs) + drop multimodal +
 * stream de conversa com o LLM e tools de Brain.
 */
export default function JarvisCore({
  externalPrompt,
  onPromptConsumed,
  cockpitSystemContext,
}: Props) {
  // Inicia mudo até o usuário clicar em ATIVAR (necessário para destravar autoplay
  // e pedir permissão de microfone).
  const [hudState, setHudState] = useState<HudState>("MUTED");
  const [muted, setMuted] = useState(true);
  const [activated, setActivated] = useState(false);
  const [inputText, setInputText] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "jarvis" | "sys"; content: string }>
  >([
    {
      role: "sys",
      content:
        "Pressione ATIVAR JARVIS para liberar microfone e voz, depois diga 'Ei Jarvis' ou digite uma pergunta. Você também pode arrastar PDFs, imagens ou áudios.",
    },
  ]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentRef[]>([]);

  const mutedRef = useRef(true);
  const historyRef = useRef<ChatMessage[]>([]);
  const processingRef = useRef(false);
  const pendingAttachmentsRef = useRef<AttachmentRef[]>([]);
  const wakeArmedRef = useRef(new WakeWordArmedWindow(8000));
  const scrollRef = useRef<HTMLDivElement>(null);
  // Trava global enquanto o Jarvis está falando (ou em cooldown pós-fala)
  // para evitar que o próprio TTS, capturado pelo microfone, dispare um novo
  // comando (loop de auto-escuta). Declarados no topo para serem usados em
  // speakReply e no useEffect de STT.
  const speakingLockRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const sttRef = useRef<ReturnType<typeof useSpeechRecognition> | null>(null);

  useEffect(() => {
    pendingAttachmentsRef.current = pendingAttachments;
  }, [pendingAttachments]);

  // Auto-scroll do log de conversa
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // ------------------- TTS unificado (voz clonada + fallback) ------------------
  const elevenTts = useElevenLabsTTS();
  const browserTts = useSpeechSynthesis({ lang: "pt-BR", rate: 1.0, pitch: 1.0 });
  const ttsRef = useRef({ elevenTts, browserTts });
  useEffect(() => {
    ttsRef.current = { elevenTts, browserTts };
  }, [elevenTts, browserTts]);

  // Fila serial de fala: cada chamada de speakReply enfileira um trecho.
  // Apenas um TTS toca por vez. Quando a fila esvazia, libera o lock e
  // arma o cooldown anti-eco. Isso evita que múltiplos chunks de stream
  // sobreponham áudio (causa do "Jarvis se ouvindo / repetindo").
  const speechQueueRef = useRef<Array<{ text: string; onEnd: () => void }>>([]);
  const speechRunningRef = useRef(false);

  const runSpeechQueue = useCallback(() => {
    if (speechRunningRef.current) return;
    const job = speechQueueRef.current.shift();
    if (!job) {
      // Fila vazia: arma cooldown e libera lock.
      cooldownUntilRef.current = Date.now() + 250;
      speakingLockRef.current = false;
      return;
    }
    speechRunningRef.current = true;
    speakingLockRef.current = true;
    try { sttRef.current?.stop(); } catch { /* ignore */ }
    const advance = () => {
      speechRunningRef.current = false;
      // Chama o onEnd ANTES de continuar a fila, para o consumidor poder
      // setar estados (ex.: voltar para LISTENING após o último chunk).
      try { job.onEnd(); } catch { /* ignore */ }
      // Se ainda há jobs, continua a fila imediatamente.
      if (speechQueueRef.current.length > 0) {
        runSpeechQueue();
      } else {
        cooldownUntilRef.current = Date.now() + 250;
        speakingLockRef.current = false;
      }
    };
    ttsRef.current.elevenTts
      .speak(job.text)
      .then(advance)
      .catch(() => {
        ttsRef.current.browserTts.speak(job.text, advance);
      });
  }, []);

  const speakReply = useCallback((text: string, onEnd: () => void) => {
    if (mutedRef.current || !text.trim()) {
      onEnd();
      return;
    }
    speechQueueRef.current.push({ text, onEnd });
    runSpeechQueue();
  }, [runSpeechQueue]);

  // Cancela toda fala em andamento (botao parar / mute / nova pergunta)
  const cancelAllSpeech = useCallback(() => {
    speechQueueRef.current = [];
    try { ttsRef.current.elevenTts.cancel?.(); } catch { /* ignore */ }
    try { ttsRef.current.browserTts.cancel?.(); } catch { /* ignore */ }
    speechRunningRef.current = false;
    speakingLockRef.current = false;
    cooldownUntilRef.current = 0;
  }, []);

  // ------------------- Processamento de comando ------------------
  const processCommand = useCallback(
    async (text: string) => {
      if (!text.trim() && pendingAttachmentsRef.current.length === 0) return;
      if (processingRef.current) return;
      processingRef.current = true;
      // Garante que qualquer fala residual da rodada anterior seja descartada,
      // para o Jarvis nunca "falar por cima" de uma nova pergunta.
      cancelAllSpeech();
      const attachmentsToSend = pendingAttachmentsRef.current;
      const userLog = text.trim() ||
        (attachmentsToSend[0]?.name ? `[anexo: ${attachmentsToSend[0]?.name}]` : "[anexo]");
      setConversation((c) => [...c, { role: "user", content: userLog }]);
      setHudState("THINKING");
      setPendingAttachments([]);
      setCurrentFile(null);
      try {
        let liveIdx = -1;
        let buf = "";
        let spokenPos = 0; // posição até onde já falamos
        const speakUpTo = (pos: number) => {
          if (pos <= spokenPos) return;
          const chunk = buf.slice(spokenPos, pos).trim();
          spokenPos = pos;
          if (chunk) {
            setHudState("SPEAKING");
            speakReply(chunk, () => {});
          }
        };
        const reply = await jarvisChatStream({
          history: historyRef.current,
          userMessage: text,
          attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
          honorific: "senhor",
          extraSystemContext: cockpitSystemContext,
          onDelta: (chunk) => {
            buf += chunk;
            setConversation((c) => {
              if (liveIdx === -1) {
                liveIdx = c.length;
                return [...c, { role: "jarvis", content: buf }];
              }
              const next = c.slice();
              next[liveIdx] = { role: "jarvis", content: buf };
              return next;
            });
            // Detecta o primeiro "ponto natural de fala" e dispara TTS imediato.
            // Para o primeiro chunk: aceitamos vírgulas + 25+ chars OU pontuação forte
            // OU 60+ chars contendo qualquer pausa natural. Reduz drasticamente a
            // latência percebida da primeira frase.
            const tail = buf.slice(spokenPos);
            const isFirstChunk = spokenPos === 0;
            // Pontuação forte (.!?) sempre quebra.
            let cutAt = -1;
            const strongMatch = tail.search(/[.!?](\s|$)/);
            if (strongMatch >= 0) {
              cutAt = strongMatch + 1;
            } else if (isFirstChunk) {
              // Para a primeira frase, aceitar vírgula+25 OU 60+chars com pausa.
              const commaMatch = tail.search(/,(\s)/);
              if (commaMatch >= 25) {
                cutAt = commaMatch + 1;
              } else if (tail.length >= 60) {
                const anyPause = tail.search(/[,;:](\s)/);
                if (anyPause >= 0) cutAt = anyPause + 1;
              }
            } else {
              const semiMatch = tail.search(/[;:](\s)/);
              if (semiMatch >= 30) cutAt = semiMatch + 1;
            }
            if (cutAt > 0) {
              const absoluteEnd = spokenPos + cutAt;
              speakUpTo(absoluteEnd);
            }
          },
          onToolStart: (names) => {
            setConversation((c) => [
              ...c,
              { role: "sys", content: `consultando fontes (${names.join(", ")})...` },
            ]);
          },
          onBrainMutated: (toolName) => {
            setConversation((c) => [
              ...c,
              { role: "sys", content: `✓ Brain atualizado via ${toolName}—cockpit refrescando.` },
            ]);
            window.dispatchEvent(new CustomEvent("cockpit:refresh", { detail: { toolName } }));
          },
        });
        const userContent =
          attachmentsToSend.length > 0
            ? `${text}${attachmentsToSend.map((a) => ` [anexo: ${a.name || a.kind}]`).join("")}`
            : text;
        historyRef.current = [
          ...historyRef.current,
          { role: "user" as const, content: userContent },
          { role: "assistant" as const, content: reply },
        ].slice(-20);
        setConversation((c) => {
          if (liveIdx === -1) return [...c, { role: "jarvis", content: reply }];
          const next = c.slice();
          next[liveIdx] = { role: "jarvis", content: reply };
          return next;
        });
        // TTS já disparado por sentenças via speakSentence durante o streaming.
        // Se o reply final tiver mais conteúdo (não falado), faz catch-up.
        const finalRest = reply.slice(spokenPos);
        if (finalRest.trim()) {
          setHudState("SPEAKING");
          speakReply(finalRest, () => {
            processingRef.current = false;
            setHudState("LISTENING");
          });
        } else {
          processingRef.current = false;
          setHudState("LISTENING");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setConversation((c) => [...c, { role: "sys", content: `Erro — ${msg}` }]);
        processingRef.current = false;
        setHudState(mutedRef.current ? "MUTED" : "LISTENING");
      }
    },
    [speakReply, cockpitSystemContext, cancelAllSpeech],
  );

  // Consome promptings externos (ex.: clique numa missão SUN)
  useEffect(() => {
    if (externalPrompt && !processingRef.current) {
      processCommand(externalPrompt);
      onPromptConsumed();
    }
  }, [externalPrompt, processCommand, onPromptConsumed]);

  // ------------------- STT (modo conversa direta) ------------------
  // Modo B: tudo o que o senhor falar com MIC ON é processado como comando.
  // Salvaguardas para evitar acionamentos acidentais:
  //   1. Ignora texto com menos de 2 palavras OU 6 caracteres (filtra ruído)
  //   2. Ignora se o Jarvis estiver falando (evita auto-disparo do próprio TTS)
  //   3. Filtra interjeções comuns que vazam do mic (ah, hum, eh, etc.)
  //   4. Wake-word ainda funciona como atalho explícito
  const NOISE_PATTERNS = /^(ah|eh|hum|hmm|uhm|tch|ok|sim|não|nao|tudo|opa|ei|alô|alo)\s*[\.\?\!]?$/i;
  const handleSttFinal = useCallback(
    (txt: string) => {
      if (mutedRef.current || processingRef.current) return;
      // Anti-eco: enquanto o Jarvis fala ou está no cooldown pós-fala,
      // descarta qualquer transcript capturado pelo microfone.
      if (speakingLockRef.current) return;
      if (Date.now() < cooldownUntilRef.current) return;
      const trimmed = txt.trim();
      if (!trimmed) return;
      // Salvaguarda 1: muito curto (provavelmente ruído)
      const wordCount = trimmed.split(/\s+/).length;
      if (trimmed.length < 6 && wordCount < 2) return;
      // Salvaguarda 3: interjeção sem comando real
      if (NOISE_PATTERNS.test(trimmed)) return;
      // Wake-word como atalho: se detectada, remove e processa o resto
      const m = matchWakeWord(trimmed);
      if (m.matched && m.command) {
        processCommand(m.command);
        return;
      }
      if (m.matched && !m.command) {
        // Só "Jarvis" sem comando: confirma presença
        wakeArmedRef.current.arm();
        const reply = "À disposição, senhor.";
        setConversation((c) => [...c, { role: "jarvis", content: reply }]);
        setHudState("SPEAKING");
        speakReply(reply, () => setHudState(mutedRef.current ? "MUTED" : "LISTENING"));
        return;
      }
      // Modo conversa direta: processa como comando
      processCommand(trimmed);
    },
    [processCommand, speakReply],
  );

  const stt = useSpeechRecognition({
    lang: "pt-BR",
    continuous: true,
    interimResults: true,
    onFinalResult: handleSttFinal,
  });
  useEffect(() => {
    sttRef.current = stt;
  }, [stt]);
  // STT só fica ativo no estado LISTENING e quando o microfone está
  // desmutado. Em SPEAKING / THINKING / MUTED, o STT é desligado para
  // garantir turn-taking estrito e impedir auto-escuta do próprio TTS.
  // OBS: dependemos diretamente do objeto `stt` (não de sttRef) para que o
  // effect rode com a instância correta — o hook agora reusa a mesma instância
  // através de re-renders, então isso é estável.
  // IMPORTANTE: deps reduzidas para SOMENTE [hudState]. O objeto `stt`
  // mudaria a cada transcript/interim, refazendo o effect e cancelando
  // o timer de cooldown antes dele disparar — STT ficava preso eternamente.
  // Acessamos os métodos via sttRef.current (instance única do hook).
  useEffect(() => {
    const sttApi = sttRef.current;
    if (!sttApi || !sttApi.isSupported) return;
    if (hudState === "LISTENING" && !mutedRef.current && !speakingLockRef.current) {
      const wait = Math.max(0, cooldownUntilRef.current - Date.now());
      if (wait > 0) {
        const t = setTimeout(() => {
          if (!mutedRef.current && !speakingLockRef.current) {
            try { sttRef.current?.start(); } catch { /* ignore */ }
          }
        }, wait + 50);
        return () => clearTimeout(t);
      }
      try { sttApi.start(); } catch { /* ignore */ }
    } else {
      try { sttApi.stop(); } catch { /* ignore */ }
    }
  }, [hudState]);

  // ------------------- Ativação inicial (libera autoplay + permissão mic) ------------------
  const handleActivate = useCallback(async () => {
    setActivated(true);
    mutedRef.current = false;
    setMuted(false);
    // Saudção curta para destravar autoplay e confirmar voz.
    // Usa a fila speakReply (que arma speakingLockRef + cooldown) em vez de
    // chamar elevenTts.speak() direto — senão o STT abre durante a saudação
    // e capta a própria voz, criando loop.
    const greeting = "Senhor, estou à sua disposição.";
    setConversation((c) => [...c, { role: "jarvis", content: greeting }]);
    setHudState("SPEAKING");
    speakReply(greeting, () => {
      setHudState("LISTENING");
    });
  }, [speakReply]);

  // ------------------- Controles ------------------
  const toggleMute = useCallback(() => {
    if (!activated) return; // Só funciona depois de ativar
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) {
      setHudState("MUTED");
      ttsRef.current.elevenTts.cancel();
      ttsRef.current.browserTts.cancel();
    } else {
      setHudState("LISTENING");
    }
  }, [activated]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text && pendingAttachmentsRef.current.length === 0) return;
    setInputText("");
    processCommand(text);
  }, [inputText, processCommand]);

  const handleFileSelected = useCallback(async (file: File) => {
    setCurrentFile(file);
    setConversation((c) => [...c, { role: "sys", content: `Arquivo recebido: ${file.name}` }]);
    try {
      const att = await fileToAttachment(file);
      setPendingAttachments([att]);
      setConversation((c) => [
        ...c,
        { role: "sys", content: `Pronto — pergunte sobre ${file.name} ou envie.` },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setConversation((c) => [...c, { role: "sys", content: `Erro ao ler arquivo: ${msg}` }]);
      setCurrentFile(null);
    }
  }, []);

  const handleFileClear = useCallback(() => {
    setCurrentFile(null);
    setPendingAttachments([]);
  }, []);

  return (
    <section
      style={{
        background: C.PANEL,
        border: `1px solid ${C.BORDER}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* HUD ao topo */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 12px 0",
          minHeight: 280,
          flexShrink: 0,
        }}
      >
        <div style={{ width: "100%", maxWidth: 360, aspectRatio: "1 / 1" }}>
          <HudCanvas state={hudState} muted={muted} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            fontSize: 9,
            letterSpacing: 1.6,
            color: C.PRI,
            fontWeight: 700,
          }}
        >
          J.A.R.V.I.S. · {hudState}
        </div>
        {activated && (
          <button
            onClick={toggleMute}
            aria-label={muted ? "Ativar microfone" : "Silenciar microfone"}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: muted
                ? "linear-gradient(135deg, rgba(170,80,255,0.25), rgba(170,80,255,0.08))"
                : "linear-gradient(135deg, rgba(0,255,136,0.25), rgba(0,255,136,0.08))",
              border: `1px solid ${muted ? "#aa50ff" : "#00ff88"}`,
              color: muted ? "#d8a6ff" : "#00ff88",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 10,
              letterSpacing: 1.4,
              cursor: "pointer",
              fontWeight: 800,
              boxShadow: muted ? "0 0 10px rgba(170,80,255,0.4)" : "0 0 12px rgba(0,255,136,0.45)",
            }}
          >
            {muted ? "MIC OFF" : "MIC ON"}
          </button>
        )}
        {/* Botão de ativação inicial (libera autoplay e mic) */}
        {!activated && (
          <button
            onClick={handleActivate}
            style={{
              position: "absolute",
              bottom: 18,
              left: "50%",
              transform: "translateX(-50%)",
              background: `linear-gradient(135deg, ${C.PRI}33, ${C.PRI}11)`,
              border: `1.5px solid ${C.PRI}`,
              color: C.PRI,
              padding: "12px 28px",
              borderRadius: 8,
              fontSize: 13,
              letterSpacing: 2.5,
              cursor: "pointer",
              fontWeight: 800,
              boxShadow: `0 0 24px ${C.PRI}66`,
              animation: "jarvisActivatePulse 2s ease-in-out infinite",
            }}
          >
            ▶ ATIVAR JARVIS
          </button>
        )}
        {/* Status de escuta interim */}
        {activated && stt.isListening && stt.interimTranscript && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              right: 12,
              fontSize: 10,
              color: C.TEXT_DIM,
              textAlign: "center",
              fontStyle: "italic",
              opacity: 0.85,
            }}
          >
            “{stt.interimTranscript}”
          </div>
        )}
        {/* Erro de microfone */}
        {activated && stt.error && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              right: 12,
              fontSize: 10,
              color: C.RED,
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            Microfone: {stt.error === "not-allowed" ? "permissão negada" : stt.error}
          </div>
        )}
        {/* Aviso de STT não suportado */}
        {activated && !stt.isSupported && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              right: 12,
              fontSize: 10,
              color: "#ff9933",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            Reconhecimento de voz não suportado neste navegador. Use Chrome ou Edge.
          </div>
        )}
      </div>

      {/* Stream de conversa */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          minHeight: 0,
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
        }}
      >
        {conversation.map((m, idx) => {
          const isUser = m.role === "user";
          const isSys = m.role === "sys";
          return (
            <div
              key={idx}
              style={{
                marginBottom: 8,
                fontSize: 11,
                lineHeight: 1.45,
                color: isSys ? "#5ab8cc" : isUser ? "#ffcc66" : "#d8f8ff",
                opacity: isSys ? 0.7 : 1,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 9,
                  letterSpacing: 1.2,
                  color: isSys ? "#3a8a9a" : isUser ? "#ff9933" : C.PRI,
                  fontWeight: 700,
                  marginRight: 6,
                }}
              >
                {isSys ? "SYS" : isUser ? "VOCÊ" : "JARVIS"}
              </span>
              {m.content}
            </div>
          );
        })}
      </div>

      {/* Drop zone + input */}
      <div
        style={{
          borderTop: `1px solid ${C.BORDER}`,
          padding: 10,
          background: "rgba(0,12,20,0.6)",
        }}
      >
        <FileDropZone
          onFileSelected={handleFileSelected}
          currentFile={currentFile}
          onClear={handleFileClear}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder='Digite ou diga "Ei Jarvis"...'
            style={{
              flex: 1,
              background: "rgba(0,20,30,0.7)",
              border: `1px solid ${C.BORDER}`,
              color: C.WHITE,
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 12,
              outline: "none",
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: `${C.PRI}1f`,
              border: `1px solid ${C.PRI}`,
              color: C.PRI,
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 11,
              letterSpacing: 1.4,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ENVIAR
          </button>
        </div>
      </div>
    </section>
  );
}
