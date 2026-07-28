import Link from "next/link";
import type { Application } from "@/types/content";

interface ApplicationCardProps {
  application: Application;
  taskCount: number;
}

export function ApplicationCard({ application, taskCount }: ApplicationCardProps) {
  const available = application.status === "available";

  return (
    <article className="flex h-full flex-col rounded-2xl border-2 border-[var(--border)] bg-white p-6 shadow-sm">
      <div aria-hidden="true" className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#e8f0ff] text-2xl font-bold text-[var(--primary-dark)]">
        {application.name.slice(0, 2).toUpperCase()}
      </div>
      <p className="mb-1 text-base font-semibold text-[var(--muted)]">{application.category}</p>
      <h3 className="text-2xl font-bold">{application.name}</h3>
      <p className="mt-2 flex-1">{application.description}</p>
      <p className="mt-4 font-semibold">
        {taskCount} {taskCount === 1 ? "tarefa cadastrada" : "tarefas cadastradas"}
      </p>
      <p className="mt-1 text-base">
        Status: <strong>{available ? "demonstração disponível" : "em preparação"}</strong>
      </p>
      <Link href={`/aplicativos/${application.slug}`} className="mt-5 min-h-12 bg-[var(--primary)] px-5 py-3 text-center font-bold text-white hover:bg-[var(--primary-dark)]">
        {available ? "Ver tarefa" : "Ver detalhes"}
      </Link>
    </article>
  );
}
