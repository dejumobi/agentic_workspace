import os
from collections.abc import Iterator

from google import genai
from google.genai import types

from schemas.tutor_schema import MusicTrainingSession


INSTRUMENT_HINTS = {
    "Saxophone": "Listen for pitch center, breath support, articulation, tone stability, and rhythmic placement.",
    "Piano": "Listen for note accuracy, rhythm, evenness, chord balance, and phrase shape.",
    "Guitar": "Listen for pitch accuracy, clean attacks, timing, string noise, and chord or bass-groove clarity.",
}


def stream_feedback_text(session: MusicTrainingSession) -> Iterator[str]:
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Set GOOGLE_API_KEY or GEMINI_API_KEY for music feedback")

    client = genai.Client(api_key=api_key)
    prompt = (
        "You are a supportive music practice tutor. Give concise, specific feedback "
        "on the learner's recording. Mention one thing that is working and one "
        "practical next step. Do not claim to measure anything that is not clearly "
        "audible. Keep the response to two short sentences.\n"
        f"Instrument: {session.instrument_type}. "
        f"Listening focus: {INSTRUMENT_HINTS[session.instrument_type]}\n"
        f"Current lesson: {session.lesson_context or 'general practice'}"
    )
    content = types.Content(
        role="user",
        parts=[
            types.Part.from_text(text=prompt),
            types.Part.from_bytes(
                data=session.decoded_audio(),
                mime_type=session.audio_mime_type,
            ),
        ],
    )
    model = os.getenv("GOOGLE_GENAI_MODEL", "gemini-2.5-flash")
    for response in client.models.generate_content_stream(
        model=model,
        contents=[content],
    ):
        if response.text:
            yield response.text