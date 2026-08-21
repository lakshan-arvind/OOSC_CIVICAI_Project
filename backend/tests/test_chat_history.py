def test_chat_history_on_create_and_reply(client):
    r = client.post(
        "/api/v1/cases",
        json={"query": "What does public authority under Section 2(h) of RTI Act mean in simple words?"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "messages" in data
    assert len(data["messages"]) >= 2  # user + assistant
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][1]["role"] == "assistant"

    case_id = data["case_id"]
    msgs = client.get(f"/api/v1/cases/{case_id}/messages")
    assert msgs.status_code == 200
    assert len(msgs.json()) >= 2


def test_chat_history_after_follow_up(client):
    r = client.post(
        "/api/v1/cases",
        json={"query": "I bought a defective phone and the shop is not giving a refund under warranty."},
    )
    case_id = r.json()["case_id"]

    r2 = client.post(
        f"/api/v1/chat/{case_id}/message",
        json={"message": "Delhi"},
    )
    assert r2.status_code == 200
    messages = r2.json()["messages"]
    assert len(messages) >= 4  # user, assistant, user, assistant
    roles = [m["role"] for m in messages]
    assert roles.count("user") >= 2
    assert roles.count("assistant") >= 2
