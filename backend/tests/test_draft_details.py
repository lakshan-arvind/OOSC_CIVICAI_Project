def test_form_draft_with_applicant_details(client):
    r = client.post(
        "/api/v1/cases",
        json={"query": "Help me fill the RTI application form for water supply in Chennai, Tamil Nadu."},
    )
    case_id = r.json()["case_id"]
    if r.json()["response"]["status"] == "collecting":
        client.post(
            f"/api/v1/chat/{case_id}/message",
            json={"message": "Chennai, Tamil Nadu — RTI application form"},
        )

    d = client.post(
        "/api/v1/drafts/form",
        json={
            "case_id": case_id,
            "extra_details": {
                "applicant_name": "Ravi Kumar",
                "applicant_address": "12 MG Road, T Nagar",
                "phone": "9876543210",
                "email": "ravi@example.com",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "date": "2026-08-21",
            },
        },
    )
    assert d.status_code == 200
    doc = d.json()["document"]
    assert "Ravi Kumar" in doc["body"]
    assert "9876543210" in doc["body"]
    assert "ravi@example.com" in doc["body"]
    assert "2026-08-21" in doc["body"]
    assert "[YOUR NAME]" not in doc["body"]
