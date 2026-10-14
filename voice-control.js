/* Practice takes priority over recorded coaching, including asynchronous loading. */
let tutorActivityLoading=0;
function tutorPracticeBusy(){return tutorActivityLoading>0||tutorClassroomBusy()||Boolean(run||listening||engine||tutorPlayback||longToneTimer||sparseTimer||saxLoading||saxVoices.size||!trackAudio.paused)}
const uninterruptedPromptPlayer=playRecordedPrompts;
playRecordedPrompts=function(ids,manual=false){if(tutorPracticeBusy()){stopTutorVoice();if(manual)voiceNotice('Pause or stop the exercise before playing spoken feedback.');return}return uninterruptedPromptPlayer(ids,manual)};
const tutorPriorityActions=['startPractice','startListening','startLongTone','startSparse','toggleEngine','playTutorEvents','playExpressionDemo','newEar','hearEar','hearEarExample','callPhrase','newAdvancedEar','hearAdvancedEar','hearSaxNote','saxDemo','listenDrill','listenPhrase','sendTutorPractice','loadLessonVideo','loadSongVideo','stopPractice','stopTutorPlayback','stopEngine','stopSparse'];
for(const name of tutorPriorityActions){const original=window[name];if(typeof original!=='function')continue;window[name]=function(...args){stopTutorVoice();tutorActivityLoading++;let result;try{result=original.apply(this,args)}catch(error){tutorActivityLoading--;throw error}if(result&&typeof result.then==='function')return Promise.resolve(result).finally(()=>{tutorActivityLoading--});tutorActivityLoading--;return result}}
trackAudio.addEventListener('play',stopTutorVoice);

function tutorClassroomBusy(){if(typeof studioRecorder!=='undefined'&&(studioPending||studioRecorder?.state==='recording'))return true;if(typeof classroom==='undefined')return false;return Boolean(classroom.recorder&&classroom.recorder.state!=='inactive'||view==='Tutor & student'&&Array.from(document.querySelectorAll('#classroomContent audio,#classroomContent video')).some(el=>!el.paused&&!el.ended))}
