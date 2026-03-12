from __future__ import annotations

from barber_bot.integrations.base import OverdueClientProvider
from barber_bot.models import OverdueClient


class CombinedOverdueProvider:
    """Merges multiple overdue sources and deduplicates by client_id."""

    def __init__(self, providers: list[OverdueClientProvider]) -> None:
        self._providers = providers

    def list_overdue_clients(self) -> list[OverdueClient]:
        merged: dict[str, OverdueClient] = {}
        for provider in self._providers:
            for item in provider.list_overdue_clients():
                existing = merged.get(item.client.client_id)
                if not existing:
                    merged[item.client.client_id] = item
                    continue

                existing.days_since_last_visit = max(existing.days_since_last_visit, item.days_since_last_visit)
                existing.has_past_due_payment = existing.has_past_due_payment or item.has_past_due_payment
        return list(merged.values())

