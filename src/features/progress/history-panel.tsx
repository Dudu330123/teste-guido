"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { applications } from "@/data/applications";
import { guides, tasks } from "@/data/guides";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/validation/env";
import type { UserProgress } from "@/types/progress";
import { listProgress } from "./progress-storage";
import { loadRemoteHistory } from "./remote-progress";

type HistoryState = "loading" | "unconfigured" | "signed_out" | "ready";

interface HistoryItem {
  applicationName: string;
  href: string;
  progress: UserProgress;
  taskTitle: string;
}

function describeProgressStatus(progress: UserProgress) {
  if (progress.status === "completed") return "Concluído";
  if (progress.status === "in_progress") return "Em andamento";
  return "Não iniciado";
}

function buildHistoryItems(progressEntries: UserProgress[]): HistoryItem[] {
  return progressEntries.flatMap((progress) => {
    const guide = guides.find((item) => item.id === progress.guideId);
    const task = tasks.find((item) => item.id === guide?.taskId);
    const application = applications.find((item) => item.id === task?.applicationId);
    if (!guide || !task || !application) return [];

    return [{
      applicationName: application.name,
      href: `/guias/${task.slug}?os=${progress.operatingSystem}`,
      progress,
      taskTitle: task.title,
    }];
  });
}

async function loadAvailableHistory() {
  const localItems = buildHistoryItems(listProgress(window.localStorage));
  const remoteItems: HistoryItem[] = (await loadRemoteHistory()).map((remote) => ({
    applicationName: remote.applicationName,
    href: `/guias/${remote.taskSlug}?os=${remote.operatingSystem}`,
    taskTitle: remote.taskTitle,
    progress: {
      guideId: remote.guideId,
      currentStep: remote.currentStep,
      status: remote.status,
      lastAccessedAt: remote.lastAccessedAt,
      guideVersion: remote.guideVersion,
      operatingSystem: remote.operatingSystem,
    },
  }));
  const newestByGuide = new Map<string, HistoryItem>();
  [...localItems, ...remoteItems].forEach((item) => {
      const current = newestByGuide.get(item.progress.guideId);
      if (!current || item.progress.lastAccessedAt > current.progress.lastAccessedAt) {
        newestByGuide.set(item.progress.guideId, item);
      }
    });
  return [...newestByGuide.values()].sort((first, second) =>
    second.progress.lastAccessedAt.localeCompare(first.progress.lastAccessedAt),
  );
}

export function HistoryPanel() {
  const [state, setState] = useState<HistoryState>(() =>
    getSupabaseConfig().configured ? "loading" : "unconfigured",
  );
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        setState("signed_out");
        return;
      }

      setUser(data.user);
      setItems(await loadAvailableHistory());
      setState("ready");
    });
  }, []);

  if (state === "loading") {
    return <p role="status" className="glass-panel rounded-3xl p-6 font-semibold">Carregando seu histórico…</p>;
  }

  if (state === "unconfigured") {
    return (
      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <h1 className="text-4xl font-bold">Histórico</h1>
        <p className="mt-4">O histórico da conta será ativado quando a autenticação do Supabase estiver configurada.</p>
        <Link href="/" className="secondary-action mt-6 inline-flex min-h-12 items-center px-4 py-2 font-bold">Voltar ao início</Link>
      </section>
    );
  }

  if (state === "signed_out") {
    return (
      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <h1 className="text-4xl font-bold">Histórico</h1>
        <p className="mt-4">Entre na sua conta para consultar os últimos guias acessados.</p>
        <Link href="/entrar" className="primary-action mt-6 inline-flex min-h-12 items-center px-5 py-2 font-bold">Entrar</Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="history-title">
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <h1 id="history-title" className="text-4xl font-bold">Histórico</h1>
        <p className="mt-3 text-[var(--muted)]">Últimos guias acessados por {user?.email}</p>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel mt-6 rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Nenhum guia acessado ainda</h2>
          <p className="mt-3">Quando você iniciar um guia, ele aparecerá aqui.</p>
          <Link href="/" className="primary-action mt-6 inline-flex min-h-12 items-center px-5 py-2 font-bold">Procurar um guia</Link>
        </div>
      ) : (
        <ol className="mt-6 space-y-4" aria-label="Últimos guias acessados">
          {items.map(({ applicationName, href, progress, taskTitle }) => (
            <li key={progress.guideId} className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-[var(--primary)]">{applicationName} · {progress.operatingSystem === "ios" ? "iPhone" : "Outro"}</p>
                  <h2 className="mt-1 text-2xl font-bold">{taskTitle}</h2>
                  <p className="mt-2 text-[var(--muted)]">
                    {describeProgressStatus(progress)} · Passo {progress.currentStep + 1}
                  </p>
                  <p className="mt-1 text-base text-[var(--muted)]">
                    Último acesso: {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(progress.lastAccessedAt))}
                  </p>
                </div>
                <Link href={href} className="primary-action inline-flex min-h-12 shrink-0 items-center justify-center px-5 py-2 font-bold">
                  {progress.status === "completed" ? "Ver guia" : "Continuar guia"}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
