"use client";

import Image from "next/image";
import Link from "next/link";
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

interface HomeToolbarProps {
  activePage?: "home" | "explore";
  showAdmin?: boolean;
}

export function HomeToolbar({ activePage = "home", showAdmin = false }: HomeToolbarProps) {
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
      <header className="home-header">
        <Link href="/" className="home-brand" aria-label="Guido, página inicial">
          <span className="home-brand-logo">
            <Image
              src="/images/home/logo-guido-azul-marinho.png"
              alt="Guido"
              width={2076}
              height={757}
              className="home-logo-light"
              priority
            />
            <Image
              src="/images/home/logo-guido-branca-dark.png"
              alt=""
              width={1184}
              height={308}
              className="home-logo-dark"
              priority
            />
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="home-main-nav">
          <Link href="/" aria-current={activePage === "home" ? "page" : undefined}>Início</Link>
          <Link href="/explorar" aria-current={activePage === "explore" ? "page" : undefined}>Explorar</Link>
          <Link href="/enviar-print">Enviar print</Link>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="home-nav-button"
          >
            Sobre
          </button>
          {showAdmin && (
            <Link href="/admin/guias/preview" className="home-admin-tool-link">
              Tarefas automáticas
            </Link>
          )}
        </nav>

        <nav aria-label="Acesso à conta e aparência" className="home-account-nav">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar entre modo claro e escuro"
            className="home-icon-button"
            title="Alternar modo claro e escuro"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="home-theme-sun size-6 fill-none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42" strokeLinecap="round" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="home-theme-moon size-6 fill-none" stroke="currentColor" strokeWidth="2">
              <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5 8.5 8.5 0 1 0 20.5 14.6Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showAdmin && (
            <Link href="/admin" className="home-header-link">Admin</Link>
          )}
          <SessionNavigation loginLabel="Entrar" showUpload={false} />
        </nav>
      </header>

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
