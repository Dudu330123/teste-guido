"use client";

import Link from "next/link";
import { useState } from "react";
import type { Application, Task } from "@/types/content";

interface HomeSearchProps {
  applications: Application[];
  tasks: Task[];
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function HomeSearch({ applications, tasks }: HomeSearchProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const normalizedQuery = normalize(submittedQuery);
  const matchingTasks = normalizedQuery
    ? tasks.filter((task) => normalize(`${task.title} ${task.description}`).includes(normalizedQuery))
    : [];
  const matchingApplications = normalizedQuery
    ? applications.filter((application) => normalize(`${application.name} ${application.description} ${application.category}`).includes(normalizedQuery))
    : [];

  return (
    <section aria-labelledby="search-title" className="rounded-3xl bg-[var(--primary-dark)] px-6 py-10 text-white sm:px-10">
      <h1 id="search-title" className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
        Com o que você precisa de ajuda?
      </h1>
      <p className="mt-4 max-w-2xl text-xl">Encontre orientações simples para tarefas do dia a dia.</p>
      <form
        className="mt-7 flex flex-col gap-3 sm:flex-row"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query);
        }}
      >
        <label htmlFor="home-search" className="sr-only">Pesquisar ajuda</label>
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex.: pagar boleto ou enviar áudio"
          className="min-h-16 flex-1 border-2 border-white bg-white px-5 text-xl text-[var(--foreground)] placeholder:text-[#56635b]"
        />
        <button type="submit" className="min-h-16 bg-[var(--accent)] px-8 text-xl font-bold text-[#202016] hover:bg-[#ffd368]">
          Pesquisar
        </button>
      </form>

      {submittedQuery && (
        <div className="mt-6 rounded-2xl bg-white p-5 text-[var(--foreground)]" aria-live="polite">
          <h2 className="text-2xl font-bold">Resultados para “{submittedQuery}”</h2>
          {matchingTasks.length === 0 && matchingApplications.length === 0 ? (
            <p className="mt-2">Ainda não temos esse guia. Tente “pagar boleto” ou procure no catálogo.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {matchingTasks.map((task) => (
                <li key={task.id}>
                  <Link className="block min-h-12 rounded-xl border-2 border-[var(--primary)] p-3 font-bold underline" href={`/tarefas/${task.slug}`}>
                    {task.title} — demonstração não validada
                  </Link>
                </li>
              ))}
              {matchingApplications.map((application) => (
                <li key={application.id}>
                  <Link className="block min-h-12 rounded-xl border-2 border-[var(--border)] p-3 font-bold underline" href={`/aplicativos/${application.slug}`}>
                    {application.name} — {application.status === "available" ? "demonstração disponível" : "conteúdo em preparação"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
