"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSizePreference = "normal" | "large" | "huge";
export type ContrastPreference = "standard" | "high-contrast";

interface AccessibilityContextType {
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  cycleFontSize: () => void;
  contrast: ContrastPreference;
  setContrast: (contrast: ContrastPreference) => void;
  toggleContrast: () => void;
  autoSpeak: boolean;
  setAutoSpeak: (speak: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SIZE_STORAGE_KEY = "guido-font-size";
const CONTRAST_STORAGE_KEY = "guido-contrast";
const AUTO_SPEAK_STORAGE_KEY = "guido-auto-speak";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizePreference>("normal");
  const [contrast, setContrastState] = useState<ContrastPreference>("standard");
  const [autoSpeak, setAutoSpeakState] = useState<boolean>(false);

  useEffect(() => {
    // Restaura preferências após a primeira pintura, preservando a hidratação do servidor.
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedFontSize = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizePreference;
        if (savedFontSize === "normal" || savedFontSize === "large" || savedFontSize === "huge") {
          setFontSizeState(savedFontSize);
          document.documentElement.dataset.fontSize = savedFontSize;
        }

        const savedContrast = window.localStorage.getItem(CONTRAST_STORAGE_KEY) as ContrastPreference;
        if (savedContrast === "standard" || savedContrast === "high-contrast") {
          setContrastState(savedContrast);
          document.documentElement.dataset.contrast = savedContrast;
        }

        const savedAutoSpeak = window.localStorage.getItem(AUTO_SPEAK_STORAGE_KEY);
        if (savedAutoSpeak !== null) {
          setAutoSpeakState(savedAutoSpeak === "true");
        }
      } catch {
        // localStorage indisponível ou bloqueado
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const setFontSize = (size: FontSizePreference) => {
    setFontSizeState(size);
    document.documentElement.dataset.fontSize = size;
    try {
      window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    } catch {}
  };

  const cycleFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("huge");
    else setFontSize("normal");
  };

  const setContrast = (newContrast: ContrastPreference) => {
    setContrastState(newContrast);
    document.documentElement.dataset.contrast = newContrast;
    try {
      window.localStorage.setItem(CONTRAST_STORAGE_KEY, newContrast);
    } catch {}
  };

  const toggleContrast = () => {
    const next = contrast === "standard" ? "high-contrast" : "standard";
    setContrast(next);
  };

  const setAutoSpeak = (speak: boolean) => {
    setAutoSpeakState(speak);
    try {
      window.localStorage.setItem(AUTO_SPEAK_STORAGE_KEY, String(speak));
    } catch {}
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        cycleFontSize,
        contrast,
        setContrast,
        toggleContrast,
        autoSpeak,
        setAutoSpeak,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      fontSize: "normal" as FontSizePreference,
      setFontSize: () => {},
      cycleFontSize: () => {},
      contrast: "standard" as ContrastPreference,
      setContrast: () => {},
      toggleContrast: () => {},
      autoSpeak: false,
      setAutoSpeak: () => {},
    };
  }
  return context;
}
