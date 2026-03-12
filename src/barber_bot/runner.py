from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

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
from barber_bot.models import MatchingRunResult, OfferDecision, OverdueClient, TimeSlot
from barber_bot.sample_data import build_demo_dataset, load_snapshot, load_snapshot_payload
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


def week_bounds(week_start_arg: str | None) -> tuple[datetime, datetime]:
    if week_start_arg:
        start = datetime.fromisoformat(week_start_arg).replace(tzinfo=timezone.utc)
    else:
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=7)


def run_matching(
    settings: Settings,
    *,
    dry_run: bool,
    week_start_arg: str | None = None,
    snapshot_path: str | None = None,
    snapshot_payload: dict[str, Any] | None = None,
) -> MatchingRunResult:
    if dry_run:
        return _run_dry(settings, week_start_arg, snapshot_path, snapshot_payload)
    return _run_live(settings, week_start_arg, snapshot_path, snapshot_payload)


def _run_dry(
    settings: Settings,
    week_start_arg: str | None,
    snapshot_path: str | None,
    snapshot_payload: dict[str, Any] | None,
) -> MatchingRunResult:
    if snapshot_payload is not None:
        slots, clients, patterns = load_snapshot_payload(snapshot_payload)
    elif snapshot_path:
        slots, clients, patterns = load_snapshot(snapshot_path)
    else:
        slots, clients, patterns = build_demo_dataset()

    booking_provider = InMemoryBookingProvider()
    calendar_provider = InMemoryCalendarProvider(slots)
    overdue_provider = InMemoryOverdueClientProvider(clients)
    history_provider = InMemoryVisitHistoryProvider(patterns)
    notification_provider = NotificationService(
        DeterministicNotificationGateway(decisions_by_client=_build_default_dry_decisions(clients)),
        settings.offer_timeout_minutes,
    )
    workflow = SlotFillWorkflow(
        calendar_provider=calendar_provider,
        overdue_client_provider=overdue_provider,
        visit_history_provider=history_provider,
        booking_provider=booking_provider,
        notification_service=notification_provider,
    )
    week_start, week_end = week_bounds(week_start_arg)
    return workflow.run(week_start, week_end)


def _run_live(
    settings: Settings,
    week_start_arg: str | None,
    snapshot_path: str | None,
    snapshot_payload: dict[str, Any] | None,
) -> MatchingRunResult:
    if not settings.square_access_token or not settings.square_location_id:
        raise ValueError("Live mode requires BOT_SQUARE_ACCESS_TOKEN and BOT_SQUARE_LOCATION_ID")

    square = SquareAdapter(
        access_token=settings.square_access_token,
        location_id=settings.square_location_id,
        api_base=settings.square_api_base,
    )
    providers = []
    if settings.stripe_api_key:
        providers.append(StripeOverdueProvider(settings.stripe_api_key))

    if snapshot_payload is not None:
        _, clients, _ = load_snapshot_payload(snapshot_payload)
        providers.append(InMemoryOverdueClientProvider(clients))
    elif snapshot_path:
        _, clients, _ = load_snapshot(snapshot_path)
        providers.append(InMemoryOverdueClientProvider(clients))

    if not providers:
        raise ValueError("Provide Stripe key or snapshot data for overdue clients in live mode.")

    workflow = SlotFillWorkflow(
        calendar_provider=square,
        overdue_client_provider=CombinedOverdueProvider(providers),
        visit_history_provider=square,
        booking_provider=square,
        notification_service=NotificationService(ConsoleNotificationGateway(), settings.offer_timeout_minutes),
    )
    week_start, week_end = week_bounds(week_start_arg)
    return workflow.run(week_start, week_end)


def _build_default_dry_decisions(clients: list[OverdueClient]) -> dict[str, list[OfferDecision]]:
    decisions: dict[str, list[OfferDecision]] = {}
    if not clients:
        return decisions
    decisions[clients[0].client.client_id] = [OfferDecision.REJECTED, OfferDecision.ACCEPTED]
    if len(clients) > 1:
        decisions[clients[1].client.client_id] = [OfferDecision.ACCEPTED]
    return decisions

