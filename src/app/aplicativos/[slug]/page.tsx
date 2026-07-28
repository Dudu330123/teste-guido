import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getApplicationBySlug } from "@/data/applications";
import { tasks } from "@/data/guides";

interface ApplicationPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Tarefas do aplicativo" };

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const application = getApplicationBySlug(slug);
  if (!application) notFound();
  const applicationTasks = tasks.filter((task) => task.applicationId === application.id);

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
            <div className="mt-5 rounded-2xl border-2 border-[var(--border)] bg-white p-6">
              {applicationTasks.map((task) => (
                <article key={task.id}>
                  <h3 className="text-2xl font-bold">{task.title}</h3>
                  <p className="mt-2">{task.description}</p>
                  <p className="mt-3 rounded-xl border-2 border-[#a66a00] bg-[#fff3cf] p-4 font-semibold">{task.safetyWarning}</p>
                  <Link href={`/tarefas/${task.slug}`} className="mt-5 inline-block min-h-12 bg-[var(--primary)] px-6 py-3 font-bold text-white">
                    Escolher meu celular
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border-2 border-[var(--border)] bg-white p-6">
              <p className="text-xl font-bold">Conteúdo em preparação</p>
              <p className="mt-2">Nenhum guia deste aplicativo foi validado para esta versão.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
