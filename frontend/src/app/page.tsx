"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import {
  addCaseToHistory,
  CASE_STORAGE_KEY,
} from "@/lib/caseHistory";
import type { GeneratedDocument, StructuredCaseResponse, ChatMessage } from "@/lib/types";
import { HomeHero } from "@/components/HomeHero";
import { CaseWorkspace } from "@/components/CaseWorkspace";

export default function HomePage() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [response, setResponse] = useState<StructuredCaseResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCase = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setDocument(null);
    try {
      const data = await api.getCase(id);
      setCaseId(data.case_id);
      setResponse(data.response);
      setMessages(data.messages || []);
      localStorage.setItem(CASE_STORAGE_KEY, id);
      addCaseToHistory(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "CivicAI is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const startCase = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      setDocument(null);
      try {
        const data = await api.createCase(query);
        setCaseId(data.case_id);
        setResponse(data.response);
        setMessages(data.messages || []);
        localStorage.setItem(CASE_STORAGE_KEY, data.case_id);
        addCaseToHistory(data.case_id);
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
    []
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
        addCaseToHistory(caseId);
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
    [caseId]
  );

  const generateComplaint = useCallback(async () => {
    if (!caseId) return;
    setDraftLoading(true);
    setError(null);
    try {
      const data = await api.draftGrievance(caseId);
      setDocument(data.document);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "CivicAI is temporarily unavailable. Please try again."
      );
    } finally {
      setDraftLoading(false);
    }
  }, [caseId]);

  const generateRti = useCallback(async () => {
    if (!caseId) return;
    setDraftLoading(true);
    setError(null);
    try {
      const data = await api.draftRti(caseId);
      setDocument(data.document);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "CivicAI is temporarily unavailable. Please try again."
      );
    } finally {
      setDraftLoading(false);
    }
  }, [caseId]);

  const generateForm = useCallback(async () => {
    if (!caseId) return;
    setDraftLoading(true);
    setError(null);
    try {
      const data = await api.draftForm(caseId);
      setDocument(data.document);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "CivicAI is temporarily unavailable. Please try again."
      );
    } finally {
      setDraftLoading(false);
    }
  }, [caseId]);

  const startNew = useCallback(() => {
    setCaseId(null);
    setResponse(null);
    setMessages([]);
    setDocument(null);
    setError(null);
    localStorage.removeItem(CASE_STORAGE_KEY);
  }, []);

  if (!caseId || !response) {
    return (
      <HomeHero
        onSubmit={startCase}
        onOpenCase={loadCase}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <CaseWorkspace
      caseId={caseId}
      response={response}
      messages={messages}
      loading={loading}
      error={error}
      document={document}
      onReply={sendReply}
      onGenerateComplaint={generateComplaint}
      onGenerateRti={generateRti}
      onGenerateForm={generateForm}
      onStartNew={startNew}
      draftLoading={draftLoading}
    />
  );
}
