from pydantic import BaseModel
from app.schemas.chat import ChatCompletionRequest
from app.core.analyzer import analyze_prompt, PromptAnalysis
from app.core.models import get_model_spec, calculate_cost
from app.services.classifier import ollama_classifier


class RoutingDecision(BaseModel):
    original_model: str
    selected_model: str
    fallback_model: str
    selected_provider: str
    routing_reason: str
    prompt_tokens: int
    classification_source: str  # "heuristic" or "local_llm"
    estimated_original_cost_usd: float
    estimated_routed_cost_usd: float
    estimated_savings_usd: float
    estimated_savings_percent: float


async def route_request_async(request: ChatCompletionRequest) -> RoutingDecision:
    # Phase 1: Fast Heuristic Analysis
    analysis: PromptAnalysis = analyze_prompt(request.messages)
    classification_source = "heuristic"
    category = analysis.complexity_category

    # Phase 2: If heuristics indicate ambiguity, attempt local LLM semantic classification
    if category == "simple" and analysis.estimated_prompt_tokens > 200:
        llm_category = await ollama_classifier.classify_prompt_semantic(request.messages)
        if llm_category:
            category = llm_category
            classification_source = "local_llm"

    original_model = request.model
    original_spec = get_model_spec(original_model)

    selected_model = original_model
    routing_reason = "Maintained original model based on request rules."

    # Phase 3: Route Selection Logic
    if original_spec.capability_tier in ["reasoning", "standard"] and category == "simple":
        selected_model = "gpt-4o-mini"
        routing_reason = f"Downgraded simple task ({classification_source}) to cost-efficient gpt-4o-mini."

    elif category == "coding" and original_spec.capability_tier == "reasoning":
        selected_model = "gpt-4o-mini"
        routing_reason = f"Routed coding task ({classification_source}) to efficient code-capable model."

    elif original_model.startswith("ollama/") or "llama" in original_model.lower():
        selected_model = original_model.replace("ollama/", "")
        routing_reason = "Direct local model requested."

    # Fallback Assignment
    if selected_model == "gpt-4o":
        fallback_model = "gpt-4o-mini"
    else:
        fallback_model = "gpt-3.5-turbo"

    selected_spec = get_model_spec(selected_model)
    estimated_output_tokens = max(50, analysis.estimated_prompt_tokens)

    orig_cost = calculate_cost(original_model, analysis.estimated_prompt_tokens, estimated_output_tokens)
    routed_cost = calculate_cost(selected_model, analysis.estimated_prompt_tokens, estimated_output_tokens)

    savings_usd = max(0.0, orig_cost - routed_cost)
    savings_pct = round((savings_usd / orig_cost * 100.0), 2) if orig_cost > 0 else 0.0

    return RoutingDecision(
        original_model=original_model,
        selected_model=selected_model,
        fallback_model=fallback_model,
        selected_provider=selected_spec.provider,
        routing_reason=routing_reason,
        prompt_tokens=analysis.estimated_prompt_tokens,
        classification_source=classification_source,
        estimated_original_cost_usd=orig_cost,
        estimated_routed_cost_usd=routed_cost,
        estimated_savings_usd=round(savings_usd, 6),
        estimated_savings_percent=savings_pct,
    )
