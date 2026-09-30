"use client";

import Image from "next/image";
import Link from "next/link";
import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Mic,
  ArrowRight,
  ChevronDown,
  MessageSquareText,
  Volume2,
  Pin,
  Phone,
  Video,
  Image as ImageIcon,
  Camera,
  Trash2,
  MapPin,
  UserPlus,
  BellOff,
  UserX,
  ShieldAlert,
  Type,
  ArrowRightLeft,
  Barcode,
  CreditCard,
  ReceiptText,
  PiggyBank,
  LogIn,
  UserCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { ApplicationLogo } from "@/features/applications/application-logo";
import type { Application, Task } from "@/types/content";
import { OtherAppsModal } from "./other-apps-modal";
import type { OtherApp } from "@/data/other-apps";
import { AskGuidoModal } from "@/features/ai/ask-guido-modal";

interface HomeSearchProps {
  applications: Application[];
  tasks: Task[];
  onOpenVoice?: () => void;
}

export type GuidedCategory = "banks" | "whatsapp" | "government" | "others";

function ApplicationMark({ application }: { application: Application }) {
  return <ApplicationLogo application={application} />;
}

function taskHref(task: Task) {
  return `/tarefas/${task.slug}`;
}

function getTaskIcon(task: Task) {
  const slug = task.slug.toLowerCase();
  const title = task.title.toLowerCase();

  if (slug.includes("enviar-mensagem") || title.includes("mensagem") || slug.includes("email") || title.includes("e-mail")) return MessageSquareText;
  if (slug.includes("ouvir-audio") || title.includes("ouvir")) return Volume2;
  if (slug.includes("enviar-audio") || slug.includes("gravar") || title.includes("áudio") || title.includes("audio")) return Mic;
  if (slug.includes("fixar") || title.includes("fixar")) return Pin;
  if (slug.includes("video") || title.includes("vídeo") || slug.includes("youtube")) return Video;
  if (slug.includes("chamada") || slug.includes("ligacao") || slug.includes("ligação") || title.includes("ligação") || title.includes("ligar")) return Phone;
  if (slug.includes("tirar-foto") || slug.includes("camera") || title.includes("câmera")) return Camera;
  if (slug.includes("foto") || slug.includes("galeria") || slug.includes("imagem")) return ImageIcon;
  if (slug.includes("apagar") || slug.includes("lixeira") || slug.includes("excluir")) return Trash2;
  if (slug.includes("localizacao") || slug.includes("localização") || title.includes("localização") || slug.includes("maps") || slug.includes("uber")) return MapPin;
  if (slug.includes("contato") || slug.includes("agenda") || title.includes("contato")) return UserPlus;
  if (slug.includes("silenciar") || title.includes("silenciar")) return BellOff;
  if (slug.includes("bloquear-contato") || slug.includes("bloquear-numero")) return UserX;
  if (slug.includes("bloquear-cartao") || slug.includes("cartao") || slug.includes("cartão") || title.includes("cartão")) return CreditCard;
  if (slug.includes("golpe") || slug.includes("seguranca") || title.includes("golpe")) return ShieldAlert;
  if (slug.includes("letra") || slug.includes("fonte") || title.includes("letra")) return Type;
  if (slug.includes("pix") || title.includes("pix")) return ArrowRightLeft;
  if (slug.includes("boleto") || title.includes("boleto") || slug.includes("pagar-conta")) return Barcode;
  if (slug.includes("extrato") || title.includes("extrato") || slug.includes("saldo") || title.includes("saldo") || slug.includes("comprovante") || title.includes("comprovante")) return ReceiptText;
  if (slug.includes("guardar") || slug.includes("poupar") || title.includes("guardar")) return PiggyBank;
  if (slug.includes("entrar") || slug.includes("login") || title.includes("entrar")) return LogIn;
  if (slug.includes("prova-de-vida") || title.includes("prova de vida")) return UserCheck;
  if (slug.includes("carteira") || slug.includes("beneficio") || slug.includes("documento")) return FileText;
  return Sparkles;
}

