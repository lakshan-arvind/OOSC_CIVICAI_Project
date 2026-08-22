"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CaseSummary } from "@/lib/types";
import {
  clearCaseHistory,
  getCaseHistory,
  removeCaseFromHistory,
} from "@/lib/caseHistory";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface PastCasesSidebarProps {
  onOpenCase: (caseId: string) => Promise<void>;
  activeCaseId?: string | null;
  loading: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onHistoryChange?: () => void;
}

export function PastCasesSidebar({
  onOpenCase,
  activeCaseId,
  loading,
  mobileOpen,
  onMobileClose,
  onHistoryChange,
}: PastCasesSidebarProps) {
  const { t } = useLanguage();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [fetching, setFetching] = useState(true);

  const load = useCallback(async () => {
    const ids = getCaseHistory();
    if (ids.length === 0) {
      setCases([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    try {
      const data = await api.listCases(ids);
      setCases(data);
    } catch {
      setCases([]);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(caseId: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeCaseFromHistory(caseId);
    setCases((prev) => prev.filter((c) => c.case_id !== caseId));
    onHistoryChange?.();
  }

  function handleDeleteAll() {
    if (!window.confirm(t.confirmClearAll)) return;
    clearCaseHistory();
    setCases([]);
    onHistoryChange?.();
  }

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-800">{t.pastCases}</h2>
        <div className="flex items-center gap-1">
          {cases.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
            >
              {t.clearAll}
            </button>
          )}
          <button
            type="button"
            className="rounded p-1 text-stone-500 hover:bg-stone-100 md:hidden"
            onClick={onMobileClose}
            aria-label={t.close}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {fetching ? (
          <p className="px-1 text-sm text-stone-500">{t.pastCasesLoading}</p>
        ) : cases.length === 0 ? (
          <p className="px-1 text-sm leading-relaxed text-stone-500">{t.pastCasesEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {cases.map((c) => {
              const active = activeCaseId === c.case_id;
              const domainKey = c.domain as keyof typeof t.domainLabels;
              return (
                <li key={c.case_id}>
                  <div
                    className={`group relative rounded-md border transition ${
                      active
                        ? "border-teal-300 bg-teal-50/80"
                        : "border-stone-200 bg-white/80 hover:border-teal-200 hover:bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={loading}
                      onClick={async () => {
                        await onOpenCase(c.case_id);
                        onMobileClose();
                      }}
                      className="w-full px-3 py-2.5 pr-9 text-left"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-800">
                        {t.domainLabels[domainKey] || t.domainLabels.other}
                      </span>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-800">{c.initial_query}</p>
                      <p className="mt-1 text-[11px] text-stone-500">
                        {formatDate(c.updated_at)} · {t.statusLabels[c.status] || c.status}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(c.case_id, e)}
                      className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-stone-500 opacity-100 transition hover:bg-red-50 hover:text-red-700 md:opacity-0 md:group-hover:opacity-100"
                    >
                      {t.remove}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-stone-900/40 md:hidden"
          onClick={onMobileClose}
          aria-label={t.closeOverlay}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col border-r border-stone-200/80 bg-[#f7f4ef]/95 backdrop-blur transition-transform md:static md:z-auto md:w-72 md:shrink-0 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export function PastCasesMobileToggle({
  onClick,
  count,
}: {
  onClick: () => void;
  count: number;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-700 hover:bg-stone-50 md:hidden"
    >
      {t.pastCases}
      {count > 0 && (
        <span className="rounded-full bg-teal-800 px-2 py-0.5 text-xs text-white">{count}</span>
      )}
    </button>
  );
}
