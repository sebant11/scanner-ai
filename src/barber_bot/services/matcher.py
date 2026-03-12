from __future__ import annotations

from collections import defaultdict

from barber_bot.models import MatchCandidate, OverdueClient, TimeSlot, VisitPattern


class SlotMatcher:
    """Ranks overdue clients for each open slot."""

    def __init__(self, visit_patterns: list[VisitPattern]) -> None:
        self._patterns_by_client: dict[str, list[VisitPattern]] = defaultdict(list)
        for pattern in visit_patterns:
            self._patterns_by_client[pattern.client_id].append(pattern)

    def rank_for_slot(self, slot: TimeSlot, clients: list[OverdueClient]) -> list[MatchCandidate]:
        candidates: list[MatchCandidate] = []
        slot_weekday = slot.start_at.weekday()
        slot_hour = slot.start_at.hour

        for overdue_client in clients:
            client_patterns = self._patterns_by_client.get(overdue_client.client.client_id, [])
            score, reasons = self._score_client(slot_weekday, slot_hour, slot.service, overdue_client, client_patterns)
            if score > 0:
                candidates.append(MatchCandidate(client=overdue_client, score=score, reasons=reasons))

        return sorted(candidates, key=lambda c: c.score, reverse=True)

    def _score_client(
        self,
        slot_weekday: int,
        slot_hour: int,
        slot_service: str | None,
        overdue_client: OverdueClient,
        patterns: list[VisitPattern],
    ) -> tuple[float, list[str]]:
        score = 0.0
        reasons: list[str] = []

        # Overdue weight: older visits should be contacted sooner.
        if overdue_client.days_since_last_visit >= 120:
            score += 2.0
            reasons.append("very_overdue")
        elif overdue_client.days_since_last_visit >= 60:
            score += 1.0
            reasons.append("overdue")

        if overdue_client.has_past_due_payment:
            score += 0.5
            reasons.append("past_due_payment")

        for pattern in patterns:
            if pattern.weekday != slot_weekday:
                continue

            score += 3.0
            reasons.append("same_weekday")

            hour_delta = abs(pattern.hour_24 - slot_hour)
            if hour_delta == 0:
                score += 3.0
                reasons.append("same_hour")
            elif hour_delta <= 1:
                score += 2.0
                reasons.append("within_1h")
            elif hour_delta <= 2:
                score += 1.0
                reasons.append("within_2h")

            if slot_service and pattern.service and slot_service == pattern.service:
                score += 1.0
                reasons.append("same_service")

            score += min(pattern.visits, 4) * 0.25
            reasons.append("visit_history_weight")

        return score, reasons

