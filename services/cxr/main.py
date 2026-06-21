"""
Mediscan chest X-ray read service.

A thin FastAPI wrapper around TorchXRayVision's `densenet121-res224-all` model —
pretrained on NIH ChestX-ray14, CheXpert and MIMIC-CXR (hundreds of thousands of
expert-labelled radiographs). Given a chest X-ray it returns calibrated
probabilities for ~18 pathologies. These are REAL model outputs, not guesses —
the Next.js app (`server/utils/cxr.ts`) maps them into the study's findings.

This is an assistive read, NOT a certified diagnosis.

Run:
    pip install -r requirements.txt
    uvicorn main:app --host 127.0.0.1 --port 8000

Then point the web app at it:  CXR_SERVICE_URL=http://127.0.0.1:8000
"""

from __future__ import annotations

import base64
import io
import os
import sys

import numpy as np
import torch
import torchvision.transforms
import torchxrayvision as xrv
from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel

# Windows consoles default to cp1252; TorchXRayVision's first-run weight-download
# progress bar prints Unicode block chars ("█"). Force UTF-8 so the download
# doesn't crash with UnicodeEncodeError.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

WEIGHTS = os.environ.get("CXR_WEIGHTS", "densenet121-res224-all")

# Weights download once to ~/.torchxrayvision on first load (~30 MB).
model = xrv.models.DenseNet(weights=WEIGHTS)
model.eval()

# TorchXRayVision's standard preprocessing: centre-crop to square, resize to 224.
_transform = torchvision.transforms.Compose(
    [
        xrv.datasets.XRayCenterCrop(),
        xrv.datasets.XRayResizer(224, engine="skimage"),
    ]
)

app = FastAPI(title="Mediscan CXR", version="1.0")


class AnalyzeRequest(BaseModel):
    # A data URL ("data:image/png;base64,...") or a bare base64 string.
    image: str


def _decode(image: str) -> np.ndarray:
    payload = image.split(",", 1)[1] if image.startswith("data:") else image
    raw = base64.b64decode(payload)
    pil = Image.open(io.BytesIO(raw)).convert("L")  # 8-bit grayscale
    arr = np.asarray(pil, dtype=np.float32)
    arr = xrv.datasets.normalize(arr, 255)  # → roughly [-1024, 1024]
    arr = arr[None, ...]  # add channel dim → (1, H, W)
    arr = _transform(arr)  # centre-crop + resize → (1, 224, 224)
    return arr


@app.get("/health")
def health() -> dict[str, object]:
    return {"ok": True, "weights": WEIGHTS, "pathologies": model.pathologies}


@app.post("/analyze")
def analyze(request: AnalyzeRequest) -> dict[str, object]:
    arr = _decode(request.image)
    tensor = torch.from_numpy(arr)[None, ...]  # (1, 1, 224, 224)
    with torch.no_grad():
        out = model(tensor)[0]
    probs = out.detach().cpu().numpy()
    pathologies = {
        name: float(probs[index])
        for index, name in enumerate(model.pathologies)
        if name and not np.isnan(probs[index])
    }
    return {"weights": WEIGHTS, "pathologies": pathologies}
