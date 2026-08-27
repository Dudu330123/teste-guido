import { actions } from "@/data/actions";
import { getAdminScriptSteps } from "@/data/admin-guide-scripts";
import { financialApplications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { getCatalogFromSupabase, getUploadGuidesFromSupabase } from "@/lib/supabase/catalog";
import { GuideAdmin, type AdminGuideOption } from "./guide-admin";

interface GuideUploadContentProps {
  canDelete?: boolean;
  description: string;
  eyebrow: string;
  title: string;
}

/**
 * Mantém o mesmo catálogo de passos na área do usuário e na administração.
 * Assim, abrir o upload para contas comuns não cria uma segunda fonte editorial.
 */
export async function GuideUploadContent({
  canDelete = false,
  description,
  eyebrow,
  title,
}: GuideUploadContentProps) {
  const [remoteGuides, remoteCatalog] = await Promise.all([
    getUploadGuidesFromSupabase(),
    getCatalogFromSupabase(),
  ]);
  const androidGuide = getGuide("android")!;
  const iosGuide = getGuide("ios")!;
  const financialApplicationIds = new Set(financialApplications.map(({ id }) => id));
  const genericBankTasks = tasks.filter(({ applicationId }) => applicationId === "app-demo-bancos");
  const representedActionIds = new Set(genericBankTasks.map(({ actionId }) => actionId));

  const editorialSteps = (slug: string) => ({
    android: getAdminScriptSteps(slug, "android"),
    ios: getAdminScriptSteps(slug, "ios"),
  });

  // Guias bancários específicos por instituição são agrupados por tarefa. O
  // aplicativo é escolhido na etapa seguinte, evitando dezenas de duplicatas.
  const localGuideOptions: AdminGuideOption[] = [
    ...genericBankTasks.map((task) => ({
      slug: task.slug,
      title: task.title,
      category: "bank" as const,
      stepsByOperatingSystem: task.slug === "pagar-boleto"
        ? {
            android: getStepsForGuide(androidGuide.id),
            ios: getStepsForGuide(iosGuide.id),
          }
        : editorialSteps(task.slug),
    })),
    ...actions
      .filter(({ id }) => !representedActionIds.has(id))
      .map((action) => ({
        slug: action.slug,
        title: action.taskTitle,
        category: "bank" as const,
        stepsByOperatingSystem: editorialSteps(action.slug),
      })),
    ...tasks
      .filter(({ applicationId }) => applicationId !== "app-demo-bancos" && !financialApplicationIds.has(applicationId))
      .map((task) => ({
        slug: task.slug,
        title: task.title,
        category: "other" as const,
        stepsByOperatingSystem: editorialSteps(task.slug),
      })),
  ];
  const guidesBySlug = new Map(localGuideOptions.map((guide) => [guide.slug, guide]));
  remoteGuides?.forEach((guide) => guidesBySlug.set(guide.slug, guide));
  const guideOptions = [...guidesBySlug.values()].sort((first, second) =>
    first.title.localeCompare(second.title, "pt-BR"));
  const remoteBankApplications = remoteCatalog?.applications.filter((application) =>
    application.category === "Serviços financeiros" && application.slug !== "banco-demonstracao");
  const bankApplications = remoteBankApplications?.length ? remoteBankApplications : financialApplications;

  return (
    <div className="internal-page-content internal-page-content--compact upload-page-content">
      <header className="internal-page-intro upload-page-intro">
        <p className="internal-page-eyebrow">{eyebrow}</p>
        <h1 className="internal-page-title">{title}</h1>
        <p className="internal-page-description">{description}</p>
      </header>
      <GuideAdmin
        guides={guideOptions}
        bankApplications={bankApplications.map(({ slug, name }) => ({ slug, name }))}
        canDelete={canDelete}
      />
    </div>
  );
}
