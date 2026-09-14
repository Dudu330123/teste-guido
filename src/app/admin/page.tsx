import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { GuideUploadContent } from "@/features/admin/guide-upload-content";
import { getSuperadminAccess } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Administração de guias" };

export default async function AdminPage() {
  const superadminAccess = await getSuperadminAccess();
  // Uma resposta 404 não revela a existência do painel a visitantes ou a
  // membros com papéis inferiores. A API e o RLS repetem esta autorização.
  if (!superadminAccess) notFound();

  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader showAdmin />
      <GuideUploadContent
        eyebrow="Área administrativa experimental"
        title="Prints dos guias"
        description="Analise cada passo e associe uma captura de tela sem perder a proporção original."
        canDelete
      />
    </main>
  );
}
