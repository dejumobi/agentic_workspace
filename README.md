# MofePlay Music Practice

## Project Layout

```text
MofePlay/
|-- agents/
|   |-- __init__.py
|   `-- music_tutor.py
|-- config/
|   `-- __init__.py
|-- instruments/
|   |-- guitarworx/
|   `-- pianoworx/
|-- schemas/
|   |-- __init__.py
|   `-- tutor_schema.py
|-- tools/
|   |-- __init__.py
|   `-- voice_generator.py
|-- _worker.js
|-- main.py
|-- music-tutor-stream.js
|-- password-visibility.js
|-- practice.html
|-- index.html
|-- requirements.txt
`-- README.md
```

## Components

- `agents/`: Gemini-based music feedback logic.
- `config/`: application and environment configuration.
- `schemas/`: validated tutor audio-session request model.
- `tools/`: HTTP adapter from Gemini feedback text to the Kokoro voice service.
- `app.py` and `download_model.py`: Render-hosted Kokoro-ONNX CPU speech service entrypoint and model downloader; model assets download at build time and are ignored by Git.
- `instruments/`: PianoWorx and GuitarWorx frontends; SaxWorx lives in `practice.html`.
- `_worker.js`: authenticated same-origin API and tutor streaming proxy.
- `music-tutor-stream.js`: shared recording and Web Audio playback client.
- `password-visibility.js`: show/hide control for dynamic authentication forms.
- `main.py`: FastAPI feedback endpoint and local port-8000 entry point.
- `requirements.txt`: Python dependencies for the project.
- `README.md`: project structure and component reference.

Python package directories retain their `__init__.py` markers. Add package code
alongside them as the project grows.

## Music Tutor API

The FastAPI service accepts a short base64-encoded instrument recording at
`POST /api/v1/tutor/feedback`. Gemini streams concise feedback text, which is
converted into 24 kHz signed 16-bit PCM chunks by the Kokoro voice service. The SaxWorx,
PianoWorx, and GuitarWorx clients record up to 15 seconds and submit through the
same-origin, session-authenticated Cloudflare Worker route at
`POST /api/tutor/stream`.

Copy `.env.example` to `.env`, add the Google credential, and replace both
service-token placeholders with independent long random secrets. Install dependencies and start the
local service with:

```sh
python3 -m venv agent_env
. agent_env/bin/activate
python -m pip install -r requirements.txt
python main.py
```

The feedback API listens on `127.0.0.1:8000`. `MUSIC_TUTOR_API_URL` points to
the Render Kokoro `/synthesize` endpoint and `VOICE_SERVICE_TOKEN` authenticates
that call using the `X-Voice-Service-Token` header. The Render API exposes `/`
and `/health` for public liveness checks; `/synthesize` requires this API key.
The Render API uses the official int8 `kokoro-v0_19.onnx` model and
the `bm_daniel` voice matrix from `voices.json`, returning mono 24 kHz PCM16 WAV
at speed 0.95. Its `SpeechRequest` schema defaults to and strictly permits only
`bm_daniel`; startup fails clearly if that voice is missing from the matrix.

Render discovers the repository-root `render.yaml`, which defines both
`mofeplay-voice-engine` and `mofeplay-feedback-api`. The voice service now runs
from the repository root, where `app.py` and `download_model.py` reside. Set `VOICE_SERVICE_TOKEN`
to the same strong secret on both Render services and as a Cloudflare Pages
Preview secret. Set `GOOGLE_API_KEY` and `MUSIC_TUTOR_PROXY_TOKEN` on the
feedback service; set the matching `MUSIC_TUTOR_PROXY_TOKEN` as a Cloudflare
Pages Preview secret. The authenticated Worker `GET /api/tutor/voice-health`
checks the user's instrument entitlement and forwards
`X-Voice-Service-Token` from server-side configuration; browser code never
receives the voice service secret. Do not commit `.env` or model files.

Cloudflare Workers do not read this repository's `.env`. The Worker route is
strictly an authenticated audio-feedback proxy: configure
`MUSIC_TUTOR_FEEDBACK_API_URL` to the separate feedback API's
`/api/v1/tutor/feedback` endpoint and set `MUSIC_TUTOR_PROXY_TOKEN` to match that
API's secret. The configured Render feedback URL is
`https://mofeplay-feedback-api.onrender.com/api/v1/tutor/feedback`. The feedback
API alone converts its generated text chunks into
requests to the isolated Kokoro `/synthesize` service using
`MUSIC_TUTOR_API_URL` and `VOICE_SERVICE_TOKEN`. The Worker must never route
recorded audio directly to the text-to-speech service.

When an authenticated instrument studio opens, its boot script dynamically
imports `src/utils/voiceWarmup.js` and starts a deduplicated, non-blocking GET to
the same-origin Worker health proxy. Warm-up does not run on public login or
classroom sign-in screens. Failures and Render cold starts are silently handled.