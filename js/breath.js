// ============================================================
// ZENTOR — breath.js
// Breathwork gate (pre-session) + standalone breathwork.
// Uses Voice MP3 engine for all audio cues.
// ============================================================

'use strict';

// ── BREATHWORK GATE ───────────────────────────────────────

const BreathGate = (() => {
  let proto = 'calm';
  let cycles = 5;
  let round = 0;
  let phaseIdx = 0;
  let running = false;
  let paused = false;
  let iv = null;

  function setProto(key) {
    proto = key;
    document.querySelectorAll('[id^="pb-"]').forEach(e => e.classList.remove('active'));
    document.getElementById('pb-' + key).classList.add('active');
    refresh();
  }

  function setCycles(n) {
    cycles = n;
    document.querySelectorAll('#bCycleBtns .cbtn').forEach(b =>
      b.classList.toggle('active', parseInt(b.textContent) === n)
    );
    refresh();
  }

  function refresh() {
    const p = PROTOS[proto];
    document.getElementById('bOrb').className = 'orb ' + p.color;
    document.getElementById('bCue').textContent = 'Ready when you are';
    document.getElementById('bCount').textContent = '';
    document.getElementById('bSub').textContent = p.label + ' · ' + cycles + ' rounds';
    buildDots('bDots', cycles);
  }

  function start() {
    document.getElementById('bStartBtn').style.display = 'none';
    document.getElementById('bPauseBtn').style.display = 'inline-block';
    document.getElementById('skipLnk').style.display   = 'block';
    document.getElementById('bProtoRow').style.opacity = '0.4';
    document.getElementById('bProtoRow').style.pointerEvents = 'none';
    document.getElementById('bCycleWrap').style.opacity = '0.4';
    document.getElementById('bCycleWrap').style.pointerEvents = 'none';

    running = true; paused = false;
    round = 0; phaseIdx = 0;

    // Manifest is loaded by this point (loading screen ensured it)
    // Play intro — then start phases. 6s max in case audio is slow.
    let started = false;
    const begin = () => { if (!started) { started = true; runPhase(); } };
    Voice.intro(proto, begin, 6000);
  }

  function pauseResume() {
    const btn = document.getElementById('bPauseBtn');
    if (paused) {
      paused = false; btn.textContent = 'Pause';
      runPhase();
    } else {
      paused = true; clearInterval(iv); Voice.stop();
      btn.textContent = 'Resume';
      document.getElementById('bCue').textContent = 'Paused';
      document.getElementById('bCount').textContent = '';
    }
  }

  function runPhase() {
    if (!running || paused) return;
    const p = PROTOS[proto];

    if (round >= cycles) { finish(); return; }

    updateDots('bDots', round, cycles);
    const ph = p.phases[phaseIdx];
    const orb = document.getElementById('bOrb');

    // Set CSS animation vars
    ['id','ed','hd','h2d'].forEach(v =>
      document.documentElement.style.setProperty('--' + v, ph.dur + 's')
    );
    orb.className = 'orb ' + p.color + ' ' + ph.anim;
    document.getElementById('bCue').textContent = ph.cue;

    // Voice cues
    if (phaseIdx === 0) {
      Voice.round(proto, round);
      setTimeout(() => { if (!paused) Voice.phase(ph.anim); }, 1600);
    } else {
      Voice.phase(ph.anim);
    }

    // Countdown
    let cnt = ph.dur;
    document.getElementById('bCount').textContent = cnt;
    clearInterval(iv);
    iv = setInterval(() => {
      if (paused) return;
      cnt--;
      document.getElementById('bCount').textContent = cnt > 0 ? cnt : '';
      if (cnt <= 0) {
        clearInterval(iv);
        phaseIdx++;
        if (phaseIdx >= p.phases.length) { phaseIdx = 0; round++; }
        setTimeout(runPhase, 600);
      }
    }, 1000);
  }

  function finish() {
    clearInterval(iv); running = false;
    const p = PROTOS[proto];

    for (let i = 0; i < cycles; i++) {
      const d = document.getElementById('bDotsd' + i);
      if (d) d.className = 'dot done';
    }
    document.getElementById('bOrb').className = 'orb ' + p.color;
    document.getElementById('bCue').textContent = 'Well done';
    document.getElementById('bCount').textContent = '';
    document.getElementById('bSub').textContent = 'Your nervous system is ready';

    // Play done cue → transition → auto-start session
    Voice.done(proto, () => {
      showScreen('sScreen');
      setTimeout(() => Session.start(), 800);
    }, 7000);
  }

  function skip() {
    clearInterval(iv); running = false; Voice.stop();
    showScreen('sScreen');
  }

  return { setProto, setCycles, start, pauseResume, skip };
})();

