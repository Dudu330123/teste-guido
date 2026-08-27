import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--narrow">
        <section className="glass-panel internal-empty-state text-center">
          <h1 className="internal-page-title auth-page-title">Página não encontrada</h1>
          <p className="internal-page-description mx-auto">A página não foi encontrada ou ainda não está disponível.</p>
          <Link href="/" className="primary-action mt-7 inline-flex min-h-12 items-center px-6 py-3 font-bold">Voltar ao início</Link>
        </section>
      </div>
    </main>
  );
}
