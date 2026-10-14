(()=>{'use strict';let audioCtx,compressor,timer=null,step=0;let drumGain=1,bassGain=1,saxGain=.65,grooveGain=1,demo=true,playToken=0;const patterns={'Afrobeat':[[0,3,7,10,14],[4,12],[0,2,4,6,8,10,12,14],[0,3,6,10,12]],'African Highlife':[[0,6,8,14],[4,12],[0,2,4,6,8,10,12,14],[0,3,7,8,11,14]],'African Praise':[[0,3,4,7,8,10,12,15],[4,12,15],[0,2,4,6,8,10,12,14,15],[0,2,5,8,10,13]],'Gospel':[[0,6,8,11],[4,12],[0,2,4,6,8,10,12,14],[0,6,8,11]],'Funk':[[0,3,8,10],[4,12],[0,2,4,6,8,10,12,14],[0,3,7,10,14]],'Jazz Swing':[[0,8],[4,12],[0,3,6,8,11,14],[0,4,8,12]],'Blues Shuffle':[[0,6,8,14],[4,12],[0,3,6,8,11,14],[0,3,8,11]],'R&B':[[0,7,10],[4,12],[0,2,4,6,8,10,12,14],[0,7,10,14]],'Reggae':[[4,12],[4,12],[2,6,10,14],[0,6,8,14]],'Amapiano':[[0,4,8,12],[4,12],[2,6,10,14],[0,3,7,11,14]],'Soukous':[[0,6,8,14],[4,12],[0,2,4,6,8,10,12,14],[0,3,7,10,14]],'Afro-Swing':[[0,3,8,11],[4,12],[0,3,6,8,11,14],[0,6,10,14]]};
function audio(){if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();compressor=audioCtx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=3;compressor.connect(audioCtx.destination)}if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
function tone(f,d,v,type='sine'){if(v<=0)return;const c=audio(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(Math.min(.7,v),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(compressor);o.start(t);o.stop(t+d+.01)}
window.MofePracticeGrooveStop=stop;function stop(){playToken++;if(typeof stopSax==='function')stopSax();if(timer)clearInterval(timer);timer=null;document.querySelectorAll('#page .target').forEach(e=>e.classList.remove('sw-groove-active'));const s=document.getElementById('sw-practice-groove-status');if(s)s.textContent='Groove stopped'}
async function play(){
 stop();const token=playToken;
 const genre=document.getElementById('sw-practice-genre')?.value||'Afrobeat',pattern=patterns[genre];
 const tempo=Math.max(45,Math.min(200,Number(document.getElementById('pbpm')?.value)||90));
 const events=typeof activeEvents==='function'?activeEvents():[];
 if(!events.length)return;
 const beats=events.map(e=>Math.max(.25,Number(e.beats)||.5));
 const total=beats.reduce((a,b)=>a+b,0),ticks=Math.max(1,Math.ceil(total*4));
 const saxNotes=events.filter(e=>e.m!==null).map(e=>Number(e.m)-offset());
 const status=document.getElementById('sw-practice-groove-status');
 if(status)status.textContent='Loading saxophone samples…';
 try{await audio();if(demo&&saxGain>0)await prepareSax(saxNotes)}catch(e){if(status)status.textContent='Saxophone samples unavailable: '+e.message;return}
 if(token!==playToken)return;
 if(status)status.textContent='Playing '+genre+' with recorded '+instrumentName()+' · '+tempo+' BPM';
 let elapsed=0,index=0;step=0;
 function tick(){
  if(token!==playToken)return;
  const p=step%16,volume=grooveGain;
  if(pattern[0].includes(p)){tone(68,.16,.34*drumGain*volume);tone(45,.2,.25*drumGain*volume)}
  if(pattern[1].includes(p)){tone(190,.1,.24*drumGain*volume,'triangle');tone(700,.05,.09*drumGain*volume,'sawtooth')}
  if(pattern[2].includes(p))tone(4500,.03,.055*drumGain*volume,'square');
  if(pattern[3].includes(p))tone([55,65.41,73.42,82.41,98,110][Math.floor(p/3)%6],.27,.24*bassGain*volume,'triangle');
  const beat=(step%ticks)/4;
  if(step%ticks===0){index=0;elapsed=0}
  while(index<beats.length-1&&beat>=elapsed+beats[index])elapsed+=beats[index++];
  if(demo&&saxGain>0&&Math.abs(beat-elapsed)<.001&&events[index].m!==null){
   try{saxPlay(Number(events[index].m)-offset(),ctx.currentTime+.01,Math.max(.08,beats[index]*60/tempo*.88),saxGain)}catch(e){if(status)status.textContent='Saxophone playback error: '+e.message}
  }
  const current=document.querySelectorAll('#page .target')[index];
  document.querySelectorAll('#page .target').forEach(el=>el.classList.toggle('sw-groove-active',el===current));
  current?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
  step++;if(step%ticks===0&&!document.getElementById('sw-practice-loop')?.checked)stop();
 }
 tick();if(token===playToken)timer=setInterval(tick,60000/tempo/4);
}
function instrumentName(){const v=document.getElementById('instrument')?.value;return ({'14':'Tenor Sax','2':'Soprano Sax','9':'Alto Sax','21':'Baritone Sax','0':'Concert Pitch'})[v]||'Sax'}
function updateListenLabel(){const b=document.querySelector('#page button[onclick="listenDrill()"]');if(b)b.textContent='Listen to '+instrumentName()}
function attach(){if(typeof practicePage!=='function')return;const old=practicePage;practicePage=function(){stop();old();updateListenLabel();const stopButton=document.querySelector('#page button[onclick="stopPractice()"]');const latency=document.getElementById('latency');if(!stopButton||!latency)return;const playButton=document.createElement('button');playButton.type='button';playButton.className='primary';playButton.id='sw-practice-groove-play';playButton.textContent='▶ Rehearse with Groove';stopButton.insertAdjacentElement('afterend',playButton);const panel=document.createElement('div');panel.id='sw-practice-groove-controls';panel.className='sw-practice-groove-controls';panel.innerHTML=`<label>Groove <select id="sw-practice-genre">${Object.keys(patterns).map(n=>`<option>${n}</option>`).join('')}</select></label><label>Groove volume <input id="sw-practice-volume" type="range" min="0" max="150" value="100" step="5"></label><label>Drums <input id="sw-practice-drums" type="range" min="0" max="150" value="100" step="5"></label><label>Bass <input id="sw-practice-bass" type="range" min="0" max="150" value="100" step="5"></label><label>Sax guide <input id="sw-practice-sax" type="range" min="0" max="100" value="65" step="5"></label><label><input type="checkbox" id="sw-practice-demo" checked> Recorded sax guide on</label><label><input type="checkbox" id="sw-practice-loop" checked> Loop</label><span id="sw-practice-groove-status" role="status">Groove ready</span>`;latency.closest('p').insertAdjacentElement('afterend',panel);[['volume',v=>grooveGain=v],['drums',v=>drumGain=v],['bass',v=>bassGain=v],['sax',v=>saxGain=v]].forEach(([id,fn])=>{panel.querySelector('#sw-practice-'+id).oninput=e=>fn(Number(e.target.value)/100)});panel.querySelector('#sw-practice-demo').onchange=e=>demo=e.target.checked;playButton.onclick=play;
 const listen=document.querySelector('#page button[onclick="listenDrill()"]');
 if(listen)listen.addEventListener('click',e=>{if(document.getElementById('sw-practice-genre')){e.preventDefault();e.stopImmediatePropagation();demo=true;document.getElementById('sw-practice-demo').checked=true;play()}},true);
 stopButton.addEventListener('click',stop)};if(typeof go==='function'){const oldGo=go;go=function(v){stop();return oldGo(v)}}}
window.addEventListener('DOMContentLoaded',()=>{attach();document.getElementById('instrument')?.addEventListener('change',()=>{stop();setTimeout(updateListenLabel,0)})});
})();
