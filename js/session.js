// ============================================================
// session.js — session player.
// Audio.start() called directly from play button (user gesture).
// ============================================================
'use strict';

const Session = (() => {
  let playing = false, elapsed = 0, sessDur = 1200;
  let tIv = null, affTimeout = null;
  let midSpoken = false, finSpoken = false, ending = false;
  let affs = [], affIdx = 0, affInterval = 0;

  function init(durationMins, freqKey, affList, rewirePhase) {
    sessDur  = Math.max(20, durationMins || 20) * 60;
    elapsed  = 0; ending = false; affIdx = 0;

    const defaults = (DEFAULT_AFFS[freqKey] || DEFAULT_AFFS.theta)
      .map(t => ({ type:'text', text:t }));
    affs = (affList && affList.length) ? affList : defaults;

    const count = getAffirmCount(durationMins || 20, rewirePhase || 'regulate');
    affs = affs.slice(0, count);
    affInterval = getAffirmInterval(durationMins || 20, affs.length);

    _updateTimer(); _updateArc(0);
    document.querySelectorAll('.dur-btn').forEach(b =>
      b.classList.toggle('active', parseInt(b.textContent) === (durationMins || 20))
    );
  }

  // Called directly from play button onclick — user gesture
  function start() {
    if (playing) return;
    playing = true; midSpoken = false; finSpoken = false; ending = false;

    document.getElementById('playIco').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    document.getElementById('sOrb').className = 'orb session';
    document.getElementById('sStatus').textContent = 'SESSION ACTIVE';
    document.getElementById('wform').classList.add('playing');

    // Audio.start() is here — directly in user gesture chain
    Audio.start(window.APP.freqKey);
    tIv = setInterval(_tick, 1000);

    // First affirmation at 20% mark
    const firstDelay = Math.floor(sessDur * 0.20) * 1000;
    affTimeout = setTimeout(_deliverAffirm, firstDelay);

    // Session open voice cue
    setTimeout(() => Voice.sessionOpen(window.APP.freqKey), 1400);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    document.getElementById('playIco').innerHTML = '<path d="M8 5v14l11-7z"/>';
    document.getElementById('sOrb').className = 'orb';
    document.getElementById('sStatus').textContent = 'PAUSED';
    document.getElementById('wform').classList.remove('playing');
    Audio.stop(); clearInterval(tIv); clearTimeout(affTimeout); Voice.stop();
  }

  function toggle() { playing ? pause() : start(); }

  function reset() {
    pause(); elapsed = 0; affIdx = 0; midSpoken = false; finSpoken = false; ending = false;
    _updateTimer(); _updateArc(0);
    document.getElementById('sStatus').textContent = 'READY';
    document.getElementById('reflectBox').style.display = 'none';
  }

  function setDuration(mins, btn) {
    const was = playing; if (was) pause();
    sessDur = Math.max(20, mins) * 60; elapsed = 0; affIdx = 0;
    midSpoken = false; finSpoken = false;
    const rp = window.APP ? window.APP.rewirePhase : 'regulate';
    const fk = window.APP ? window.APP.freqKey    : 'theta';
    const cnt = getAffirmCount(mins, rp);
    const src = (window.APP && window.APP.affs.length)
      ? window.APP.affs
      : (DEFAULT_AFFS[fk]||DEFAULT_AFFS.theta).map(t=>({type:'text',text:t}));
    affs = src.slice(0, cnt);
    affInterval = getAffirmInterval(mins, affs.length);
    _updateTimer(); _updateArc(0);
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (was) start();
  }

  function skipForward() {
    elapsed = Math.min(elapsed + 15, sessDur);
    _updateTimer(); _updateArc(elapsed / sessDur);
  }

  function _tick() {
    elapsed++; _updateTimer(); _updateArc(elapsed / sessDur);
    const rem = sessDur - elapsed;
    const half = Math.floor(sessDur / 2);
    if (!midSpoken && elapsed >= half && elapsed <= half + 2) {
      midSpoken = true; Voice.midpoint();
    }
    if (!finSpoken && rem <= 60 && rem > 57) {
      finSpoken = true; Voice.finalMin();
    }
    if (!ending && rem <= 15 && rem > 0) {
      ending = true; _beginEnding();
    }
    if (elapsed >= sessDur) _end();
  }

  function _beginEnding() {
    Audio.fadeOut(12, null);
    Voice.closeSession(null);
  }

  function _end() {
    pause();
    document.getElementById('sStatus').textContent = 'SESSION COMPLETE';
    setTimeout(() => {
      Voice.closingBreath(() => {
        document.getElementById('reflectBox').style.display = 'block';
      });
    }, 2000);
  }

  function _deliverAffirm() {
    if (!playing || ending || affIdx >= affs.length) return;
    const aff = affs[affIdx++];
    // Show visual
    const el = document.getElementById('affirmTxt');
    if (el) {
      el.classList.remove('vis');
      setTimeout(() => { el.textContent = aff.text || '✦'; el.classList.add('vis'); }, 400);
    }
    // Play audio
    if (aff.type === 'audio' && aff.url) Voice.affirmation(aff.url);
    // Schedule next
    if (affIdx < affs.length) affTimeout = setTimeout(_deliverAffirm, affInterval * 1000);
  }

  function _updateTimer() {
    const rem = sessDur - elapsed;
    const m = String(Math.floor(rem/60)).padStart(2,'0');
    const s = String(rem%60).padStart(2,'0');
    const el = document.getElementById('timerLbl');
    if (el) el.textContent = m + ':' + s;
  }

  function _updateArc(f) {
    const el = document.querySelector('.arc-fill');
    if (el) el.style.strokeDashoffset = 188 * (1 - f);
  }

  return { init, start, pause, toggle, reset, setDuration, skipForward };
})();
