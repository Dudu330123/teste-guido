import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-3xl font-bold text-[var(--primary-dark)]" aria-label="Guido, página inicial">
          Guido
        </Link>
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-3">
          <Link href="/#ajuda" className="min-h-12 px-4 py-2 font-semibold underline decoration-2 underline-offset-4">
            Preciso de ajuda
          </Link>
          <Link href="/entrar" className="min-h-12 border-2 border-[var(--primary)] px-4 py-2 font-semibold text-[var(--primary-dark)]">
            Entrar ou criar conta
          </Link>
        </nav>
      </div>
    </header>
  );
}
