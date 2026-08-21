"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CaseSummary } from "@/lib/types";
import { getCaseHistory } from "@/lib/caseHistory";

const DOMAIN_LABELS: Record<string, string> = {
  rti: "RTI drafting",
  grievance: "Municipal grievance",
  rights_navigator: "Rights navigator",
  scheme_eligibility: "Scheme eligibility",
  form_filler: "Form-filler",
  bureaucracy: "Bureaucracy translator",
};

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

interface PastCasesProps {
  onOpenCase: (caseId: string) => Promise<void>;
  loading: boolean;
}

export function PastCases({ onOpenCase, loading }: PastCasesProps) {
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

  if (fetching && cases.length === 0) {
    const ids = getCaseHistory();
    if (ids.length === 0) return null;
  }

  if (!fetching && cases.length === 0) return null;

  return (
    <section className="animate-fade-up mt-8 border-t border-stone-200/80 pt-8 [animation-delay:320ms]">
      <h2 className="text-sm font-medium text-stone-500">My past cases</h2>
      {fetching ? (
        <p className="mt-3 text-sm text-stone-500">Loading your cases...</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {cases.map((c) => (
            <li key={c.case_id}>
              <button
                type="button"
                disabled={loading}
                onClick={() => onOpenCase(c.case_id)}
                className="flex w-full flex-col rounded-md border border-stone-200 bg-white/70 px-3 py-3 text-left transition hover:border-teal-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                    {DOMAIN_LABELS[c.domain || ""] || "Civic case"}
                    <span className="ml-2 font-normal normal-case text-stone-400">
                      {c.status}
                    </span>
                  </span>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-800">
                    {c.initial_query}
                  </p>
                </div>
                <span className="mt-2 shrink-0 text-xs text-stone-500 sm:mt-0">
                  {formatDate(c.updated_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
