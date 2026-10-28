/* ==========================================================================
   DRAGON BALL 3D PORTAL — AUDIO SYNTH & OFFLINE VOICE NARRATOR MODULE
   Zero external network calls: uses Web Audio API + window.speechSynthesis
   ========================================================================== */

(function () {
  'use strict';

  let audioCtx = null;
  let soundEnabled = true;

  function ensureAudio() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function setSoundEnabled(enabled) {
    soundEnabled = Boolean(enabled);
    if (!soundEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  function playSound(type) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'scouter') {
      [0, 0.065, 0.13].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1280 + idx * 230, now + offset);
        gain.gain.setValueAtTime(0.065, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.055);
      });
    } else if (type === 'transform' || type === 'burst') {
      // Dramatic DBZ Aura Power-Up Sweep + Sub-Bass Rumble
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.42);

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(65, now);
      sub.frequency.exponentialRampToValueAtTime(140, now + 0.42);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.48);
      sub.stop(now + 0.48);
    } else if (type === 'clash_hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220 + Math.random() * 180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'fusion') {
      [261.63, 329.63, 392.0, 523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.09, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 0.9);
      });
    } else if (type === 'shenron') {
      [196.0, 246.94, 293.66, 392.0, 587.33].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.15);
      });
    }
  }

  function speakText(text) {
    if (!window.speechSynthesis) return false;
    window.speechSynthesis.cancel();
    const clean = String(text || '').replace(/[⚡🔥💡🌟🏆📟🎨🥋🌌⚔️🧬🦸😈✅🔄]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1.02;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
    return true;
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  window.DB_AUDIO = {
    playSound,
    speakText,
    stopSpeaking,
    setSoundEnabled,
    isSoundEnabled
  };
})();
