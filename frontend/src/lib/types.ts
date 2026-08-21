export type EvidenceLevel = "high" | "moderate" | "limited" | "insufficient";
export type CaseStatus = "collecting" | "researching" | "ready" | "error";

export interface Citation {
  source_id: string;
  title: string;
  authority?: string | null;
  authority_level: string;
  source_url?: string | null;
  section?: string | null;
  page?: string | null;
  last_verified?: string | null;
  snippet?: string | null;
}

export interface SupportedInfo {
  text: string;
  citation_ids: string[];
}

export interface GeneratedDocument {
  id?: string | null;
  doc_type: string;
  title: string;
  body: string;
  disclaimer: string;
  placeholders_used: string[];
}

export interface StructuredCaseResponse {
  summary: string;
  facts_from_user: string[];
  supported_information: SupportedInfo[];
  uncertainties: string[];
  recommended_actions: string[];
  documents_needed: string[];
  generated_document?: GeneratedDocument | null;
  citations: Citation[];
  evidence_level: EvidenceLevel;
  pending_question?: string | null;
  status: CaseStatus;
  domain?: string | null;
  jurisdiction: Record<string, unknown>;
  message: string;
}

export interface CreateCaseResponse {
  case_id: string;
  response: StructuredCaseResponse;
  messages: ChatMessage[];
}

export interface ChatMessageResponse {
  case_id: string;
  response: StructuredCaseResponse;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at?: string | null;
}

export interface CaseSummary {
  case_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  domain?: string | null;
  initial_query: string;
  summary: string;
}

export interface CaseDetailResponse {
  case_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  domain?: string | null;
  initial_query: string;
  response: StructuredCaseResponse;
  messages: ChatMessage[];
}

export interface DraftResponse {
  case_id: string;
  document: GeneratedDocument;
}
