"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  ArrowRight,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { generateGuideWithAi, type GeneratedGuide } from "@/services/ai-guide-generator";

interface VoiceResultEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface VoiceRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: VoiceResultEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type VoiceWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

interface AskGuidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuide?: (guide: GeneratedGuide) => void;
  initialListening?: boolean;
}

/**
 * Pontuação para selecionar a voz mais humana disponível no sistema.
 */
function rankVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang || "").toLowerCase();

  if (!lang.startsWith("pt")) return -100;

  let score = 0;
  if (lang.includes("br")) score += 50;

  if (name.includes("natural")) score += 120;
  if (name.includes("neural")) score += 110;
  if (name.includes("online")) score += 100;
  if (name.includes("google")) score += 85;
  if (name.includes("francisca")) score += 80;
  if (name.includes("antonio") || name.includes("antônio")) score += 75;
  if (name.includes("thalita")) score += 70;
  if (name.includes("luciana")) score += 60;

  if (name.includes("desktop")) score -= 150;
  if (name.includes("sapi")) score -= 150;

  return score;
}

function formatTextForNaturalSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[*_#`~>[\]()]/g, "")
    .replace(/\bzap\b/gi, "WhatsApp")
    .replace(/\bapp\b/gi, "aplicativo")
    .replace(/\bapps\b/gi, "aplicativos")
    .replace(/\bex:\b/gi, "por exemplo:")
    .replace(/\. /g, ". ")
    .replace(/! /g, "! ")
    .replace(/\? /g, "? ")
    .replace(/\s+/g, " ")
    .trim();
}

