import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { GuidePreviewWorkspace } from "@/features/admin/guide-preview-workspace";

export const metadata: Metadata = { title: "Prévia do editor de guias" };

const applicationOptions = applications
  .map(({ id, slug, name, category, description }) => ({ id, slug, name, category, description }))
  .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));

/** Prévia pública e local para revisar rascunhos antes da integração com o Supabase. */
export default function GuideCreationPreviewPage() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader showAdmin={false} />
      <GuidePreviewWorkspace applications={applicationOptions} />
    </main>
  );
}
