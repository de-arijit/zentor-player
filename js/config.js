// ============================================================
// config.js — all constants. Loaded first.
// ============================================================
'use strict';

const FREQS = {
  delta:{ beat:2,  base:150, name:'Delta', hz:'2 Hz',  label:'Deep Healing',        proto:'calm'  },
  theta:{ beat:6,  base:180, name:'Theta', hz:'6 Hz',  label:'Deep Manifestation',  proto:'calm'  },
  alpha:{ beat:10, base:200, name:'Alpha', hz:'10 Hz', label:'Relaxed Focus',        proto:'focus' },
  beta: { beat:18, base:220, name:'Beta',  hz:'18 Hz', label:'Active Achievement',   proto:'focus' },
  gamma:{ beat:40, base:240, name:'Gamma', hz:'40 Hz', label:'Peak Performance',     proto:'focus' },
};

const PROTOS = {
  calm: {
    color:'c-calm', label:'4:8 Extended Exhale', defCycles:5,
    phases:[
      {cue:'Breathe in',  dur:4, anim:'inhale', voiceKey:'breathe_in'},
      {cue:'Breathe out', dur:8, anim:'exhale', voiceKey:'breathe_out'},
    ],
    roundKeys:['calm_r1','calm_r2','calm_r3','calm_r4','calm_r5','calm_r5','calm_r5','calm_r5','calm_r5','calm_r5'],
    introKey:'intro_calm', doneKey:'done_calm',
  },
  focus:{
    color:'c-focus', label:'Box Breathing 4-4-4-4', defCycles:5,
    phases:[
      {cue:'Breathe in',  dur:4, anim:'inhale', voiceKey:'breathe_in'},
      {cue:'Hold',        dur:4, anim:'hold',   voiceKey:'hold'},
      {cue:'Breathe out', dur:4, anim:'exhale', voiceKey:'breathe_out'},
      {cue:'Hold',        dur:4, anim:'hold2',  voiceKey:'hold'},
    ],
    roundKeys:['focus_r1','focus_r2','focus_r3','focus_r4','focus_r5','focus_r5','focus_r5','focus_r5','focus_r5','focus_r5'],
    introKey:'intro_focus', doneKey:'done_focus',
  },
  reset:{
    color:'c-reset', label:'Physiological Sigh', defCycles:3,
    phases:[
      {cue:'Inhale',      dur:2, anim:'inhale', voiceKey:'breathe_in'},
      {cue:'Top up',      dur:1, anim:'inhale', voiceKey:'top_up'},
      {cue:'Breathe out', dur:8, anim:'exhale', voiceKey:'breathe_out'},
    ],
    roundKeys:['reset_r1','reset_r2','reset_r3'],
    introKey:'intro_reset', doneKey:'done_reset',
  },
};

const DEFAULT_AFFS = {
  theta:["There was a moment I held my ground — and the room shifted toward me","I am learning to let my nervous system lead before my story does","What I release today, I no longer carry forward"],
  alpha:["I have navigated difficulty before and arrived on the other side","I am building the capacity to stay present under pressure","My calm is not performed — it is practised"],
  gamma:["The version of me I am rehearsing is already real","I act from the new belief even before it feels fully natural","Each action that contradicts the old story rewrites it"],
  delta:["I give my nervous system complete permission to rest","Sleep is not absence — it is the work continuing without me","I release this day completely"],
  beta: ["My focus is a trained capacity, not a mood","I bring deliberate attention to what matters most","Clarity comes from regulation, not from force"],
};

const SESSION_OPEN_KEYS = {
  delta:'open_delta', theta:'open_theta', alpha:'open_alpha', beta:'open_beta', gamma:'open_gamma',
};

function getAffirmCount(durationMins, rewirePhase) {
  if (rewirePhase === 'regulate') return 1;
  if (rewirePhase === 'witness')  return 1;
  if (rewirePhase === 'introduce')return 2;
  if (rewirePhase === 'rehearse') return 3;
  if (rewirePhase === 'embody')   return 4;
  if (durationMins <= 10) return 1;
  if (durationMins <= 20) return 2;
  if (durationMins <= 40) return 3;
  return 4;
}

function getAffirmInterval(durationMins, count) {
  return Math.floor((durationMins * 60 * 0.70) / Math.max(count, 1));
}
