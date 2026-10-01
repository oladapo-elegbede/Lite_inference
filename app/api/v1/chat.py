import time
from fastapi import APIRouter, HTTPException, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.chat import ChatCompletionRequest, ChatCompletionResponse
from app.core.router import route_request_async, RoutingDecision
from app.services.upstream import upstream_service
from app.services.logger import save_request_log

router = APIRouter()


@router.post("/chat/completions", response_model=ChatCompletionResponse)
async def create_chat_completion(
    request: ChatCompletionRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    start_time = time.perf_counter()

    try:
        # Step 1: Compute Hybrid Semantic Route (Heuristics + Local LLM Fallback)
        decision: RoutingDecision = await route_request_async(request)
        use_ollama = decision.selected_provider == "ollama"

        # Step 2: Resilient Execution
        completion, fallback_used = await upstream_service.execute_resilient_completion(
            request=request,
            primary_model=decision.selected_model,
            fallback_model=decision.fallback_model,
            use_ollama=use_ollama,
        )

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        # Step 3: Audit Logging
        await save_request_log(
            db=db,
            decision=decision,
            completion=completion,
            latency_ms=latency_ms,
            status_code=200,
        )

        # Step 4: Inject Telemetry HTTP Headers
        response.headers["X-LiteInference-Original-Model"] = decision.original_model
        response.headers["X-LiteInference-Routed-Model"] = completion.model
        response.headers["X-LiteInference-Classification-Source"] = decision.classification_source
        response.headers["X-LiteInference-Fallback-Used"] = str(fallback_used)
        response.headers["X-LiteInference-Provider"] = decision.selected_provider
        response.headers["X-LiteInference-Routing-Reason"] = decision.routing_reason
        response.headers["X-LiteInference-Estimated-Savings-USD"] = str(decision.estimated_savings_usd)
        response.headers["X-LiteInference-Estimated-Savings-Pct"] = f"{decision.estimated_savings_percent}%"
        response.headers["X-LiteInference-Latency-MS"] = f"{round(latency_ms, 2)}ms"

        return completion

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Upstream provider execution failed: {str(e)}",
        )
