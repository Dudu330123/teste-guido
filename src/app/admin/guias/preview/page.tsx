import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { applications } from "@/data/applications";
import { GuidePreviewWorkspace } from "@/features/admin/guide-preview-workspace";
import { GuideUploadContent } from "@/features/admin/guide-upload-content";

export const metadata: Metadata = { title: "Criar e editar guias" };

const applicationOptions = applications
  .map(({ id, slug, name, category, description }) => ({ id, slug, name, category, description }))
  .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));

/**
 * Centraliza o roteiro e os arquivos do guia para que a equipe não precise
 * alternar entre duas páginas durante a mesma tarefa editorial.
 */
export default async function GuideCreationPreviewPage() {
  return (
    <main className="guido-home internal-page min-h-screen">
      <SiteHeader showAdmin={false} activePage="guides" />
      <section className="guide-management-intro internal-page-content internal-page-content--compact" aria-labelledby="guide-management-title">
        <p className="internal-page-eyebrow">Central de guias</p>
        <h1 id="guide-management-title" className="internal-page-title">Criar, editar e adicionar prints</h1>
        <p className="internal-page-description">Monte um novo roteiro, revise um rascunho ou complete com imagens um guia que já existe.</p>
        <nav className="guide-management-actions" aria-label="Atalhos da central de guias">
          <a href="#criar-guia" className="primary-action">Criar ou editar roteiro</a>
          <a href="#prints-dos-guias" className="secondary-action">Adicionar prints</a>
        </nav>
      </section>
      <div id="criar-guia">
      <GuidePreviewWorkspace applications={applicationOptions} />
      </div>
      <section id="prints-dos-guias" className="guide-management-upload" aria-label="Adicionar prints aos guias">
        <GuideUploadContent
          eyebrow="Guias existentes"
          title="Editar os prints de um guia"
          description="Escolha um guia, o aplicativo e o celular. Depois envie ou substitua o print diretamente em cada passo."
        />
      </section>
    </main>
  );
}
