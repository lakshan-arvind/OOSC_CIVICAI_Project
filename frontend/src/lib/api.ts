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

/**
 * Production on Vercel uses built-in Next.js API routes (same origin).
 * Local dev uses FastAPI on localhost:8000 unless overridden.
 */
export function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    if (isLocalHost(window.location.hostname)) {
      return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || LOCAL_API;
    }
    if (isProductionHost(window.location.hostname)) {
      return "";
    }
  }

  if (process.env.VERCEL) {
    return "";
  }

  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || LOCAL_API;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function networkErrorMessage(cause: unknown): string {
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return "The request timed out. Please try again.";
  }
  return "Could not reach CivicAI. Please check your connection and try again.";
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
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch (err) {
    throw new Error(networkErrorMessage(err));
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
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
    }
  }
  throw lastError ?? new Error("CivicAI is temporarily unavailable. Please try again.");
}

export const api = {
  health: () => request<{ status: string }>("/api/v1/health"),

  getCase: (caseId: string) => request<CaseDetailResponse>(`/api/v1/cases/${caseId}`),

  listCases: (ids: string[]) =>
    request<CaseSummary[]>(
      `/api/v1/cases?ids=${encodeURIComponent(ids.join(","))}`
    ),

  getMessages: (caseId: string) =>
    request<ChatMessage[]>(`/api/v1/cases/${caseId}/messages`),

  createCase: (query: string) =>
    request<CreateCaseResponse>("/api/v1/cases", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  sendMessage: (caseId: string, message: string) =>
    request<ChatMessageResponse>(`/api/v1/chat/${caseId}/message`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  draftGrievance: (caseId: string, extraDetails: Record<string, string> = {}) =>
    request<DraftResponse>("/api/v1/drafts/grievance", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, extra_details: extraDetails }),
    }),

  draftRti: (caseId: string, extraDetails: Record<string, string> = {}) =>
    request<DraftResponse>("/api/v1/drafts/rti", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, extra_details: extraDetails }),
    }),

  draftForm: (caseId: string, extraDetails: Record<string, string> = {}) =>
    request<DraftResponse>("/api/v1/drafts/form", {
      method: "POST",
      body: JSON.stringify({ case_id: caseId, extra_details: extraDetails }),
    }),
};

export function warmBackend() {
  void api.health().catch(() => {
    /* ignore */
  });
}
