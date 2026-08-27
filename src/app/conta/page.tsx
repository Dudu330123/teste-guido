import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { AccountPanel } from "@/features/auth/account-panel";

export const metadata: Metadata = { title: "Minha conta" };

export default function AccountPage() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader />
      <div className="internal-page-content internal-page-content--narrow">
        <AccountPanel />
      </div>
    </main>
  );
}
