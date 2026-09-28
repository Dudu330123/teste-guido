"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mic } from "lucide-react";
import { SessionNavigation } from "@/features/auth/session-navigation";
import { useAccessibility } from "@/features/accessibility/accessibility-context";
import { AskGuidoModal } from "@/features/ai/ask-guido-modal";

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
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = resolved === "dark" ? "#01040c" : "#eaf3fc";
    meta.removeAttribute("media");
  });
  if (save) window.localStorage.setItem(storageKey, preference);
}

export type HomeActivePage = "home" | "explore" | "guides";

interface HomeToolbarProps {
  activePage?: HomeActivePage;
  showAdmin?: boolean;
  /** Compact toolbar used by the step-by-step guide reader. */
  variant?: "home" | "guide";
  guideLeft?: ReactNode;
  guideActions?: ReactNode;
  onOpenAskGuido?: () => void;
}

function ThemeToggleButton({
  onClick,
  className = "home-icon-button",
  showLabel = false,
}: {
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Alternar entre modo claro e escuro"
      className={className}
      title="Alternar entre modo claro e escuro"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="home-theme-sun size-5 fill-none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="home-theme-moon size-5 fill-none" stroke="currentColor" strokeWidth="2">
        <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5 8.5 8.5 0 1 0 20.5 14.6Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showLabel && <span className="home-theme-bottom-text">Modo claro / escuro</span>}
    </button>
  );
}

export function HomeToolbar({
  activePage,
  showAdmin = false,
  variant = "home",
  guideLeft,
  guideActions,
  onOpenAskGuido,
}: HomeToolbarProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [askGuidoOpen, setAskGuidoOpen] = useState(false);
  const { fontSize, cycleFontSize, toggleContrast } = useAccessibility();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const helpCloseRef = useRef<HTMLButtonElement>(null);

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

    helpCloseRef.current?.focus();

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        helpButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [helpOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyThemePreference(currentTheme === "dark" ? "light" : "dark");
  };

  if (variant === "guide") {
    return (
      <header className="guide-toolbar">
        <div className="guide-toolbar-left">{guideLeft}</div>
        <div className="guide-toolbar-actions flex items-center gap-2">
          <button
            type="button"
            onClick={cycleFontSize}
            className="guide-theme-toggle guide-theme-toggle--font flex items-center justify-center font-black text-sm"
            aria-label="Ajustar tamanho da letra"
            title="Ajustar tamanho da letra"
          >
            {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
          </button>
          <button
            type="button"
            onClick={toggleContrast}
            className="guide-theme-toggle guide-theme-toggle--contrast flex items-center justify-center font-black text-sm"
            aria-label="Alternar alto contraste"
            title="Alternar alto contraste"
          >
            ◐
          </button>
          {guideActions}
          <ThemeToggleButton onClick={toggleTheme} className="guide-theme-toggle" />
        </div>
      </header>
    );
  }

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
              sizes="(max-width: 640px) 115px, 145px"
              priority
            />
            <Image
              src="/images/home/logo-guido-branca-dark.png"
              alt="Guido"
              width={1184}
              height={308}
              className="home-logo-dark"
              sizes="(max-width: 640px) 115px, 145px"
              priority
            />
          </span>
        </Link>

        {/* Menu central com apenas: Início, Explorar, Criar e editar guias, Sobre */}
        <nav id="home-main-navigation" aria-label="Navegação principal" className={`home-main-nav${mobileMenuOpen ? " is-open" : ""}`}>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-current={activePage === "home" ? "page" : undefined}
          >
            Início
          </Link>
          <Link
            href="/explorar"
            onClick={() => setMobileMenuOpen(false)}
            aria-current={activePage === "explore" ? "page" : undefined}
          >
            Explorar
          </Link>
          <Link
            href="/admin/guias/preview"
            onClick={() => setMobileMenuOpen(false)}
            aria-current={activePage === "guides" ? "page" : undefined}
          >
            Criar e editar guias
          </Link>
          <button
            ref={helpButtonRef}
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setHelpOpen(true);
            }}
            className="home-nav-button"
            aria-current={helpOpen ? "page" : undefined}
            aria-expanded={helpOpen}
          >
            Sobre
          </button>
          {showAdmin && (
            <Link href="/admin/guias/preview" className="home-admin-tool-link">
              Tarefas automáticas
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenAskGuido) {
                onOpenAskGuido();
              } else {
                setAskGuidoOpen(true);
              }
            }}
            className="home-nav-button home-nav-button--guido-mobile"
          >
            <Mic className="size-4.5 shrink-0 text-sky-400" aria-hidden="true" />
            <span>Falar com o Guido</span>
          </button>
        </nav>

        {/* Lado direito: Botão Guido no Cabeçalho e Botão Entrar */}
        <nav id="home-account-navigation" aria-label="Acesso à conta e assistente" className={`home-account-nav${mobileMenuOpen ? " is-open" : ""}`}>
          {/* Botão Guido no Cabeçalho */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenAskGuido) {
                onOpenAskGuido();
              } else {
                setAskGuidoOpen(true);
              }
            }}
            className="home-ask-button"
            aria-label="Falar com o Guido por voz"
            title="Falar com o Guido por voz"
          >
            <span className="home-ask-icon-badge" aria-hidden="true">
              <Mic className="size-3.5 text-white animate-pulse" />
            </span>
            <span className="home-ask-full-label">Falar com o Guido</span>
            <span className="home-ask-short-label">Guido</span>
          </button>

          {/* Botão Entrar */}
          <SessionNavigation loginLabel="Entrar" showAdmin={showAdmin} showUpload={false} />
        </nav>

        {/* Botão Hambúrguer Mobile */}
        <button
          type="button"
          ref={menuButtonRef}
          className="home-mobile-menu-button"
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="home-main-navigation home-account-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Botão de alternar tema claro/escuro */}
      <div className="home-bottom-theme-dock">
        <ThemeToggleButton onClick={toggleTheme} className="home-theme-bottom-btn" showLabel />
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-help-title"
            className="home-bank-modal w-full max-w-lg rounded-3xl p-6 text-[var(--foreground)] sm:p-8"
          >
            <h2 id="home-help-title" className="text-2xl font-bold">Como usar o Guido</h2>
            <p className="mt-4 text-slate-200">
              Escolha uma categoria na tela inicial para ver os guias passo a passo de cada aplicativo.
            </p>
            <p className="mt-4 font-bold text-blue-300">
              O Guido nunca solicita senhas, códigos de segurança ou dados bancários.
            </p>
            <button
              ref={helpCloseRef}
              type="button"
              onClick={() => {
                setHelpOpen(false);
                helpButtonRef.current?.focus();
              }}
              className="primary-action mt-6 min-h-12 w-full rounded-full px-5 font-bold"
            >
              Fechar ajuda
            </button>
          </section>
        </div>
      )}

      {!onOpenAskGuido && askGuidoOpen && (
        <AskGuidoModal
          isOpen={askGuidoOpen}
          initialListening={true}
          onClose={() => setAskGuidoOpen(false)}
        />
      )}
    </>
  );
}
