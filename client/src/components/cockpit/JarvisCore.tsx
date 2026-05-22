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
  const [hudState, setHudState] = useState<HudState>("LISTENING");
  const [muted, setMuted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ role: "user" | "jarvis" | "sys"; content: string }>
  >([
    {
      role: "sys",
      content:
        "Cockpit ativo. Diga 'Ei Jarvis' ou digite para iniciar a conversa. Você também pode arrastar PDFs, imagens ou áudios.",
    },
  ]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentRef[]>([]);

  const mutedRef = useRef(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const processingRef = useRef(false);
  const pendingAttachmentsRef = useRef<AttachmentRef[]>([]);
  const wakeArmedRef = useRef(new WakeWordArmedWindow(8000));
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const speakReply = useCallback((text: string, onEnd: () => void) => {
    if (mutedRef.current) {
      onEnd();
      return;
    }
    ttsRef.current.elevenTts
      .speak(text)
      .then(() => onEnd())
      .catch(() => {
        ttsRef.current.browserTts.speak(text, onEnd);
      });
  }, []);

  // ------------------- Processamento de comando ------------------
  const processCommand = useCallback(
    async (text: string) => {
      if (!text.trim() && pendingAttachmentsRef.current.length === 0) return;
      if (processingRef.current) return;
      processingRef.current = true;
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
          },
          onToolStart: (names) => {
            setConversation((c) => [
              ...c,
              { role: "sys", content: `consultando fontes (${names.join(", ")})...` },
            ]);
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
        setHudState("SPEAKING");
        speakReply(reply, () => {
          processingRef.current = false;
          setHudState(mutedRef.current ? "MUTED" : "LISTENING");
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setConversation((c) => [...c, { role: "sys", content: `Erro — ${msg}` }]);
        processingRef.current = false;
        setHudState(mutedRef.current ? "MUTED" : "LISTENING");
      }
    },
    [speakReply, cockpitSystemContext],
  );

  // Consome promptings externos (ex.: clique numa missão SUN)
  useEffect(() => {
    if (externalPrompt && !processingRef.current) {
      processCommand(externalPrompt);
      onPromptConsumed();
    }
  }, [externalPrompt, processCommand, onPromptConsumed]);

  // ------------------- STT (wake-word) ------------------
  const handleSttFinal = useCallback(
    (txt: string) => {
      if (mutedRef.current || processingRef.current) return;
      const trimmed = txt.trim();
      if (!trimmed) return;
      if (wakeArmedRef.current.isArmed()) {
        wakeArmedRef.current.disarm();
        processCommand(trimmed);
        return;
      }
      const m = matchWakeWord(trimmed);
      if (!m.matched) return;
      if (m.command) {
        processCommand(m.command);
      } else {
        wakeArmedRef.current.arm();
        const reply = "Senhor?";
        setConversation((c) => [...c, { role: "jarvis", content: reply }]);
        setHudState("SPEAKING");
        speakReply(reply, () => setHudState(mutedRef.current ? "MUTED" : "LISTENING"));
      }
    },
    [processCommand, speakReply],
  );

  const stt = useSpeechRecognition({
    lang: "pt-BR",
    continuous: true,
    interimResults: true,
    onFinalResult: handleSttFinal,
  });
  const sttRef = useRef(stt);
  useEffect(() => {
    sttRef.current = stt;
  }, [stt]);
  useEffect(() => {
    const s = sttRef.current;
    if (!s.isSupported) return;
    if (hudState === "LISTENING" && !mutedRef.current) {
      s.start();
    } else {
      s.stop();
    }
  }, [hudState]);

  // ------------------- Controles ------------------
  const toggleMute = useCallback(() => {
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
  }, []);

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
        <button
          onClick={toggleMute}
          aria-label={muted ? "Ativar microfone" : "Silenciar microfone"}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: muted ? "rgba(80,0,20,0.5)" : "rgba(0,40,30,0.5)",
            border: `1px solid ${muted ? C.RED : C.GREEN}`,
            color: muted ? C.RED : C.GREEN,
            padding: "5px 10px",
            borderRadius: 6,
            fontSize: 10,
            letterSpacing: 1.2,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {muted ? "MIC OFF" : "MIC ON"}
        </button>
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
