import re
from typing import List, Dict, Any
from pydantic import BaseModel
from app.schemas.chat import ChatMessage


class PromptAnalysis(BaseModel):
    estimated_prompt_tokens: int
    has_code: bool
    has_reasoning_keywords: bool
    context_tier: str  # "short" (<1k), "medium" (1k-8k), "long" (>8k)
    complexity_category: str  # "simple", "coding", "reasoning"


def estimate_tokens_from_string(text: str) -> int:
    """
    Fast, dependency-free token estimation heuristic.
    Averages ~4 characters per token for standard English/code text payloads.
    """
    if not text:
        return 0
    words = len(text.split())
    chars = len(text)
    # Blend word count and character count heuristics for high accuracy across prose and code
    return max(1, int((words * 1.3 + chars / 4.0) / 2.0))


def estimate_messages_tokens(messages: List[ChatMessage]) -> int:
    """Calculates total estimated tokens across all messages in a chat conversation."""
    total = 0
    for msg in messages:
        # Standard OpenAI framing token overhead (~4 tokens per message wrapper)
        total += 4 + estimate_tokens_from_string(msg.content)
    return total


def analyze_prompt(messages: List[ChatMessage]) -> PromptAnalysis:
    """
    Analyzes conversation history to extract semantic routing signals.
    """
    full_text = " ".join([m.content for m in messages]).lower()
    total_tokens = estimate_messages_tokens(messages)

    # Signal 1: Code detection (markdown code fences, technical keywords)
    has_code = bool(
        "`" in full_text
        or re.search(r"\b(def|class|function|import|return|select|from|where|async|await|const|let|var)\b", full_text)
    )

    # Signal 2: Reasoning / Math / Logic keywords
    reasoning_keywords = [
        "step by step",
        "think through",
        "explain why",
        "prove that",
        "derive",
        "calculate",
        "architecture",
        "trade-offs",
        "system design",
        "root cause",
    ]
    has_reasoning_keywords = any(kw in full_text for kw in reasoning_keywords)

    # Signal 3: Context tier
    if total_tokens < 1000:
        context_tier = "short"
    elif total_tokens < 8000:
        context_tier = "medium"
    else:
        context_tier = "long"

    # Signal 4: Overall Complexity Category
    if has_code:
        complexity_category = "coding"
    elif has_reasoning_keywords or total_tokens > 4000:
        complexity_category = "reasoning"
    else:
        complexity_category = "simple"

    return PromptAnalysis(
        estimated_prompt_tokens=total_tokens,
        has_code=has_code,
        has_reasoning_keywords=has_reasoning_keywords,
        context_tier=context_tier,
        complexity_category=complexity_category,
    )
