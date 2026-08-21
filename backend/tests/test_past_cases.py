def test_list_past_cases_by_ids(client):
    r1 = client.post(
        "/api/v1/cases",
        json={"query": "What does public authority under Section 2(h) of RTI Act mean in simple words?"},
    )
    r2 = client.post(
        "/api/v1/cases",
        json={"query": "My municipality hasn't fixed my drainage complaint."},
    )
    id1 = r1.json()["case_id"]
    id2 = r2.json()["case_id"]

    listed = client.get(f"/api/v1/cases?ids={id1},{id2}")
    assert listed.status_code == 200
    data = listed.json()
    assert len(data) == 2
    ids = {item["case_id"] for item in data}
    assert id1 in ids
    assert id2 in ids
    assert all("initial_query" in item for item in data)


def test_list_cases_empty_without_ids(client):
    r = client.get("/api/v1/cases")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
