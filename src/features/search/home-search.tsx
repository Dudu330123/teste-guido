"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { actions } from "@/data/actions";
import { ApplicationLogo } from "@/features/applications/application-logo";
import type { Application, Task } from "@/types/content";
import { normalizeSearch, rankSearch } from "./search-content";

interface HomeSearchProps { applications: Application[]; tasks: Task[]; }
type GuidedCategory = "banks" | "whatsapp" | "government";

const categoryOptions: Array<{ id: GuidedCategory; title: string; description: string; icon: "bank" | "message" | "government" }> = [
  { id: "banks", title: "Bancos", description: "Pix, boletos e segurança", icon: "bank" },
  { id: "whatsapp", title: "WhatsApp", description: "Mensagens, áudios e chamadas", icon: "message" },
  { id: "government", title: "Gov.br", description: "Acesso e serviços do governo", icon: "government" },
];

function CategoryIcon({ type }: { type: "bank" | "message" | "government" }) {
  if (type === "bank") return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 3 3 10v3h26v-3L16 3ZM6 15v9H4v4h24v-4h-2v-9h-4v9h-4v-9h-4v9h-4v-9H6Z" /></svg>;
  if (type === "government") return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 2 5 6v8c0 7.2 4.7 13.2 11 16 6.3-2.8 11-8.8 11-16V6L16 2Zm6.2 10.8-7.5 8-4-4 2.2-2.2 1.8 1.8 5.3-5.7 2.2 2.1Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 5h24v18H13l-7 6v-6H4V5Zm7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>;
}

function ApplicationMark({ application }: { application: Application }) {
  return <ApplicationLogo application={application} />;
}

function taskHref(task: Task) { return `/tarefas/${task.slug}`; }

function searchTaskHref(task: Task, applications: Application[]) {
  if (task.availability !== "preparing") return taskHref(task);
  if (task.applicationId === "app-demo-bancos" && task.actionId) return `/acoes/${task.actionId}`;
  const application = applications.find((item) => item.id === task.applicationId);
  return `/aplicativos/${application?.slug ?? ""}`;
}

interface BankModalProps { banks: Application[]; onClose: () => void; onSelect: (bank: Application) => void; }

