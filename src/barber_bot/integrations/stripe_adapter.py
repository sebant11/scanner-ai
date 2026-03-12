from __future__ import annotations

from typing import Any

import stripe

from barber_bot.models import Client, OverdueClient


class StripeOverdueProvider:
    """Reads payment overdue signal from Stripe past-due subscriptions."""

    def __init__(self, api_key: str) -> None:
        stripe.api_key = api_key

    def list_overdue_clients(self) -> list[OverdueClient]:
        subscriptions = stripe.Subscription.list(status="past_due", limit=100)
        overdue_clients: list[OverdueClient] = []

        for sub in subscriptions.auto_paging_iter():
            customer = self._fetch_customer(sub["customer"])
            overdue_clients.append(
                OverdueClient(
                    client=Client(
                        client_id=f"stripe:{customer['id']}",
                        full_name=customer.get("name") or "Stripe Client",
                        email=customer.get("email"),
                        phone=customer.get("phone"),
                        external_customer_id=customer["id"],
                    ),
                    has_past_due_payment=True,
                    overdue_reason="past_due_subscription",
                )
            )

        return overdue_clients

    @staticmethod
    def _fetch_customer(customer_id: str) -> dict[str, Any]:
        customer = stripe.Customer.retrieve(customer_id)
        if isinstance(customer, dict):
            return customer
        return dict(customer)

