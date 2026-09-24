"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { actions } from "@/data/actions";
import { isBankCategory } from "@/data/applications";
import { ApplicationLogo } from "@/features/applications/application-logo";
import type { Action, Application, Task } from "@/types/content";
import { normalizeSearch, rankSearch } from "./search-content";
import type { SearchDocument } from "./search-content";

interface HomeSearchProps { applications: Application[]; tasks: Task[]; }
type GuidedCategory = "banks" | "whatsapp" | "government";

const categoryOptions: Array<{ id: GuidedCategory; title: string; description: string; icon: "bank" | "message" | "government"; applicationSlug?: string }> = [
  { id: "banks", title: "Bancos", description: "Pix, boleto e cartão", icon: "bank" },
  { id: "whatsapp", title: "WhatsApp", description: "Mensagens e chamadas", icon: "message", applicationSlug: "whatsapp" },
  { id: "government", title: "Gov.br", description: "Conta e serviços", icon: "government", applicationSlug: "gov-br" },
];

const quickQueries = ["Pix", "boleto", "recuperar senha"] as const;

function CategoryIcon({ type }: { type: "bank" | "message" | "government" }) {
  if (type === "bank") return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 3 3 10v3h26v-3L16 3ZM6 15v9H4v4h24v-4h-2v-9h-4v9h-4v-9h-4v9h-4v-9H6Z" /></svg>;
  if (type === "government") return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 2 5 6v8c0 7.2 4.7 13.2 11 16 6.3-2.8 11-8.8 11-16V6L16 2Zm6.2 10.8-7.5 8-4-4 2.2-2.2 1.8 1.8 5.3-5.7 2.2 2.1Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M4 5h24v18H13l-7 6v-6H4V5Zm7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>;
}

function ApplicationMark({ application }: { application: Application }) {
  return <ApplicationLogo application={application} />;
}

function taskHref(task: Task) { return `/tarefas/${task.slug}`; }

function taskSearchDocument(task: Task, applications: Application[], includeApplicationName = true): SearchDocument {
  const application = applications.find((item) => item.id === task.applicationId);
  return {
    title: task.title,
    aliases: [...task.searchTerms, ...(includeApplicationName && application ? [application.name] : [])],
    description: task.description,
  };
}

function actionSearchDocument(action: Action): SearchDocument {
  return {
    title: action.taskTitle,
    aliases: [action.title, ...action.searchTerms],
    description: action.description,
  };
}

function applicationSearchDocument(application: Application): SearchDocument {
  return {
    title: application.name,
    aliases: [application.category, ...application.searchTerms],
    description: application.description,
  };
}

function searchTaskHref(task: Task, applications: Application[]) {
  if (task.availability !== "preparing") return taskHref(task);
  if (task.applicationId === "app-demo-bancos" && task.actionId) return `/acoes/${task.actionId}`;
  const application = applications.find((item) => item.id === task.applicationId);
  return `/aplicativos/${application?.slug ?? ""}`;
}

function isBankNicheQuery(query: string) {
  const normalized = normalizeSearch(query);
  return ["banco", "bancos", "servicos financeiros", "servico financeiro", "financeiro", "financeira", "servicos bancarios", "servico bancario"]
    .some((term) => normalized === term)
    || isBankCategory(normalized);
}

function isBankTask(task: Task, applications: Application[]) {
  if (task.applicationId === "app-demo-bancos") return true;
  return applications.some((application) => application.id === task.applicationId && isBankCategory(application.category));
}

type SearchBankTarget = { action?: Action; task?: Task };