function TaskCard({ task, modal = false }: { task: Task; modal?: boolean }) {
  const isPreparing = task.availability === "preparing" || task.status !== "published";

  return (
    <Link href={taskHref(task)} className={`home-task-card${modal ? " home-task-modal-card" : ""}`}>
      <div className="home-task-card-content">
        <span className="home-task-card-icon" aria-hidden="true">
          {createElement(getTaskIcon(task), { className: "size-6 sm:size-7 stroke-[2.2]" })}
        </span>
        <div className="home-task-card-text">
          <strong className="home-task-card-title">{task.title}</strong>
          {isPreparing ? (
            <small className="home-task-card-badge">Em preparação</small>
          ) : null}
        </div>
      </div>
      <span aria-hidden="true" className="home-card-arrow home-task-card-arrow">
        <ArrowRight className="size-6 sm:size-7 stroke-[2.5]" />
      </span>
    </Link>
  );
}

function TaskGroup({
  label,
  tasks: groupTasks,
  modal = false,
  showHeading = true,
  hasCategories = false,
}: {
  label: string;
  tasks: Task[];
  modal?: boolean;
  showHeading?: boolean;
  hasCategories?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (groupTasks.length === 0) return null;

  // Mostra no máximo 3 opções por grupo para manter a tela limpa e espaçosa para idosos
  const shouldLimit = modal && hasCategories && groupTasks.length > 3;
  const visibleTasks = shouldLimit && !expanded ? groupTasks.slice(0, 3) : groupTasks;

  return (
    <section className={`home-task-group${modal ? " home-task-modal-group" : ""}`} aria-label={showHeading ? label : undefined}>
      {showHeading && <h3>{label}</h3>}
      <div className="home-task-grid">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} modal={modal} />
        ))}
      </div>
      {shouldLimit && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="home-task-expand-button"
          aria-expanded={expanded}
        >
          <span>{expanded ? "Mostrar menos" : `Ver mais tarefas (${groupTasks.length - 3})`}</span>
          <ChevronDown
            className={`size-5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </section>
  );
}

interface BankModalProps {
  banks: Application[];
  onClose: () => void;
  onSelect: (bank: Application) => void;
}

function BankModal({ banks, onClose, onSelect }: BankModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isBackdropClickRef = useRef(false);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const backgroundElements = Array.from(document.body.children).filter((element) => element !== modal) as HTMLElement[];
    const previousStates = backgroundElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.inert,
    }));
    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={modalRef}
      className="home-bank-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        isBackdropClickRef.current = event.target === event.currentTarget;
      }}
      onTouchStart={(event) => {
        isBackdropClickRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (isBackdropClickRef.current && event.target === event.currentTarget) {
          onClose();
        }
        isBackdropClickRef.current = false;
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="bank-modal-title" className="home-bank-modal">
        <header>
          <div>
            <h2 id="bank-modal-title">Escolha seu banco</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar lista de bancos" className="home-modal-close">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="home-bank-modal-list">
          {banks.map((bank) => (
            <button key={bank.id} type="button" onClick={() => onSelect(bank)} className="home-bank-modal-option">
              <span className="home-application-mark" aria-hidden="true">
                <ApplicationMark application={bank} />
              </span>
              <span>{bank.name}</span>
              <span aria-hidden="true" className="home-card-arrow">
                →
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}

interface TaskModalProps {
  applicationName: string;
  tasks: Task[];
  onClose: () => void;
}

function TaskModal({ applicationName: _applicationName, tasks: modalTasks, onClose }: TaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isBackdropClickRef = useRef(false);
  const hasCategoryGroups = useMemo(
    () => modalTasks.some((task) => Boolean(task.categoryGroup)),
    [modalTasks],
  );

  const groupedSections = useMemo(() => {
    if (!hasCategoryGroups) {
      const available = modalTasks.filter((task) => task.availability !== "preparing");
      const preparing = modalTasks.filter((task) => task.availability === "preparing");
      const result = [];
      if (available.length > 0) result.push({ label: "Disponíveis agora", tasks: available, showHeading: true });
      if (preparing.length > 0) result.push({ label: "Em preparação", tasks: preparing, showHeading: false });
      return result;
    }

    const groupsMap = new Map<string, Task[]>();
    for (const task of modalTasks) {
      const group = task.categoryGroup ?? "Outras tarefas";
      if (!groupsMap.has(group)) groupsMap.set(group, []);
      groupsMap.get(group)!.push(task);
    }

    return Array.from(groupsMap.entries()).map(([label, tasks]) => ({
      label,
      tasks,
      showHeading: true,
    }));
  }, [modalTasks, hasCategoryGroups]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const backgroundElements = Array.from(document.body.children).filter((element) => element !== modal) as HTMLElement[];
    const previousStates = backgroundElements.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.inert,
    }));
    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousStates.forEach(({ element, ariaHidden, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={modalRef}
      className="home-bank-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        isBackdropClickRef.current = event.target === event.currentTarget;
      }}
      onTouchStart={(event) => {
        isBackdropClickRef.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (isBackdropClickRef.current && event.target === event.currentTarget) {
          onClose();
        }
        isBackdropClickRef.current = false;
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="task-modal-title" className="home-bank-modal home-task-modal">
        <header className="home-task-modal-header">
          <div>
            <h2 id="task-modal-title">Escolha uma tarefa</h2>
            <p className="home-modal-subtitle">Escolha o que você quer aprender</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar lista de tarefas" className="home-modal-close">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="home-task-modal-list">
          {modalTasks.length > 0 ? (
            groupedSections.map((section) => (
              <TaskGroup
                key={section.label}
                label={section.label}
                tasks={section.tasks}
                modal
                showHeading={section.showHeading}
                hasCategories={hasCategoryGroups}
              />
            ))
          ) : (
            <p className="home-task-modal-empty">Ainda não há tarefas cadastradas para este aplicativo.</p>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function HomeSearch({ applications, tasks, onOpenVoice }: HomeSearchProps) {
  const [selectedCategory, setSelectedCategory] = useState<GuidedCategory | null>(null);
  const [selectedBank, setSelectedBank] = useState<Application | null>(null);
  const [selectedOtherApp, setSelectedOtherApp] = useState<OtherApp | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [otherAppsModalOpen, setOtherAppsModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [standaloneVoiceOpen, setStandaloneVoiceOpen] = useState(false);

  const handleVoiceClick = () => {
    if (onOpenVoice) {
      onOpenVoice();
    } else {
      setStandaloneVoiceOpen(true);
    }
  };

  const categoryButtonRefs = useRef<Record<GuidedCategory, HTMLButtonElement | null>>({
    banks: null,
    whatsapp: null,
    government: null,
    others: null,
  });

  const financialApplications = useMemo(
    () => applications.filter((application) => application.category === "Serviços financeiros" && application.id !== "app-demo-bancos"),
    [applications],
  );

  const selectedApplication =
    selectedCategory === "whatsapp"
      ? applications.find((application) => application.slug === "whatsapp")
      : selectedCategory === "government"
        ? applications.find((application) => application.slug === "gov-br")
        : (selectedBank ?? undefined);

  const activeTaskModalTasks = selectedOtherApp
    ? selectedOtherApp.tasks
    : selectedApplication
      ? tasks.filter((task) => task.applicationId === selectedApplication.id)
      : [];

  const activeTaskModalTitle = selectedOtherApp
    ? selectedOtherApp.name
    : (selectedApplication?.name ?? "Aplicativo");

  const chooseCategory = (category: GuidedCategory) => {
    setSelectedBank(null);
    setSelectedOtherApp(null);
    if (category === "banks") {
      setBankModalOpen(true);
      return;
    }
    if (category === "others") {
      setOtherAppsModalOpen(true);
      return;
    }
    setSelectedCategory(category);
    setTaskModalOpen(true);
  };

  const closeBankModal = () => {
    setBankModalOpen(false);
    window.requestAnimationFrame(() => {
      categoryButtonRefs.current.banks?.focus({ preventScroll: true });
    });
  };

  const closeOtherAppsModal = () => {
    setOtherAppsModalOpen(false);
    window.requestAnimationFrame(() => {
      categoryButtonRefs.current.others?.focus({ preventScroll: true });
    });
  };

  const chooseBank = (bank: Application) => {
    setSelectedCategory("banks");
    setSelectedBank(bank);
    setSelectedOtherApp(null);
    setBankModalOpen(false);
    setTaskModalOpen(true);
  };

  const chooseOtherApp = (app: OtherApp) => {
    setSelectedCategory("others");
    setSelectedBank(null);
    setSelectedOtherApp(app);
    setOtherAppsModalOpen(false);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    const categoryToFocus = selectedCategory;
    setTaskModalOpen(false);
    setSelectedCategory(null);
    setSelectedBank(null);
    setSelectedOtherApp(null);
    window.requestAnimationFrame(() => {
      const target = categoryToFocus ? categoryButtonRefs.current[categoryToFocus] : null;
      target?.focus({ preventScroll: true });
    });
  };

  return (
    <section className="home-hero-section" aria-labelledby="home-category-title">
      <div className="home-hero-layout">
        {/* Conteúdo Principal à Esquerda */}
        <div className="home-hero-left">
          <p className="home-eyebrow">TECNOLOGIA NO SEU RITMO</p>
          <div className="home-hero-title-row">
            <h1 id="home-category-title" className="home-hero-title">
              <span>Escolha uma</span>{" "}
              <br />
              <span className="home-title-highlight">categoria</span>
            </h1>

            {/* Ícone de voz que ao clicar pede para falar */}
            <button
              type="button"
              onClick={handleVoiceClick}
              className="home-voice-button"
              aria-label="Falar com o Guido por voz - Toque para falar"
              title="Toque para falar com o Guido"
            >
              <div className="home-voice-button-inner">
                <span className="home-voice-wave" aria-hidden="true" />
                <Mic className="size-7 text-white" aria-hidden="true" />
              </div>
              <span className="home-voice-caption">Pedir por voz</span>
            </button>
          </div>

          {/* 4 Cards de Categorias */}
          <div className="home-categories-grid" role="region" aria-label="Categorias principais">
            {/* Card 1: Bancos */}
            <button
              type="button"
              ref={(el) => { categoryButtonRefs.current.banks = el; }}
              onClick={() => chooseCategory("banks")}
              className="home-category-card group"
              aria-label="Bancos"
            >
              <div className="home-card-header">
                <div className="home-card-badge home-card-badge--bank" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="size-7 text-[#1559c7] fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m2 7 10-5 10 5v2H2z" />
                    <path d="M4 10v9" />
                    <path d="M8 10v9" />
                    <path d="M16 10v9" />
                    <path d="M20 10v9" />
                    <path d="M2 19h20v3H2z" />
                  </svg>
                </div>
                <div className="home-card-info">
                  <strong className="home-card-name">Bancos</strong>
                </div>
              </div>
              <div className="home-card-footer" aria-hidden="true">
                <span className="home-card-arrow">
                  <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Card 2: WhatsApp */}
            <button
              type="button"
              ref={(el) => { categoryButtonRefs.current.whatsapp = el; }}
              onClick={() => chooseCategory("whatsapp")}
              className="home-category-card group"
              aria-label="WhatsApp"
            >
              <div className="home-card-header">
                <div className="home-card-badge home-card-badge--whatsapp" aria-hidden="true">
                  <Image
                    src="/images/logos/whatsapp-home.png"
                    alt=""
                    width={56}
                    height={56}
                    className="size-9 object-contain"
                    aria-hidden="true"
                  />
                </div>
                <div className="home-card-info">
                  <strong className="home-card-name">WhatsApp</strong>
                </div>
              </div>
              <div className="home-card-footer" aria-hidden="true">
                <span className="home-card-arrow">
                  <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Card 3: Gov.br */}
            <button
              type="button"
              ref={(el) => { categoryButtonRefs.current.government = el; }}
              onClick={() => chooseCategory("government")}
              className="home-category-card group"
              aria-label="Gov.br"
            >
              <div className="home-card-header">
                <div className="home-card-badge home-card-badge--gov" aria-hidden="true">
                  <Image
                    src="/images/logos/gov-br-home.webp"
                    alt=""
                    width={56}
                    height={56}
                    className="size-10 object-contain"
                    aria-hidden="true"
                  />
                </div>
                <div className="home-card-info">
                  <strong className="home-card-name">Gov.br</strong>
                </div>
              </div>
              <div className="home-card-footer" aria-hidden="true">
                <span className="home-card-arrow">
                  <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Card 4: Outros */}
            <button
              type="button"
              ref={(el) => { categoryButtonRefs.current.others = el; }}
              onClick={() => chooseCategory("others")}
              className="home-category-card group"
              aria-label="Outros"
            >
              <div className="home-card-header">
                <div className="home-card-badge home-card-badge--others" aria-hidden="true">
                  <div className="grid grid-cols-2 gap-1.5" aria-hidden="true">
                    <span className="size-3 rounded-[3.5px] bg-[#0084ff]" />
                    <span className="size-3 rounded-[3.5px] bg-[#0084ff]" />
                    <span className="size-3 rounded-[3.5px] bg-[#0084ff]" />
                    <span className="size-3 rounded-[3.5px] bg-[#0084ff]" />
                  </div>
                </div>
                <div className="home-card-info">
                  <strong className="home-card-name">Outros</strong>
                </div>
              </div>
              <div className="home-card-footer" aria-hidden="true">
                <span className="home-card-arrow">
                  <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mascote Guido à Direita */}
        <aside className="home-hero-right" aria-label="Mascote Guido lendo um livro">
          <div className="home-mascot-scene">
            <Image
              src="/images/home/mascote-guido-dark.webp"
              alt="Mascote Guido lendo um livro"
              width={1199}
              height={1312}
              priority
              className="home-mascot-image home-mascot-dark"
              sizes="(max-width: 768px) 260px, (max-width: 1200px) 380px, 480px"
            />
            <Image
              src="/images/home/mascote-guido-lendo.webp"
              alt="Mascote Guido lendo um livro"
              width={1106}
              height={1295}
              priority
              className="home-mascot-image home-mascot-light"
              sizes="(max-width: 768px) 260px, (max-width: 1200px) 380px, 480px"
            />
          </div>
        </aside>
      </div>

      {/* Modais de Seleção */}
      {bankModalOpen && (
        <BankModal banks={financialApplications} onClose={closeBankModal} onSelect={chooseBank} />
      )}

      {otherAppsModalOpen && (
        <OtherAppsModal onClose={closeOtherAppsModal} onSelectApp={chooseOtherApp} />
      )}

      {taskModalOpen && (selectedApplication || selectedOtherApp) && (
        <TaskModal
          applicationName={activeTaskModalTitle}
          tasks={activeTaskModalTasks}
          onClose={closeTaskModal}
        />
      )}

      {!onOpenVoice && standaloneVoiceOpen && (
        <AskGuidoModal
          isOpen={standaloneVoiceOpen}
          initialListening={true}
          onClose={() => setStandaloneVoiceOpen(false)}
        />
      )}
    </section>
  );
}
