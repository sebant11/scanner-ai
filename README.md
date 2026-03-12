# Barber AI Slot Bot (Stripe + Square)

This project automates open-slot recovery for a barber shop:

1. Looks at this week's open calendar slots.
2. Finds overdue clients.
3. Matches each slot to the best overdue client who historically comes on similar day/time.
4. Sends an offer notification.
5. If rejected or expired, automatically tries the next closest client.

## What is included

- **Slot matching engine** (day/time/service weighted ranking)
- **Fallback workflow** (reject/timeout -> next best match)
- **Stripe connector** for past-due subscription clients
- **Square connector** for open availability + booking reservation
- **Dry-run mode** with deterministic outcomes for safe testing
- **Unit tests** for matching + fallback behavior

## Project structure

```text
src/barber_bot/
  config.py
  main.py
  runner.py
  web.py
  models.py
  sample_data.py
  templates/
    index.html
  integrations/
    base.py
    composite.py
    in_memory.py
    square_adapter.py
    stripe_adapter.py
  services/
    matcher.py
    notifier.py
    workflow.py
tests/
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

## Run

### 1) Dry-run (recommended first)

```bash
barber-slot-bot --dry-run
```

Or with custom snapshot data:

```bash
barber-slot-bot --dry-run --snapshot /path/to/snapshot.json
```

### 2) Live mode (Square + Stripe)

Update `.env`:

```env
BOT_DRY_RUN=false
BOT_SQUARE_ACCESS_TOKEN=...
BOT_SQUARE_LOCATION_ID=...
BOT_STRIPE_API_KEY=...
```

Then run:

```bash
barber-slot-bot
```

### 3) Web app dashboard

Start the web UI:

```bash
barber-slot-web
```

Then open:

```text
http://localhost:8000
```

From the dashboard you can:
- choose dry/live mode,
- set week start date,
- optionally paste snapshot JSON,
- run matching and view results in a table.

## Snapshot JSON format

Use this to control slot/client/history data (especially while wiring live data):

```json
{
  "slots": [
    {
      "slot_id": "slot-1",
      "start_at": "2026-03-12T14:00:00Z",
      "end_at": "2026-03-12T15:00:00Z",
      "service": "haircut"
    }
  ],
  "clients": [
    {
      "client": {
        "client_id": "c-1",
        "full_name": "Alex Rivera",
        "phone": "+15550000001",
        "external_customer_id": "SQUARE_CUSTOMER_ID"
      },
      "days_since_last_visit": 78,
      "has_past_due_payment": false
    }
  ],
  "patterns": [
    {
      "client_id": "c-1",
      "weekday": 3,
      "hour_24": 14,
      "visits": 8,
      "service": "haircut"
    }
  ]
}
```

## How matching works

For each slot, candidates are scored by:

- same weekday history
- same/near hour history
- service match (if available)
- number of past visits at that pattern
- overdue priority (days since last visit)
- past-due payment signal

The workflow then offers slot to the highest score first.