function BankModal({ banks, onClose, onSelect }: BankModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const backgroundElements = Array.from(document.body.children).filter((element) => element !== modal) as HTMLElement[];
    const previousStates = backgroundElements.map((element) => ({ element, ariaHidden: element.getAttribute("aria-hidden"), inert: element.inert }));
    backgroundElements.forEach((element) => { element.inert = true; element.setAttribute("aria-hidden", "true"); });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden"); else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [onClose]);

  return createPortal(
    <div ref={modalRef} className="home-bank-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="bank-modal-title" className="home-bank-modal">
        <header>
          <div><h2 id="bank-modal-title">Escolha seu banco</h2><p>Selecione o aplicativo que você usa.</p></div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar lista de bancos" className="home-modal-close">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="home-bank-modal-list">
          {banks.map((bank) => (
            <button key={bank.id} type="button" onClick={() => onSelect(bank)} className="home-bank-modal-option">
              <span className="home-application-mark" aria-hidden="true"><ApplicationMark application={bank} /></span>
              <span>{bank.name}</span><span aria-hidden="true" className="home-card-arrow">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>, document.body,
  );
}

export function HomeSearch({ applications, tasks }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GuidedCategory | null>(null);
  const [selectedBank, setSelectedBank] = useState<Application | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankModalOrigin, setBankModalOrigin] = useState<"category" | "tasks">("category");
  const [isPending, startTransition] = useTransition();
  const guidedPanelRef = useRef<HTMLDivElement>(null);
  const guidedHeadingRef = useRef<HTMLHeadingElement>(null);
  const bankCategoryButtonRef = useRef<HTMLButtonElement>(null);
  const changeBankButtonRef = useRef<HTMLButtonElement>(null);
  const liveQuery = normalizeSearch(query);
  const normalizedQuery = normalizeSearch(submittedQuery);

  const financialApplications = useMemo(() => applications.filter((application) => application.category === "Serviços financeiros" && application.id !== "app-demo-bancos"), [applications]);
  const liveSuggestions = liveQuery
    ? rankSearch(tasks, liveQuery, (task) => `${task.title} ${task.description} ${task.searchTerms.join(" ")}`, 40)
      .filter((task, index, rankedTasks) => rankedTasks.findIndex((candidate) => normalizeSearch(candidate.title) === normalizeSearch(task.title)) === index).slice(0, 4)
    : [];
  const selectedApplication = selectedCategory === "whatsapp"
    ? applications.find((application) => application.slug === "whatsapp")
    : selectedCategory === "government" ? applications.find((application) => application.slug === "gov-br") : selectedBank ?? undefined;
  const selectedTasks = selectedApplication ? tasks.filter((task) => task.applicationId === selectedApplication.id) : [];

  useEffect(() => {
    if (!selectedCategory || !guidedPanelRef.current) return;
    const panel = guidedPanelRef.current;
    const frame = window.requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const sufficientlyVisible = visibleHeight >= Math.min(rect.height * 0.82, 420);
      if (!sufficientlyVisible) {
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedCategory, selectedBank]);

  const navigateTo = (href: string) => startTransition(() => router.push(href));
  const chooseCategory = (category: GuidedCategory) => {
    setSelectedBank(null);
    if (category === "banks") {
      setBankModalOrigin("category");
      setBankModalOpen(true);
      return;
    }
    setSelectedCategory(category);
    window.requestAnimationFrame(() => guidedHeadingRef.current?.focus({ preventScroll: true }));
  };
  const returnToCategories = () => {
    setSelectedCategory(null);
    setSelectedBank(null);
    window.requestAnimationFrame(() => bankCategoryButtonRef.current?.focus({ preventScroll: true }));
  };
  const closeBankModal = () => {
    setBankModalOpen(false);
    window.requestAnimationFrame(() => {
      (bankModalOrigin === "tasks" ? changeBankButtonRef.current : bankCategoryButtonRef.current)?.focus({ preventScroll: true });
    });
  };
  const chooseBank = (bank: Application) => {
    setSelectedCategory("banks");
    setSelectedBank(bank);
    setBankModalOpen(false);
    window.requestAnimationFrame(() => guidedHeadingRef.current?.focus({ preventScroll: true }));
  };

  return (
    <section aria-labelledby="search-title" className="home-hero">
      <div className="home-hero-copy">
        <h1 id="search-title" className="home-title">Como podemos ajudar?</h1>
        <p className="home-subtitle">Conte com o Guido para resolver o que você precisa, passo a passo.</p>

        <form className="guido-search-form" role="search" onSubmit={(event) => {
          event.preventDefault();
          if (!liveQuery || isPending) return;
          const matchingAction = rankSearch(actions, query, (action) => `${action.title} ${action.taskTitle} ${action.description} ${action.searchTerms.join(" ")}`, 1)[0];
          if (matchingAction) { navigateTo(`/acoes/${matchingAction.slug}`); return; }
          const matchingTask = rankSearch(tasks, query, (task) => `${task.title} ${task.description} ${task.searchTerms.join(" ")}`, 1)[0];
          if (matchingTask) {
            navigateTo(searchTaskHref(matchingTask, applications));
            return;
          }
          const matchingApplication = rankSearch(applications, query, (application) => `${application.name} ${application.description} ${application.category} ${application.searchTerms.join(" ")}`, 1)[0];
          if (matchingApplication) { navigateTo(`/aplicativos/${matchingApplication.slug}`); return; }
          setSubmittedQuery(query);
        }}>
          <label htmlFor="home-search" className="sr-only">Pesquisar ajuda</label>
          <input id="home-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSubmittedQuery(""); }} placeholder="Ou digite o que você precisa" className="home-search-input" />
          <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-icon fill-none" stroke="currentColor" strokeWidth="2.25"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" strokeLinecap="round" /></svg>
          <button type="submit" aria-label="Pesquisar" aria-busy={isPending} disabled={!liveQuery || isPending} className="guido-search-button">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-arrow size-7 fill-none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {isPending && <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-spinner size-7 fill-none" stroke="currentColor" strokeWidth="2.2"><path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" /></svg>}
          </button>
        </form>
        <p className="sr-only" role="status" aria-live="polite">{isPending ? "Abrindo o guia selecionado." : liveQuery ? `${liveSuggestions.length} sugestões relacionadas encontradas.` : ""}</p>

        <div ref={guidedPanelRef} className="home-guided-area">
          {liveQuery ? (
            <section className="home-suggestions" aria-labelledby="home-suggestions-title">
              <h2 id="home-suggestions-title">Sugestões para você</h2>
              <div className="home-task-grid">
                {liveSuggestions.length > 0 ? liveSuggestions.map((task) => {
                  const application = applications.find((item) => item.id === task.applicationId);
                  return <Link key={task.id} href={searchTaskHref(task, applications)} className="home-task-card"><span>{application?.name ?? "Guido"}</span><strong>{task.title}</strong><small>{task.availability === "preparing" ? "Em preparação" : "Abrir guia"}</small><span aria-hidden="true" className="home-card-arrow">→</span></Link>;
                }) : <p className="home-search-empty">Continue digitando ou pressione a lupa para pesquisar.</p>}
              </div>
            </section>
          ) : selectedCategory === null ? (
            <section className="home-category-picker" aria-labelledby="category-picker-title">
              <h2 id="category-picker-title">Escolha por onde começar</h2>
              <div className="home-category-grid">
                {categoryOptions.map((category) => (
                  <button ref={category.id === "banks" ? bankCategoryButtonRef : undefined} key={category.id} type="button" onClick={() => chooseCategory(category.id)} className="home-category-button">
                    <span className="home-category-icon"><CategoryIcon type={category.icon} /></span>
                    <span><strong>{category.title}</strong><small>{category.description}</small></span><span aria-hidden="true" className="home-card-arrow">→</span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="home-progress-panel" aria-labelledby="task-picker-title">
              <div className="home-panel-heading"><div><p>{selectedCategory === "banks" ? "Ajuda com seu banco" : "Escolha uma tarefa"}</p><h2 ref={guidedHeadingRef} tabIndex={-1} id="task-picker-title">O que você quer fazer em {selectedApplication?.name}?</h2></div><button type="button" onClick={() => {
                if (selectedCategory === "banks") {
                  setBankModalOrigin("tasks");
                  setBankModalOpen(true);
                } else {
                  returnToCategories();
                }
              }} ref={selectedCategory === "banks" ? changeBankButtonRef : undefined} className="home-panel-back">← {selectedCategory === "banks" ? "Trocar banco" : "Voltar"}</button></div>
              {selectedTasks.length > 0 ? <div className="home-task-grid home-task-grid--scroll">
                {selectedTasks.map((task) => <Link key={task.id} href={taskHref(task)} className="home-task-card"><strong>{task.title}</strong><small>{task.availability === "preparing" ? "Guia em preparação" : "Abrir passo a passo"}</small><span aria-hidden="true" className="home-card-arrow">→</span></Link>)}
              </div> : <p className="home-search-empty">Ainda não há tarefas cadastradas para este aplicativo.</p>}
            </section>
          )}
        </div>

        {normalizedQuery && <div className="home-search-error" aria-live="polite"><h2>Ainda não encontramos “{submittedQuery}”</h2><p>Tente usar palavras mais curtas ou procure “pagar boleto”.</p></div>}
      </div>

      <div className="home-mascot" aria-hidden="true">
        <Image src="/images/home/mascote-guido-lendo.png" alt="" width={1207} height={1303} className="home-mascot-light" priority />
        <Image src="/images/home/mascote-guido-dark.png" alt="" width={1199} height={1312} className="home-mascot-dark" priority />
      </div>
      {bankModalOpen && <BankModal banks={financialApplications} onClose={closeBankModal} onSelect={chooseBank} />}
    </section>
  );
}
