"""Alexanda Martinz Inc. — FastAPI backend orchestrating the multi-agent hierarchy."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import (
    get_agent_state,
    set_ceo_auto_mode,
    list_tasks,
    create_task,
    push_holas_log,
    latest_holas_log,
    create_invention,
    list_inventions,
    review_invention,
)
from agents.ceo_agent import chat as ceo_chat
from agents.coo_agent import handle_directive as coo_handle
from agents.marketing import launch_campaign
from agents.developer import diagnose, review_invention as qwen_review
from agents.defender import assess as defender_assess
from tools.friday_report import maybe_send_friday_report, build_report

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Best-effort: ensure an agent state row exists.
    try:
        get_agent_state()
    except Exception:
        pass
    yield


app = FastAPI(title="Alexanda Martinz Inc. Agent API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Request models ----
class ChatRequest(BaseModel):
    message: str


class ToggleRequest(BaseModel):
    enabled: bool


class TelemetryRequest(BaseModel):
    cv_anomaly_rate: int = 0
    nlp_threat_index: int = 0
    ml_deviance_delta: int = 0
    cyber_intrusion_triggers: int = 0
    geo_border_mismatch: int = 0


class CampaignRequest(BaseModel):
    brief: str


class DiagnoseRequest(BaseModel):
    symptom: str


class InventionRequest(BaseModel):
    author_name: str = "Anonymous"
    idea_title: str
    idea_body: str


# ---- Endpoints ----
@app.get("/api/system-status")
def system_status() -> dict:
    state = get_agent_state()
    return {
        "ceo_auto_mode": state.get("ceo_auto_mode", False),
        "weekly_report_status": state.get("weekly_report_status", "pending"),
        "pending_tasks": list_tasks(status="pending", limit=20),
        "latest_holas": latest_holas_log(),
    }


@app.post("/api/chat-ceo")
def chat_ceo(req: ChatRequest) -> dict:
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message required")
    reply = ceo_chat(req.message)
    return {"reply": reply, "state": get_agent_state()}


@app.post("/api/toggle-auto")
def toggle_auto(req: ToggleRequest) -> dict:
    state = set_ceo_auto_mode(req.enabled)
    return {"ceo_auto_mode": state.get("ceo_auto_mode")}


@app.post("/api/coo-directive")
def coo_directive(req: ChatRequest) -> dict:
    return {"brief": coo_handle(req.message)}


@app.post("/api/marketing-campaign")
def marketing_campaign(req: CampaignRequest) -> dict:
    return {"campaign": launch_campaign(req.brief)}


@app.post("/api/dev-diagnose")
def dev_diagnose(req: DiagnoseRequest) -> dict:
    return {"diagnosis": diagnose(req.symptom)}


@app.post("/api/holas-assess")
def holas_assess(req: TelemetryRequest) -> dict:
    return defender_assess(req.model_dump())


@app.post("/api/inventions")
def submit_invention(req: InventionRequest) -> dict:
    inv = create_invention(req.author_name, req.idea_title, req.idea_body)
    # Qwen auto-reviews.
    markdown = qwen_review(req.idea_title, req.idea_body)
    inv = review_invention(inv["id"], markdown, reviewed_by="Qwen")
    return inv


@app.get("/api/inventions")
def get_inventions() -> list[dict]:
    return list_inventions()


@app.get("/api/friday-report-preview")
def friday_report_preview() -> dict:
    return {"report_markdown": build_report()}


@app.post("/api/friday-report-send")
def friday_report_send() -> dict:
    return maybe_send_friday_report(force=True)


@app.get("/")
def root() -> dict:
    return {"service": "Alexanda Martinz Inc. Agent API", "status": "online"}
