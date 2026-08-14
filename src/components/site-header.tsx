import Link from "next/link";
import { SessionNavigation } from "@/features/auth/session-navigation";
import { getSuperadminAccess } from "@/lib/supabase/admin";

interface SiteHeaderProps {
  showAdmin?: boolean;
}

export async function SiteHeader({ showAdmin }: SiteHeaderProps = {}) {
  // Uma página já protegida pode informar o resultado e evitar uma segunda
  // consulta; todas as demais confirmam o papel no servidor antes de renderizar.
  const canAccessAdmin = showAdmin ?? Boolean(await getSuperadminAccess());

  return (
    <header className="border-b border-[var(--border)] bg-transparent">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="text-3xl font-bold text-[var(--primary-dark)]" aria-label="Guido, página inicial">
          Guido
        </Link>
        <nav aria-label="Navegação principal" className="ml-auto flex flex-wrap items-center justify-end gap-3">
          {canAccessAdmin && (
            <Link href="/admin" className="quiet-action min-h-12 px-4 py-2 font-semibold">
              Admin
            </Link>
          )}
          <Link href="/#ajuda" className="quiet-action min-h-12 px-4 py-2 font-semibold underline decoration-2 underline-offset-4">
            Preciso de ajuda
          </Link>
          <SessionNavigation />
        </nav>
      </div>
    </header>
  );
}