function resolveSearchTask(target: SearchBankTarget, bank: Application, tasks: Task[]) {
  const sourceTask = target.task;
  const actionId = target.action?.id ?? sourceTask?.actionId;

  if (sourceTask?.applicationId === bank.id) return { task: sourceTask };

  // Preserve the only validated demo when the search identifies boleto.
  if (sourceTask?.applicationId === "app-demo-bancos" && sourceTask.availability !== "preparing") {
    return { task: sourceTask, applicationSlug: bank.slug };
  }

  if (actionId && sourceTask?.applicationId === "app-demo-bancos") {
    const availableDemo = tasks.find((task) => task.applicationId === "app-demo-bancos" && task.actionId === actionId && task.availability !== "preparing");
    if (availableDemo) return { task: availableDemo, applicationSlug: bank.slug };
  }

  if (actionId) {
    const bankTask = tasks.find((task) => task.applicationId === bank.id && task.actionId === actionId);
    if (bankTask) return { task: bankTask };
  }

  if (sourceTask) {
    return sourceTask.applicationId === "app-demo-bancos"
      ? { task: sourceTask, applicationSlug: bank.slug }
      : { task: sourceTask };
  }

  return null;
}

function taskRoute(task: Task, applicationSlug?: string) {
  const query = applicationSlug ? `?app=${encodeURIComponent(applicationSlug)}` : "";
  return `/tarefas/${encodeURIComponent(task.slug)}${query}`;
}

function TaskCard({ task, modal = false }: { task: Task; modal?: boolean }) {
  return (
    <Link href={taskHref(task)} className={`home-task-card${modal ? " home-task-modal-card" : ""}`}>
      <strong>{task.title}</strong>
      <span aria-hidden="true" className="home-card-arrow">→</span>
    </Link>
  );
}

function TaskGroup({ label, tasks: groupTasks, modal = false }: { label: string; tasks: Task[]; modal?: boolean }) {
  if (groupTasks.length === 0) return null;
  return (
    <section className={`home-task-group${modal ? " home-task-modal-group" : ""}`} aria-label={label}>
      <h3>{label}</h3>
      <div className="home-task-grid">
        {groupTasks.map((task) => <TaskCard key={task.id} task={task} modal={modal} />)}
      </div>
    </section>
  );
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

interface TaskModalProps { applicationName: string; tasks: Task[]; onClose: () => void; }

function TaskModal({ applicationName, tasks: modalTasks, onClose }: TaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const availableTasks = modalTasks.filter((task) => task.availability !== "preparing");
  const preparingTasks = modalTasks.filter((task) => task.availability === "preparing");

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
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
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
      <section role="dialog" aria-modal="true" aria-labelledby="task-modal-title" className="home-bank-modal home-task-modal">
        <header>
          <div><h2 id="task-modal-title">Escolha uma tarefa</h2><p>Selecione o que você quer fazer em {applicationName}.</p></div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar lista de tarefas" className="home-modal-close">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="home-task-modal-list">
          {modalTasks.length > 0 ? <>
            <TaskGroup label="Disponíveis agora" tasks={availableTasks} modal />
            <TaskGroup label="Em preparação" tasks={preparingTasks} modal />
          </> : <p className="home-task-modal-empty">Ainda não há tarefas cadastradas para este aplicativo.</p>}
        </div>
      </section>
    </div>, document.body,
  );
}

