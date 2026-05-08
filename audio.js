/* ============================================================
   ZENTOR — style.css — Hypnotic trance environment
   Frequency-based colours. Orb is the only moving element.
   Controls recede. Affirmations dissolve in full-screen.
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@100;200;300;400&family=DM+Mono:wght@300;400&display=swap');

:root {
  --void:  #020208;
  --text:  #e2ddf5;
  --muted: #4a4468;
  --gold:  #c8a84b;
  /* theta defaults */
  --fp:  #3d2fff;
  --fs:  #8b3fff;
  --fg:  rgba(61,47,255,.35);
  --fg2: rgba(139,63,255,.12);
  --fb1: rgba(31,15,80,.6);
  --fb2: rgba(8,4,28,.97);
}

.freq-delta{--fp:#1a1f8f;--fs:#0d0d4a;--fg:rgba(26,31,143,.3);--fg2:rgba(13,13,74,.1);--fb1:rgba(8,8,40,.8);--fb2:rgba(2,2,12,.99);}
.freq-theta{--fp:#3d2fff;--fs:#8b3fff;--fg:rgba(61,47,255,.35);--fg2:rgba(139,63,255,.12);--fb1:rgba(31,15,80,.6);--fb2:rgba(8,4,28,.97);}
.freq-alpha{--fp:#0fa89e;--fs:#0dd4c8;--fg:rgba(15,168,158,.3);--fg2:rgba(13,212,200,.1);--fb1:rgba(4,40,38,.7);--fb2:rgba(1,12,12,.97);}
.freq-beta {--fp:#1a6fff;--fs:#4da6ff;--fg:rgba(26,111,255,.3);--fg2:rgba(77,166,255,.1);--fb1:rgba(4,20,60,.7);--fb2:rgba(1,4,20,.97);}
.freq-gamma{--fp:#c87820;--fs:#f0a830;--fg:rgba(200,120,32,.3);--fg2:rgba(240,168,48,.1);--fb1:rgba(50,25,4,.7);--fb2:rgba(16,8,1,.97);}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}

html,body{
  height:100%;width:100%;
  background:var(--void);
  color:var(--text);
  font-family:'Jost',sans-serif;font-weight:200;
  overflow:hidden;
  -webkit-tap-highlight-color:transparent;
  user-select:none;
}

/* Breathing background */
body::before{
  content:'';position:fixed;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 20%,var(--fb1) 0%,transparent 65%),
    radial-gradient(ellipse 60% 70% at 80% 80%,var(--fg2) 0%,transparent 60%),
    var(--fb2);
  animation:bg-breathe 10s ease-in-out infinite;
  pointer-events:none;
  transition:background 2s ease;
}
@keyframes bg-breathe{0%,100%{opacity:.85}50%{opacity:1}}

/* Screens */
.screen{
  position:fixed;inset:0;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  z-index:1;padding:20px;
  opacity:0;pointer-events:none;
  transition:opacity .8s ease;
  overflow-y:auto;
}
.screen.active{opacity:1;pointer-events:all;}

.wordmark{
  font-family:'Cormorant Garamond',serif;
  font-size:9px;letter-spacing:.6em;text-transform:uppercase;
  color:var(--muted);opacity:.5;
  position:fixed;top:20px;left:50%;transform:translateX(-50%);
  z-index:10;pointer-events:none;
}

/* Loading */
.load-wrap{display:flex;flex-direction:column;align-items:center;gap:28px;}
.load-orb{
  width:100px;height:100px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,var(--fp),var(--fs) 60%,transparent 80%);
  opacity:.65;animation:load-pulse 2.2s ease-in-out infinite;
}
@keyframes load-pulse{0%,100%{transform:scale(.88);opacity:.5}50%{transform:scale(1.1);opacity:.9}}
.load-text{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(17px,5vw,22px);font-weight:300;color:var(--text);text-align:center;opacity:.8;}
.load-status{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.32em;color:var(--muted);text-transform:uppercase;text-align:center;}
.ldot{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:ldot-a 1.4s ease-in-out infinite;}
.ldot:nth-child(1){animation-delay:0s}.ldot:nth-child(2){animation-delay:.2s}.ldot:nth-child(3){animation-delay:.4s}
@keyframes ldot-a{0%,100%{background:var(--muted);transform:scale(1)}50%{background:var(--fs);transform:scale(1.5)}}

/* ── ORB ── */
.orb-wrap{
  position:relative;
  width:clamp(190px,54vw,290px);
  height:clamp(190px,54vw,290px);
  flex-shrink:0;margin-bottom:0;
}
.orb-ring{
  position:absolute;border-radius:50%;
  border:1px solid rgba(255,255,255,.03);
  animation:ring-breathe 7s ease-in-out infinite;
}
.orb-ring:nth-child(1){inset:-20px;animation-delay:0s;}
.orb-ring:nth-child(2){inset:-40px;animation-delay:2.3s;border-color:rgba(255,255,255,.02);}
.orb-ring:nth-child(3){inset:-60px;animation-delay:4.6s;border-color:rgba(255,255,255,.01);}
@keyframes ring-breathe{0%,100%{opacity:0;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}

.orb{
  position:absolute;inset:0;border-radius:50%;
  background:radial-gradient(circle at 32% 32%,var(--fp),var(--fs) 55%,transparent 75%);
  border:1px solid rgba(255,255,255,.05);
  box-shadow:0 0 60px var(--fg),0 0 120px var(--fg2),inset 0 0 50px rgba(255,255,255,.02);
  transition:background 2s ease,box-shadow 2s ease;
}
.orb.inhale {animation:o-inhale var(--id,4s)  cubic-bezier(.4,0,.2,1) forwards;}
.orb.hold   {animation:o-hold   var(--hd,4s)  linear forwards;}
.orb.exhale {animation:o-exhale var(--ed,8s)  cubic-bezier(.8,0,.6,1) forwards;}
.orb.hold2  {animation:o-hold2  var(--h2d,4s) linear forwards;}
.orb.session{animation:o-session 5.5s cubic-bezier(.4,0,.6,1) infinite;}
@keyframes o-inhale {from{transform:scale(.78)}to{transform:scale(1.24)}}
@keyframes o-hold   {from,to{transform:scale(1.24)}}
@keyframes o-exhale {from{transform:scale(1.24)}to{transform:scale(.78)}}
@keyframes o-hold2  {from,to{transform:scale(.78)}}
@keyframes o-session{
  0%  {transform:scale(.93);box-shadow:0 0 40px var(--fg),0 0 80px var(--fg2),inset 0 0 30px rgba(255,255,255,.02);}
  40% {transform:scale(1.07);box-shadow:0 0 100px var(--fg),0 0 180px var(--fg2),inset 0 0 70px rgba(255,255,255,.05);}
  100%{transform:scale(.93);box-shadow:0 0 40px var(--fg),0 0 80px var(--fg2),inset 0 0 30px rgba(255,255,255,.02);}
}
.orb.c-calm {background:radial-gradient(circle at 32% 32%,#2a6fff,#6a2fff 55%,transparent 75%);}
.orb.c-focus{background:radial-gradient(circle at 32% 32%,#0fa89e,#0d7a72 55%,transparent 75%);}
.orb.c-reset{background:radial-gradient(circle at 32% 32%,#c87820,#8b4510 55%,transparent 75%);}

/* Cues */
.cue-main{font-family:'Cormorant Garamond',serif;font-size:clamp(21px,5.5vw,32px);font-style:italic;font-weight:300;text-align:center;line-height:1.2;min-height:40px;letter-spacing:.02em;opacity:.9;}
.cue-count{font-family:'DM Mono',monospace;font-size:28px;font-weight:300;text-align:center;min-height:38px;letter-spacing:.1em;margin-top:4px;}
.cue-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;color:var(--muted);text-align:center;margin-top:4px;min-height:13px;text-transform:uppercase;}

/* Dots */
.dots-row{display:flex;gap:10px;justify-content:center;align-items:center;margin:11px 0;}
.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .4s ease;}
.dot.done  {background:var(--fs);box-shadow:0 0 6px var(--fs);}
.dot.active{background:var(--fp);box-shadow:0 0 10px var(--fp);animation:dp 1.2s ease-in-out infinite;}
@keyframes dp{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}

/* Cycle selector */
.cycle-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:13px;}
.cycle-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.32em;color:var(--muted);text-transform:uppercase;}
.cycle-btns{display:flex;gap:8px;}
.cbtn{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);color:var(--muted);font-family:'Jost',sans-serif;font-size:13px;cursor:pointer;transition:all .2s ease;}
.cbtn:hover{border-color:rgba(255,255,255,.18);color:var(--text);}
.cbtn.active{background:rgba(255,255,255,.07);border-color:var(--fp);color:var(--text);box-shadow:0 0 8px var(--fg);}

/* Protocol btns */
.proto-row{display:flex;gap:8px;margin-bottom:11px;width:100%;max-width:305px;}
.pbtn{flex:1;padding:9px 6px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);cursor:pointer;text-align:center;transition:all .2s ease;color:var(--muted);}
.pbtn:hover,.pbtn.active{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:var(--text);}
.pico{font-size:16px;display:block;margin-bottom:3px;}
.pnm{font-size:8px;letter-spacing:.2em;text-transform:uppercase;display:block;margin-bottom:2px;}
.ppat{font-family:'DM Mono',monospace;font-size:8px;color:var(--muted);display:block;}

/* Buttons */
.btn-row{display:flex;gap:10px;margin-top:10px;}
.btn-primary{background:linear-gradient(135deg,var(--fp),var(--fs));border:none;border-radius:100px;padding:11px 34px;cursor:pointer;font-family:'Jost',sans-serif;font-weight:300;font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:white;box-shadow:0 0 22px var(--fg);transition:all .3s ease;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 38px var(--fg);}
.btn-primary:active{transform:scale(.97);}
.btn-ghost{background:none;border:1px solid rgba(255,255,255,.09);border-radius:100px;padding:9px 22px;cursor:pointer;font-family:'Jost',sans-serif;font-weight:300;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);transition:all .2s ease;}
.btn-ghost:hover{border-color:rgba(255,255,255,.18);color:var(--text);}

.btn-play{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--fp),var(--fs));border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 28px var(--fg),0 4px 18px rgba(0,0,0,.5);transition:all .3s ease;}
.btn-play:hover{transform:scale(1.08);box-shadow:0 0 48px var(--fg);}
.btn-play:active{transform:scale(.97);}
.btn-play svg{width:24px;height:24px;fill:white;}

.btn-sec{background:none;border:1px solid rgba(255,255,255,.07);border-radius:50%;width:42px;height:42px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:11px;font-family:'Jost',sans-serif;transition:all .2s ease;}
.btn-sec:hover{border-color:rgba(255,255,255,.18);color:var(--text);}

/* Session controls — tap to reveal */
.session-controls{display:flex;flex-direction:column;align-items:center;width:100%;max-width:310px;transition:opacity .6s ease;}
.session-controls.hidden{opacity:0;pointer-events:none;}
.ctrl-row{display:flex;align-items:center;gap:18px;margin:12px 0;}

/* Timer */
.timer-big{font-family:'Jost',sans-serif;font-weight:100;font-size:clamp(34px,9vw,48px);letter-spacing:.14em;line-height:1;text-align:center;margin:5px 0;opacity:.65;}
.dur-row{display:flex;gap:6px;margin-bottom:10px;}
.dur-btn{padding:6px 12px;border-radius:100px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);color:var(--muted);cursor:pointer;font-family:'Jost',sans-serif;font-weight:200;font-size:10px;letter-spacing:.13em;transition:all .2s ease;}
.dur-btn:hover{border-color:rgba(255,255,255,.15);color:var(--text);}
.dur-btn.active{border-color:var(--fp);background:rgba(255,255,255,.04);color:var(--text);}

