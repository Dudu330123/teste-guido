"use client";

import { useEffect, useState } from "react";
import { SessionNavigation } from "@/features/auth/session-navigation";

type ThemePreference = "light" | "dark" | "system";

const storageKey = "guido-theme";

function isThemePreference(value: string | undefined | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") return preference;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemePreference(preference: ThemePreference, save = true) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  if (save) window.localStorage.setItem(storageKey, preference);
}

export function HomeToolbar() {
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(storageKey);
    const documentPreference = document.documentElement.dataset.themePreference;
    const initialPreference = isThemePreference(storedPreference)
      ? storedPreference
      : isThemePreference(documentPreference) ? documentPreference : "system";
    applyThemePreference(initialPreference, false);

    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      if (document.documentElement.dataset.themePreference === "system") {
        applyThemePreference("system", false);
      }
    };
    media.addEventListener?.("change", followSystem);
    return () => media.removeEventListener?.("change", followSystem);
  }, []);

  useEffect(() => {
    if (!helpOpen) return;

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
      }
    };

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [helpOpen]);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyThemePreference(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="absolute inset-x-4 top-4 z-20 flex flex-wrap items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
        <nav aria-label="Acesso à conta" className="flex flex-wrap gap-2">
          <SessionNavigation loginLabel="Entrar" />
        </nav>
        <nav aria-label="Ações da página inicial" className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="toolbar-action min-h-12 rounded-full px-4 font-bold"
          >
            Ajuda
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar entre modo claro e escuro"
            className="toolbar-action min-h-12 rounded-full px-4 font-bold"
          >
            Claro / escuro
          </button>
        </nav>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-help-title"
            className="glass-panel w-full max-w-lg rounded-3xl p-6 text-[var(--foreground)] sm:p-8"
          >
            <h2 id="home-help-title" className="text-3xl font-bold">Como usar o Guido</h2>
            <p className="mt-4">Digite o que você deseja fazer ou escolha um dos exemplos abaixo da pesquisa.</p>
            <p className="mt-4 font-bold">Nunca informe senhas, códigos ou dados bancários.</p>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="primary-action mt-6 min-h-12 w-full rounded-full px-5 font-bold"
            >
              Fechar ajuda
            </button>
          </section>
        </div>
      )}
    </>
  );
}
