from datetime import datetime, timezone

from barber_bot.models import Client, OverdueClient, TimeSlot, VisitPattern
from barber_bot.services.matcher import SlotMatcher


def test_slot_matcher_prioritizes_same_day_and_time() -> None:
    slot = TimeSlot(
        slot_id="s1",
        start_at=datetime(2026, 3, 12, 14, 0, tzinfo=timezone.utc),
        end_at=datetime(2026, 3, 12, 15, 0, tzinfo=timezone.utc),
        service="haircut",
    )
    clients = [
        OverdueClient(client=Client(client_id="a", full_name="A"), days_since_last_visit=65),
        OverdueClient(client=Client(client_id="b", full_name="B"), days_since_last_visit=65),
    ]
    patterns = [
        VisitPattern(client_id="a", weekday=3, hour_24=14, visits=5, service="haircut"),
        VisitPattern(client_id="b", weekday=3, hour_24=11, visits=5, service="haircut"),
    ]

    ranked = SlotMatcher(patterns).rank_for_slot(slot, clients)
    assert ranked[0].client.client.client_id == "a"
    assert ranked[0].score > ranked[1].score

