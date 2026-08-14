import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { applications, financialApplications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideViewer } from "@/features/guides/guide-viewer";
import { getGuideFromSupabase } from "@/lib/supabase/catalog";
import { applyPublicGuideImages, getPublicGuideImages } from "@/lib/supabase/public-guide-images";

interface DynamicGuidePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ os?: string; app?: string }>;
}

export const metadata: Metadata = { title: "Guia passo a passo" };

export default async function DynamicGuidePage({ params, searchParams }: DynamicGuidePageProps) {
  const [{ slug }, { os, app }] = await Promise.all([params, searchParams]);
  if (os !== "android" && os !== "ios") redirect(`/tarefas/${encodeURIComponent(slug)}`);
  const selectedApplication = financialApplications.find((application) => application.slug === app);
  const publicImages = await getPublicGuideImages(slug, selectedApplication?.slug ?? null, os);

  const remoteContent = await getGuideFromSupabase(slug, os);
  if (remoteContent) return <GuideViewer
    {...remoteContent}
    application={selectedApplication ?? remoteContent.application}
    steps={applyPublicGuideImages(remoteContent.steps, publicImages)}
  />;

  // Somente a demonstração explicitamente identificada possui fallback local.
  // Guias reais nunca são inventados quando o Supabase está indisponível.
  if (slug !== "pagar-boleto") notFound();
  const guide = getGuide(os);
  const task = tasks.find((item) => item.id === guide?.taskId);
  const application = applications.find((item) => item.id === task?.applicationId);
  if (!guide || !task || !application) notFound();
  return <GuideViewer
    application={selectedApplication ?? application}
    guide={guide}
    steps={applyPublicGuideImages(getStepsForGuide(guide.id), publicImages)}
    task={task}
  />;
}
