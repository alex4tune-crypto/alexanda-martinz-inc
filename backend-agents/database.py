"""Supabase-backed persistence layer for the Alexanda Martinz Inc. agent ecosystem."""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


@dataclass
class DB:
    client: Client

    @classmethod
    def connect(cls) -> "DB":
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        return cls(client=create_client(url, key))


_state = None


def get_db() -> DB:
    global _state
    if _state is None:
        _state = DB.connect()
    return _state


# ---- agent_system_state ----
def get_agent_state() -> dict:
    res = get_db().client.table("agent_system_state").select("*").limit(1).execute()
    rows = res.data or []
    if not rows:
        return {"ceo_auto_mode": False, "weekly_report_status": "pending"}
    return rows[0]


def set_ceo_auto_mode(enabled: bool) -> dict:
    state = get_agent_state()
    get_db().client.table("agent_system_state").update(
        {"ceo_auto_mode": enabled}
    ).eq("id", state["id"]).execute()
    return get_agent_state()


def mark_report_sent() -> None:
    state = get_agent_state()
    get_db().client.table("agent_system_state").update(
        {"weekly_report_status": "sent", "last_report_date": "now()"}
    ).eq("id", state["id"]).execute()


# ---- departmental_tasks ----
def create_task(department: str, title: str, description: str = "",
                input_data: dict | None = None, assigned_agent: str | None = None) -> dict:
    row = {
        "department": department,
        "title": title,
        "description": description,
        "input_data": input_data or {},
        "assigned_agent": assigned_agent,
        "status": "pending",
    }
    return get_db().client.table("departmental_tasks").insert(row).execute().data[0]


def list_tasks(status: str | None = None, limit: int = 50) -> list[dict]:
    q = get_db().client.table("departmental_tasks").select("*").order("created_at", desc=True).limit(limit)
    if status:
        q = q.eq("status", status)
    return q.execute().data or []


def complete_task(task_id: str, output_result: str) -> dict:
    return get_db().client.table("departmental_tasks").update(
        {"status": "completed", "output_result": output_result}
    ).eq("id", task_id).execute().data[0]


# ---- holas_security_logs ----
def push_holas_log(
    cv_anomaly_rate: int = 0,
    nlp_threat_index: int = 0,
    ml_deviance_delta: int = 0,
    cyber_intrusion_triggers: int = 0,
    geo_border_mismatch: int = 0,
    action_taken: str = "monitoring",
) -> dict:
    row = {
        "cv_anomaly_rate": cv_anomaly_rate,
        "nlp_threat_index": nlp_threat_index,
        "ml_deviance_delta": ml_deviance_delta,
        "cyber_intrusion_triggers": cyber_intrusion_triggers,
        "geo_border_mismatch": geo_border_mismatch,
        "action_taken": action_taken,
    }
    return get_db().client.table("holas_security_logs").insert(row).execute().data[0]


def latest_holas_log() -> dict | None:
    rows = get_db().client.table("holas_security_logs").select("*").order("logged_at", desc=True).limit(1).execute().data
    return rows[0] if rows else None


# ---- inventors_hub ----
def create_invention(author_name: str, idea_title: str, idea_body: str) -> dict:
    row = {"author_name": author_name, "idea_title": idea_title, "idea_body": idea_body}
    return get_db().client.table("inventors_hub").insert(row).execute().data[0]


def list_inventions(limit: int = 50) -> list[dict]:
    return get_db().client.table("inventors_hub").select("*").order("created_at", desc=True).limit(limit).execute().data or []


def review_invention(invention_id: str, feasibility_markdown: str, reviewed_by: str = "Qwen") -> dict:
    return get_db().client.table("inventors_hub").update(
        {"feasibility_markdown": feasibility_markdown, "reviewed_by": reviewed_by}
    ).eq("id", invention_id).execute().data[0]
