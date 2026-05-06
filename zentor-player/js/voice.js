// ============================================================
// ZENTOR — voice.js
// Voice engine using ResponsiveVoice
// Works reliably in Android Telegram WebView
// Dynamic text support — no pre-generation needed
// ============================================================

'use strict';

const Voice = (() => {
  let enabled = true;
  let ready = false;
  let voiceName = 'UK English Female'; // ResponsiveVoice voice name
  let baseRate = 0.80;

  // ResponsiveVoice voices available (best for meditation)
  const VOICE_OPTIONS = [
    'UK English Female',
    'US English Female',
    'Australian Female',
    'Indian Female',
  ];

  // ── Init ──────────────────────────────────────────────────
  function init() {
    // Wait for ResponsiveVoice to load
    const checkRV = setInterval(() => {
      if (window.responsiveVoice && responsiveVoice.voiceSupport()) {
        ready = true;
        clearInterval(checkRV);
        console.log('ResponsiveVoice ready');
      }
    }, 200);

    // Fallback: mark ready after 3s regardless
    setTimeout(() => {
      ready = true;
      clearInterval(checkRV);
    }, 3000);
  }

  // ── Core speak function ───────────────────────────────────
  function speak(text, opts = {}) {
    if (!enabled || !text) return;

    const rate   = opts.rate   || baseRate;
    const pitch  = opts.pitch  || 1.0;
    const volume = opts.volume || 0.92;
    const onEnd  = opts.onEnd  || null;

    if (window.responsiveVoice && ready) {
      responsiveVoice.cancel();
      responsiveVoice.speak(text, voiceName, {
        rate, pitch, volume,
        onend: onEnd || (() => {}),
        onerror: onEnd || (() => {}),
      });
    } else if (window.speechSynthesis) {
      // Fallback to Web Speech API
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.pitch = pitch; u.volume = volume;
      if (onEnd) u.onend = onEnd;
      speechSynthesis.speak(u);
    }
  }

  // ── Speak then callback (guaranteed) ─────────────────────
  // Calls cb after speech ends OR after maxWait ms — whichever first
  // Critical for breathing gate → session transition
  function speakThen(text, opts = {}, cb, maxWait = 5000) {
    if (!enabled || !text) {
      setTimeout(() => { if (cb) cb(); }, 300);
      return;
    }

    let called = false;
    const done = () => {
      if (called) return;
      called = true;
      if (cb) cb();
    };

    const rate   = opts.rate   || baseRate;
    const pitch  = opts.pitch  || 1.0;
    const volume = opts.volume || 0.92;

    if (window.responsiveVoice && ready) {
      responsiveVoice.cancel();
      responsiveVoice.speak(text, voiceName, {
        rate, pitch, volume,
        onend: done,
        onerror: done,
      });
    } else if (window.speechSynthesis) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.pitch = pitch; u.volume = volume;
      u.onend = done; u.onerror = done;
      speechSynthesis.speak(u);
    } else {
      setTimeout(done, 300);
      return;
    }

    // Guaranteed fallback
    setTimeout(done, maxWait);
  }

  // ── Affirmation voice — motherly: slower, warmer ──────────
  function speakAffirm(text) {
    speak(text, { rate: 0.70, pitch: 1.06, volume: 0.88 });
  }

  // ── Breathing phase cue voice ─────────────────────────────
  function speakBreath(text) {
    speak(text, { rate: 0.78, pitch: 1.0, volume: 0.90 });
  }

  // ── Round announcement voice ──────────────────────────────
  function speakRound(text) {
    speak(text, { rate: 0.84, pitch: 1.0, volume: 0.92 });
  }

  // ── Session guidance voice ────────────────────────────────
  function speakGuide(text) {
    speak(text, { rate: 0.76, pitch: 1.0, volume: 0.92 });
  }

  // ── Stop ─────────────────────────────────────────────────
  function stop() {
    try {
      if (window.responsiveVoice) responsiveVoice.cancel();
      if (window.speechSynthesis) speechSynthesis.cancel();
    } catch(e) {}
  }

  // ── Toggle on/off ─────────────────────────────────────────
  function toggle() {
    enabled = !enabled;
    if (!enabled) stop();
    const btn = document.getElementById('vtoggle');
    if (btn) btn.textContent = enabled ? '🔊' : '🔇';
    return enabled;
  }

  // ── Voice selector ────────────────────────────────────────
  function setVoice(name) {
    voiceName = name;
  }

  function populateSelect() {
    const sel = document.getElementById('vsel');
    if (!sel) return;
    sel.innerHTML = VOICE_OPTIONS.map(v =>
      `<option value="${v}" ${v === voiceName ? 'selected' : ''}>${v}</option>`
    ).join('');
  }

  function isEnabled() { return enabled; }

  return {
    init, speak, speakThen, speakAffirm,
    speakBreath, speakRound, speakGuide,
    stop, toggle, setVoice, populateSelect, isEnabled,
  };
})();
