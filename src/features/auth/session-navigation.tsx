"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/validation/env";

interface SessionNavigationProps {
  loginLabel?: string;
  showHistory?: boolean;
}

export function SessionNavigation({
  loginLabel = "Entrar ou criar conta",
  showHistory = true,
}: SessionNavigationProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(() => !getSupabaseConfig().configured);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // getUser consulta o Auth e evita tratar apenas a presença local de um token
    // como prova de sessão válida. O listener mantém o cabeçalho sincronizado.
    void supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(Boolean(data.user));
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready || !authenticated) {
    return (
      <Link href="/entrar" className="secondary-action min-h-12 px-4 py-2 font-semibold">
        {loginLabel}
      </Link>
    );
  }

  return <AuthenticatedNavigation showHistory={showHistory} onSignedOut={() => setAuthenticated(false)} />;
}

function AuthenticatedNavigation({
  onSignedOut,
  showHistory,
}: {
  onSignedOut: () => void;
  showHistory: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/conta" className="secondary-action min-h-12 px-4 py-2 font-semibold">
        Minha conta
      </Link>
      {showHistory && (
        <Link href="/historico" className="secondary-action min-h-12 px-4 py-2 font-semibold">
          Histórico
        </Link>
      )}
      <button
        type="button"
        className="quiet-action min-h-12 px-4 py-2 font-semibold underline decoration-2 underline-offset-4"
        onClick={async () => {
          const supabase = getSupabaseBrowserClient();
          if (!supabase) return;
          await supabase.auth.signOut();
          onSignedOut();
          router.push("/");
          router.refresh();
        }}
      >
        Sair
      </button>
    </div>
  );
}
