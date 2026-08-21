from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Case, GeneratedDocument, Message
from app.schemas import (
    CaseDetailResponse,
    CaseSummary,
    ChatMessageOut,
    ChatMessageRequest,
    ChatMessageResponse,
    CreateCaseRequest,
    CreateCaseResponse,
    DraftRequest,
    DraftResponse,
    GeneratedDocumentOut,
    StructuredCaseResponse,
    SupportedInfo,
    Citation,
)
from app.services.workflow.graph import run_workflow
from app.services.workflow.documents import (
    generate_form_draft,
    generate_grievance_draft,
    generate_rti_draft,
)
from app.services.workflow.domains import DOMAIN_LABELS, build_summary

router = APIRouter()


def _to_structured(state: dict) -> StructuredCaseResponse:
    supported = []
    for item in state.get("supported_information") or []:
        if isinstance(item, dict):
            supported.append(
                SupportedInfo(
                    text=item.get("text") or "",
                    citation_ids=item.get("citation_ids") or [],
                )
            )
        else:
            supported.append(SupportedInfo(text=str(item)))

    citations = []
    for c in state.get("citations") or []:
        citations.append(Citation(**{k: c.get(k) for k in Citation.model_fields}))

    gen = state.get("generated_document")
    generated = None
    if gen:
        generated = GeneratedDocumentOut(
            doc_type=gen.get("doc_type", "grievance"),
            title=gen.get("title", "Draft"),
            body=gen.get("body", ""),
            disclaimer=gen.get("disclaimer", GeneratedDocumentOut.model_fields["disclaimer"].default),
            placeholders_used=gen.get("placeholders_used") or [],
        )

    status = state.get("status") or "collecting"
    if status not in {"collecting", "researching", "ready", "error"}:
        status = "collecting"

    evidence_level = state.get("evidence_level") or "insufficient"
    if evidence_level not in {"high", "moderate", "limited", "insufficient"}:
        evidence_level = "insufficient"

    return StructuredCaseResponse(
        summary=state.get("summary") or "",
        facts_from_user=_facts_list(state.get("facts") or {}),
        supported_information=supported,
        uncertainties=state.get("uncertainties") or [],
        recommended_actions=state.get("action_plan") or [],
        documents_needed=state.get("documents_needed") or [],
        generated_document=generated,
        citations=citations,
        evidence_level=evidence_level,  # type: ignore[arg-type]
        pending_question=state.get("pending_question"),
        status=status,  # type: ignore[arg-type]
        domain=state.get("domain"),
        jurisdiction=state.get("jurisdiction") or {},
        message=state.get("message") or "",
    )


def _serialize_messages(case: Case) -> list[ChatMessageOut]:
    return [
        ChatMessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in sorted(case.messages, key=lambda x: x.created_at or "")
    ]


def _facts_list(facts: dict) -> list[str]:
    out = []
    for k, v in facts.items():
        if v in (None, "", [], {}):
            continue
        out.append(f"{k.replace('_', ' ')}: {v}")
    return out


def _persist_state(case: Case, state: dict) -> None:
    case.domain = state.get("domain")
    case.language = state.get("language") or case.language
    case.jurisdiction = state.get("jurisdiction")
    case.facts = state.get("facts")
    case.missing_information = state.get("missing_information")
    analysis = dict(state.get("analysis") or {})
    if state.get("summary"):
        analysis["summary"] = state.get("summary")
    case.analysis = analysis
    case.action_plan = state.get("action_plan")
    case.documents_needed = state.get("documents_needed")
    case.evidence_level = state.get("evidence_level")
    case.supported_information = state.get("supported_information")
    case.uncertainties = state.get("uncertainties")
    case.citations = state.get("citations")
    case.pending_question = state.get("pending_question")
    case.status = state.get("status") or case.status
    case.workflow_stage = "clarifying" if state.get("awaiting_clarification") else "ready"


