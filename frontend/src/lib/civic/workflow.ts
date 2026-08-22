import type { Locale } from "../i18n/types";
import {
  clarificationQuestion,
  localizedActions,
  localizedClaims,
  localizedMessages,
  localizedSummary,
} from "../i18n/workflowContent";
import type { EvidenceLevel, StructuredCaseResponse } from "../types";
import {
  factsList,
  heuristicDomain,
  heuristicFacts,
  parseJurisdiction,
  searchQuery,
} from "./domains";
import { resolveLocalAuthority } from "./india-geography";
import { KNOWLEDGE_BASE, searchKnowledge } from "./knowledge";

export interface WorkflowState {
  case_id: string;
  user_query: string;
  latest_user_message: string;
  domain?: string;
  language: Locale;
  jurisdiction: Record<string, unknown>;
  facts: Record<string, unknown>;
  missing_information: string[];
  pending_question?: string | null;
  awaiting_clarification: boolean;
  evidence: Array<Record<string, unknown>>;
  action_plan: string[];
  documents_needed: string[];
  supported_information: Array<{ text: string; citation_ids: string[] }>;
  uncertainties: string[];
  citations: Array<Record<string, unknown>>;
  evidence_level: EvidenceLevel;
  status: "collecting" | "researching" | "ready" | "error";
  message: string;
  summary: string;
}

function filterSupported(
  texts: string[],
  evidence: Array<Record<string, unknown>>
): Array<{ text: string; citation_ids: string[] }> {
  const evidenceText = evidence.map((e) => String(e.content || "")).join(" ").toLowerCase();
  const out: Array<{ text: string; citation_ids: string[] }> = [];
  for (const claim of texts) {
    const tokens = claim.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
    const hits = tokens.filter((t) => evidenceText.includes(t)).length;
    const supported = tokens.length === 0 || hits >= Math.max(1, Math.floor(tokens.length / 4));
    if (!supported) continue;
    const ids = evidence
      .filter((e) => tokens.some((t) => String(e.content || "").toLowerCase().includes(t)))
      .map((e) => String(e.id || e.source_id || ""))
      .filter(Boolean);
    out.push({ text: claim, citation_ids: ids.length ? ids : [String(evidence[0]?.id || "src-1")] });
  }
  return out;
}

function evidenceLevel(items: Array<Record<string, unknown>>): EvidenceLevel {
  if (!items.length) return "insufficient";
  const levels = new Set(items.map((i) => String(i.authority_level || "")));
  if (levels.has("STATUTORY") || levels.has("OFFICIAL")) {
    return items.length >= 2 ? "high" : "moderate";
  }
  return "limited";
}

function mergeJurisdiction(base: Record<string, unknown>, incoming: Record<string, unknown>) {
  const out = { ...base };
  for (const [k, v] of Object.entries(incoming)) {
    if (v) out[k] = v;
  }
  return out;
}

function needsClarification(
  domain: string,
  jurisdiction: Record<string, unknown>,
  facts: Record<string, unknown>
): { awaiting: boolean; missing: string[] } {
  const jur = jurisdiction || {};
  if (domain === "bureaucracy") return { awaiting: false, missing: [] };
  if (["scheme_eligibility", "rights_navigator", "rti"].includes(domain)) {
    if (!jur.state) return { awaiting: true, missing: ["state"] };
    return { awaiting: false, missing: [] };
  }
  if (domain === "form_filler") {
    const missing: string[] = [];
    if (!jur.state) missing.push("state");
    if (!jur.city) missing.push("city");
    if (missing.length) return { awaiting: true, missing };
    if (!facts.form_type) return { awaiting: true, missing: ["form_type"] };
    return { awaiting: false, missing: [] };
  }
  const missing: string[] = [];
  if (!jur.state) missing.push("state");
  if (!jur.city) missing.push("city");
  return { awaiting: missing.length > 0, missing };
}

