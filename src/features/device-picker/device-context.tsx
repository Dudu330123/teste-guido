"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type DeviceType = "celular" | "televisao";

interface DeviceContextType {
  device: DeviceType | null;
  isReady: boolean;
  selectDevice: (device: DeviceType) => void;
  resetDevice: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const STORAGE_KEY = "guido-device-preference";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function getClientSnapshot(): DeviceType {
  if (typeof window === "undefined") return "celular";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "celular" || saved === "televisao") return saved;
  } catch {}
  return "celular";
}

function getServerSnapshot(): DeviceType {
  return "celular";
}

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const device = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const selectDevice = useCallback((newDevice: DeviceType) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, newDevice);
    } catch {}
    notify();
  }, []);

  const resetDevice = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    notify();
  }, []);

  const value = useMemo(
    () => ({
      device,
      isReady: true,
      selectDevice,
      resetDevice,
    }),
    [device, selectDevice, resetDevice],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
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
