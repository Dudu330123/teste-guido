import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { TaskGuideSetup } from "@/features/guides/task-guide-setup";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/supabase/catalog";

interface TaskPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ app?: string | string[] }>;
}

export const metadata: Metadata = { title: "Escolha seu celular" };

export default async function TaskPage({ params, searchParams }: TaskPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const requestedApplicationSlug = Array.isArray(query.app) ? query.app[0] : query.app;
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const task = catalog.tasks.find((item) => item.slug === slug);
  if (!task) notFound();
  const taskApplication = catalog.applications.find((item) => item.id === task.applicationId);
  const application = taskApplication?.slug === "banco-demonstracao" && requestedApplicationSlug
    ? catalog.applications.find((item) => item.slug === requestedApplicationSlug) ?? taskApplication
    : taskApplication;
  if (!application) notFound();
  const bankApplications = catalog.applications.filter((item) =>
    item.category === "Serviços financeiros" && item.slug !== "banco-demonstracao");

  return (
    <div className="guido-home internal-page task-setup-shell">
      <SiteHeader showAdmin={false} />
      <TaskGuideSetup
        taskId={task.id}
        taskSlug={task.slug}
        taskTitle={task.title}
        description={task.description}
        safetyWarning={task.safetyWarning}
        application={{ slug: application.slug, name: application.name, logoPath: application.logoPath }}
        applicationOptions={taskApplication?.slug === "banco-demonstracao"
          ? bankApplications.map(({ slug: applicationSlug, name, logoPath }) => ({ slug: applicationSlug, name, logoPath }))
          : undefined}
        selectedApplicationSlug={application.slug}
        canContinue={task.availability !== "preparing"}
      />
    </div>
  );
}
