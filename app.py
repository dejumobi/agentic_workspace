import asyncio
import hmac
import io
import os
import wave
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal

import soundfile as sf
from fastapi import Depends, FastAPI, HTTPException, Request, Security
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from kokoro_onnx import Kokoro
from pydantic import BaseModel, Field


MODEL_PATH = Path(__file__).with_name("kokoro-v0_19.onnx")
VOICES_PATH = Path(__file__).with_name("voices.json")
SAMPLE_RATE = 24_000
MAX_TEXT_LENGTH = 2_000


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)
    voice: Literal["bm_daniel"] = "bm_daniel"


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not MODEL_PATH.is_file() or not VOICES_PATH.is_file():
        raise RuntimeError("Kokoro model files are missing; run download_model.py first")
    app.state.engine = Kokoro(str(MODEL_PATH), str(VOICES_PATH))
    if "bm_daniel" not in app.state.engine.voices:
        raise RuntimeError("Kokoro voice matrix is missing required voice bm_daniel")
    app.state.inference_lock = asyncio.Semaphore(1)
    yield
    app.state.engine = None


app = FastAPI(title="MofePlay Kokoro Voice Engine", lifespan=lifespan)


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok", "service": "mofeplay-voice-engine"}


@app.get("/health")
async def health(request: Request) -> dict[str, str]:
    if getattr(request.app.state, "engine", None) is None:
        raise HTTPException(status_code=503, detail="Voice model is not ready")
    return {"status": "ok", "engine": "kokoro-onnx"}


voice_service_token_header = APIKeyHeader(
    name="X-Voice-Service-Token",
    scheme_name="VoiceServiceToken",
    auto_error=False,
)


def authorize_voice_service(
    api_key: Annotated[str | None, Security(voice_service_token_header)],
) -> None:
    expected = os.getenv("VOICE_SERVICE_TOKEN", "").strip()
    if not expected or expected.startswith("replace-with-"):
        raise HTTPException(status_code=503, detail="Voice service authentication is not configured")
    if not api_key or not hmac.compare_digest(api_key, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/synthesize", dependencies=[Depends(authorize_voice_service)])
async def synthesize(
    payload: SpeechRequest,
    request: Request,
) -> StreamingResponse:
    engine: Kokoro = request.app.state.engine
    if payload.voice not in engine.voices:
        raise HTTPException(status_code=422, detail="Requested voice is unavailable")

    try:
        async with request.app.state.inference_lock:
            audio, sample_rate = await run_in_threadpool(
                engine.create,
                payload.text,
                payload.voice,
                0.95,
                "en-us",
            )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Speech synthesis failed") from exc

    if sample_rate != SAMPLE_RATE:
        raise HTTPException(status_code=502, detail="Unexpected model sample rate")

    wav_buffer = io.BytesIO()
    sf.write(wav_buffer, audio, sample_rate, format="WAV", subtype="PCM_16")
    wav_data = wav_buffer.getvalue()
    with wave.open(io.BytesIO(wav_data), "rb") as wav_file:
        if wav_file.getnchannels() != 1 or wav_file.getsampwidth() != 2:
            raise HTTPException(status_code=502, detail="Unexpected WAV format")

    return StreamingResponse(
        iter((wav_data,)),
        media_type="audio/wav",
        headers={
            "Cache-Control": "no-store",
            "Content-Length": str(len(wav_data)),
            "X-Audio-Format": "pcm_s16le; rate=24000; channels=1",
            "X-Content-Type-Options": "nosniff",
        },
    )