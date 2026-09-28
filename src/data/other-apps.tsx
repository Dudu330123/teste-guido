import React from "react";
import type { Task } from "@/types/content";
import { otherAppsTasks } from "@/data/other-apps-guides";

export interface OtherApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
  tasks: Task[];
}

export const otherApps: OtherApp[] = [
  {
    id: "app-gmail",
    name: "Gmail",
    slug: "gmail",
    description: "E-mails, mensagens e confirmações.",
    icon: (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-200/60 p-1.5 dark:bg-white dark:border-transparent">
        <svg viewBox="0 0 48 48" className="size-8">
          <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
          <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
          <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
          <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C8.132,7.551,5.638,8.085,4.551,9.984C4.202,10.594,3.955,11.409,3,12.298z"/>
          <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341c1.744-1.308,4.238-0.774,5.325,1.125C43.798,10.594,44.045,11.409,45,12.298z"/>
        </svg>
      </div>
    ),
    tasks: otherAppsTasks.filter((t) => t.applicationId === "app-gmail"),
  },
  {
    id: "app-youtube",
    name: "YouTube",
    slug: "youtube",
    description: "Vídeos, músicas e programas.",
    icon: (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FF0000] shadow-md p-1.5 text-white">
        <svg viewBox="0 0 24 24" className="size-7 fill-current">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
    ),
    tasks: otherAppsTasks.filter((t) => t.applicationId === "app-youtube"),
  },
  {
    id: "app-google-fotos",
    name: "Google Fotos",
    slug: "google-fotos",
    description: "Fotos, vídeos e memórias.",
    icon: (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-200/60 p-1.5 dark:bg-white dark:border-transparent">
        <svg viewBox="0 0 24 24" className="size-8">
          <path fill="#EA4335" d="M12 2a5 5 0 0 0-5 5v5h5a5 5 0 0 0 5-5 5 5 0 0 0-5-5z" />
          <path fill="#4285F4" d="M2 12a5 5 0 0 0 5 5h5v-5a5 5 0 0 0-5-5 5 5 0 0 0-5 5z" />
          <path fill="#FBBC05" d="M22 12a5 5 0 0 0-5-5h-5v5a5 5 0 0 0 5 5 5 5 0 0 0 5-5z" />
          <path fill="#34A853" d="M12 22a5 5 0 0 0 5-5v-5h-5a5 5 0 0 0-5 5 5 5 0 0 0 5 5z" />
        </svg>
      </div>
    ),
    tasks: otherAppsTasks.filter((t) => t.applicationId === "app-google-fotos"),
  },
  {
    id: "app-uber",
    name: "Uber",
    slug: "uber",
    description: "Pedir viagem de carro.",
    icon: (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-black shadow-md p-1.5 text-white">
        <span className="text-sm font-black tracking-tight">Uber</span>
      </div>
    ),
    tasks: otherAppsTasks.filter((t) => t.applicationId === "app-uber"),
  },
  {
    id: "app-google-maps",
    name: "Google Maps",
    slug: "google-maps",
    description: "Rotas, endereços e GPS.",
    icon: (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-200/60 p-1.5 dark:bg-white dark:border-transparent">
        <svg viewBox="0 0 24 24" className="size-8">
          <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
          <path fill="#EA4335" d="M12 2c3.87 0 7 3.13 7 7 0 5.25-7 13-7 13V2z" />
          <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    tasks: otherAppsTasks.filter((t) => t.applicationId === "app-google-maps"),
  },
  {
    id: "app-instagram",
    name: "Instagram",
    slug: "instagram",
    description: "Fotos e mensagens de amigos.",
    icon: (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] shadow-md p-1.5 text-white">
        <svg viewBox="0 0 24 24" className="size-7 fill-current">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
    ),
    tasks: otherAppsTasks.filter((t) => t.applicationId === "app-instagram"),
  },
];
