// ============================================================
// ZENTOR — app.js
// Entry point. URL params. Screen routing. Global helpers.
// ============================================================

'use strict';

// ── URL params ────────────────────────────────────────────
const P = new URLSearchParams(location.search);

// Global app state — shared across modules
window.APP = {
  mode:        P.get('mode')  || 'session',  // session | breathe | reset
  freqKey:     P.get('freq')  || 'theta',
  durMins:     parseInt(P.get('dur') || '20'),
  title:       decodeURIComponent(P.get('title') || 'Your Session'),
  affs:        [0,1,2,3,4].map(i => P.get('a'+i)).filter(Boolean),
  rewirePhase: P.get('phase') || 'regulate',
  skipBreath:  P.get('skip_breath') === '1',
  rq:          P.get('rq') ? decodeURIComponent(P.get('rq'))
               : 'What did you notice in your body — not your mind — during this session?',
};

// ── Screen routing ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Init ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  const app = window.APP;

  // Voice engine
  Voice.init();
  Voice.populateSelect();

  // Session init
  const freq = FREQS[app.freqKey] || FREQS.theta;
  document.getElementById('badgeTxt').textContent =
    `${freq.name.toUpperCase()} · ${freq.hz} · ${freq.label}`;
  document.getElementById('sTitle').textContent = app.title;
  document.getElementById('reflectQ').textContent = app.rq;

  Session.init(app.durMins, app.freqKey, app.affs, app.rewirePhase);

  // Volume slider
  document.getElementById('volR').addEventListener('input', function() {
    Audio.setVolume(parseInt(this.value));
    document.getElementById('volNum').textContent = this.value;
    this.style.setProperty('--pct', this.value + '%');
  });
  document.getElementById('volR').style.setProperty('--pct', '70%');

  // Route to correct screen
  if (app.mode === 'breathe') {
    showScreen('bwScreen');
    return;
  }
  if (app.mode === 'reset') {
    BreathGate.setProto('reset');
    showScreen('bScreen');
    return;
  }
  if (app.skipBreath) {
    showScreen('sScreen');
    return;
  }

  // Default: breathwork gate first
  showScreen('bScreen');
  // Set protocol based on frequency
  const proto = (FREQS[app.freqKey] || FREQS.theta).proto;
  BreathGate.setProto(proto);
});
