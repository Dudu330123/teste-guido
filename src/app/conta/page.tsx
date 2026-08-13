import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { AccountPanel } from "@/features/auth/account-panel";

export const metadata: Metadata = { title: "Minha conta" };

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <AccountPanel />
      </main>
    </>
  );
}
