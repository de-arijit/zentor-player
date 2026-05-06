// ============================================================
// ZENTOR — session.js
// Session player: timer, audio, affirmations, graceful ending
// ============================================================

'use strict';

const Session = (() => {
  let playing = false;
  let elapsed = 0;
  let sessDur = 20 * 60;
  let tIv = null;
  let midSpoken = false;
  let finSpoken = false;
  let ending = false;

  // Affirmation state
  let affs = [];         // [{type:'audio',url} | {type:'text',text}]
  let affIdx = 0;
  let affTimeout = null;
  let affInterval = 0;

  // ── Init ──────────────────────────────────────────────────
  function init(durationMins, freqKey, affList, rewirePhase) {
    sessDur = Math.max(20, durationMins || 20) * 60;
    elapsed = 0; ending = false; affIdx = 0;

    // Use passed affirmations or defaults
    const defaults = (DEFAULT_AFFS[freqKey] || DEFAULT_AFFS.theta)
      .map(t => ({ type: 'text', text: t }));
    affs = (affList && affList.length) ? affList : defaults;

    // Trim to correct count based on phase + duration
    const count = getAffirmCount(durationMins || 20, rewirePhase || 'regulate');
    affs = affs.slice(0, count);
    affInterval = getAffirmInterval(durationMins || 20, affs.length);

    updateTimerDisplay();
    updateArc(0);

    // Highlight correct duration button
    document.querySelectorAll('.dur-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.textContent) === (durationMins || 20));
    });
  }

  // ── Play / Pause ──────────────────────────────────────────
  function start() {
    if (playing) return;
    playing = true; midSpoken = false; finSpoken = false; ending = false;

    document.getElementById('playIco').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    document.getElementById('sOrb').className = 'orb session';
    document.getElementById('sStatus').textContent = 'SESSION ACTIVE';
    document.getElementById('wform').classList.add('playing');

    Audio.start(window.APP.freqKey);
    tIv = setInterval(tick, 1000);

    // First affirmation at 20% through session
    const firstDelay = Math.floor(sessDur * 0.20) * 1000;
    affTimeout = setTimeout(deliverAffirm, firstDelay);

    // Session open cue
    setTimeout(() => Voice.sessionOpen(window.APP.freqKey), 1200);
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
    clearTimeout(affTimeout);
    Voice.stop();
  }

  function toggle() { playing ? pause() : start(); }

  function reset() {
    pause();
    elapsed = 0; midSpoken = false; finSpoken = false;
    ending = false; affIdx = 0;
    updateTimerDisplay(); updateArc(0);
    document.getElementById('sStatus').textContent = 'READY';
    document.getElementById('reflectBox').style.display = 'none';
  }

  // ── Duration buttons ──────────────────────────────────────
  function setDuration(mins, btn) {
    const wasPlaying = playing;
    if (wasPlaying) pause();

    sessDur = Math.max(20, mins) * 60;
    elapsed = 0; midSpoken = false; finSpoken = false;
    affIdx = 0;

    // Recalculate affirmation timing
    const rewirePhase = window.APP ? window.APP.rewirePhase : 'regulate';
    const count = getAffirmCount(mins, rewirePhase);
    const src = (window.APP && window.APP.affs.length) ? window.APP.affs
      : (DEFAULT_AFFS[window.APP.freqKey] || DEFAULT_AFFS.theta).map(t => ({ type:'text', text:t }));
    affs = src.slice(0, count);
    affInterval = getAffirmInterval(mins, affs.length);

    updateTimerDisplay(); updateArc(0);
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
    const half = Math.floor(sessDur / 2);

    if (!midSpoken && elapsed >= half && elapsed <= half + 2) {
      midSpoken = true;
      Voice.midpoint();
    }
    if (!finSpoken && rem <= 60 && rem > 57) {
      finSpoken = true;
      Voice.finalMin();
    }
    if (!ending && rem <= 15 && rem > 0) {
      ending = true;
      beginEnding();
    }
    if (elapsed >= sessDur) end();
  }

  function skipForward() {
    elapsed = Math.min(elapsed + 15, sessDur);
    updateTimerDisplay(); updateArc(elapsed / sessDur);
  }

  // ── Affirmations ──────────────────────────────────────────
  function deliverAffirm() {
    if (!playing || ending || affIdx >= affs.length) return;

    const aff = affs[affIdx];
    affIdx++;

    // Visual display
    showAffirmVisual(aff.type === 'text' ? aff.text : '✦');

    // Audio
    if (aff.type === 'audio' && aff.url) {
      Voice.affirmation(aff.url);
    }

    // Schedule next
    if (affIdx < affs.length) {
      affTimeout = setTimeout(deliverAffirm, affInterval * 1000);
    }
  }

  function showAffirmVisual(text) {
    const el = document.getElementById('affirmTxt');
    el.classList.remove('vis');
    setTimeout(() => { el.textContent = text; el.classList.add('vis'); }, 400);
  }

  // ── Graceful ending ───────────────────────────────────────
  function beginEnding() {
    // Fade audio over 12 seconds
    Audio.fadeOut(12, null);
    // Speak closing message
    Voice.close(null);
  }

  function end() {
    pause();
    document.getElementById('sStatus').textContent = 'SESSION COMPLETE';

    // Closing breath → show reflection
    setTimeout(() => {
      Voice.closingBreath(() => {
        document.getElementById('reflectBox').style.display = 'block';
        const rq = document.getElementById('reflectQ').textContent;
        // Speak reflection question after a pause
        setTimeout(() => {
          // Text-to-audio for reflection question not pre-generated
          // Display only — voice handled by future enhancement
        }, 1500);
      });
    }, 2000);
  }

  // ── Helpers ───────────────────────────────────────────────
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
