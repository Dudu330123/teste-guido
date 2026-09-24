import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { applications, financialApplications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideViewer } from "@/features/guides/guide-viewer";
import { getGuideFromSupabase } from "@/lib/catalog";
import { safeReturnPath } from "@/lib/navigation/return-path";
import { applyPublicGuideImages, getPublicGuideImages } from "@/lib/public-guide-images";

interface GuidePageProps {
  searchParams: Promise<{ os?: string; app?: string; preview?: string; returnTo?: string }>;
}

export const metadata: Metadata = { title: "Guia: Pagar um boleto" };

export default async function GuidePage({ searchParams }: GuidePageProps) {
  const { os, app, preview, returnTo } = await searchParams;
  if (os !== "android" && os !== "ios") redirect("/tarefas/pagar-boleto");
  const selectedApplication = financialApplications.find((application) => application.slug === app);
  const defaultTaskPath = `/tarefas/pagar-boleto${selectedApplication ? `?app=${encodeURIComponent(selectedApplication.slug)}` : ""}`;
  const guideReturnTo = returnTo ? safeReturnPath(returnTo, defaultTaskPath) : defaultTaskPath;

  // Permite revisar o fluxo completo no localhost sem depender do conteúdo
  // remoto. A prévia nunca é habilitada em produção e não altera o catálogo.
  const localPreview = preview === "local" && process.env.NODE_ENV !== "production";
  if (localPreview) {
    const guide = getGuide(os);
    const task = tasks.find((item) => item.id === guide?.taskId);
    const application = applications.find((item) => item.id === task?.applicationId);
    if (!guide || !task || !application) redirect("/tarefas/pagar-boleto");
    return <GuideViewer
      application={selectedApplication ?? application}
      guide={guide}
      steps={getStepsForGuide(guide.id)}
      task={task}
      returnTo={guideReturnTo}
    />;
  }

  const remoteContent = await getGuideFromSupabase("pagar-boleto", os);
  const publicImages = await getPublicGuideImages(
    remoteContent?.imageContext?.guideSlug ?? "pagar-boleto",
    selectedApplication?.slug ?? remoteContent?.imageContext?.applicationSlug ?? null,
    os,
  );
  if (remoteContent) {
    const stepsWithAudio = remoteContent.steps.map((step) => ({
      ...step,
      audioPath: step.audioPath || `/audio/guias/pagar-boleto/step-${step.order}.mp3`,
    }));
    return <GuideViewer
      {...remoteContent}
      application={selectedApplication ?? remoteContent.application}
      steps={applyPublicGuideImages(stepsWithAudio, publicImages)}
      returnTo={guideReturnTo}
    />;
  }
  const guide = getGuide(os);
  const task = tasks.find((item) => item.id === guide?.taskId);
  const application = applications.find((item) => item.id === task?.applicationId);
  if (!guide || !task || !application) redirect("/tarefas/pagar-boleto");

  return <GuideViewer
    application={selectedApplication ?? application}
    guide={guide}
    steps={applyPublicGuideImages(getStepsForGuide(guide.id), publicImages)}
    task={task}
    returnTo={guideReturnTo}
  />;
}
