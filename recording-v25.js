// SAXWORX WAV RECORDER V26
(function(){
let moduleReady=null;
function wavHeader(frames,rate,channels=2){const bytes=frames*channels*2,b=new ArrayBuffer(44),v=new DataView(b);function word(at,s){for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i))}word(0,'RIFF');v.setUint32(4,36+bytes,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,rate,true);v.setUint32(28,rate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,bytes,true);return b}
const stemURLs=new Map();function saveStem(id,label,chunks,frames,rate,channels){if(stemURLs.has(id))URL.revokeObjectURL(stemURLs.get(id));const url=URL.createObjectURL(new Blob([wavHeader(frames,rate,channels),...chunks],{type:'audio/wav'}));stemURLs.set(id,url);let link=panel.querySelector('#'+id);if(!link){link=document.createElement('a');link.id=id;panel.querySelector('#studioDownload').after(link)}link.textContent=label;link.href=url;link.download='SaxWorx-'+(channels===1?'sax':'groove')+'-'+Date.now()+'.wav';link.hidden=false}const compressedStart=startStudioRecording;
startStudioRecording=async function(){
 if(studioPending||studioRecorder?.state==='recording'||studioRecorder?.state==='stopping')return;
 await audio();
 if(!ctx.audioWorklet||typeof AudioWorkletNode==='undefined'){studioNotice('WAV capture is unavailable here; using browser recording.');return compressedStart()}
 studioPending=true;const generation=studioGeneration,button=panel.querySelector('#studioRecordStart');button.disabled=true;let capture=null,bandGain=null,micStream=null;
 try{
  if(classroom.recorder?.state==='recording'||listening)throw Error('Finish the other recording or evaluation first.');
  stopTutorVoice();panel.querySelector('#studioPlayback')?.pause();for(const id of ['studioMicDownload','studioGrooveDownload']){const link=panel.querySelector('#'+id);if(link)link.hidden=true}
  // Groove recordings do not need the expensive tuner/evaluation loop.
  if(stream)stopMic();
  if(!moduleReady)moduleReady=ctx.audioWorklet.addModule('saxworx-pcm-worklet.js?v=26').catch(e=>{moduleReady=null;throw e});await moduleReady;
  micStream=await navigator.mediaDevices.getUserMedia({audio:studioRecordingConstraints()});
  if(generation!==studioGeneration)throw Error('Recording cancelled before it started.');
  studioStream=micStream;
  if(!trackSource){trackSource=ctx.createMediaElementSource(trackAudio);trackSource.connect(practiceAudioBus())}
  const micSource=ctx.createMediaStreamSource(micStream),filter=ctx.createBiquadFilter(),micGain=ctx.createGain(),limiter=ctx.createGain(),silent=ctx.createGain();bandGain=ctx.createGain();
  filter.type='highpass';filter.frequency.value=30;micGain.gain.value=+panel.querySelector('#studioMicLevel').value/100;bandGain.gain.value=+panel.querySelector('#studioBandLevel').value/100;limiter.gain.value=1;silent.gain.value=0;
  capture=new AudioWorkletNode(ctx,'saxworx-pcm-recorder',{numberOfInputs:2,numberOfOutputs:1,outputChannelCount:[2],channelCount:2,channelCountMode:'explicit'});
  micSource.connect(filter).connect(micGain);micGain.connect(capture,0,0);practiceAudioBus().connect(bandGain);bandGain.connect(capture,0,1);capture.connect(silent).connect(ctx.destination);
  studioNodes=[micSource,filter,micGain,bandGain,limiter,capture,silent];
  const chunks=[],micChunks=[],grooveChunks=[];let finished=false;const session={state:'recording',stop(){if(this.state!=='recording')return;this.state='stopping';clearTimeout(studioTimer);capture.port.postMessage('stop');studioNotice('Finishing WAV recording…')}};studioRecorder=session;
  function cleanup(){clearTimeout(studioTimer);clearInterval(studioClock);studioClock=null;micStream.getTracks().forEach(t=>t.stop());try{studioBus.disconnect(bandGain)}catch{}studioNodes.forEach(n=>n.disconnect());studioNodes=[];studioStream=null;session.state='inactive';studioRecorder=null;button.disabled=false;capture.port.close()}
  capture.port.onmessage=e=>{const data=e.data;if(data.pcm)chunks.push(data.pcm);if(data.mic)micChunks.push(data.mic);if(data.groove)grooveChunks.push(data.groove);if(data.done&&!finished){finished=true;cleanup();if(!data.frames){studioNotice('No audio captured. Keep this page open and try again.');return}const bytes=chunks.reduce((n,b)=>n+b.byteLength,0);if(bytes!==data.frames*4){studioNotice('Recording was incomplete. Please try again.');return}const blob=new Blob([wavHeader(data.frames,data.rate),...chunks],{type:'audio/wav'});if(studioURL)URL.revokeObjectURL(studioURL);studioURL=URL.createObjectURL(blob);const player=panel.querySelector('#studioPlayback');player.src=studioURL;player.playbackRate=1;player.defaultPlaybackRate=1;player.hidden=false;const link=panel.querySelector('#studioDownload');link.href=studioURL;link.download='SaxWorx-take-'+Date.now()+'.wav';link.hidden=false;saveStem('studioMicDownload','Download sax only',micChunks,data.frames,data.rate,1);saveStem('studioGrooveDownload','Download groove only',grooveChunks,data.frames,data.rate,2);studioNotice('Take ready · '+(data.frames/data.rate).toFixed(1)+' seconds. '+(data.clips?'Lower sax/groove levels: mixed signal clipped.':'Sax and groove were captured separately and mixed without automatic volume compression.'))}};
  capture.onprocessorerror=()=>{if(finished)return;finished=true;cleanup();studioNotice('Audio capture stopped unexpectedly. Keep the page open and try again.')};
  studioStartedAt=performance.now();updateStudioClock();studioClock=setInterval(updateStudioClock,250);studioTimer=setTimeout(stopStudioRecording,300000);studioNotice('Recording sax + groove to WAV. Keep this page open. Maximum 5 minutes.');
 }catch(e){micStream?.getTracks().forEach(t=>t.stop());if(bandGain)try{studioBus.disconnect(bandGain)}catch{}studioNodes.forEach(n=>n.disconnect());studioNodes=[];capture?.port.close();studioStream=null;studioRecorder=null;button.disabled=false;studioNotice(window.friendlyMicError?friendlyMicError(e):'Recording could not start: '+e.message)}finally{studioPending=false}
};
const oldGo=go;go=function(v){if(v==='Groove lab'&&stream&&!listening)stopMic();return oldGo(v)};
})();
