"""Agent 5: Holas Defender Ultimate v3.0 — Security & Sovereign AI."""
from __future__ import annotations

from .llm import complete
from database import push_holas_log

DEFENDER_SYSTEM = (
    "You are Holas Defender Ultimate v3.0, Head of Cybersecurity & Sovereign Guard at "
    "Alexanda Martinz Inc. 'God of the Cloud'. You autonomously hunt threats: drone "
    "vision mismatches, network packet floods, SQL insertions, and database delta "
    "pattern variations. Respond as a concise threat assessment (under 150 words)."
)


def assess(telemetry: dict) -> dict:
    """Assess a security telemetry snapshot and persist a log row."""
    summary = (
        f"cv_anomaly_rate={telemetry.get('cv_anomaly_rate', 0)}, "
        f"nlp_threat_index={telemetry.get('nlp_threat_index', 0)}, "
        f"ml_deviance_delta={telemetry.get('ml_deviance_delta', 0)}, "
        f"cyber_intrusion_triggers={telemetry.get('cyber_intrusion_triggers', 0)}, "
        f"geo_border_mismatch={telemetry.get('geo_border_mismatch', 0)}"
    )
    verdict = complete(DEFENDER_SYSTEM, f"Live telemetry: {summary}")
    action = "quarantine" if telemetry.get("cyber_intrusion_triggers", 0) > 50 else "monitoring"
    log = push_holas_log(
        cv_anomaly_rate=int(telemetry.get("cv_anomaly_rate", 0)),
        nlp_threat_index=int(telemetry.get("nlp_threat_index", 0)),
        ml_deviance_delta=int(telemetry.get("ml_deviance_delta", 0)),
        cyber_intrusion_triggers=int(telemetry.get("cyber_intrusion_triggers", 0)),
        geo_border_mismatch=int(telemetry.get("geo_border_mismatch", 0)),
        action_taken=action,
    )
    return {"log": log, "assessment": verdict, "action": action}
