// ============================================================
// voice.js — MP3 audio from GitHub Pages.
// Works in Telegram Android WebView.
// All audio calls are fire-and-forget (except speakThen).
// ============================================================
'use strict';

const Voice = (() => {
  let enabled  = true;
  let current  = null;
  let vol      = 0.92;
  let base     = '';
  let manifest = null;
  let onReadyCb = null;

  // ── Init — load manifest, then fire onReady ───────────────
  function init(audioBase, onReady) {
    base = audioBase;
    onReadyCb = onReady;
    _loadManifest();
  }

  async function _loadManifest() {
    try {
      const r = await fetch(`${base}/audio/manifest.json`);
      manifest = r.ok ? await r.json() : {};
    } catch(e) {
      manifest = {};
    }
    if (onReadyCb) onReadyCb();
  }

  // ── Core audio play ───────────────────────────────────────
  function _play(url, onEnd) {
    if (!enabled || !url) { if (onEnd) setTimeout(onEnd, 50); return; }
    _stop();
    current = new Audio(url);
    current.volume = vol;
    current.onended = onEnd || null;
    current.onerror = () => { current = null; if (onEnd) onEnd(); };
    const p = current.play();
    if (p) p.catch(() => { if (onEnd) onEnd(); });
  }

  function _stop() {
    if (!current) return;
    try { current.pause(); current.src = ''; } catch(e) {}
    current = null;
  }

  // ── Play a manifest key ───────────────────────────────────
  // If manifest not loaded or key missing — silently skips
  function _key(key, onEnd, maxMs) {
    if (!manifest || !manifest[key]) {
      if (onEnd) setTimeout(onEnd, 50);
      return;
    }
    const url = `${base}/audio/${manifest[key]}`;
    _play(url, onEnd);
    if (maxMs && onEnd) {
      let fired = false;
      const orig = onEnd;
      const safe = () => { if (!fired) { fired = true; orig(); } };
      setTimeout(safe, maxMs);
    }
  }

  // ── Guaranteed callback: fires after audio OR after timeout ─
  function keyThen(key, cb, maxMs) {
    let done = false;
    const finish = () => { if (done) return; done = true; if (cb) cb(); };
    _key(key, finish);
    setTimeout(finish, maxMs || 8000);
  }

  // ── Public API ────────────────────────────────────────────
  function stop()    { _stop(); }
  function setVol(v) { vol = v / 100; if (current) current.volume = vol; }
  function toggle()  {
    enabled = !enabled; if (!enabled) stop();
    const b = document.getElementById('vtoggle');
    if (b) b.textContent = enabled ? '🔊' : '🔇';
  }

  // Breathing cues
  function intro(protoKey, cb)   { keyThen(PROTOS[protoKey].introKey, cb, 9000); }
  function done(protoKey, cb)    { keyThen(PROTOS[protoKey].doneKey,  cb, 7000); }
  function round(protoKey, idx)  { _key(PROTOS[protoKey].roundKeys[idx]); }
  function phase(voiceKey)       { _key(voiceKey); }
  function bwComplete()          { _key('bw_complete'); }

  // Session cues
  function sessionOpen(freqKey, cb) { keyThen(SESSION_OPEN_KEYS[freqKey] || 'open_theta', cb, 8000); }
  function midpoint()               { _key('midpoint_1'); }
  function finalMin()               { _key('final_min_1'); }
  function closeSession(cb)         { keyThen('close_1', cb, 7000); }
  function closingBreath(cb)        { keyThen('closing_breath', cb, 14000); }

  // Affirmations — direct URL
  function affirmation(url) { if (url && url.startsWith('http')) _play(url, null); }

  return {
    init, stop, setVol, toggle,
    intro, done, round, phase, bwComplete,
    sessionOpen, midpoint, finalMin, closeSession, closingBreath,
    affirmation,
  };
})();