export function runWorkflow(input: {
  caseId: string;
  userQuery: string;
  latestMessage: string;
  language?: Locale;
  prior?: Partial<WorkflowState>;
}): WorkflowState {
  const prior = input.prior || {};
  const language: Locale = input.language || prior.language || "en";
  const userQuery = input.userQuery || prior.user_query || input.latestMessage;
  const latest = input.latestMessage;
  const msgs = localizedMessages(language);

  const domain = prior.domain || heuristicDomain(userQuery);
  let jurisdiction = mergeJurisdiction(prior.jurisdiction || {}, parseJurisdiction(userQuery));
  jurisdiction = mergeJurisdiction(jurisdiction, parseJurisdiction(latest));

  let facts = heuristicFacts(userQuery, { ...(prior.facts || {}) });
  facts = heuristicFacts(latest, facts);

  if (prior.awaiting_clarification) {
    jurisdiction = mergeJurisdiction(jurisdiction, parseJurisdiction(latest));
    if (jurisdiction.city) facts.city = jurisdiction.city;
    if (jurisdiction.state) facts.state = jurisdiction.state;
  }

  const clar = needsClarification(domain, jurisdiction, facts);
  if (clar.awaiting) {
    const question = clarificationQuestion(domain, clar.missing, language);
    return {
      case_id: input.caseId,
      user_query: userQuery,
      latest_user_message: latest,
      domain,
      language,
      jurisdiction,
      facts,
      missing_information: clar.missing,
      pending_question: question,
      awaiting_clarification: true,
      evidence: [],
      action_plan: [],
      documents_needed: [],
      supported_information: [],
      uncertainties: [],
      citations: [],
      evidence_level: "insufficient",
      status: "collecting",
      message: `${msgs.needMoreInfo}\n\n${question}`,
      summary: msgs.domainLabel(domain),
    };
  }

  if (jurisdiction.city && jurisdiction.state && !jurisdiction.local_authority) {
    const resolved = resolveLocalAuthority(
      String(jurisdiction.city),
      String(jurisdiction.state)
    );
    jurisdiction.local_authority = resolved.localAuthority;
    jurisdiction.government_level = "local";
    if (resolved.portalUrl) jurisdiction.portal_url = resolved.portalUrl;
  }

  const area = String(facts.rights_area || "general");
  const q = searchQuery(domain, facts, jurisdiction, userQuery);
  const docs = searchKnowledge(q, {
    state: jurisdiction.state as string | undefined,
    city: jurisdiction.city as string | undefined,
    domain,
    area,
    topK: 6,
  });
  const evidence = docs.map((d) => ({
    id: d.id,
    source_id: d.id,
    title: d.title,
    url: d.source_url,
    source_url: d.source_url,
    content: d.content,
    authority_level: d.authority_level,
    authority: d.authority,
    section: d.section,
    last_verified: d.last_verified,
  }));

  const level = evidenceLevel(evidence);
  const uncertainties: string[] = [];
  if (level === "insufficient") {
    uncertainties.push(msgs.insufficientInfo);
  }

  const claims = localizedClaims(domain, area, jurisdiction.city as string | undefined, language);
  const supported = filterSupported(claims, evidence);
  const summary = localizedSummary(domain, facts, jurisdiction, language);
  const authority = String(jurisdiction.local_authority || "your municipal / local body");
  const { actions, documents } =
    level === "insufficient"
      ? { actions: [], documents: [] }
      : localizedActions(domain, area, authority, language);

  const citations = evidence
    .filter((e) => e.source_url && String(e.source_url).startsWith("https://"))
    .map((e, idx) => ({
      source_id: String(e.id || `src-${idx + 1}`),
      title: e.title || "Official source",
      authority: e.authority,
      authority_level: e.authority_level || "OFFICIAL",
      source_url: e.source_url || e.url,
      section: e.section,
      last_verified: e.last_verified,
      snippet: String(e.content || "").slice(0, 220),
    }));

  const supportedWithCitations = supported.map((s) => ({
    text: s.text,
    citation_ids: s.citation_ids.length ? s.citation_ids : citations[0] ? [String(citations[0].source_id)] : [],
  }));

  return {
    case_id: input.caseId,
    user_query: userQuery,
    latest_user_message: latest,
    domain,
    language,
    jurisdiction,
    facts,
    missing_information: [],
    pending_question: null,
    awaiting_clarification: false,
    evidence,
    action_plan: actions,
    documents_needed: documents,
    supported_information: supportedWithCitations,
    uncertainties,
    citations,
    evidence_level: level,
    status: level === "insufficient" ? "error" : "ready",
    message: level === "insufficient" ? msgs.insufficientInfo : msgs.foundFromSources,
    summary,
  };
}

export function toStructuredResponse(state: WorkflowState): StructuredCaseResponse {
  return {
    summary: state.summary,
    facts_from_user: factsList(state.facts),
    supported_information: state.supported_information,
    uncertainties: state.uncertainties,
    recommended_actions: state.action_plan,
    documents_needed: state.documents_needed,
    generated_document: null,
    citations: state.citations.map((c) => ({
      source_id: String(c.source_id),
      title: String(c.title || "Official source"),
      authority: (c.authority as string) || null,
      authority_level: String(c.authority_level || "OFFICIAL"),
      source_url: (c.source_url as string) || null,
      section: (c.section as string) || null,
      page: null,
      last_verified: (c.last_verified as string) || null,
      snippet: (c.snippet as string) || null,
    })),
    evidence_level: state.evidence_level,
    pending_question: state.pending_question,
    status: state.status,
    domain: state.domain,
    jurisdiction: state.jurisdiction,
    message: state.message,
  };
}

export function defaultKnowledgeFallback() {
  return KNOWLEDGE_BASE.length;
}
