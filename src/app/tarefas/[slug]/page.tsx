import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { OsSelector } from "@/features/guides/os-selector";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/supabase/catalog";

interface TaskPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Escolha seu celular" };

export default async function TaskPage({ params }: TaskPageProps) {
  const { slug } = await params;
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const task = catalog.tasks.find((item) => item.slug === slug);
  if (!task) notFound();
  const application = catalog.applications.find((item) => item.id === task.applicationId);
  if (!application) notFound();
  const bankApplications = catalog.applications.filter((item) =>
    item.category === "Serviços financeiros" && item.slug !== "banco-demonstracao");

  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--narrow">
        <Link href={`/aplicativos/${application.slug}`} className="internal-page-back">← Voltar para tarefas</Link>
        <header className="internal-page-intro">
          <p className="internal-page-eyebrow">Guia educativo</p>
          <h1 className="internal-page-title">{task.title}</h1>
          <p className="internal-page-description">{task.description}</p>
        </header>
        {task.availability !== "preparing" ? (
          <OsSelector
            taskSlug={task.slug}
            applicationOptions={application.slug === "banco-demonstracao"
              ? bankApplications.map(({ slug: applicationSlug, name }) => ({ slug: applicationSlug, name }))
              : undefined}
          />
        ) : (
          <div className="glass-panel internal-page-card internal-page-card--preparing">
            <h2 className="internal-page-card-title">Guia em preparação</h2>
            <p className="internal-page-card-description">Esta tarefa foi cadastrada para pesquisa, mas ainda não possui passos revisados para Android ou iPhone.</p>
          </div>
        )}
      </div>
    </main>
  );
}
