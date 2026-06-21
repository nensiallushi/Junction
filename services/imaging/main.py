"""
Mediscan generic medical-image classifier service.

Runs a Hugging Face `image-classification` pipeline for whatever model id the
web app sends, caching each model after first load. One service backs three
specialist reads behind the per-modality router in `apps/web` — brain MRI,
breast ultrasound and chest CT — each pointed at a pretrained model trained on
the matching public dataset (the model ids live in the web app's env, see the
README).

This is an ASSISTIVE read for a doctor, NEVER a validated diagnosis. The
response carries `model` so every read is traceable to exact weights.

Run:
    pip install -r requirements.txt
    uvicorn main:app --host 127.0.0.1 --port 8100
Then in apps/web/.env.local:
    IMAGING_SERVICE_URL=http://127.0.0.1:8100
"""

from __future__ import annotations

import base64
import io
import sys
from functools import lru_cache

import torch
from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel
from transformers import pipeline

# Windows consoles default to cp1252 and choke on the progress bars / unicode
# the model download prints — force UTF-8 so first run doesn't crash.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:
        pass

# GPU if available (chest CT realistically wants one), else CPU.
DEVICE = 0 if torch.cuda.is_available() else -1


@lru_cache(maxsize=8)
def _classifier(model: str):
    """Load + cache an image-classification pipeline per model id."""
    return pipeline("image-classification", model=model, device=DEVICE)


app = FastAPI(title="Mediscan Imaging", version="1.0")


class ClassifyRequest(BaseModel):
    image: str  # data URL ("data:image/png;base64,...") or bare base64
    model: str  # Hugging Face model id, e.g. "Org/brain-tumor-mri"
    top_k: int = 5


def _decode(image: str) -> Image.Image:
    payload = image.split(",", 1)[1] if image.startswith("data:") else image
    raw = base64.b64decode(payload)
    return Image.open(io.BytesIO(raw)).convert("RGB")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "cuda": torch.cuda.is_available()}


@app.post("/classify")
def classify(request: ClassifyRequest) -> dict:
    image = _decode(request.image)
    predictions = _classifier(request.model)(image, top_k=request.top_k)
    return {
        "model": request.model,
        "predictions": [
            {"label": str(p["label"]), "score": float(p["score"])}
            for p in predictions
        ],
    }
