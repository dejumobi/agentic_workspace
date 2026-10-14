/* V64: welcome narration on SaxWorx entry, with first-interaction autoplay recovery. */
(()=>{'use strict';
let welcomePlayed=false, attemptInProgress=false, player=null;
const filename='voices/dara-welcome.mp3';
function isBusy(){return Boolean(document.hidden||document.querySelector('audio:not([paused])'));}
function startWelcome(){
 if(welcomePlayed||attemptInProgress||document.hidden)return;
 attemptInProgress=true;
 const a=new Audio(filename);a.preload='auto';a.volume=Math.max(0,Math.min(1,Number(window.voicePrefs?.volume??1)));
 a.addEventListener('ended',()=>{if(player===a)player=null},{once:true});
 a.addEventListener('error',()=>{attemptInProgress=false;if(player===a)player=null},{once:true});
 const p=a.play();
 if(p&&typeof p.then==='function')p.then(()=>{welcomePlayed=true;attemptInProgress=false;player=a;removeRecovery()}).catch(()=>{attemptInProgress=false;a.pause()});
 else{welcomePlayed=true;attemptInProgress=false;player=a;removeRecovery()}
}
function recover(e){if(e.target?.closest?.('#dara-stop,[id*="stop"],button[onclick*="stop"]'))return;startWelcome()}
function removeRecovery(){document.removeEventListener('pointerdown',recover,true);document.removeEventListener('keydown',recover,true)}
function cancel(){if(player){player.pause();player.currentTime=0;player=null}removeRecovery()}
window.MofeDaraWelcomeStop=cancel;
// Attempt automatically; if autoplay is disallowed, retry at the first user gesture.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startWelcome,{once:true});else startWelcome();
document.addEventListener('pointerdown',recover,true);
document.addEventListener('keydown',recover,true);
// Navigation cancels the welcome without replaying it.
document.addEventListener('click',e=>{if(!welcomePlayed)return;const b=e.target.closest('button,a');if(!b)return;if(b.closest('#dara-guide'))return;const s=(b.getAttribute('onclick')||'')+' '+(b.textContent||'');if(/\b(go|openLesson|nextLesson|previousLesson|prevLesson|lessonPage)\s*\(|\b(stop|start|listen|practice|groove|lesson)\b/i.test(s))cancel()},true);
window.addEventListener('pagehide',cancel);
})();
