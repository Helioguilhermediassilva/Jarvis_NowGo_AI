import { useState, useEffect, useRef, useCallback } from "react";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): ISpeechRecognition };
    webkitSpeechRecognition?: { new (): ISpeechRecognition };
  }
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onFinalResult?: (text: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Wrapper sobre Web Speech API com:
 *  - INSTÂNCIA ÚNICA reutilizada (não recria a cada start, evita "Chrome blocked
 *    after abort" que travava turnos subsequentes).
 *  - Auto-restart em onend quando shouldRestartRef=true (continuous mode).
 *  - Auto-retry com delay em InvalidStateError ("already started" / "blocked").
 *  - Callback `onFinalResult` sempre via ref (sobrevive a re-renders).
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    lang = "en-US",
    continuous = true,
    interimResults = true,
    onFinalResult,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const isRunningRef = useRef(false);
  const onFinalResultRef = useRef(onFinalResult);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  const isSupported = typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Cria a instância UMA vez. Em mudança de lang/continuous/interimResults,
  // a instância é recriada via dep array do effect abaixo.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = continuous;
    rec.interimResults = interimResults;
    rec.lang = lang;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;
        if (result.isFinal) {
          finalText += transcriptPart;
        } else {
          interimText += transcriptPart;
        }
      }
      if (finalText) {
        const trimmed = finalText.trim();
        setTranscript((prev) => prev + (prev ? " " : "") + trimmed);
        setInterimTranscript("");
        onFinalResultRef.current?.(trimmed);
      } else {
        setInterimTranscript(interimText);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        // Recoverable: continuous=true vai ressuscitar via onend
        return;
      }
      setError(event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldRestartRef.current = false;
        setIsListening(false);
      }
    };

    rec.onstart = () => {
      isRunningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    rec.onend = () => {
      isRunningRef.current = false;
      if (shouldRestartRef.current) {
        // Pequeno delay anti-race do Chrome quando recognition.end()
        // é seguido imediatamente de start() — o navegador rejeita.
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (!shouldRestartRef.current) return;
          try {
            rec.start();
          } catch {
            // Se ainda assim falhar, tenta de novo um pouco mais tarde.
            restartTimeoutRef.current = setTimeout(() => {
              if (!shouldRestartRef.current) return;
              try { rec.start(); } catch { setIsListening(false); }
            }, 400);
          }
        }, 120);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;

    return () => {
      shouldRestartRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      try { rec.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
      isRunningRef.current = false;
    };
  }, [lang, continuous, interimResults]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition not supported in this browser");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    shouldRestartRef.current = true;
    // Se já está rodando, no-op (Chrome lança InvalidStateError se chamar start
    // numa instância em execução). O onend cuidará de re-start quando parar.
    if (isRunningRef.current) return;
    try {
      rec.start();
    } catch (e) {
      // Pode dar InvalidStateError se ainda há cleanup pendente — agenda retry.
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = setTimeout(() => {
        if (!shouldRestartRef.current) return;
        try { rec.start(); } catch { setError(`Could not start: ${(e as Error).message}`); }
      }, 250);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    const rec = recognitionRef.current;
    if (rec && isRunningRef.current) {
      try { rec.stop(); } catch { /* ignore */ }
    }
    setInterimTranscript("");
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}
