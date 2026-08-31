import Link from "next/link";
import type { ReactNode } from "react";
import type { Action } from "@/types/content";

const iconPaths: Record<string, ReactNode> = {
  pix: (
    <>
      <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
    </>
  ),
  boleto: (
    <>
      <path d="M5 4v16M9 4v16M12 4v16M16 4v16M19 4v16" />
    </>
  ),
  comprovante: (
    <>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v5h4M10 14l2 2 4-5" />
    </>
  ),
  "bloquear-cartao": (
    <>
      <rect x="3" y="5" width="18" height="13" rx="2" />
      <path d="M3 9h18M14 14v-1.5a2 2 0 0 1 4 0V14M13 14h6v5h-6z" />
    </>
  ),
  saldo: (
    <>
      <path d="M4 7.5h15a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12v4" />
      <path d="M15 12h6M17 15h.01" />
    </>
  ),
  limite: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="m12 17 4-5M7 17h10" />
    </>
  ),
};

export function ActionIcon({ slug }: { slug: string }) {
  return (
    <svg
      aria-hidden="true"
      className="action-card-icon-svg"
      data-action-icon={slug}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {iconPaths[slug] ?? iconPaths.comprovante}
    </svg>
  );
}

export function ActionCard({ action, taskCount }: { action: Action; taskCount: number }) {
  return (
    <article className="glass-panel internal-page-card">
      <div className={`internal-page-card-icon action-card-icon action-card-icon--${action.slug}`}>
        <ActionIcon slug={action.slug} />
      </div>
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
