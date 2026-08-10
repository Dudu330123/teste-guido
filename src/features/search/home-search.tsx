"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Application, Task } from "@/types/content";
import { normalizeSearch, rankSearch } from "./search-content";

interface HomeSearchProps {
  applications: Application[];
  tasks: Task[];
}

const searchExamples = [
  { category: "Banco", label: "Como pagar um boleto?", href: "/tarefas/pagar-boleto" },
  { category: "WhatsApp", label: "Como enviar um áudio?", href: "/aplicativos/whatsapp" },
  { category: "Gov.br", label: "Como acessar minha conta?", href: "/aplicativos/gov-br" },
] as const;

function getTaskHref(task: Task, applications: Application[]) {
  if (task.availability === "demo") return `/tarefas/${task.slug}`;
  if (task.applicationId === "app-demo-bancos" && task.actionId) return `/acoes/${task.actionId}`;
  const application = applications.find((item) => item.id === task.applicationId);
  return `/aplicativos/${application?.slug ?? ""}`;
}

export function HomeSearch({ applications, tasks }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const liveQuery = normalizeSearch(query);
  const normalizedQuery = normalizeSearch(submittedQuery);
  const liveSuggestions = liveQuery
    ? rankSearch(tasks, liveQuery, (task) => `${task.title} ${task.description} ${task.searchTerms.join(" ")}`, 40)
      .filter((task, index, rankedTasks) => rankedTasks.findIndex((candidate) => normalizeSearch(candidate.title) === normalizeSearch(task.title)) === index)
      .slice(0, 3)
    : [];

  return (
    <section aria-labelledby="search-title" className="w-full">
      <h1 id="search-title" className="text-center text-6xl font-black tracking-tight text-[var(--primary)] sm:text-7xl">
        Guido
      </h1>
      <p className="mx-auto mt-3 text-center text-base font-semibold text-[var(--muted)] sm:whitespace-nowrap sm:text-xl">
        Você pode fazer isso com calma. Vamos ajudar um passo de cada vez.
      </p>
      <form
        className="glass-control guido-search-form relative mt-7 min-h-16 overflow-hidden rounded-full border-2 focus-within:border-[var(--primary)]"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const matchingTask = rankSearch(tasks, query, (task) => `${task.title} ${task.description} ${task.searchTerms.join(" ")}`, 1)[0];
          if (matchingTask) {
            router.push(getTaskHref(matchingTask, applications));
            return;
          }
          const matchingApplication = rankSearch(applications, query, (application) => `${application.name} ${application.description} ${application.category} ${application.searchTerms.join(" ")}`, 1)[0];
          if (matchingApplication) {
            router.push(`/aplicativos/${matchingApplication.slug}`);
            return;
          }
          setSubmittedQuery(query);
        }}
      >
        <label htmlFor="home-search" className="sr-only">Pesquisar ajuda</label>
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSubmittedQuery("");
          }}
          placeholder="Com o que você precisa de ajuda?"
          className="min-h-16 w-full rounded-none border-0 bg-transparent py-3 pl-[4.5rem] pr-[4.5rem] text-lg text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:text-xl"
        />
        <button
          type="submit"
          aria-label="Pesquisar"
          className="guido-search-button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 fill-none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.25 4.25" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <p className="sr-only" aria-live="polite">
        {liveQuery ? `${liveSuggestions.length} sugestões relacionadas encontradas.` : ""}
      </p>
      <div className="mt-5 grid gap-3" aria-label={liveQuery ? "Sugestões relacionadas à pesquisa" : "Exemplos de pesquisas comuns"}>
        {liveQuery ? (
          liveSuggestions.length > 0 ? liveSuggestions.map((task) => {
            const application = applications.find((item) => item.id === task.applicationId);
            const category = task.actionId === "pix"
              ? "Pix"
              : task.actionId === "comprovante" ? "Comprovante" : application?.name ?? "Sugestão";
            return (
              <Link
                key={task.id}
                aria-label={`${category}: ${task.title}`}
                href={getTaskHref(task, applications)}
                className="calm-choice min-h-20 rounded-2xl px-5 py-3 text-left"
              >
                <span className="block text-sm font-bold uppercase tracking-wide text-[var(--primary)]">{category}</span>
                <span className="mt-1 block font-semibold text-[var(--foreground)]">{task.title}</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">{task.availability === "demo" ? "Demonstração disponível" : "Em preparação"}</span>
              </Link>
            );
          }) : (
            <p className="calm-choice min-h-16 rounded-2xl px-5 py-4 text-[var(--muted)]">
              Continue digitando ou pressione a lupa para pesquisar.
            </p>
          )
        ) : searchExamples.map((example) => (
            <Link
              key={example.category}
              aria-label={`${example.category}: ${example.label}`}
              href={example.href}
              className="calm-choice min-h-20 rounded-2xl px-5 py-3 text-left"
            >
              <span className="block text-sm font-bold uppercase tracking-wide text-[var(--primary)]">{example.category}</span>
              <span className="mt-1 block font-semibold text-[var(--foreground)]">{example.label}</span>
            </Link>
          ))}
      </div>

      {normalizedQuery && (
        <div className="glass-panel mt-8 rounded-2xl p-5 text-[var(--foreground)]" aria-live="polite">
          <h2 className="text-2xl font-bold">Ainda não encontramos “{submittedQuery}”</h2>
          <p className="mt-2">Tente usar palavras mais curtas ou procure “pagar boleto”.</p>
        </div>
      )}
    </section>
  );
}