def _prior_from_case(case: Case) -> dict:
    return {
        "user_query": case.initial_query,
        "domain": case.domain,
        "language": case.language,
        "jurisdiction": case.jurisdiction or {},
        "facts": case.facts or {},
        "missing_information": case.missing_information or [],
        "pending_question": case.pending_question,
        "awaiting_clarification": case.status == "collecting" and bool(case.pending_question),
        "analysis": case.analysis or {},
        "action_plan": case.action_plan or [],
        "documents_needed": case.documents_needed or [],
        "evidence_level": case.evidence_level,
        "summary": (case.analysis or {}).get("summary") if isinstance(case.analysis, dict) else "",
    }


def _case_response_from_db(case: Case) -> StructuredCaseResponse:
    supported = []
    for item in case.supported_information or []:
        if isinstance(item, dict):
            supported.append(
                SupportedInfo(
                    text=item.get("text") or "",
                    citation_ids=item.get("citation_ids") or [],
                )
            )

    citations = []
    for c in case.citations or []:
        if isinstance(c, dict):
            citations.append(Citation(**{k: c.get(k) for k in Citation.model_fields}))

    return StructuredCaseResponse(
        summary=_summary_from_case(case),
        facts_from_user=_facts_list(case.facts or {}),
        supported_information=supported,
        uncertainties=case.uncertainties or [],
        recommended_actions=case.action_plan or [],
        documents_needed=case.documents_needed or [],
        citations=citations,
        evidence_level=(case.evidence_level or "insufficient"),  # type: ignore[arg-type]
        pending_question=case.pending_question,
        status=case.status if case.status in {"collecting", "researching", "ready", "error"} else "collecting",  # type: ignore[arg-type]
        domain=case.domain,
        jurisdiction=case.jurisdiction or {},
        message=case.pending_question or "Case loaded.",
    )


def _summary_from_case(case: Case) -> str:
    facts = case.facts or {}
    jur = case.jurisdiction or {}
    if isinstance(case.analysis, dict) and case.analysis.get("summary"):
        return case.analysis["summary"]
    return build_summary(case.domain or "grievance", facts, jur)


@router.get("/cases", response_model=list[CaseSummary])
async def list_cases(
    ids: str | None = None,
    db: Session = Depends(get_db),
) -> list[CaseSummary]:
    """Return case summaries. Pass comma-separated ids for 'my past cases'."""
    if not ids:
        return []

    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    if not id_list:
        return []

    cases = db.query(Case).filter(Case.id.in_(id_list)).all()
    order = {cid: idx for idx, cid in enumerate(id_list)}
    cases.sort(key=lambda c: order.get(c.id, 999))

    return [
        CaseSummary(
            case_id=c.id,
            created_at=c.created_at,
            updated_at=c.updated_at,
            status=c.status,
            domain=c.domain,
            initial_query=c.initial_query,
            summary=_summary_from_case(c),
        )
        for c in cases
    ]


@router.post("/cases", response_model=CreateCaseResponse)
async def create_case(payload: CreateCaseRequest, db: Session = Depends(get_db)) -> CreateCaseResponse:
    case = Case(
        initial_query=payload.query.strip(),
        language=payload.language or "en",
        status="collecting",
    )
    db.add(case)
    db.flush()

    db.add(Message(case_id=case.id, role="user", content=payload.query.strip()))

    try:
        state = await run_workflow(
            case_id=case.id,
            user_query=payload.query.strip(),
            latest_message=payload.query.strip(),
        )
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        raise HTTPException(status_code=503, detail="CivicAI is temporarily unavailable. Please try again.") from exc

    _persist_state(case, state)
    response = _to_structured(state)
    db.add(
        Message(
            case_id=case.id,
            role="assistant",
            content=response.message or response.summary,
            meta={"status": response.status, "pending_question": response.pending_question},
        )
    )
    db.commit()
    db.refresh(case)
    return CreateCaseResponse(
        case_id=case.id,
        response=response,
        messages=_serialize_messages(case),
    )


@router.get("/cases/{case_id}", response_model=CaseDetailResponse)
async def get_case(case_id: str, db: Session = Depends(get_db)) -> CaseDetailResponse:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    messages = _serialize_messages(case)
    return CaseDetailResponse(
        case_id=case.id,
        created_at=case.created_at,
        updated_at=case.updated_at,
        status=case.status,
        domain=case.domain,
        initial_query=case.initial_query,
        response=_case_response_from_db(case),
        messages=messages,
    )


