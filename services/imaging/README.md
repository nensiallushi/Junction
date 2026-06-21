# Mediscan Imaging Service — dataset-specific specialist models

A small FastAPI service that runs a pretrained **Hugging Face image-classification
model** and returns its real predictions. The web app uses it for three
specialist reads, each pointed at a model trained on the matching public
dataset:

| Modality + body part | Web env var        | Dataset family it should be trained on |
| -------------------- | ------------------ | -------------------------------------- |
| **Brain MRI**        | `MRI_BRAIN_MODEL`  | Brain Tumor MRI (glioma / meningioma / pituitary / no-tumor) |
| **Breast ultrasound**| `US_BREAST_MODEL`  | BUSI (normal / benign / malignant)     |
| **Chest CT**         | `CT_CHEST_MODEL`   | Chest-CT abnormality / nodule          |

One service handles all three — each request names the model id, and the service
loads + caches it. The web app routes to the right model by **modality + body
part** (see `apps/web/src/server/utils/classifier.ts`); if a model env var isn't
set, that modality falls back to the modality-tuned Claude vision read.

> ⚠️ **Assistive only — not a validated diagnosis.** Every read is tagged with
> the exact model id (`hf/<model>`) so it's traceable. Don't send real patient
> images to anything outside your controlled environment (GDPR). These community
> models are demo-grade — validate before any clinical use.

## Run

```bash
cd services/imaging
python -m venv .venv && . .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8100
```

First call for a given model downloads weights (cached afterwards). Brain MRI
and breast US are small ViT/ResNet classifiers — fine on CPU. Chest CT is
heavier — realistically wants a GPU (the service auto-uses CUDA if present).

Then in `apps/web/.env.local`:

```bash
IMAGING_SERVICE_URL=http://127.0.0.1:8100
MRI_BRAIN_MODEL=<a brain-tumor MRI image-classification model id>
US_BREAST_MODEL=<a BUSI breast-ultrasound image-classification model id>
CT_CHEST_MODEL=<a chest-CT image-classification model id>
```

## Picking a model

The model must be an **`image-classification`** model on Hugging Face trained on
the relevant dataset. Search huggingface.co (filter task = *Image
Classification*) for e.g. "brain tumor mri", "BUSI breast ultrasound",
"chest ct". Copy its id (`Org/name`) into the env var, and **verify it exists**
before relying on it.

The web app maps these class labels to Albanian findings automatically; any
other label passes through verbatim as a moderate finding:

- `glioma`, `meningioma`, `pituitary` (with/without a `_tumor` suffix)
- `benign`, `malignant`, `cancer`, `nodule`, `pneumonia`
- `notumor` / `no_tumor` / `normal` / `negative` / `healthy` → read as **clear**

So a model whose classes are `glioma / meningioma / pituitary / notumor` (the
standard Brain Tumor MRI label set) or `normal / benign / malignant` (BUSI) maps
cleanly with no code changes.

## Endpoints

- `GET /health` → `{ ok, cuda }`
- `POST /classify` → body `{ image: <data-url or base64>, model: <hf id>, top_k?: 5 }`,
  returns `{ model, predictions: [{ label, score }] }`

## How it fits

`analyze()` (`apps/web/src/server/utils/analysis.ts`) routes first hit wins:
**chest X-ray** → TorchXRayVision (`services/cxr`) → **brain MRI / breast US /
chest CT** → this service → **everything else** → modality-tuned Claude vision →
deterministic template. Add another specialist by dropping in a new
`analyzeWith*` reader and a route line — same `AnalysisResult` shape.
