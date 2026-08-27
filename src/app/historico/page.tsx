import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { HistoryPanel } from "@/features/progress/history-panel";

export const metadata: Metadata = { title: "Histórico" };

export default function HistoryPage() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--compact">
        <HistoryPanel />
      </div>
    </main>
  );
}
