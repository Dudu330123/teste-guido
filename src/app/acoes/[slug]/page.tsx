import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getActionBySlug } from "@/data/actions";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";

interface ActionPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Escolher aplicativo" };

export default async function ActionPage({ params }: ActionPageProps) {
  const { slug } = await params;
  const action = getActionBySlug(slug);
  if (!action) notFound();

  const actionTasks = tasks.filter((task) => task.actionId === action.id);
  const applicationIds = [...new Set(actionTasks.map((task) => task.applicationId))];
  const availableApplications = applicationIds
    .map((applicationId) => applications.find((application) => application.id === applicationId))
    .filter((application) => application !== undefined);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/#actions-title" className="font-bold underline">← Voltar para tarefas</Link>
        <p className="mt-8 font-semibold text-[var(--primary)]">Escolha o aplicativo</p>
        <h1 className="text-4xl font-black sm:text-5xl">{action.title}</h1>
        <p className="mt-3 max-w-3xl text-xl">{action.description}</p>
        <div role="note" className="mt-6 rounded-2xl border-2 border-[#a66a00] bg-[#fff3cf] p-5">
          <strong>Importante:</strong> opções em preparação não são tutoriais e ainda precisam de pesquisa oficial e revisão humana.
        </div>

        <section aria-label="Aplicativos cadastrados" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {availableApplications.map((application) => {
            const applicationTask = actionTasks.find((task) => task.applicationId === application.id)!;
            const isDemo = applicationTask.availability === "demo";
            return (
              <article key={application.id} className="flex flex-col rounded-3xl border-2 border-[var(--border)] bg-white p-6 shadow-sm">
                <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-2xl bg-[#e8f0ff] text-xl font-black text-[var(--primary-dark)]">
                  {application.name.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="mt-4 text-2xl font-black">{application.name}</h2>
                <p className="mt-2 flex-1">{applicationTask.description}</p>
                <p className={`mt-4 rounded-xl border-2 p-3 font-bold ${isDemo ? "border-[var(--primary)] bg-[#eef4ff]" : "border-[var(--border)] bg-[#f5f7fb]"}`}>
                  {isDemo ? "Demonstração não validada" : "Em preparação"}
                </p>
                <Link
                  href={isDemo ? `/tarefas/${applicationTask.slug}` : `/aplicativos/${application.slug}`}
                  className="mt-4 min-h-12 border-2 border-[var(--primary)] px-4 py-3 text-center font-bold text-[var(--primary-dark)]"
                >
                  {isDemo ? "Abrir demonstração" : "Ver conteúdo cadastrado"}
                </Link>
              </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
