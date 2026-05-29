import logging
import os

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app.api.v1.auth import require_roles
from app.core.roles import UserRole

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/drive-rounds", tags=["Admin - Drive Rounds Proxy"], dependencies=[Depends(require_roles(UserRole.ADMIN))])

# Configuration
PLACEMENT_API_URL = os.getenv("PLACEMENT_API_URL", "http://localhost:8001").rstrip("/")

async def forward_request(request: Request, target_url: str):
    body = await request.body()
    params = request.query_params
    headers = dict(request.headers)

    # Remove host header to avoid routing mismatches at the destination
    headers.pop("host", None)

    logger.info(f"Proxying {request.method} {request.url} -> {target_url}")

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(
                method=request.method,
                url=target_url,
                params=params,
                headers=headers,
                content=body,
                timeout=10.0
            )

            resp_headers = dict(resp.headers)
            # Remove content-length as it will be recalculated by uvicorn
            resp_headers.pop("content-length", None)

            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=resp_headers
            )
        except httpx.RequestError as exc:
            logger.error(f"Proxy connection to {target_url} failed: {exc}")
            raise HTTPException(
                status_code=503,
                detail="Placement service unavailable"
            )

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_round(request: Request, path: str):
    target_url = f"{PLACEMENT_API_URL}/admin/drive-rounds/{path}"
    return await forward_request(request, target_url)

@router.api_route("", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_round_root(request: Request):
    target_url = f"{PLACEMENT_API_URL}/admin/drive-rounds"
    return await forward_request(request, target_url)
