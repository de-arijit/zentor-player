// ============================================================
// ZENTOR — voice.js
// Audio playback using hosted MP3 files from GitHub Pages.
// Works in ALL browsers including Telegram Android WebView.
// No speech synthesis. No third-party scripts. Just <audio>.
// ============================================================

'use strict';

const Voice = (() => {
  let enabled = true;
  let current = null;
  let vol = 0.92;
  let audioBase = '';
  let manifest = null;

  // ── Init ──────────────────────────────────────────────────
  function init(base) {
    audioBase = base;
    loadManifest();
  }

  async function loadManifest() {
    try {
      const r = await fetch(`${audioBase}/audio/manifest.json`);
      if (r.ok) manifest = await r.json();
    } catch(e) {
      console.warn('No audio manifest found');
    }
  }

  // ── Core play ─────────────────────────────────────────────
  function play(url, onEnd) {
    if (!enabled || !url) { if (onEnd) setTimeout(onEnd, 50); return; }
    stop();
    current = new Audio(url);
    current.volume = vol;
    current.onended = onEnd || null;
    current.onerror = () => { if (onEnd) onEnd(); };
    current.play().catch(() => { if (onEnd) onEnd(); });
  }

  // Play by manifest key, then call cb
  function playKey(key, onEnd, maxMs) {
    let done = false;
    const finish = () => { if (done) return; done = true; if (onEnd) onEnd(); };

    if (!manifest || !manifest[key]) {
      console.warn('Missing audio key:', key);
      setTimeout(finish, 200);
      return;
    }
    play(`${audioBase}/audio/${manifest[key]}`, finish);
    if (maxMs) setTimeout(finish, maxMs);
  }

  // ── Breathing cues ────────────────────────────────────────

  function intro(protoKey, cb)  { playKey('intro_' + protoKey, cb, 9000); }
  function done(protoKey, cb)   { playKey('done_'  + protoKey, cb, 7000); }

  function round(protoKey, idx) {
    // idx is 0-based from breath.js, manifest keys are 1-based (calm_r1, calm_r2...)
    playKey(protoKey + '_r' + (idx + 1), null);
  }

  function phase(animType) {
    const map = { inhale:'breathe_in', exhale:'breathe_out', hold:'hold', hold2:'hold' };
    playKey(map[animType] || 'breathe_in', null);
  }

  function bwComplete() { playKey('bw_complete', null); }

  // ── Session cues ──────────────────────────────────────────

  function sessionOpen(freqKey, cb) { playKey('open_' + freqKey, cb, 8000); }
  function midpoint()   { playKey('midpoint_1',    null); }
  function finalMin()   { playKey('final_min_1',   null); }
  function close(cb)    { playKey('close_1',        cb, 7000); }
  function closingBreath(cb) { playKey('closing_breath', cb, 14000); }

  // ── Affirmations — direct URL (generated per session) ────
  function affirmation(url) {
    if (url && url.startsWith('http')) play(url, null);
  }

  // ── Controls ─────────────────────────────────────────────
  function stop() {
    if (current) {
      try { current.pause(); current.src = ''; } catch(e){}
      current = null;
    }
  }

  function toggle() {
    enabled = !enabled;
    if (!enabled) stop();
    const btn = document.getElementById('vtoggle');
    if (btn) btn.textContent = enabled ? '🔊' : '🔇';
    return enabled;
  }

  function setVol(v) {
    vol = v / 100;
    if (current) current.volume = vol;
  }

  return {
    init, stop, toggle, setVol,
    intro, done, round, phase, bwComplete,
    sessionOpen, midpoint, finalMin, close, closingBreath,
    affirmation,
  };
})();
