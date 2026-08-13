import Link from "next/link";
import { SessionNavigation } from "@/features/auth/session-navigation";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-transparent">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="text-3xl font-bold text-[var(--primary-dark)]" aria-label="Guido, página inicial">
          Guido
        </Link>
        <nav aria-label="Navegação principal" className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <Link href="/#ajuda" className="quiet-action min-h-12 px-4 py-2 font-semibold underline decoration-2 underline-offset-4">
            Preciso de ajuda
          </Link>
          <SessionNavigation />
        </nav>
      </div>
    </header>
  );
}
