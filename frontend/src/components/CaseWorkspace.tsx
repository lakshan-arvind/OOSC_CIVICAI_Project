"use client";

import { FormEvent, useState } from "react";
import type { ApplicantDetails } from "@/lib/applicantDetails";
import {
  isApplicantDetailsComplete,
  toExtraDetails,
} from "@/lib/applicantDetails";
import { downloadDocument } from "@/lib/downloadDocument";
import type { ChatMessage, GeneratedDocument, StructuredCaseResponse } from "@/lib/types";
import { ApplicantDetailsForm } from "@/components/ApplicantDetailsForm";
import { ChatHistory } from "@/components/ChatHistory";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CaseWorkspaceProps {
  caseId: string;
  response: StructuredCaseResponse;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  document: GeneratedDocument | null;
  applicantDetails: ApplicantDetails;
  onApplicantDetailsChange: (details: ApplicantDetails) => void;
  onReply: (message: string) => Promise<void>;
  onGenerateComplaint: (extra: Record<string, string>) => Promise<void>;
  onGenerateRti: (extra: Record<string, string>) => Promise<void>;
  onGenerateForm: (extra: Record<string, string>) => Promise<void>;
  onStartNew: () => void;
  draftLoading: boolean;
}

function domainLabel(domain: string | null | undefined, labels: Record<string, string>) {
  return labels[domain || ""] || labels.other;
}

