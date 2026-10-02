"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type RefObject } from "react";
import { Accessibility, ArrowRight, Grid2X2, Landmark, MessageCircle, Images, Search, Settings, ShieldCheck, CircleHelp } from "lucide-react";
import type { Application, Task } from "@/types/content";
import { ApplicationLogo } from "@/features/applications/application-logo";
import { GuidoMascot } from "@/features/theme/guido-mascot";
import { otherApps } from "@/data/other-apps";
import { rankSearch } from "./search-content";
import { availableGuideCount, categoryTasks, learningCategories, type LearningCategory } from "./learning-catalog";

type ExistingCategory = "banks" | "whatsapp" | "government" | "others";
const icons = { bank: Landmark, message: MessageCircle, government: Landmark, shield: ShieldCheck, photos: Images, settings: Settings, accessibility: Accessibility, apps: Grid2X2 };

function CategoryCard({ category, count, application, onClick, buttonRef }: {
  category: LearningCategory; count: number; application?: Application; onClick: () => void;
  buttonRef: (element: HTMLButtonElement | null) => void;
}) {
  const Icon = icons[category.icon];
  return <button ref={buttonRef} className="learning-category" type="button" onClick={onClick}>
    <span className={`learning-icon learning-icon--${category.id}`} aria-hidden="true">{application ? <ApplicationLogo application={application} /> : <Icon size={30} />}</span>
    <strong>{category.title}</strong>
    <span className="learning-description">{category.description}</span>
    <span className="learning-card-footer"><span>{`${count} ${count === 1 ? "guia disponível" : "guias disponíveis"}`}</span><ArrowRight size={21} aria-hidden="true" /></span>
  </button>;
}

function LearningSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  return <form role="search" className="learning-search" onSubmit={(event) => { event.preventDefault(); onSearch(query); }}>
    <label htmlFor="learning-query">O que você quer fazer?</label>
    <div className="learning-search-field"><Search aria-hidden="true" size={24} /><input id="learning-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Pix, WhatsApp ou aumentar a letra" aria-describedby="learning-search-hint" required /><button type="submit">Buscar <ArrowRight size={20} aria-hidden="true" /></button></div>
    <p id="learning-search-hint">Digite o que você quer fazer, por exemplo: Pix, WhatsApp ou aumentar a letra.</p>
  </form>;
}

function GettingStarted({ onSearch }: { onSearch: (query: string) => void }) {
  return <details className="learning-help"><summary><CircleHelp size={22} aria-hidden="true" />Não sei por onde começar</summary><div><p>Comece com uma tarefa do dia a dia:</p>{["Fazer Pix", "Enviar áudio", "Encontrar fotos", "Aumentar a letra"].map((label) => <button type="button" key={label} onClick={() => onSearch(label)}>{label}<ArrowRight size={18} aria-hidden="true" /></button>)}</div></details>;
}

function SafetySection({ onSearch }: { onSearch: (query: string) => void }) {
  return <section className="learning-safety" aria-labelledby="learning-safety-title"><ShieldCheck size={36} aria-hidden="true" /><div><h2 id="learning-safety-title">Aprenda com tranquilidade</h2><p>Você aprende passo a passo, sem informar sua senha ao Guido.</p><div className="learning-safety-links">{[["Como reconhecer golpes", "golpe"], ["O que fazer se alguém pedir seu código", "código"], ["O que fazer se perder o celular", "celular perdido"]].map(([label, query]) => <button key={query} type="button" onClick={() => onSearch(query)}>{label}<ArrowRight size={18} aria-hidden="true" /></button>)}</div></div></section>;
}

export function LearningHome({ applications, tasks, onChooseCategory, categoryButtonRefs }: {
  applications: Application[]; tasks: Task[]; onChooseCategory: (category: ExistingCategory) => void;
  categoryButtonRefs: RefObject<Record<ExistingCategory, HTMLButtonElement | null>>;
}) {
  const [selection, setSelection] = useState<{ title: string; tasks: Task[] } | null>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  // Dados remotos têm prioridade; tarefas auxiliares mantêm seu estado editorial original.
  const allTasks = useMemo(() => Array.from(new Map([...otherApps.flatMap((app) => app.tasks), ...tasks].map((task) => [task.slug, task])).values()), [tasks]);
  const showResults = (title: string, results: Task[]) => {
    setSelection({ title, tasks: results });
    window.requestAnimationFrame(() => resultsRef.current?.focus());
  };
  const search = (query: string) => {
    if (!query.trim()) return;
    showResults(`Resultados para “${query.trim()}”`, rankSearch(allTasks, query, (task) => ({ title: task.title, aliases: [...task.searchTerms, applications.find((app) => app.id === task.applicationId)?.name ?? ""], description: task.description }), 30));
  };
  return <>
    <section className="learning-welcome" aria-labelledby="category-picker-title"><div><p className="learning-eyebrow">TECNOLOGIA NO SEU RITMO</p><h1 id="category-picker-title">O que você quer<br className="learning-title-break" /> aprender hoje?</h1><p className="learning-subtitle">Escolha um assunto e siga o passo a passo com calma.</p><LearningSearch onSearch={search} /><GettingStarted onSearch={search} /></div><aside className="learning-mascot" aria-label="Guido, seu companheiro de aprendizagem"><GuidoMascot alt="Robô Guido" sizes="240px" priority className="guido-color-image" /><p>Um passo de cada vez.<br /><strong>Você consegue.</strong></p></aside></section>
    <section className="learning-categories" aria-labelledby="learning-categories-title"><div className="learning-section-heading"><h2 id="learning-categories-title">Aprenda por assunto</h2><p>Toque em uma opção para começar</p></div><div className="learning-grid">{learningCategories.map((category) => {
      const grouped = categoryTasks(category.id, allTasks, applications);
      const existing = ["banks", "whatsapp", "government", "others"].includes(category.id);
      const app = applications.find((app) => app.slug === (category.id === "whatsapp" ? "whatsapp" : category.id === "government" ? "gov-br" : ""));
      return <CategoryCard key={category.id} category={category} count={availableGuideCount(grouped)} application={app} buttonRef={(element) => { if (existing) categoryButtonRefs.current[category.id as ExistingCategory] = element; }} onClick={() => existing ? onChooseCategory(category.id as ExistingCategory) : showResults(category.title, grouped)} />;
    })}</div></section>
    {selection && <section className="learning-results" aria-labelledby="learning-results-title"><h2 id="learning-results-title" tabIndex={-1} ref={resultsRef}>{selection.title}</h2><p role="status">{selection.tasks.length ? `${selection.tasks.length} ${selection.tasks.length === 1 ? "tarefa encontrada" : "tarefas encontradas"}. Confira a disponibilidade abaixo.` : "Ainda não encontramos um guia para esse assunto. Tente outra palavra ou explore as categorias."}</p><div>{selection.tasks.map((task) => <Link key={task.id} href={`/tarefas/${task.slug}`}><span><strong>{task.title}</strong><small>{task.availability === "preparing" || task.status !== "published" ? "Em preparação" : task.availability === "demo" ? "Demonstração educativa" : "Disponível para aprender"}</small></span><ArrowRight aria-hidden="true" size={22} /></Link>)}</div></section>}
    <SafetySection onSearch={search} />
    <footer className="learning-footer">Guido · Aprender a usar a tecnologia pode ser simples.</footer>
  </>;
}
