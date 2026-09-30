"use client";

import React, { useState } from "react";
import { tvTasks } from "@/data/tv-guides";

export function HomeTvSearch() {
  const [query, setQuery] = useState("");

  const filteredTasks = query.trim()
    ? tvTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description.toLowerCase().includes(query.toLowerCase()) ||
          task.category.toLowerCase().includes(query.toLowerCase())
      )
    : tvTasks;

  return (
    <section aria-labelledby="tv-search-title" className="home-hero">
      <div className="home-hero-copy">
        <h1 id="tv-search-title" className="home-title">
          O que você quer fazer na <span className="home-title-accent">TV?</span>
        </h1>

        <form
          className="guido-search-form"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="home-tv-search-input" className="sr-only">
            Pesquisar ajuda para Smart TV
          </label>
          <input
            id="home-tv-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite: Netflix, YouTube, Wi-Fi, controle..."
            className="home-search-input"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="home-search-icon fill-none"
            stroke="currentColor"
            strokeWidth="2.25"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" strokeLinecap="round" />
          </svg>
        </form>

        <div className="home-guided-area mt-6">
          <section aria-labelledby="tv-categories-title" className="home-category-picker">
            <h2 id="tv-categories-title">Tarefas de Smart TV</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between rounded-3xl border-2 border-indigo-200 bg-white/90 p-5 shadow-sm transition-all hover:border-indigo-400 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-3xl shadow-sm">
                      {task.icon}
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                        {task.category}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {task.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-600">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
                    <span className="rounded-xl bg-indigo-600 px-3 py-1 text-xs font-black text-white">
                      Ver guia →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
