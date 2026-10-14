/* Original MofePlay phrase animation. No external video bytes are copied. */
'use strict';
(() => {
 const byId=id=>document.getElementById(id);
 const visual={index:0,elapsed:0,started:0,frame:0,playing:false,beat:-1};
 const duration=()=>events.reduce((sum,event)=>sum+event.beats,0);
 const beatMs=()=>60000/(Number(byId('tempo').value)||65)/Number(byId('visualSpeed').value);
 const startBeat=index=>events.slice(0,index).reduce((sum,event)=>sum+event.beats,0);
 const svgNode=(name,attributes={},text)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));if(text!==undefined)node.textContent=text;return node;};
 function finger(position,event){
  if(position.f===0)return '0';
  const shapes={Em:[0,2,3,0,0,0],Am:[null,0,2,3,1,0],C:[null,3,2,0,1,0],G:[2,1,0,0,0,3],D:[null,null,0,1,3,2],A:[null,0,1,2,3,0],E:[0,2,3,1,0,0],Dm:[null,null,0,2,3,1]};
  if(state.tuning==='standard'&&current.chords&&shapes[event.label])return String(shapes[event.label][position.s]);
  const frets=events.flatMap(e=>e.pos.filter(p=>p.f>0).map(p=>p.f));
  const base=Math.min(...frets),distance=position.f-base;
  if(configuration().family==='bass')return String([1,2,4][Math.max(0,distance)%3]);
  return String(Math.max(0,distance)%4+1);
 }
 function render(){
  if(!current||!events.length)return;
  visual.index=Math.max(0,Math.min(events.length-1,visual.index));
  const event=events[visual.index],strings=tuned(),positions=event.pos;
  const frets=events.flatMap(e=>e.pos.map(p=>p.f)),positive=frets.filter(f=>f>0),min=positive.length?Math.min(...positive):1,max=Math.max(min+3,...frets);
  const count=max-min+1,wide=760,height=270,x0=100,x1=720,y0=74,y1=222,cell=(x1-x0)/(count+1);
  const x=f=>state.left?x1-(f===0?.5:f-min+1.5)*cell:x0+(f===0?.5:f-min+1.5)*cell;
  const y=s=>y0+(strings.length-1-s)*(y1-y0)/(strings.length-1);
  const svg=svgNode('svg',{viewBox:`0 0 ${wide} ${height}`,role:'img','aria-label':configuration().name+', '+eventLabel(event)});
  svg.append(svgNode('rect',{x:x0,y:y0-20,width:x1-x0,height:y1-y0+40,rx:8,fill:'#173a2b'}));
  svg.append(svgNode('text',{x:22,y:30,fill:'#efc66a','font-size':19,'font-family':'system-ui'},event.pos.length?eventLabel(event):'REST · keep counting'));
  svg.append(svgNode('text',{x:x1,y:30,fill:'#b9d4c5','font-size':14,'text-anchor':'end','font-family':'system-ui'},state.left?'Left-handed view':'Player’s fretboard view'));
  [0,...Array.from({length:count},(_,i)=>min+i)].forEach(f=>{svg.append(svgNode('text',{x:x(f),y:height-12,fill:'#b9d4c5','font-size':15,'text-anchor':'middle','font-family':'system-ui'},f===0?'OPEN':f));if(f>0)svg.append(svgNode('line',{x1:x(f)+(state.left?-1:1)*cell*.48,x2:x(f)+(state.left?-1:1)*cell*.48,y1:y0-20,y2:y1+20,stroke:'#87a797','stroke-width':2}));});
  strings.forEach((note,s)=>{
   const active=positions.some(p=>p.s===s);
   svg.append(svgNode('line',{x1:x0,x2:x1,y1:y(s),y2:y(s),stroke:active?'#efc66a':'#799183','stroke-width':active?4:1+(strings.length-1-s)*.35}));
   svg.append(svgNode('text',{x:86,y:y(s)+5,fill:'#d6e8dc','font-size':14,'text-anchor':'end','font-family':'system-ui'},'S'+(strings.length-s)+' '+pitchName(note)));
   if(current.chords&&!active)svg.append(svgNode('text',{x:44,y:y(s)+5,fill:'#ffa89c','font-size':18},'×'));
  });
  positions.forEach(p=>{svg.append(svgNode('circle',{cx:x(p.f),cy:y(p.s),r:16,fill:p.f===0?'#173a2b':'#64c7a5',stroke:'#efc66a','stroke-width':2}));svg.append(svgNode('text',{x:x(p.f),y:y(p.s)+6,'text-anchor':'middle',fill:p.f===0?'#efc66a':'#061a12','font-size':17,'font-family':'system-ui','font-weight':700},finger(p,event)));});
  byId('visualStage').replaceChildren(svg);
  byId('visualScrub').max=events.length-1;byId('visualScrub').value=visual.index;
  byId('visualTitle').textContent=configuration().name+' · exercise '+(session.index+1)+' of 5 · '+(current.exerciseNames?.[session.index]||current.title);
  const cue=positions.length?positions.map(p=>'String '+(strings.length-p.s)+', '+(p.f===0?'open':'fret '+p.f+' · finger '+finger(p,event))).join(' | '):'Rest. Stop the string sound gently and keep the beat.';
  byId('visualCue').textContent=cue+(positions.length?' · '+event.beats+' beat'+(event.beats===1?'':'s'):'');
  byId('visualBeats').replaceChildren(...Array.from({length:Math.ceil(duration())},(_,i)=>{const span=document.createElement('span');span.textContent=(i%4+1);span.className=i===visual.beat?'current':i<visual.beat?'done':'';span.title='Bar '+(Math.floor(i/4)+1)+', beat '+(i%4+1);return span;}));
  byId('visualPlay').textContent=visual.playing?'Playing…':visual.elapsed?'Resume demonstration':'Play demonstration';
 }
 function stop(reset=false){cancelAnimationFrame(visual.frame);visual.frame=0;visual.playing=false;if(reset){visual.elapsed=0;visual.index=0;visual.beat=-1;}render();}
 function sound(){const event=events[visual.index];stopNotes();if(event?.pos.length)notesOf(event).forEach((n,j)=>pluck(n,event.beats*beatMs()/1000,j?audioContext().currentTime+j*.025:null));}
 function tick(now){
  if(!visual.playing)return;
  visual.elapsed=(now-visual.started)/beatMs();
  if(visual.elapsed>=duration()){
   if(byId('visualLoop').checked){visual.elapsed=0;visual.started=now;visual.index=0;visual.beat=0;sound();render();}
   else {stop(true);stopNotes();byId('visualCue').textContent='Both bars demonstrated. Tap Start my turn below to practise.';speak('Both bars demonstrated. Choose Start my turn to practise.','your-turn');return;}
  }
  let total=0,index=0;for(let i=0;i<events.length;i++){total+=events[i].beats;if(visual.elapsed<total){index=i;break;}}
  const beat=Math.floor(visual.elapsed);
  if(index!==visual.index){visual.index=index;sound();}
  if(beat!==visual.beat||Number(byId('visualScrub').value)!==visual.index){visual.beat=beat;render();}
  visual.frame=requestAnimationFrame(tick);
 }
 function play(){
  if(!current||visual.playing)return;
  const resume=visual.elapsed;cancelPractice();stopMic();stopJam();stopMetro();byId('songPlayer').pause();byId('introVideo').pause();byId('refPlayer').replaceChildren();
  audioContext();visual.elapsed=resume;visual.playing=true;visual.started=performance.now()-resume*beatMs();mode='visual-demo';sound();render();visual.frame=requestAnimationFrame(tick);
 }
 function seek(index){cancelPractice();stopMic();stopJam();stopMetro();byId('songPlayer').pause();byId('refPlayer').replaceChildren();visual.index=Math.max(0,Math.min(events.length-1,index));visual.elapsed=startBeat(visual.index);visual.beat=Math.floor(visual.elapsed);render();sound();}
 function embed(preserveVoice=false){
  if(!current)return;
  if(!preserveVoice){cancelPractice();stopMic();stopJam();stopMetro();byId('songPlayer').pause();byId('introVideo').pause();}
  const ref=reference(current),frame=document.createElement('iframe');
  frame.src='https://www.youtube-nocookie.com/embed/'+ref.videoId+'?rel=0'+(ref.start?'&start='+ref.start:'');
  frame.title=ref.title;frame.allow='encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  byId('refPlayer').replaceChildren(frame);byId('refTopic').textContent=ref.title;
  byId('refLink').href='https://www.youtube.com/watch?v='+ref.videoId;byId('refLink').textContent='Open the creator’s video on YouTube ↗';
  byId('refCredit').textContent=ref.credit+' · External technique reference. The animated exercise beside it is original MofePlay content.';
 }
 const cancelOriginal=cancelPractice;cancelPractice=function(){stop(true);cancelOriginal();};
 const loadOriginal=loadPhrase;loadPhrase=function(){loadOriginal();stop(true);};
 const openOriginal=openLesson;openLesson=function(id){openOriginal(id);if(current&&view==='studio'){embed(true);render();}};
 demo=()=>{stop(true);stopNotes();play();};
 byId('lessonVoiceStop').onclick=stopVoice;
 byId('visualPlay').onclick=play;
 byId('visualPause').onclick=()=>{stop();stopNotes();};
 byId('visualRestart').onclick=()=>{stop(true);stopNotes();play();};
 byId('visualPrevious').onclick=()=>seek(visual.index-1);
 byId('visualNext').onclick=()=>seek(visual.index+1);
 byId('visualScrub').oninput=()=>seek(Number(byId('visualScrub').value));
 byId('visualSpeed').onchange=()=>{stop();stopNotes();byId('visualCue').textContent='Speed changed. Resume to hear the phrase at the new speed.';};
 byId('refWatch').onclick=()=>embed();
 byId('guidance').onclick=()=>{cancelPractice();stopMic();stopJam();stopMetro();byId('songPlayer').pause();byId('refPlayer').replaceChildren();state.voice=true;byId('voiceOn').checked=true;store();speak(current.title+'. '+current.goal+' '+current.tip+' '+phraseInstructions(),'lesson-'+state.instrument+'-'+current.id);};
 // Clear a playing YouTube frame before microphone or backing-track work.
 for(const id of ['myTurn','lessonRehearse','lessonPulse'])byId(id).addEventListener('click',()=>byId('refPlayer').replaceChildren(),true);
 byId('tempo').addEventListener('input',()=>{if(visual.playing){stop();stopNotes();}});
})();
