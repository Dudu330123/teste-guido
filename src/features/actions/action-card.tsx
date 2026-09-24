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
  "enviar-pix-chave": (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 7.2-7.2M16 7l2 2M14 9l1 1" />
    </>
  ),
  "pagar-pix-qr-code": (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h3M20 14v3" />
    </>
  ),
  "cobrar-via-pix": (
    <>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  ),
  "pagar-conta-codigo-barras": (
    <>
      <path d="M4 5v14M8 5v14M11 5v14M15 5v14M18 5v14M21 5v14" />
    </>
  ),
  "trocar-senha-app-banco": (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4M12 15v3" />
    </>
  ),
  "falar-atendimento-banco-app": (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
      <div className="internal-page-card-icon action-card-icon">
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
