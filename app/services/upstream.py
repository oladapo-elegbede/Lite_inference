import time
import logging
from typing import Tuple
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.chat import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionResponseChoice,
    ChatMessage,
    UsageInfo,
)

logger = logging.getLogger("lite_inference")


class UpstreamService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY or "dummy-key-for-local",
            base_url=settings.OPENAI_BASE_URL,
        )

        self.ollama_client = AsyncOpenAI(
            api_key="ollama",
            base_url=f"{settings.OLLAMA_HOST}/v1",
        )

    async def _execute_single(
        self,
        request: ChatCompletionRequest,
        model_name: str,
        use_ollama: bool,
    ) -> ChatCompletionResponse:
        """Helper to execute a single completion attempt."""
        if not use_ollama and (not settings.OPENAI_API_KEY or "your_openai_api_key" in settings.OPENAI_API_KEY):
            return ChatCompletionResponse(
                id=f"chatcmpl-mock-{int(time.time())}",
                created=int(time.time()),
                model=model_name,
                choices=[
                    ChatCompletionResponseChoice(
                        index=0,
                        message=ChatMessage(
                            role="assistant",
                            content=f"[Mock Response] Successfully executed using target model '{model_name}'.",
                        ),
                        finish_reason="stop",
                    )
                ],
                usage=UsageInfo(
                    prompt_tokens=15,
                    completion_tokens=25,
                    total_tokens=40,
                ),
            )

        client = self.ollama_client if use_ollama else self.openai_client
        messages_payload = [m.model_dump() for m in request.messages]

        response = await client.chat.completions.create(
            model=model_name,
            messages=messages_payload,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )

        choice = response.choices[0]
        usage = response.usage

        return ChatCompletionResponse(
            id=response.id or "chatcmpl-proxy",
            created=response.created or int(time.time()),
            model=response.model,
            choices=[
                ChatCompletionResponseChoice(
                    index=choice.index,
                    message=ChatMessage(
                        role=choice.message.role,
                        content=choice.message.content or "",
                    ),
                    finish_reason=choice.finish_reason or "stop",
                )
            ],
            usage=UsageInfo(
                prompt_tokens=usage.prompt_tokens if usage else 0,
                completion_tokens=usage.completion_tokens if usage else 0,
                total_tokens=usage.total_tokens if usage else 0,
            ),
        )

    async def execute_resilient_completion(
        self,
        request: ChatCompletionRequest,
        primary_model: str,
        fallback_model: str,
        use_ollama: bool = False,
    ) -> Tuple[ChatCompletionResponse, bool]:
        """
        Attempts execution on primary model. If primary fails, recovers
        transparently using fallback_model. Returns (completion, fallback_used).
        """
        try:
            completion = await self._execute_single(request, primary_model, use_ollama)
            return completion, False

        except Exception as primary_error:
            logger.warning(
                f"Primary model '{primary_model}' failed ({str(primary_error)}). "
                f"Initiating automatic failover to fallback model '{fallback_model}'."
            )

            try:
                # Attempt execution on fallback model
                completion = await self._execute_single(request, fallback_model, use_ollama=False)
                return completion, True

            except Exception as fallback_error:
                raise RuntimeError(
                    f"Both primary model '{primary_model}' and fallback model '{fallback_model}' failed. "
                    f"Primary error: {str(primary_error)} | Fallback error: {str(fallback_error)}"
                )


upstream_service = UpstreamService()
