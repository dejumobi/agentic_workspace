# V61 — Dara tutor and audio interruption fixes

- Adds Dara, a spoken tutor for the SaxWorx studio, Practice, Tone Lab, Groove Lab and Lessons, with practical step-by-step guidance and daily-practice encouragement.
- Replaces lesson voice instructions with detailed lesson-specific spoken steps and a stop-voice button. Uses browser speech synthesis; available voices depend on device/browser.
- Centralizes cancellation on studio navigation, lesson changes, instrument changes, page exit, and tab backgrounding. Cancels speech, sax samples, scoring, groove timers, backing audio, and other SaxWorx playback where supported.
- Exposes Practice groove stop method so navigating away can stop the independent groove engine.
- Preserves GuitarWorx and PianoWorx files from V60.

Caveat: No end-to-end browser audio playback test was performed. Test navigation, scored practice, microphone, lesson switching and sample playback before production deployment.
