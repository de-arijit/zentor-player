// ============================================================
// audio.js — binaural beats + warm ambient pads.
// Must be started from a user gesture on Android.
// ============================================================
'use strict';

const Audio = (() => {
  let ctx = null, masterGain = null, binGain = null, ambGain = null;
  let leftOsc = null, rightOsc = null, lG = null, rG = null, merger = null;
  let ambNodes = [], noiseNode = null;
  let running = false;
  let vol = 0.70;

  function _init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain(); masterGain.gain.value = vol;
    masterGain.connect(ctx.destination);
    binGain = ctx.createGain(); binGain.gain.value = 0.65; binGain.connect(masterGain);
    ambGain = ctx.createGain(); ambGain.gain.value = 0.35; ambGain.connect(masterGain);
  }

  function start(freqKey) {
    _init();
    _startBinaural(freqKey);
    _startAmbient(freqKey);
    // Fade in over 4 seconds
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 4);
    running = true;
  }

  function stop() {
    _stopBinaural(); _stopAmbient(); running = false;
  }

  function fadeOut(secs, cb) {
    if (!masterGain) { if (cb) cb(); return; }
    masterGain.gain.setValueAtTime(vol, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + secs);
    if (cb) setTimeout(cb, secs * 1000);
  }

  function setVolume(v) {
    vol = v / 100;
    if (masterGain && running) masterGain.gain.value = vol;
  }

  function _startBinaural(key) {
    const f = FREQS[key] || FREQS.theta;
    merger = ctx.createChannelMerger(2); merger.connect(binGain);
    leftOsc = ctx.createOscillator(); lG = ctx.createGain();
    leftOsc.frequency.value = f.base; leftOsc.type = 'sine'; lG.gain.value = 1;
    leftOsc.connect(lG); lG.connect(merger, 0, 0); leftOsc.start();
    rightOsc = ctx.createOscillator(); rG = ctx.createGain();
    rightOsc.frequency.value = f.base + f.beat; rightOsc.type = 'sine'; rG.gain.value = 1;
    rightOsc.connect(rG); rG.connect(merger, 0, 1); rightOsc.start();
  }

  function _stopBinaural() {
    [leftOsc, rightOsc].forEach(o => { try { if(o) o.stop(); } catch(e){} });
    leftOsc = rightOsc = null;
  }

  function _startAmbient(key) {
    _stopAmbient();
    const cfgs = {
      delta:{ root:75,  notes:[1,1.5,2,3],       fHz:400,  lfo:0.05 },
      theta:{ root:90,  notes:[1,1.33,1.5,2],    fHz:600,  lfo:0.08 },
      alpha:{ root:100, notes:[1,1.25,1.5,2],    fHz:800,  lfo:0.12 },
      beta: { root:110, notes:[1,1.25,1.5,2,3],  fHz:1200, lfo:0.15 },
      gamma:{ root:120, notes:[1,1.5,2,2.5,3],   fHz:1500, lfo:0.20 },
    };
    const c = cfgs[key] || cfgs.theta;
    c.notes.forEach((r, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      const fil = ctx.createBiquadFilter();
      osc.type = i%2===0?'sine':'triangle';
      osc.frequency.value = c.root * r;
      osc.detune.value = i*7 - 14;
      fil.type = 'lowpass'; fil.frequency.value = c.fHz; fil.Q.value = 0.8;
      g.gain.value = 0.08 / c.notes.length;
      osc.connect(fil); fil.connect(g); g.connect(ambGain); osc.start();
      const lfo = ctx.createOscillator(); const lg = ctx.createGain();
      lfo.frequency.value = c.lfo + i*0.01; lg.gain.value = 0.03;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      ambNodes.push(osc, lfo);
    });
    // Pink noise
    const buf = ctx.createBuffer(2, 4096, ctx.sampleRate);
    for (let ch=0; ch<2; ch++) {
      const d = buf.getChannelData(ch);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i=0; i<4096; i++) {
        const w = Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.09; b6=w*0.115926;
      }
    }
    noiseNode = ctx.createBufferSource(); noiseNode.buffer = buf; noiseNode.loop = true;
    const ng = ctx.createGain(); ng.gain.value = 0.035;
    const nf = ctx.createBiquadFilter(); nf.type='highshelf'; nf.frequency.value=2000; nf.gain.value=-14;
    noiseNode.connect(nf); nf.connect(ng); ng.connect(ambGain); noiseNode.start();
  }

  function _stopAmbient() {
    ambNodes.forEach(n => { try { n.stop(); } catch(e){} });
    ambNodes = [];
    try { if (noiseNode) { noiseNode.stop(); noiseNode = null; } } catch(e){}
  }

  return { start, stop, fadeOut, setVolume, isRunning: () => running };
})();
