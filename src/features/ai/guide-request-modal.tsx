"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff, RotateCcw, Sparkles, X } from "lucide-react";
import type { GeneratedGuide } from "@/services/ai-guide-generator";
import { generateGuideWithAi } from "@/services/ai-guide-generator";
import { useGuidoSpeechRecognition } from "./use-guido-speech-recognition";

interface GuideRequestModalProps {
  isOpen: boolean;
  initialPrompt?: string;
  onClose: () => void;
}

export function GuideRequestModal({ isOpen, initialPrompt = "", onClose }: GuideRequestModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<GeneratedGuide | null>(null);
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const handleSpeechTranscript = useCallback((nextTranscript: string) => {
    setPrompt(nextTranscript);
    setMessage("");
  }, []);
  const { error, isListening, start, stop } = useGuidoSpeechRecognition(handleSpeechTranscript);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("button")?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), textarea") ?? []);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      stop();
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen, stop]);

  const handleGenerate = useCallback(async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setMessage("Escreva ou fale o que você quer aprender.");
      return;
    }

    stop();
    setMessage("");
    setGuide(null);
    setIsLoading(true);
    try {
      setGuide(await generateGuideWithAi(cleanPrompt));
    } catch {
      setMessage("Não consegui preparar seu guia agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, stop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-request-title"
        className="flex max-h-[min(720px,92dvh)] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border-4 border-blue-600 bg-white text-slate-900 shadow-2xl"
      >
        <header className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white">
          <div>
            <p className="text-sm font-bold text-blue-100">Guido</p>
            <h2 id="guide-request-title" className="text-2xl font-black">Pedir um guia</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/15" aria-label="Fechar pedido de guia">
            <X className="size-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {!guide && !isLoading && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-800">O que você quer aprender?</h3>
                <p className="mt-2 text-base font-semibold leading-relaxed text-slate-600">
                  Escreva ou fale o que você quer fazer no celular. O Guido prepara um passo a passo simples.
                </p>
              </div>

              <div className="relative">
                <label htmlFor="guide-request-prompt" className="sr-only">O que você quer aprender?</label>
                <textarea
                  id="guide-request-prompt"
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setMessage("");
                  }}
                  maxLength={1000}
                  rows={4}
                  placeholder="Ex.: quero aprender a enviar uma foto pelo WhatsApp"
                  className="w-full resize-y rounded-2xl border-2 border-slate-200 px-4 py-3 pr-14 text-base font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => (isListening ? stop() : start())}
                  className={`absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full text-white transition ${isListening ? "bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
                  aria-label={isListening ? "Parar de ouvir" : "Falar com o Guido"}
                >
                  {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </button>
              </div>

              {isListening && <p className="text-sm font-bold text-red-600" aria-live="polite">Ouvindo… fale com calma.</p>}
              {error && <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">{error}</p>}
              {message && <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">{message}</p>}

              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={!prompt.trim()}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-lg font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="size-5" />
                Criar guia
                <ArrowRight className="size-5" />
              </button>

              <p className="text-center text-xs font-bold text-slate-500">Não envie senhas ou códigos de segurança.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <Sparkles className="size-12 animate-pulse text-blue-600" />
              <p className="text-xl font-black text-slate-800">Preparando seu guia…</p>
            </div>
          )}

          {guide && !isLoading && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-blue-700">Guia personalizado gerado pelo Guido</p>
                <h3 className="mt-1 text-2xl font-black text-slate-800">{guide.title}</h3>
              </div>
              <ol className="space-y-3">
                {guide.steps.map((step) => (
                  <li key={`${step.order}-${step.title}`} className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                    <p className="font-black text-slate-800">{step.order}. {step.title}</p>
                    <p className="mt-1 font-semibold leading-relaxed text-slate-600">{step.instruction}</p>
                    {step.warning && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">Atenção: {step.warning}</p>}
                  </li>
                ))}
              </ol>
              <button type="button" onClick={() => { setGuide(null); setPrompt(""); }} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 px-4 font-black text-blue-700 hover:bg-blue-50">
                <RotateCcw className="size-5" /> Pedir outro guia
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
