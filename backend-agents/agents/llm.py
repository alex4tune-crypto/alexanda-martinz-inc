"""Shared LLM helper — uses Google Gemini when GEMINI_API_KEY is set,
otherwise returns a deterministic rule-based fallback so the service runs offline.
"""
from __future__ import annotations

import os
import json

GEMINI_MODEL = "gemini-1.5-flash"

_client = None


def _get_client():
    global _client
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    if _client is None:
        try:
            from google import genai
            _client = genai.Client(api_key=key)
        except Exception:
            _client = False
    return _client or None


def complete(system_prompt: str, user_prompt: str, max_tokens: int = 1200) -> str:
    client = _get_client()
    if client:
        try:
            resp = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=f"{system_prompt}\n\n---\n{user_prompt}",
            )
            return resp.text or ""
        except Exception as exc:  # pragma: no cover - fall back gracefully
            return f"[LLM unavailable: {exc}] " + _fallback(system_prompt, user_prompt)
    return _fallback(system_prompt, user_prompt)


def _fallback(system: str, user: str) -> str:
    return (
        "(Offline rule-based response — set GEMINI_API_KEY for full AI.)\n\n"
        f"System: {system.strip()}\n\nRequest: {user.strip()}"
    )
