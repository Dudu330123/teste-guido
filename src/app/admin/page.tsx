import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { getGuide, getStepsForGuide } from "@/data/guides";
import { GuideAdmin } from "@/features/admin/guide-admin";

export const metadata: Metadata = { title: "Administração de guias" };

export default function AdminPage() {
  const androidGuide = getGuide("android")!;
  const iosGuide = getGuide("ios")!;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <p className="font-bold text-[var(--primary)]">Área administrativa experimental</p>
        <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Prints dos guias</h1>
        <p className="mt-3 max-w-3xl text-xl">Analise cada passo e associe uma captura de tela sem perder a proporção original.</p>
        <GuideAdmin stepsByOperatingSystem={{
          android: getStepsForGuide(androidGuide.id),
          ios: getStepsForGuide(iosGuide.id),
        }} />
      </main>
    </>
  );
}
