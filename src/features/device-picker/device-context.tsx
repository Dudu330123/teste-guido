"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type DeviceType = "celular" | "televisao";

interface DeviceContextType {
  device: DeviceType | null;
  isReady: boolean;
  selectDevice: (device: DeviceType) => void;
  resetDevice: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const STORAGE_KEY = "guido-device-preference";

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceType | null>("celular");
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as DeviceType | null;
      if (saved === "celular" || saved === "televisao") {
        setDevice(saved);
      }
    } catch {
      // Ignora erro se localStorage não estiver disponível
    }
  }, []);

  const selectDevice = (newDevice: DeviceType) => {
    setDevice(newDevice);
    try {
      window.localStorage.setItem(STORAGE_KEY, newDevice);
    } catch {}
  };

  const resetDevice = () => {
    setDevice(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <DeviceContext.Provider
      value={{
        device,
        isReady,
        selectDevice,
        resetDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    return {
      device: null as DeviceType | null,
      isReady: true,
      selectDevice: () => {},
      resetDevice: () => {},
    };
  }
  return context;
}
