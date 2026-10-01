import pytest


@pytest.mark.asyncio
async def test_health_check_endpoint(async_client):
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "LiteInference"


@pytest.mark.asyncio
async def test_list_models_endpoint(async_client):
    response = await async_client.get("/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert data["object"] == "list"
    assert len(data["data"]) >= 4


@pytest.mark.asyncio
async def test_chat_completions_proxy_pipeline(async_client):
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "user", "content": "Hello proxy testing!"}
        ]
    }
    response = await async_client.post("/v1/chat/completions", json=payload)
    assert response.status_code == 200

    # Verify custom HTTP headers
    assert "x-liteinference-original-model" in response.headers
    assert response.headers["x-liteinference-original-model"] == "gpt-4o"
    assert response.headers["x-liteinference-routed-model"] == "gpt-4o-mini"

    # Verify response structure matches OpenAI schema
    data = response.json()
    assert data["model"] == "gpt-4o-mini"
    assert len(data["choices"]) == 1


@pytest.mark.asyncio
async def test_analytics_summary_endpoint(async_client):
    # Execute a completion first to record data
    payload = {
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Test prompt analytics"}]
    }
    await async_client.post("/v1/chat/completions", json=payload)

    # Query analytics
    analytics_response = await async_client.get("/v1/analytics/summary")
    assert analytics_response.status_code == 200
    analytics_data = analytics_response.json()

    assert analytics_data["total_requests_processed"] == 1
    assert analytics_data["financial_metrics"]["total_money_saved_usd"] > 0.0
