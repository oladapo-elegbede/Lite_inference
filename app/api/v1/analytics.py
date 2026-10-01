from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import RequestLog

router = APIRouter()


@router.get("/analytics/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregate financial and performance analytics across all logged proxy requests.
    """
    result = await db.execute(
        select(
            func.count(RequestLog.id).label("total_requests"),
            func.coalesce(func.sum(RequestLog.total_tokens), 0).label("total_tokens_processed"),
            func.coalesce(func.sum(RequestLog.estimated_original_cost_usd), 0.0).label("total_original_cost_usd"),
            func.coalesce(func.sum(RequestLog.estimated_routed_cost_usd), 0.0).label("total_actual_cost_usd"),
            func.coalesce(func.sum(RequestLog.money_saved_usd), 0.0).label("total_money_saved_usd"),
            func.coalesce(func.avg(RequestLog.latency_ms), 0.0).label("avg_latency_ms"),
        )
    )
    row = result.one()

    total_orig = float(row.total_original_cost_usd)
    total_saved = float(row.total_money_saved_usd)
    overall_savings_pct = round((total_saved / total_orig * 100.0), 2) if total_orig > 0 else 0.0

    return {
        "total_requests_processed": row.total_requests,
        "total_tokens_processed": row.total_tokens_processed,
        "financial_metrics": {
            "total_original_cost_usd": round(total_orig, 6),
            "total_actual_cost_usd": round(float(row.total_actual_cost_usd), 6),
            "total_money_saved_usd": round(total_saved, 6),
            "overall_savings_percent": overall_savings_pct,
        },
        "performance_metrics": {
            "average_latency_ms": round(float(row.avg_latency_ms), 2),
        },
    }
