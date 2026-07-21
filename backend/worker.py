"""
BigBrain autonomous worker — throttled red-team loop (compute side).

Uses AcademicResearchMiner rate limits (MIN_INTERVAL_SEC / MAX_AUDITS_PER_HOUR).
Does not flood reports/ with near-duplicate files.
"""
from __future__ import annotations

import asyncio
import datetime
import os

import redis
from dotenv import load_dotenv

from academic_miner import AcademicResearchMiner

load_dotenv()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=0,
)

# Default 5 minutes between attempts; miner may still skip if hourly cap hit
LOOP_SLEEP_SEC = int(os.getenv("WORKER_LOOP_SLEEP_SEC", "300"))


def broadcast(message: str) -> None:
    print(message)
    try:
        redis_client.publish("bigbrain_channel", message)
    except Exception as e:
        print(f"[Redis Error] {e}")


async def bigbrain_autonomous_loop() -> None:
    await asyncio.sleep(5)
    f100_ecosystems = [
        "Rust and WASM Edge Nodes",
        "Azure Quantum Simulated Annealing",
        "Foxglove Robotics Digital Twins",
        "Web3 DLT RPC Pipelines",
        "SportsInvest Algorithmic Finance",
    ]

    ecosystem_index = 0
    miner = AcademicResearchMiner()

    while True:
        target_ecosystem = f100_ecosystems[ecosystem_index % len(f100_ecosystems)]
        ecosystem_index += 1

        broadcast(f"[BIGBRAIN LOOP] Red Team audit (throttled): '{target_ecosystem}'")
        report_path = miner.execute_red_team_audit(target_ecosystem, force=False)
        broadcast(f"[RED TEAM] result: {report_path}")
        broadcast(
            f"[DIGITAL TWIN] cycle {ecosystem_index} @ {datetime.datetime.utcnow().isoformat()}Z — sleep {LOOP_SLEEP_SEC}s"
        )
        await asyncio.sleep(LOOP_SLEEP_SEC)


if __name__ == "__main__":
    asyncio.run(bigbrain_autonomous_loop())