/* Freq badge */
.freq-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:100px;padding:4px 13px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.22em;color:var(--text);opacity:.6;margin-bottom:11px;}
.fdot{width:4px;height:4px;border-radius:50%;background:var(--fp);box-shadow:0 0 4px var(--fp);}

/* Status */
.slbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.38em;text-transform:uppercase;color:var(--muted);text-align:center;margin-bottom:5px;opacity:.55;}
.stitle{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(14px,4vw,19px);font-weight:300;text-align:center;line-height:1.3;margin-bottom:13px;max-width:250px;opacity:.7;}

/* ── AFFIRMATION OVERLAY — full screen dissolve ── */
.affirm-overlay{
  position:fixed;inset:0;z-index:20;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:48px 40px;
  pointer-events:none;
  opacity:0;
  transition:opacity 2.5s ease;
}
.affirm-overlay.showing{opacity:1;}

.affirm-overlay-bg{
  position:fixed;inset:0;z-index:-1;
  background:rgba(2,2,8,.75);
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  opacity:0;transition:opacity 2.5s ease;
}
.affirm-overlay.showing .affirm-overlay-bg{opacity:1;}

.affirm-scene{
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(20px,5.5vw,32px);
  font-style:italic;font-weight:300;
  text-align:center;line-height:1.7;
  color:var(--text);letter-spacing:.02em;
  max-width:340px;
  opacity:0;transform:translateY(14px);
  transition:opacity 2.5s ease,transform 2.5s ease;
}
.affirm-overlay.showing .affirm-scene{opacity:1;transform:translateY(0);}

