# How to Run the FAIRDatabase Portal Demo

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- Git

---

## Quick Start — Portal Only (mock data, no backend needed)

```bash
sudo docker compose -f docker-compose.portal.yml up -d
```

Open **http://localhost:3001**

The demo runs entirely on mock data. No backend required.

---

## Full Stack — Portal + Live FAIRDatabase Backend

### Step 1 — Initialise the submodule (first time only)

```bash
git submodule update --init
```

### Step 2 — Bootstrap FAIRDatabase

```bash
bash fairdatabase-src/scripts/bootstrap.sh --auto
```

Save the dashboard password printed to the terminal.

### Step 3 — Start the FAIRDatabase backend

```bash
cd fairdatabase-src/backend
docker compose up -d
cd ../..
```

Wait ~30 seconds, then check all services are healthy:

```bash
docker compose -f fairdatabase-src/backend/docker-compose.yml ps
```

### Step 4 — Start the portal

```bash
VITE_API_URL=http://localhost:5000/api/demo \
  sudo docker compose -f docker-compose.portal.yml up -d --build
```

Open **http://localhost:3001** — the Analysis tab now queries real data from FAIRDatabase.

### Service URLs

| Service | URL |
|---|---|
| Portal | http://localhost:3001 |
| FAIRDatabase app | http://localhost:5000 |
| Supabase Studio | http://localhost:3000 |
| Supabase API | http://localhost:8000 |

### Stopping everything

```bash
# Stop portal
sudo docker compose -f docker-compose.portal.yml down

# Stop FAIRDatabase stack
cd fairdatabase-src/backend && docker compose down && cd ../..
```

---

## Cloning Fresh (for new contributors)

```bash
git clone --recurse-submodules https://github.com/youwillfindinfinity/fairdatabase-portal-main
```

If you already cloned without `--recurse-submodules`:

```bash
git submodule update --init
```

---

## Keeping FAIRDatabase Up to Date

When FAIRDatabase publishes new commits, pull them into the portal:

```bash
git submodule update --remote fairdatabase-src
git commit -m "bump FAIRDatabase submodule to latest"
git push
```

---

## Troubleshooting

**Blank variable warnings on `docker compose up`**
These are harmless if you are running the portal-only compose (`docker-compose.portal.yml`). They only appear if you accidentally run the FAIRDatabase compose without a bootstrapped `.env`.

**Port conflicts**
Change the left-hand port in `docker-compose.portal.yml` (e.g. `"3002:80"`) if 3001 is already in use.

**Bootstrap overwrites `.env` every run**
If you re-run `bootstrap.sh`, repeat Step 3 and Step 4 — the backend needs restarting with the new credentials.
