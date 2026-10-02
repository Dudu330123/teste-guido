"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Heart,
  Check,
} from "lucide-react";
import type { GeneratedGuide } from "@/services/ai-guide-generator";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SocialAuthButtons } from "@/features/auth/social-auth-buttons";

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

export interface VoiceProfile {
  id: "guido" | "helena" | "lucas";
  name: string;
  label: string;
  badge: string;
  badgeColor: string;
  description: string;
  previewText: string;
  elevenVoiceId: string;
  gender: "male" | "female";
  rate: number;
  pitch: number;
  preferredVoices: string[];
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "guido",
    name: "Guido",
    label: "Voz Acolhedora & Calma",
    badge: "Masculina · Calma",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
    description: "Tom amigo, pausado e paciente. Fala clara e tranquila para entender cada passo no seu ritmo.",
    previewText: "Olá! Eu sou o Guido. Estou aqui para te ajudar no seu ritmo, com calma e paciência.",
    elevenVoiceId: "ErXwobaYiN019PkySvjV", // Antoni (ElevenLabs)
    gender: "male",
    rate: 0.98,
    pitch: 0.95,
    preferredVoices: ["antonio", "antônio", "felipe", "daniel", "google", "pt-br"],
  },
  {
    id: "helena",
    name: "Helena",
    label: "Voz Suave & Doce",
    badge: "Feminina · Suave",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700",
    description: "Voz doce, calorosa e muito acolhedora. Perfeita para uma explicação carinhosa e paciente.",
    previewText: "Oi, tudo bem? Eu sou a Helena. Conte comigo para aprender tudo no celular bem explicadinho.",
    elevenVoiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel (ElevenLabs)
    gender: "female",
    rate: 1.0,
    pitch: 1.05,
    preferredVoices: ["francisca", "thalita", "luciana", "maria", "google", "pt-br"],
  },
  {
    id: "lucas",
    name: "Lucas",
    label: "Voz Jovem & Dinâmica",
    badge: "Jovem · Dinâmica",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700",
    description: "Voz jovem, nítida e direta ao ponto. Explicações ágeis, modernas e muito objetivas.",
    previewText: "E aí! Eu sou o Lucas. Vou te mostrar o caminho mais rápido e direto para resolver qualquer coisa.",
    elevenVoiceId: "pNInz6obpgDQGcFmaJgB", // Adam (ElevenLabs)
    gender: "male",
    rate: 1.05,
    pitch: 1.08,
    preferredVoices: ["antonio", "felipe", "google", "daniel", "pt-br"],
  },
];

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "robo-guido",
    name: "Guido Robô",
    emoji: "🤖",
    gradient: "from-blue-500 to-indigo-600",
    description: "O mascote oficial e inteligente",
  },
  {
    id: "vovo-guido",
    name: "Vovô Guido",
    emoji: "👴",
    gradient: "from-amber-500 to-orange-600",
    description: "Sábio, paciente e amigo",
  },
  {
    id: "helena",
    name: "Profª Helena",
    emoji: "👩‍🏫",
    gradient: "from-purple-500 to-pink-600",
    description: "Doce, calma e atenciosa",
  },
  {
    id: "lucas",
    name: "Lucas Amigo",
    emoji: "🧑‍💼",
    gradient: "from-emerald-500 to-teal-600",
    description: "Jovem, prestativo e dinâmico",
  },
  {
    id: "corujinha",
    name: "Corujinha Sábia",
    emoji: "🦉",
    gradient: "from-indigo-500 to-violet-600",
    description: "Esperta e cheia de dicas",
  },
  {
    id: "coracao",
    name: "Coração Amigo",
    emoji: "💙",
    gradient: "from-sky-500 to-blue-600",
    description: "Apoio e carinho a cada passo",
  },
];

function rankVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang || "").toLowerCase();

  if (!lang.startsWith("pt")) return -100;

  let score = 0;
  if (lang.includes("br")) score += 50;

  if (name.includes("natural")) score += 120;
  if (name.includes("neural")) score += 110;
  if (name.includes("online")) score += 100;
  if (name.includes("enhanced")) score += 120;
  if (name.includes("premium")) score += 120;
  if (name.includes("google")) score += 85;
  if (name.includes("francisca")) score += 80;
  if (name.includes("antonio") || name.includes("antônio")) score += 75;
  if (name.includes("thalita")) score += 70;
  if (name.includes("luciana")) score += 60;
  if (name.includes("felipe")) score += 60;

  if (name.includes("desktop")) score -= 150;
  if (name.includes("sapi")) score -= 150;

  return score;
}

