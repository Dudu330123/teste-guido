"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface GuidoVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseText?: (text: string) => void;
}

export function GuidoVoiceModal({ isOpen, onClose, onUseText }: GuidoVoiceModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  void onUseText;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []);
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
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="guido-voice-title" className="w-full max-w-lg overflow-hidden rounded-[2rem] border-4 border-blue-600 bg-white text-slate-900 shadow-2xl">
        <header className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white">
          <div>
            <p className="text-sm font-bold text-blue-100">Assistente de voz</p>
            <h2 id="guido-voice-title" className="text-2xl font-black">Falar com o Guido</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/15" aria-label="Fechar fala com o Guido">
            <X className="size-6" />
          </button>
        </header>

        <div className="flex min-h-80 items-center justify-center p-8 text-center sm:min-h-96 sm:p-10">
          <p className="text-3xl font-black text-slate-800 sm:text-4xl">Em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}
