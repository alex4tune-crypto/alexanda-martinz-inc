"""CrewAI swarm coordinator for Alexanda Martinz Inc. (Master Prompt Phase 2).

Defines the multi-agent team:
  - GCP Ops Agent: inspects DB connection pools / container status
  - Grok Marketing Agent: scrapes regional news to forecast local trends
  - Qwen Developer Agent: automates wholesale licensing checkout alerts

Requires: pip install crewai
Run with:  python run.py
"""
from __future__ import annotations

from crewai import Agent, Crew, Task


def build_crew() -> Crew:
    gcp_ops = Agent(
        role="GCP Cloud Ops Engineer",
        goal="Inspect Supabase connection pools and local container statuses; report scaling needs.",
        backstory="Operational mastermind keeping the cloud industrial park healthy and fast.",
        allow_delegation=False,
    )
    grok = Agent(
        role="Grok Marketing Forecaster",
        goal="Scrape Swahili-border regional news to forecast local market trends.",
        backstory="Sharp, witty strategist specialized in East African market signals.",
        allow_delegation=False,
    )
    qwen = Agent(
        role="Qwen Developer Agent",
        goal="Automate wholesale licensing checkout alerts and keep the storefront running.",
        backstory="Maintenance god for high-performance cloud networks and SaaS storefronts.",
        allow_delegation=False,
    )

    inspect = Task(
        description="Check Supabase pool size, latency, and local container health. Summarize risks.",
        expected_output="A status report with pool metrics and recommended scaling actions.",
        agent=gcp_ops,
    )
    forecast = Task(
        description="Gather recent regional news and produce a 7-day market trend forecast.",
        expected_output="A Markdown trend forecast with confidence levels per sector.",
        agent=grok,
    )
    alerts = Task(
        description="Scan wholesale licensing events and emit checkout alert summaries.",
        expected_output="A list of pending wholesale checkout alerts with urgency tags.",
        agent=qwen,
    )

    return Crew(agents=[gcp_ops, grok, qwen], tasks=[inspect, forecast, alerts], verbose=True)


if __name__ == "__main__":
    result = build_crew().kickoff()
    print(result)
