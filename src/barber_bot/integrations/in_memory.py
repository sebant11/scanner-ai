from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime

from barber_bot.models import OfferDecision, OverdueClient, TimeSlot, VisitPattern


class InMemoryCalendarProvider:
    def __init__(self, slots: list[TimeSlot]) -> None:
        self._slots = slots

    def list_open_slots(self, start_at: datetime, end_at: datetime) -> list[TimeSlot]:
        return [s for s in self._slots if start_at <= s.start_at <= end_at]


class InMemoryOverdueClientProvider:
    def __init__(self, clients: list[OverdueClient]) -> None:
        self._clients = clients

    def list_overdue_clients(self) -> list[OverdueClient]:
        return list(self._clients)


class InMemoryVisitHistoryProvider:
    def __init__(self, patterns: list[VisitPattern]) -> None:
        self._patterns = patterns

    def list_visit_patterns(self) -> list[VisitPattern]:
        return list(self._patterns)


class InMemoryBookingProvider:
    def __init__(self) -> None:
        self.bookings: list[tuple[str, str]] = []

    def reserve_slot(self, slot: TimeSlot, client: OverdueClient) -> None:
        self.bookings.append((slot.slot_id, client.client.client_id))


@dataclass(slots=True)
class DeterministicNotificationGateway:
    """For demo/tests: returns predefined decisions per client."""

    decisions_by_client: dict[str, list[OfferDecision]]
    _cursor: defaultdict[str, int] = field(init=False)

    def __post_init__(self) -> None:
        self._cursor = defaultdict(int)

    def offer_slot(self, client: OverdueClient, slot: TimeSlot, timeout_minutes: int) -> str:
        client_id = client.client.client_id
        choices = self.decisions_by_client.get(client_id, [OfferDecision.EXPIRED])
        idx = self._cursor[client_id]
        self._cursor[client_id] += 1
        return choices[min(idx, len(choices) - 1)].value

