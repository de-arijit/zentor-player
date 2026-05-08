// app.js — entry point, URL params, loading screen, routing
'use strict';

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
  audioKeys: (() => {
    const keys = [];
    for (let i = 0; i < 5; i++) {
      const k = P.get('akey' + i);
      if (k) keys.push(k);
    }
    return keys;
  })(),
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
  audioBase: (() => {
    const loc  = window.location;
    const path = loc.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    return loc.origin + path;
  })(),
};

function APP_showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

window.addEventListener('load', () => {
  const app = window.APP;

  // Apply frequency class to body — drives all CSS colour tokens
  document.body.className = 'freq-' + (app.freqKey || 'theta');

  // Init session display
  const freq = FREQS[app.freqKey] || FREQS.theta;
  _setText('badgeTxt', freq.name.toUpperCase() + ' · ' + freq.hz + ' · ' + freq.label);
  _setText('sTitle',   app.title);
  _setText('reflectQ', app.rq);
  Session.init(app.durMins, app.freqKey, app.affs, app.rewirePhase);

  // Volume slider
  const volR = document.getElementById('volR');
  if (volR) {
    volR.addEventListener('input', function() {
      const v = parseInt(this.value);
      Audio.setVolume(v); Voice.setVol(v);
      _setText('volNum', v);
      this.style.setProperty('--pct', v + '%');
    });
    volR.style.setProperty('--pct', '70%');
  }

  // Tap session screen to reveal controls
  const sScreen = document.getElementById('sScreen');
  if (sScreen) {
    sScreen.addEventListener('click', e => {
      // Don't trigger on button taps
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return;
      Session.handleScreenTap();
    });
  }

  const hasAudio    = app.affs.some(a => a.type === 'audio');
  const hasAudioKeys = app.audioKeys.length > 0;

  if (hasAudio) {
    Voice.init(app.audioBase, null);
    _routeToBreath();
    return;
  }

  APP_showScreen('loadScreen');

  if (hasAudioKeys) {
    _setText('loadStatus', 'Setting up your session...');
    Voice.init(app.audioBase, () => {
      _pollForAudio(app.audioKeys, app.audioBase, () => {
        app.affs = app.audioKeys.map(k => ({
          type: 'audio',
          url:  `${app.audioBase}/audio/${k}`
        }));
        Session.init(app.durMins, app.freqKey, app.affs, app.rewirePhase);
        _routeToBreath();
      });
    });
  } else {
    const statuses = ['Loading audio...', 'Preparing your session...', 'Almost ready...'];
    let si = 0;
    const iv = setInterval(() => {
      si++;
      const el = document.getElementById('loadStatus');
      if (el && si < statuses.length) el.textContent = statuses[si];
    }, 1500);

    const t0 = Date.now();
    Voice.init(app.audioBase, () => {
      clearInterval(iv);
      _setText('loadStatus', 'Ready ✓');
      const wait = Math.max(0, 2000 - (Date.now() - t0));
      setTimeout(_routeToBreath, wait + 500);
    });
    setTimeout(() => {
      if (document.getElementById('loadScreen').classList.contains('active')) {
        clearInterval(iv);
        _routeToBreath();
      }
    }, 10000);
  }
});

function _pollForAudio(keys, base, onReady) {
  let attempts = 0;
  const check = async () => {
    attempts++;
    try {
      const checks = await Promise.all(
        keys.map(k => fetch(`${base}/audio/${k}`, {method:'HEAD'}).then(r=>r.ok).catch(()=>false))
      );
      if (checks.every(Boolean)) { onReady(); return; }
      if (attempts < 15) setTimeout(check, 2000); else onReady();
    } catch(e) {
      if (attempts < 15) setTimeout(check, 2000); else onReady();
    }
  };
  check();
}

function _routeToBreath() {
  const app   = window.APP;
  const proto = (FREQS[app.freqKey] || FREQS.theta).proto;
  if (app.mode === 'breathe') { APP_showScreen('bwScreen'); return; }
  if (app.mode === 'reset')   { BreathGate.setProto('reset'); APP_showScreen('bScreen'); return; }
  if (app.skipBreath)         { APP_showScreen('sScreen'); return; }
  BreathGate.setProto(proto);
  APP_showScreen('bScreen');
}
