// breath.js — breathwork gate + standalone breathwork.
'use strict';

const BreathGate = (() => {
  let proto = 'calm', cycles = 5;
  let round = 0, phaseIdx = 0;
  let running = false, paused = false;
  let iv = null;

  function setProto(key) {
    proto = key;
    document.querySelectorAll('[id^="pb-"]').forEach(e => e.classList.remove('active'));
    const b = document.getElementById('pb-' + key);
    if (b) b.classList.add('active');
    _refresh();
  }

  function setCycles(n) {
    cycles = n;
    document.querySelectorAll('#bCycleBtns .cbtn').forEach(b =>
      b.classList.toggle('active', parseInt(b.textContent) === n)
    );
    _refresh();
  }

  function _refresh() {
    const p = PROTOS[proto];
    const orb = document.getElementById('bOrb');
    if (orb) orb.className = 'orb ' + p.color;
    _setText('bCue', 'Ready when you are');
    _setText('bCount', '');
    _setText('bSub', p.label + ' · ' + cycles + ' rounds');
    buildDots('bDots', cycles);
  }

  // Called directly from onclick — IS the user gesture
  function start() {
    document.getElementById('bStartBtn').style.display = 'none';
    document.getElementById('bPauseBtn').style.display = 'inline-block';
    document.getElementById('skipLnk').style.display   = 'block';
    document.getElementById('bProtoRow').style.opacity = '0.4';
    document.getElementById('bProtoRow').style.pointerEvents = 'none';
    document.getElementById('bCycleWrap').style.opacity = '0.4';
    document.getElementById('bCycleWrap').style.pointerEvents = 'none';

    running = true; paused = false; round = 0; phaseIdx = 0;

    // Start immediately — don't wait for audio
    // Audio plays alongside, never blocks
    _runPhase();

    // Also try to play intro audio (fire and forget)
    Voice.intro(proto, null, 9000);
  }

  function pauseResume() {
    const btn = document.getElementById('bPauseBtn');
    if (paused) {
      paused = false; btn.textContent = 'Pause';
      _runPhase();
    } else {
      paused = true; clearInterval(iv); Voice.stop();
      btn.textContent = 'Resume';
      _setText('bCue', 'Paused');
      _setText('bCount', '');
    }
  }

  function skip() {
    clearInterval(iv); running = false; Voice.stop();
    APP_showScreen('sScreen');
  }

  function _runPhase() {
    if (!running || paused) return;
    const p = PROTOS[proto];
    if (round >= cycles) { _finish(); return; }

    _updateDots('bDots', round, cycles);
    const ph = p.phases[phaseIdx];
    const orb = document.getElementById('bOrb');
    const root = document.documentElement;

    // Set durations
    root.style.setProperty('--id',  ph.dur + 's');
    root.style.setProperty('--ed',  ph.dur + 's');
    root.style.setProperty('--hd',  ph.dur + 's');
    root.style.setProperty('--h2d', ph.dur + 's');

    // Force reflow to restart animation
    orb.className = 'orb ' + p.color;
    void orb.offsetWidth;
    orb.className = 'orb ' + p.color + ' ' + ph.anim;

    _setText('bCue', ph.cue);
    _setText('bCount', ph.dur);

    // Voice cues — fire and forget, never block
    if (phaseIdx === 0) {
      Voice.round(proto, round);
    }
    setTimeout(() => { if (!paused) Voice.phase(ph.voiceKey); }, 200);

    let cnt = ph.dur;
    clearInterval(iv);
    iv = setInterval(() => {
      if (paused) return;
      cnt--;
      _setText('bCount', cnt > 0 ? cnt : '');
      if (cnt <= 0) {
        clearInterval(iv);
        phaseIdx++;
        if (phaseIdx >= p.phases.length) { phaseIdx = 0; round++; }
        setTimeout(_runPhase, 500);
      }
    }, 1000);
  }

  function _finish() {
    clearInterval(iv); running = false;
    const p = PROTOS[proto];
    for (let i = 0; i < cycles; i++) {
      const d = document.getElementById('bDotsd' + i);
      if (d) d.className = 'dot done';
    }
    document.getElementById('bOrb').className = 'orb ' + p.color;
    _setText('bCue', 'Well done');
    _setText('bCount', '');
    _setText('bSub', 'Your nervous system is ready');

    // Transition after done audio or 7s max
    Voice.done(proto, _goToSession, 7000);
    setTimeout(_goToSession, 8000); // hard fallback
  }

  let _transitioning = false;
  function _goToSession() {
    if (_transitioning) return;
    _transitioning = true;
    APP_showScreen('sScreen');
    setTimeout(() => { Session.start(); _transitioning = false; }, 700);
  }

  return { setProto, setCycles, start, pauseResume, skip };
})();