// ── STANDALONE BREATHWORK ─────────────────────────────────

const BreathStandalone = (() => {
  let proto = 'calm';
  let cycles = 5;
  let round = 0;
  let phaseIdx = 0;
  let running = false;
  let paused = false;
  let iv = null;

  function selectProto(key) {
    proto = key;
    document.querySelectorAll('[id^="bwpb-"]').forEach(e => e.classList.remove('active'));
    document.getElementById('bwpb-' + key).classList.add('active');
    const p = PROTOS[key];
    document.getElementById('bwOrb').className = 'orb ' + p.color;
    document.getElementById('bwCue').textContent = 'Choose your practice';
    document.getElementById('bwCount').textContent = '';
    document.getElementById('bwSub').textContent = '';
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
    btn.textContent = 'Pause'; btn.onclick = togglePause;

    let started = false;
    function beginPhase() {
      if (started) return;
      started = true;
      runPhase();
    }
    Voice.intro(proto, beginPhase, 5000);
    setTimeout(beginPhase, 5000);
  }

  function togglePause() {
    const btn = document.getElementById('bwStartBtn');
    if (paused) {
      paused = false; btn.textContent = 'Pause'; runPhase();
    } else {
      paused = true; clearInterval(iv); Voice.stop();
      btn.textContent = 'Resume';
      document.getElementById('bwCue').textContent = 'Paused';
      document.getElementById('bwCount').textContent = '';
    }
  }

  function stop() {
    running = false; paused = false; clearInterval(iv); Voice.stop();
    const btn = document.getElementById('bwStartBtn');
    btn.textContent = 'Begin'; btn.onclick = start;
    const p = PROTOS[proto];
    document.getElementById('bwOrb').className = 'orb ' + p.color;
    document.getElementById('bwCue').textContent = 'Choose your practice';
    document.getElementById('bwCount').textContent = '';
    document.getElementById('bwSub').textContent = '';
    buildDots('bwDots', cycles);
  }

  function runPhase() {
    if (!running || paused) return;
    const p = PROTOS[proto];

    if (round >= cycles) {
      for (let i = 0; i < cycles; i++) {
        const d = document.getElementById('bwDotsd' + i);
        if (d) d.className = 'dot done';
      }
      document.getElementById('bwCue').textContent = 'Complete';
      document.getElementById('bwCount').textContent = '';
      document.getElementById('bwSub').textContent = 'Well done';
      const btn = document.getElementById('bwStartBtn');
      btn.textContent = 'Again'; btn.onclick = start;
      Voice.bwComplete();
      return;
    }

    updateDots('bwDots', round, cycles);
    const ph = p.phases[phaseIdx];
    const orb = document.getElementById('bwOrb');

    ['id','ed','hd','h2d'].forEach(v =>
      document.documentElement.style.setProperty('--' + v, ph.dur + 's')
    );
    orb.className = 'orb ' + p.color + ' ' + ph.anim;
    document.getElementById('bwCue').textContent = ph.cue;

    if (phaseIdx === 0) {
      Voice.round(proto, round);
      setTimeout(() => { if (!paused) Voice.phase(ph.anim); }, 1600);
    } else {
      Voice.phase(ph.anim);
    }

    let cnt = ph.dur;
    document.getElementById('bwCount').textContent = cnt;
    clearInterval(iv);
    iv = setInterval(() => {
      if (paused) return;
      cnt--;
      document.getElementById('bwCount').textContent = cnt > 0 ? cnt : '';
      if (cnt <= 0) {
        clearInterval(iv);
        phaseIdx++;
        if (phaseIdx >= p.phases.length) { phaseIdx = 0; round++; }
        setTimeout(runPhase, 600);
      }
    }, 1000);
  }

  return { selectProto, setCycles, start, stop };
})();

// ── Shared dot helpers ────────────────────────────────────

function buildDots(containerId, n) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    d.id = containerId + 'd' + i;
    el.appendChild(d);
  }
}

function updateDots(prefix, round, total) {
  for (let i = 0; i < total; i++) {
    const d = document.getElementById(prefix + 'd' + i);
    if (!d) continue;
    d.className = 'dot' + (i < round ? ' done' : i === round ? ' active' : '');
  }
}
