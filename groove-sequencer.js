// SaxWorx Groove Lab: editable 16/32-step drum and bass sequencer.
(() => {
  let responsiveModule=null;
  const wideLayout=typeof matchMedia==='function'?matchMedia('(min-width: 761px)'):null;
  function updateResponsiveSections(){if(!responsiveModule)return;responsiveModule.querySelectorAll('.swg-fold').forEach(section=>section.open=wideLayout?wideLayout.matches:true)}
  if(wideLayout){if(wideLayout.addEventListener)wideLayout.addEventListener('change',updateResponsiveSections);else wideLayout.addListener?.(updateResponsiveSections)}
  function compactSections(module){responsiveModule=module;
    [['.swg-click-mixer','Click & accent'],['.swg-bass-mixer','Bass mixer'],['.swg-save-row','Save, load & export']].forEach(([selector,title])=>{const content=module.querySelector(selector);if(!content)return;const section=document.createElement('details');section.className='swg-fold';const summary=document.createElement('summary');summary.textContent=title;content.before(section);section.append(summary);const hint=content.nextElementSibling;section.append(content);if(hint?.classList.contains('small'))section.append(hint)});
    updateResponsiveSections();
  }
  const lanes = ['Kick', 'Snare', 'Closed hat', 'Open hat', 'Clap', 'Ride'];
  const intervals = [[-1, 'Off'], [0, 'Root'], [3, 'b3'], [4, '3'], [5, '4'], [7, '5'], [9, '6'], [10, 'b7'], [12, 'Octave']];
  const storageKey = 'saxworx-advanced-groove-v1';
  let stepCount = 16, swing = 0, kit = 'Warm', selectedPreset = 'Custom';
  let bassSteps = Array(32).fill(null), saved = {}, activeName = 'My groove';
  let stepTimer = null, lookAhead = null, engineToken=0, bassTune=0, bassLevel=.85, clickEnabled=false, clickLevel=.35, accentSound="Woodclick";
  const velocity = [0, .36, .68, 1];
  const defaults = () => [
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    Array(16).fill(0), Array(16).fill(0), Array(16).fill(0)
  ];
  const cloneRows = rows => rows.map(row => [...row]);
  function readStore() {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  }
  function patternRows() {
    while (pattern.length < 6) pattern.push(Array(16).fill(0));
    pattern.length = 6;
    pattern = pattern.map(row => Array.from({length: stepCount}, (_, i) => row[i] || 0));
  }
  function resizeSteps(next) {
    const old = stepCount;
    if (old === next) return;
    pattern = pattern.map(row => Array.from({length: next}, (_, i) => next > old ? (row[i % old] || 0) : (row[i] || 0)));
    bassSteps = Array.from({length: next}, (_, i) => next > old ? (bassSteps[i % old] ?? null) : (bassSteps[i] ?? null));
    stepCount = next;
    renderGrid(); persist();
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify({stepCount, swing, kit, selectedPreset, activeName, drums: pattern, bass: bassSteps, bassTune, bassLevel, clickEnabled, clickLevel, accentSound, saved})); } catch {}
  }
  function setGroove(data) {
    if (!data || !Array.isArray(data.drums) || data.drums.length !== 6 || !Array.isArray(data.bass)) throw Error('This file is not a SaxWorx groove pattern.');
    const validBass = new Set(intervals.map(([v]) => v));
    if (data.bass.some(v => v != null && !validBass.has(Number(v)))) throw Error('The pattern contains a bass pitch SaxWorx does not support.');
    const count = Number(data.stepCount) === 32 ? 32 : 16;
    stepCount = 16;
    pattern = cloneRows(data.drums).map(row => Array.from({length: count}, (_, i) => Math.max(0, Math.min(3, Number(row[i]) || 0))));
    bassSteps = Array.from({length: count}, (_, i) => data.bass[i] == null || data.bass[i] === -1 ? null : Number(data.bass[i]));
    stepCount = count; swing = Math.max(0, Math.min(.34, Number(data.swing) || 0));
    kit = ['Warm', 'Bright', 'Electronic'].includes(data.kit) ? data.kit : 'Warm';
    bassTune=Math.max(-12,Math.min(12,Math.round(Number(data.bassTune)||0)));bassLevel=data.bassLevel==null?.85:Math.max(0,Math.min(1,Number(data.bassLevel)||0));clickEnabled=data.clickEnabled===true;clickLevel=data.clickLevel==null?.35:Math.max(0,Math.min(1,Number(data.clickLevel)||0));accentSound=["Woodclick","Bell","Soft tick","Rimshot","Clave","Shaker","Cowbell"].includes(data.accentSound)?data.accentSound:"Woodclick";syncClickControls();syncBassControls();
    selectedPreset = data.preset || 'Custom'; activeName = data.name || 'My groove';
    renderGrid(); persist();
  }
  function preset(name) {
    selectedPreset = name; stepCount = 16; pattern = defaults(); bassSteps = Array(16).fill(null);
    const set = (lane, hits, level=2) => hits.forEach(i => pattern[lane][i] = level);
    if (name === 'Jazz ride') {
      pattern = defaults(); pattern[0] = Array(16).fill(0); pattern[1] = Array(16).fill(0); pattern[2] = Array(16).fill(0); pattern[4] = Array(16).fill(0);
      set(0,[0,8],2); set(1,[4,12],2); set(2,[6,14],1); set(5,[0,2,4,6,8,10,12,14],2);
      [0,4,8,12].forEach((i,j)=>bassSteps[i]=bassline[j]??(j%2?7:0)); swing=.20;
    } else if (name === 'Bossa syncopation') {
      set(0,[0,6,8,14],2); set(1,[4,12],2); set(2,[0,2,4,6,8,10,12,14],1); set(3,[6,14],2); set(5,[2,6,10,14],1);
      [0,4,8,12].forEach((i,j)=>bassSteps[i]=[0,7,0,7][j]); swing=.04;
    } else if (name === 'Funk pocket') {
      set(0,[0,3,7,10],2); set(1,[4,12,14],2); set(2,[0,2,4,6,8,10,12,14],1); set(3,[7,15],2); set(4,[4,12],1);
      [[0,0],[3,0],[6,7],[8,0],[11,10],[14,7]].forEach(([i,n])=>bassSteps[i]=n); swing=.08;
    } else if (name === 'Half-time') {
      set(0,[0,10],2); set(1,[8],3); set(2,[0,2,4,6,8,10,12,14],1); set(3,[14],1); set(5,[4,12],1);
      [[0,0],[8,7]].forEach(([i,n])=>bassSteps[i]=n); swing=0;
    } else if (name === 'Straight rock') {
      set(0,[0,6,8,14],2); set(1,[4,12],3); set(2,[0,2,4,6,8,10,12,14],1); set(3,[14],1); set(4,[4,12],1);
      [0,4,8,12].forEach((i,j)=>bassSteps[i]=[0,7,0,7][j]); swing=0;
    } else {
      pattern = defaults(); [0,4,8,12].forEach((i,j)=>bassSteps[i]=bassline[j]??(j%2?7:0)); swing=0;
    }
    pattern = pattern.map(row => Array.from({length: stepCount}, (_, i) => row[i] || 0));
    renderGrid(); persist();
  }
  function canonicalGenre(value) {
 const text=String(value||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ');
 if(text.includes('afro'))return 'Afrobeat-inspired';
 if(text.includes('neo')||text.includes('r b')||text.includes('rnb'))return 'Neo-soul';
 if(text.includes('funk'))return 'Funk';
 if(text.includes('bossa'))return 'Bossa nova';
 if(text.includes('reggae')||text.includes('one drop'))return 'Reggae one-drop';
 if(text.includes('latin')||text.includes('tumbao'))return 'Latin tumbao';
 if(text.includes('gospel')||text.includes('worship'))return 'Gospel soul';
 if(text.includes('rock')||text.includes('pop'))return 'Rock backbeat';
 if(text.includes('smooth')||text.includes('ballad'))return 'Smooth ballad';
 if(text.includes('metronome')||text==='click')return 'Metronome';
 if(text.includes('blues'))return text.includes('swing')?'Swing blues':'12-bar blues';
 if(text.includes('minor'))return 'Minor ii–V–i';
 if(text.includes('turnaround'))return 'Jazz turnaround';
 if(text.includes('jazz')||text.includes('swing'))return 'Jazz ii–V–I';
 return value;
 }
 function selectedGenreLabel(select=document.getElementById('genre')) {return select?.selectedOptions?.[0]?.textContent||select?.value||genre}
 function syncBassControls(){const level=document.getElementById('swgBassLevel'),tune=document.getElementById('swgBassTune');if(level)level.value=Math.round(bassLevel*100);if(tune)tune.value=bassTune;const pitch=document.getElementById('swgBassTuneOut'),volume=document.getElementById('swgBassLevelOut');if(pitch)pitch.textContent=(bassTune>0?'+':'')+bassTune+' semitones';if(volume)volume.textContent=Math.round(bassLevel*100)+'%'}
 function changeGenre(event){const running=!!engine;stopEngine();genre=event.target.value;applyGenrePattern(selectedGenreLabel(event.target));updateChords(0);persist();if(running)startCustomEngine().catch(error=>{const status=document.getElementById('swgStatus');if(status)status.textContent='Could not restart groove: '+error.message})}
 function applyGenrePattern(name) {
    name=canonicalGenre(name);
    if (name === 'Custom') return;
    const fresh = () => [Array(16).fill(0),Array(16).fill(0),Array(16).fill(0),Array(16).fill(0),Array(16).fill(0),Array(16).fill(0)];
    pattern = fresh(); bassSteps = Array(16).fill(null); stepCount = 16;
    const set = (lane, hits, level=2) => hits.forEach(i => pattern[lane][i] = level);
    const hats = (level=1, hits=[0,2,4,6,8,10,12,14]) => set(2,hits,level);
    const bass = (notes) => notes.forEach(([i,n]) => bassSteps[i] = n);
    switch (name) {
      case 'Jazz ii–V–I': case 'Jazz turnaround': case 'Minor ii–V–i': case 'Swing blues':
        set(0,[0,8]); set(1,[4,12]); hats(2); set(5,[0,2,4,6,8,10,12,14],2);
        bass([[0,0],[4,7],[8,0],[12,7]]); swing=.20; break;
      case 'Funk':
        set(0,[0,3,7,10]); set(1,[4,12,14]); hats(1); set(3,[7,15]); set(4,[4,12],1);
        bass([[0,0],[3,0],[6,7],[8,0],[11,10],[14,7]]); swing=.08; break;
      case 'Neo-soul':
        set(0,[0,7,8,10]);set(1,[4,12],2);hats(1,[0,2,4,6,8,10,12,14]);set(4,[4,12],1);bass([[0,0],[7,7],[8,0],[11,3],[14,7]]);swing=.16;break;
      case 'Bossa nova':
        set(0,[0,6,8,14]); set(1,[4,12]); hats(1); set(3,[6,14]); set(5,[2,6,10,14],1);
        bass([[0,0],[4,7],[8,0],[12,7]]); swing=.04; break;
      case '12-bar blues':
        set(0,[0,8]); set(1,[4,12]); hats(1,[0,3,4,7,8,11,12,15]); set(5,[0,4,8,12],1);
        bass([[0,0],[4,4],[8,7],[12,9]]); swing=.20; break;
      case 'Gospel soul':
        set(0,[0,6,8,14]); set(1,[4,12]); hats(1); set(3,[6,14],1); set(4,[4,12]); set(5,[2,6,10,14],1);
        bass([[0,0],[4,7],[8,0],[12,5]]); swing=.12; break;
      case 'Reggae one-drop':
        set(0,[8]); set(1,[8]); hats(1,[2,6,10,14]); set(4,[4,12],1);
        bass([[0,0],[6,7],[8,0],[14,7]]); swing=0; break;
      case 'Latin tumbao':
        set(0,[0,6,10]); hats(1,[0,2,4,6,8,10,12,14]); set(4,[2,8,12],1); set(5,[2,6,10,14],1);
        bass([[0,0],[3,7],[6,0],[10,7],[12,0]]); swing=0; break;
      case 'Rock backbeat':
        set(0,[0,8]); set(1,[4,12],3); hats(1); set(3,[14],1); set(4,[4,12],1);
        bass([[0,0],[4,7],[8,0],[12,7]]); swing=0; break;
      case 'Afrobeat-inspired':
        set(0,[0,5,8,11]); set(1,[4,12]); hats(1); set(3,[7,15],1); set(4,[2,10],1); set(5,[0,3,6,8,11,14],1);
        bass([[0,0],[3,7],[6,0],[8,5],[11,7],[14,0]]); swing=.06; break;
      case 'Smooth ballad':
        set(0,[0,8],1); set(1,[4,12],1); hats(1,[0,4,8,12]); set(5,[0,4,8,12],1);
        bass([[0,0],[8,7]]); swing=0; break;
      case 'Metronome':
        swing=0; break;
      default:
        if (name.includes('Bossa')) { set(0,[0,6,8,14]); set(1,[4,12]); hats(1); set(3,[6,14]); bass([[0,0],[4,7],[8,0],[12,7]]); swing=.04; }
        else { set(0,[0,8]); set(1,[4,12]); hats(1); bass([[0,0],[4,7],[8,0],[12,7]]); swing=0; }
    }
    selectedPreset='Custom'; renderGrid();
    const presetSelect=document.getElementById('swgPreset'); if(presetSelect)presetSelect.value='Custom';
    const lengthSelect=document.getElementById('swgLength'); if(lengthSelect)lengthSelect.value='16';
    const swingInput=document.getElementById('swgSwing'); if(swingInput)swingInput.value=Math.round(swing*100);
    const swingOutput=document.getElementById('swgSwingOut'); if(swingOutput)swingOutput.textContent=Math.round(swing*100)+'%';
    const status=document.getElementById('swgStatus'); if(status)status.textContent=name+' beat and bass pattern loaded. Edit any step to make it yours.';
    persist();
  }
  function stepButton(lane, i, value) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'swg-step v' + value;
    if (i % 4 === 0) b.classList.add('bar-start');
    b.dataset.lane = lane; b.dataset.step = i; b.setAttribute('aria-pressed', String(value > 0));
    b.setAttribute('aria-label', `${lanes[lane]} step ${i+1}: ${['off','soft','medium','accent'][value]}`);
    b.title = `${lanes[lane]} · step ${i+1} · ${['off','soft','medium','accent'][value]}`;
    return b;
  }
  function renderGrid() {
    const host = document.getElementById('swgGrid'); if (!host) return;
    host.style.setProperty('--swg-steps', stepCount);
    host.replaceChildren();
    const stepHeading=document.createElement('div');stepHeading.className='swg-lane-label';stepHeading.textContent='Step';host.append(stepHeading);
    for(let i=0;i<stepCount;i++){const n=document.createElement('span');n.className='swg-step-number'+(i%4===0?' bar-start':'');n.textContent=i%4===0?String(Math.floor(i/4)%4+1)+(i>=16?' ·2':''):'';host.append(n)}
    for (let lane=0; lane<6; lane++) {
      const label = document.createElement('div'); label.className = 'swg-lane-label'; label.textContent = lanes[lane]; host.append(label);
      for (let i=0; i<stepCount; i++) host.append(stepButton(lane, i, pattern[lane][i] || 0));
    }
    const bassLabel = document.createElement('div'); bassLabel.className = 'swg-lane-label bass-label'; bassLabel.textContent = 'Bass · pitch'; host.append(bassLabel);
    for (let i=0; i<stepCount; i++) {
      const cell = document.createElement('select'); cell.className = 'swg-bass-step'; cell.dataset.bassStep = i; cell.setAttribute('aria-label', `Bass step ${i+1} pitch`);
      intervals.forEach(([v,label]) => { const o=document.createElement('option'); o.value=v; o.textContent=label; cell.append(o); });
      cell.value = bassSteps[i] == null ? '-1' : String(bassSteps[i]);
      if (i % 4 === 0) cell.classList.add('bar-start');
      host.append(cell);
    }
    host.querySelectorAll('.swg-step').forEach(b=>b.onclick=()=>{
      const lane=+b.dataset.lane, i=+b.dataset.step; pattern[lane][i]=(pattern[lane][i]+1)%4;selectedPreset='Custom';const presetSelect=document.getElementById('swgPreset');if(presetSelect)presetSelect.value='Custom';
      const v=pattern[lane][i];b.className='swg-step v'+v;if(i%4===0)b.classList.add('bar-start');b.setAttribute('aria-pressed',String(v>0));b.setAttribute('aria-label',`${lanes[lane]} step ${i+1}: ${['off','soft','medium','accent'][v]}`);b.title=`${lanes[lane]} · step ${i+1} · ${['off','soft','medium','accent'][v]}`;persist();
    });
    host.querySelectorAll('.swg-bass-step').forEach(s=>s.onchange=()=>{bassSteps[+s.dataset.bassStep]=+s.value<0?null:+s.value;selectedPreset='Custom';const presetSelect=document.getElementById('swgPreset');if(presetSelect)presetSelect.value='Custom';persist()});
    setTimeout(()=>syncStep(),0);
  }
  function syncStep(index=-1) {
    document.querySelectorAll('.swg-step.playing,.swg-bass-step.playing').forEach(x=>x.classList.remove('playing'));
    if (index<0) return;
    document.querySelectorAll(`[data-step="${index}"], [data-bass-step="${index}"]`).forEach(x=>x.classList.add('playing'));
  }
  function download(name, text, type) {
    const a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
  }
  function currentData(name=activeName) { return {app:'SaxWorx Groove Lab',version:1,name,stepCount,swing,kit,preset:selectedPreset,drums:cloneRows(pattern),bass:bassSteps.slice(0,stepCount),bassTune,bassLevel,clickEnabled,clickLevel,accentSound}; }
  function renderSavedSelect(select) {
    const keep=select.value; select.replaceChildren(); const blank=document.createElement('option');blank.value='';blank.textContent='Choose saved pattern';select.append(blank);
    Object.keys(saved).sort().forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;select.append(o)});if(Object.keys(saved).includes(keep))select.value=keep;
  }
  function renderUI() {
    const old=document.querySelector('#page .sequencer'); if(!old) return;
    const card=old.closest('.card');card.classList.add('swg-studio-card'); old.remove();
    const bassRow=Array.from(card.querySelectorAll('.row')).find(r=>r.textContent.includes('Bass steps (concert-root intervals)')); if(bassRow) bassRow.hidden=true;
    const heading=card.querySelector('h2'); if(heading) heading.textContent='Advanced beat + bass sequencer';
    const badge=card.querySelector('.pill'); if(badge) badge.textContent='16/32 steps · synced to groove';
    const module=document.createElement('div'); module.className='swg-module';
    module.innerHTML=`<div class="swg-toolbar"><label>Pattern <select id="swgPreset"><option>Custom</option><option>Jazz ride</option><option>Bossa syncopation</option><option>Funk pocket</option><option>Half-time</option><option>Straight rock</option></select></label><label>Length <select id="swgLength"><option value="16">1 bar · 16 steps</option><option value="32">2 bars · 32 steps</option></select></label><label>Synth kit <select id="swgKit"><option>Warm</option><option>Bright</option><option>Electronic</option></select></label><label class="swg-swing">Swing <output id="swgSwingOut">0%</output><input id="swgSwing" type="range" min="0" max="34" value="0" aria-label="Swing amount"></label></div><div class="swg-toolbar swg-click-mixer"><label>Metronome click <input id="swgClickEnabled" type="checkbox" aria-label="Enable metronome click"></label><label>Accent sound <select id="swgAccent"><option>Woodclick</option><option>Bell</option><option>Soft tick</option><option>Rimshot</option><option>Clave</option><option>Shaker</option><option>Cowbell</option></select></label><label>Click level <output id="swgClickLevelOut">35%</output><input id="swgClickLevel" type="range" min="0" max="100" value="35" aria-label="Metronome volume"></label><button type="button" id="swgClickPreview">Preview accent</button></div><p class="small">Click starts off. Accent choice changes only the metronome sound. Preview plays one hit.</p><div class="swg-toolbar swg-bass-mixer"><label>Bass level <output id="swgBassLevelOut">85%</output><input id="swgBassLevel" type="range" min="0" max="100" value="85" aria-label="Bass volume"></label><label>Bass tuning <output id="swgBassTuneOut">0 semitones</output><input id="swgBassTune" type="range" min="-12" max="12" step="1" value="0" aria-label="Bass tuning in semitones"></label><button id="swgBassDown" type="button">Tune down</button><button id="swgBassUp" type="button">Tune up</button><button id="swgBassReset" type="button">Reset tuning</button></div><p class="small">Level blends the bass into the groove. Tuning moves bass only by semitones; 0 keeps it in the selected song key.</p><p class="swg-mobile-hint">Swipe across the steps. Tap a drum to change its strength; tap a bass step to choose its pitch.</p><div class="swg-grid-wrap" tabindex="0" role="region" aria-label="Scrollable drum and bass sequencer"><div class="swg-grid" id="swgGrid"></div></div><div class="swg-toolbar swg-save-row"><label>Pattern name <input id="swgName" maxlength="32" value="My groove"></label><button type="button" id="swgSave" class="primary">Save pattern</button><label>Saved patterns <select id="swgSaved"></select></label><button type="button" id="swgLoad">Load</button><button type="button" id="swgDelete">Delete</button><button type="button" id="swgExport">Download pattern</button><button type="button" id="swgImport">Import pattern</button><input id="swgFile" type="file" accept="application/json,.json" hidden></div><p id="swgStatus" class="small" role="status">Tap a drum step to cycle off, soft, medium and accent. Choose a bass note on any step. Use Record sax + groove below to capture an audio take.</p>`;
    const seqHead=card.querySelector('.row.between'); seqHead?.after(module);
    compactSections(module);
    const status=module.querySelector('#swgStatus');
    const presetSelect=module.querySelector('#swgPreset'); presetSelect.value=selectedPreset;
    module.querySelector('#swgLength').value=String(stepCount);module.querySelector('#swgKit').value=kit;module.querySelector('#swgSwing').value=Math.round(swing*100);module.querySelector('#swgSwingOut').textContent=Math.round(swing*100)+'%';module.querySelector('#swgName').value=activeName;
    renderSavedSelect(module.querySelector('#swgSaved')); renderGrid();
    presetSelect.onchange=()=>{if(presetSelect.value==='Custom'){selectedPreset='Custom';persist();status.textContent='Custom pattern selected. Your current steps are unchanged.';return}preset(presetSelect.value);module.querySelector('#swgLength').value=String(stepCount);module.querySelector('#swgSwing').value=Math.round(swing*100);module.querySelector('#swgSwingOut').textContent=Math.round(swing*100)+'%';status.textContent=presetSelect.value+' pattern loaded. Adjust any step or bass note to make it yours.'};
    module.querySelector('#swgLength').onchange=e=>{resizeSteps(+e.target.value);status.textContent=stepCount===32?'Two-bar sequence selected.':'One-bar sequence selected.'};
    module.querySelector('#swgKit').onchange=e=>{kit=e.target.value;persist()};
    module.querySelector('#swgSwing').oninput=e=>{swing=+e.target.value/100;module.querySelector('#swgSwingOut').textContent=e.target.value+'%';persist()};
    module.querySelector('#swgSave').onclick=()=>{const name=module.querySelector('#swgName').value.trim();if(!name){status.textContent='Enter a pattern name before saving.';return}activeName=name;saved[name]=currentData(name);persist();renderSavedSelect(module.querySelector('#swgSaved'));module.querySelector('#swgSaved').value=name;status.textContent='Saved “'+name+'” on this device.'};
    module.querySelector('#swgLoad').onclick=()=>{const name=module.querySelector('#swgSaved').value;if(!saved[name]){status.textContent='Choose a saved pattern first.';return}setGroove(saved[name]);module.querySelector('#swgPreset').value=selectedPreset;module.querySelector('#swgLength').value=String(stepCount);module.querySelector('#swgKit').value=kit;module.querySelector('#swgSwing').value=Math.round(swing*100);module.querySelector('#swgSwingOut').textContent=Math.round(swing*100)+'%';module.querySelector('#swgName').value=activeName;status.textContent='Loaded “'+name+'”.'};
    module.querySelector('#swgDelete').onclick=()=>{const name=module.querySelector('#swgSaved').value;if(!saved[name])return;delete saved[name];persist();renderSavedSelect(module.querySelector('#swgSaved'));status.textContent='Deleted “'+name+'” from this device.'};
    module.querySelector('#swgExport').onclick=()=>download((activeName||'saxworx-groove').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.json',JSON.stringify(currentData(),null,2),'application/json');
    module.querySelector('#swgImport').onclick=()=>module.querySelector('#swgFile').click();
    module.querySelector('#swgFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());setGroove(data);module.querySelector('#swgPreset').value=selectedPreset;module.querySelector('#swgLength').value=String(stepCount);module.querySelector('#swgKit').value=kit;module.querySelector('#swgSwing').value=Math.round(swing*100);module.querySelector('#swgSwingOut').textContent=Math.round(swing*100)+'%';module.querySelector('#swgName').value=activeName;status.textContent='Imported “'+activeName+'”.'}catch(err){status.textContent=err.message}e.target.value=''};
    syncBassControls();syncClickControls();
    const oldClick=document.getElementById('click');if(oldClick){oldClick.checked=clickEnabled;oldClick.onchange=e=>{clickEnabled=e.target.checked;syncClickControls();persist()}};
    const oldAccent=document.getElementById('accent');if(oldAccent){oldAccent.hidden=true;const label=oldAccent.closest('label');if(label)label.hidden=true}
    module.querySelector('#swgClickEnabled').onchange=e=>{clickEnabled=e.target.checked;syncClickControls();persist()};
    module.querySelector('#swgAccent').onchange=e=>{accentSound=e.target.value;persist()};
    module.querySelector('#swgClickLevel').oninput=e=>{clickLevel=+e.target.value/100;syncClickControls();persist()};
    module.querySelector('#swgClickPreview').onclick=async()=>{await audio();playAccent(ctx.currentTime+.03,true)};
    module.querySelector('#swgBassLevel').oninput=e=>{bassLevel=+e.target.value/100;syncBassControls();persist()};
    module.querySelector('#swgBassTune').oninput=e=>{bassTune=+e.target.value;syncBassControls();persist()};
    module.querySelector('#swgBassDown').onclick=()=>{bassTune=Math.max(-12,bassTune-1);syncBassControls();persist()};
    module.querySelector('#swgBassUp').onclick=()=>{bassTune=Math.min(12,bassTune+1);syncBassControls();persist()};
    module.querySelector('#swgBassReset').onclick=()=>{bassTune=0;syncBassControls();persist()};
    const genreSelect=document.getElementById('genre');if(genreSelect)genreSelect.onchange=changeGenre;
    const timeSelect=document.getElementById('time');if(timeSelect)timeSelect.onchange=e=>{stopEngine();signature=+e.target.value;updateChords(0);status.textContent=signature===4?'Sequencer is running a 4/4 bar.':'Pattern steps are distributed across this meter; detailed step timing is optimized for 4/4.'};
  }
  function syncClickControls(){const enabled=document.getElementById('swgClickEnabled'),level=document.getElementById('swgClickLevel'),out=document.getElementById('swgClickLevelOut'),accent=document.getElementById('swgAccent'),legacy=document.getElementById('click');if(enabled)enabled.checked=clickEnabled;if(legacy)legacy.checked=clickEnabled;if(level)level.value=Math.round(clickLevel*100);if(out)out.textContent=Math.round(clickLevel*100)+'%';if(accent)accent.value=accentSound}
  function playAccent(at,downbeat){const gain=clickLevel*(downbeat?1:.65);if(gain<=0)return;
    if(accentSound==='Shaker'){noise(at,.05,6500,.07*gain);return}
    if(accentSound==='Rimshot'){noise(at,.035,2400,.065*gain);synth(downbeat?84:80,at,.025,'triangle',.07*gain);return}
    if(accentSound==='Bell'){synth(downbeat?81:77,at,.12,'sine',.10*gain);synth(downbeat?93:89,at,.07,'sine',.035*gain);return}
    if(accentSound==='Cowbell'){synth(downbeat?73:70,at,.09,'square',.035*gain);synth(downbeat?80:77,at,.06,'triangle',.05*gain);return}
    if(accentSound==='Clave'){synth(downbeat?92:87,at,.03,'triangle',.10*gain);return}
    if(accentSound==='Soft tick'){synth(downbeat?76:72,at,.025,'sine',.07*gain);return}
    synth(downbeat?84:77,at,.045,'triangle',.10*gain);
  }
  function noise(t,d,filterHz,vol,kind) {
    const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*d),ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
    const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=b;f.type='highpass';f.frequency.value=filterHz;g.gain.setValueAtTime(Math.max(.0001,vol),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);src.connect(f).connect(g).connect(practiceAudioBus());src.start(t);src.stop(t+d+.01);
  }
  function playDrum(lane,t,level) {
    const v=velocity[level]||0;if(!v)return;
    if(lane===0){const o=ctx.createOscillator(),g=ctx.createGain();o.type=kit==='Electronic'?'sine':'triangle';o.frequency.setValueAtTime(kit==='Bright'?165:130,t);o.frequency.exponentialRampToValueAtTime(kit==='Electronic'?35:42,t+.16);g.gain.setValueAtTime(.31*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g).connect(practiceAudioBus());o.start(t);o.stop(t+.23);return}
    if(lane===1){noise(t,.14,kit==='Bright'?1800:1200,.16*v,lane);return}
    if(lane===2){noise(t,.045,kit==='Electronic'?8500:6500,.065*v,lane);return}
    if(lane===3){noise(t,.22,kit==='Bright'?7800:7000,.07*v,lane);return}
    if(lane===4){noise(t,.105,1450,.13*v,lane);return}
    const g=ctx.createGain(),o1=ctx.createOscillator(),o2=ctx.createOscillator();o1.type='square';o2.type='triangle';o1.frequency.value=kit==='Bright'?5900:5100;o2.frequency.value=7900;g.gain.setValueAtTime(.035*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.24);o1.connect(g);o2.connect(g);g.connect(practiceAudioBus());o1.start(t);o2.start(t);o1.stop(t+.25);o2.stop(t+.25);
  }
  function stopCustomEngine() { engineToken++;clearInterval(engine);engine=null;clearTimeout(stepTimer);clearInterval(lookAhead);document.querySelector('#playGroove')?.replaceChildren(document.createTextNode('Play groove'));syncStep(); }
  async function startCustomEngine() {
    if(engine){stopEngine();return} await audio();
    const token=++engineToken;let next=ctx.currentTime+.06,step=0,lastGrid=-1;
    const tick=()=>{if(token!==engineToken)return;while(next<ctx.currentTime+.12){const steps=signature===4?stepCount:signature*2,s=step%steps,bar=signature===4?Math.floor(step/16):Math.floor(step/steps),beat=signature===4?Math.floor(s/4)%4:Math.floor(s/2),grid=signature===4?s:Math.floor(s*stepCount/steps),c=changes()[bar%changes().length],base=48+root+c.n,at=next,measureStart=signature===4?s%16===0:s===0;
      setTimeout(()=>{if(!engine||token!==engineToken)return;if(measureStart)updateChords(bar);document.querySelectorAll('.beat').forEach((el,i)=>el.classList.toggle('active',i===beat));syncStep(grid)},Math.max(0,(at-ctx.currentTime)*1000));
      if(clickEnabled&&clickLevel>0&&s%(signature===4?4:2)===0)playAccent(at,beat===0);
      if(genre!=='Metronome'){
        if(document.getElementById('drums')?.checked&&grid!==lastGrid)pattern.forEach((row,lane)=>{const level=row[grid]||0;if(level)playDrum(lane,at,level)});
        if(document.getElementById('bass')?.checked&&bassLevel>0&&grid!==lastGrid&&bassSteps[grid]!=null)synth(base-12+bassSteps[grid]+bassTune,at,Math.max(.18,60/bpm*.68),'triangle',.17*bassLevel);
        if(document.getElementById('chordStem')?.checked&&measureStart)c.iv.forEach(n=>synth(base+12+n,at,.7,'triangle',.045));
      }
      lastGrid=grid;let delta=60/bpm/(signature===4?4:2);
      if(signature===4&&swing>0){const phase=Math.floor((s%16)/2)%2;delta*=phase===0?1+swing:1-swing}
      next+=delta;step++
    }};
    engine=setInterval(tick,20);const b=document.getElementById('playGroove');if(b)b.textContent='Stop groove';
  }
  const originalStop=stopEngine;stopEngine=function(){stopCustomEngine();if(typeof originalStop==='function')originalStop()};
  toggleEngine=async function(){if(engine){stopEngine();return}await startCustomEngine()};
  const previousGroovePage=groovePage;groovePage=function(){previousGroovePage();renderUI()};
  const disk=readStore();if(disk.saved&&typeof disk.saved==='object')saved=disk.saved;
  if(disk.drums&&disk.drums.length===6){try{setGroove({...disk,name:disk.activeName||'My groove'})}catch{patternRows();applyGenrePattern(selectedGenreLabel())}}else{patternRows();applyGenrePattern(selectedGenreLabel())}
  if(view==='Groove lab')groovePage();
})();