/* Voice / volume */
.voice-row{display:flex;align-items:center;gap:10px;width:100%;max-width:280px;margin-bottom:7px;opacity:.4;transition:opacity .3s;}
.voice-row:hover{opacity:1;}
.vtoggle{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:100px;padding:5px 11px;cursor:pointer;font-size:13px;transition:all .2s;}
.vlbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.26em;color:var(--muted);}
.vol-row{display:flex;align-items:center;gap:10px;width:100%;max-width:280px;margin-bottom:9px;opacity:.4;transition:opacity .3s;}
.vol-row:hover{opacity:1;}
input[type=range]{flex:1;-webkit-appearance:none;height:1px;background:linear-gradient(90deg,var(--fp) var(--pct,70%),rgba(255,255,255,.08) var(--pct,70%));border-radius:1px;outline:none;cursor:pointer;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:var(--fs);cursor:pointer;}

.hp{font-size:9px;letter-spacing:.13em;color:var(--muted);text-align:center;margin-bottom:10px;opacity:.35;}

/* Reflect */
.reflect-box{width:100%;max-width:285px;background:rgba(200,168,75,.03);border:1px solid rgba(200,168,75,.1);border-radius:13px;padding:15px 17px;margin-top:10px;display:none;}
.rlbl{font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);opacity:.65;margin-bottom:6px;}
.rq{font-family:'Cormorant Garamond',serif;font-size:14px;font-style:italic;line-height:1.55;color:var(--text);opacity:.75;margin-bottom:9px;}
.rinput{width:100%;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:10px 12px;color:var(--text);font-family:'Cormorant Garamond',serif;font-size:13px;resize:none;outline:none;line-height:1.5;min-height:58px;}
.rinput:focus{border-color:rgba(200,168,75,.2);}
.rinput::placeholder{color:var(--muted);font-style:italic;opacity:.5;}

/* Scroll container */
.sw{overflow-y:auto;overflow-x:hidden;width:100%;max-width:335px;display:flex;flex-direction:column;align-items:center;padding:48px 4px 30px;max-height:100vh;}
.sw::-webkit-scrollbar{display:none;}

.skip-lnk{display:none;margin-top:9px;font-size:9px;letter-spacing:.19em;color:var(--muted);cursor:pointer;text-transform:uppercase;opacity:.45;}
.skip-lnk:hover{opacity:1;}
