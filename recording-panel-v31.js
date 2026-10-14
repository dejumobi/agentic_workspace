// SAXWORX CLOSABLE RECORDING PANEL V31
(function(){
let closed=false;const open=document.createElement('button');open.type='button';open.textContent='Open recording panel';open.className='secondary';open.hidden=true;
const close=document.createElement('button');close.type='button';close.textContent='Close recording panel ×';close.className='secondary';panel.prepend(close);
function attach(){if(!panel.isConnected)return;panel.hidden=closed;if(panel.nextSibling!==open)panel.after(open);open.hidden=!closed;const text=studioRecorder?'Recording continues · Open controls':'Open recording panel';if(open.textContent!==text)open.textContent=text}
close.onclick=()=>{closed=true;panel.querySelector('#studioPlayback')?.pause();attach();open.focus()};open.onclick=()=>{closed=false;attach();close.focus()};
const priorRender=render;render=function(){const value=priorRender.apply(this,arguments);attach();return value};const priorGroove=groovePage;groovePage=function(){const value=priorGroove.apply(this,arguments);attach();return value};
new MutationObserver(attach).observe(document.getElementById('page'),{childList:true,subtree:true});attach();
})();
