from __future__ import annotations

from datetime import datetime
from typing import Protocol

from barber_bot.models import OverdueClient, TimeSlot, VisitPattern


class CalendarProvider(Protocol):
    def list_open_slots(self, start_at: datetime, end_at: datetime) -> list[TimeSlot]:
        """Return open slots in a given date range."""


class BookingProvider(Protocol):
    def reserve_slot(self, slot: TimeSlot, client: OverdueClient) -> None:
        """Reserve the slot for this client."""


class OverdueClientProvider(Protocol):
    def list_overdue_clients(self) -> list[OverdueClient]:
        """Return clients currently eligible for re-booking outreach."""


class VisitHistoryProvider(Protocol):
    def list_visit_patterns(self) -> list[VisitPattern]:
        """Return historical day/time usage per client."""


class NotificationGateway(Protocol):
    def offer_slot(self, client: OverdueClient, slot: TimeSlot, timeout_minutes: int) -> str:
        """Offer a slot and return accepted/rejected/expired."""

