def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    data = r.json()
    assert data["app"] == "CivicAI"
    assert data["status"] == "ok"


def test_create_case_asks_clarification(client):
    r = client.post(
        "/api/v1/cases",
        json={"query": "My municipality hasn't fixed the drainage problem despite several complaints."},
    )
    assert r.status_code == 200
    data = r.json()
    assert "case_id" in data
    assert data["response"]["status"] == "collecting"
    assert data["response"]["pending_question"]


def test_chennai_demo_flow(client):
    r = client.post(
        "/api/v1/cases",
        json={"query": "My municipality hasn't fixed the drainage problem despite several complaints."},
    )
    case_id = r.json()["case_id"]

    r2 = client.post(
        f"/api/v1/chat/{case_id}/message",
        json={"message": "Chennai, Tamil Nadu"},
    )
    assert r2.status_code == 200
    resp = r2.json()["response"]
    assert resp["status"] in {"ready", "error"}
    assert resp["jurisdiction"].get("city") == "Chennai"
    assert resp["domain"] == "grievance"
    if resp["status"] == "ready":
        assert "drainage" in (resp["summary"] or "").lower()
        assert resp["recommended_actions"]
        assert resp["citations"]


def test_grievance_draft(client):
    r = client.post(
        "/api/v1/cases",
        json={"query": "Drainage problem in Chennai, Tamil Nadu despite several complaints."},
    )
    case_id = r.json()["case_id"]
    # May still clarify or be ready depending on parsing
    if r.json()["response"]["status"] == "collecting":
        client.post(f"/api/v1/chat/{case_id}/message", json={"message": "Chennai, Tamil Nadu"})

    d = client.post("/api/v1/drafts/grievance", json={"case_id": case_id})
    assert d.status_code == 200
    body = d.json()["document"]["body"]
    assert "[YOUR NAME]" in body
    assert "AI-generated draft" in d.json()["document"]["disclaimer"]


def test_search(client):
    r = client.post("/api/v1/search", json={"query": "RTI Act section 7"})
    assert r.status_code == 200
    assert len(r.json()["results"]) >= 1
