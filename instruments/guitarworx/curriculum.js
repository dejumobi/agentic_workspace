/* Original GuitarWorx exercises. Positions use low-to-high string indexes. */
'use strict';
const INSTRUMENTS={acoustic:{name:'Acoustic guitar',family:'guitar',strings:[40,45,50,55,59,64],tone:'steel'},electric:{name:'Electric guitar',family:'guitar',strings:[40,45,50,55,59,64],tone:'electric'},classical:{name:'Classical guitar',family:'guitar',strings:[40,45,50,55,59,64],tone:'nylon'},bass4:{name:'4-string bass',family:'bass',strings:[28,33,38,43],tone:'bass'},bass5:{name:'5-string bass',family:'bass',strings:[23,28,33,38,43],tone:'bass'},bass6:{name:'6-string bass',family:'bass',strings:[23,28,33,38,43,48],tone:'bass'}};
const REFERENCES={"guitar":{"videoId":"-04Et5qIoa4","title":"How to hold a guitar pick","credit":"Justin Sandercoe · JustinGuitar","url":"https://www.youtube.com/watch?v=-04Et5qIoa4"},"guitarHand":{"videoId":"q8SHmo1-dac","title":"Alternate picking: three technique tips","credit":"Justin Sandercoe · JustinGuitar","url":"https://www.youtube.com/watch?v=q8SHmo1-dac"},"strum":{"videoId":"CjM5fyXoV8w","title":"Strumming patterns and a steady hand","credit":"Justin Sandercoe · JustinGuitar","url":"https://www.youtube.com/watch?v=CjM5fyXoV8w"},"chords":{"videoId":"Hfm4-yOI6oA","title":"E minor chord: forming a clean shape","credit":"Justin Sandercoe · JustinGuitar","url":"https://www.youtube.com/watch?v=Hfm4-yOI6oA"},"pentatonic":{"videoId":"G-X1RemAzks","title":"Minor pentatonic scale foundations","credit":"Justin Sandercoe · JustinGuitar","url":"https://www.youtube.com/watch?v=G-X1RemAzks"},"hammer":{"videoId":"7hDdZAjKBjY","title":"Hammer-ons explained with a beginner exercise","credit":"Justin Sandercoe · JustinGuitar","url":"https://www.youtube.com/watch?v=7hDdZAjKBjY"},"classical":{"videoId":"HTjwvwCZmRo","title":"Classical guitar: left-hand position","credit":"Bradford Werner · This is Classical Guitar","url":"https://www.thisisclassicalguitar.com/left-hand-technique-and-position/"},"classicalPick":{"videoId":"RDOqubQd9Jo","title":"Classical guitar: right-hand position","credit":"Bradford Werner · This is Classical Guitar","url":"https://www.thisisclassicalguitar.com/right-hand-technique-for-classical-guitar/","start":320},"bass":{"videoId":"2SeLVYIX-s0","title":"Bass fretting: clean notes and relaxed position","credit":"Andrew Pouska · StudyBass","url":"https://www.studybass.com/lessons/bass-technique/fretting/"},"bassTechnique":{"videoId":"yBU3tDJUc4Q","title":"Bass plucking: alternating fingers and muting","credit":"Andrew Pouska · StudyBass","url":"https://www.studybass.com/lessons/bass-technique/plucking/"}};
const CHORDS={Em:[0,2,2,0,0,0],Am:[null,0,2,2,1,0],C:[null,3,2,0,1,0],G:[3,2,0,0,0,3],D:[null,null,0,2,3,2],A:[null,0,2,2,2,0],E:[0,2,2,1,0,0],Dm:[null,null,0,2,3,1]};
const MODULES=[{id:'g-foundation',family:'guitar',level:'beginner',title:'01 · Meet the strings',description:'A comfortable hold, string names and clean notes.'},{id:'g-pulse',family:'guitar',level:'beginner',title:'02 · Build your pulse',description:'Keep time through notes, holds and silence.'},{id:'g-chords',family:'guitar',level:'beginner',title:'03 · Chords become songs',description:'Build shapes slowly, then connect them musically.'},{id:'g-phrases',family:'guitar',level:'intermediate',title:'04 · Phrase and recall',description:'Pentatonic vocabulary, picking and musical space.'},{id:'g-control',family:'guitar',level:'intermediate',title:'05 · Control and colour',description:'Arpeggios, articulations and chord changes.'},{id:'g-music',family:'guitar',level:'intermediate',title:'06 · Make it your own',description:'Target chord tones, play a groove and improvise.'},{id:'b-foundation',family:'bass',level:'beginner',title:'01 · Find your bass voice',description:'Clean attacks, relaxed fretting and quiet unused strings.'},{id:'b-pulse',family:'bass',level:'beginner',title:'02 · Own the pocket',description:'Steady roots, fifths and well-placed rests.'},{id:'b-music',family:'bass',level:'beginner',title:'03 · Support the song',description:'Build lines that connect the chords.'},{id:'b-control',family:'bass',level:'intermediate',title:'04 · Fretboard fluency',description:'Scales, arpeggios and coordinated shifts.'},{id:'b-groove',family:'bass',level:'intermediate',title:'05 · Groove vocabulary',description:'Offbeats, funk, walking lines and fills.'},{id:'b-performance',family:'bass',level:'intermediate',title:'06 · Play with intention',description:'Chord targets, extended range and musical phrasing.'}];
function pitchName(n){return ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][((n%12)+12)%12]+(Math.floor(n/12)-1)}
function tuningFor(id,tuning='standard'){const notes=[...INSTRUMENTS[id].strings];if(tuning==='drop')notes[0]-=2;return notes}
function position(s,f,beats=1){return {pos:[{s,f}],beats}}
function rest(beats=1){return {pos:[],beats}}
function cloneEvents(events){return events.map(e=>({...e,pos:e.pos.map(p=>({...p}))}))}
function fitBars(events){const result=[];let total=0;for(const event of events){let duration=Math.min(event.beats,8-total);while(duration>0){const b=Math.min(duration,4-total%4);result.push({...event,pos:event.pos.map(p=>({...p})),beats:b});duration-=b;total+=b}if(total===8)break}while(total<8){const b=Math.min(8-total,4-total%4);result.push(rest(b));total+=b}return result}
function patternVariations(positions,style='phrase'){
 const p=i=>positions[(i+positions.length)%positions.length],e=(i,b=1)=>({...p(i),pos:p(i).pos.map(p=>({...p})),beats:b});
 let raw;
 if(style==='eighth')raw=[[e(0,.5),e(1,.5),e(2,1),e(3,1),rest(1),e(1,.5),e(2,.5),e(3,1),e(0,2)],[e(0,1),rest(.5),e(1,.5),e(2,1),e(3,1),e(2,1),e(1,.5),e(0,.5),e(3,2)],[e(0,.5),e(1,.5),e(2,.5),e(3,.5),e(2,2),e(1,1),rest(1),e(0,2)],[rest(.5),e(0,.5),e(1,1),e(2,.5),e(3,.5),e(2,1),e(1,1),e(0,1),e(3,2)],[e(0,1),e(1,.5),e(2,.5),e(3,2),rest(1),e(2,.5),e(1,.5),e(0,2)]];
 else if(style==='sustain')raw=[[e(0,2),rest(2),e(1,2),rest(2)],[e(0,2),e(1,2),e(2,2),e(0,2)],[e(0,1),e(1,1),e(2,2),e(1,2),rest(2)],[e(3,4),e(2,2),e(1,1),e(0,1)],[e(0,1),e(1,1),rest(2),e(2,2),e(0,2)]];
 else raw=[[e(0),e(0),e(0),rest(1),e(0),e(0),e(0),rest(1)],[e(0),e(1),e(0),e(1),e(0),e(1),e(0),e(1)],[e(0),e(1),e(2),e(1),e(0),e(2),e(1),rest(1)],[e(2),e(1),e(0,2),e(1),e(2),rest(1),e(0)],[e(0),e(1),e(2),e(3),e(2),e(1),e(0,2)]];
 return raw.map(fitBars);
}

