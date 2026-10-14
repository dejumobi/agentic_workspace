import os
from pathlib import Path

import requests


BASE_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files"
ASSETS = (
    (f"{BASE_URL}/kokoro-v0_19.int8.onnx", Path(__file__).with_name("kokoro-v0_19.onnx")),
    (f"{BASE_URL}/voices.json", Path(__file__).with_name("voices.json")),
)


def download(url: str, destination: Path) -> None:
    if destination.is_file() and destination.stat().st_size > 0:
        print(f"Already present, skipping: {destination.name}")
        return

    temporary = destination.with_name(destination.name + ".part")
    try:
        with requests.get(url, stream=True, timeout=(15, 180)) as response:
            response.raise_for_status()
            expected_size = int(response.headers.get("Content-Length", "0"))
            downloaded = 0
            with temporary.open("wb") as output:
                for block in response.iter_content(chunk_size=1024 * 1024):
                    if not block:
                        continue
                    output.write(block)
                    downloaded += len(block)
            if downloaded == 0 or (expected_size and downloaded != expected_size):
                raise RuntimeError(f"Incomplete download for {destination.name}")
        os.replace(temporary, destination)
        print(f"Downloaded {destination.name} ({downloaded:,} bytes)")
    finally:
        temporary.unlink(missing_ok=True)


def main() -> None:
    for url, destination in ASSETS:
        download(url, destination)


if __name__ == "__main__":
    main()