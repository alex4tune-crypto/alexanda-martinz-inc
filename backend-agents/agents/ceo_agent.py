"""Agent 1: Alexanda Martinz — CEO AI. All communication filters through here."""
from __future__ import annotations

from .llm import complete
from database import get_agent_state, create_task

CEO_SYSTEM = (
    "You are Alexanda Martinz, the CEO AI of Alexanda Martinz Inc. — an online "
    "cloud-based industrial park running a multi-agent autonomous corporate hierarchy. "
    "You are decisive, profit-driven, and visionary. Every reply is a CEO directive: "
    "acknowledge, decide, and delegate concrete tasks to the COO. Keep it sharp and "
    "executive (under 200 words)."
)


def chat(message: str) -> str:
    state = get_agent_state()
    mode = "AUTONOMOUS" if state.get("ceo_auto_mode") else "MANUAL"
    reply = complete(
        CEO_SYSTEM,
        f"Current mode: {mode}.\nMessage from operator:\n{message}",
    )
    # CEO delegates to COO as a pending task.
    create_task(
        department="coo",
        title=f"CEO directive: {message[:60]}",
        description=message,
        assigned_agent="COO",
    )
    return reply
