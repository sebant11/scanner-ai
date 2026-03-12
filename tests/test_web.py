from fastapi.testclient import TestClient

from barber_bot.web import app


def test_home_page_loads() -> None:
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert "Barber Slot Bot Dashboard" in response.text


def test_run_matching_from_form() -> None:
    client = TestClient(app)
    snapshot = """
{
  "slots": [
    {
      "slot_id": "slot-web-1",
      "start_at": "2030-01-10T14:00:00Z",
      "end_at": "2030-01-10T15:00:00Z",
      "service": "haircut"
    }
  ],
  "clients": [
    {
      "client": {
        "client_id": "web-client-1",
        "full_name": "Web Client 1"
      },
      "days_since_last_visit": 90
    }
  ],
  "patterns": [
    {
      "client_id": "web-client-1",
      "weekday": 3,
      "hour_24": 14,
      "visits": 4,
      "service": "haircut"
    }
  ]
}
"""
    response = client.post(
        "/run",
        data={
            "mode": "dry",
            "week_start": "2030-01-07",
            "snapshot_json": snapshot,
        },
    )
    assert response.status_code == 200
    assert "Matching Results" in response.text
    assert "slot-web-1" in response.text

