import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export function AuthShell({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-10">
        <Link href="/" className="font-bold underline">← Voltar ao início</Link>
        <div className="mt-7 rounded-3xl border-2 border-[var(--border)] bg-white p-6 sm:p-8">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-3">{description}</p>
          {children}
        </div>
      </main>
    </>
  );
}
