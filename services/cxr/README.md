# Mediscan CXR — chest X-ray read service

A small FastAPI service that runs **TorchXRayVision** (`densenet121-res224-all`)
— a model pretrained on hundreds of thousands of expert-labelled chest
radiographs (NIH ChestX-ray14, CheXpert, MIMIC-CXR). Given a chest X-ray it
returns calibrated probabilities for ~18 pathologies (pneumonia, effusion,
cardiomegaly, nodule, …).

The web app (`apps/web/src/server/utils/cxr.ts`) calls this behind the existing
`analyze()` seam and maps the probabilities into a study's findings + risk band.
When this service is unreachable or unconfigured, the app falls back to its
built-in template read — so the app always works.

> ⚠️ Assistive read, **not** a certified diagnosis. For demo / research use only.
> Don't send real patient images to anything you don't control (GDPR).

## Run (Windows / macOS / Linux)

```bash
cd services/cxr
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

First start downloads the model weights (~30 MB) to `~/.torchxrayvision`.
CPU is fine — no GPU required.

## Point the web app at it

Add to `apps/web/.env` (or `.env.local`):

```
CXR_SERVICE_URL=http://127.0.0.1:8000
# optional — report findings at/above this probability (default 0.5)
CXR_THRESHOLD=0.5
```

Restart `bun run dev:web`. Now uploading a **chest X-ray** runs the real model;
other modalities and the seeded demo studies keep the template read.

## Smoke test

```bash
curl http://127.0.0.1:8000/health

# analyze a local PNG/JPG chest X-ray
B64=$(base64 -w0 chest.png)   # macOS: base64 -i chest.png
curl -s http://127.0.0.1:8000/analyze \
  -H "content-type: application/json" \
  -d "{\"image\":\"$B64\"}"
```

`/analyze` accepts either a bare base64 string or a full `data:image/...;base64,…`
data URL (which is exactly what the upload form stores), and returns:

```json
{ "weights": "densenet121-res224-all",
  "pathologies": { "Pneumonia": 0.82, "Effusion": 0.41, "Cardiomegaly": 0.12, ... } }
```
