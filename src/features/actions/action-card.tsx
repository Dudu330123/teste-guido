import Link from "next/link";
import type { Action } from "@/types/content";

export function ActionCard({ action, taskCount }: { action: Action; taskCount: number }) {
  return (
    <article className="glass-panel internal-page-card">
      <p className="internal-page-eyebrow">Tarefa digital</p>
      <h2 className="internal-page-card-title">{action.taskTitle}</h2>
      <p className="internal-page-card-description">{action.description}</p>
      <p className="internal-page-card-meta">{taskCount} versões cadastradas</p>
      <Link href={`/acoes/${action.slug}`} className="primary-action internal-page-card-action">
        Escolher aplicativo
      </Link>
    </article>
  );
}
