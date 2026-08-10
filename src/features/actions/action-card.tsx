import Link from "next/link";
import type { Action } from "@/types/content";

export function ActionCard({ action, taskCount }: { action: Action; taskCount: number }) {
  return (
    <article className="glass-panel flex h-full flex-col rounded-3xl p-6">
      <p className="font-bold text-[var(--primary)]">Tarefa digital</p>
      <h3 className="mt-2 text-2xl font-black">{action.title}</h3>
      <p className="mt-3 flex-1 text-[var(--muted)]">{action.description}</p>
      <p className="mt-4 text-base font-bold">{taskCount} versões cadastradas</p>
      <Link href={`/acoes/${action.slug}`} className="primary-action mt-5 min-h-14 px-5 py-3 text-center text-lg font-bold">
        Escolher aplicativo
      </Link>
    </article>
  );
}
