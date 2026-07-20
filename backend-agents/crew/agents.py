"""CrewAI agent definitions (Phase 2 of the master prompt).

Mirrors the corporate hierarchy used across the FastAPI backend. CrewAI reads
these classes at runtime; the FastAPI agents in ../agents are the executable
counterparts used by the live API.
"""
from __future__ import annotations

from crewai import Agent


def gcp_ops_agent() -> Agent:
    return Agent(
        role="GCP Cloud Ops Engineer",
        goal="Inspect database connection pools and container statuses.",
        backstory="Operational mastermind keeping the cloud industrial park healthy and fast.",
    )


def grok_marketing_agent() -> Agent:
    return Agent(
        role="Grok Marketing Forecaster",
        goal="Scrape Swahili-border news data to forecast local market trends.",
        backstory="Sharp, witty strategist specialized in East African market signals.",
    )


def qwen_developer_agent() -> Agent:
    return Agent(
        role="Qwen Developer Agent",
        goal="Automate wholesale licensing checkout alerts.",
        backstory="Maintenance god for high-performance cloud networks and SaaS storefronts.",
    )
