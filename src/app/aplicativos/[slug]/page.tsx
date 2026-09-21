import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getActionForTask } from "@/data/actions";
import { applications, getApplicationBySlug, getCategoryLabel } from "@/data/applications";
import { tasks } from "@/data/guides";
import { findSharedBankTask, getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/catalog";
import { safeReturnPath, withReturnPath } from "@/lib/navigation/return-path";

interface ApplicationPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
}

export const metadata: Metadata = { title: "Tarefas do aplicativo" };

export default async function ApplicationPage({ params, searchParams }: ApplicationPageProps) {
  const { slug } = await params;
  const { returnTo } = searchParams ? await searchParams : {};
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const application = catalog.applications.find((item) => item.slug === slug) ?? getApplicationBySlug(slug);
  if (!application) notFound();
  if (application.slug === "banco-demonstracao") {
    // A demonstração é um contexto de guia, não um aplicativo com catálogo
    // próprio. Links antigos para esta rota voltam à origem em vez de exibir
    // uma tela intermediária que não ajuda a pessoa a continuar.
    redirect(safeReturnPath(returnTo, "/"));
  }
  const applicationTasks = catalog.tasks.filter((task) => task.applicationId === application.id);
  const backHref = safeReturnPath(returnTo, "/explorar");

  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--compact">
        <Link href={returnTo ? backHref : "/"} className="internal-page-back">← Voltar ao catálogo</Link>
        <header className="internal-page-intro">
          <p className="internal-page-eyebrow">{getCategoryLabel(application.category)}</p>
          <h1 className="internal-page-title">{application.name}</h1>
          <p className="internal-page-description">{application.description}</p>
        </header>

        <section aria-labelledby="tasks-title" className="internal-page-section">
          <h2 id="tasks-title" className="internal-page-section-title">Tarefas</h2>
          {applicationTasks.length > 0 ? (
            <div className="internal-page-list">
              {applicationTasks.map((task) => {
                const action = getActionForTask(task);
                const sharedTask = task.availability === "preparing" && action
                  ? findSharedBankTask(catalog, action.id)
                  : undefined;
                const visibleTask = sharedTask && sharedTask.availability !== "preparing" ? sharedTask : task;
                const usesSharedGuide = visibleTask !== task;
                const taskPath = usesSharedGuide
                  ? `/tarefas/${visibleTask.slug}?app=${encodeURIComponent(application.slug)}`
                  : `/tarefas/${visibleTask.slug}`;
                return (
                  <article key={task.id} className="glass-panel internal-page-card internal-page-card--task">
                    <h3 className="internal-page-card-title">{task.title}</h3>
                    <p className="internal-page-card-description">{task.description}</p>
                    <p className="notice-info internal-page-card-notice">{visibleTask.safetyWarning}</p>
                    {visibleTask.availability !== "preparing" ? (
                      <>
                        {visibleTask.availability === "demo" && (
                          <p className="soft-panel internal-page-card-status internal-page-card-status--inline">
                            Demonstração educativa disponível
                          </p>
                        )}
                        <Link href={withReturnPath(taskPath, returnTo ? backHref : undefined)} className="primary-action internal-page-card-action internal-page-card-action--start">
                          Escolher meu celular
                        </Link>
                      </>
                    ) : (
                      <p className="soft-panel internal-page-card-status internal-page-card-status--inline">
                        Guia em preparação
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel internal-page-card">
              <p className="internal-page-card-title">Guia em preparação</p>
              <p className="internal-page-card-description">Ainda não há um guia validado para esta versão.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
