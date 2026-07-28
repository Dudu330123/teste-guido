import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { tasks } from "@/data/guides";
import { ApplicationCard } from "@/features/applications/application-card";
import { HomeSearch } from "@/features/search/home-search";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <HomeSearch applications={applications} tasks={tasks} />

        <section aria-labelledby="popular-title" className="mt-14">
          <p className="font-semibold text-[var(--primary)]">Escolha por aplicativo</p>
          <h2 id="popular-title" className="mt-1 text-3xl font-bold sm:text-4xl">Aplicativos populares</h2>
          <p className="mt-2 max-w-3xl">Os conteúdos marcados como “em preparação” ainda não possuem guia navegável.</p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                taskCount={tasks.filter((task) => task.applicationId === application.id).length}
              />
            ))}
          </div>
        </section>

        <section id="ajuda" aria-labelledby="help-title" className="mt-14 rounded-3xl border-2 border-[var(--primary)] bg-white p-7">
          <h2 id="help-title" className="text-3xl font-bold">Precisa de ajuda para começar?</h2>
          <p className="mt-3 max-w-3xl">Peça a uma pessoa de confiança para acompanhar você. Nunca compartilhe senhas, códigos ou dados bancários com o Guido.</p>
          <a href="mailto:ajuda@exemplo.guido" className="mt-5 inline-block min-h-12 bg-[var(--primary)] px-5 py-3 font-bold text-white">
            Enviar dúvida por e-mail
          </a>
          <p className="mt-2 text-sm text-[var(--muted)]">Endereço demonstrativo; canal de atendimento ainda não ativo.</p>
        </section>
      </main>
    </>
  );
}
