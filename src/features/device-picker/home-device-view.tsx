"use client";

import React from "react";
import { useDevice } from "@/features/device-picker/device-context";
import { DeviceSelectorScreen } from "@/features/device-picker/device-selector-screen";
import { HomeToolbar } from "@/features/theme/home-toolbar";
import { HomeSearch } from "@/features/search/home-search";
import { HomeTvSearch } from "@/features/search/home-tv-search";
import type { Application, Task } from "@/types/content";

interface HomeDeviceViewProps {
  applications: Application[];
  tasks: Task[];
}

export function HomeDeviceView({ applications, tasks }: HomeDeviceViewProps) {
  const { device } = useDevice();

  return (
    <>
      <HomeToolbar showAdmin={false} activePage="home" />
      <div className="guido-home-content mx-auto w-full">
        {device === "televisao" ? (
          <HomeTvSearch />
        ) : (
          <HomeSearch applications={applications} tasks={tasks} />
        )}
      </div>
    </>
  );
}
