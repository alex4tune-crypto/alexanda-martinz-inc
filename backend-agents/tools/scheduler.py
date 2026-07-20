"""Standalone scheduler that triggers the Friday report at 17:00 UTC.

Run with:  python -m tools.scheduler
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from apscheduler.schedulers.blocking import BlockingScheduler  # type: ignore
from apscheduler.triggers.cron import CronTrigger  # type: ignore

from tools.friday_report import maybe_send_friday_report


def job() -> None:
    print("[scheduler] Friday report trigger fired:", maybe_send_friday_report(force=True))


def main() -> None:
    sched = BlockingScheduler(timezone="UTC")
    # Every Friday at 17:00 UTC.
    sched.add_job(job, CronTrigger(day_of_week="fri", hour=17, minute=0))
    print("[scheduler] Started. Waiting for Friday 17:00 UTC.")
    sched.start()


if __name__ == "__main__":
    main()
