import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { GuideUploadContent } from "@/features/admin/guide-upload-content";

export const metadata: Metadata = { title: "Enviar print" };

export default async function SendGuideImagePage() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader activePage="upload" />
      <GuideUploadContent
        eyebrow="Colabore com os guias"
        title="Enviar um print"
        description="Escolha o guia e o passo correto. O print será publicado imediatamente para todos, mesmo sem login."
      />
    </main>
  );
}
