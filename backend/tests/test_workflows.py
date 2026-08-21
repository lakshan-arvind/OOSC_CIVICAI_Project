"""Sample workflow test cases for CivicAI agents."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def run_case(client: TestClient, query: str, follow_up: str | None = None) -> dict:
    r = client.post("/api/v1/cases", json={"query": query})
    assert r.status_code == 200, r.text
    data = r.json()
    case_id = data["case_id"]
    resp = data["response"]
    if follow_up and resp["status"] == "collecting":
        r2 = client.post(f"/api/v1/chat/{case_id}/message", json={"message": follow_up})
        assert r2.status_code == 200, r2.text
        resp = r2.json()["response"]
    return {"case_id": case_id, "response": resp}


# ── 1. RTI Drafting Agent ──────────────────────────────────────────────────────

def test_rti_drafting_agent(client):
    result = run_case(
        client,
        "I want to know how much the municipality spent repairing the road on my street last year.",
        "Mumbai, Maharashtra",
    )
    resp = result["response"]
    assert resp["domain"] == "rti"
    assert resp["status"] == "ready"
    assert resp["recommended_actions"]
    assert resp["citations"]

    draft = client.post("/api/v1/drafts/rti", json={"case_id": result["case_id"]})
    assert draft.status_code == 200
    assert "Right to Information Act" in draft.json()["document"]["body"]


# ── 2. Rights Navigator — Tenant ───────────────────────────────────────────────

def test_rights_navigator_tenant(client):
    result = run_case(
        client,
        "My landlord is refusing to return my security deposit after I moved out in Bangalore.",
    )
    resp = result["response"]
    assert resp["domain"] == "rights_navigator"
    assert resp["status"] == "ready"
    assert "tenant" in resp["summary"].lower() or "landlord" in resp["summary"].lower()
    assert resp["recommended_actions"]
    assert resp["citations"]


# ── 3. Rights Navigator — Consumer ───────────────────────────────────────────

def test_rights_navigator_consumer(client):
    result = run_case(
        client,
        "I bought a defective phone and the shop is not giving a refund under warranty.",
        "Delhi",
    )
    resp = result["response"]
    assert resp["domain"] == "rights_navigator"
    assert resp["status"] == "ready"
    assert resp["recommended_actions"]
    assert any("consumer" in a.lower() for a in resp["recommended_actions"] + [resp["summary"]])


# ── 4. Rights Navigator — Workplace ────────────────────────────────────────────

def test_rights_navigator_workplace(client):
    result = run_case(
        client,
        "My employer has not paid my salary for two months.",
        "Pune, Maharashtra",
    )
    resp = result["response"]
    assert resp["domain"] == "rights_navigator"
    assert resp["status"] == "ready"
    assert resp["recommended_actions"]
    assert any("labour" in a.lower() or "salary" in a.lower() or "employer" in a.lower() for a in resp["recommended_actions"])


# ── 5. Scheme Eligibility Reader ─────────────────────────────────────────────

def test_scheme_eligibility_reader(client):
    result = run_case(
        client,
        "Am I eligible for PM-KISAN if I own 2 acres of farmland in rural Tamil Nadu?",
    )
    resp = result["response"]
    assert resp["domain"] == "scheme_eligibility"
    assert resp["status"] == "ready"
    assert "pm-kisan" in resp["summary"].lower() or "scheme" in resp["summary"].lower()
    assert resp["recommended_actions"]
    assert resp["citations"]


# ── 6. Conversational Form-Filler ────────────────────────────────────────────

def test_conversational_form_filler(client):
    result = run_case(
        client,
        "Help me fill the RTI application form to ask about water supply complaints.",
        "Chennai, Tamil Nadu",
    )
    resp = result["response"]
    assert resp["domain"] == "form_filler"
    assert resp["status"] == "ready"
    assert resp["recommended_actions"]

    draft = client.post("/api/v1/drafts/form", json={"case_id": result["case_id"]})
    assert draft.status_code == 200
    body = draft.json()["document"]["body"]
    assert "APPLICANT DETAILS" in body
    assert "[YOUR NAME]" in body


# ── 7. Bureaucracy Translator ────────────────────────────────────────────────

def test_bureaucracy_translator(client):
    result = run_case(
        client,
        "What does 'public authority under Section 2(h) of RTI Act' mean in simple words?",
    )
    resp = result["response"]
    assert resp["domain"] == "bureaucracy"
    assert resp["status"] == "ready"
    assert resp["recommended_actions"]
    assert resp["citations"]
    assert any(
        "public authority" in (item.get("text") or "").lower()
        for item in resp["supported_information"]
    ) or "public authority" in resp["summary"].lower()


# ── 8. Municipal grievance (baseline) ────────────────────────────────────────

def test_municipal_grievance_baseline(client):
    result = run_case(
        client,
        "My municipality hasn't fixed the drainage problem despite several complaints.",
        "Chennai, Tamil Nadu",
    )
    resp = result["response"]
    assert resp["domain"] == "grievance"
    assert resp["status"] == "ready"
    assert "drainage" in resp["summary"].lower()

    draft = client.post("/api/v1/drafts/grievance", json={"case_id": result["case_id"]})
    assert draft.status_code == 200
    assert "[YOUR NAME]" in draft.json()["document"]["body"]
