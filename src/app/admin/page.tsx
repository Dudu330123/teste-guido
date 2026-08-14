import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { actions } from "@/data/actions";
import { getAdminScriptSteps } from "@/data/admin-guide-scripts";
import { financialApplications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideAdmin, type AdminGuideOption } from "@/features/admin/guide-admin";
import { getSuperadminAccess } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Administração de guias" };

export default async function AdminPage() {
  const superadminAccess = await getSuperadminAccess();
  // Uma resposta 404 não revela a existência do painel a visitantes ou a
  // membros com papéis inferiores. A API e o RLS repetem esta autorização.
  if (!superadminAccess) notFound();

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
    <>
      <SiteHeader showAdmin />
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <p className="font-bold text-[var(--primary)]">Área administrativa experimental</p>
        <h1 className="mt-1 text-4xl font-bold sm:text-5xl">Prints dos guias</h1>
        <p className="mt-3 max-w-3xl text-xl">Analise cada passo e associe uma captura de tela sem perder a proporção original.</p>
        <GuideAdmin
          guides={guideOptions}
          bankApplications={financialApplications.map(({ slug, name }) => ({ slug, name }))}
        />
      </main>
    </>
  );
}
