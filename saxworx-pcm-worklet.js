// SAXWORX SEPARATE CAPTURE V26
class SaxWorxPcmRecorder extends AudioWorkletProcessor {
 constructor(){super();this.recording=true;this.frames=0;this.used=0;this.clips=0;this.mix=new Int16Array(8192);this.mic=new Int16Array(4096);this.band=new Int16Array(8192);this.port.onmessage=e=>{if(e.data==='stop'){this.recording=false;this.flush();this.port.postMessage({done:true,frames:this.frames,rate:sampleRate,clips:this.clips})}}}
 pcm(v){v=Math.max(-1,Math.min(1,v||0));return Math.round(v<0?v*32768:v*32767)}
 flush(){if(!this.used)return;const pcm=this.mix.slice(0,this.used*2).buffer,mic=this.mic.slice(0,this.used).buffer,groove=this.band.slice(0,this.used*2).buffer;this.port.postMessage({pcm,mic,groove},[pcm,mic,groove]);this.used=0}
 process(inputs,outputs){for(const c of outputs[0]||[])c.fill(0);if(!this.recording)return true;const m=inputs[0]||[],b=inputs[1]||[],n=outputs[0]?.[0]?.length||128;for(let i=0;i<n;i++){const sax=(m[0]?.[i]||0)*.65,left=(b[0]?.[i]||0)*.65,right=(b[1]?.[i]??b[0]?.[i]??0)*.65,j=this.used*2;const l=sax+left,rr=sax+right;if(Math.abs(l)>1||Math.abs(rr)>1)this.clips++;this.mix[j]=this.pcm(l);this.mix[j+1]=this.pcm(rr);this.mic[this.used]=this.pcm(sax);this.band[j]=this.pcm(left);this.band[j+1]=this.pcm(right);this.used++;this.frames++;if(this.used===4096)this.flush()}return true}
}
registerProcessor('saxworx-pcm-recorder',SaxWorxPcmRecorder);
