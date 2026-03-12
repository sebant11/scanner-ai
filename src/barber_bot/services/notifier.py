from __future__ import annotations

from barber_bot.integrations.base import NotificationGateway
from barber_bot.models import OfferDecision, OverdueClient, TimeSlot


class NotificationService:
    def __init__(self, gateway: NotificationGateway, timeout_minutes: int) -> None:
        self._gateway = gateway
        self._timeout_minutes = timeout_minutes

    def offer(self, client: OverdueClient, slot: TimeSlot) -> OfferDecision:
        raw_decision = self._gateway.offer_slot(client, slot, self._timeout_minutes)
        try:
            return OfferDecision(raw_decision)
        except ValueError:
            return OfferDecision.EXPIRED

