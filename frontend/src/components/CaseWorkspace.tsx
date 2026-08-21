"use client";

import { FormEvent, useState } from "react";
import type { ChatMessage, GeneratedDocument, StructuredCaseResponse } from "@/lib/types";
import { ChatHistory } from "@/components/ChatHistory";

interface CaseWorkspaceProps {
  caseId: string;
  response: StructuredCaseResponse;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  document: GeneratedDocument | null;
  onReply: (message: string) => Promise<void>;
  onGenerateComplaint: () => Promise<void>;
  onGenerateRti: () => Promise<void>;
  onGenerateForm: () => Promise<void>;
  onStartNew: () => void;
  draftLoading: boolean;
}

function domainLabel(domain?: string | null) {
  const labels: Record<string, string> = {
    rti: "RTI drafting",
    grievance: "Municipal service complaint",
    rights_navigator: "Rights navigator",
    scheme_eligibility: "Scheme eligibility",
    form_filler: "Conversational form-filler",
    bureaucracy: "Bureaucracy translator",
  };
  return labels[domain || ""] || "Civic case";
}

export function CaseWorkspace({
  caseId,
  response,
  messages,
  loading,
  error,
  document,
  onReply,
  onGenerateComplaint,
  onGenerateRti,
  onGenerateForm,
  onStartNew,
  draftLoading,
}: CaseWorkspaceProps) {
  const [reply, setReply] = useState("");
  const collecting = response.status === "collecting";

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() || loading) return;
    const msg = reply.trim();
    setReply("");
    await onReply(msg);
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#f7f4ef_0%,#eef3f1_40%,#f8faf9_100%)]">
      <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="font-display text-xl font-semibold text-teal-900">CivicAI</p>
            <p className="text-xs text-stone-500">Case {caseId.slice(0, 8)}</p>
          </div>
          <button
            type="button"
            onClick={onStartNew}
            className="min-h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-700 hover:bg-stone-50"
          >
            Start New Case
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
          Your case
        </p>
        <h1 className="mt-2 font-display text-2xl text-stone-900 sm:text-3xl">
          {domainLabel(response.domain)}
        </h1>

        <ChatHistory messages={messages} loading={loading} />

        {loading && messages.length > 0 && (
          <p className="sr-only">Loading response</p>
        )}

        {loading && messages.length === 0 && (
          <p className="mt-6 animate-pulse text-sm text-teal-800">
            {response.message || "Checking official sources..."}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              type="button"
              className="mt-2 text-sm font-medium underline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {collecting && !loading && (
          <section className="mt-8">
            <p className="text-base leading-relaxed text-stone-700 whitespace-pre-line">
              {response.message ||
                "CivicAI needs a little more information to understand your situation."}
            </p>
            {response.pending_question && (
              <p className="mt-4 font-medium text-stone-900">
                {response.pending_question}
              </p>
            )}
            <form onSubmit={handleReply} className="mt-6">
              <label htmlFor="reply" className="sr-only">
                Your answer
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Type your answer..."
                className="w-full rounded-md border border-stone-300 bg-white/90 px-4 py-3 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                disabled={loading}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !reply.trim()}
                  className="min-h-12 rounded-md bg-teal-800 px-5 text-white hover:bg-teal-900 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </form>
          </section>
        )}

        {response.status === "ready" && !loading && (
          <div className="mt-8 space-y-10">
            <section>
              <h2 className="font-display text-xl text-stone-900">Your situation</h2>
              <p className="mt-3 text-base leading-relaxed text-stone-700">
                {response.summary}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-stone-900">
                What official sources say
              </h2>
              {response.supported_information.length === 0 ? (
                <p className="mt-3 text-stone-600">
                  {response.uncertainties[0] ||
                    "I couldn't find enough authoritative information to answer this reliably."}
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {response.supported_information.map((item) => (
                    <li
                      key={item.text}
                      className="text-base leading-relaxed text-stone-700"
                    >
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
              {response.uncertainties.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-amber-900">
                  {response.uncertainties.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl text-stone-900">What you can do</h2>
              <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-stone-700">
                {response.recommended_actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl text-stone-900">
                Information / documents you may need
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-stone-700">
                {response.documents_needed.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </section>

            <section className="sticky bottom-0 -mx-4 border-t border-stone-200 bg-[#f7f4ef]/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
              <h2 className="font-display text-base text-stone-900 sm:text-lg">
                Generate a document
              </h2>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {(response.domain === "grievance" || !response.domain) && (
                  <button
                    type="button"
                    disabled={draftLoading}
                    onClick={onGenerateComplaint}
                    className="min-h-12 flex-1 rounded-md bg-teal-800 px-4 text-sm text-white hover:bg-teal-900 disabled:opacity-50 sm:text-base"
                  >
                    {draftLoading ? "Preparing draft..." : "Generate Complaint"}
                  </button>
                )}
                {response.domain === "rti" && (
                  <button
                    type="button"
                    disabled={draftLoading}
                    onClick={onGenerateRti}
                    className="min-h-12 flex-1 rounded-md bg-teal-800 px-4 text-sm text-white hover:bg-teal-900 disabled:opacity-50 sm:text-base"
                  >
                    Generate RTI Draft
                  </button>
                )}
                {response.domain === "form_filler" && (
                  <>
                    <button
                      type="button"
                      disabled={draftLoading}
                      onClick={onGenerateForm}
                      className="min-h-12 flex-1 rounded-md bg-teal-800 px-4 text-sm text-white hover:bg-teal-900 disabled:opacity-50 sm:text-base"
                    >
                      Generate Pre-filled Form
                    </button>
                    <button
                      type="button"
                      disabled={draftLoading}
                      onClick={onGenerateRti}
                      className="min-h-12 flex-1 rounded-md border border-teal-800 px-4 text-sm text-teal-900 hover:bg-teal-50 disabled:opacity-50 sm:text-base"
                    >
                      Generate RTI Draft
                    </button>
                  </>
                )}
              </div>
            </section>

            {document && (
              <section className="rounded-md border border-stone-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  {document.disclaimer}
                </p>
                <h3 className="mt-3 font-display text-xl text-stone-900">
                  {document.title}
                </h3>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-800">
                  {document.body}
                </pre>
              </section>
            )}

            <section>
              <h2 className="font-display text-xl text-stone-900">Official sources</h2>
              <div className="mt-4 space-y-4">
                {response.citations.map((c) => (
                  <article
                    key={c.source_id}
                    className="border-t border-stone-200 pt-4 first:border-t-0 first:pt-0"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                      {c.authority_level === "STATUTORY"
                        ? "Statutory source"
                        : c.authority_level === "OFFICIAL"
                          ? "Official source"
                          : "Trusted source"}
                    </p>
                    <h3 className="mt-1 text-base font-medium text-stone-900">
                      {c.title}
                    </h3>
                    {c.authority && (
                      <p className="mt-1 text-sm text-stone-600">{c.authority}</p>
                    )}
                    <div className="mt-2 space-y-1 text-sm text-stone-500">
                      {c.section && <p>Section: {c.section}</p>}
                      {c.page && <p>Page: {c.page}</p>}
                      {c.last_verified && <p>Last verified: {c.last_verified}</p>}
                    </div>
                    {c.source_url && (
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-teal-800 underline underline-offset-2"
                      >
                        Open official source
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {response.status === "error" && !loading && (
          <section className="mt-8">
            <p className="text-base text-stone-700">
              {response.message ||
                "I couldn't find enough authoritative information to answer this reliably."}
            </p>
            <button
              type="button"
              onClick={onStartNew}
              className="mt-6 min-h-12 rounded-md bg-teal-800 px-5 text-white"
            >
              Start New Case
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
