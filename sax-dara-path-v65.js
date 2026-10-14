/* V65: contextual, actionable SaxWorx course navigator. */
(()=>{'use strict';
const clips={Studio:'dara-start',Practice:'dara-daily','Groove lab':'dara-groove','Tone lab':'dara-retry',Lessons:'dara-start'};
let player=null,token=0,lastKey='';
function stop(){token++;if(player){player.pause();player.currentTime=0;player=null}}
window.MofeDaraPathStop=stop;
function speak(clip){stop();if(!clip)return;const n=token;const a=new Audio('voices/'+clip+'.mp3');a.volume=Math.min(1,Math.max(0,Number(window.voicePrefs?.volume??1)));player=a;a.play().catch(()=>{if(n===token)player=null});a.onended=()=>{if(n===token)player=null}}
const steps={
Studio:['Select your saxophone from the instrument selector at the top.','Open Lessons to learn a new skill, or Practice for daily exercises.','Begin with the first unfinished lesson, then practise its technique.'],
Lessons:['Select Study beside a lesson you have not completed.','Read the learning goal and follow the numbered instructions in order.','Use Tone lab, Practice, or Groove lab to apply the skill; mark complete only when ready.'],
Practice:['Choose the exercise in the Exercise menu.','Set a comfortable tempo and press Listen to hear the example.','Play it slowly; enable your microphone for scored practice if you wish.','For rhythm, select a groove and press Rehearse with Groove.','Complete all three exercises for each daily task; review your score and repeat difficult passages.'],
'Groove lab':['Select a groove style and set a slow, comfortable tempo.','Start the drums and bass; clap or tap along first.','Play one note on each beat, then practise a short phrase.','Stop the groove before moving to a new lesson.'],
'Tone lab':['Enable the microphone when prompted.','Play a comfortable long tone and watch the pitch display.','Repeat three times with steady breath and relaxed shoulders.'],
'Fingerings':['Select the written note you want to learn.','Study the highlighted keys, then practise the fingering slowly.','Compare your sound with the example and repeat.'],
'Ear training':['Listen to the interval or phrase.','Sing it first, then play it on your saxophone.','Repeat until you can recognise the sound confidently.'],
Progress:['Review your completed lessons and practice results.','Choose an unfinished lesson or repeat a difficult exercise.']};
function section(){try{return typeof view==='string'?view:'Studio'}catch{return 'Studio'}}
function context(){const s=section();const lesson=(typeof lessonIndex!=='undefined'&&lessonIndex!==null&&s==='Lessons'&&typeof lessons!=='undefined')?lessons[lessonIndex]:null;const daily=document.querySelector('#dailyPracticeTasks');const active=daily?.querySelector('.small');return {s,lesson,daily:active?.textContent||''}}
function renderGuide(){const page=document.getElementById('page');if(!page)return;const c=context();const key=c.s+'|'+(c.lesson?.[0]||'')+'|'+c.daily;let el=document.getElementById('dara-path-v65');if(key===lastKey&&el)return;lastKey=key;
if(!el){el=document.createElement('section');el.id='dara-path-v65';el.className='card';el.style.cssText='margin:6px 0;border-left:3px solid #54c894;padding:7px 10px';const old=document.getElementById('dara-guide');if(old)old.after(el);else page.prepend(el)}
const list=c.lesson?['Read the lesson goal: '+c.lesson[1]+'.',...c.lesson[2].map((s,i)=>'Step '+(i+1)+': '+s),'When you can demonstrate the skill, press Mark complete. Then return to All lessons.']:(steps[c.s]||steps.Studio).slice();if(c.daily)list.push('Current daily task: '+c.daily);
const title=c.lesson?'Lesson guide: '+c.lesson[0]:'Your next steps · '+c.s;
el.replaceChildren();const head=document.createElement('div');head.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap';const h=document.createElement('strong');h.textContent='🎧 Dara · '+(c.lesson?'Lesson guide':c.s);head.append(h);const summary=document.createElement('span');summary.style.cssText='font-size:12px;opacity:.8';summary.textContent='Voice tutor · '+list.length+' steps';head.append(summary);el.append(head);const details=document.createElement('details');details.style.cssText='margin-top:4px';const toggle=document.createElement('summary');toggle.textContent='Show written instructions (optional)';toggle.style.cssText='cursor:pointer;font-size:12px';details.append(toggle);const ol=document.createElement('ol');ol.style.cssText='padding-left:20px;line-height:1.4;font-size:13px;margin:6px 0';list.forEach(t=>{const li=document.createElement('li');li.textContent=t;ol.append(li)});details.append(ol);el.append(details);
const controls=document.createElement('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:5px';const voice=document.createElement('button');voice.type='button';voice.textContent='▶ Hear Dara';voice.onclick=()=>speak(c.lesson?'dara-start':clips[c.s]||'dara-start');controls.append(voice);const stopBtn=document.createElement('button');stopBtn.type='button';stopBtn.textContent='■ Stop';stopBtn.onclick=stop;controls.append(stopBtn);
const next=c.s==='Studio'?['Open Lessons',()=>go('Lessons')]:c.s==='Lessons'&&!c.lesson?['Open Practice',()=>go('Practice')]:c.s==='Practice'?['Open Groove Lab',()=>go('Groove lab')]:null;
if(next){const b=document.createElement('button');b.type='button';b.textContent='Next: '+next[0];b.onclick=()=>{stop();next[1]()};controls.append(b)}el.append(controls)
}
let scheduled=false;const update=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;renderGuide()})};
const page=document.getElementById('page');if(page){new MutationObserver(records=>{if(records.some(r=>r.target.closest?.('#dara-path-v65')))return;update()}).observe(page,{childList:true,subtree:true});update()}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b||b.closest('#dara-path-v65'))return;const t=(b.textContent||'').trim();if(/study|lesson|practice|next|previous|back|complete/i.test(t)||b.dataset.view) {stop();setTimeout(update,0)}},true);
document.getElementById('instrument')?.addEventListener('change',()=>{stop();setTimeout(update,0)});window.addEventListener('pagehide',stop);
})();
