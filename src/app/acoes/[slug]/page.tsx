import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getActionBySlug } from "@/data/actions";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { ApplicationLogo } from "@/features/applications/application-logo";
import { safeReturnPath, withReturnPath } from "@/lib/navigation/return-path";

interface ActionPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
}

export const metadata: Metadata = { title: "Escolher aplicativo" };

export default async function ActionPage({ params, searchParams }: ActionPageProps) {
  const { slug } = await params;
  const { returnTo } = searchParams ? await searchParams : {};
  const action = getActionBySlug(slug);
  if (!action) notFound();
  const backHref = safeReturnPath(returnTo, "/explorar");
  const contextReturnTo = returnTo ? backHref : undefined;

  const actionTasks = tasks.filter((task) => task.actionId === action.id);
  const applicationIds = [...new Set(actionTasks.map((task) => task.applicationId))];
  const availableApplications = applicationIds
    .map((applicationId) => applications.find((application) => application.id === applicationId))
    .filter((application) => application !== undefined);

  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--wide">
        <Link href={backHref} className="internal-page-back">← Voltar para tarefas</Link>
        <header className="internal-page-intro">
          <p className="internal-page-eyebrow">Escolha seu banco</p>
          <h1 className="internal-page-title">{action.title}</h1>
          <p className="internal-page-description">{action.description}</p>
        </header>
        <div role="note" className="notice-info internal-page-notice">
          <strong>Importante:</strong> as opções em preparação ainda não são tutoriais validados e dependem de pesquisa oficial e revisão humana.
        </div>

        <section aria-label="Bancos cadastrados" className="internal-page-grid internal-page-grid--three">
          {availableApplications.map((application) => {
            const applicationTask = actionTasks.find((task) => task.applicationId === application.id)!;
            const isDemo = applicationTask.availability === "demo";
            return (
              <article key={application.id} className="glass-panel internal-page-card">
                <div className="internal-page-card-icon application-logo">
                  <ApplicationLogo application={application} />
                </div>
                <h2 className="internal-page-card-title">{application.name}</h2>
                <p className="internal-page-card-description">{applicationTask.description}</p>
                <p className="soft-panel internal-page-card-status">
                  {isDemo ? "Demonstração disponível" : "Guia em preparação"}
                </p>
                <Link
                  href={withReturnPath(`/tarefas/${applicationTask.slug}`, contextReturnTo)}
                  className="secondary-action internal-page-card-action"
                >
                  {isDemo ? "Abrir demonstração" : "Ver guias deste banco"}
                </Link>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
