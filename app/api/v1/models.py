from fastapi import APIRouter
from app.core.models import MODEL_REGISTRY

router = APIRouter()


@router.get("/models")
async def list_models():
    data = []
    for model_id, spec in MODEL_REGISTRY.items():
        data.append({
            "id": model_id,
            "object": "model",
            "owned_by": spec.provider,
            "capability_tier": spec.capability_tier,
            "prompt_cost_per_1m": spec.prompt_cost_per_1m,
            "completion_cost_per_1m": spec.completion_cost_per_1m,
        })
    return {"object": "list", "data": data}
