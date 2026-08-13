import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { applications } from "@/data/applications";
import { getGuide, getStepsForGuide, tasks } from "@/data/guides";
import { GuideViewer } from "@/features/guides/guide-viewer";
import { getGuideFromApi } from "@/lib/api/catalog";

interface GuidePageProps {
  searchParams: Promise<{ os?: string }>;
}

export const metadata: Metadata = { title: "Guia: Pagar um boleto" };

export default async function GuidePage({ searchParams }: GuidePageProps) {
  const { os } = await searchParams;
  if (os !== "android" && os !== "ios") redirect("/tarefas/pagar-boleto");
  const remoteContent = await getGuideFromApi("pagar-boleto", os);
  if (remoteContent) {
    return <GuideViewer {...remoteContent} />;
  }
  const guide = getGuide(os);
  const task = tasks.find((item) => item.id === guide?.taskId);
  const application = applications.find((item) => item.id === task?.applicationId);
  if (!guide || !task || !application) redirect("/tarefas/pagar-boleto");

  return <GuideViewer application={application} guide={guide} steps={getStepsForGuide(guide.id)} task={task} />;
}
