from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import requests

from barber_bot.models import OverdueClient, TimeSlot, VisitPattern


class SquareAdapter:
    """Square Bookings adapter for open slots + reservations."""

    def __init__(self, access_token: str, location_id: str, api_base: str = "https://connect.squareup.com/v2") -> None:
        self._access_token = access_token
        self._location_id = location_id
        self._api_base = api_base.rstrip("/")

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Square-Version": "2024-10-17",
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
        }

    def list_open_slots(self, start_at: datetime, end_at: datetime) -> list[TimeSlot]:
        payload = {
            "query": {
                "filter": {
                    "start_at_range": {
                        "start_at": self._iso(start_at),
                        "end_at": self._iso(end_at),
                    },
                    "location_id": self._location_id,
                }
            }
        }
        response = requests.post(
            f"{self._api_base}/bookings/availability/search",
            headers=self._headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        availabilities = data.get("availabilities", [])

        slots: list[TimeSlot] = []
        for row in availabilities:
            start = self._parse_dt(row["start_at"])
            # Default 1-hour slot if segment details are omitted.
            end = self._parse_dt(row.get("end_at")) if row.get("end_at") else start + timedelta(hours=1)
            slots.append(
                TimeSlot(
                    slot_id=row.get("appointment_segments", [{}])[0].get("team_member_id", "") + ":" + row["start_at"],
                    start_at=start,
                    end_at=end,
                    service=row.get("appointment_segments", [{}])[0].get("service_variation_id"),
                    timezone=row.get("timezone", "UTC"),
                    staff_member=row.get("appointment_segments", [{}])[0].get("team_member_id"),
                )
            )
        return slots

    def reserve_slot(self, slot: TimeSlot, client: OverdueClient) -> None:
        if not client.client.external_customer_id:
            raise ValueError("Square booking needs client.external_customer_id")

        payload = {
            "idempotency_key": str(uuid4()),
            "booking": {
                "location_id": self._location_id,
                "customer_id": client.client.external_customer_id,
                "start_at": self._iso(slot.start_at),
            },
        }
        response = requests.post(
            f"{self._api_base}/bookings",
            headers=self._headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

    # This intentionally returns empty data by default. Most shops need custom logic
    # to map booked appointments into reusable weekday/hour visit patterns.
    def list_visit_patterns(self) -> list[VisitPattern]:
        return []

    @staticmethod
    def _iso(dt: datetime) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    @staticmethod
    def _parse_dt(text: str) -> datetime:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(timezone.utc)

