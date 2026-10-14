'use strict';
(()=>{const content=window.MofePlayContent,defaultReference=reference;reference=l=>content.video('guitar',l.id,state.instrument)||defaultReference(l);
 function refreshReference(){if(!current||view!=='studio')return;const r=reference(current);$('refTopic').textContent=r.title;$('refCredit').textContent=r.credit+' · Technique reference. Original exercises by MofePlay.';$('refLink').href=r.url;const frame=$('refPlayer').querySelector('iframe');if(frame){const url='https://www.youtube-nocookie.com/embed/'+r.videoId+'?rel=0&start='+(r.start||0);if(frame.src!==url)frame.src=url;frame.title=r.title;}}
 window.addEventListener('mofeplay-content-ready',refreshReference);
 const defaultSpeak=speak;speak=function(text,recording=null){if(recording&&!/^(lesson-|welcome-|intro-)/.test(recording)&&!['your-turn','task-complete'].includes(recording))return defaultSpeak(text,recording);let kind='lesson',lesson=current?.id;if(recording?.startsWith('welcome-'))kind='welcome';else if(recording?.startsWith('intro-'))kind='intro';else if(['your-turn','task-complete'].includes(recording))kind=recording;const item=recording&&content.voice('guitar',lesson,state.instrument,kind);return item?playVoiceRecording(content.voiceURL(item),text):defaultSpeak(text,recording);};
 welcome=()=>speak('Welcome to GuitarWorx by MofePlay. You selected '+configuration().name+'.','welcome-'+state.instrument);
const requestedLesson=new URLSearchParams(location.search).get('lesson');if(lessons.some(l=>l.id===requestedLesson))openLesson(requestedLesson);
})();
const musicTutorScript=document.createElement('script');
musicTutorScript.src='/music-tutor-stream.js?v=1';
musicTutorScript.dataset.instrument='Guitar';
musicTutorScript.dataset.target='#lessonWatch';
document.body.append(musicTutorScript);
