import { NextRequest, NextResponse } from "next/server";

import {
  generateFormDraft,
  generateGrievanceDraft,
  generateRtiDraft,
} from "@/lib/civic/documents";
import {
  createCaseRecord,
  getCaseRecord,
  listCaseSummaries,
  mergeApplicantFacts,
  updateCaseRecord,
} from "@/lib/civic/store";
import { runWorkflow, toStructuredResponse } from "@/lib/civic/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(detail: string, status = 400) {
  return json({ detail }, status);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const segments = path || [];

  if (segments.length === 1 && segments[0] === "health") {
    return json({
      status: "ok",
      app: "CivicAI",
      environment: "vercel",
      database: "memory",
      ollama: "fallback",
      tavily: "not_configured",
      pinecone: "not_configured",
      timestamp: new Date().toISOString(),
    });
  }

  if (segments.length === 1 && segments[0] === "cases") {
    const ids = req.nextUrl.searchParams.get("ids");
    if (!ids) return json([]);
    return json(listCaseSummaries(ids.split(",").map((s) => s.trim()).filter(Boolean)));
  }

  if (segments.length === 2 && segments[0] === "cases") {
    const record = getCaseRecord(segments[1]);
    if (!record) return error("Case not found.", 404);
    return json({
      case_id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at,
      status: record.workflow.status,
      domain: record.workflow.domain,
      initial_query: record.initial_query,
      response: toStructuredResponse(record.workflow),
      messages: record.messages,
    });
  }

  if (segments.length === 3 && segments[0] === "cases" && segments[2] === "messages") {
    const record = getCaseRecord(segments[1]);
    if (!record) return error("Case not found.", 404);
    return json(record.messages);
  }

  return error("Not found.", 404);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const segments = path || [];
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return error("Invalid JSON body.");
  }

  if (segments.length === 1 && segments[0] === "cases") {
    const query = String(body.query || "").trim();
    if (!query) return error("Query is required.");
    const language = String(body.language || "en");
    const caseId = crypto.randomUUID();
    const workflow = runWorkflow({
      caseId,
      userQuery: query,
      latestMessage: query,
      language: language === "hi" || language === "ta" ? language : "en",
    });
    const record = createCaseRecord(query, workflow);
    return json({
      case_id: record.id,
      response: toStructuredResponse(record.workflow),
      messages: record.messages,
    });
  }

  if (segments.length === 3 && segments[0] === "chat" && segments[2] === "message") {
    const caseId = segments[1];
    const message = String(body.message || "").trim();
    if (!message) return error("Message is required.");
    const record = getCaseRecord(caseId);
    if (!record) return error("Case not found.", 404);
    const language = String(body.language || record.workflow.language || "en");
    const workflow = runWorkflow({
      caseId,
      userQuery: record.initial_query,
      latestMessage: message,
      language: language === "hi" || language === "ta" ? language : "en",
      prior: record.workflow,
    });
    const updated = updateCaseRecord(caseId, workflow, message);
    if (!updated) return error("Case not found.", 404);
    return json({
      case_id: updated.id,
      response: toStructuredResponse(updated.workflow),
      messages: updated.messages,
    });
  }

  if (segments.length === 2 && segments[0] === "drafts") {
    const caseId = String(body.case_id || "");
    const extra = (body.extra_details || {}) as Record<string, string>;
    const record = getCaseRecord(caseId);
    if (!record) return error("Case not found.", 404);
    const facts = mergeApplicantFacts(record.workflow.facts, extra);
    const jur = record.workflow.jurisdiction;
    const language = String(body.language || record.workflow.language || "en");
    const locale = language === "hi" || language === "ta" ? language : "en";
    const docType = segments[1];
    let document;
    if (docType === "rti") document = generateRtiDraft(facts, jur, locale);
    else if (docType === "form") document = generateFormDraft(facts, jur, locale);
    else if (docType === "grievance") document = generateGrievanceDraft(facts, jur, locale);
    else return error("Unknown draft type.", 404);
    return json({ case_id: caseId, document });
  }

  return error("Not found.", 404);
}
