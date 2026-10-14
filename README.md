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
- `tools/`: ElevenLabs voice streaming utilities.
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
converted into 24 kHz signed 16-bit PCM chunks by ElevenLabs. The SaxWorx,
PianoWorx, and GuitarWorx clients record up to 15 seconds and submit through the
same-origin, session-authenticated Cloudflare Worker route at
`POST /api/tutor/stream`.

Copy `.env.example` to `.env`, add the Google and ElevenLabs credentials, and
set a long random `MUSIC_TUTOR_PROXY_TOKEN`. Install dependencies and start the
local service with:

```sh
python3 -m venv agent_env
. agent_env/bin/activate
python -m pip install -r requirements.txt
python main.py
```

The service listens on `127.0.0.1:8000`; `GET /health` is available without
provider credentials. Configure the Worker with the same proxy token and
`MUSIC_TUTOR_API_URL`. The default URL targets the local service for development.
In a deployed Worker, set `MUSIC_TUTOR_API_URL` to a reachable HTTPS service
address; an edge Worker cannot connect to a developer machine's `localhost`.