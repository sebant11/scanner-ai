from datetime import datetime, timedelta, timezone

from barber_bot.integrations.in_memory import (
    DeterministicNotificationGateway,
    InMemoryBookingProvider,
    InMemoryCalendarProvider,
    InMemoryOverdueClientProvider,
    InMemoryVisitHistoryProvider,
)
from barber_bot.models import Client, OfferDecision, OverdueClient, TimeSlot, VisitPattern
from barber_bot.services.notifier import NotificationService
from barber_bot.services.workflow import SlotFillWorkflow


def test_workflow_falls_back_when_first_candidate_rejects() -> None:
    now = datetime.now(timezone.utc)
    slot = TimeSlot(
        slot_id="slot-1",
        start_at=now + timedelta(hours=3),
        end_at=now + timedelta(hours=4),
    )
    clients = [
        OverdueClient(client=Client(client_id="c1", full_name="Client 1"), days_since_last_visit=70),
        OverdueClient(client=Client(client_id="c2", full_name="Client 2"), days_since_last_visit=70),
    ]
    patterns = [
        VisitPattern(client_id="c1", weekday=slot.start_at.weekday(), hour_24=slot.start_at.hour, visits=2),
        VisitPattern(client_id="c2", weekday=slot.start_at.weekday(), hour_24=slot.start_at.hour, visits=2),
    ]
    gateway = DeterministicNotificationGateway(
        decisions_by_client={
            "c1": [OfferDecision.REJECTED],
            "c2": [OfferDecision.ACCEPTED],
        }
    )

    booking = InMemoryBookingProvider()
    workflow = SlotFillWorkflow(
        InMemoryCalendarProvider([slot]),
        InMemoryOverdueClientProvider(clients),
        InMemoryVisitHistoryProvider(patterns),
        booking,
        NotificationService(gateway, timeout_minutes=15),
    )
    result = workflow.run(now, now + timedelta(days=7))

    assert len(booking.bookings) == 1
    assert booking.bookings[0] == ("slot-1", "c2")
    assert result.actions[0].decision == OfferDecision.ACCEPTED


def test_workflow_marks_slot_unfilled_if_all_expire_or_reject() -> None:
    now = datetime.now(timezone.utc)
    slot = TimeSlot(
        slot_id="slot-2",
        start_at=now + timedelta(hours=3),
        end_at=now + timedelta(hours=4),
    )
    clients = [OverdueClient(client=Client(client_id="c1", full_name="Client 1"), days_since_last_visit=70)]
    patterns = [VisitPattern(client_id="c1", weekday=slot.start_at.weekday(), hour_24=slot.start_at.hour, visits=2)]

    booking = InMemoryBookingProvider()
    workflow = SlotFillWorkflow(
        InMemoryCalendarProvider([slot]),
        InMemoryOverdueClientProvider(clients),
        InMemoryVisitHistoryProvider(patterns),
        booking,
        NotificationService(
            DeterministicNotificationGateway(decisions_by_client={"c1": [OfferDecision.EXPIRED]}),
            timeout_minutes=15,
        ),
    )
    result = workflow.run(now, now + timedelta(days=7))

    assert booking.bookings == []
    assert result.actions[0].decision == OfferDecision.EXPIRED

