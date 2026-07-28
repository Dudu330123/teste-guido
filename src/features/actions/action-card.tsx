import Link from "next/link";
import type { Action } from "@/types/content";

export function ActionCard({ action, taskCount }: { action: Action; taskCount: number }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border-2 border-[var(--border)] bg-white p-6 shadow-sm">
      <p className="font-bold text-[var(--primary)]">Tarefa digital</p>
      <h3 className="mt-2 text-2xl font-black">{action.title}</h3>
      <p className="mt-3 flex-1 text-[var(--muted)]">{action.description}</p>
      <p className="mt-4 text-base font-bold">{taskCount} versões cadastradas</p>
      <Link href={`/acoes/${action.slug}`} className="mt-5 min-h-14 bg-[var(--primary)] px-5 py-3 text-center text-lg font-bold text-white hover:bg-[var(--primary-dark)]">
        Escolher aplicativo
      </Link>
    </article>
  );
}
