"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<SpeechResult>>;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

/**
 * Centraliza o reconhecimento do navegador para que voz e pedido de guia
 * compartilhem a mesma regra: a fala vira texto editável e nunca é enviada
 * automaticamente ao terminar a captura.
 */
export function useGuidoSpeechRecognition(onTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [isSupported] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    const speechWindow = window as SpeechWindow;
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
  });
  const onTranscriptRef = useRef(onTranscript);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalSegmentsRef = useRef<string[]>([]);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clear = useCallback(() => {
    finalSegmentsRef.current = [];
    setTranscript("");
    setError("");
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return false;

    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Seu navegador não consegue ouvir agora. Você pode digitar o pedido.");
      return false;
    }

    recognitionRef.current?.abort();
    finalSegmentsRef.current = [];
    setTranscript("");
    setError("");

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const text = result?.[0]?.transcript?.trim() || "";
          if (!text) continue;

          if (result[0].isFinal) {
            finalSegmentsRef.current[index] = text;
          } else {
            interimTranscript += `${text} `;
          }
        }

        const finalTranscript = finalSegmentsRef.current.filter(Boolean).join(" ");
        const nextTranscript = `${finalTranscript} ${interimTranscript}`.trim();
        setTranscript(nextTranscript);
        onTranscriptRef.current?.(nextTranscript);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setError("Não consegui ouvir direitinho. Toque em ouvir novamente para tentar.");
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch {
      setIsListening(false);
      setError("Permita o uso do microfone para falar com o Guido.");
      return false;
    }
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return {
    clear,
    error,
    isListening,
    isSupported,
    start,
    stop,
    transcript,
  };
}
