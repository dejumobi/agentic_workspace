import os
import re
from collections.abc import Iterable, Iterator


def _sentence_chunks(text_blocks: Iterable[str]) -> Iterator[str]:
    pending = ""
    for block in text_blocks:
        pending += block
        while True:
            match = re.search(r"(?<=[.!?])\s+|\n+", pending)
            if not match:
                break
            sentence = pending[:match.start()].strip()
            pending = pending[match.end():]
            if sentence:
                yield sentence
    if pending.strip():
        yield pending.strip()


def stream_voice_chunks(text_blocks: Iterable[str]) -> Iterator[bytes]:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID")
    if not api_key or not voice_id:
        raise RuntimeError("Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID")

    from elevenlabs.client import ElevenLabs

    client = ElevenLabs(api_key=api_key)
    for text in _sentence_chunks(text_blocks):
        for audio_chunk in client.text_to_speech.stream(
            text=text,
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5",
            output_format="pcm_24000",
            optimize_streaming_latency=3,
        ):
            if audio_chunk:
                yield audio_chunk