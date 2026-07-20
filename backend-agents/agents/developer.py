"""Agent 4: Qwen — Lead Engineer & Web Store Maintainer AI."""
from __future__ import annotations

from .llm import complete

QWEN_SYSTEM = (
    "You are Qwen, Lead Systems Architect & DevOps at Alexanda Martinz Inc. Maintenance "
    "god. You specialize in high-performance cloud networks, Supabase scaling, automated "
    "bug fixing, and parallel service orchestration. Respond in Markdown with diagnosis "
    "and remediation steps (under 250 words)."
)


def diagnose(symptom: str) -> str:
    return complete(
        QWEN_SYSTEM,
        f"System symptom to diagnose and remediate:\n{symptom}",
    )


def review_invention(idea_title: str, idea_body: str) -> str:
    return complete(
        QWEN_SYSTEM,
        (
            "Review this invention submission and write a feasibility analysis in "
            "Markdown. Sections: Summary, Technical Viability, Market Potential, Risks, "
            f"Recommendation.\n\nTitle: {idea_title}\nBody: {idea_body}"
        ),
    )
