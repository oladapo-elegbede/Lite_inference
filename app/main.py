from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.db.session import init_db
from app.api.v1.chat import router as v1_chat_router
from app.api.v1.models import router as v1_models_router
from app.api.v1.analyze import router as v1_analyze_router
from app.api.v1.route import router as v1_route_router
from app.api.v1.analytics import router as v1_analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cost-Optimized AI Semantic Routing Proxy",
    version=settings.VERSION,
    lifespan=lifespan,
)

app.include_router(v1_chat_router, prefix="/v1", tags=["Chat"])
app.include_router(v1_models_router, prefix="/v1", tags=["Models"])
app.include_router(v1_analyze_router, prefix="/v1", tags=["Analysis"])
app.include_router(v1_route_router, prefix="/v1", tags=["Routing"])
app.include_router(v1_analytics_router, prefix="/v1", tags=["Analytics"])


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "ollama_host": settings.OLLAMA_HOST,
    }
