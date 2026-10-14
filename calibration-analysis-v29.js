function estimate(pcm,ref,rate,starts){
 const delays=[],scores=[];const stride=4;
 for(const start of starts){let best=-1,lag=0;for(let ms=0;ms<=400;ms++){const offset=Math.round(ms*rate/1000);let dot=0,a=0,b=0;for(let j=0;j<ref.length;j+=stride){const x=ref[j],y=pcm[start+offset+j]||0;dot+=x*y;a+=x*x;b+=y*y}const score=Math.abs(dot)/Math.sqrt(a*b||1);if(score>best){best=score;lag=ms}}delays.push(lag);scores.push(best)}
 const sorted=delays.slice().sort((a,b)=>a-b),delay=sorted[1];return {delay,delays,scores,reliable:scores.every(s=>s>.35)&&Math.max(...delays)-Math.min(...delays)<=15&&delay>0&&delay<400};
}self.onmessage=e=>{const d=e.data;self.postMessage(estimate(new Float32Array(d.pcm),new Float32Array(d.ref),d.rate,d.starts))};
