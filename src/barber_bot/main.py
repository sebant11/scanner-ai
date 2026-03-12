from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone

from barber_bot.config import Settings
from barber_bot.integrations.composite import CombinedOverdueProvider
from barber_bot.integrations.in_memory import (
    DeterministicNotificationGateway,
    InMemoryBookingProvider,
    InMemoryCalendarProvider,
    InMemoryOverdueClientProvider,
    InMemoryVisitHistoryProvider,
)
from barber_bot.integrations.square_adapter import SquareAdapter
from barber_bot.integrations.stripe_adapter import StripeOverdueProvider
from barber_bot.models import OfferDecision, OverdueClient, TimeSlot
from barber_bot.sample_data import build_demo_dataset, load_snapshot
from barber_bot.services.notifier import NotificationService
from barber_bot.services.workflow import SlotFillWorkflow


class ConsoleNotificationGateway:
    """Minimal gateway for live mode until SMS/email integration is plugged in."""

    def offer_slot(self, client: OverdueClient, slot: TimeSlot, timeout_minutes: int) -> str:
        print(
            f"Offer sent to {client.client.full_name} for {slot.start_at.isoformat()} "
            f"(timeout {timeout_minutes}m)."
        )
        return OfferDecision.EXPIRED.value


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


def week_bounds(week_start_arg: str | None) -> tuple[datetime, datetime]:
    if week_start_arg:
        start = datetime.fromisoformat(week_start_arg).replace(tzinfo=timezone.utc)
    else:
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=7)


def run_dry(settings: Settings, args: argparse.Namespace) -> None:
    if args.snapshot:
        slots, clients, patterns = load_snapshot(args.snapshot)
    else:
        slots, clients, patterns = build_demo_dataset()

    calendar = InMemoryCalendarProvider(slots)
    overdue = InMemoryOverdueClientProvider(clients)
    history = InMemoryVisitHistoryProvider(patterns)
    booking = InMemoryBookingProvider()
    gateway = DeterministicNotificationGateway(
        decisions_by_client={
            clients[0].client.client_id: [OfferDecision.REJECTED, OfferDecision.ACCEPTED],
            clients[1].client.client_id: [OfferDecision.ACCEPTED],
        }
    )
    notifier = NotificationService(gateway, settings.offer_timeout_minutes)
    workflow = SlotFillWorkflow(calendar, overdue, history, booking, notifier)
    week_start, week_end = week_bounds(args.week_start)
    result = workflow.run(week_start, week_end)
    print_result(result.actions)


def run_live(settings: Settings, args: argparse.Namespace) -> None:
    if not settings.square_access_token or not settings.square_location_id:
        raise ValueError("Live mode requires BOT_SQUARE_ACCESS_TOKEN and BOT_SQUARE_LOCATION_ID")

    calendar_and_booking = SquareAdapter(
        access_token=settings.square_access_token,
        location_id=settings.square_location_id,
        api_base=settings.square_api_base,
    )
    history = calendar_and_booking

    providers = []
    if settings.stripe_api_key:
        providers.append(StripeOverdueProvider(settings.stripe_api_key))
    if args.snapshot:
        _, clients, _ = load_snapshot(args.snapshot)
        providers.append(InMemoryOverdueClientProvider(clients))
    if not providers:
        raise ValueError("Provide Stripe key or --snapshot for overdue clients in live mode.")

    overdue = CombinedOverdueProvider(providers)
    notifier = NotificationService(ConsoleNotificationGateway(), settings.offer_timeout_minutes)
    workflow = SlotFillWorkflow(calendar_and_booking, overdue, history, calendar_and_booking, notifier)
    week_start, week_end = week_bounds(args.week_start)
    result = workflow.run(week_start, week_end)
    print_result(result.actions)


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
    if should_dry_run:
        run_dry(settings, args)
    else:
        run_live(settings, args)


if __name__ == "__main__":
    main()

