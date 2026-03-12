from __future__ import annotations

from datetime import datetime, timezone

from barber_bot.integrations.base import BookingProvider, CalendarProvider, OverdueClientProvider, VisitHistoryProvider
from barber_bot.models import BookingAction, MatchingRunResult, OfferDecision, OverdueClient, TimeSlot
from barber_bot.services.matcher import SlotMatcher
from barber_bot.services.notifier import NotificationService


class SlotFillWorkflow:
    def __init__(
        self,
        calendar_provider: CalendarProvider,
        overdue_client_provider: OverdueClientProvider,
        visit_history_provider: VisitHistoryProvider,
        booking_provider: BookingProvider,
        notification_service: NotificationService,
    ) -> None:
        self._calendar_provider = calendar_provider
        self._overdue_client_provider = overdue_client_provider
        self._visit_history_provider = visit_history_provider
        self._booking_provider = booking_provider
        self._notification_service = notification_service

    def run(self, week_start: datetime, week_end: datetime) -> MatchingRunResult:
        slots = sorted(self._calendar_provider.list_open_slots(week_start, week_end), key=lambda s: s.start_at)
        overdue_clients = self._overdue_client_provider.list_overdue_clients()
        matcher = SlotMatcher(self._visit_history_provider.list_visit_patterns())
        actions: list[BookingAction] = []

        now = datetime.now(timezone.utc)
        for slot in slots:
            if slot.start_at <= now:
                actions.append(
                    BookingAction(
                        slot=slot,
                        matched_client=None,
                        decision=None,
                        notes="Slot skipped because it is in the past",
                    )
                )
                continue

            actions.append(self._process_slot(slot, matcher, overdue_clients))

        return MatchingRunResult(actions=actions, generated_at=now)

    def _process_slot(self, slot: TimeSlot, matcher: SlotMatcher, overdue_clients: list[OverdueClient]) -> BookingAction:
        ranked = matcher.rank_for_slot(slot, overdue_clients)
        if not ranked:
            return BookingAction(slot=slot, matched_client=None, decision=None, notes="No matching overdue client")

        for candidate in ranked:
            decision = self._notification_service.offer(candidate.client, slot)
            if decision == OfferDecision.ACCEPTED:
                self._booking_provider.reserve_slot(slot, candidate.client)
                return BookingAction(
                    slot=slot,
                    matched_client=candidate.client,
                    decision=decision,
                    notes=f"Booked on acceptance. score={candidate.score:.2f}",
                )

            if decision == OfferDecision.REJECTED:
                continue

            # expired/no response path: continue to next nearest match
            continue

        return BookingAction(
            slot=slot,
            matched_client=None,
            decision=OfferDecision.EXPIRED,
            notes="All candidates rejected or expired",
        )

