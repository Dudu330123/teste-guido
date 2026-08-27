import type { Metadata } from "next";
import Link from "next/link";
import { actions } from "@/data/actions";
import { tasks } from "@/data/guides";
import { ActionCard } from "@/features/actions/action-card";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Escolha uma tarefa bancária",
  description: "Escolha o que você quer fazer no seu banco.",
};

export default function BanksPage() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--wide">
        <Link href="/" className="internal-page-back">← Voltar ao início</Link>
        <header className="internal-page-intro">
          <p className="internal-page-eyebrow">Bancos e serviços financeiros</p>
          <h1 className="internal-page-title">Escolha o que você quer fazer.</h1>
          <p className="internal-page-description">Selecione uma tarefa para encontrar as orientações do seu banco.</p>
        </header>

        <section aria-labelledby="bank-actions-title" className="internal-page-section">
          <h2 id="bank-actions-title" className="internal-page-section-title">Tarefas bancárias</h2>
          <div className="internal-page-grid internal-page-grid--three">
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                taskCount={tasks.filter((task) => task.actionId === action.id).length}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
