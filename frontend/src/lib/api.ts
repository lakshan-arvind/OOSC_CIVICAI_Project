import type {
  CaseDetailResponse,
  CaseSummary,
  ChatMessage,
  ChatMessageResponse,
  CreateCaseResponse,
  DraftResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error("CivicAI is temporarily unavailable. Please try again.");
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
