"use client";

import { useId, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";

export interface ApplicationSearchOption {
  id?: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
}

interface ApplicationSearchProps {
  applications: ApplicationSearchOption[];
  value: string;
  onSelect: (application: ApplicationSearchOption) => void;
  disabled?: boolean;
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function optionMatches(application: ApplicationSearchOption, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;
  return [application.name, application.slug, application.category, application.description ?? ""]
    .some((value) => normalizeSearchValue(value).includes(normalizedQuery));
}

export function ApplicationSearch({
  applications,
  value,
  onSelect,
  disabled = false,
}: ApplicationSearchProps) {
  const inputId = useId();
  const listboxId = `${inputId}-results`;
  const selectedApplication = applications.find((application) => application.slug === value);
  const [query, setQuery] = useState(selectedApplication?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filteredApplications = useMemo(
    () => applications.filter((application) => optionMatches(application, query)).slice(0, 8),
    [applications, query],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const selectApplication = (application: ApplicationSearchOption) => {
    setQuery(application.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(application);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      setHighlightedIndex((current) => filteredApplications.length === 0
        ? -1
        : (current + 1) % filteredApplications.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      setHighlightedIndex((current) => filteredApplications.length === 0
        ? -1
        : current <= 0 ? filteredApplications.length - 1 : current - 1);
      return;
    }

    if (event.key === "Enter" && isOpen && highlightedIndex >= 0) {
      event.preventDefault();
      const application = filteredApplications[highlightedIndex];
      if (application) selectApplication(application);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={inputId} className="block font-bold">
        Pesquisar aplicativo
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="glass-control mt-2 min-h-14 w-full rounded-xl px-4"
        placeholder="Digite o nome ou slug do aplicativo"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-${filteredApplications[highlightedIndex]?.slug ?? ""}` : undefined}
        disabled={disabled}
      />

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] shadow-2xl">
          {filteredApplications.length > 0 ? (
            <ul id={listboxId} role="listbox" aria-label="Aplicativos encontrados" className="max-h-80 overflow-auto p-2">
              {filteredApplications.map((application, index) => (
                <li key={application.id ?? application.slug}>
                  <button
                    id={`${listboxId}-${application.slug}`}
                    type="button"
                    role="option"
                    aria-selected={application.slug === value}
                    className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${index === highlightedIndex ? "bg-[var(--primary)]/15" : "hover:bg-[var(--primary)]/10"}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectApplication(application)}
                  >
                    <span className="block font-bold">{application.name}</span>
                    <span className="mt-1 block text-sm text-[var(--muted)]">{application.category}</span>
                    {application.description && <span className="mt-1 block text-sm text-[var(--muted)]">{application.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-[var(--muted)]" role="status">Nenhum aplicativo encontrado</p>
          )}
        </div>
      )}

      {selectedApplication && !isOpen && (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Selecionado: <strong>{selectedApplication.name}</strong> · {selectedApplication.category}
        </p>
      )}
    </div>
  );
}

