"use client";

import React, { useState } from "react";
import { useDevice } from "@/features/device-picker/device-context";
import { DeviceSelectorScreen } from "@/features/device-picker/device-selector-screen";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { HomeSearch } from "@/features/search/home-search";
import { HomeTvSearch } from "@/features/search/home-tv-search";
import { AskGuidoModal } from "@/features/ai/ask-guido-modal";
import type { Application, Task } from "@/types/content";

interface HomeDeviceViewProps {
  applications: Application[];
  tasks: Task[];
}

export function HomeDeviceView({ applications, tasks }: HomeDeviceViewProps) {
  const { device } = useDevice();
  const [askGuidoState, setAskGuidoState] = useState<{ open: boolean; voice: boolean }>({
    open: false,
    voice: false,
  });

  return (
    <>
      <HomeToolbar
        showAdmin={false}
        activePage="home"
        onOpenAskGuido={() => setAskGuidoState({ open: true, voice: false })}
      />
      <div className="guido-home-content mx-auto w-full">
        {device === "televisao" ? (
          <HomeTvSearch />
        ) : (
          <HomeSearch
            applications={applications}
            tasks={tasks}
            onOpenVoice={() => setAskGuidoState({ open: true, voice: true })}
          />
        )}
      </div>
      {askGuidoState.open && (
        <AskGuidoModal
          isOpen={askGuidoState.open}
          initialListening={askGuidoState.voice}
          onClose={() => setAskGuidoState({ open: false, voice: false })}
        />
      )}
    </>
  );
}
