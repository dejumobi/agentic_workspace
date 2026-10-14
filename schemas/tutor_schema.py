import base64
import binascii
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MusicTrainingSession(BaseModel):
    model_config = ConfigDict(extra="forbid")

    raw_audio_payload: str = Field(min_length=4, max_length=14_000_000)
    instrument_type: Literal["Saxophone", "Piano", "Guitar"]
    audio_mime_type: str = Field(default="audio/webm", max_length=100)
    lesson_context: str = Field(default="", max_length=2000)

    @field_validator("raw_audio_payload")
    @classmethod
    def validate_audio_payload(cls, value: str) -> str:
        try:
            decoded = base64.b64decode(value, validate=True)
        except (binascii.Error, ValueError) as exc:
            raise ValueError("raw_audio_payload must be valid base64") from exc
        if not decoded or len(decoded) > 10 * 1024 * 1024:
            raise ValueError("Audio must be between 1 byte and 10 MB")
        return value

    @field_validator("audio_mime_type")
    @classmethod
    def validate_audio_mime_type(cls, value: str) -> str:
        mime_type = value.split(";", 1)[0].strip().lower()
        if mime_type not in {
            "audio/aac",
            "audio/mp4",
            "audio/mpeg",
            "audio/ogg",
            "audio/wav",
            "audio/webm",
        }:
            raise ValueError("Unsupported audio MIME type")
        return mime_type

    def decoded_audio(self) -> bytes:
        return base64.b64decode(self.raw_audio_payload, validate=True)