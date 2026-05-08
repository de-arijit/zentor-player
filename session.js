// voice.js — Howler.js audio engine
// Howler handles AudioContext unlock automatically on first interaction.
// Works on Android Telegram WebView, iOS Safari, Desktop — everything.
'use strict';

const Voice = (() => {
  let enabled  = true;
  let vol      = 0.92;
  let base     = '';
  let manifest = null;
  let current  = null; // active Howl

  function init(audioBase, onReady) {
    base = audioBase;
    fetch(`${base}/audio/manifest.json`)
      .then(r => r.ok ? r.json() : {})
      .then(m => { manifest = m; if (onReady) onReady(); })
      .catch(() => { manifest = {}; if (onReady) onReady(); });
  }

  function _play(url, onEnd) {
    if (!enabled || !url) { if (onEnd) setTimeout(onEnd, 50); return; }

    // If Howler not loaded, fall back to native Audio
    if (typeof Howl === 'undefined') {
      try {
        if (current) { try { current.pause(); current.src=''; } catch(e){} }
        const a = new Audio(url);
        a.volume = vol;
        a.onended = onEnd || null;
        a.onerror = () => { if (onEnd) onEnd(); };
        a.play().catch(() => { if (onEnd) onEnd(); });
        current = a;
      } catch(e) { if (onEnd) setTimeout(onEnd, 50); }
      return;
    }

    try {
      if (current) { try { current.stop(); } catch(e){} current = null; }
      const h = new Howl({
        src: [url],
        volume: vol,
        html5: true,
        onend:   onEnd || undefined,
        onerror: () => { if (onEnd) onEnd(); },
      });
      h.play();
      current = h;
    } catch(e) { if (onEnd) setTimeout(onEnd, 50); }
  }

  function _keyThen(key, cb, maxMs) {
    let done = false;
    const finish = () => { if (done) return; done = true; if (cb) cb(); };
    if (manifest && manifest[key]) {
      _play(`${base}/audio/${manifest[key]}`, finish);
    } else {
      setTimeout(finish, 100);
    }
    if (maxMs) setTimeout(finish, maxMs);
  }

  function _key(key) {
    if (manifest && manifest[key]) _play(`${base}/audio/${manifest[key]}`, null);
  }

  function stop() {
    if (current) { try { current.stop(); } catch(e){} current = null; }
  }

  function setVol(v) {
    vol = v / 100;
    if (current) current.volume(vol);
    Howler.volume(vol); // global fallback
  }

  function toggle() {
    enabled = !enabled;
    if (!enabled) stop();
    const b = document.getElementById('vtoggle');
    if (b) b.textContent = enabled ? '🔊' : '🔇';
    return enabled;
  }

  // Howler unlocks AudioContext on first Howl.play() call
  // which happens directly in the button tap handler — no extra unlock needed

  // Breathing cues
  function intro(k, cb)  { _keyThen(PROTOS[k] ? PROTOS[k].introKey : 'intro_calm', cb, 9000); }
  function done(k, cb)   { _keyThen(PROTOS[k] ? PROTOS[k].doneKey  : 'done_calm',  cb, 7000); }
  function round(k, idx) { _key(PROTOS[k] ? PROTOS[k].roundKeys[idx] : 'calm_r1'); }
  function phase(vk)     { _key(vk); }
  function bwComplete()  { _key('bw_complete'); }

  // Session cues
  function sessionOpen(fk) { _key(SESSION_OPEN_KEYS[fk] || 'open_theta'); }
  function midpoint()      { _key('midpoint_1'); }
  function finalMin()      { _key('final_min_1'); }
  function closeSession(cb){ _keyThen('close_1', cb, 7000); }
  function closingBreath(cb){ _keyThen('closing_breath', cb, 14000); }

  // Affirmation — direct URL (generated per session)
  function affirmation(url) {
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
      _play(url, null);
    }
  }

  return {
    init, stop, setVol, toggle,
    intro, done, round, phase, bwComplete,
    sessionOpen, midpoint, finalMin, closeSession, closingBreath,
    affirmation,
  };
})();
