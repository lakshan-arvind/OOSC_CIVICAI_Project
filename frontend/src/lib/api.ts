import type {
  CaseDetailResponse,
  CaseSummary,
  ChatMessage,
  ChatMessageResponse,
  CreateCaseResponse,
  DraftResponse,
} from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);
const REQUEST_TIMEOUT_MS = 120_000;
const RETRY_DELAY_MS = 4_000;
const MAX_ATTEMPTS = 2;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function networkErrorMessage(cause: unknown): string {
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return (
      "The server is taking too long to respond. On the free Render plan the first " +
      "request can take up to 90 seconds while the server wakes up — please try again."
    );
  }
  return (
    "Could not reach the CivicAI server. If this is your first visit today, wait a " +
    "moment and try again while the backend wakes up on Render."
  );
}

async function requestOnce<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
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

/** Wake the Render backend on page load so the first submit is faster. */
export function warmBackend() {
  void api.health().catch(() => {
    /* ignore warm-up failures */
  });
}
