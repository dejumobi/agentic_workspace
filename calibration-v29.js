// SAXWORX CALIBRATION V29: acoustic round-trip estimate, never automatically applied.
(function(){
const box=document.createElement('div');box.innerHTML='<details><summary>Test recording timing</summary><p class="small">Use your speakers at a comfortable volume. Stay quiet during three short clicks. This measures the acoustic round trip with echo cancellation off; normal recording processing may add a different delay. Headphones cannot be calibrated this way.</p><button id="calStart">Run speaker timing test</button> <button id="calUse" hidden>Use estimate for this mix</button><p id="calStatus" role="status" class="small"></p></details>';panel.append(box);
const q=id=>box.querySelector('#'+id);let running=false,result=null,generation=0;
const priorStart=startStudioRecording;startStudioRecording=async function(){if(running){q('calStatus').textContent='Wait for the timing test to finish before recording.';return}return priorStart()};
q('calUse').onclick=()=>{const slider=panel.querySelector('#takeAdvance');if(!slider||result===null)return;slider.value=String(Math.round(result/5)*5);slider.dispatchEvent(new Event('input'));q('calStatus').textContent='Estimate selected. Click Preview correction & mix, then listen and fine-tune. Original tracks stay unchanged.'};
q('calStart').onclick=async()=>{
 if(running||studioPending||studioRecorder){q('calStatus').textContent='Finish recording before testing timing.';return}
 if(engine){q('calStatus').textContent='Stop the groove before testing timing.';return}
 running=true;const token=++generation;q('calStart').disabled=true;q('calUse').hidden=true;result=null;let mic,node,source,worker,silent,sources=[],timer,visibilityHandler;
 const cleanup=()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',visibilityHandler);for(const s of sources){try{s.stop();s.disconnect()}catch{}}for(const n of [source,node,silent])try{n?.disconnect()}catch{}mic?.getTracks().forEach(t=>t.stop());worker?.terminate();running=false;q('calStart').disabled=false};
 try{
 await audio();if(!ctx.audioWorklet||!window.Worker)throw Error('This browser does not support the timing test. Use the manual adjustment.');stopMic();
 q('calStatus').textContent='Allow microphone access, then stay quiet.';
 mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 if(token!==generation)throw Error('Test cancelled.');await ctx.audioWorklet.addModule('calibration-worklet-v29.js?v=29');
 source=ctx.createMediaStreamSource(mic);node=new AudioWorkletNode(ctx,'saxworx-calibration',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});silent=ctx.createGain();silent.gain.value=0;source.connect(node);node.connect(silent);silent.connect(ctx.destination);
 const rate=ctx.sampleRate,length=Math.round(rate*.06),ref=new Float32Array(length);let seed=9281;for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;ref[i]=((seed/4294967296)*2-1)*Math.sin(Math.PI*i/length)*.12}const buffer=ctx.createBuffer(1,length,rate);buffer.copyToChannel(ref,0);
 const start=ctx.currentTime+.6,times=[start,start+1,start+2],chunks=[];let first=null;
 const done=new Promise((resolve,reject)=>{node.port.onmessage=e=>{if(e.data.done)resolve();else if(e.data.pcm){if(first===null)first=e.data.frame;chunks.push(e.data)}};timer=setTimeout(()=>reject(Error('Timing test timed out. Please retry with this tab visible.')),8000);visibilityHandler=()=>{if(document.hidden)reject(Error('Test cancelled because the tab was hidden.'))};document.addEventListener('visibilitychange',visibilityHandler)});
 for(const t of times){const s=ctx.createBufferSource();s.buffer=buffer;s.connect(ctx.destination);s.start(t);sources.push(s)}q('calStatus').textContent='Listening for three clicks…';
 const stopTimer=setTimeout(()=>node.port.postMessage('stop'),Math.max(0,(start+2.6-ctx.currentTime)*1000));try{await done}finally{clearTimeout(stopTimer)}
 if(first===null||!chunks.length)throw Error('No microphone samples received.');const end=chunks[chunks.length-1];const pcm=new Float32Array(end.frame-first+end.pcm.byteLength/4);for(const c of chunks)pcm.set(new Float32Array(c.pcm),c.frame-first);
 worker=new Worker('calibration-analysis-v29.js?v=29');const answer=await new Promise((resolve,reject)=>{worker.onmessage=e=>resolve(e.data);worker.onerror=()=>reject(Error('Timing analysis failed.'));clearTimeout(timer);timer=setTimeout(()=>reject(Error('Timing analysis timed out.')),5000);worker.postMessage({pcm:pcm.buffer,ref:ref.buffer,rate,starts:times.map(t=>Math.round(t*rate)-first)},[pcm.buffer,ref.buffer])});
 if(answer.reliable){result=answer.delay;q('calStatus').textContent='Estimated speaker round trip: '+result+' ms. Compare it against your sax playback; echo processing can change the needed correction.';q('calUse').hidden=!panel.querySelector('#takeAdvance')}else q('calStatus').textContent='No consistent timing estimate. Speaker filtering or room noise may interfere. Use the manual adjustment; no correction has been applied.';
 }catch(e){q('calStatus').textContent=e.message}finally{cleanup()}
};
})();