export function CaseWorkspace({
  caseId,
  response,
  messages,
  loading,
  error,
  document: generatedDocument,
  applicantDetails,
  onApplicantDetailsChange,
  onReply,
  onGenerateComplaint,
  onGenerateRti,
  onGenerateForm,
  onStartNew,
  draftLoading,
}: CaseWorkspaceProps) {
  const { t } = useLanguage();
  const [reply, setReply] = useState("");
  const [showDetailsErrors, setShowDetailsErrors] = useState(false);
  const collecting = response.status === "collecting";

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() || loading) return;
    const msg = reply.trim();
    setReply("");
    await onReply(msg);
  }

  async function runDraft(
    action: (extra: Record<string, string>) => Promise<void>
  ) {
    if (!isApplicantDetailsComplete(applicantDetails)) {
      setShowDetailsErrors(true);
      window.document.getElementById("applicant-details")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setShowDetailsErrors(false);
    await action(toExtraDetails(applicantDetails));
  }

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#f7f4ef_0%,#eef3f1_40%,#f8faf9_100%)]">
      <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-teal-900 sm:text-xl">
              {t.appName}
            </p>
            <p className="truncate text-xs text-stone-500">
              {domainLabel(response.domain, t.domainLabels)} · {t.caseLabel} {caseId.slice(0, 8)}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNew}
            className="shrink-0 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            {t.newCase}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <ChatHistory messages={messages} loading={loading} />

        {loading && messages.length > 0 && <p className="sr-only">{t.loadingResponse}</p>}

        {loading && messages.length === 0 && (
          <p className="mt-6 animate-pulse text-sm text-teal-800">
            {response.message || t.checkingSources}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <p>{error}</p>
          </div>
        )}

        {collecting && !loading && (
          <section className="mt-6">
            <p className="whitespace-pre-line text-base leading-relaxed text-stone-700">
              {response.message || t.needMoreInfo}
            </p>
            {response.pending_question && (
              <p className="mt-4 font-medium text-stone-900">{response.pending_question}</p>
            )}
            <form onSubmit={handleReply} className="mt-6">
              <label htmlFor="reply" className="sr-only">
                {t.yourAnswer}
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={t.replyPlaceholder}
                className="w-full rounded-md border border-stone-300 bg-white/90 px-4 py-3 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                disabled={loading}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !reply.trim()}
                  className="min-h-12 rounded-md bg-teal-800 px-5 text-white hover:bg-teal-900 disabled:opacity-50"
                >
                  {t.continue}
                </button>
              </div>
            </form>
          </section>
        )}

        {response.status === "ready" && !loading && (
          <div className="mt-6 space-y-8 pb-8">
            <section>
              <h2 className="font-display text-xl text-stone-900">{t.yourSituation}</h2>
              <p className="mt-3 text-base leading-relaxed text-stone-700">{response.summary}</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-stone-900">{t.officialSourcesSay}</h2>
              {response.supported_information.length === 0 ? (
                <p className="mt-3 text-stone-600">
                  {response.uncertainties[0] || t.insufficientInfo}
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {response.supported_information.map((item) => (
                    <li key={item.text} className="text-base leading-relaxed text-stone-700">
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl text-stone-900">{t.whatYouCanDo}</h2>
              <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-stone-700">
                {response.recommended_actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </section>

            <section
              id="applicant-details"
              className="rounded-md border border-stone-200 bg-white p-4 sm:p-5"
            >
              <h2 className="font-display text-lg text-stone-900 sm:text-xl">{t.yourDetails}</h2>
              <p className="mt-2 text-sm text-stone-600">{t.detailsHelp}</p>
              <div className="mt-4">
                <ApplicantDetailsForm
                  details={applicantDetails}
                  onChange={onApplicantDetailsChange}
                  showErrors={showDetailsErrors}
                />
              </div>
            </section>

            <section className="rounded-md border border-stone-200 bg-[#f7f4ef]/95 p-4 sm:p-5">
              <h2 className="font-display text-lg text-stone-900">{t.generateDocument}</h2>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {(response.domain === "grievance" || !response.domain) && (
                  <button
                    type="button"
                    disabled={draftLoading}
                    onClick={() => runDraft(onGenerateComplaint)}
                    className="min-h-12 flex-1 rounded-md bg-teal-800 px-4 text-sm text-white hover:bg-teal-900 disabled:opacity-50 sm:min-w-[12rem]"
                  >
                    {draftLoading ? t.preparingDraft : t.generateComplaint}
                  </button>
                )}
                {response.domain === "rti" && (
                  <button
                    type="button"
                    disabled={draftLoading}
                    onClick={() => runDraft(onGenerateRti)}
                    className="min-h-12 flex-1 rounded-md bg-teal-800 px-4 text-sm text-white hover:bg-teal-900 disabled:opacity-50"
                  >
                    {t.generateRti}
                  </button>
                )}
                {response.domain === "form_filler" && (
                  <>
                    <button
                      type="button"
                      disabled={draftLoading}
                      onClick={() => runDraft(onGenerateForm)}
                      className="min-h-12 flex-1 rounded-md bg-teal-800 px-4 text-sm text-white hover:bg-teal-900 disabled:opacity-50"
                    >
                      {t.generateForm}
                    </button>
                    <button
                      type="button"
                      disabled={draftLoading}
                      onClick={() => runDraft(onGenerateRti)}
                      className="min-h-12 flex-1 rounded-md border border-teal-800 px-4 text-sm text-teal-900 hover:bg-teal-50 disabled:opacity-50"
                    >
                      {t.generateRti}
                    </button>
                  </>
                )}
              </div>
            </section>

            {generatedDocument && (
              <section className="rounded-md border border-stone-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                    {generatedDocument.disclaimer}
                  </p>
                  <button
                    type="button"
                    onClick={() => downloadDocument(generatedDocument)}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-teal-800 px-4 text-sm font-medium text-teal-900 hover:bg-teal-50"
                  >
                    {t.downloadTxt}
                  </button>
                </div>
                <h3 className="mt-3 font-display text-xl text-stone-900">
                  {generatedDocument.title}
                </h3>
                {generatedDocument.placeholders_used.length > 0 && (
                  <p className="mt-2 text-sm text-amber-800">
                    {t.placeholdersRemain}{" "}
                    {generatedDocument.placeholders_used.join(", ")}
                  </p>
                )}
                <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-stone-50 p-4 font-sans text-sm leading-relaxed text-stone-800">
                  {generatedDocument.body}
                </pre>
              </section>
            )}

            <section>
              <h2 className="font-display text-xl text-stone-900">{t.officialSources}</h2>
              <div className="mt-4 space-y-4">
                {response.citations.map((c) => (
                  <article
                    key={c.source_id}
                    className="border-t border-stone-200 pt-4 first:border-t-0 first:pt-0"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                      {c.authority_level === "STATUTORY"
                        ? t.statutorySource
                        : c.authority_level === "OFFICIAL"
                          ? t.officialSource
                          : t.trustedSource}
                    </p>
                    <h3 className="mt-1 text-base font-medium text-stone-900">{c.title}</h3>
                    {c.source_url && (
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-teal-800 underline underline-offset-2"
                      >
                        {t.openSource}
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
              {response.message || t.insufficientInfo}
            </p>
            <button
              type="button"
              onClick={onStartNew}
              className="mt-6 min-h-12 rounded-md bg-teal-800 px-5 text-white"
            >
              {t.startNewCase}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
