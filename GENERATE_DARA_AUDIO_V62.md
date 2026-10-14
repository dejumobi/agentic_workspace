# V62 — Dara UK male voice integration

This package includes the recorded-audio player and the Python generator, **not** the newly generated Ryan MP3 files.

Run on an internet-connected Linux machine from this unzipped deployment directory:

```bash
python3 -m pip install edge-tts
python3 generate_dara_uk_voice.py --out voices
```

Then ZIP the contents of the deployment directory (not the enclosing folder):

```bash
zip -r ../MofePlay_V62_With_Dara_Audio.zip . -x '*.pyc'
```

Deploy that newly created ZIP to Cloudflare Pages. The Dara guide buttons use MP3 recordings when present; missing MP3s fall back to a UK English browser voice. Dynamically generated full-lesson narration remains browser TTS unless separately recorded. Existing non-Dara voice cues and other instruments are unchanged.
