import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { applications, isBankCategory } from "@/data/applications";
import { tasks } from "@/data/guides";
import { OsSelector } from "@/features/guides/os-selector";
import { safeReturnPath, withReturnPath } from "@/lib/navigation/return-path";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/supabase/catalog";

interface TaskPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ app?: string; returnTo?: string }>;
}

export const metadata: Metadata = { title: "Escolha seu celular" };

export default async function TaskPage({ params, searchParams }: TaskPageProps) {
  const { slug } = await params;
  const { app, returnTo } = searchParams ? await searchParams : {};
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const task = catalog.tasks.find((item) => item.slug === slug);
  if (!task) notFound();
  const taskApplication = catalog.applications.find((item) => item.id === task.applicationId);
  if (!taskApplication) notFound();
  const selectedApplication = app
    ? catalog.applications.find((item) => item.slug === app && isBankCategory(item.category))
    : undefined;
  const application = selectedApplication ?? taskApplication;
  const bankApplications = catalog.applications.filter((item) =>
    isBankCategory(item.category) && item.slug !== "banco-demonstracao");
  const isGenericBankTask = taskApplication.slug === "banco-demonstracao" && !selectedApplication;
  // O boleto começa pelo aparelho para que a segunda tela possa listar os
  // aplicativos no mesmo catálogo visual usado pela ação Pix.
  const chooseApplicationAfterDevice = isGenericBankTask && task.actionId === "boleto";
  const defaultBackHref = isGenericBankTask ? "/" : `/aplicativos/${application.slug}`;
  const backHref = safeReturnPath(returnTo, defaultBackHref);

  if (task.availability === "preparing" && task.applicationId !== "app-demo-bancos" && task.actionId) {
    const genericTask = catalog.tasks.find((item) =>
      item.applicationId === "app-demo-bancos" && item.actionId === task.actionId,
    );
    if (genericTask) {
      // Links antigos podem apontar para uma tarefa específica do banco. Como o
      // roteiro publicado é compartilhado por ação, redirecionamos para a versão
      // genérica e preservamos o banco escolhido no contexto do guia.
      const genericPath = `/tarefas/${genericTask.slug}?app=${encodeURIComponent(application.slug)}`;
      redirect(withReturnPath(genericPath, returnTo ? backHref : undefined));
    }
  }

  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--narrow">
        <Link href={backHref} className="internal-page-back">← Voltar para tarefas</Link>
        <header className="internal-page-intro">
          <p className="internal-page-eyebrow">Guia educativo</p>
          <h1 className="internal-page-title">{task.title}</h1>
          <p className="internal-page-description">{task.description}</p>
        </header>
        {task.availability !== "preparing" ? (
          <OsSelector
            taskSlug={task.slug}
            applicationOptions={isGenericBankTask && !chooseApplicationAfterDevice
              ? bankApplications.map(({ slug: applicationSlug, name }) => ({ slug: applicationSlug, name }))
              : undefined}
            initialApplicationSlug={selectedApplication?.slug}
            nextPath={chooseApplicationAfterDevice ? `/acoes/${task.actionId}` : undefined}
            returnTo={returnTo ? backHref : undefined}
          />
        ) : (
          <div className="glass-panel internal-page-card internal-page-card--preparing">
            <h2 className="internal-page-card-title">Guia em preparação</h2>
            <p className="internal-page-card-description">Esta tarefa ainda está em revisão e não possui passos validados.</p>
          </div>
        )}
      </div>
    </main>
  );
}
