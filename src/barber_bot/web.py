from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from barber_bot.config import Settings
from barber_bot.runner import run_matching

app = FastAPI(title="Barber Slot Bot")
templates = Jinja2Templates(directory=str(Path(__file__).resolve().parent / "templates"))


@app.get("/", response_class=HTMLResponse)
def home(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "mode": "dry",
            "week_start": _default_week_start(),
            "snapshot_json": "",
            "actions": [],
            "error": None,
            "ran": False,
        },
    )


@app.post("/run", response_class=HTMLResponse)
def run(
    request: Request,
    mode: str = Form(default="dry"),
    week_start: str = Form(default=""),
    snapshot_json: str = Form(default=""),
) -> HTMLResponse:
    settings = Settings()
    error = None
    actions: list[dict[str, str]] = []
    parsed_snapshot: dict[str, Any] | None = None

    try:
        if snapshot_json.strip():
            parsed_snapshot = json.loads(snapshot_json)
        result = run_matching(
            settings=settings,
            dry_run=(mode != "live"),
            week_start_arg=week_start.strip() or None,
            snapshot_payload=parsed_snapshot,
        )
        actions = [
            {
                "start_at": action.slot.start_at.isoformat(),
                "slot_id": action.slot.slot_id,
                "client": action.matched_client.client.full_name if action.matched_client else "None",
                "decision": action.decision.value if action.decision else "none",
                "notes": action.notes,
            }
            for action in result.actions
        ]
    except Exception as exc:  # nosec B110
        error = str(exc)

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "mode": mode,
            "week_start": week_start.strip() or _default_week_start(),
            "snapshot_json": snapshot_json,
            "actions": actions,
            "error": error,
            "ran": True,
        },
    )


def main() -> None:
    uvicorn.run("barber_bot.web:app", host="0.0.0.0", port=8000, reload=False)


def _default_week_start() -> str:
    now = datetime.now(timezone.utc)
    monday = (now - timedelta(days=now.weekday())).date()
    return monday.isoformat()

