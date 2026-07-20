"""Phase 5: Automated Friday reporting service.

Fetches completed departmental tasks and Holas security logs for the week,
prompts the CEO agent for a profit-driven executive summary, and emails it
via Resend to the configured recipient.
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import httpx

from database import list_tasks, mark_report_sent
from agents.llm import _get_client

REPORT_RECIPIENT = os.environ.get("REPORT_RECIPIENT", "alexandamartinez@gmail.com")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_URL = "https://api.resend.com/emails"


def _week_window() -> datetime:
    now = datetime.now(timezone.utc)
    # Most recent Friday 17:00 UTC boundary.
    return now - timedelta(days=7)


def build_report() -> str:
    since = _week_window()
    tasks = list_tasks(limit=200)
    completed = [t for t in tasks if t.get("status") == "completed"]
    week_tasks = [t for t in completed if t.get("created_at", "") >= since.isoformat()]

    by_dept: dict[str, int] = {}
    for t in week_tasks:
        by_dept[t.get("department", "other")] = by_dept.get(t.get("department", "other"), 0) + 1

    prompt = (
        "Review the week's departmental outputs and write a highly analytical, "
        "profit-driven, professional executive summary. Outline what was accomplished, "
        "server states, marketing performance by Grok, development metrics by Qwen, and "
        f"intrusion counters by Holas Defender. Address directly to Alexanda Martinz.\n\n"
        f"Completed tasks this week: {len(week_tasks)} (by department: {by_dept})\n"
        f"Sample outputs:\n"
        + "\n".join(f"- [{t.get('department')}] {t.get('title')}: {t.get('output_result','')[:200]}" for t in week_tasks[:15])
    )

    client = _get_client()
    if client:
        try:
            from google import genai
            resp = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
            return resp.text or prompt
        except Exception:
            pass
    return f"# Weekly Executive Report (offline)\n\nCompleted tasks: {len(week_tasks)}\nBy department: {by_dept}"


def send_email(markdown: str) -> dict:
    if not RESEND_API_KEY:
        return {"sent": False, "reason": "RESEND_API_KEY not configured"}
    payload = {
        "from": "reports@alexandamartinez.inc",
        "to": [REPORT_RECIPIENT],
        "subject": f"Alexanda Martinz Inc. — Weekly Executive Report {datetime.now(timezone.utc):%Y-%m-%d}",
        "text": markdown,
    }
    resp = httpx.post(RESEND_URL, json=payload, headers={"Authorization": f"Bearer {RESEND_API_KEY}"})
    return {"sent": resp.status_code == 200, "status_code": resp.status_code}


def maybe_send_friday_report(force: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    is_friday = now.weekday() == 4  # Friday
    if not (force or is_friday):
        return {"sent": False, "reason": "Not Friday (weekday=%d)" % now.weekday()}
    report = build_report()
    result = send_email(report)
    if result.get("sent"):
        mark_report_sent()
    return {"report": report, **result}
