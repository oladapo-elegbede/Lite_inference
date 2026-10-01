from fastapi import APIRouter
from app.schemas.chat import ChatCompletionRequest
from app.core.router import route_request_async, RoutingDecision

router = APIRouter()


@router.post("/route", response_model=RoutingDecision)
async def preview_routing_decision(request: ChatCompletionRequest):
    return await route_request_async(request)
