// ============================================================
// ZENTOR — config.js
// All constants. One place. Import order: first.
// ============================================================

'use strict';

// ── Frequency configs ─────────────────────────────────────
const FREQS = {
  delta: { beat:2,  base:150, name:'Delta', hz:'2 Hz',  label:'Deep Healing',       proto:'calm',  color:'#4a9eff' },
  theta: { beat:6,  base:180, name:'Theta', hz:'6 Hz',  label:'Deep Manifestation', proto:'calm',  color:'#b06fff' },
  alpha: { beat:10, base:200, name:'Alpha', hz:'10 Hz', label:'Relaxed Focus',       proto:'focus', color:'#7bde8a' },
  beta:  { beat:18, base:220, name:'Beta',  hz:'18 Hz', label:'Active Achievement',  proto:'focus', color:'#5b4fff' },
  gamma: { beat:40, base:240, name:'Gamma', hz:'40 Hz', label:'Peak Performance',    proto:'focus', color:'#ff9f4a' },
};

// ── Breathwork protocol configs ───────────────────────────
const PROTOS = {
  calm: {
    color: 'c-calm',
    label: '4:8 Extended Exhale',
    defCycles: 5,
    intro: "Before your session, we will breathe together. This prepares your nervous system for the deeper work ahead. Follow the orb.",
    phases: [
      { cue:'Breathe in',  dur:4, anim:'inhale' },
      { cue:'Breathe out', dur:8, anim:'exhale' },
    ],
    roundCues: [
      "Round one. Breathe in slowly through your nose.",
      "Round two. Stay with it.",
      "Round three. You are doing beautifully.",
      "Round four. Almost there.",
      "Final round. Last one.",
      "Round six.", "Round seven.", "Round eight.", "Round nine.", "Round ten.",
    ],
    doneCue: "Your nervous system is ready. Your session will begin now. Close your eyes.",
  },
  focus: {
    color: 'c-focus',
    label: 'Box Breathing 4-4-4-4',
    defCycles: 5,
    intro: "Box breathing. In for four, hold for four, out for four, hold for four. Each round brings calm clarity. Follow the orb.",
    phases: [
      { cue:'Breathe in',  dur:4, anim:'inhale' },
      { cue:'Hold',        dur:4, anim:'hold'   },
      { cue:'Breathe out', dur:4, anim:'exhale' },
      { cue:'Hold',        dur:4, anim:'hold2'  },
    ],
    roundCues: [
      "Round one.", "Round two.", "Round three.", "Round four.", "Round five.",
      "Round six.", "Round seven.", "Round eight.", "Round nine.", "Round ten.",
    ],
    doneCue: "Balanced and clear. Closing your eyes as your session begins.",
  },
  reset: {
    color: 'c-reset',
    label: 'Physiological Sigh',
    defCycles: 3,
    intro: "Physiological sigh. Two short inhales through the nose, then one long slow exhale. The fastest way to calm your nervous system. Follow the orb.",
    phases: [
      { cue:'Inhale',      dur:2, anim:'inhale' },
      { cue:'Top up',      dur:1, anim:'inhale' },
      { cue:'Breathe out', dur:8, anim:'exhale' },
    ],
    roundCues: ["First sigh.", "Second sigh.", "Final sigh."],
    doneCue: "Good. The acute stress response is clearing. Your session begins now.",
  },
};

// ── Default affirmations per frequency ────────────────────
// These are fallbacks — Groq-generated ones from the bot take priority
const DEFAULT_AFFS = {
  theta: [
    "There was a moment I held my ground — and the room shifted toward me.",
    "I am learning to let my nervous system lead before my story does.",
    "What I release today, I no longer carry forward.",
    "The belief that kept me small is not mine — it was borrowed. I return it now.",
    "I am safe enough to be seen.",
  ],
  alpha: [
    "I have navigated difficulty before and arrived on the other side.",
    "I am building the capacity to stay present under pressure.",
    "My calm is not performed — it is practised.",
    "I trust the version of myself that showed up in the room and stayed.",
    "Presence is not something I perform. It is something I inhabit.",
  ],
  gamma: [
    "The version of me I am rehearsing is already real.",
    "I act from the new belief even before it feels fully natural.",
    "Each action that contradicts the old story rewrites it.",
    "I am not becoming someone else. I am becoming more fully myself.",
    "What I do today is evidence the brain will use tomorrow.",
  ],
  delta: [
    "I give my nervous system complete permission to rest.",
    "Sleep is not absence — it is the work continuing without me.",
    "I release this day completely.",
    "There is nothing to hold tonight. I let it all go.",
    "My body knows how to heal. I simply get out of the way.",
  ],
  beta: [
    "My focus is a trained capacity, not a mood.",
    "I bring deliberate attention to what matters most right now.",
    "Clarity comes from regulation, not from force.",
    "I choose where my attention goes. That choice is power.",
    "I am fully here. That is enough.",
  ],
};

// ── Session open cues (by frequency) ─────────────────────
const SESSION_OPEN = {
  delta: "Your session is beginning. Allow yourself to soften completely. There is nothing you need to do. Simply receive.",
  theta: "Your session is beginning. Close your eyes. The work happens beneath thought. Let your mind grow quiet.",
  alpha: "Your session is beginning. Settle into relaxed alertness. You are safe here. Simply stay present.",
  beta:  "Your session is beginning. Bring your full attention here, gently. Everything else can wait.",
  gamma: "Your session is beginning. You are rehearsing the version of yourself that is already real. Trust that.",
};

// ── Midpoint cues ─────────────────────────────────────────
const MIDPOINT_CUES = [
  "Halfway through. You are doing well. Stay with it.",
  "You are halfway there. Notice what has shifted since you began.",
  "Midpoint. Your nervous system has been in this state long enough for real work to be happening.",
];

// ── Final minute cues ─────────────────────────────────────
const FINAL_MIN_CUES = [
  "One minute remaining. Begin to bring your awareness gently back.",
  "Almost there. One last minute.",
  "Final minute. Stay present until the very end.",
];

// ── Closing cues ──────────────────────────────────────────
const CLOSE_CUES = [
  "Session complete. Take one slow breath before you move. Notice how you feel right now.",
  "That is your session. Rest here for a moment before you continue with your day.",
  "Well done. Notice the quality of your mind right now, compared to when you began.",
];

// ── Closing breath instruction ────────────────────────────
const CLOSING_BREATH = "One last breath together. Breathe in deeply... and breathe out slowly. Well done. Take your time returning.";

// ── Affirmation count formula ─────────────────────────────
// Returns how many affirmations to use based on session params
function getAffirmCount(durationMins, rewirePhase) {
  // Phase-based overrides
  if (rewirePhase === 'regulate') return 1;    // Keep it simple in Phase 1
  if (rewirePhase === 'witness')  return 1;    // One deep juxtaposition held long
  if (rewirePhase === 'introduce')return 2;    // Old + new held together
  if (rewirePhase === 'rehearse') return 3;    // Daily consolidation rhythm
  if (rewirePhase === 'embody')   return 4;    // More evidence accumulation

  // Duration-based defaults
  if (durationMins <= 10) return 1;
  if (durationMins <= 20) return 2;
  if (durationMins <= 40) return 3;
  return 4;
}

// ── Affirmation interval (seconds between each) ───────────
function getAffirmInterval(durationMins, affirmCount) {
  // Space them evenly across the session, starting at 20% in
  const usableSecs = durationMins * 60 * 0.7; // use 70% of session
  return Math.floor(usableSecs / affirmCount);
}
