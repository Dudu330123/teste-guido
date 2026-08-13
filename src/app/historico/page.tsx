import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { HistoryPanel } from "@/features/progress/history-panel";

export const metadata: Metadata = { title: "Histórico" };

export default function HistoryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <HistoryPanel />
      </main>
    </>
  );
}
