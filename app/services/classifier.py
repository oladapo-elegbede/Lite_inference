import asyncio
import logging
import json
from typing import Optional
from ollama import AsyncClient
from app.core.config import settings
from app.schemas.chat import ChatMessage

logger = logging.getLogger("lite_inference")


class OllamaClassifier:
    def __init__(self):
        self.client = AsyncClient(host=settings.OLLAMA_HOST)

    async def classify_prompt_semantic(self, messages: list[ChatMessage]) -> Optional[str]:
        """
        Queries local Ollama daemon to classify prompt complexity.
        Returns one of: 'simple', 'coding', 'reasoning', or None if unavailable/timed out.
        """
        prompt_summary = " ".join([m.content for m in messages[-2:]])  # Inspect last 2 messages

        system_instruction = (
            "You are a strict prompt classification engine. "
            "Analyze the user input and respond with EXACTLY ONE word from this list: "
            "[simple, coding, reasoning]. Do not explain. Output only the single word."
        )

        try:
            # Enforce strict 800ms execution deadline to prevent routing bottleneck
            response = await asyncio.wait_for(
                self.client.chat(
                    model="llama3.2",
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt_summary},
                    ],
                ),
                timeout=0.8,
            )
            raw_category = response["message"]["content"].strip().lower()

            if "coding" in raw_category:
                return "coding"
            elif "reasoning" in raw_category:
                return "reasoning"
            elif "simple" in raw_category:
                return "simple"
            
            return None

        except (asyncio.TimeoutError, Exception) as e:
            logger.debug(f"Local Ollama classification skipped/degraded: {str(e)}")
            return None


ollama_classifier = OllamaClassifier()
