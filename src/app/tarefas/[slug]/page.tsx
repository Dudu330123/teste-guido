import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { tasks } from "@/data/guides";
import { OsSelector } from "@/features/guides/os-selector";

interface TaskPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "Escolha seu celular" };

export default async function TaskPage({ params }: TaskPageProps) {
  const { slug } = await params;
  const task = tasks.find((item) => item.slug === slug);
  if (!task) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/aplicativos/banco-demonstracao" className="font-bold underline">← Voltar para tarefas</Link>
        <p className="mt-8 font-semibold text-[var(--primary)]">Guia educativo</p>
        <h1 className="text-4xl font-bold">{task.title}</h1>
        <p className="mt-3 text-xl">{task.description}</p>
        <div role="note" className="mt-6 rounded-2xl border-2 border-[#a66a00] bg-[#fff3cf] p-5">
          <p className="font-bold">Demonstração não validada</p>
          <p>As telas são fictícias e as posições podem ser diferentes no aplicativo do seu banco. O guia termina antes de qualquer confirmação.</p>
        </div>
        <OsSelector />
      </main>
    </>
  );
}
