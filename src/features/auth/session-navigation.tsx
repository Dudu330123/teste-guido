"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/validation/env";

interface SessionNavigationProps {
  loginLabel?: string;
  showAdmin?: boolean;
  showHistory?: boolean;
  showUpload?: boolean;
}

/** Limita metadados controlados pelo usuário antes de usá-los na navegação. */
export function getSessionDisplayName(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || !("name" in metadata)) return null;
  const name = Reflect.get(metadata, "name");
  if (typeof name !== "string") return null;
  const normalized = name.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, 60) : null;
}

export function SessionNavigation({
  loginLabel = "Entrar ou criar conta",
  showAdmin = false,
  showHistory = true,
  showUpload = true,
}: SessionNavigationProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [ready, setReady] = useState(() => !getSupabaseConfig().configured);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // getUser consulta o Auth e evita tratar apenas a presença local de um token
    // como prova de sessão válida. O listener mantém o cabeçalho sincronizado.
    void supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(Boolean(data.user));
      setDisplayName(getSessionDisplayName(data.user?.user_metadata));
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
      setDisplayName(getSessionDisplayName(session?.user.user_metadata));
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready || !authenticated) {
    return (
      <div className="home-session-actions flex flex-wrap items-center gap-2">
        {showAdmin && (
          <Link href="/admin" className="home-header-link">Admin</Link>
        )}
        {showUpload && (
          <Link href="/enviar-print" className="secondary-action min-h-12 px-4 py-2 font-semibold">
            Enviar print
          </Link>
        )}
        <Link href="/entrar" className="secondary-action min-h-12 px-4 py-2 font-semibold">
          {loginLabel}
        </Link>
      </div>
    );
  }

  return (
    <AuthenticatedNavigation
      displayName={displayName}
      showAdmin={showAdmin}
      showHistory={showHistory}
      showUpload={showUpload}
      onSignedOut={() => {
        setAuthenticated(false);
        setDisplayName(null);
      }}
    />
  );
}

function AuthenticatedNavigation({
  onSignedOut,
  displayName,
  showAdmin,
  showHistory,
  showUpload,
}: {
  onSignedOut: () => void;
  displayName: string | null;
  showAdmin: boolean;
  showHistory: boolean;
  showUpload: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [menuOpen]);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setMenuOpen(false);
    onSignedOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="home-session-navigation" ref={menuRef}>
      <div className="home-session-desktop flex items-center gap-2">
        {showAdmin && <Link href="/admin" className="home-header-link">Admin</Link>}
        <span className="home-session-name px-2 font-semibold" aria-label={displayName ? `Usuário conectado: ${displayName}` : "Usuário conectado"}>
          Olá{displayName ? `, ${displayName}` : "!"}
        </span>
        <Link href="/conta" className="secondary-action min-h-12 px-4 py-2 font-semibold">Minha conta</Link>
        {showUpload && <Link href="/enviar-print" className="secondary-action min-h-12 px-4 py-2 font-semibold">Enviar print</Link>}
        {showHistory && <Link href="/historico" className="secondary-action min-h-12 px-4 py-2 font-semibold">Histórico</Link>}
        <button type="button" className="quiet-action min-h-12 px-4 py-2 font-semibold underline decoration-2 underline-offset-4" onClick={() => void signOut()}>
          Sair
        </button>
      </div>

      <button
        ref={menuButtonRef}
        type="button"
        className="home-account-menu-button"
        aria-expanded={menuOpen}
        aria-controls="home-account-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg>
        <span>Conta</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="home-account-menu-chevron"><path d="m7 10 5 5 5-5"/></svg>
      </button>

      {menuOpen && (
        <div id="home-account-menu" className="home-account-menu-panel" aria-label="Opções da conta">
          <p className="home-account-menu-greeting" aria-label={displayName ? `Usuário conectado: ${displayName}` : "Usuário conectado"}>
            Olá{displayName ? `, ${displayName}` : "!"}
          </p>
          {showAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)}>Administração</Link>}
          <Link href="/conta" onClick={() => setMenuOpen(false)}>Minha conta</Link>
          {showUpload && <Link href="/enviar-print" onClick={() => setMenuOpen(false)}>Enviar print</Link>}
          {showHistory && <Link href="/historico" onClick={() => setMenuOpen(false)}>Histórico</Link>}
          <button type="button" onClick={() => void signOut()}>Sair</button>
        </div>
      )}
    </div>
  );
}
