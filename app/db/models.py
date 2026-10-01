import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class RequestLog(Base):
    __tablename__ = "request_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id: Mapped[str] = mapped_column(String, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Routing Decisions
    original_model: Mapped[str] = mapped_column(String, index=True)
    routed_model: Mapped[str] = mapped_column(String, index=True)
    provider: Mapped[str] = mapped_column(String)
    routing_reason: Mapped[str] = mapped_column(Text)

    # Token & Financial Analytics
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)

    estimated_original_cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    estimated_routed_cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    money_saved_usd: Mapped[float] = mapped_column(Float, default=0.0)

    # Operational Telemetry
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    status_code: Mapped[int] = mapped_column(Integer, default=200)
