import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminScriptSteps } from "@/data/admin-guide-scripts";
import { applications, financialApplications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideViewer } from "@/features/guides/guide-viewer";
import { getGuideFromSupabase } from "@/lib/catalog";
import { safeReturnPath } from "@/lib/navigation/return-path";
import { applyPublicGuideImages, getPublicGuideImages } from "@/lib/public-guide-images";
import type { Guide, OperatingSystem } from "@/types/content";

interface DynamicGuidePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ os?: string; app?: string; returnTo?: string }>;
}

export const metadata: Metadata = { title: "Guia passo a passo" };

export default async function DynamicGuidePage({ params, searchParams }: DynamicGuidePageProps) {
  const [{ slug }, { os, app, returnTo }] = await Promise.all([params, searchParams]);
  if (os !== "android" && os !== "ios") redirect(`/tarefas/${encodeURIComponent(slug)}`);
  const currentOs: OperatingSystem = os === "ios" ? "ios" : "android";
  const selectedApplication = financialApplications.find((application) => application.slug === app);
  const remoteContent = await getGuideFromSupabase(slug, currentOs);
  const imageGuideSlug = remoteContent?.imageContext?.guideSlug ?? slug;
  const imageApplicationSlug = selectedApplication?.slug
    ?? remoteContent?.imageContext?.applicationSlug
    ?? null;
  const defaultTaskPath = `/tarefas/${encodeURIComponent(slug)}${selectedApplication ? `?app=${encodeURIComponent(selectedApplication.slug)}` : ""}`;
  const guideReturnTo = returnTo ? safeReturnPath(returnTo, defaultTaskPath) : defaultTaskPath;
  const publicImages = await getPublicGuideImages(
    imageGuideSlug,
    imageApplicationSlug,
    currentOs,
  );
  if (remoteContent) {
    const stepsWithAudio = remoteContent.steps.map((step) => ({
      ...step,
      audioPath: step.audioPath || `/audio/guias/${imageGuideSlug}/step-${step.order}.mp3`,
    }));
    return <GuideViewer
      {...remoteContent}
      application={selectedApplication ?? remoteContent.application}
      steps={applyPublicGuideImages(stepsWithAudio, publicImages)}
      returnTo={guideReturnTo}
    />;
  }

  // Fallback local:
  if (slug === "pagar-boleto") {
    const guide = getGuide(currentOs);
    const task = tasks.find((item) => item.id === guide?.taskId);
    const application = applications.find((item) => item.id === task?.applicationId);
    if (!guide || !task || !application) notFound();
    return <GuideViewer
      application={selectedApplication ?? application}
      guide={guide}
      steps={applyPublicGuideImages(getStepsForGuide(guide.id), publicImages)}
      task={task}
      returnTo={guideReturnTo}
    />;
  }

  const scriptSteps = getAdminScriptSteps(slug, currentOs);
  const task = tasks.find((item) => item.slug === slug);
  const taskApp = task ? applications.find((item) => item.id === task.applicationId) : undefined;
  if (scriptSteps.length > 0 && task && taskApp) {
    const guide: Guide = {
      id: `editorial-guide-${slug}-${currentOs}`,
      taskId: task.id,
      operatingSystem: currentOs,
      appVersion: "1.0",
      guideVersion: "1.0",
      lastReviewedAt: new Date().toISOString(),
      status: "published",
      estimatedMinutes: 5,
    };
    return <GuideViewer
      application={selectedApplication ?? taskApp}
      guide={guide}
      steps={applyPublicGuideImages(scriptSteps, publicImages)}
      task={task}
      returnTo={guideReturnTo}
    />;
  }

  notFound();
}
