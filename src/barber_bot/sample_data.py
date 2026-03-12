from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from barber_bot.models import Client, OverdueClient, TimeSlot, VisitPattern


def build_demo_dataset(now: datetime | None = None) -> tuple[list[TimeSlot], list[OverdueClient], list[VisitPattern]]:
    now = now or datetime.now(timezone.utc)
    week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)

    slots = [
        TimeSlot(
            slot_id="slot-1",
            start_at=week_start + timedelta(days=3, hours=14),
            end_at=week_start + timedelta(days=3, hours=15),
            service="haircut",
        ),
        TimeSlot(
            slot_id="slot-2",
            start_at=week_start + timedelta(days=4, hours=10),
            end_at=week_start + timedelta(days=4, hours=11),
            service="beard_trim",
        ),
    ]

    clients = [
        OverdueClient(
            client=Client(client_id="c-1", full_name="Alex Rivera", phone="+15550000001"),
            days_since_last_visit=78,
            overdue_reason="visit_gap",
        ),
        OverdueClient(
            client=Client(client_id="c-2", full_name="Marcus Chen", phone="+15550000002"),
            days_since_last_visit=43,
            overdue_reason="visit_gap",
        ),
        OverdueClient(
            client=Client(client_id="c-3", full_name="Jordan Bell", phone="+15550000003"),
            days_since_last_visit=10,
            has_past_due_payment=True,
            overdue_reason="payment_followup",
        ),
    ]

    patterns = [
        VisitPattern(client_id="c-1", weekday=3, hour_24=14, visits=8, service="haircut"),
        VisitPattern(client_id="c-2", weekday=4, hour_24=10, visits=3, service="beard_trim"),
        VisitPattern(client_id="c-3", weekday=4, hour_24=11, visits=2, service="beard_trim"),
    ]

    return slots, clients, patterns


def load_snapshot(path: str) -> tuple[list[TimeSlot], list[OverdueClient], list[VisitPattern]]:
    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    slots = [
        TimeSlot(
            slot_id=row["slot_id"],
            start_at=_parse_dt(row["start_at"]),
            end_at=_parse_dt(row["end_at"]),
            service=row.get("service"),
            timezone=row.get("timezone", "UTC"),
            staff_member=row.get("staff_member"),
        )
        for row in payload.get("slots", [])
    ]
    clients = [
        OverdueClient(
            client=Client(
                client_id=row["client"]["client_id"],
                full_name=row["client"]["full_name"],
                phone=row["client"].get("phone"),
                email=row["client"].get("email"),
                external_customer_id=row["client"].get("external_customer_id"),
            ),
            days_since_last_visit=row.get("days_since_last_visit", 0),
            has_past_due_payment=row.get("has_past_due_payment", False),
            overdue_reason=row.get("overdue_reason", "visit_gap"),
        )
        for row in payload.get("clients", [])
    ]
    patterns = [
        VisitPattern(
            client_id=row["client_id"],
            weekday=row["weekday"],
            hour_24=row["hour_24"],
            visits=row.get("visits", 1),
            service=row.get("service"),
        )
        for row in payload.get("patterns", [])
    ]
    return slots, clients, patterns


def _parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)

