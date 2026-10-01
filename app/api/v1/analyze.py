from fastapi import APIRouter
from app.schemas.chat import ChatCompletionRequest
from app.core.analyzer import analyze_prompt, PromptAnalysis

router = APIRouter()


@router.post("/analyze", response_model=PromptAnalysis)
async def analyze_request_prompt(request: ChatCompletionRequest):
    return analyze_prompt(request.messages)
