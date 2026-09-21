import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getActionForTask } from "@/data/actions";
import { applications, isBankCategory } from "@/data/applications";
import { tasks } from "@/data/guides";
import { TaskGuideSetup } from "@/features/guides/task-guide-setup";
import { safeReturnPath, withReturnPath } from "@/lib/navigation/return-path";
import { findSharedBankTask, getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/catalog";

interface TaskPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ app?: string | string[]; returnTo?: string }>;
}

export const metadata: Metadata = { title: "Escolha seu celular" };

export default async function TaskPage({ params, searchParams }: TaskPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const requestedApplicationSlug = Array.isArray(query.app) ? query.app[0] : query.app;
  const returnTo = query.returnTo;
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const task = catalog.tasks.find((item) => item.slug === slug);
  if (!task) notFound();
  const taskApplication = catalog.applications.find((item) => item.id === task.applicationId);
  if (!taskApplication) notFound();
  const selectedApplication = requestedApplicationSlug
    ? catalog.applications.find((item) => item.slug === requestedApplicationSlug && isBankCategory(item.category))
    : undefined;
  const application = selectedApplication ?? taskApplication;
  const bankApplications = catalog.applications.filter((item) =>
    isBankCategory(item.category) && item.slug !== "banco-demonstracao");
  const isGenericBankTask = taskApplication.slug === "banco-demonstracao" && !selectedApplication;
  const defaultBackHref = isGenericBankTask ? "/" : `/aplicativos/${application.slug}`;
  const backHref = safeReturnPath(returnTo, defaultBackHref);

  const taskAction = getActionForTask(task);
  if (task.availability === "preparing" && taskApplication.slug !== "banco-demonstracao" && taskAction) {
    const genericTask = findSharedBankTask(catalog, taskAction.id);
    if (genericTask && genericTask.availability !== "preparing") {
      // Links antigos podem apontar para uma tarefa específica do banco. Como o
      // roteiro publicado é compartilhado por ação, redirecionamos para a versão
      // genérica e preservamos o banco escolhido no contexto do guia.
      const genericPath = `/tarefas/${genericTask.slug}?app=${encodeURIComponent(application.slug)}`;
      redirect(withReturnPath(genericPath, returnTo ? backHref : undefined));
    }
  }

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
        returnTo={returnTo ? backHref : undefined}
      />
    </div>
  );
}
