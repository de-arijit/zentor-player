// ============================================================
// app.js — entry point, URL params, loading screen, routing
// Load order: config → voice → audio → breath → session → app
// ============================================================
'use strict';

// ── URL params ────────────────────────────────────────────
const P = new URLSearchParams(location.search);

window.APP = {
  mode:        P.get('mode')  || 'session',
  freqKey:     P.get('freq')  || 'theta',
  durMins:     Math.max(20, parseInt(P.get('dur') || '20')),
  title:       decodeURIComponent(P.get('title') || 'Your Session'),
  rewirePhase: P.get('phase') || 'regulate',
  skipBreath:  P.get('skip_breath') === '1',
  rq:          P.get('rq')
               ? decodeURIComponent(P.get('rq'))
               : 'What did you notice in your body during this session?',
  affs: (() => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const au = P.get('au' + i);
      const a  = P.get('a'  + i);
      if      (au) list.push({ type:'audio', url: au });
      else if (a)  list.push({ type:'text',  text: decodeURIComponent(a) });
    }
    return list;
  })(),
  // GitHub Pages base — same origin, no trailing slash
  audioBase: (() => {
    const loc = window.location;
    const path = loc.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    return loc.origin + path;
  })(),
};

// ── Global screen switcher (used by breath.js, session.js) ─
function APP_showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── Init on load ──────────────────────────────────────────
window.addEventListener('load', () => {
  const app = window.APP;

  // Show loading screen immediately
  APP_showScreen('loadScreen');

  // Animate loading status text
  const statuses = ['Loading audio...', 'Preparing your session...', 'Almost ready...'];
  let si = 0;
  const statusIv = setInterval(() => {
    si++;
    const el = document.getElementById('loadStatus');
    if (el && si < statuses.length) el.textContent = statuses[si];
  }, 1500);

  // Init session display (doesn't need audio)
  const freq = FREQS[app.freqKey] || FREQS.theta;
  _setText('badgeTxt', freq.name.toUpperCase() + ' · ' + freq.hz + ' · ' + freq.label);
  _setText('sTitle',   app.title);
  _setText('reflectQ', app.rq);
  Session.init(app.durMins, app.freqKey, app.affs, app.rewirePhase);

  // Wire volume slider
  const volR = document.getElementById('volR');
  if (volR) {
    volR.addEventListener('input', function() {
      const v = parseInt(this.value);
      Audio.setVolume(v);
      Voice.setVol(v);
      _setText('volNum', v);
      this.style.setProperty('--pct', v + '%');
    });
    volR.style.setProperty('--pct', '70%');
  }

  // Init Voice — loads manifest — then route
  // Enforce minimum 2s on loading screen so user actually sees it
  const loadStart = Date.now();
  Voice.init(app.audioBase, () => {
    clearInterval(statusIv);
    _setText('loadStatus', 'Ready ✓');
    const elapsed = Date.now() - loadStart;
    const remaining = Math.max(0, 2000 - elapsed);
    setTimeout(() => _route(), remaining + 600);
  });

  // Hard safety net — proceed after 10s regardless
  setTimeout(() => {
    if (document.getElementById('loadScreen').classList.contains('active')) {
      clearInterval(statusIv);
      _setText('loadStatus', 'Ready ✓');
      setTimeout(() => _route(), 400);
    }
  }, 10000);
});

// ── Route to correct first screen ─────────────────────────
function _route() {
  const app = window.APP;
  const proto = (FREQS[app.freqKey] || FREQS.theta).proto;

  if (app.mode === 'breathe') {
    APP_showScreen('bwScreen');
    return;
  }
  if (app.mode === 'reset') {
    BreathGate.setProto('reset');
    APP_showScreen('bScreen');
    return;
  }
  if (app.skipBreath) {
    APP_showScreen('sScreen');
    return;
  }

  // Default — breathwork gate
  BreathGate.setProto(proto);
  APP_showScreen('bScreen');
}

// ── Shared text helper (also used by breath.js / session.js) ─
function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