export function HomeSearch({ applications, tasks }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GuidedCategory | null>(null);
  const [selectedBank, setSelectedBank] = useState<Application | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [pendingBankTarget, setPendingBankTarget] = useState<SearchBankTarget | null>(null);
  const [isPending, startTransition] = useTransition();
  const categoryButtonRefs = useRef<Record<GuidedCategory, HTMLButtonElement | null>>({ banks: null, whatsapp: null, government: null });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchSubmitButtonRef = useRef<HTMLButtonElement>(null);
  const modalOriginRef = useRef<"category" | "search">("category");
  const liveQuery = normalizeSearch(query);

  const financialApplications = useMemo(() => applications.filter((application) => application.category === "Serviços financeiros" && application.id !== "app-demo-bancos"), [applications]);
  const liveSuggestions = liveQuery
    ? rankSearch(tasks, liveQuery, (task) => taskSearchDocument(task, applications), 40)
      .filter((task, index, rankedTasks) => rankedTasks.findIndex((candidate) => normalizeSearch(candidate.title) === normalizeSearch(task.title)) === index)
      .slice(0, 4)
    : [];
  const selectedApplication = selectedCategory === "whatsapp"
    ? applications.find((application) => application.slug === "whatsapp")
    : selectedCategory === "government" ? applications.find((application) => application.slug === "gov-br") : selectedBank ?? undefined;
  const selectedTasks = selectedApplication ? tasks.filter((task) => task.applicationId === selectedApplication.id) : [];

  const navigateTo = (href: string) => startTransition(() => router.push(href));
  const openBankModalFromSearch = (target: SearchBankTarget) => {
    modalOriginRef.current = "search";
    setPendingBankTarget(target);
    setSelectedCategory("banks");
    setSelectedBank(null);
    setBankModalOpen(true);
  };
  const chooseQuickQuery = (value: string) => {
    setQuery(value);
    window.requestAnimationFrame(() => searchInputRef.current?.focus({ preventScroll: true }));
  };
  const chooseCategory = (category: GuidedCategory) => {
    modalOriginRef.current = "category";
    setSelectedBank(null);
    if (category === "banks") {
      setBankModalOpen(true);
      return;
    }
    setSelectedCategory(category);
    setTaskModalOpen(true);
  };
  const closeBankModal = () => {
    const origin = modalOriginRef.current;
    setBankModalOpen(false);
    if (origin === "search") {
      setPendingBankTarget(null);
      setSelectedCategory(null);
      setSelectedBank(null);
    }
    window.requestAnimationFrame(() => {
      const target = origin === "search" ? searchSubmitButtonRef.current : categoryButtonRefs.current.banks;
      target?.focus({ preventScroll: true });
    });
  };
  const chooseBank = (bank: Application) => {
    const searchTarget = pendingBankTarget;
    if (searchTarget) {
      const resolved = resolveSearchTask(searchTarget, bank, tasks);
      setPendingBankTarget(null);
      setSelectedCategory(null);
      setSelectedBank(null);
      setBankModalOpen(false);
      if (resolved) {
        navigateTo(taskRoute(resolved.task, resolved.applicationSlug));
        return;
      }
    }
    setSelectedCategory("banks");
    setSelectedBank(bank);
    setBankModalOpen(false);
    setTaskModalOpen(true);
  };
  const closeTaskModal = () => {
    const categoryToFocus = selectedCategory;
    const origin = modalOriginRef.current;
    setTaskModalOpen(false);
    setSelectedCategory(null);
    setSelectedBank(null);
    window.requestAnimationFrame(() => {
      const target = origin === "search" ? searchSubmitButtonRef.current : categoryToFocus ? categoryButtonRefs.current[categoryToFocus] : null;
      target?.focus({ preventScroll: true });
    });
  };

  return (
    <section aria-labelledby="search-title" className={`home-hero${liveQuery ? " home-hero--results" : ""}`}>
      <div className="home-hero-copy">
        <h1 id="search-title" className="home-title">O que você precisa <span className="home-title-accent">fazer?</span></h1>
        <p className="home-subtitle">Encontre ajuda passo a passo para resolver tarefas do dia a dia.</p>

        <form className="guido-search-form" role="search" onSubmit={(event) => {
          event.preventDefault();
          if (!liveQuery || isPending) return;
          if (isBankNicheQuery(query)) {
            navigateTo("/explorar?categoria=Bancos");
            return;
          }
          const matchingAction = rankSearch(actions, query, actionSearchDocument, 1)[0];
          if (matchingAction) {
            openBankModalFromSearch({ action: matchingAction });
            return;
          }
          const matchingTask = rankSearch(tasks, query, (task) => taskSearchDocument(task, applications, false), 1)[0];
          if (matchingTask) {
            if (isBankTask(matchingTask, applications)) {
              openBankModalFromSearch({ task: matchingTask });
              return;
            }
            navigateTo(taskRoute(matchingTask));
            return;
          }
          const matchingApplication = rankSearch(applications, query, applicationSearchDocument, 1)[0];
          if (matchingApplication) { navigateTo(`/aplicativos/${matchingApplication.slug}`); return; }
        }}>
          <label htmlFor="home-search" className="sr-only">Pesquisar ajuda</label>
          <input ref={searchInputRef} id="home-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite: Pix, boleto, senha..." className="home-search-input" />
          <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-icon fill-none" stroke="currentColor" strokeWidth="2.25"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" strokeLinecap="round" /></svg>
          <button ref={searchSubmitButtonRef} type="submit" aria-label="Pesquisar" aria-busy={isPending} disabled={!liveQuery || isPending} className="guido-search-button">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-arrow size-7 fill-none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {isPending && <svg aria-hidden="true" viewBox="0 0 24 24" className="home-search-spinner size-7 fill-none" stroke="currentColor" strokeWidth="2.2"><path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" /></svg>}
          </button>
        </form>
        <p className="sr-only" role="status" aria-live="polite">{isPending ? "Abrindo o guia selecionado." : liveQuery ? `${liveSuggestions.length} sugestões relacionadas encontradas.` : ""}</p>

        <div className="home-guided-area">
          {liveQuery ? (
            <section className="home-suggestions" aria-labelledby="home-suggestions-title">
              <h2 id="home-suggestions-title">Sugestões para você</h2>
              {liveSuggestions.length > 0 ? <>
                <p className="home-suggestions-context">Talvez você esteja procurando:</p>
                <div className="home-task-grid">
                  {liveSuggestions.map((task) => {
                  const application = applications.find((item) => item.id === task.applicationId);
                  const bankTask = isBankTask(task, applications);
                  return <Link key={task.id} href={searchTaskHref(task, applications)} onClick={(event) => {
                    if (!bankTask) return;
                    event.preventDefault();
                    openBankModalFromSearch({ task });
                  }} aria-haspopup={bankTask ? "dialog" : undefined} className="home-task-card"><span>{application?.name ?? "Guido"}</span><strong>{task.title}</strong><small>{task.availability === "preparing" ? "Em preparação" : "Abrir guia"}</small><span aria-hidden="true" className="home-card-arrow">→</span></Link>;
                  })}
                </div>
              </> : <div className="home-task-grid"><p className="home-search-empty"><strong>Não encontramos esse guia.</strong><span>Tente escrever de outra forma.</span></p></div>}
            </section>
          ) : selectedCategory === null || taskModalOpen ? (
            <>
              <div className="home-quick-suggestions" role="group" aria-label="Sugestões rápidas">
                <span className="home-quick-suggestions-label">Sugestões</span>
                {quickQueries.map((suggestion) => (
                  <button key={suggestion} type="button" className="home-quick-query" onClick={() => chooseQuickQuery(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
              <section className="home-category-picker" aria-labelledby="category-picker-title">
                <h2 id="category-picker-title">Escolha uma categoria</h2>
                <div className="home-category-grid">
                  {categoryOptions.map((category) => {
                    const categoryApplication = category.applicationSlug
                      ? applications.find((application) => application.slug === category.applicationSlug)
                      : undefined;

                    return (
                    <button ref={(element) => { categoryButtonRefs.current[category.id] = element; }} key={category.id} type="button" onClick={() => chooseCategory(category.id)} className={`home-category-button home-category-button--${category.id}`}>
                      <span className={`home-category-icon${categoryApplication ? " home-category-icon--application" : ""}`}>
                        {categoryApplication ? <ApplicationMark application={categoryApplication} /> : <CategoryIcon type={category.icon} />}
                      </span>
                      <span><strong>{category.title}</strong><small>{category.description}</small></span><span aria-hidden="true" className="home-card-arrow">→</span>
                    </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>

      </div>

      <div className="home-mascot" aria-hidden="true">
        <span className="home-mascot-visual" />
      </div>
      {bankModalOpen && <BankModal banks={financialApplications} onClose={closeBankModal} onSelect={chooseBank} />}
      {taskModalOpen && selectedApplication && <TaskModal applicationName={selectedApplication.name} tasks={selectedTasks} onClose={closeTaskModal} />}
    </section>
  );
}