function findBestVoiceForProfile(
  voices: SpeechSynthesisVoice[],
  profile: VoiceProfile
): SpeechSynthesisVoice | null {
  const ptVoices = voices
    .filter((v) => (v.lang || "").toLowerCase().startsWith("pt"))
    .sort((a, b) => rankVoice(b) - rankVoice(a));

  if (ptVoices.length === 0) return null;

  // 1. Tenta encontrar pelas palavras-chave preferidas
  for (const pref of profile.preferredVoices) {
    const match = ptVoices.find((v) => v.name.toLowerCase().includes(pref));
    if (match) return match;
  }

  // 2. Tenta por gênero
  if (profile.gender === "female") {
    const femaleMatch = ptVoices.find((v) => {
      const n = v.name.toLowerCase();
      return (
        n.includes("female") ||
        n.includes("mulher") ||
        n.includes("francisca") ||
        n.includes("thalita") ||
        n.includes("luciana") ||
        n.includes("maria") ||
        n.includes("fernanda") ||
        n.includes("raquel")
      );
    });
    if (femaleMatch) return femaleMatch;
  } else {
    const maleMatch = ptVoices.find((v) => {
      const n = v.name.toLowerCase();
      return (
        n.includes("male") ||
        n.includes("homem") ||
        n.includes("antonio") ||
        n.includes("antônio") ||
        n.includes("daniel") ||
        n.includes("felipe") ||
        n.includes("carlos")
      );
    });
    if (maleMatch) return maleMatch;
  }

  // 3. Fallback: voz pt mais bem ranqueada
  return ptVoices[0] || null;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");

  const [speechStatus, setSpeechStatus] = useState("");

  // Seleção de voz e avatar
  const [selectedVoiceId, setSelectedVoiceId] = useState<"guido" | "helena" | "lucas">(() => {
    if (typeof window !== "undefined") {
      try {
        const savedVoice = window.localStorage.getItem("guido-voice-id");
        if (savedVoice === "guido" || savedVoice === "helena" || savedVoice === "lucas") {
          return savedVoice;
        }
      } catch {}
    }
    return "guido";
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAvatar = window.localStorage.getItem("guido-avatar-id");
        if (savedAvatar && AVATAR_OPTIONS.some((a) => a.id === savedAvatar)) {
          return savedAvatar;
        }
      } catch {}
    }
    return "robo-guido";
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const currentVoiceProfile =
    VOICE_PROFILES.find((v) => v.id === selectedVoiceId) || VOICE_PROFILES[0];
  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      const frame = window.requestAnimationFrame(() => {
        if (mounted) setIsAuthenticated(false);
      });
      return () => {
        mounted = false;
        window.cancelAnimationFrame(frame);
      };
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIsAuthenticated(Boolean(data.user));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session?.user));
        if (session?.user) setAuthMessage("");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [isOpen]);

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
    setPreviewingVoiceId(null);
  }, []);

  const speakWithBrowserSynthesis = useCallback(
    (textToSpeak: string, profileOverride?: VoiceProfile, onEndCallback?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setIsSpeaking(false);
        onEndCallback?.();
        return;
      }

      window.speechSynthesis.cancel();
      const clean = formatTextForNaturalSpeech(textToSpeak);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = "pt-BR";

      const profile = profileOverride || currentVoiceProfile;
      utterance.rate = profile.rate;
      utterance.pitch = profile.pitch;

      const voices = window.speechSynthesis.getVoices();
      const voice = findBestVoiceForProfile(voices, profile);

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEndCallback?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEndCallback?.();
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    },
    [currentVoiceProfile]
  );

  const speakText = useCallback(
    async (
      textToSpeak: string,
      profileOverride?: VoiceProfile,
      onEndCallback?: () => void
    ) => {
      if (typeof window === "undefined") return;

      stopSpeaking();
      const cleanText = formatTextForNaturalSpeech(textToSpeak);
      if (!cleanText) return;

      const profile = profileOverride || currentVoiceProfile;
      setIsSpeaking(true);

      // 1. TENTA PRIMEIRO A VOZ ELEVENLABS (Qualidade de Dublador Profissional de Cinema)
      try {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText.slice(0, 600),
            voiceId: profile.elevenVoiceId,
          }),
        });

        const contentType = res.headers.get("content-type") || "";

        if (res.ok && contentType.includes("audio")) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            audioPlayerRef.current = null;
            URL.revokeObjectURL(audioUrl);
            onEndCallback?.();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            speakWithBrowserSynthesis(cleanText, profile, onEndCallback);
          };

          await audio.play();
          return;
        }
      } catch {
        // Fallback imediato para síntese do navegador
      }

      // 2. FALLBACK IMEDIATO: Síntese nativa fluida com voz, pitch e rate ajustados
      speakWithBrowserSynthesis(cleanText, profile, onEndCallback);
    },
    [currentVoiceProfile, speakWithBrowserSynthesis, stopSpeaking]
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
      if (!q.trim()) {
        setAuthMessage("Escreva ou fale o que você deseja aprender.");
        return;
      }

      if (isAuthenticated !== true) {
        setAuthMessage("Entre na sua conta para pedir um guia personalizado.");
        return;
      }

      stopVoiceInput();
      stopSpeaking();

      setIsLoading(true);
      setGeneratedGuide(null);

      try {
        const response = await fetch("/api/guide-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: q.trim(), inputMode }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.guide) {
          throw new Error(data?.error || "Não foi possível preparar o guia.");
        }

        setGeneratedGuide(data.guide as GeneratedGuide);
        setAuthMessage("");

        const textToSpeak =
          data.guide.spokenAnswer ||
          `${data.guide.title}. ${data.guide.steps[0]?.instruction || ""}`;
        void speakText(textToSpeak);
      } catch (error) {
        console.error("Erro ao gerar guia:", error);
        setAuthMessage(error instanceof Error ? error.message : "Não consegui preparar o guia agora.");
      } finally {
        setIsLoading(false);
      }
    },
    [inputMode, isAuthenticated, prompt, speakText, stopSpeaking, stopVoiceInput]
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
        setInputMode("voice");
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
        setSpeechStatus(finalCapturedTranscript.trim()
          ? "Confira o que foi entendido e toque em Criar meu guia."
          : "");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechStatus("Permissão de microfone necessária para falar com o Guido.");
    }
  }, [stopSpeaking]);

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
        if (showSettingsMenu) {
          stopSpeaking();
          setPreviewingVoiceId(null);
          setShowSettingsMenu(false);
        } else {
          onClose();
        }
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
  }, [initialListening, isOpen, onClose, showSettingsMenu, startVoiceInput, stopSpeaking]);

  const selectVoice = (id: "guido" | "helena" | "lucas") => {
    setSelectedVoiceId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("guido-voice-id", id);
    }
  };

  const selectAvatar = (id: string) => {
    setSelectedAvatarId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("guido-avatar-id", id);
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
      {/* MENU DE TELA CHEIA: PERSONALIZAR VOZ E AVATAR */}
      {showSettingsMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Personalizar Voz e Avatar"
            className="fixed inset-0 z-[100] flex flex-col bg-slate-900 text-white min-h-[100dvh] w-full overflow-y-auto animate-in fade-in duration-200"
          >
            {/* Cabeçalho do Menu de Configurações */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setPreviewingVoiceId(null);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2 text-sm sm:text-base font-bold text-white hover:bg-white/20 active:scale-95 transition-all"
                aria-label="Voltar para falar com o Guido"
              >
                <ArrowLeft className="size-5" />
                <span>Voltar</span>
              </button>
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                  Personalizar Voz e Avatar
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-400">
                  Escolha quem fala com você e como ele aparece
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setPreviewingVoiceId(null);
                setShowSettingsMenu(false);
              }}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Fechar personalização"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Conteúdo do Menu */}
          <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 space-y-8 sm:px-6 sm:py-8">
            {/* SEÇÃO 1: ESCOLHER AVATAR */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>🎭</span> Escolha o Avatar
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400">
                    O ícone que vai te acompanhar em cada ajuda
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-800/90 px-3.5 py-1.5 border border-slate-700">
                  <span className="text-2xl">{currentAvatar.emoji}</span>
                  <span className="text-xs font-bold text-slate-200">{currentAvatar.name}</span>
                </div>
              </div>

              {/* Grade de Avatares */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = av.id === selectedAvatarId;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => selectAvatar(av.id)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all text-center ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/60 ring-4 ring-blue-500/40 scale-[1.02]"
                          : "border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-black shadow-md">
                          ✓
                        </span>
                      )}
                      <div
                        className={`flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${av.gradient} text-3xl shadow-lg mb-2`}
                      >
                        {av.emoji}
                      </div>
                      <strong className="text-sm font-bold text-white">{av.name}</strong>
                      <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {av.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 2: ESCOLHER VOZ (3 VOZES MAIS HUMANAS E FLUIDAS) */}
            <section className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>🗣️</span> Escolha a Voz (3 Vozes Humanas)
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Vozes acolhedoras, naturais e sem sotaque robotizado em português
                </p>
              </div>

              <div className="space-y-3">
                {VOICE_PROFILES.map((vp) => {
                  const isSelected = vp.id === selectedVoiceId;
                  const isPlayingThis = isSpeaking && previewingVoiceId === vp.id;

                  return (
                    <div
                      key={vp.id}
                      onClick={() => selectVoice(vp.id)}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/50 ring-4 ring-blue-500/30"
                          : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div
                          className={`flex size-6 shrink-0 mt-0.5 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-blue-400 bg-blue-500 text-white"
                              : "border-slate-600 bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-black text-white">{vp.name}</span>
                            <span className={`rounded-lg px-2 py-0.5 text-xs font-bold border ${vp.badgeColor}`}>
                              {vp.badge}
                            </span>
                            {isSelected && (
                              <span className="rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-bold px-2 py-0.5 border border-blue-400/30">
                                Voz Ativa
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {vp.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlayingThis) {
                              stopSpeaking();
                              setPreviewingVoiceId(null);
                            } else {
                              selectVoice(vp.id);
                              setPreviewingVoiceId(vp.id);
                              void speakText(vp.previewText, vp, () => {
                                setPreviewingVoiceId(null);
                              });
                            }
                          }}
                          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                            isPlayingThis
                              ? "bg-rose-600 text-white animate-pulse"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                          aria-label={isPlayingThis ? `Parar voz de ${vp.name}` : `Ouvir demonstração da voz de ${vp.name}`}
                        >
                          {isPlayingThis ? (
                            <>
                              <VolumeX className="size-4" />
                              <span>Parar</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="size-4" />
                              <span>Ouvir demonstração</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setPreviewingVoiceId(null);
                  setShowSettingsMenu(false);
                }}
                className="flex w-full min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-6 py-3.5 text-lg font-black text-white shadow-xl hover:bg-blue-500 active:scale-98 transition-all"
              >
                <CheckCircle2 className="size-5" />
                <span>Confirmar e Voltar</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* JANELA PRINCIPAL DO MODAL */}
      <div className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl border-4 border-blue-600">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between border-b border-blue-500/60 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 py-3 sm:px-6 sm:py-4 text-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${currentAvatar.gradient} text-2xl sm:text-3xl shadow-sm text-white`}
              title={`Avatar: ${currentAvatar.name}`}
            >
              {currentAvatar.emoji}
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
              onClick={() => {
                stopSpeaking();
                setPreviewingVoiceId(null);
                setShowSettingsMenu(true);
              }}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              title="Personalizar voz e avatar"
              aria-label="Personalizar voz e avatar"
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
          {/* Estado inicial: Pergunta */}
          {!generatedGuide && !isLoading && (
            <div className="space-y-5 py-2">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800">Pedir um guia</p>
                <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-relaxed text-slate-600">
                  Conte o que você quer fazer no celular. Você pode escrever ou tocar no microfone para falar.
                  O Guido vai preparar um passo a passo simples para você.
                </p>
              </div>

              {isAuthenticated === false && (
                <div className="space-y-4 rounded-3xl border-2 border-blue-200 bg-blue-50 p-5 text-left">
                  <div>
                    <h3 className="text-lg font-black text-blue-950">Entre para pedir seu guia</h3>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-blue-900">
                      Para usar essa função, entre ou crie sua conta gratuitamente. Seus pedidos ficam protegidos na sua conta.
                    </p>
                  </div>
                  <SocialAuthButtons next="/" />
                  <p className="text-center text-xs font-bold text-blue-800">
                    Você também pode entrar com e-mail e senha pela página de acesso.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="ask-guido-prompt" className="block text-left text-sm font-black text-slate-700">
                  O que você quer aprender?
                </label>
                <textarea
                  id="ask-guido-prompt"
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setInputMode("text");
                    setAuthMessage("");
                  }}
                  maxLength={1000}
                  rows={4}
                  placeholder="Ex.: quero aprender a enviar uma foto pelo WhatsApp"
                  className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <p className="text-right text-xs font-bold text-slate-500">{prompt.length}/1000</p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`group relative flex size-24 items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse ring-8 ring-red-200 scale-105"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 ring-8 ring-blue-100"
                  }`}
                  aria-label={isListening ? "Parar de ouvir" : "Falar com o Guido"}
                >
                  {isListening ? <MicOff className="size-11 animate-bounce" /> : <Mic className="size-11" />}
                </button>
                <span className="text-sm font-black text-slate-700">{isListening ? "Toque para parar" : "Falar com o Guido"}</span>
                {speechStatus && <p className="text-center text-sm font-bold text-blue-700 animate-pulse">{speechStatus}</p>}
              </div>

              {authMessage && (
                <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-950">
                  {authMessage}
                </p>
              )}

              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isAuthenticated !== true || !prompt.trim()}
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3 text-lg font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="size-5" />
                Criar meu guia
                <ArrowRight className="size-5" />
              </button>

              <p className="text-center text-xs font-bold leading-relaxed text-slate-500">
                Nunca envie senhas, códigos de segurança ou dados bancários.
              </p>
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
                      {isSpeaking ? `${currentAvatar.name} conversando com você` : `Explicação carinhosa de ${currentAvatar.name}`}
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
                        setAuthMessage("");
                        setInputMode("text");
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
                  <span className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-800">
                    Guia personalizado do Guido
                  </span>
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
