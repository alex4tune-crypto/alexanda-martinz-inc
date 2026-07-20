"""Agent 2: COO AI — translates CEO strategy into executable work."""
from __future__ import annotations

from .llm import complete
from database import create_task

COO_SYSTEM = (
    "You are the COO of Alexanda Martinz Inc. You receive CEO directives and break "
    "them into executable departmental work across Marketing (Grok), Development (Qwen), "
    "and Security (Holas Defender). Respond as an operations brief (under 180 words)."
)


def handle_directive(directive: str) -> str:
    brief = complete(COO_SYSTEM, f"CEO directive:\n{directive}")
    # Fan work out to the three departments.
    for dept, agent in [("marketing", "Grok"), ("development", "Qwen"), ("security", "Holas Defender")]:
        create_task(
            department=dept,
            title=f"{dept.capitalize()} execution: {directive[:50]}",
            description=directive,
            assigned_agent=agent,
        )
    return brief
