from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class OfferDecision(str, Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


@dataclass(slots=True)
class TimeSlot:
    slot_id: str
    start_at: datetime
    end_at: datetime
    service: str | None = None
    timezone: str = "UTC"
    staff_member: str | None = None


@dataclass(slots=True)
class Client:
    client_id: str
    full_name: str
    phone: str | None = None
    email: str | None = None
    external_customer_id: str | None = None


@dataclass(slots=True)
class OverdueClient:
    client: Client
    days_since_last_visit: int = 0
    has_past_due_payment: bool = False
    overdue_reason: str = "visit_gap"


@dataclass(slots=True)
class VisitPattern:
    client_id: str
    weekday: int
    hour_24: int
    visits: int = 1
    service: str | None = None


@dataclass(slots=True)
class MatchCandidate:
    client: OverdueClient
    score: float
    reasons: list[str] = field(default_factory=list)


@dataclass(slots=True)
class BookingAction:
    slot: TimeSlot
    matched_client: OverdueClient | None
    decision: OfferDecision | None
    notes: str


@dataclass(slots=True)
class MatchingRunResult:
    actions: list[BookingAction]
    generated_at: datetime

