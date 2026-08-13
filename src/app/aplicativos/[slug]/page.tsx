import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { applications, getApplicationBySlug } from "@/data/applications";
import { tasks } from "@/data/guides";
import { getCatalogFromSupabase, mergeCatalogWithFallback } from "@/lib/supabase/catalog";

interface ApplicationPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Tarefas do aplicativo" };

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const remoteCatalog = await getCatalogFromSupabase();
  const catalog = mergeCatalogWithFallback(remoteCatalog, { applications, tasks });
  const application = catalog.applications.find((item) => item.slug === slug) ?? getApplicationBySlug(slug);
  if (!application) notFound();
  const applicationTasks = catalog.tasks.filter((task) => task.applicationId === application.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <Link href="/" className="font-bold underline">← Voltar ao catálogo</Link>
        <p className="mt-8 font-semibold text-[var(--primary)]">{application.category}</p>
        <h1 className="text-4xl font-bold">{application.name}</h1>
        <p className="mt-3 text-xl">{application.description}</p>

        <section aria-labelledby="tasks-title" className="mt-10">
          <h2 id="tasks-title" className="text-3xl font-bold">Tarefas</h2>
          {applicationTasks.length > 0 ? (
            <div className="mt-5 space-y-5">
              {applicationTasks.map((task) => (
                <article key={task.id} className="glass-panel rounded-2xl p-6">
                  <h3 className="text-2xl font-bold">{task.title}</h3>
                  <p className="mt-2">{task.description}</p>
                  <p className="notice-info mt-3 rounded-xl p-4 font-semibold">{task.safetyWarning}</p>
                  {task.availability !== "preparing" ? (
                    <Link href={`/tarefas/${task.slug}`} className="primary-action mt-5 inline-block min-h-12 px-6 py-3 font-bold">
                      Escolher meu celular
                    </Link>
                  ) : (
                    <p className="soft-panel mt-5 inline-block rounded-xl px-5 py-3 font-bold text-[var(--primary-dark)]">
                      Guia em preparação
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-panel mt-5 rounded-2xl p-6">
              <p className="text-xl font-bold">Conteúdo em preparação</p>
              <p className="mt-2">Nenhum guia deste aplicativo foi validado para esta versão.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
