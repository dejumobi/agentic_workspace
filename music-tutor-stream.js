(() => {
  'use strict';

  const script = document.currentScript;
  const instrument = script?.dataset.instrument;
  const targetSelector = script?.dataset.target;
  if (!instrument || !targetSelector) return;

  const contextSelectors = {
    Saxophone: ['#page h1', '#page h2', '#page p'],
    Piano: ['#exerciseTitle', '#instruction'],
    Guitar: ['#lessonTitle', '#lessonGoal'],
  };
  let lessonContext = '';
  let recorder;
  let microphone;
  let recordTimer;
  let requestController;
  let audioContext;
  let audioSources = [];

  const panel = document.createElement('section');
  panel.className = 'mofeplayMusicTutor';
  panel.innerHTML = '<h3>AI practice feedback</h3><p class="mofeplayTutorStatus" role="status" aria-live="polite">Record up to 15 seconds. Your clip is sent securely to MofePlay AI services for spoken feedback.</p><div class="mofeplayTutorActions"><button type="button" class="mofeplayTutorRecord">Record attempt</button><button type="button" class="mofeplayTutorStop" disabled>Stop feedback</button></div>';
  const style = document.createElement('style');
  style.textContent = '.mofeplayMusicTutor{margin:14px 0;padding:12px 14px;border:1px solid var(--line,#42614f);border-radius:10px;background:var(--panel,#14251e);color:var(--text,#f5f4e9)}.mofeplayMusicTutor h3{margin:0 0 5px;font-size:16px}.mofeplayMusicTutor p{margin:4px 0 10px;font-size:13px}.mofeplayTutorActions{display:flex;gap:8px;flex-wrap:wrap}.mofeplayTutorRecord{font:inherit;cursor:pointer}.mofeplayTutorStop{font:inherit;cursor:pointer}.mofeplayTutorRecord:disabled,.mofeplayTutorStop:disabled{opacity:.55;cursor:default}';
  document.head.append(style);
  const mount = () => {
    const target = document.querySelector(targetSelector);
    if (target && panel.parentElement !== target) target.append(panel);
  };
  mount();
  const mountObserver = new MutationObserver(mount);
  mountObserver.observe(document.body, { childList: true, subtree: true });

  const status = panel.querySelector('.mofeplayTutorStatus');
  const recordButton = panel.querySelector('.mofeplayTutorRecord');
  const stopButton = panel.querySelector('.mofeplayTutorStop');

  function setLessonContext(value) {
    lessonContext = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 1200);
  }

  function readLessonContext() {
    const visibleText = (contextSelectors[instrument] || [])
      .map((selector) => document.querySelector(selector)?.textContent || '')
      .filter(Boolean)
      .join(' ');
    return (lessonContext + ' ' + visibleText).replace(/\s+/g, ' ').trim().slice(0, 2000);
  }

  function stopFeedback() {
    requestController?.abort();
    requestController = null;
    for (const source of audioSources) {
      try { source.stop(); } catch {}
    }
    audioSources = [];
    if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
    audioContext = null;
    stopButton.disabled = true;
  }

  function enqueuePcm(bytes, nextStart) {
    const sampleCount = Math.floor(bytes.length / 2);
    if (!sampleCount) return nextStart;
    const samples = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const offset = i * 2;
      let sample = bytes[offset] | (bytes[offset + 1] << 8);
      if (sample > 32767) sample -= 65536;
      samples[i] = sample / 32768;
    }
    const buffer = audioContext.createBuffer(1, sampleCount, 24000);
    buffer.copyToChannel(samples, 0);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    const startAt = Math.max(nextStart, audioContext.currentTime + 0.035);
    source.start(startAt);
    audioSources.push(source);
    source.onended = () => { audioSources = audioSources.filter((item) => item !== source); };
    return startAt + buffer.duration;
  }

  async function playPcmStream(response) {
    if (!response.body) throw new Error('The tutor returned no audio stream.');
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    await audioContext.resume();
    stopButton.disabled = false;
    const reader = response.body.getReader();
    let pending = new Uint8Array(0);
    let nextStart = audioContext.currentTime + 0.06;
    while (true) {
      const { done, value } = await reader.read();
      const merged = new Uint8Array(pending.length + (value?.length || 0));
      merged.set(pending);
      if (value) merged.set(value, pending.length);
      const evenLength = merged.length - (merged.length % 2);
      const length = done ? evenLength : evenLength - (evenLength % 4096);
      if (length) nextStart = enqueuePcm(merged.subarray(0, length), nextStart);
      pending = merged.slice(length);
      if (done) break;
    }
    const generation = requestController;
    const wait = Math.max(0, (nextStart - audioContext.currentTime) * 1000);
    window.setTimeout(() => {
      if (requestController === generation) {
        status.textContent = 'Tutor feedback finished.';
        stopFeedback();
      }
    }, wait);
  }

  function toBase64(blob) {
    return blob.arrayBuffer().then((buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
      }
      return btoa(binary);
    });
  }

  async function requestFeedback(blob) {
    if (blob.size > 10 * 1024 * 1024) throw new Error('Recording is too large. Try a shorter attempt.');
    stopFeedback();
    requestController = new AbortController();
    stopButton.disabled = false;
    status.textContent = 'Preparing your recording…';
    const payload = await toBase64(blob);
    const response = await fetch('/api/tutor/stream', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Accept: 'application/octet-stream' },
      body: JSON.stringify({
        raw_audio_payload: payload,
        audio_mime_type: (blob.type || 'audio/webm').split(';', 1)[0],
        instrument_type: instrument,
        lesson_context: readLessonContext(),
      }),
      signal: requestController.signal,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || body.detail || `Tutor request failed (${response.status}).`);
    }
    status.textContent = 'Streaming spoken feedback…';
    await playPcmStream(response);
  }

  function stopRecording() {
    if (!recorder || recorder.state === 'inactive') return;
    window.clearTimeout(recordTimer);
    recorder.stop();
    recordButton.disabled = true;
    recordButton.textContent = 'Preparing feedback…';
  }

  recordButton.addEventListener('click', async () => {
    if (recorder?.state === 'recording') {
      stopRecording();
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('Audio recording is unavailable in this browser.');
      }
      stopFeedback();
      microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
        .find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(microphone, mimeType ? { mimeType } : undefined);
      const parts = [];
      recorder.ondataavailable = (event) => { if (event.data.size) parts.push(event.data); };
      recorder.onerror = () => { status.textContent = 'Recording failed. Please try again.'; };
      recorder.onstop = async () => {
        microphone?.getTracks().forEach((track) => track.stop());
        microphone = null;
        const recording = new Blob(parts, { type: recorder.mimeType || 'audio/webm' });
        recordButton.disabled = false;
        recordButton.textContent = 'Record another attempt';
        if (!recording.size) {
          status.textContent = 'No audio was captured. Please try again.';
          return;
        }
        try {
          await requestFeedback(recording);
        } catch (error) {
          if (error.name !== 'AbortError') status.textContent = error.message;
          stopFeedback();
        }
      };
      recorder.start(250);
      recordButton.textContent = 'Stop recording';
      status.textContent = 'Recording. Play a short phrase, then stop.';
      recordTimer = window.setTimeout(stopRecording, 15000);
    } catch (error) {
      microphone?.getTracks().forEach((track) => track.stop());
      microphone = null;
      status.textContent = error.message;
    }
  });

  stopButton.addEventListener('click', () => {
    stopFeedback();
    status.textContent = 'Tutor feedback stopped.';
  });

  window.addEventListener('pagehide', () => {
    window.clearTimeout(recordTimer);
    if (recorder?.state === 'recording') {
      recorder.onstop = null;
      recorder.stop();
    }
    microphone?.getTracks().forEach((track) => track.stop());
    stopFeedback();
    mountObserver.disconnect();
  });

  if (instrument === 'Saxophone' && typeof window.readSaxLesson === 'function') {
    const original = window.readSaxLesson;
    window.readSaxLesson = function (index, ...args) {
      setLessonContext(document.querySelector('#page h2')?.textContent || `Saxophone lesson ${Number(index) + 1}`);
      return original.call(this, index, ...args);
    };
  }
  if (instrument === 'Guitar' && typeof window.speak === 'function') {
    const original = window.speak;
    window.speak = function (text, ...args) {
      setLessonContext(text);
      return original.call(this, text, ...args);
    };
  }
  if (instrument === 'Piano') {
    document.addEventListener('click', (event) => {
      if (event.target.closest('#replayCoach')) {
        setLessonContext(contextSelectors.Piano.map((selector) => document.querySelector(selector)?.textContent || '').join(' '));
      }
    }, true);
  }

  window.MofePlayMusicTutor = { setLessonContext };
})();