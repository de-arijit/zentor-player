// ============================================================
// ZENTOR — audio.js
// Binaural beats engine + ambient pad layer
// Warm synthesized ambient music under the binaural tones
// ============================================================

'use strict';

const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  let binauralGain = null;
  let ambientGain = null;

  // Binaural nodes
  let leftOsc = null, rightOsc = null, lGain = null, rGain = null, merger = null;

  // Ambient nodes
  let ambientNodes = [];
  let noiseNode = null;
  let noiseGain = null;

  // State
  let running = false;
  let currentVol = 0.70;

  // ── Init audio context ────────────────────────────────────
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain  = ctx.createGain();
    masterGain.gain.value = currentVol;
    masterGain.connect(ctx.destination);

    binauralGain = ctx.createGain();
    binauralGain.gain.value = 0.6;
    binauralGain.connect(masterGain);

    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.4;
    ambientGain.connect(masterGain);
  }

  // ── Binaural beats ────────────────────────────────────────
  function startBinaural(freqKey) {
    init();
    const cfg = FREQS[freqKey] || FREQS.theta;

    merger = ctx.createChannelMerger(2);
    merger.connect(binauralGain);

    leftOsc = ctx.createOscillator();
    lGain = ctx.createGain();
    leftOsc.frequency.value = cfg.base;
    leftOsc.type = 'sine';
    lGain.gain.value = 1;
    leftOsc.connect(lGain);
    lGain.connect(merger, 0, 0);
    leftOsc.start();

    rightOsc = ctx.createOscillator();
    rGain = ctx.createGain();
    rightOsc.frequency.value = cfg.base + cfg.beat;
    rightOsc.type = 'sine';
    rGain.gain.value = 1;
    rightOsc.connect(rGain);
    rGain.connect(merger, 0, 1);
    rightOsc.start();
  }

  function stopBinaural() {
    try { if (leftOsc)  { leftOsc.stop();  leftOsc  = null; } } catch(e) {}
    try { if (rightOsc) { rightOsc.stop(); rightOsc = null; } } catch(e) {}
  }

  // ── Ambient pads ──────────────────────────────────────────
  // Generates warm, slow-evolving harmonic pads
  // Frequency set chosen to be harmonically pleasing with binaural base

  function startAmbient(freqKey) {
    init();
    stopAmbient();

    // Pad configuration per frequency type
    const padConfigs = {
      delta: { rootHz: 75,  notes: [1, 1.5, 2, 3],       filterHz: 400,  lfoRate: 0.05 },
      theta: { rootHz: 90,  notes: [1, 1.33, 1.5, 2],    filterHz: 600,  lfoRate: 0.08 },
      alpha: { rootHz: 100, notes: [1, 1.25, 1.5, 2],    filterHz: 800,  lfoRate: 0.12 },
      beta:  { rootHz: 110, notes: [1, 1.25, 1.5, 2, 3], filterHz: 1200, lfoRate: 0.15 },
      gamma: { rootHz: 120, notes: [1, 1.5, 2, 2.5, 3],  filterHz: 1500, lfoRate: 0.20 },
    };
    const cfg = padConfigs[freqKey] || padConfigs.theta;

    // Create pad voices (one per note)
    cfg.notes.forEach((ratio, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = cfg.rootHz * ratio;

      // Slight detune for warmth
      osc.detune.value = (i * 7) - 14;

      // Low-pass filter for warmth
      filter.type = 'lowpass';
      filter.frequency.value = cfg.filterHz;
      filter.Q.value = 0.8;

      gain.gain.value = 0.08 / cfg.notes.length;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ambientGain);
      osc.start();

      // Slow LFO on gain for breathing quality
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = cfg.lfoRate + (i * 0.01);
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      ambientNodes.push(osc, lfo);
    });

    // Pink noise layer (very subtle)
    addPinkNoise();
  }

  function addPinkNoise() {
    // Generate pink noise buffer
    const bufferSize = 4096;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + white*0.0555179;
        b1 = 0.99332*b1 + white*0.0750759;
        b2 = 0.96900*b2 + white*0.1538520;
        b3 = 0.86650*b3 + white*0.3104856;
        b4 = 0.55000*b4 + white*0.5329522;
        b5 = -0.7616*b5 - white*0.0168980;
        data[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04; // Very subtle

    // High shelf cut to keep it warm
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highshelf';
    noiseFilter.frequency.value = 2000;
    noiseFilter.gain.value = -12;

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientGain);
    noiseNode.start();
  }

  function stopAmbient() {
    ambientNodes.forEach(n => {
      try { n.stop(); } catch(e) {}
    });
    ambientNodes = [];
    try { if (noiseNode) { noiseNode.stop(); noiseNode = null; } } catch(e) {}
  }

  // ── Fade in / out ─────────────────────────────────────────
  function fadeIn(durationSecs = 3) {
    if (!masterGain) return;
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(currentVol, ctx.currentTime + durationSecs);
  }

  function fadeOut(durationSecs = 8, onDone) {
    if (!masterGain) { if (onDone) onDone(); return; }
    masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSecs);
    if (onDone) setTimeout(onDone, durationSecs * 1000);
  }

  // ── Start / Stop all ─────────────────────────────────────
  function start(freqKey) {
    startBinaural(freqKey);
    startAmbient(freqKey);
    fadeIn(4);
    running = true;
  }

  function stop() {
    stopBinaural();
    stopAmbient();
    running = false;
  }

  function endGracefully(onDone) {
    // 12-second fade out for graceful ending
    fadeOut(12, () => {
      stop();
      if (onDone) onDone();
    });
  }

  // ── Volume ────────────────────────────────────────────────
  function setVolume(val) {
    currentVol = val / 100;
    if (masterGain) masterGain.gain.value = currentVol;
  }

  function isRunning() { return running; }

  return {
    init, start, stop, endGracefully,
    setVolume, isRunning,
    fadeIn, fadeOut,
  };
})();
