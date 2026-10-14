import hmac
import os
from itertools import chain

import uvicorn
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from agents.music_tutor import stream_feedback_text
from schemas.tutor_schema import MusicTrainingSession
from tools.voice_generator import stream_voice_chunks

load_dotenv()


app = FastAPI(title="MofePlay Music Tutor")


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}


@app.post("/api/v1/tutor/feedback")
def tutor_feedback(
	session: MusicTrainingSession,
	authorization: str | None = Header(default=None),
) -> StreamingResponse:
	proxy_token = os.getenv("MUSIC_TUTOR_PROXY_TOKEN")
	if not proxy_token:
		raise HTTPException(status_code=503, detail="Tutor proxy authentication is not configured")
	supplied_token = authorization.removeprefix("Bearer ") if authorization else ""
	if not hmac.compare_digest(supplied_token, proxy_token):
		raise HTTPException(status_code=401, detail="Unauthorized tutor proxy request")

	if not (
		os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
	) or not os.getenv("ELEVENLABS_API_KEY") or not os.getenv("ELEVENLABS_VOICE_ID"):
		raise HTTPException(status_code=503, detail="Tutor voice service is not configured")

	try:
		audio_chunks = iter(stream_voice_chunks(stream_feedback_text(session)))
		first_chunk = next(audio_chunks, None)
	except Exception as exc:
		raise HTTPException(status_code=502, detail="Tutor audio generation failed") from exc
	if first_chunk is None:
		raise HTTPException(status_code=502, detail="Tutor returned no audio")

	return StreamingResponse(
		chain((first_chunk,), audio_chunks),
		media_type="application/octet-stream",
		headers={
			"Cache-Control": "no-store",
			"X-Audio-Format": "pcm_s16le; rate=24000; channels=1",
			"X-Content-Type-Options": "nosniff",
		},
	)


if __name__ == "__main__":
	uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", "8000")))