function musicalVariations(pool,feel='pop',advanced=false){
 const note=(i,b)=>({...pool[i%pool.length],pos:pool[i%pool.length].pos.map(p=>({...p})),beats:b});
 const cells={pop:[1,.5,.5,1,1],soul:[1.5,.5,1,1],blues:[1,1,.5,.5,1],minor:[1,.5,.5,1,1],reggae:[.5,.5,.5,.5,.5,.5,.5,.5],latin:[1.5,.5,1,.5,.5],disco:[.5,.5,.5,.5,.5,.5,.5,.5],walking:[1,1,1,1],afrobeat:[.5,.5,.5,1,.5,1],funk:advanced?[.25,.25,.5,.25,.25,.5,1,1]:[.5,.5,.5,.5,1,1]};
 const durations=cells[feel]||cells.pop;
 return Array.from({length:5},(_,variation)=>fitBars(Array.from({length:2},(_,bar)=>durations.map((beats,index)=>{const silent=feel==='reggae'?index%2===0:(variation+bar+index)%7===5;return (silent||(variation===4&&bar===1&&index===durations.length-1))?rest(beats):note(variation===4?pool.length*4-(bar*2+(feel==='reggae'?Math.floor(index/2):index)):(variation+bar*2+(feel==='reggae'?Math.floor(index/2):index)+(variation===3&&bar===1?1:0)),beats)})).flat()));
}

