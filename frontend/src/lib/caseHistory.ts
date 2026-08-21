/** Case history helpers stored in the browser. */

export const CASE_STORAGE_KEY = "civicai_current_case_id";
export const CASE_HISTORY_KEY = "civicai_case_history";
const MAX_HISTORY = 30;

export function getCaseHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CASE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addCaseToHistory(caseId: string): void {
  if (typeof window === "undefined") return;
  const existing = getCaseHistory().filter((id) => id !== caseId);
  const next = [caseId, ...existing].slice(0, MAX_HISTORY);
  localStorage.setItem(CASE_HISTORY_KEY, JSON.stringify(next));
}

export function removeCaseFromHistory(caseId: string): void {
  if (typeof window === "undefined") return;
  const next = getCaseHistory().filter((id) => id !== caseId);
  localStorage.setItem(CASE_HISTORY_KEY, JSON.stringify(next));
}

export function clearCaseHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CASE_HISTORY_KEY);
}
