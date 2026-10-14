/* V56 SaxWorx: three practice exercises per daily task. GuitarWorx is unchanged. */
(()=>{
 if(typeof dailyTasks==='undefined'||typeof refreshDailyProgress!=='function')return;
 const key=()=> 'saxworx-daily-exercises-v56-'+localPracticeDay();
 const get=()=>{try{return JSON.parse(localStorage.getItem(key())||'{}')}catch{return {}}};
 const set=x=>localStorage.setItem(key(),JSON.stringify(x));
 const originalRefresh=refreshDailyProgress;
 const originalMark=markDailyTask;
 const instructions=[
 ['Sustain one comfortable note for eight steady beats.','Repeat on a lower note, keeping the tone even.','Repeat on a higher note with a clean release.'],
 ['Clap and count quarter notes over two bars.','Play the same pulse on one sax note.','Play the pulse with four different notes.'],
 ['Count eighth notes slowly with the metronome.','Add a rest without losing the beat.','Play the pattern three times cleanly.'],
 ['Move between two notes with relaxed fingers.','Connect three notes without rushing.','Play a four-note pattern in both directions.'],
 ['Listen and sing the first interval.','Identify and play a second interval.','Listen, sing, then play a third interval.'],
 ['Play guide tones slowly over one chord.','Connect guide tones across two chords.','Repeat the connection over a groove.'],
 ['Study and demonstrate the first lesson example.','Repeat the example at a slower tempo.','Perform the example independently.'],
 ['Listen to and repeat the selected lick.','Play the lick slowly with a metronome.','Rehearse the lick over a backing groove.'],
 ['Play a short motif over a drum and bass groove.','Change the rhythm while keeping the groove.','Record or self-review a complete groove take.']
 ];
 window.completeSaxDailyExercise=function(i){
  if(!Number.isInteger(i)||i<0||i>=dailyTasks.length)return;
  const all=get(),done=Math.min(3,(all[i]||0)+1);all[i]=done;set(all);
  if(done===3&&!dailyDone().includes(i))originalMark(i);
  else refreshDailyProgress();
 };
 refreshDailyProgress=function(){
  originalRefresh();const list=document.getElementById('dailyPracticeTasks');if(!list)return;
  const counts=get();
  [...list.children].forEach((row,i)=>{
   if(i>=dailyTasks.length)return;
   const complete=dailyDone().includes(i),count=complete?3:Math.min(3,counts[i]||0);
   row.querySelectorAll('button').forEach(b=>{if(/Mark complete|Completed/.test(b.textContent))b.remove()});
   const label=document.createElement('div');label.className='small';label.style.cssText='width:100%;margin:6px 0;color:var(--muted,#b6cec3)';
   label.textContent='Exercise '+Math.min(count+1,3)+' of 3: '+instructions[i][Math.min(count,2)];
   const button=document.createElement('button');button.textContent=complete?'3 / 3 completed ✓':'Complete exercise '+(count+1)+' / 3';button.disabled=complete;button.onclick=()=>completeSaxDailyExercise(i);
   row.append(label,button);
  });
 };
 const oldMark=markDailyTask;
 markDailyTask=function(i){const all=get();all[i]=3;set(all);oldMark(i)};
 refreshDailyProgress();
})();