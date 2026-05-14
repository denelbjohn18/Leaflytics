# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leaflytics is an AI-powered plant disease diagnostic system. A React SPA sends leaf images to a local NestJS backend, which runs a TF.js model to classify diseases across 38 crop-disease classes from the PlantVillage dataset.

## Commands

### Backend (`backend/`)
```bash
npm run start:dev     # development with watch mode (port 3000)
npm run start:prod    # run compiled dist
npm run build         # compile TypeScript to dist/
npm run lint          # ESLint with auto-fix
npm test              # Jest unit tests
npm run test:e2e      # Jest e2e tests (test/jest-e2e.json config)
npm run test:cov      # Jest with coverage
```

### Frontend (`frontend/`)
```bash
npm run dev     # Vite dev server (port 5173, proxies /api → localhost:3000)
npm run build   # tsc + vite build → dist/
npm run preview # preview production build
```

### Full dev setup
Two terminals are required. No environment variables are needed — the only configurable env var is `PORT` in the backend (defaults to 3000).

## Architecture

### Request flow
```
Browser → Vite dev proxy (/api → :3000)  [dev]
       → NestJS ServeStaticModule         [prod, serves frontend/dist]
       → POST /api/v1/analyze
       → FileInterceptor (multer, 5MB limit, jpg/jpeg/png)
       → AnalysisService.analyzeImage()
           → sharp: resize to 224×224 raw RGB
           → tf.tensor3d → normalize to [-1, 1]
           → model.predict()
           → PLANT_VILLAGE_CLASSES[maxIndex]
       → { disease, crop, confidence, suggestion }
```

### Model loading
`AnalysisService` implements `OnModuleInit` and pre-loads the TF.js model on startup from `backend/model/model.json` (+ 3 binary shards, ~9.7 MB). The model path is resolved with `path.join(process.cwd(), 'model', 'model.json')` — the backend **must be started from the `backend/` directory**. If confidence is below 60%, the response returns `{ disease: 'Uncertain' }`.

### Production serving
In production, NestJS uses `ServeStaticModule` to serve `frontend/dist` as the SPA and exposes `backend/model/` at the `/model` HTTP path. Build the frontend first, then start the backend with `node dist/main`.

### Label sync
The 38 class labels are defined in two places that must stay in sync:
- `backend/src/analysis/labels.ts` — used by the inference service
- `frontend/src/lib/classData.ts` — used by the Overview page donut chart

Labels follow the `CropName___DiseaseName` format (triple underscore). The service splits on `___` to extract crop and disease for the response.

### Frontend routing
`main.tsx` wraps routes in `BrowserRouter`. `App.tsx` is the layout shell (sidebar + animated outlet). Three pages:
- `/` → `Scanner` — file upload, image preview, analyze button, `ResultDrawer` for results
- `/overview` → static architecture/class distribution charts
- `/metrics` → hardcoded 10-epoch training history charts and model stats

All training metrics (`metricsData.ts`) and class distribution data (`classData.ts`) are hardcoded; there is no analytics backend.

### Design tokens
All UI uses a custom dark-mode-only Tailwind palette defined in `frontend/tailwind.config.js`. Key tokens: `bg-app` (#0E1411), `accent-coral` (#E27A66, primary CTA), `accent-green` (#3EB489). Use these tokens — do not use raw Tailwind color classes.

## Key constraints

- **multer version**: NestJS v11's `FileInterceptor` requires multer `^1.4.5-lts.1`. Do not upgrade to multer v2 — it breaks the file upload pipeline with a 500 error.
- **Backend cwd**: Always run backend commands from inside `backend/` so `process.cwd()` resolves the model path correctly.
- **No database**: State is entirely in-memory per request. There is no persistence layer.
- **Legacy files**: `backend/src/analysis/infer.py` and the JS patch scripts (`patch_keras3_to_keras2.js`, `patch_recursive.js`) are one-off utilities from model conversion and are not part of the running application.
