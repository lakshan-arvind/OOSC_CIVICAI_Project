"use client";

import { useCallback, useEffect, useState } from "react";
import { api, warmBackend } from "@/lib/api";
import {
  addCaseToHistory,
  CASE_STORAGE_KEY,
  getCaseHistory,
} from "@/lib/caseHistory";
import {
  detailsFromFacts,
  EMPTY_APPLICANT_DETAILS,
  type ApplicantDetails,
} from "@/lib/applicantDetails";
import type { GeneratedDocument, StructuredCaseResponse, ChatMessage } from "@/lib/types";
import { AppShell } from "@/components/AppShell";
import { HomeHero } from "@/components/HomeHero";
import { CaseWorkspace } from "@/components/CaseWorkspace";

export default function HomePage() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [response, setResponse] = useState<StructuredCaseResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [applicantDetails, setApplicantDetails] = useState<ApplicantDetails>(
    EMPTY_APPLICANT_DETAILS
  );
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  const [pastCount, setPastCount] = useState(0);

  const bumpHistory = useCallback(() => {
    setPastCount(getCaseHistory().length);
    setHistoryTick((n) => n + 1);
  }, []);

  useEffect(() => {
    setPastCount(getCaseHistory().length);
  }, []);

  useEffect(() => {
    warmBackend();
  }, []);

  useEffect(() => {
    if (!response) return;
    setApplicantDetails((prev) => {
      const fromFacts = detailsFromFacts(response.facts_from_user, response.jurisdiction);
      return {
        applicant_name: prev.applicant_name || fromFacts.applicant_name,
        applicant_address: prev.applicant_address || fromFacts.applicant_address,
        phone: prev.phone || fromFacts.phone,
        email: prev.email || fromFacts.email,
        city: prev.city || fromFacts.city,
        state: prev.state || fromFacts.state,
        date: prev.date || fromFacts.date,
      };
    });
  }, [response]);

  const loadCase = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setDocument(null);
      try {
        const data = await api.getCase(id);
        setCaseId(data.case_id);
        setResponse(data.response);
        setMessages(data.messages || []);
        setApplicantDetails(
          detailsFromFacts(data.response.facts_from_user, data.response.jurisdiction)
        );
        localStorage.setItem(CASE_STORAGE_KEY, id);
        addCaseToHistory(id);
        bumpHistory();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "CivicAI is temporarily unavailable. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [bumpHistory]
  );

  const startCase = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      setDocument(null);
      setApplicantDetails(EMPTY_APPLICANT_DETAILS);
      try {
        const data = await api.createCase(query);
        setCaseId(data.case_id);
        setResponse(data.response);
        setMessages(data.messages || []);
        setApplicantDetails(
          detailsFromFacts(data.response.facts_from_user, data.response.jurisdiction)
        );
        localStorage.setItem(CASE_STORAGE_KEY, data.case_id);
        addCaseToHistory(data.case_id);
        bumpHistory();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "CivicAI is temporarily unavailable. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [bumpHistory]
  );

  const sendReply = useCallback(
    async (message: string) => {
      if (!caseId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.sendMessage(caseId, message);
        setResponse(data.response);
        setMessages(data.messages || []);
        setApplicantDetails((prev) => {
          const fromFacts = detailsFromFacts(
            data.response.facts_from_user,
            data.response.jurisdiction
          );
          return {
            applicant_name: prev.applicant_name || fromFacts.applicant_name,
            applicant_address: prev.applicant_address || fromFacts.applicant_address,
            phone: prev.phone || fromFacts.phone,
            email: prev.email || fromFacts.email,
            city: prev.city || fromFacts.city,
            state: prev.state || fromFacts.state,
            date: prev.date || fromFacts.date,
          };
        });
        addCaseToHistory(caseId);
        bumpHistory();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "CivicAI is temporarily unavailable. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [caseId, bumpHistory]
  );

  const generateComplaint = useCallback(
    async (extra: Record<string, string>) => {
      if (!caseId) return;
      setDraftLoading(true);
      setError(null);
      try {
        const data = await api.draftGrievance(caseId, extra);
        setDocument(data.document);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not generate draft.");
      } finally {
        setDraftLoading(false);
      }
    },
    [caseId]
  );

  const generateRti = useCallback(
    async (extra: Record<string, string>) => {
      if (!caseId) return;
      setDraftLoading(true);
      setError(null);
      try {
        const data = await api.draftRti(caseId, extra);
        setDocument(data.document);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not generate draft.");
      } finally {
        setDraftLoading(false);
      }
    },
    [caseId]
  );

  const generateForm = useCallback(
    async (extra: Record<string, string>) => {
      if (!caseId) return;
      setDraftLoading(true);
      setError(null);
      try {
        const data = await api.draftForm(caseId, extra);
        setDocument(data.document);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not generate draft.");
      } finally {
        setDraftLoading(false);
      }
    },
    [caseId]
  );

  const startNew = useCallback(() => {
    setCaseId(null);
    setResponse(null);
    setMessages([]);
    setDocument(null);
    setApplicantDetails(EMPTY_APPLICANT_DETAILS);
    setError(null);
    localStorage.removeItem(CASE_STORAGE_KEY);
  }, []);

  return (
    <AppShell
      onOpenCase={loadCase}
      activeCaseId={caseId}
      loading={loading}
      historyTick={historyTick}
      pastCount={pastCount}
      onHistoryChange={bumpHistory}
    >
      {!caseId || !response ? (
        <HomeHero onSubmit={startCase} loading={loading} error={error} />
      ) : (
        <CaseWorkspace
          caseId={caseId}
          response={response}
          messages={messages}
          loading={loading}
          error={error}
          document={document}
          applicantDetails={applicantDetails}
          onApplicantDetailsChange={setApplicantDetails}
          onReply={sendReply}
          onGenerateComplaint={generateComplaint}
          onGenerateRti={generateRti}
          onGenerateForm={generateForm}
          onStartNew={startNew}
          draftLoading={draftLoading}
        />
      )}
    </AppShell>
  );
}
