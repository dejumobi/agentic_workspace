class CalibrationCapture extends AudioWorkletProcessor {
 constructor(){super();this.port.onmessage=e=>{if(e.data==='stop'){this.port.postMessage({done:true});this.stopped=true}}}
 process(inputs,outputs){for(const c of outputs[0]||[])c.fill(0);if(!this.stopped){const a=inputs[0]?.[0];if(a){const copy=a.slice();this.port.postMessage({frame:currentFrame,pcm:copy.buffer},[copy.buffer])}}return true}
}registerProcessor('saxworx-calibration',CalibrationCapture);
