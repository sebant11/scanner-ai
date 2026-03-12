# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
This repo contains two projects:
1. **Barber Slot Bot** (`/workspace`) – Python CLI + FastAPI web app for AI-assisted overdue client slot matching. See `README.md` for setup/run commands.
2. **Barber Booking Dashboard** (`/workspace/dashboard`) – Next.js App Router dashboard with TypeScript, Tailwind CSS, and shadcn/ui.

### Running the dashboard (Next.js)
- Dev server: `cd dashboard && npm run dev` (port 3000)
- Lint: `cd dashboard && npm run lint`
- Build: `cd dashboard && npm run build`
- shadcn/ui components are in `dashboard/src/components/ui/`. Add new ones with `npx shadcn@latest add <component>`.

### Running the Python bot
- Activate venv: `source .venv/bin/activate`
- Tests: `python -m pytest tests/ -v`
- CLI dry-run: `barber-slot-bot --dry-run`
- Web dashboard: `barber-slot-web` (port 8000)
- Config via `.env` file (copy from `.env.example`). Dry-run mode needs no external APIs.

### Non-obvious notes
- The Python venv must be activated before running any Python commands; the CLI entry points (`barber-slot-bot`, `barber-slot-web`) are installed via `pip install -e ".[dev]"`.
- The Next.js dashboard uses Tailwind CSS v4 with the new CSS-based config approach (no `tailwind.config.ts`). Theme colors are defined in `globals.css`.
- `python3.12-venv` system package is required to create the Python virtual environment.
