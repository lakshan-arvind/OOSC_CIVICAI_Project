"use client";

import { useState, type ReactNode } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PastCasesMobileToggle, PastCasesSidebar } from "@/components/PastCasesSidebar";

interface AppShellProps {
  children: ReactNode;
  onOpenCase: (caseId: string) => Promise<void>;
  activeCaseId?: string | null;
  loading: boolean;
  historyTick?: number;
  pastCount?: number;
  onHistoryChange?: () => void;
}

export function AppShell({
  children,
  onOpenCase,
  activeCaseId,
  loading,
  historyTick = 0,
  pastCount = 0,
  onHistoryChange,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      <PastCasesSidebar
        key={historyTick}
        onOpenCase={onOpenCase}
        activeCaseId={activeCaseId}
        loading={loading}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onHistoryChange={onHistoryChange}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200/60 bg-white/50 px-4 py-2">
          <div className="md:hidden">
            <PastCasesMobileToggle onClick={() => setMobileOpen(true)} count={pastCount} />
          </div>
          <div className="ml-auto">
            <LanguageSelector />
          </div>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
