// ============================================================
// ZENTOR — app.js
// Entry point. URL params. Screen routing. Init everything.
// ============================================================

'use strict';

// ── URL params ────────────────────────────────────────────
const P = new URLSearchParams(location.search);

window.APP = {
  mode:        P.get('mode')   || 'session',
  freqKey:     P.get('freq')   || 'theta',
  durMins:     Math.max(20, parseInt(P.get('dur') || '20')),
  title:       decodeURIComponent(P.get('title') || 'Your Session'),
  rewirePhase: P.get('phase')  || 'regulate',
  skipBreath:  P.get('skip_breath') === '1',
  rq:          P.get('rq')
               ? decodeURIComponent(P.get('rq'))
               : 'What did you notice in your body — not your mind — during this session?',

  // Affirmation audio URLs (au0, au1...) or text fallbacks (a0, a1...)
  affs: (() => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const audioUrl = P.get('au' + i);
      const text     = P.get('a'  + i);
      if (audioUrl) list.push({ type: 'audio', url: audioUrl });
      else if (text) list.push({ type: 'text', text: decodeURIComponent(text) });
    }
    return list;
  })(),

  // GitHub Pages base URL — same origin as this page
  audioBase: window.location.origin + window.location.pathname.replace('/index.html', ''),
};

// ── Screen router ─────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Init ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  const app = window.APP;

  // Init session UI
  const freq = FREQS[app.freqKey] || FREQS.theta;
  document.getElementById('badgeTxt').textContent =
    `${freq.name.toUpperCase()} · ${freq.hz} · ${freq.label}`;
  document.getElementById('sTitle').textContent   = app.title;
  document.getElementById('reflectQ').textContent = app.rq;

  Session.init(app.durMins, app.freqKey, app.affs, app.rewirePhase);

  // Volume slider
  const volR = document.getElementById('volR');
  volR.addEventListener('input', function() {
    const v = parseInt(this.value);
    Audio.setVolume(v);
    Voice.setVol(v);
    document.getElementById('volNum').textContent = v;
    this.style.setProperty('--pct', v + '%');
  });
  volR.style.setProperty('--pct', '70%');

  // Show loading screen, init voice, then route when ready
  showScreen('loadScreen');
  animateLoadDots();

  // Init voice with manifest — callback fires when ready
  Voice.init(app.audioBase, () => {
    document.getElementById('loadStatus').textContent = 'Ready';

    // Brief pause so user sees "Ready" before transition
    setTimeout(() => route(), 600);
  });

  // Safety net — if manifest takes too long, proceed anyway
  setTimeout(() => {
    if (document.getElementById('loadScreen').classList.contains('active')) {
      document.getElementById('loadStatus').textContent = 'Ready';
      setTimeout(() => route(), 400);
    }
  }, 8000);
});

function animateLoadDots() {
  const statuses = [
    'Loading audio...',
    'Preparing your session...',
    'Almost ready...',
  ];
  let i = 0;
  const iv = setInterval(() => {
    if (!document.getElementById('loadScreen').classList.contains('active')) {
      clearInterval(iv); return;
    }
    i++;
    const el = document.getElementById('loadStatus');
    if (el && i < statuses.length) el.textContent = statuses[i];
  }, 1800);
}

function route() {
  const app = window.APP;

  // Set breathwork protocol based on frequency
  const proto = (FREQS[app.freqKey] || FREQS.theta).proto;

  if (app.mode === 'breathe') { showScreen('bwScreen'); return; }
  if (app.mode === 'reset')   { BreathGate.setProto('reset'); showScreen('bScreen'); return; }
  if (app.skipBreath)         { showScreen('sScreen'); return; }

  // Default: breathwork gate
  BreathGate.setProto(proto);
  showScreen('bScreen');
}
