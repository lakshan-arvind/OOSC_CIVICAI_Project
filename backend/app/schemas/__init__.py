from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


EvidenceLevel = Literal["high", "moderate", "limited", "insufficient"]
CaseStatus = Literal["collecting", "researching", "ready", "error"]


class HealthResponse(BaseModel):
    status: str
    app: str
    environment: str
    database: str
    ollama: str
    tavily: str
    pinecone: str
    timestamp: datetime


class Citation(BaseModel):
    source_id: str
    title: str
    authority: Optional[str] = None
    authority_level: str = "UNKNOWN"
    source_url: Optional[str] = None
    section: Optional[str] = None
    page: Optional[str] = None
    last_verified: Optional[str] = None
    snippet: Optional[str] = None


class SupportedInfo(BaseModel):
    text: str
    citation_ids: list[str] = Field(default_factory=list)


class GeneratedDocumentOut(BaseModel):
    id: Optional[str] = None
    doc_type: str
    title: str
    body: str
    disclaimer: str = "AI-generated draft — verify the details before submitting."
    placeholders_used: list[str] = Field(default_factory=list)


class StructuredCaseResponse(BaseModel):
    summary: str = ""
    facts_from_user: list[str] = Field(default_factory=list)
    supported_information: list[SupportedInfo] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    documents_needed: list[str] = Field(default_factory=list)
    generated_document: Optional[GeneratedDocumentOut] = None
    citations: list[Citation] = Field(default_factory=list)
    evidence_level: EvidenceLevel = "insufficient"
    pending_question: Optional[str] = None
    status: CaseStatus = "collecting"
    domain: Optional[str] = None
    jurisdiction: dict[str, Any] = Field(default_factory=dict)
    message: str = ""


class CreateCaseRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=4000)
    language: Optional[str] = None


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: Optional[datetime] = None


class CreateCaseResponse(BaseModel):
    case_id: str
    response: StructuredCaseResponse
    messages: list[ChatMessageOut] = Field(default_factory=list)


class CaseDetailResponse(BaseModel):
    case_id: str
    created_at: datetime
    updated_at: datetime
    status: str
    domain: Optional[str]
    initial_query: str
    response: StructuredCaseResponse
    messages: list[ChatMessageOut] = Field(default_factory=list)


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)


class ChatMessageResponse(BaseModel):
    case_id: str
    response: StructuredCaseResponse
    messages: list[ChatMessageOut] = Field(default_factory=list)


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    state: Optional[str] = None
    city: Optional[str] = None


class SearchResult(BaseModel):
    title: str
    url: Optional[str] = None
    content: str
    authority_level: str
    score: float = 0.0


class SearchResponse(BaseModel):
    results: list[SearchResult]


class RetrieveRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    top_k: int = Field(default=5, ge=1, le=20)
    state: Optional[str] = None


class DraftRequest(BaseModel):
    case_id: str
    extra_details: dict[str, Any] = Field(default_factory=dict)


class DraftResponse(BaseModel):
    case_id: str
    document: GeneratedDocumentOut


class ErrorResponse(BaseModel):
    detail: str
    code: str = "error"


class CaseSummary(BaseModel):
    case_id: str
    created_at: datetime
    updated_at: datetime
    status: str
    domain: Optional[str] = None
    initial_query: str
    summary: str = ""