export function AskGuidoModal({
  isOpen,
  onClose,
  onSelectGuide,
  initialListening = false,
}: AskGuidoModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState<GeneratedGuide | null>(null);

  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("");
  const [usingStudioVoice, setUsingStudioVoice] = useState(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Carrega configurações locais ao montar
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame: number;
    try {
      frame = window.requestAnimationFrame(() => {
        setGeminiApiKey(window.localStorage.getItem("guido-gemini-key") || "");
        setElevenLabsApiKey(window.localStorage.getItem("guido-elevenlabs-key") || "");
      });
    } catch {}

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        const ptVoices = allVoices
          .filter((v) => (v.lang || "").toLowerCase().startsWith("pt"))
          .sort((a, b) => rankVoice(b) - rankVoice(a));

        if (ptVoices.length > 0) {
          setAvailableVoices(ptVoices);
          setSelectedVoiceName((current) => {
            if (current && ptVoices.some((v) => v.name === current)) return current;
            return ptVoices[0]?.name || "";
          });
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        if (frame) window.cancelAnimationFrame(frame);
        if ("speechSynthesis" in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakWithBrowserSynthesis = useCallback(
    (textToSpeak: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const clean = formatTextForNaturalSpeech(textToSpeak);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "pt-BR";
      utterance.rate = 1.05; // Velocidade ágil e dinâmica (sem arrastar)
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.name === selectedVoiceName) ||
        voices.filter((v) => (v.lang || "").toLowerCase().startsWith("pt")).sort((a, b) => rankVoice(b) - rankVoice(a))[0];

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    },
    [selectedVoiceName]
  );

  const speakText = useCallback(
    async (textToSpeak: string) => {
      if (typeof window === "undefined") return;

      stopSpeaking();
      const cleanText = formatTextForNaturalSpeech(textToSpeak);
      if (!cleanText) return;

      setIsSpeaking(true);

      // 1. TENTA PRIMEIRO A VOZ ELEVENLABS (Qualidade de Dublador Profissional de Cinema)
      try {
        const storedElevenKey =
          elevenLabsApiKey.trim() ||
          (typeof window !== "undefined"
            ? window.localStorage.getItem("guido-elevenlabs-key")?.trim()
            : "");

        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText.slice(0, 600),
            apiKey: storedElevenKey || undefined,
          }),
        });

        const contentType = res.headers.get("content-type") || "";

        if (res.ok && contentType.includes("audio")) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;
          setUsingStudioVoice(true);

          audio.onended = () => {
            setIsSpeaking(false);
            audioPlayerRef.current = null;
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            setUsingStudioVoice(false);
            speakWithBrowserSynthesis(cleanText);
          };

          await audio.play();
          return;
        }
      } catch {
        // Fallback imediato sem delay
      }

      // 2. FALLBACK IMEDIATO: Síntese nativa com velocidade corrigida (1.05x)
      setUsingStudioVoice(false);
      speakWithBrowserSynthesis(cleanText);
    },
    [elevenLabsApiKey, speakWithBrowserSynthesis, stopSpeaking]
  );

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleGenerate = useCallback(
    async (queryText?: string) => {
      const q = queryText || prompt;
      if (!q.trim()) return;

      stopVoiceInput();
      stopSpeaking();

      setIsLoading(true);
      setGeneratedGuide(null);

      try {
        const result = await generateGuideWithAi(q);
        setGeneratedGuide(result);

        const textToSpeak =
          result.spokenAnswer ||
          `${result.title}. ${result.steps[0]?.instruction || ""}`;
        void speakText(textToSpeak);
      } catch (error) {
        console.error("Erro ao gerar guia:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [prompt, speakText, stopSpeaking, stopVoiceInput]
  );

  const startVoiceInput = useCallback(() => {
    if (typeof window === "undefined") return;

    stopSpeaking();

    const SpeechRecognition =
      (window as VoiceWindow).SpeechRecognition ||
      (window as VoiceWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechStatus("Reconhecimento de voz não suportado neste navegador. Use o Chrome ou Edge.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatus("Estou ouvindo com atenção... Pode falar com calma!");
      };

      let finalCapturedTranscript = "";

      recognition.onresult = (event: VoiceResultEvent) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          finalCapturedTranscript = transcript;
          setPrompt(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechStatus("Não consegui ouvir direitinho. Toque no microfone e fale novamente!");
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechStatus("");
        if (finalCapturedTranscript.trim().length > 2) {
          handleGenerate(finalCapturedTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechStatus("Permissão de microfone necessária para falar com o Guido.");
    }
  }, [handleGenerate, stopSpeaking]);

  useEffect(() => {
    if (!isOpen) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>('button[aria-label="Fechar janela"]')?.focus();
      if (initialListening) {
        startVoiceInput();
      }
    });

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input, a[href]") ?? []
      );
      const first = items[0],
        last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      recognitionRef.current?.abort();
      stopSpeaking();
      opener?.focus();
    };
  }, [initialListening, isOpen, onClose, startVoiceInput, stopSpeaking]);

  const handleSaveConfig = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("guido-gemini-key", geminiApiKey.trim());
      window.localStorage.setItem("guido-elevenlabs-key", elevenLabsApiKey.trim());
      setShowConfig(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ask-guido-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl border-4 border-blue-600">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between border-b border-blue-500/60 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 py-3 sm:px-6 sm:py-4 text-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 text-2xl sm:text-3xl shadow-sm">
              🤖
            </div>
            <div className="min-w-0">
              <h2 id="ask-guido-title" className="text-lg sm:text-2xl font-black leading-tight tracking-tight text-white">
                Falar com o Guido
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              title="Configuração de voz e chaves"
              aria-label="Configurar Voz e Chaves"
            >
              <Settings className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Fechar janela"
            >
              <X className="size-6" />
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gaveta de Configuração */}
          {showConfig && (
            <div className="rounded-2xl bg-blue-50 p-4 border-2 border-blue-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-blue-900 tracking-wide flex items-center gap-1.5">
                  <Volume2 className="size-4 text-blue-600" />
                  Configuração de Voz de Estúdio
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  ElevenLabs & IA
                </span>
              </div>

              {/* Chave ElevenLabs */}
              <div className="space-y-1">
                <label htmlFor="eleven-key" className="text-xs font-bold text-slate-700">
                  Chave ElevenLabs (Voz de Dublador de Cinema - Grátis até 10k chars):
                </label>
                <input
                  id="eleven-key"
                  type="password"
                  value={elevenLabsApiKey}
                  onChange={(e) => setElevenLabsApiKey(e.target.value)}
                  placeholder="Cole sua chave sk_... da ElevenLabs"
                  className="w-full rounded-xl border border-blue-300 bg-white p-2.5 text-xs font-mono"
                />
                <p className="text-[11px] text-slate-500 font-medium">
                  Crie grátis em <span className="font-semibold text-blue-600">elevenlabs.io</span>. Deixe em branco para usar a voz rápida local.
                </p>
              </div>

              {/* Seletor de voz nativa fallback */}
              {availableVoices.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-blue-200">
                  <label htmlFor="voice-select" className="text-xs font-bold text-slate-700">
                    Voz alternativa do navegador:
                  </label>
                  <select
                    id="voice-select"
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      speakWithBrowserSynthesis("Oi! Esta é uma demonstração da voz selecionada.");
                    }}
                    className="w-full rounded-xl border border-blue-300 bg-white p-2 text-xs font-bold text-slate-800"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Online")
                          ? `🌟 ${v.name}`
                          : v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Chave Gemini */}
              <div className="space-y-1 pt-1 border-t border-blue-200">
                <label htmlFor="gemini-key" className="text-xs font-bold text-slate-700">
                  Chave Gemini opcional:
                </label>
                <div className="flex gap-2">
                  <input
                    id="gemini-key"
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Cole sua chave Gemini AI Studio..."
                    className="flex-1 rounded-xl border border-blue-300 bg-white p-2 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Estado inicial: Pergunta */}
          {!generatedGuide && !isLoading && (
            <div className="space-y-6 text-center py-6">
              <div>
                <p className="text-2xl font-black text-slate-800">
                  No que você está tendo dificuldade hoje?
                </p>
              </div>

              {/* Botão de voz grande */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`group relative flex size-36 items-center justify-center rounded-full transition-all duration-300 shadow-2xl ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse ring-8 ring-red-300 scale-105"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 ring-8 ring-blue-100"
                  }`}
                  aria-label={isListening ? "Concluir e escutar explicação" : "Falar com o Guido"}
                >
                  {isListening ? (
                    <MicOff className="size-16 animate-bounce" />
                  ) : (
                    <Mic className="size-16" />
                  )}
                </button>

                <div className="mt-4 space-y-1">
                  {isListening && (
                    <p className="text-base font-black text-slate-800">
                      🔴 Estou ouvindo com atenção... Pode falar com calma!
                    </p>
                  )}
                  {speechStatus && (
                    <p className="text-sm font-bold text-blue-700 animate-pulse">{speechStatus}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Carregando com IA */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 animate-bounce">
                <Sparkles className="size-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                O Guido está preparando a resposta com calma...
              </h3>
              <p className="text-base font-semibold text-slate-500 max-w-sm">
                Explicando tudinho de um jeito fácil para o seu celular.
              </p>
            </div>
          )}

          {/* Resposta do Guia */}
          {generatedGuide && !isLoading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
              {/* Card de Controle de Voz */}
              <div className="rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-5 border-2 border-blue-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                      <Heart className="size-4 text-rose-500 fill-rose-500" />
                      {isSpeaking ? "Guido conversando com você" : "Explicação carinhosa do Guido"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSpeaking ? (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                      >
                        <VolumeX className="size-4" />
                        Pausar voz
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void speakText(
                            generatedGuide.spokenAnswer ||
                              `${generatedGuide.title}. ${generatedGuide.steps[0]?.instruction || ""}`
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                      >
                        <Volume2 className="size-4" />
                        Ouvir novamente
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setGeneratedGuide(null);
                        setPrompt("");
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <RotateCcw className="size-3.5" />
                      Outra dúvida
                    </button>
                  </div>
                </div>

                {generatedGuide.spokenAnswer && (
                  <p className="text-lg font-bold text-slate-800 leading-relaxed bg-white/95 rounded-2xl p-4 border border-blue-100 shadow-xs">
                    &ldquo;{generatedGuide.spokenAnswer}&rdquo;
                  </p>
                )}
              </div>

              {/* Título do Guia */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {generatedGuide.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-600">
                    {generatedGuide.steps.length} passos simples para seguir
                  </p>
                </div>
                {generatedGuide.appName && (
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200">
                    📱 {generatedGuide.appName}
                  </span>
                )}
              </div>

              {/* Passos gerados */}
              <div className="space-y-3.5">
                {generatedGuide.steps.map((st) => (
                  <div
                    key={st.order}
                    className="flex gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-300 hover:bg-white shadow-sm"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-base font-black text-white shadow-md">
                      {st.order}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-slate-900">{st.title}</h4>
                        {st.targetLabel && (
                          <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                            Toque: {st.targetLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-medium text-slate-700 leading-relaxed">
                        {st.instruction}
                      </p>
                      {st.warning && (
                        <p className="rounded-xl bg-amber-100 p-2.5 text-xs font-bold text-amber-950 border border-amber-300">
                          ⚠️ {st.warning}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de ação */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  if (onSelectGuide) {
                    onSelectGuide(generatedGuide);
                  }
                  onClose();
                }}
                className="flex w-full min-h-16 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-xl font-black text-white shadow-xl hover:bg-emerald-700 hover:scale-[1.01] transition-all"
              >
                <CheckCircle2 className="size-7" />
                <span>Começar no Celular Virtual</span>
                <ArrowRight className="size-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
