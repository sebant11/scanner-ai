from __future__ import annotations

import argparse

from barber_bot.config import Settings
from barber_bot.runner import run_matching


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fill open barber slots with overdue client outreach.")
    parser.add_argument("--dry-run", action="store_true", help="Run with local in-memory sample data.")
    parser.add_argument(
        "--snapshot",
        type=str,
        default=None,
        help="Path to JSON data with slots/clients/patterns (overrides built-in demo data).",
    )
    parser.add_argument(
        "--week-start",
        type=str,
        default=None,
        help="ISO date (YYYY-MM-DD). Defaults to current week Monday.",
    )
    return parser.parse_args()


def print_result(actions) -> None:
    print("\n=== Matching Results ===")
    for action in actions:
        decision = action.decision.value if action.decision else "none"
        client_name = action.matched_client.client.full_name if action.matched_client else "None"
        print(
            f"{action.slot.start_at.isoformat()} | slot={action.slot.slot_id} | "
            f"client={client_name} | decision={decision} | notes={action.notes}"
        )


def main() -> None:
    args = parse_args()
    settings = Settings()
    should_dry_run = args.dry_run or settings.dry_run
    result = run_matching(
        settings,
        dry_run=should_dry_run,
        week_start_arg=args.week_start,
        snapshot_path=args.snapshot,
    )
    print_result(result.actions)


if __name__ == "__main__":
    main()

