from typing import Dict, Optional
from pydantic import BaseModel


class ModelSpec(BaseModel):
    id: str
    provider: str
    capability_tier: str
    context_window: int
    prompt_cost_per_1m: float
    completion_cost_per_1m: float


MODEL_REGISTRY: Dict[str, ModelSpec] = {
    "gpt-4o": ModelSpec(
        id="gpt-4o",
        provider="openai",
        capability_tier="reasoning",
        context_window=128000,
        prompt_cost_per_1m=2.50,
        completion_cost_per_1m=10.00,
    ),
    "gpt-4": ModelSpec(
        id="gpt-4",
        provider="openai",
        capability_tier="reasoning",
        context_window=8192,
        prompt_cost_per_1m=30.00,
        completion_cost_per_1m=60.00,
    ),
    "gpt-4o-mini": ModelSpec(
        id="gpt-4o-mini",
        provider="openai",
        capability_tier="cheap",
        context_window=128000,
        prompt_cost_per_1m=0.15,
        completion_cost_per_1m=0.60,
    ),
    "gpt-3.5-turbo": ModelSpec(
        id="gpt-3.5-turbo",
        provider="openai",
        capability_tier="cheap",
        context_window=16385,
        prompt_cost_per_1m=0.50,
        completion_cost_per_1m=1.50,
    ),
    "llama3.2": ModelSpec(
        id="llama3.2",
        provider="ollama",
        capability_tier="cheap",
        context_window=131072,
        prompt_cost_per_1m=0.0,
        completion_cost_per_1m=0.0,
    ),
    "qwen2.5-coder": ModelSpec(
        id="qwen2.5-coder",
        provider="ollama",
        capability_tier="coding",
        context_window=32768,
        prompt_cost_per_1m=0.0,
        completion_cost_per_1m=0.0,
    ),
}


def get_model_spec(model_id: str) -> Optional[ModelSpec]:
    if model_id in MODEL_REGISTRY:
        return MODEL_REGISTRY[model_id]
    
    return ModelSpec(
        id=model_id,
        provider="unknown",
        capability_tier="standard",
        context_window=128000,
        prompt_cost_per_1m=2.50,
        completion_cost_per_1m=10.00,
    )


def calculate_cost(model_id: str, prompt_tokens: int, completion_tokens: int) -> float:
    spec = get_model_spec(model_id)
    input_cost = (prompt_tokens / 1_000_000.0) * spec.prompt_cost_per_1m
    output_cost = (completion_tokens / 1_000_000.0) * spec.completion_cost_per_1m
    return round(input_cost + output_cost, 6)
