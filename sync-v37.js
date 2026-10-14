// SAXWORX SYNC V37: browser check, friendly mic errors, play-along timing sync
(function(){
window.friendlyMicError=function(e){const n=e&&e.name;
 if(n==='NotAllowedError'||n==='SecurityError')return 'Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again.';
 if(n==='NotFoundError'||n==='OverconstrainedError')return 'No microphone was found. Plug one in or pick another input, then try again.';
 if(n==='NotReadableError')return 'Your microphone is in use by another app. Close it there and try again.';
 return 'Recording could not start: '+(e&&e.message||'unknown error')};
const missing=[];if(!navigator.mediaDevices?.getUserMedia)missing.push('microphone access');if(!(window.AudioContext||window.webkitAudioContext))missing.push('Web Audio');if(typeof AudioWorkletNode==='undefined')missing.push('AudioWorklet');
if(missing.length){const b=document.createElement('section');b.className='card';b.setAttribute('role','alert');b.textContent='This browser is missing '+missing.join(', ')+', which recording needs. Please use the current Chrome, Edge, Firefox or Safari (iOS 14.5 or newer).';document.getElementById('page').before(b)}
const box=document.createElement('div');box.className='takeAlignment syncCard';box.innerHTML='<h3>Sync your sax</h3><p class="small" id="syncIntro"></p><button id="syncStart" class="primary" type="button">Sync with play-along (about 10 seconds)</button><p id="syncStatus" class="small" role="status"></p>';panel.append(box);
const q=id=>box.querySelector('#'+id),mode=()=>localStorage.getItem('saxworx-recording-output')||'speakers',key=()=>'saxworx-device-recording-timing-v30-'+mode();
const say=t=>{q('syncStatus').textContent=t};let running=false;
function intro(){let saved=null;try{saved=localStorage.getItem(key())}catch{}
 const c=typeof ctx!=='undefined'&&ctx,hint=c?Math.round(((c.outputLatency||0)+(c.baseLatency||0))*1000):0;
 q('syncIntro').textContent=saved!==null?'Synced for this listening setup: sax moved '+saved+' ms earlier. Run it again if you change headphones, speakers or microphone.':'Do this once per setup (best with headphones). Your sax is recorded a little late because sound takes time to reach your ears and your mic. This measures it for you.'+(hint?' Your browser reports about '+hint+' ms of output delay; Bluetooth often under-reports.':'')}
intro();document.getElementById('studioOutputMode')?.addEventListener('change',()=>setTimeout(()=>{window.saxReloadTiming?.();intro()},0));
q('syncStart').onclick=async()=>{
 if(running||studioPending||studioRecorder||engine){say('Stop the groove and any recording first.');return}
 running=true;q('syncStart').disabled=true;let mic,src,node,mute;
 try{await audio();if(stream)stopMic();
  say('Allow the microphone. After 4 count-in clicks, tongue one short note on each click (8 notes).');
  mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  await ctx.audioWorklet.addModule('calibration-worklet-v29.js?v=29');
  src=ctx.createMediaStreamSource(mic);node=new AudioWorkletNode(ctx,'saxworx-calibration',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});mute=ctx.createGain();mute.gain.value=0;src.connect(node);node.connect(mute).connect(ctx.destination);
  const chunks=[];let first=null;node.port.onmessage=e=>{if(e.data.pcm){if(first===null)first=e.data.frame;chunks.push(e.data)}};
  const beat=.6,n=12,t0=ctx.currentTime+.8,times=[];
  for(let i=0;i<n;i++){const t=t0+i*beat;times.push(t);const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=i%4?900:1300;g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.06)}
  await new Promise(r=>setTimeout(r,(t0+n*beat+.6-ctx.currentTime)*1000));node.port.postMessage('stop');await new Promise(r=>setTimeout(r,150));
  if(first===null)throw Error('No microphone audio received. Keep this tab visible and try again.');
  const rate=ctx.sampleRate,end=chunks[chunks.length-1],len=end.frame-first+end.pcm.byteLength/4,pcm=new Float32Array(len);for(const c of chunks)pcm.set(new Float32Array(c.pcm),c.frame-first);
  const w=Math.round(rate*.005),env=[];for(let i=0;i+w<=len;i+=w){let s=0;for(let j=0;j<w;j++)s+=pcm[i+j]*pcm[i+j];env.push(Math.sqrt(s/w))}
  const peak=env.reduce((a,b)=>Math.max(a,b),0);if(peak<.01)throw Error('We barely heard you. Play louder or move the microphone closer.');
  const thr=peak*.25,offs=[];
  for(let k=4;k<n;k++){const c=Math.round(times[k]*rate)-first,lo=Math.max(1,Math.floor((c-.1*rate)/w)),hi=Math.min(env.length-1,Math.floor((c+.45*rate)/w));for(let i=lo;i<=hi;i++)if(env[i]>=thr&&env[i-1]<thr){offs.push((i*w-c)/rate*1000);break}}
  if(offs.length<5)throw Error('Only heard '+offs.length+' of 8 notes. Play short, crisp notes on every click and try again.');
  offs.sort((a,b)=>a-b);const med=offs[offs.length>>1],dev=offs.map(x=>Math.abs(x-med)).sort((a,b)=>a-b)[offs.length>>1];
  if(dev>40)throw Error('Your timing varied too much to measure. Try again with crisp, even notes.');
  const v=Math.max(0,Math.min(600,Math.round(med/5)*5)),slider=panel.querySelector('#takeAdvance');slider.value=String(v);slider.dispatchEvent(new Event('input'));panel.querySelector('#takeRemember').click();intro();
  say('Done: sax will be moved '+v+' ms earlier and this is saved. Record a short take and fine-tune by ear if needed.');
 }catch(e){say(window.friendlyMicError(e))}
 finally{mic?.getTracks().forEach(t=>t.stop());for(const x of [src,node,mute])try{x?.disconnect()}catch{}running=false;q('syncStart').disabled=false}
};
})();
