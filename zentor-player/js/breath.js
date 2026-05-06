// ============================================================
// ZENTOR — breath.js
// Breathwork gate (pre-session) + standalone breathwork screen
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
    document.getElementById('skipLnk').style.display = 'block';
    // Lock protocol and cycle selection during session
    document.getElementById('bProtoRow').style.pointerEvents = 'none';
    document.getElementById('bProtoRow').style.opacity = '0.4';
    document.getElementById('bCycleWrap').style.pointerEvents = 'none';
    document.getElementById('bCycleWrap').style.opacity = '0.4';

    running = true; paused = false;
    round = 0; phaseIdx = 0;

    // Speak intro → then start phases
    Voice.speakThen(PROTOS[proto].intro, { rate: 0.79 }, () => runPhase(), 4500);
  }

  function pauseResume() {
    const btn = document.getElementById('bPauseBtn');
    if (paused) {
      paused = false;
      btn.textContent = 'Pause';
      runPhase();
    } else {
      paused = true;
      clearInterval(iv);
      Voice.stop();
      btn.textContent = 'Resume';
      document.getElementById('bCue').textContent = 'Paused';
      document.getElementById('bCount').textContent = '';
    }
  }

  function runPhase() {
    if (!running || paused) return;
    const p = PROTOS[proto];

    if (round >= cycles) {
      finish();
      return;
    }

    updateDots('bDots', round, cycles);
    const ph = p.phases[phaseIdx];
    const orb = document.getElementById('bOrb');

    // Set animation duration CSS vars
    ['id','ed','hd','h2d'].forEach((v, i) => {
      document.documentElement.style.setProperty('--'+v, ph.dur+'s');
    });

    orb.className = 'orb ' + p.color + ' ' + ph.anim;
    document.getElementById('bCue').textContent = ph.cue;

    // Voice: round cue at start of round, phase cue for subsequent phases
    if (phaseIdx === 0) {
      Voice.speakRound(p.roundCues[round] || 'Round ' + (round + 1));
      setTimeout(() => {
        if (!paused) Voice.speakBreath(ph.cue);
      }, 1500);
    } else {
      Voice.speakBreath(ph.cue);
    }

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
    clearInterval(iv);
    running = false;
    const p = PROTOS[proto];

    // Mark all dots done
    for (let i = 0; i < cycles; i++) {
      const d = document.getElementById('bDotsd' + i);
      if (d) d.className = 'dot done';
    }
    document.getElementById('bOrb').className = 'orb ' + p.color;
    document.getElementById('bCue').textContent = 'Well done';
    document.getElementById('bCount').textContent = '';
    document.getElementById('bSub').textContent = 'Your nervous system is ready';

    // Speak done cue → transition to session → auto-play
    Voice.speakThen(p.doneCue, { rate: 0.77 }, () => {
      showScreen('sScreen');
      setTimeout(() => Session.start(), 800);
    }, 6000);
  }

  function skip() {
    clearInterval(iv);
    running = false;
    Voice.stop();
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
    running = true; paused = false;
    round = 0; phaseIdx = 0;
    const btn = document.getElementById('bwStartBtn');
    btn.textContent = 'Pause'; btn.onclick = togglePause;
    Voice.speakThen(PROTOS[proto].intro, { rate: 0.79 }, () => runPhase(), 4500);
  }

  function togglePause() {
    const btn = document.getElementById('bwStartBtn');
    if (paused) {
      paused = false; btn.textContent = 'Pause';
      runPhase();
    } else {
      paused = true; clearInterval(iv); Voice.stop();
      btn.textContent = 'Resume';
      document.getElementById('bwCue').textContent = 'Paused';
      document.getElementById('bwCount').textContent = '';
    }
  }

  function stop() {
    running = false; paused = false;
    clearInterval(iv); Voice.stop();
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
      // Complete
      for (let i = 0; i < cycles; i++) {
        const d = document.getElementById('bwDotsd' + i);
        if (d) d.className = 'dot done';
      }
      document.getElementById('bwCue').textContent = 'Complete';
      document.getElementById('bwCount').textContent = '';
      document.getElementById('bwSub').textContent = 'Well done';
      const btn = document.getElementById('bwStartBtn');
      btn.textContent = 'Again'; btn.onclick = start;
      Voice.speakGuide('Complete. Notice the stillness in your body.');
      return;
    }

    updateDots('bwDots', round, cycles);
    const ph = p.phases[phaseIdx];
    const orb = document.getElementById('bwOrb');
    ['id','ed','hd','h2d'].forEach(v =>
      document.documentElement.style.setProperty('--'+v, ph.dur+'s')
    );
    orb.className = 'orb ' + p.color + ' ' + ph.anim;
    document.getElementById('bwCue').textContent = ph.cue;

    if (phaseIdx === 0) {
      Voice.speakRound(p.roundCues[round] || 'Round ' + (round + 1));
      setTimeout(() => { if (!paused) Voice.speakBreath(ph.cue); }, 1500);
    } else {
      Voice.speakBreath(ph.cue);
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
