import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { TaskGuideSetup } from "@/features/guides/task-guide-setup";
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
    <div className="guido-home internal-page task-setup-shell">
      <SiteHeader showAdmin={false} />
      {task.availability !== "preparing" ? (
        <TaskGuideSetup
          taskId={task.id}
          taskSlug={task.slug}
          taskTitle={task.title}
          description={task.description}
          safetyWarning={task.safetyWarning}
          application={{ slug: application.slug, name: application.name, logoPath: application.logoPath }}
          applicationOptions={application.slug === "banco-demonstracao"
            ? bankApplications.map(({ slug: applicationSlug, name, logoPath }) => ({ slug: applicationSlug, name, logoPath }))
            : undefined}
        />
      ) : (
        <main className="task-setup-page"><div className="glass-panel internal-page-card internal-page-card--preparing"><h1 className="internal-page-card-title">Guia em preparação</h1><p className="internal-page-card-description">Esta tarefa ainda está em revisão e não possui passos validados.</p></div></main>
      )}
    </div>
  );
}