function curriculum(id,tuning='standard'){
 const inst=INSTRUMENTS[id],bass=inst.family==='bass',notes=tuningFor(id,tuning),hi=notes.length-1,E=bass?(notes.length===4?0:1):0,A=E+1,D=E+2,G=E+3;
 const pos=(s,...frets)=>frets.map(f=>position(s,f));
 const high=bass?pos(G,0,2,4,5):pos(hi,0,1,3,5);
 const low=pos(E,0,2,3,5),minor=pos(E,0,3,5,7),major=pos(E,0,2,4,5),fifths=[position(E,0),position(A,2),position(E,3),position(A,5)];
 const lessons=[];function add(module,id,title,goal,tip,positions,style='phrase',special={}){const m=MODULES.find(m=>m.id===module);lessons.push({id,module,level:m.level,title,goal,tip,phrases:patternVariations(positions,style),...special})}
 if(!bass){
 add('g-foundation','first-string','Your first clean note','Play a note, leave space, then add neighbouring frets.','Use open first string, then fret 1 with index and fret 3 with ring. Keep your shoulder relaxed.',pos(hi,0,1,3,1));
 add('g-foundation','string-crossing','Meet two strings','Move between the first and second strings without brushing others.','Alternate gentle down and up picks. Classical players can alternate i and m.',[position(hi,0),position(hi-1,0),position(hi,1),position(hi-1,1)]);
 add('g-foundation','finger-walk','One finger at a time','Coordinate four fretting fingers in a small position.','Index 1, middle 2, ring 3, little 4. Place close to each fret; release excess pressure.',pos(hi,1,2,3,4));
 add('g-foundation','low-string','Hear the low strings','Learn how low and high string sounds differ.','Pick softly. Keep unused strings quiet with light contact from either hand.',[position(0,0),position(1,0),position(2,0),position(3,0)]);
 add('g-pulse','quarter-pulse','Two bars of steady pulse','Place quarter notes on the beat, and count every rest.','Count 1 2 3 4 twice. Keep your picking motion small.',pos(hi,0,1,3,1));
 add('g-pulse','long-short','Long notes, short notes','Keep the count going as notes ring or pause.','A half note lasts two beats. Do not rush the silence.',high,'sustain');
 add('g-pulse','alternate-pick','Down, up, together','Coordinate alternate picking with short note pairs.','Down-up for each eighth-note pair. On classical use i-m.',pos(hi,0,1,3,1),'eighth');
 add('g-pulse','call-answer','Call and response','Hear a little question, then play an answer.','Sing the note shape first; hear where the phrase breathes.',high);
 // Open shapes are standard-tuning lessons; non-standard tuning receives pitch-position drills instead.
 for(const [key,title,shapes] of [['em-am','Em to Am',['Em','Am']],['c-g','C to G',['C','G']],['d-a','D to A',['D','A']],['song-chords','A song-shaped progression',['C','G','Am','G']]]){
 const chords=shapes.map(label=>({pos:CHORDS[label].flatMap((f,s)=>f===null?[]:[{s,f}]),beats:1,label}));
 add('g-chords',key,title,tuning==='standard'?'Form each shape, check each string, then connect the chords.':'Explore these fretted shapes in your selected tuning; their chord names change.','Mute strings marked X in standard chord diagrams. Strum lightly. Check single strings in arpeggio mode.',chords,'sustain',{chords:true,shapes,tuningSpecific:true});
 }
 add('g-phrases','minor-pent','Minor pentatonic phrase','Play a short minor phrase with a clear ending.','Use first-string frets 5 and 8 and second-string frets 5 and 8. Listen for A as home.',[position(hi,5),position(hi,8),position(hi-1,8),position(hi-1,5)]);
 add('g-phrases','major-phrase','Major colour','Make a bright phrase from chord and scale tones.','Use first string frets 0, 2, 4 and 7. End deliberately; do not fill every gap.',pos(hi,0,2,4,7));
 add('g-phrases','skip-strings','Cross-string control','Cross strings while keeping unused strings quiet.','Keep the pick near the strings. Classical players alternate i and m without pulling outward.',[position(hi,0),position(hi-2,2),position(hi-1,0),position(hi-3,2)]);
 add('g-phrases','phrase-eighth','Eighth-note vocabulary','Fit short runs into a two-bar phrase.','Count 1 and 2 and 3 and 4 and. Start slowly before increasing tempo.',high,'eighth');
 add('g-control','hammer-pull','Hammer-on and pull-off preparation','Connect neighbouring notes with a clear fretting-hand action.','Try pick-hammer on rising pairs and pick-pull on falling pairs. The detector checks pitch, not the articulation.',pos(hi,5,7,8,7));
 add('g-control','position-shift','A small position shift','Travel cleanly between two nearby positions.','Release pressure, slide the hand, then fret. Keep the thumb free to move.',pos(hi,3,5,7,5));
 add('g-control','triad-arpeggio','Triad arpeggio','Hear a chord as separate notes.','These E-minor chord tones are E, G and B in standard tuning. Let each note speak.',[position(2,2),position(3,0),position(4,0),position(hi,0)]);
 add('g-control','chord-recall','Chord-shape recall','Recall familiar shapes and keep changes relaxed.','Form Em, G, Am and C slowly before playing; self-review full strums.',['Em','G','Am','C'].map(label=>({pos:CHORDS[label].flatMap((f,s)=>f===null?[]:[{s,f}]),beats:1,label})),'sustain',{chords:true,shapes:['Em','G','Am','C'],tuningSpecific:true});
 add('g-music','root-third','Hear root and third','Use chord tones to give phrases a clear harmonic identity.','Hear the root E and its major third G sharp in standard tuning.',[position(2,2),position(3,1),position(4,0),position(hi,0)]);
 add('g-music','blues-colour','A touch of blues','Add a passing colour without losing the pulse.','Use the passing note briefly. Listen for tension and release.',pos(hi,5,8,9,8),'eighth');
 add('g-music','fingerstyle','Fingerstyle conversation','Alternate bass and melody in a little two-bar pattern.','Use p for low notes and i or m for melody. Keep the hand naturally curved.',[position(0,0),position(hi,0),position(1,2),position(hi-1,0)]);
 add('g-music','performance','Your two-bar performance','Finish a phrase, then use its vocabulary in the song lab.','After the five exercises, improvise over the minor vamp. Leave space and answer your own phrases.',[position(hi,5),position(hi-1,8),position(hi-1,5),position(hi,8)],'eighth');
 }else{
 add('b-foundation','first-string','Your first bass note','Move from a single low note to a small neighbouring phrase.','Pluck with index and middle alternately. Use a small hand shift rather than stretching.',low);
 add('b-foundation','muting','Quiet unused strings','Keep notes clear by muting strings you are not playing.','Let a plucking finger land gently on the adjacent lower string. Light fretting-hand contact helps.',[position(E,0),position(A,0),position(E,2),position(A,2)]);
 add('b-foundation','finger-walk','Relaxed fretting','Coordinate fingers and a small shift without squeezing.','On lower bass frets use a comfortable 1-2-4 approach or small shifts; do not force one-finger-per-fret.',pos(E,1,2,3,4));
 add('b-foundation','string-crossing','Across the strings','Find E, A, D and G strings and move cleanly between them.','Alternate index and middle; keep a gentle, even attack.',[position(E,0),position(A,0),position(D,0),position(G,0)]);
 add('b-pulse','quarter-pulse','The steady pocket','Play roots on the beat and keep counting through rests.','The space matters as much as the note. Listen to the click, then land gently.',low);
 add('b-pulse','root-fifth','Root and fifth','Build a foundational bass pattern that supports a chord.','In standard tuning open E and A-string fret 2 give E and B. Keep both notes balanced.',fifths);
 add('b-pulse','long-short','Hold, release, rest','Control when a bass note starts and stops.','Use light touch to stop a note cleanly. The microphone checks pitch, not note length.',low,'sustain');
 add('b-pulse','eighth-groove','Eighth-note groove','Coordinate alternating fingers with short rhythmic pairs.','Count the ands. Stay relaxed and even; speed comes later.',low,'eighth');
 add('b-music','minor-line','Minor groove','Build a line using a root, minor third and nearby tones.','Hear E as home in standard tuning; finish the line with intention.',minor);
 add('b-music','major-line','Major groove','Hear the brighter sound of a major third.','Compare fret 3 and fret 4 on E string. Listen before naming the difference.',major);
 add('b-music','octave','Octave conversation','Answer a low note with its octave.','In standard tuning E-string open and D-string fret 2 are octaves. Mute between jumps.',[position(E,0),position(D,2),position(E,3),position(D,5)]);
 add('b-music','song-roots','Roots that support a song','Link familiar roots into a two-bar bass line.','Find E, A, C and D in standard tuning. Keep the beginning of each bar clear.',[position(E,0),position(A,0),position(A,3),position(A,5)]);
 add('b-control','major-scale','Major-scale fragments','Build scale vocabulary in manageable phrases.','Use frets 0, 2, 4 and 5 on E string. Shift comfortably instead of stretching.',major);
 add('b-control','pentatonic','Minor pentatonic language','Use a few strong notes and deliberate space.','These E-minor pentatonic positions fit over the minor jam track in standard tuning.',[position(E,0),position(E,3),position(A,0),position(A,2)]);
 add('b-control','arpeggio','Chord-tone arpeggios','Outline a chord with root, third and fifth.','Use E, G sharp, B and the octave E. Target notes deliberately.',[position(E,0),position(E,4),position(A,2),position(D,2)]);
 add('b-control','shift','Shift with control','Move between positions while keeping a steady sound.','Release fretting pressure before moving. Let the thumb travel with the hand.',pos(E,3,5,7,5));
 add('b-groove','syncopation','Offbeat pocket','Place notes on the ands without speeding up.','Count continuously; use the metronome before playing with drums.',low,'eighth');
 add('b-groove','funk','A little funk','Combine short attacks and space into a tight line.','Use light plucks and intentional muting. Ghost notes are an optional ungraded jam technique.',[position(E,0),position(D,2),position(A,2),position(E,3)],'eighth');
 add('b-groove','walking','Walking towards the chord','Connect chord tones with stepwise movement.','Aim for the next root. Keep a consistent quarter-note pulse.',[position(E,0),position(E,2),position(E,4),position(A,0)]);
 add('b-groove','fills','A fill that returns home','Add a short phrase without losing the downbeat.','Leave space first. Resolve confidently back to the root.',[position(A,2),position(A,3),position(A,5),position(E,0)],'eighth');
 add('b-performance','chord-target','Target the harmony','Make roots, thirds and fifths easy to hear.','Practise E, G sharp, B and A in standard tuning; listen for the colour of each chord tone.',[position(E,0),position(E,4),position(A,2),position(A,0)]);
 add('b-performance','articulation','Articulation preparation','Use a phrase to practise slides or hammer-ons.','Choose a comfortable articulation for each pair. Pitch matching does not grade the technique.',pos(A,2,4,5,4));
 add('b-performance','extended-range',notes.length>4?'Explore your extended range':'Explore the neck','Build confidence in a new part of your instrument.',notes.length>4?'Start with the low B string. Mute it when moving to E. Low notes may need a better microphone.':'Explore higher frets on E without forcing a stretch.',pos(0,notes.length>4?0:5,notes.length>4?2:7,notes.length>4?3:8,notes.length>4?5:10));
 add('b-performance','performance','Your bass performance','Finish your phrases, then supply the bass line in song lab.','Mute backing bass. Keep the groove simple and leave room for the song.',[position(E,0),position(A,2),position(D,2),position(E,3)],'eighth');
 }

 // Musical studies: five distinct two-bar phrases, with space and subdivision.
 const root=position(E,0),fifth=position(A,2),octave=position(D,2),third=position(E,3),walk=[root,position(E,2),position(E,4),position(A,0)];
 const melodic=[position(hi,5),position(hi-1,8),position(hi-1,5),position(hi,8)];
 const studies=bass?[
 ['b-pulse','reggae-roots','Reggae: leave the downbeat','Enter after the beat and leave space for the song.',[root,fifth,octave,third],'reggae'],
 ['b-pulse','pop-octaves','Pop: roots and octaves','Connect low roots and upper answers across strings.',[root,octave,position(A,0),position(G,2)],'pop'],
 ['b-music','latin-anticipation','Latin: anticipate the next bar','Place an early approach note before a strong arrival.',[root,fifth,position(A,0),position(D,2)],'latin'],
 ['b-music','soul-answer','Soul: call and answer','Answer a root with a short melodic response.',[root,third,fifth,octave],'soul'],
 ['b-pulse','disco-octaves','Disco: octave engine','Keep eighth notes even while jumping an octave.',[root,octave,position(E,3),position(D,5)],'disco'],
 ['b-music','blues-turnaround','Blues: the turnaround','Lead back to the root with a compact cross-string fill.',[root,position(A,2),position(A,3),position(A,5)],'blues'],
 ['b-groove','afrobeat-pocket','Afrobeat: interlocking pocket','Use short syncopated notes with deliberate rests.',[root,fifth,octave,third],'afrobeat'],
 ['b-groove','sixteenth-funk','Funk: sixteenth-note cells','Read 1 e and a and keep short notes controlled.',[root,octave,fifth,third],'funk'],
 ['b-groove','walking-changes','Walking: chord approaches','Aim each approach note towards the next root.',walk,'walking'],
 ['b-performance','rnb-space','R&B: melody and space','Let a sustained tone contrast with a short answer.',[root,third,fifth,octave],'soul'],
 ['b-performance','latin-fill','Latin: fill and return','Add a fill without disturbing the next downbeat.',[root,position(A,2),position(D,2),position(G,0)],'latin'],
 ['b-performance','afrobeat-performance','Afrobeat: performance study','Build a repeatable two-bar line, then vary one note.',[root,fifth,position(A,0),octave],'afrobeat']
 ]:[
 ['g-pulse','reggae-chops','Reggae: offbeat chord chops','Strum short offbeat chords and mute gently.',['Am','G','C','G'],'reggae'],
 ['g-chords','pop-strum','Pop: rhythmic chord changes','Change chord shapes without losing the eighth-note pulse.',['C','G','Am','G'],'pop'],
 ['g-pulse','soul-dyads','Soul: two-note conversation','Balance a pair of notes and a short answering phrase.',[{pos:[{s:hi-1,f:1},{s:hi,f:0}],beats:1},{pos:[{s:hi-1,f:0},{s:hi,f:3}],beats:1},position(hi-1,1),position(hi,0)],'soul'],
 ['g-chords','blues-strum','Blues: two-bar chord rhythm','Build a steady rhythm with E and A shapes.',['E','A','E','A'],'blues'],
 ['g-pulse','cross-string-riff','A cross-string riff','Make a melody from several strings, not one repeated note.',[position(2,2),position(3,0),position(4,0),position(hi,0)],'pop'],
 ['g-chords','fingerstyle-foundation','Fingerstyle: bass and melody','Alternate a bass root and an upper melody.',[position(0,0),position(hi,0),position(1,2),position(hi-1,0)],'soul'],
 ['g-music','afrobeat-chops','Afrobeat: rhythmic chord cells','Keep short chords light and leave room for other parts.',['Am','G','Am','C'],'afrobeat'],
 ['g-phrases','sixteenth-lick','Funk: a sixteenth-note lick','Play brief cross-string runs and stop cleanly.',melodic,'funk'],
 ['g-control','latin-arpeggio','Latin: arpeggio anticipation','Anticipate a beat with a controlled arpeggio.',[position(2,2),position(3,1),position(4,0),position(hi,0)],'latin'],
 ['g-music','soul-chord-response','Soul: chord and response','Vary sustained chord shapes with short rhythmic answers.',['Am','C','G','Em'],'soul'],
 ['g-phrases','blues-cross-string','Blues: cross-string vocabulary','Connect a compact lick across the top strings.',melodic,'blues'],
 ['g-music','reggae-performance','Reggae: two-bar performance','Keep the offbeats even through chord changes.',['Am','G','C','Em'],'reggae']
 ];
 for(const [module,id,title,goal,positions,feel] of studies){const chordStudy=typeof positions[0]==='string',pool=chordStudy?positions.map(label=>({pos:CHORDS[label].flatMap((f,s)=>f===null?[]:[{s,f}]),beats:1,label})):positions;add(module,id,title,goal,'Count every subdivision, start slowly, and use the fretboard and moving phrase cues. '+(chordStudy?'Use strum self-review or arpeggio pitch checking.':'Mute unused strings and finish the phrase before adding speed.'),pool,'eighth',{groove:feel,chords:chordStudy,shapes:chordStudy?positions:undefined});const lesson=lessons.at(-1);lesson.phrases=musicalVariations(pool,feel,lesson.level==='intermediate');}
 // Preserve original lesson IDs and saved progress; enrich repetitive patterns.
 for(const lesson of lessons){lesson.groove ||= lesson.id.includes('funk')?'funk':lesson.id.includes('blues')?'blues':lesson.id.includes('minor')||lesson.id.includes('pent')?'minor':lesson.chords?'pop':'soul';
 if(!lesson.chords&&!['first-string','finger-walk'].includes(lesson.id)){
 const pool=[];for(const phrase of lesson.phrases)for(const e of phrase)if(e.pos.length&&!pool.some(p=>JSON.stringify(p.pos)===JSON.stringify(e.pos)))pool.push({...e,beats:1});
 if(pool.length>=3&&!studies.some(st=>st[1]===lesson.id))lesson.phrases=musicalVariations(pool,lesson.groove,lesson.level==='intermediate');
 // Alternate equivalent pitches onto adjacent strings, where comfortable.
 if(lesson.level==='intermediate')lesson.phrases.forEach((phrase,pi)=>phrase.forEach((e,ei)=>{if(e.pos.length!==1||(pi+ei)%2===0)return;const pos=e.pos[0],pitch=notes[pos.s]+pos.f;for(const target of [pos.s-1,pos.s+1]){const fret=pitch-notes[target];if(target>=0&&target<notes.length&&fret>=0&&fret<=12){e.pos=[{s:target,f:fret}];break}}}));
 }
 lesson.exerciseNames=['Find the phrase','Add the answer','Change the rhythm','Recall across strings','Perform both bars'];lesson.challenge='Play three clean loops, hide the note names, then create your own two-bar answer in Groove Lab.';
 }
 // Arpeggio exercises allow single-pitch checking; each strum lesson still has five two-bar tasks.
 for(const lesson of lessons)if(lesson.chords){lesson.strumPhrases=cloneEvents(lesson.phrases[0]);lesson.arpeggioPhrases=lesson.phrases.map(phrase=>fitBars(phrase.flatMap(e=>e.pos.length?e.pos.slice(0,4).map(p=>({pos:[p],beats:e.beats/Math.min(4,e.pos.length)})):[e])));if(tuning!=='standard'){lesson.phrases.forEach(p=>p.forEach(e=>delete e.label));lesson.arpeggioPhrases.forEach(p=>p.forEach(e=>delete e.label));lesson.tip+=' Chord names apply only in standard tuning; read the actual notes in this tuning.'}}
 return lessons;
}
if(typeof module!=='undefined')module.exports={INSTRUMENTS,MODULES,REFERENCES,CHORDS,pitchName,tuningFor,position,rest,fitBars,patternVariations,curriculum};
