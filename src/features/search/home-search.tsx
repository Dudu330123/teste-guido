"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { actions } from "@/data/actions";
import type { Application, Task } from "@/types/content";
import { normalizeSearch, rankSearch } from "./search-content";

interface HomeSearchProps {
  applications: Application[];
  tasks: Task[];
}

const searchExamples = [
  { category: "Bancos", label: "Tutoriais sobre seu banco", href: "/bancos", icon: "bank" },
  { category: "Gov.br", label: "Serviços e acessos do governo", href: "/aplicativos/gov-br", icon: "government" },
  { category: "WhatsApp", label: "Dicas e funções essenciais", href: "/aplicativos/whatsapp", icon: "message" },
  { category: "PIX", label: "Guias sobre pagamentos Pix", href: "/acoes/pix", icon: "pix" },
] as const;

function PopularIcon({ type }: { type: (typeof searchExamples)[number]["icon"] }) {
  if (type === "bank") {
    return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 3 3 10v3h26v-3L16 3ZM6 15v9H4v4h24v-4h-2v-9h-4v9h-4v-9h-4v9h-4v-9H6Z" /></svg>;
  }
  if (type === "government") {
    return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 2 5 6v8c0 7.2 4.7 13.2 11 16 6.3-2.8 11-8.8 11-16V6L16 2Zm6.2 10.8-7.5 8-4-4 2.2-2.2 1.8 1.8 5.3-5.7 2.2 2.1Z" /></svg>;
  }
  if (type === "message") {
    return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 5h24v18H13l-7 6v-6H4V5Zm7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="m10 2 6 6-6 6-6-6 6-6Zm12 0 6 6-6 6-6-6 6-6ZM10 16l6 6-6 6-6-6 6-6Zm12 0 6 6-6 6-6-6 6-6Z" /></svg>;
}

function getTaskHref(task: Task, applications: Application[]) {
  if (task.availability !== "preparing") return `/tarefas/${task.slug}`;
  if (task.applicationId === "app-demo-bancos" && task.actionId) return `/acoes/${task.actionId}`;
  const application = applications.find((item) => item.id === task.applicationId);
  return `/aplicativos/${application?.slug ?? ""}`;
}

export function HomeSearch({ applications, tasks }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const liveQuery = normalizeSearch(query);
  const normalizedQuery = normalizeSearch(submittedQuery);
  const liveSuggestions = liveQuery
    ? rankSearch(tasks, liveQuery, (task) => `${task.title} ${task.description} ${task.searchTerms.join(" ")}`, 40)
      .filter((task, index, rankedTasks) => rankedTasks.findIndex((candidate) => normalizeSearch(candidate.title) === normalizeSearch(task.title)) === index)
      .slice(0, 4)
    : [];

  const navigateTo = (href: string) => {
    startTransition(() => router.push(href));
  };

  return (
    <section aria-labelledby="search-title" className="home-hero">
      <div className="home-hero-copy">
        <p className="home-eyebrow">Biblioteca digital de manuais</p>
        <h1 id="search-title" className="home-title">
          Encontre o manual.<br />Siga os passos.<br /><strong>Resolva.</strong>
        </h1>
        <p className="home-subtitle">Tutoriais práticos e passo a passo<br className="hidden sm:block" /> para o que você precisa fazer.</p>
      <form
        className="guido-search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (!liveQuery || isPending) return;
          const matchingAction = rankSearch(
            actions,
            query,
            (action) => `${action.title} ${action.taskTitle} ${action.description} ${action.searchTerms.join(" ")}`,
            1,
          )[0];
          if (matchingAction) {
            navigateTo(`/acoes/${matchingAction.slug}`);
            return;
          }
          const matchingTask = rankSearch(tasks, query, (task) => `${task.title} ${task.description} ${task.searchTerms.join(" ")}`, 1)[0];
          if (matchingTask) {
            navigateTo(getTaskHref(matchingTask, applications));
            return;
          }
          const matchingApplication = rankSearch(applications, query, (application) => `${application.name} ${application.description} ${application.category} ${application.searchTerms.join(" ")}`, 1)[0];
          if (matchingApplication) {
            navigateTo(`/aplicativos/${matchingApplication.slug}`);
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
          placeholder="Qual manual você procura?"
          className="home-search-input"
        />
        <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-icon fill-none" stroke="currentColor" strokeWidth="2.25">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" strokeLinecap="round" />
        </svg>
        <button
          type="submit"
          aria-label="Pesquisar"
          aria-busy={isPending}
          disabled={!liveQuery || isPending}
          className="guido-search-button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-arrow size-7 fill-none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isPending && (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-spinner size-7 fill-none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </form>

      <p className="sr-only" role="status" aria-live="polite">
        {isPending ? "Abrindo o guia selecionado." : liveQuery ? `${liveSuggestions.length} sugestões relacionadas encontradas.` : ""}
      </p>
      <section id="mais-acessados" className="home-popular" aria-labelledby="popular-title">
        <h2 id="popular-title">{liveQuery ? "Sugestões para você" : "Mais acessados"}</h2>
        <div className="home-popular-grid" aria-label={liveQuery ? "Sugestões relacionadas à pesquisa" : "Exemplos de pesquisas comuns"}>
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
                className="home-popular-card home-suggestion-card"
              >
                <span className="home-card-category">{category}</span>
                <span className="home-card-title">{task.title}</span>
                <span className="home-card-description">{task.availability === "demo" ? "Demonstração disponível" : task.availability === "available" ? "Guia disponível" : "Guia em preparação"}</span>
                <span aria-hidden="true" className="home-card-arrow">→</span>
              </Link>
            );
          }) : (
            <p className="home-search-empty">
              Continue digitando ou pressione a lupa para pesquisar.
            </p>
          )
        ) : searchExamples.map((example) => (
            <Link
              key={example.category}
              aria-label={`${example.category}: ${example.label}`}
              href={example.href}
              className="home-popular-card"
            >
              <PopularIcon type={example.icon} />
              <span className="home-card-title">{example.category}</span>
              <span className="home-card-description">{example.label}</span>
              <span aria-hidden="true" className="home-card-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {normalizedQuery && (
        <div className="home-search-error" aria-live="polite">
          <h2 className="text-2xl font-bold">Ainda não encontramos “{submittedQuery}”</h2>
          <p className="mt-2">Tente usar palavras mais curtas ou procure “pagar boleto”.</p>
        </div>
      )}
      </div>

      <div className="home-mascot" aria-hidden="true">
        <Image
          src="/images/home/mascote-guido-lendo.png"
          alt=""
          width={1207}
          height={1303}
          className="home-mascot-light"
          priority
        />
        <Image
          src="/images/home/mascote-guido-dark.png"
          alt=""
          width={1199}
          height={1312}
          className="home-mascot-dark"
          priority
        />
      </div>
    </section>
  );
}
