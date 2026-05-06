// ============================================================
// ZENTOR — session.js
// Session player: timer, binaural, affirmations, ending
// ============================================================

'use strict';

const Session = (() => {
  let playing = false;
  let elapsed = 0;
  let sessDur = 20 * 60; // default 20 minutes — overridden by URL param
  let tIv = null;
  let midSpoken = false;
  let finSpoken = false;
  let ending = false;

  // Affirmation state
  let affList = [];
  let affIdx = 0;
  let affIv = null;
  let affirmInterval = 0; // seconds between affirmations

  // ── Init ──────────────────────────────────────────────────
  function init(durationMins, freqKey, affs, rewirePhase) {
    sessDur = (durationMins || 20) * 60;
    elapsed = 0;
    ending = false;

    // Build affirmation list
    const defaults = DEFAULT_AFFS[freqKey] || DEFAULT_AFFS.theta;
    affList = affs && affs.length ? affs : defaults;

    // Calculate how many to use and interval
    const count = getAffirmCount(durationMins || 20, rewirePhase || 'regulate');
    affList = affList.slice(0, count);
    affirmInterval = getAffirmInterval(durationMins || 20, count);

    updateTimerDisplay();
    updateArc(0);

    // Highlight correct duration button
    const mins = durationMins || 20;
    document.querySelectorAll('.dur-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.textContent) === mins);
    });
  }

  // ── Play / Pause ──────────────────────────────────────────
  function start() {
    if (playing) return;
    playing = true;
    midSpoken = false;
    finSpoken = false;
    ending = false;

    document.getElementById('playIco').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    document.getElementById('sOrb').className = 'orb session';
    document.getElementById('sStatus').textContent = 'SESSION ACTIVE';
    document.getElementById('wform').classList.add('playing');

    Audio.start(window.APP.freqKey);

    tIv = setInterval(tick, 1000);

    // Schedule first affirmation at 20% through session
    const firstAffDelay = Math.floor(sessDur * 0.20);
    setTimeout(deliverNextAffirm, firstAffDelay * 1000);

    // Session open voice cue
    const openCue = SESSION_OPEN[window.APP.freqKey] || SESSION_OPEN.theta;
    setTimeout(() => Voice.speakGuide(openCue), 1200);
  }

  function pause() {
    if (!playing) return;
    playing = false;
    document.getElementById('playIco').innerHTML = '<path d="M8 5v14l11-7z"/>';
    document.getElementById('sOrb').className = 'orb';
    document.getElementById('sStatus').textContent = 'PAUSED';
    document.getElementById('wform').classList.remove('playing');
    Audio.stop();
    clearInterval(tIv);
    clearTimeout(affIv);
    Voice.stop();
  }

  function toggle() {
    if (playing) pause(); else start();
  }

  function reset() {
    pause();
    elapsed = 0; midSpoken = false; finSpoken = false; ending = false;
    affIdx = 0;
    updateTimerDisplay();
    updateArc(0);
    document.getElementById('sStatus').textContent = 'READY';
    document.getElementById('reflectBox').style.display = 'none';
  }

  // ── Duration buttons ──────────────────────────────────────
  function setDuration(mins, btn) {
    const wasPlaying = playing;
    if (wasPlaying) pause();

    sessDur = mins * 60;
    elapsed = 0; midSpoken = false; finSpoken = false;
    affIdx = 0;

    // Recalculate affirmation timing
    const rewirePhase = window.APP ? window.APP.rewirePhase : 'regulate';
    const count = getAffirmCount(mins, rewirePhase);
    const defaults = DEFAULT_AFFS[window.APP ? window.APP.freqKey : 'theta'] || DEFAULT_AFFS.theta;
    const sourceAffs = window.APP && window.APP.affs.length ? window.APP.affs : defaults;
    affList = sourceAffs.slice(0, count);
    affirmInterval = getAffirmInterval(mins, count);

    updateTimerDisplay();
    updateArc(0);

    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (wasPlaying) start();
  }

  // ── Timer ─────────────────────────────────────────────────
  function tick() {
    elapsed++;
    updateTimerDisplay();
    updateArc(elapsed / sessDur);

    const rem = sessDur - elapsed;

    // Midpoint cue
    const half = Math.floor(sessDur / 2);
    if (!midSpoken && elapsed >= half && elapsed <= half + 2) {
      midSpoken = true;
      Voice.speakGuide(MIDPOINT_CUES[Math.floor(Math.random() * MIDPOINT_CUES.length)]);
    }

    // Final minute cue
    if (!finSpoken && rem <= 60 && rem > 57) {
      finSpoken = true;
      Voice.speakGuide(FINAL_MIN_CUES[Math.floor(Math.random() * FINAL_MIN_CUES.length)]);
    }

    // Last 15 seconds — graceful ending sequence
    if (!ending && rem <= 15 && rem > 0) {
      ending = true;
      beginEnding();
    }

    if (elapsed >= sessDur) end();
  }

  function skipForward() {
    elapsed = Math.min(elapsed + 15, sessDur);
    updateTimerDisplay();
    updateArc(elapsed / sessDur);
  }

  // ── Affirmations ──────────────────────────────────────────
  function deliverNextAffirm() {
    if (!playing || ending || affIdx >= affList.length) return;

    const text = affList[affIdx];
    affIdx++;

    // Visual
    showAffirmVisual(text);

    // Voice — motherly tone
    Voice.speakAffirm(text);

    // Schedule next affirmation
    if (affIdx < affList.length) {
      affIv = setTimeout(deliverNextAffirm, affirmInterval * 1000);
    }
  }

  function showAffirmVisual(text) {
    const el = document.getElementById('affirmTxt');
    el.classList.remove('vis');
    setTimeout(() => {
      el.textContent = text;
      el.classList.add('vis');
    }, 400);
  }

  // ── Graceful ending (last 15 seconds) ─────────────────────
  function beginEnding() {
    // Fade audio out over 12 seconds
    Audio.fadeOut(12, null);

    // Speak closing message
    const closeCue = CLOSE_CUES[Math.floor(Math.random() * CLOSE_CUES.length)];
    Voice.speakGuide(closeCue);
  }

  // ── Session end ───────────────────────────────────────────
  function end() {
    pause();
    document.getElementById('sStatus').textContent = 'SESSION COMPLETE';

    // Closing breath then thank you
    setTimeout(() => {
      Voice.speakThen(CLOSING_BREATH, { rate: 0.73 }, () => {
        // Show reflection box
        document.getElementById('reflectBox').style.display = 'block';

        // Speak reflection question
        const rq = document.getElementById('reflectQ').textContent;
        setTimeout(() => Voice.speakGuide(rq), 1500);
      }, 10000);
    }, 2000);
  }

  // ── Arc and timer display ─────────────────────────────────
  function updateTimerDisplay() {
    const rem = sessDur - elapsed;
    const m = String(Math.floor(rem / 60)).padStart(2, '0');
    const s = String(rem % 60).padStart(2, '0');
    document.getElementById('timerLbl').textContent = m + ':' + s;
  }

  function updateArc(frac) {
    const el = document.querySelector('.arc-fill');
    if (el) el.style.strokeDashoffset = 188 * (1 - frac);
  }

  return { init, start, pause, toggle, reset, setDuration, skipForward };
})();