@router.post("/chat", response_model=CreateCaseResponse)
async def chat_new(payload: CreateCaseRequest, db: Session = Depends(get_db)) -> CreateCaseResponse:
    return await create_case(payload, db)


@router.post("/chat/{case_id}/message", response_model=ChatMessageResponse)
async def chat_message(
    case_id: str,
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
) -> ChatMessageResponse:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    db.add(Message(case_id=case.id, role="user", content=payload.message.strip()))

    try:
        state = await run_workflow(
            case_id=case.id,
            user_query=case.initial_query,
            latest_message=payload.message.strip(),
            prior_state=_prior_from_case(case),
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail="CivicAI is temporarily unavailable. Please try again.") from exc

    _persist_state(case, state)
    response = _to_structured(state)
    db.add(
        Message(
            case_id=case.id,
            role="assistant",
            content=response.message or response.summary,
            meta={"status": response.status},
        )
    )
    db.commit()
    db.refresh(case)
    return ChatMessageResponse(
        case_id=case.id,
        response=response,
        messages=_serialize_messages(case),
    )


@router.get("/cases/{case_id}/messages", response_model=list[ChatMessageOut])
async def get_case_messages(case_id: str, db: Session = Depends(get_db)) -> list[ChatMessageOut]:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    return _serialize_messages(case)


@router.post("/drafts/grievance", response_model=DraftResponse)
async def draft_grievance(payload: DraftRequest, db: Session = Depends(get_db)) -> DraftResponse:
    case = db.get(Case, payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts = {**(case.facts or {}), **(payload.extra_details or {})}
    doc_data = generate_grievance_draft(facts, case.jurisdiction or {})
    doc = GeneratedDocument(
        case_id=case.id,
        doc_type="grievance",
        title=doc_data["title"],
        body=doc_data["body"],
        disclaimer=doc_data["disclaimer"],
        placeholders_used=doc_data["placeholders_used"],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DraftResponse(
        case_id=case.id,
        document=GeneratedDocumentOut(
            id=doc.id,
            doc_type=doc.doc_type,
            title=doc.title,
            body=doc.body,
            disclaimer=doc.disclaimer,
            placeholders_used=doc.placeholders_used or [],
        ),
    )


@router.post("/drafts/rti", response_model=DraftResponse)
async def draft_rti(payload: DraftRequest, db: Session = Depends(get_db)) -> DraftResponse:
    case = db.get(Case, payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts = {**(case.facts or {}), **(payload.extra_details or {})}
    doc_data = generate_rti_draft(facts, case.jurisdiction or {})
    doc = GeneratedDocument(
        case_id=case.id,
        doc_type="rti",
        title=doc_data["title"],
        body=doc_data["body"],
        disclaimer=doc_data["disclaimer"],
        placeholders_used=doc_data["placeholders_used"],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DraftResponse(
        case_id=case.id,
        document=GeneratedDocumentOut(
            id=doc.id,
            doc_type=doc.doc_type,
            title=doc.title,
            body=doc.body,
            disclaimer=doc.disclaimer,
            placeholders_used=doc.placeholders_used or [],
        ),
    )


@router.post("/drafts/form", response_model=DraftResponse)
async def draft_form(payload: DraftRequest, db: Session = Depends(get_db)) -> DraftResponse:
    case = db.get(Case, payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    facts = {**(case.facts or {}), **(payload.extra_details or {})}
    doc_data = generate_form_draft(facts, case.jurisdiction or {})
    doc = GeneratedDocument(
        case_id=case.id,
        doc_type="form",
        title=doc_data["title"],
        body=doc_data["body"],
        disclaimer=doc_data["disclaimer"],
        placeholders_used=doc_data["placeholders_used"],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DraftResponse(
        case_id=case.id,
        document=GeneratedDocumentOut(
            id=doc.id,
            doc_type=doc.doc_type,
            title=doc.title,
            body=doc.body,
            disclaimer=doc.disclaimer,
            placeholders_used=doc.placeholders_used or [],
        ),
    )
