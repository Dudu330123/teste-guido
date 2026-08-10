import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { OsSelector } from "@/features/guides/os-selector";

interface TaskPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Escolha seu celular" };

export default async function TaskPage({ params }: TaskPageProps) {
  const { slug } = await params;
  const task = tasks.find((item) => item.slug === slug);
  if (!task) notFound();
  const application = applications.find((item) => item.id === task.applicationId);
  if (!application) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link href={`/aplicativos/${application.slug}`} className="font-bold underline">← Voltar para tarefas</Link>
        <p className="mt-8 font-semibold text-[var(--primary)]">Guia educativo</p>
        <h1 className="text-4xl font-bold">{task.title}</h1>
        <p className="mt-3 text-xl">{task.description}</p>
        {task.availability === "demo" ? (
          <OsSelector />
        ) : (
          <div className="glass-panel mt-7 rounded-2xl p-6">
            <h2 className="text-2xl font-bold">Guia em preparação</h2>
            <p className="mt-2">Esta tarefa foi cadastrada para pesquisa, mas ainda não possui passos revisados para Android ou iPhone.</p>
          </div>
        )}
      </main>
    </>
  );
}
