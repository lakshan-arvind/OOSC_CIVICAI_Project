import type { ChatMessage, CaseSummary } from "../types";
import type { WorkflowState } from "./workflow";

export interface StoredCase {
  id: string;
  initial_query: string;
  created_at: string;
  updated_at: string;
  workflow: WorkflowState;
  messages: ChatMessage[];
}

const globalStore = globalThis as unknown as {
  civicCases?: Map<string, StoredCase>;
};

function store(): Map<string, StoredCase> {
  if (!globalStore.civicCases) {
    globalStore.civicCases = new Map();
  }
  return globalStore.civicCases;
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function createCaseRecord(query: string, workflow: WorkflowState): StoredCase {
  const id = workflow.case_id || uuid();
  const ts = now();
  const record: StoredCase = {
    id,
    initial_query: query.trim(),
    created_at: ts,
    updated_at: ts,
    workflow: { ...workflow, case_id: id },
    messages: [
      { id: uuid(), role: "user", content: query.trim(), created_at: ts },
      {
        id: uuid(),
        role: "assistant",
        content: workflow.message || workflow.summary,
        created_at: ts,
      },
    ],
  };
  store().set(id, record);
  return record;
}

export function getCaseRecord(id: string): StoredCase | undefined {
  return store().get(id);
}

export function updateCaseRecord(id: string, workflow: WorkflowState, userMessage: string): StoredCase | undefined {
  const existing = store().get(id);
  if (!existing) return undefined;
  const ts = now();
  existing.workflow = workflow;
  existing.updated_at = ts;
  existing.messages.push({ id: uuid(), role: "user", content: userMessage, created_at: ts });
  existing.messages.push({
    id: uuid(),
    role: "assistant",
    content: workflow.message || workflow.summary,
    created_at: ts,
  });
  store().set(id, existing);
  return existing;
}

export function listCaseSummaries(ids: string[]): CaseSummary[] {
  const order = new Map(ids.map((id, i) => [id, i]));
  return ids
    .map((id) => store().get(id))
    .filter((c): c is StoredCase => Boolean(c))
    .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
    .map((c) => ({
      case_id: c.id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      status: c.workflow.status,
      domain: c.workflow.domain,
      initial_query: c.initial_query,
      summary: c.workflow.summary,
    }));
}

export function mergeApplicantFacts(
  facts: Record<string, unknown>,
  extra: Record<string, string>
): Record<string, unknown> {
  const out = { ...facts };
  for (const [k, v] of Object.entries(extra)) {
    if (v?.trim()) out[k] = v.trim();
  }
  return out;
}
