/* Original MofePlay finger-fluency drills. Written saxophone pitches. */
(()=>{
const bank=[];
const add=(id,title,level,category,notes,tip)=>bank.push({id,title,level,category,notes,tip});
const scales={Major:[0,2,4,5,7,9,11,12],'Natural minor':[0,2,3,5,7,8,10,12],'Major pentatonic':[0,2,4,7,9,12],'Minor pentatonic':[0,3,5,7,10,12]};
const keyNames=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
for(let k=0;k<12;k++){
 const root=60+k;
 for(const [label,intervals] of Object.entries(scales)){
 const n=intervals.map(i=>root+i);
 add(label+k,label+' · '+keyNames[k],'Beginner','Scales',[...n,...n.slice(0,-1).reverse()],'Keep fingertips close to the pearls. Begin with one note per click.');
 add(label+'groups'+k,label+' groups of three · '+keyNames[k],'Intermediate','Patterns',n.slice(0,-2).flatMap((_,i)=>n.slice(i,i+3)),'Connect each group evenly; avoid an accent on every first note.');
 }
 const major=scales.Major.map(i=>root+i);
 add('thirds'+k,'Major scale in thirds · '+keyNames[k],'Intermediate','Intervals',major.slice(0,-2).flatMap((n,i)=>[n,major[i+2]]),'Coordinate fingers together so no unintended note appears between the two pitches.');
 for(const [label,a] of Object.entries({'Major triad':[0,4,7,12],'Minor triad':[0,3,7,12],'Dominant seventh':[0,4,7,10,12],'Major seventh':[0,4,7,11,12]})){
 const n=a.map(i=>root+i);add(label+k,label+' arpeggio · '+keyNames[k],'Intermediate','Arpeggios',[...n,...n.slice(0,-1).reverse()],'Keep a steady airstream through the wider skips.');
 }
 const chrom=Array.from({length:13},(_,i)=>root+i);
 add('chrom'+k,'Chromatic octave · '+keyNames[k],'Intermediate','Chromatic',[...chrom,...chrom.slice(0,-1).reverse()],'Use comfortable alternate fingerings; examine side versus bis B♭ when crossing A–B♭–B.');
 add('oct'+k,'Octave coordination · '+keyNames[k],'Intermediate','Register changes',[root,root+12,root,root+12,root+2,root+14,root+2,root+14],'Coordinate the octave thumb with the main fingers. Keep the tone supported.');
}
for(let m=58;m<89;m++)add('pair'+m,'Neighbour-note switch · '+note(m)+' / '+note(m+1),m<77?'Beginner':'Advanced','Note pairs',[m,m+1,m,m+1,m+1,m,m+1,m],'Move only the keys that change. Repeat slowly until both directions feel even.');
for(let m=60;m<=76;m++)add('turn'+m,'Chromatic turn · '+note(m),'Intermediate','Patterns',[m,m+1,m+2,m+1,m,m+1,m+2,m+1],'Use small movements and practise the return as carefully as the ascent.');
for(let m=84;m<=87;m++)add('palm'+m,'Palm-key flow · '+note(m),'Advanced','Register changes',[m,m+1,m+2,m+3,m+2,m+1,m],'Use a light palm-key touch; keep the hand relaxed rather than twisting to reach.');
let chosen=bank[0].id,level='All',category='All',tempo=60,loop=false,handle=null,token=0,position=0;
let completed={};try{completed=JSON.parse(localStorage.getItem('mofe-finger-exercises-v70')||'{}')||{}}catch{}
const original=fingerPage;
function stop(){token++;clearTimeout(handle);handle=null;const b=document.getElementById('fx-status');if(b)b.textContent='Stopped. Practise slowly with relaxed hands.';}
function showNote(m){saxSelected=m;saxVariant='standard';saxCustomKeys=null;const select=document.getElementById('saxNote');if(select)select.value=m;const variant=document.getElementById('saxVariant');if(variant)variant.value='standard';updateSaxKeyMap();const title=document.getElementById('saxNoteTitle');if(title)title.textContent=selectedSaxLabel();const titleRow=title?.parentElement.querySelector('p');if(titleRow)titleRow.textContent='Concert '+note(m-offset())+' · '+freq(m-offset()).toFixed(1)+' Hz';}
function draw(){stop();original();const filtered=bank.filter(d=>(level==='All'||d.level===level)&&(category==='All'||d.category===category));if(!filtered.some(d=>d.id===chosen))chosen=filtered[0]?.id;const d=bank.find(d=>d.id===chosen);const section=document.createElement('section');section.className='card';section.style.marginBottom='22px';section.innerHTML=`<span class="tag">FINGER FLUENCY · ${bank.length} EXERCISES</span><h2>Fingering Exercises</h2><p>Build smooth, coordinated movement from simple note pairs to scales, patterns and register changes. Aim for clean transitions before increasing speed.</p><div class="row controls"><label>Level <select id="fx-level">${['All','Beginner','Intermediate','Advanced'].map(v=>`<option ${v===level?'selected':''}>${v}</option>`).join('')}</select></label><label>Category <select id="fx-category">${['All',...new Set(bank.map(d=>d.category))].map(v=>`<option ${v===category?'selected':''}>${v}</option>`).join('')}</select></label><label>Exercise <select id="fx-drill" style="max-width:100%">${filtered.map(x=>`<option value="${x.id}" ${x.id===chosen?'selected':''}>${completed[x.id]?'✓ ':''}${x.title}</option>`).join('')}</select></label></div><p>${d?.tip||'Choose another filter combination.'}</p><div id="fx-notes" class="row" style="gap:6px;flex-wrap:wrap">${d?.notes.map((m,i)=>`<button data-fx-note="${i}" aria-label="Show fingering for ${note(m)}">${note(m)}</button>`).join('')||''}</div><div class="row controls" style="margin-top:16px"><label>Tempo <input id="fx-tempo" type="number" min="30" max="180" value="${tempo}" style="width:75px"> BPM</label><label><input id="fx-loop" type="checkbox" ${loop?'checked':''}> Loop</label><button id="fx-start">Start visual practice + click</button><button id="fx-hear">Hear sax demonstration</button><button id="fx-stop">Stop</button><button id="fx-complete">Mark practised</button></div><p id="fx-status" role="status">${completed[chosen]?'Previously practised on this device.':'Start at 60 BPM or slower. Play one written note per click.'}</p><p class="small">Tap a note to inspect its fingering below. The moving key chart guides practice; it does not assess your physical finger movement. Completion is self-reported and saved on this device. Daily routine: one note-pair drill, one scale and one arpeggio, two minutes each.</p>`;
 document.querySelector('.intro h1').textContent='Fingering Exercises';document.querySelector('.intro p').textContent='Practise finger fluency, then inspect the keys for each written note.';document.querySelector('.saxExplorer').before(section);
 document.getElementById('fx-level').onchange=e=>{level=e.target.value;draw()};document.getElementById('fx-category').onchange=e=>{category=e.target.value;draw()};document.getElementById('fx-drill').onchange=e=>{chosen=e.target.value;draw()};document.getElementById('fx-tempo').onchange=e=>{tempo=Math.max(30,Math.min(180,Number(e.target.value)||60));e.target.value=tempo;stop()};document.getElementById('fx-loop').onchange=e=>loop=e.target.checked;
 section.querySelectorAll('[data-fx-note]').forEach(b=>b.onclick=()=>{stop();showNote(d.notes[+b.dataset.fxNote])});document.getElementById('fx-stop').onclick=stop;
 async function start(demo){stop();await audio();const ticket=++token;position=-4;const step=()=>{if(ticket!==token||view!=='Fingerings')return;const beat=60/tempo;if(position<0){synth(84,ctx.currentTime,.04,'sine',.07);document.getElementById('fx-status').textContent='Count in: '+(position+5)+' / 4';position++;handle=setTimeout(step,beat*1000);return}if(position>=d.notes.length){if(loop)position=0;else{document.getElementById('fx-status').textContent='Sequence finished. Repeat cleanly three times before increasing tempo by 5 BPM.';handle=null;return}}const m=d.notes[position];showNote(m);section.querySelectorAll('[data-fx-note]').forEach((b,i)=>{b.classList.toggle('primary',i===position);b.setAttribute('aria-pressed',String(i===position))});if(demo)hearSaxNote(m,beat*.8);else synth(84,ctx.currentTime,.04,'sine',.05);document.getElementById('fx-status').textContent=(demo?'Listen: ':'Play: ')+note(m)+' · '+(position+1)+' / '+d.notes.length;position++;handle=setTimeout(step,beat*1000)};step()}
 for(const id of ['fx-start','fx-hear','fx-complete'])document.getElementById(id).disabled=!d;document.getElementById('fx-start').onclick=()=>start(false);document.getElementById('fx-hear').onclick=()=>start(true);document.getElementById('fx-complete').onclick=()=>{completed[chosen]=true;try{localStorage.setItem('mofe-finger-exercises-v70',JSON.stringify(completed))}catch{}document.getElementById('fx-status').textContent='Practice recorded. Keep the tempo comfortable and focus on smooth transitions.'};
 document.getElementById('saxNote').onchange=e=>{stop();showNote(+e.target.value)};if(d)showNote(d.notes[0]);
}
fingerPage=draw;const oldGo=go;go=function(v){stop();return oldGo(v)};
const rename=()=>document.querySelectorAll('[data-view="Fingerings"]').forEach(b=>{for(const n of b.childNodes)if(n.nodeType===3&&n.textContent.includes('Fingerings'))n.textContent=n.textContent.replace('Fingerings','Fingering Exercises')});rename();new MutationObserver(rename).observe(document.getElementById('nav'),{childList:true,subtree:true});
window.mofeFingeringExerciseCount=bank.length;
})();
const musicTutorScript=document.createElement('script');
musicTutorScript.src='/music-tutor-stream.js?v=1';
musicTutorScript.dataset.instrument='Saxophone';
musicTutorScript.dataset.target='#page';
document.body.append(musicTutorScript);
