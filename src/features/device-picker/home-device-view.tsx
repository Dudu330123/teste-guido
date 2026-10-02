"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useDevice } from "@/features/device-picker/device-context";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { HomeSearch } from "@/features/search/home-search";
import { HomeTvSearch } from "@/features/search/home-tv-search";
import type { Application, Task } from "@/types/content";

const GuidoVoiceModal = dynamic(() => import("@/features/ai/guido-voice-modal").then((module) => module.GuidoVoiceModal));
const GuideRequestModal = dynamic(() => import("@/features/ai/guide-request-modal").then((module) => module.GuideRequestModal));

interface HomeDeviceViewProps {
  applications: Application[];
  tasks: Task[];
}

export function HomeDeviceView({ applications, tasks }: HomeDeviceViewProps) {
  const { device } = useDevice();
  const [guidoModal, setGuidoModal] = useState<"voice" | "request" | null>(null);
  const [guideRequestDraft, setGuideRequestDraft] = useState("");

  return (
    <>
      <HomeToolbar
        showAdmin={false}
        activePage="home"
        onOpenVoiceAssistant={() => setGuidoModal("voice")}
        onOpenGuideRequest={() => setGuidoModal("request")}
      />
      <div className="guido-home-content mx-auto w-full">
        {device === "televisao" ? (
          <HomeTvSearch />
        ) : (
          <HomeSearch
            applications={applications}
            tasks={tasks}
            onOpenVoice={() => setGuidoModal("voice")}
          />
        )}
      </div>
      {guidoModal === "voice" && (
        <GuidoVoiceModal
          isOpen
          onClose={() => setGuidoModal(null)}
          onUseText={(text) => {
            setGuideRequestDraft(text);
            setGuidoModal("request");
          }}
        />
      )}
      {guidoModal === "request" && (
        <GuideRequestModal
          isOpen
          initialPrompt={guideRequestDraft}
          onClose={() => setGuidoModal(null)}
        />
      )}
    </>
  );
}