// ── STANDALONE BREATHWORK ─────────────────────────────────
const BreathStandalone = (() => {
  let proto = 'calm', cycles = 5;
  let round = 0, phaseIdx = 0;
  let running = false, paused = false;
  let iv = null;

  function selectProto(key) {
    proto = key;
    document.querySelectorAll('[id^="bwpb-"]').forEach(e => e.classList.remove('active'));
    const b = document.getElementById('bwpb-' + key);
    if (b) b.classList.add('active');
    const p = PROTOS[key];
    document.getElementById('bwOrb').className = 'orb ' + p.color;
    _setText('bwCue', p.label);
    _setText('bwCount', '');
    _setText('bwSub', '');
    buildDots('bwDots', cycles);
  }

  function setCycles(n) {
    cycles = n;
    document.querySelectorAll('#bwCycleWrap .cbtn').forEach(b =>
      b.classList.toggle('active', parseInt(b.textContent) === n)
    );
    buildDots('bwDots', cycles);
  }

  function start() {
    running = true; paused = false; round = 0; phaseIdx = 0;
    const btn = document.getElementById('bwStartBtn');
    btn.textContent = 'Pause'; btn.onclick = _togglePause;
    _runPhase();
    Voice.intro(proto, null, 9000);
  }

  function _togglePause() {
    const btn = document.getElementById('bwStartBtn');
    if (paused) {
      paused = false; btn.textContent = 'Pause'; _runPhase();
    } else {
      paused = true; clearInterval(iv); Voice.stop();
      btn.textContent = 'Resume';
      _setText('bwCue', 'Paused'); _setText('bwCount', '');
    }
  }

  function stop() {
    running = false; paused = false; clearInterval(iv); Voice.stop();
    const btn = document.getElementById('bwStartBtn');
    btn.textContent = 'Begin'; btn.onclick = start;
    const p = PROTOS[proto];
    document.getElementById('bwOrb').className = 'orb ' + p.color;
    _setText('bwCue', p.label); _setText('bwCount', ''); _setText('bwSub', '');
    buildDots('bwDots', cycles);
  }

  function _runPhase() {
    if (!running || paused) return;
    const p = PROTOS[proto];
    if (round >= cycles) {
      for (let i=0;i<cycles;i++){
        const d=document.getElementById('bwDotsd'+i);if(d)d.className='dot done';
      }
      _setText('bwCue','Complete');_setText('bwCount','');_setText('bwSub','Well done');
      document.getElementById('bwStartBtn').textContent='Again';
      document.getElementById('bwStartBtn').onclick=start;
      Voice.bwComplete();
      return;
    }

    _updateDots('bwDots', round, cycles);
    const ph = p.phases[phaseIdx];
    const root = document.documentElement;
    root.style.setProperty('--id',ph.dur+'s');
    root.style.setProperty('--ed',ph.dur+'s');
    root.style.setProperty('--hd',ph.dur+'s');
    root.style.setProperty('--h2d',ph.dur+'s');

    const orb = document.getElementById('bwOrb');
    orb.className = 'orb ' + p.color;
    void orb.offsetWidth;
    orb.className = 'orb ' + p.color + ' ' + ph.anim;

    _setText('bwCue', ph.cue);
    _setText('bwCount', ph.dur);

    if (phaseIdx === 0) Voice.round(proto, round);
    setTimeout(() => { if (!paused) Voice.phase(ph.voiceKey); }, 200);

    let cnt = ph.dur;
    clearInterval(iv);
    iv = setInterval(() => {
      if (paused) return;
      cnt--; _setText('bwCount', cnt > 0 ? cnt : '');
      if (cnt <= 0) {
        clearInterval(iv); phaseIdx++;
        if (phaseIdx >= p.phases.length) { phaseIdx = 0; round++; }
        setTimeout(_runPhase, 500);
      }
    }, 1000);
  }

  return { selectProto, setCycles, start, stop };
})();


// ── Shared helpers (globals used by breath + session) ─────
function buildDots(id, n) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  for (let i=0; i<n; i++) {
    const d = document.createElement('div');
    d.className = 'dot'; d.id = id+'d'+i;
    el.appendChild(d);
  }
}

function _updateDots(prefix, round, total) {
  for (let i=0; i<total; i++) {
    const d = document.getElementById(prefix+'d'+i);
    if (!d) continue;
    d.className = 'dot'+(i<round?' done':i===round?' active':'');
  }
}
