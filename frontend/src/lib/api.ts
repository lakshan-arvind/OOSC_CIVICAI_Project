import type { Locale } from "./i18n/types";
import type {
  CaseDetailResponse,
  CaseSummary,
  ChatMessage,
  ChatMessageResponse,
  CreateCaseResponse,
  DraftResponse,
} from "./types";

const LOCAL_API = "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 60_000;
const RETRY_DELAY_MS = 2_000;
const MAX_ATTEMPTS = 2;

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isProductionHost(hostname: string) {
  return hostname.endsWith(".vercel.app") || hostname.includes("vercel.app");
}

export function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    if (isLocalHost(window.location.hostname)) {
      return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || LOCAL_API;
    }
    if (isProductionHost(window.location.hostname)) {
      return "";
    }
  }
  if (process.env.VERCEL) return "";
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || LOCAL_API;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOnce<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const apiBase = resolveApiBase();
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch (err) {
    const msg =
      err instanceof DOMException && err.name === "AbortError"
        ? "The request timed out. Please try again."
        : "Could not reach CivicAI. Please check your connection and try again.";
    throw new Error(msg);
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) {
    let detail = "CivicAI is temporarily unavailable. Please try again.";
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await requestOnce<T>(path, init);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_DELAY_MS);
    }
  }
  throw lastError ?? new Error("CivicAI is temporarily unavailable. Please try again.");
}

export const api = {
  health: () => request<{ status: string }>("/api/v1/health"),

  getCase: (caseId: string) => request<CaseDetailResponse>(`/api/v1/cases/${caseId}`),

  listCases: (ids: string[]) =>
    request<CaseSummary[]>(`/api/v1/cases?ids=${encodeURIComponent(ids.join(","))}`),

  getMessages: (caseId: string) =>
    request<ChatMessage[]>(`/api/v1/cases/${caseId}/messages`),

  createCase: (query: string, language: Locale = "en") =>
    request<CreateCaseResponse>("/api/v1/cases", {
      method: "POST",
      body: JSON.stringify({ query, language }),
    }),

  sendMessage: (caseId: string, message: string, language: Locale = "en") =>
    request<ChatMessageResponse>(`/api/v1/chat/${caseId}/message`, {
      method: "POST",
      body: JSON.stringify({ message, language }),
    }),

  draftGrievance: (caseId: string, extraDetails: Record<string, string> = {}, language: Locale = "en") =>
    request<DraftResponse>("/api/v1/drafts/grievance", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, extra_details: extraDetails, language }),
    }),

  draftRti: (caseId: string, extraDetails: Record<string, string> = {}, language: Locale = "en") =>
    request<DraftResponse>("/api/v1/drafts/rti", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, extra_details: extraDetails, language }),
    }),

  draftForm: (caseId: string, extraDetails: Record<string, string> = {}, language: Locale = "en") =>
    request<DraftResponse>("/api/v1/drafts/form", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, extra_details: extraDetails, language }),
    }),
};

export function warmBackend() {
  void api.health().catch(() => {});
}
