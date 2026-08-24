import { actions } from "@/data/actions";
import { getAdminScriptSteps } from "@/data/admin-guide-scripts";
import { financialApplications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
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
export function GuideUploadContent({
  canDelete = false,
  description,
  eyebrow,
  title,
}: GuideUploadContentProps) {
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
  const guideOptions: AdminGuideOption[] = [
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

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <p className="font-bold text-[var(--primary)]">{eyebrow}</p>
      <h1 className="mt-1 text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-xl">{description}</p>
      <GuideAdmin
        guides={guideOptions}
        bankApplications={financialApplications.map(({ slug, name }) => ({ slug, name }))}
        canDelete={canDelete}
      />
    </main>
  );
}
