import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import RequestLog
from app.core.router import RoutingDecision
from app.schemas.chat import ChatCompletionResponse

logger = logging.getLogger("lite_inference")


async def save_request_log(
    db: AsyncSession,
    decision: RoutingDecision,
    completion: ChatCompletionResponse,
    latency_ms: float,
    status_code: int = 200,
) -> RequestLog:
    """
    Asynchronously persists request execution details, token usage,
    financial savings, and latency metrics to the database.
    """
    total_tokens = completion.usage.prompt_tokens + completion.usage.completion_tokens

    log_entry = RequestLog(
        id=str(uuid.uuid4()),
        request_id=completion.id,
        original_model=decision.original_model,
        routed_model=decision.selected_model,
        provider=decision.selected_provider,
        routing_reason=decision.routing_reason,
        prompt_tokens=completion.usage.prompt_tokens,
        completion_tokens=completion.usage.completion_tokens,
        total_tokens=total_tokens,
        estimated_original_cost_usd=decision.estimated_original_cost_usd,
        estimated_routed_cost_usd=decision.estimated_routed_cost_usd,
        money_saved_usd=decision.estimated_savings_usd,
        latency_ms=round(latency_ms, 2),
        status_code=status_code,
    )

    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry
