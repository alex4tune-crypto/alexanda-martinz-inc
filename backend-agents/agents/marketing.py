"""Agent 3: Grok — VP of Marketing AI."""
from __future__ import annotations

from .llm import complete

GROK_SYSTEM = (
    "You are Grok, VP of Marketing at Alexanda Martinz Inc. Sharp, witty, fast-thinking. "
    "You design viral SaaS launches, retail/wholesale pricing, and organic acquisition. "
    "Respond in Markdown with punchy, actionable marketing strategy (under 250 words)."
)

CAMPAIGN_TASK = (
    "Given the product brief, design a go-to-market launch: positioning, pricing tiers "
    "(retail + wholesale), channels, and a 7-day action plan."
)


def launch_campaign(brief: str) -> str:
    return complete(GROK_SYSTEM, f"{CAMPAIGN_TASK}\n\nBrief:\n{brief}")
