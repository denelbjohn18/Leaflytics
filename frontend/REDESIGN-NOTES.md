# Leaflytics UI preview

Local redesign of the supplied React frontend. No GitHub push or commit was made.

## Run

1. Unzip this folder into your existing Leaflytics project as `frontend`.
2. From `frontend`, run `npm ci`.
3. Run `npm run dev` for the frontend, or `npm run build` for the production build.
4. Start your existing backend separately on port 3000 to use real diagnosis.

The API contract is unchanged: POST `/api/v1/analyze` with multipart field `image`.

## Verification

Production TypeScript/Vite build passes. The browser tests covered all three routes, upload preview, file-type validation, 5 MB validation, analysis request format, result display/close, reset, API errors, camera capture using a synthetic browser camera, and mobile widths without horizontal overflow.

Real model inference was not run because the trained model and Python environment were not included. Result screenshots use a synthetic image and a browser-only intercepted test response. There is no stub response in the application source.

The existing static training curves are illustrative, hand-tuned values from the original source, not live training telemetry. That is now stated on the Metrics page. Data values are unchanged.

Fixed the existing StatCard prop mismatch that previously broke the production TypeScript build. Updated the displayed preprocessing note to match the Python backend's raw RGB [0,255] input.

## Design

Reference: https://styles.refero.design/style/80099f79-72b7-4367-b2e9-6a3d4a3e9e6a

Integrated Biosciences: green-black surfaces, off-white paper, small lime accents, single-weight large sans headings, mono labels, flat cards and hairline dividers. Inter Tight is used as the reference's listed substitute for Aspekta; Roboto Mono is used for labels. Fonts load through Google Fonts with local sans/monospace fallbacks.

All work is pending visual review. The backend source is untouched.
