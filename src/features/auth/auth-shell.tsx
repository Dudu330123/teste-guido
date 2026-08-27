import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export function AuthShell({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--narrow auth-page-content">
        <Link href="/" className="internal-page-back">← Voltar ao início</Link>
        <div className="glass-panel auth-page-card">
          <header>
            <h1 className="internal-page-title auth-page-title">{title}</h1>
            <p className="internal-page-description">{description}</p>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
