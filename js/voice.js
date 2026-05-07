// voice.js — MP3 playback. Works in Telegram Android WebView.
'use strict';

const Voice = (() => {
  let enabled = true;
  let current = null;
  let vol = 0.92;
  let base = '';
  let manifest = null;

  function init(audioBase, onReady) {
    base = audioBase;
    fetch(`${base}/audio/manifest.json`)
      .then(r => r.ok ? r.json() : {})
      .then(m => { manifest = m; if (onReady) onReady(); })
      .catch(() => { manifest = {}; if (onReady) onReady(); });
  }

  function _play(url, onEnd) {
    if (!enabled || !url) { if (onEnd) setTimeout(onEnd, 50); return; }
    try {
      if (current) { try { current.pause(); current.src=''; } catch(e){} current=null; }
      const a = new Audio(url);
      a.volume = vol;
      a.onended = onEnd || null;
      a.onerror = () => { if (onEnd) onEnd(); };
      a.play().catch(() => { if (onEnd) onEnd(); });
      current = a;
    } catch(e) { if (onEnd) setTimeout(onEnd, 50); }
  }

  // Play key with guaranteed callback after maxMs
  function _keyThen(key, cb, maxMs) {
    let done = false;
    const finish = () => { if (done) return; done = true; if (cb) cb(); };
    if (manifest && manifest[key]) {
      _play(`${base}/audio/${manifest[key]}`, finish);
    } else {
      // No audio — just call back immediately
      setTimeout(finish, 100);
    }
    setTimeout(finish, maxMs || 8000);
  }

  // Fire and forget
  function _key(key) {
    if (manifest && manifest[key]) _play(`${base}/audio/${manifest[key]}`, null);
  }

  function stop() {
    if (!current) return;
    try { current.pause(); current.src = ''; } catch(e) {}
    current = null;
  }

  function setVol(v) { vol = v/100; if (current) current.volume = vol; }

  function toggle() {
    enabled = !enabled; if (!enabled) stop();
    const b = document.getElementById('vtoggle');
    if (b) b.textContent = enabled ? '🔊' : '🔇';
  }

  // Breathing
  function intro(k, cb)  { _keyThen(PROTOS[k].introKey, cb, 9000); }
  function done(k, cb)   { _keyThen(PROTOS[k].doneKey,  cb, 7000); }
  function round(k, idx) { _key(PROTOS[k].roundKeys[idx]); }
  function phase(vk)     { _key(vk); }
  function bwComplete()  { _key('bw_complete'); }

  // Session
  function sessionOpen(fk) { _key(SESSION_OPEN_KEYS[fk] || 'open_theta'); }
  function midpoint()      { _key('midpoint_1'); }
  function finalMin()      { _key('final_min_1'); }
  function closeSession(cb){ _keyThen('close_1', cb, 7000); }
  function closingBreath(cb){ _keyThen('closing_breath', cb, 14000); }
  function affirmation(url){ if (url && url.startsWith('http')) _play(url, null); }

  return {
    init, stop, setVol, toggle,
    intro, done, round, phase, bwComplete,
    sessionOpen, midpoint, finalMin, closeSession, closingBreath,
    affirmation,
  };
})();
