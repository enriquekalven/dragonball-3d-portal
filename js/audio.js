/* ==========================================================================
   DRAGON BALL 3D PORTAL — CHARACTER VOICE, KAMEHAMEHA SHOUT & WEB AUDIO ENGINE
   Multi-Tier Character-Matched Voice & Expressive Attack Shouts across all 13
   Languages (en, es, es-419, zh, yue, ja, ko, pt, fr, it, de, nl, ar):
     1. Expressive Anime Attack Shouts (atk_*.mp3) synced to 3D Beam Physics
     2. Character-Matched Chirp 3 HD Studio Read-Alouds (Orus for Goku, etc.)
     3. Live /api/tts Local Proxy Override + Neural Browser Speech Fallback
   ========================================================================== */

(function () {
  'use strict';

  let audioCtx = null;
  let soundEnabled = true;
  let personaOverride = 'auto';
  let activeCharacterId = 'goku';

  let speechToken = 0;
  let activeAudioEl = null;
  let activeAbortCtrl = null;
  let activeStateCallback = null;

  let attackToken = 0;
  let activeAttackAudioEl = null;

  const BCP47_MAP = {
    en: 'en-US',
    es: 'es-ES',
    'es-419': 'es-MX',
    zh: 'zh-CN',
    yue: 'zh-HK',
    ja: 'ja-JP',
    ko: 'ko-KR',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT',
    de: 'de-DE',
    nl: 'nl-NL',
    ar: 'ar-SA'
  };

  // Character-matched Chirp 3 HD voice personas (Adult Goku = Orus, Kid Goku / JA Goku = Puck)
  const CHARACTER_PERSONAS = {
    goku: 'Orus',
    kid_goku: 'Puck',
    vegeta: 'Fenrir',
    gohan: 'Orus',
    piccolo: 'Fenrir',
    trunks: 'Puck',
    broly: 'Fenrir',
    freezer: 'Charon',
    cell: 'Charon',
    buu: 'Puck',
    beerus: 'Fenrir',
    whis: 'Zephyr',
    jiren: 'Fenrir',
    'goku-black': 'Charon',
    vegetto: 'Orus',
    gogeta: 'Orus',
    gotenks: 'Puck',
    'android-17': 'Orus',
    'earth-heroes': 'Orus',
    bulma: 'Aoede',
    zeno: 'Kore',
    bardock: 'Fenrir',
    goten: 'Puck',
    toppo: 'Charon',
    ginyu: 'Charon',
    janemba: 'Charon'
  };

  // Exact PCM-measured [blastAtSec, durationSec] for all 338 expressive attack shouts (26 x 13 langs)
  const ATTACK_TIMINGS = {"en":{"atk_goku":[3.28,5.63],"atk_buu":[0.44,0.92],"atk_goku-black":[0.63,1.08],"atk_freezer":[1.36,2.24],"atk_piccolo":[1.36,3.21],"atk_broly":[2.48,3.8],"atk_whis":[0.48,0.96],"atk_vegeta":[2.24,3.24],"atk_zeno":[0.72,1.48],"atk_jiren":[0.45,0.9],"atk_beerus":[1.32,2.28],"atk_toppo-dyspo":[0.43,0.88],"atk_cell":[3.6,5.95],"atk_trunks":[0.28,0.72],"atk_goten":[0.28,0.8],"atk_androids":[0.28,0.76],"atk_earth-heroes":[0.44,0.92],"atk_bulma-satan":[0.3,0.86],"atk_bardock-raditz":[1.2,1.98],"atk_janemba":[0.36,1.03],"atk_ginyu":[0.84,1.68],"atk_kid_goku":[4.04,5.4],"atk_vegetto":[4.47,6.42],"atk_gogeta":[3.84,6.19],"atk_gohan":[4.33,6.29],"atk_gotenks":[5.35,5.8]},"es":{"atk_vegeta":[2.63,3.08],"atk_buu":[0.55,1.68],"atk_piccolo":[2.96,3.68],"atk_goku-black":[0.32,0.92],"atk_freezer":[3.52,4.64],"atk_whis":[1.83,2.28],"atk_kid_goku":[4.16,5.28],"atk_zeno":[0.87,1.32],"atk_jiren":[0.48,1.04],"atk_toppo-dyspo":[0.59,1.04],"atk_gohan":[4.0,5.96],"atk_goten":[0.31,0.88],"atk_trunks":[0.59,1.04],"atk_earth-heroes":[0.28,0.58],"atk_androids":[0.63,1.08],"atk_gogeta":[3.97,5.93],"atk_bulma-satan":[0.41,1.16],"atk_broly":[3.12,3.64],"atk_beerus":[1.88,2.68],"atk_janemba":[0.28,1.24],"atk_ginyu":[1.63,2.08],"atk_bardock-raditz":[2.0,2.48],"atk_vegetto":[4.83,6.79],"atk_cell":[4.97,6.93],"atk_goku":[5.67,7.63],"atk_gotenks":[5.68,6.36]},"es-419":{"atk_goku":[4.73,6.54],"atk_buu":[0.8,1.72],"atk_vegeta":[2.28,3.48],"atk_freezer":[2.2,3.12],"atk_piccolo":[3.08,4.0],"atk_goku-black":[0.91,1.36],"atk_zeno":[1.48,2.08],"atk_jiren":[0.4,1.0],"atk_whis":[2.83,3.28],"atk_gohan":[4.4,6.75],"atk_toppo-dyspo":[1.11,1.56],"atk_trunks":[0.28,1.0],"atk_goten":[0.47,0.92],"atk_earth-heroes":[0.28,0.48],"atk_androids":[0.87,1.32],"atk_bulma-satan":[0.41,1.16],"atk_cell":[4.23,6.19],"atk_janemba":[0.28,1.16],"atk_bardock-raditz":[0.55,1.8],"atk_broly":[2.76,4.12],"atk_ginyu":[1.55,2.0],"atk_beerus":[1.56,2.6],"atk_gogeta":[5.97,7.92],"atk_vegetto":[2.12,4.08],"atk_gotenks":[5.1,5.8],"atk_kid_goku":[3.8,5.68]},"zh":{"atk_vegeta":[2.6,3.48],"atk_vegetto":[4.24,5.4],"atk_buu":[0.68,1.52],"atk_gohan":[4.56,5.84],"atk_gogeta":[5.6,6.64],"atk_goku-black":[0.47,0.92],"atk_kid_goku":[4.0,4.72],"atk_piccolo":[3.8,4.72],"atk_freezer":[2.56,3.72],"atk_jiren":[0.52,1.0],"atk_zeno":[1.43,1.88],"atk_toppo-dyspo":[0.39,0.84],"atk_trunks":[0.32,0.92],"atk_whis":[5.59,6.04],"atk_androids":[0.47,0.92],"atk_goten":[0.36,1.04],"atk_earth-heroes":[0.28,0.64],"atk_bulma-satan":[0.34,0.96],"atk_bardock-raditz":[1.44,2.64],"atk_janemba":[0.52,1.28],"atk_ginyu":[2.35,2.8],"atk_broly":[2.52,3.28],"atk_cell":[3.92,5.77],"atk_beerus":[1.56,3.0],"atk_goku":[4.7,6.66],"atk_gotenks":[5.37,6.5]},"yue":{"atk_kid_goku":[3.35,3.8],"atk_vegeta":[0.52,1.0],"atk_goku":[3.63,4.08],"atk_gohan":[1.11,1.56],"atk_vegetto":[0.56,1.56],"atk_gogeta":[2.32,3.28],"atk_piccolo":[0.32,1.44],"atk_freezer":[0.52,1.08],"atk_cell":[0.92,1.96],"atk_beerus":[0.28,0.8],"atk_goku-black":[0.56,1.16],"atk_buu":[0.76,1.84],"atk_zeno":[1.75,2.2],"atk_broly":[0.48,1.36],"atk_jiren":[0.87,1.32],"atk_trunks":[0.34,0.96],"atk_toppo-dyspo":[0.6,1.24],"atk_whis":[5.15,5.6],"atk_androids":[0.52,1.36],"atk_goten":[0.84,1.44],"atk_gotenks":[3.15,3.6],"atk_bulma-satan":[0.67,1.12],"atk_earth-heroes":[0.36,1.04],"atk_bardock-raditz":[0.55,2.4],"atk_janemba":[0.84,1.64],"atk_ginyu":[1.52,3.0]},"ja":{"atk_vegeta":[2.16,3.44],"atk_piccolo":[2.72,3.92],"atk_gohan":[2.24,4.01],"atk_buu":[0.28,0.96],"atk_vegetto":[2.84,4.69],"atk_freezer":[2.32,3.36],"atk_gogeta":[4.28,6.13],"atk_goku-black":[0.35,1.0],"atk_whis":[3.71,4.16],"atk_cell":[4.12,5.97],"atk_toppo-dyspo":[0.71,1.16],"atk_jiren":[0.67,1.12],"atk_zeno":[1.19,1.64],"atk_goten":[0.31,0.88],"atk_trunks":[0.87,1.32],"atk_earth-heroes":[0.28,0.6],"atk_androids":[0.46,1.32],"atk_bulma-satan":[0.45,1.28],"atk_janemba":[0.47,0.92],"atk_bardock-raditz":[0.96,2.6],"atk_ginyu":[2.59,3.04],"atk_goku":[4.08,6.43],"atk_broly":[2.16,3.48],"atk_beerus":[1.56,2.8],"atk_gotenks":[5.13,6.13],"atk_kid_goku":[6.4,8.36]},"ko":{"atk_vegeta":[1.48,2.56],"atk_vegetto":[3.32,4.28],"atk_gohan":[2.96,4.0],"atk_buu":[0.28,0.96],"atk_piccolo":[3.12,4.17],"atk_gogeta":[5.08,6.04],"atk_goku-black":[0.34,0.96],"atk_zeno":[0.41,1.16],"atk_jiren":[0.61,1.06],"atk_whis":[3.43,3.88],"atk_toppo-dyspo":[0.63,1.08],"atk_trunks":[0.28,0.72],"atk_goku":[5.0,6.73],"atk_goten":[0.28,0.76],"atk_freezer":[1.44,3.16],"atk_androids":[0.34,0.96],"atk_earth-heroes":[0.28,0.6],"atk_bulma-satan":[0.32,0.92],"atk_cell":[4.48,5.2],"atk_broly":[2.64,4.28],"atk_janemba":[0.28,0.76],"atk_bardock-raditz":[2.03,2.48],"atk_beerus":[1.16,2.08],"atk_ginyu":[2.15,2.6],"atk_kid_goku":[4.0,5.96],"atk_gotenks":[5.12,6.0]},"pt":{"atk_piccolo":[2.88,3.6],"atk_vegeta":[2.92,4.05],"atk_freezer":[3.2,4.09],"atk_buu":[0.55,1.98],"atk_goku-black":[0.41,0.86],"atk_whis":[2.35,2.8],"atk_zeno":[1.03,1.48],"atk_jiren":[0.6,1.21],"atk_goku":[3.64,5.99],"atk_gohan":[4.57,6.53],"atk_gogeta":[4.63,6.59],"atk_vegetto":[5.33,7.29],"atk_toppo-dyspo":[0.79,1.24],"atk_trunks":[0.4,0.96],"atk_beerus":[2.6,3.76],"atk_goten":[0.36,0.9],"atk_broly":[3.48,4.16],"atk_cell":[4.37,6.33],"atk_androids":[0.41,1.16],"atk_earth-heroes":[0.28,0.6],"atk_bulma-satan":[0.45,1.28],"atk_bardock-raditz":[0.96,2.22],"atk_ginyu":[1.24,2.0],"atk_janemba":[0.79,1.24],"atk_kid_goku":[3.83,5.79],"atk_gotenks":[5.53,6.0]},"fr":{"atk_vegeta":[2.51,2.96],"atk_buu":[0.55,1.0],"atk_piccolo":[2.68,3.2],"atk_goku-black":[0.28,0.72],"atk_freezer":[2.72,3.6],"atk_zeno":[0.87,1.32],"atk_vegetto":[5.1,7.06],"atk_whis":[0.8,1.72],"atk_gogeta":[4.2,6.16],"atk_jiren":[0.72,1.24],"atk_trunks":[0.28,0.8],"atk_toppo-dyspo":[0.51,0.96],"atk_goten":[0.28,0.8],"atk_earth-heroes":[0.28,0.6],"atk_bulma-satan":[0.34,0.96],"atk_androids":[0.31,0.88],"atk_kid_goku":[5.24,6.28],"atk_gohan":[4.77,6.73],"atk_broly":[3.43,3.88],"atk_janemba":[0.28,1.08],"atk_beerus":[1.76,2.96],"atk_bardock-raditz":[1.4,2.24],"atk_ginyu":[2.39,2.84],"atk_goku":[3.97,5.93],"atk_cell":[6.03,7.99],"atk_gotenks":[6.15,6.6]},"it":{"atk_vegeta":[2.6,4.0],"atk_buu":[0.55,1.6],"atk_piccolo":[2.24,3.0],"atk_goku-black":[0.32,0.92],"atk_whis":[3.68,4.32],"atk_freezer":[2.32,3.6],"atk_zeno":[0.99,1.44],"atk_jiren":[0.28,0.72],"atk_cell":[4.36,6.71],"atk_toppo-dyspo":[0.31,0.76],"atk_trunks":[0.35,0.8],"atk_broly":[2.96,3.68],"atk_vegetto":[5.43,7.39],"atk_goten":[0.39,0.84],"atk_beerus":[1.76,3.0],"atk_androids":[0.71,1.16],"atk_earth-heroes":[0.28,0.68],"atk_bulma-satan":[0.63,1.08],"atk_janemba":[0.71,1.16],"atk_bardock-raditz":[1.48,2.56],"atk_ginyu":[1.36,2.52],"atk_goku":[5.37,7.03],"atk_gogeta":[4.63,6.59],"atk_gohan":[4.9,6.86],"atk_gotenks":[6.15,6.6],"atk_kid_goku":[3.93,5.89]},"de":{"atk_vegeta":[1.56,3.32],"atk_piccolo":[2.48,3.56],"atk_buu":[0.32,1.44],"atk_freezer":[2.4,3.44],"atk_vegetto":[3.8,5.76],"atk_goku-black":[0.29,0.84],"atk_zeno":[1.12,1.64],"atk_whis":[3.23,3.68],"atk_goku":[4.04,5.88],"atk_jiren":[0.28,0.72],"atk_toppo-dyspo":[0.51,0.96],"atk_trunks":[0.28,0.76],"atk_goten":[0.34,0.96],"atk_gohan":[4.43,6.39],"atk_androids":[1.08,1.6],"atk_bulma-satan":[0.31,0.88],"atk_earth-heroes":[0.28,0.52],"atk_broly":[3.08,4.04],"atk_beerus":[1.84,2.96],"atk_gogeta":[3.8,5.76],"atk_janemba":[0.43,0.88],"atk_bardock-raditz":[1.56,2.32],"atk_cell":[4.6,6.56],"atk_ginyu":[1.8,2.4],"atk_gotenks":[5.37,5.97],"atk_kid_goku":[4.3,6.26]},"nl":{"atk_vegeta":[2.04,2.92],"atk_piccolo":[3.24,4.44],"atk_buu":[0.32,0.92],"atk_vegetto":[4.5,6.46],"atk_goku-black":[0.55,1.0],"atk_freezer":[2.24,3.16],"atk_gohan":[4.6,6.56],"atk_gogeta":[3.97,5.93],"atk_whis":[3.43,3.88],"atk_zeno":[0.99,1.44],"atk_jiren":[0.28,0.72],"atk_toppo-dyspo":[0.28,0.72],"atk_trunks":[0.28,0.72],"atk_goten":[0.32,0.92],"atk_androids":[0.39,0.84],"atk_earth-heroes":[0.48,0.96],"atk_cell":[4.8,6.76],"atk_bulma-satan":[0.31,0.88],"atk_beerus":[1.36,2.6],"atk_broly":[2.72,4.32],"atk_bardock-raditz":[1.56,2.04],"atk_kid_goku":[3.68,6.03],"atk_janemba":[0.31,0.88],"atk_ginyu":[1.95,2.4],"atk_gotenks":[5.48,5.93],"atk_goku":[2.28,4.63]},"ar":{"atk_vegeta":[1.84,2.64],"atk_gogeta":[3.96,5.4],"atk_piccolo":[3.0,4.48],"atk_vegetto":[1.96,3.76],"atk_goku-black":[0.45,1.28],"atk_buu":[0.5,1.44],"atk_freezer":[0.92,2.64],"atk_whis":[4.99,5.44],"atk_zeno":[0.4,1.56],"atk_jiren":[0.59,1.04],"atk_trunks":[0.42,1.2],"atk_cell":[4.76,6.61],"atk_beerus":[1.12,1.96],"atk_broly":[3.96,5.52],"atk_goten":[0.38,1.08],"atk_toppo-dyspo":[0.56,1.22],"atk_gohan":[4.76,6.61],"atk_androids":[0.52,1.12],"atk_bulma-satan":[0.63,1.08],"atk_earth-heroes":[0.99,1.44],"atk_janemba":[0.29,0.84],"atk_bardock-raditz":[0.76,2.4],"atk_ginyu":[2.03,2.48],"atk_kid_goku":[4.44,6.79],"atk_gotenks":[3.72,5.16],"atk_goku":[3.36,5.71]}};

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
    if (!soundEnabled) {
      stopSpeaking();
      stopAttackShout();
    }
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  function setPersona(persona) {
    if (persona) {
      personaOverride = String(persona);
    }
  }

  function getPersona() {
    return personaOverride;
  }

  function setActiveCharacter(entityId) {
    if (entityId) {
      activeCharacterId = String(entityId);
    }
  }

  function resolveEffectivePersona(lang) {
    if (personaOverride && personaOverride !== 'auto') {
      return personaOverride;
    }
    if (lang === 'ja' && (activeCharacterId === 'goku' || activeCharacterId === 'gohan')) {
      return 'Puck';
    }
    return CHARACTER_PERSONAS[activeCharacterId] || 'Orus';
  }

  function playSound(type, extraVal) {
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
    } else if (type === 'ki_tick') {
      const pct = Math.max(0, Math.min(100, Number(extraVal) || 0));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150 + pct * 5.2, now);
      osc.frequency.exponentialRampToValueAtTime(210 + pct * 6.4, now + 0.09);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'teleport') {
      const osc = ctx.createOscillator();
      const ping = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.075);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.16);
      ping.type = 'triangle';
      ping.frequency.setValueAtTime(920, now + 0.04);
      ping.frequency.exponentialRampToValueAtTime(3100, now + 0.17);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      osc.connect(gain);
      ping.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      ping.start(now + 0.04);
      osc.stop(now + 0.2);
      ping.stop(now + 0.2);
    } else if (type === 'beam_charge') {
      // Warm harmonic Ki sphere resonance tucked cleanly underneath Goku's voice shout
      const dur = Math.max(0.38, Math.min(5.2, Number(extraVal) || 0.45));
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + dur);
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(350, now);
      shimmer.frequency.exponentialRampToValueAtTime(1180, now + dur);
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.linearRampToValueAtTime(0.042, now + dur * 0.85);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.04);
      osc.connect(gain);
      shimmer.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      shimmer.start(now);
      osc.stop(now + dur + 0.05);
      shimmer.stop(now + dur + 0.05);
    } else if (type === 'beam_fire') {
      // Deep sub-bass anime plasma cannon impact that reinforces (never masks) Goku's "HAAAAA!!"
      const holdSec = Math.max(0.65, Math.min(2.6, Number(extraVal) || 0.9));
      const sub = ctx.createOscillator();
      const roar = ctx.createOscillator();
      const gain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(145, now);
      sub.frequency.exponentialRampToValueAtTime(42, now + holdSec);
      roar.type = 'triangle';
      roar.frequency.setValueAtTime(360, now);
      roar.frequency.exponentialRampToValueAtTime(92, now + holdSec * 0.9);
      gain.gain.setValueAtTime(0.085, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + holdSec);
      sub.connect(gain);
      roar.connect(gain);
      gain.connect(ctx.destination);
      sub.start(now);
      roar.start(now);
      sub.stop(now + holdSec + 0.02);
      roar.stop(now + holdSec + 0.02);
    } else if (type === 'dragon_ball') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);
        gain.gain.setValueAtTime(0.095, now + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + 0.3);
      });
    } else if (type === 'transform' || type === 'burst') {
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

  function cleanTextForSpeech(rawText) {
    return String(rawText || '')
      .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF•⇒→★☆]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pickBestBrowserVoice(lang) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    const regexMap = {
      en: /^en(-|_|$)/i,
      es: /^es(-|_|$)/i,
      'es-419': /^es(-|_|$)/i,
      zh: /^(zh|cmn)(-|_|$)/i,
      yue: /^(yue|zh-HK|zh_HK|zh-MO|zh_MO|zh|cmn)(-|_|$)/i,
      ja: /^ja(-|_|$)/i,
      ko: /^ko(-|_|$)/i,
      pt: /^pt(-|_|$)/i,
      fr: /^fr(-|_|$)/i,
      it: /^it(-|_|$)/i,
      de: /^de(-|_|$)/i,
      nl: /^nl(-|_|$)/i,
      ar: /^ar(-|_|$)/i
    };
    const langRegex = regexMap[lang] || /^en(-|_|$)/i;
    const pool = voices.filter((v) => langRegex.test(v.lang));
    if (!pool.length) return null;

    function scoreVoice(v) {
      const name = v.name + ' ' + v.voiceURI;
      if (/eloquence|grandpa|grandma|reed|rocko|sandy|shelley|flo|eddy|bahh|albert|bells|boing|bubbles|cellos|organ|trinoids|whisper|zarvox|\bFred\b/i.test(name)) {
        return -150;
      }
      let s = 0;
      if (/Chirp|Natural|Online|Neural|Studio|Premium|Enhanced|Siri/i.test(name)) s += 55;
      if (/Daniel|Alex|Jorge|Raul|Juan|Diego|Reed|Aaron|Rishi|Thomas|Luca|Markus|Xander|Maged|Otoya/i.test(name)) s += 18;
      if (lang === 'es-419') {
        if (/^es(-|_)(419|MX|US|AR|CO|CL|PE|VE|EC|UY|PY|BO|CR|PA|DO|GT|HN|SV|NI|PR)/i.test(v.lang)) s += 50;
        if (/Raul|Juan|Diego|Carlos|Paulina|Sabina|Dalia|Mia|Latinoam|Estados Unidos|México|Mexico/i.test(name)) s += 35;
        if (/^es(-|_)ES/i.test(v.lang)) s -= 25;
      } else if (lang === 'es') {
        if (/^es(-|_)ES/i.test(v.lang)) s += 45;
        if (/Alvaro|Álvaro|Jorge|Mónica|Monica|Elvira|España/i.test(name)) s += 30;
      }
      if (lang === 'yue' && /^(yue|zh-HK|zh_HK)/i.test(v.lang)) s += 50;
      if (lang === 'nl' && /Google Nederlands|Xander|Maarten|Claire|Colette|Fenna/i.test(name)) s += 35;
      if (lang === 'de' && /Google Deutsch|Conrad|Martin|Anna|Petra|Katja/i.test(name)) s += 35;
      if (lang === 'ar' && /Google العربية|Maged|Tarik|Laila|Mariam|Zariyah|Salma/i.test(name)) s += 35;
      if (v.localService) s += 12;
      return s;
    }

    return pool.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
  }

  function stopAttackShout() {
    attackToken += 1;
    if (activeAttackAudioEl) {
      try {
        activeAttackAudioEl.pause();
        activeAttackAudioEl.src = '';
      } catch (_e) {}
      activeAttackAudioEl = null;
    }
  }

  function stopSpeaking() {
    speechToken += 1;
    if (activeAbortCtrl) {
      try {
        activeAbortCtrl.abort();
      } catch (_e) {}
      activeAbortCtrl = null;
    }
    if (activeAudioEl) {
      try {
        activeAudioEl.pause();
        activeAudioEl.src = '';
      } catch (_e) {}
      activeAudioEl = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }
    if (activeStateCallback) {
      const cb = activeStateCallback;
      activeStateCallback = null;
      cb(false);
    }
  }

  // Play expressive anime attack shout (e.g., Goku's "KA... ME... HA... ME... HAAAAA!!")
  // and return millisecond timing handles synced to the 3D beam renderer!
  function playAttackShout(atkKey, fallbackMoveText, lang) {
    const safeLang = /^(?:[a-z]{2,3}|es-419)$/.test(lang || '') ? lang : 'en';
    const safeKey = String(atkKey || 'atk_goku').replace(/[^a-zA-Z0-9_-]/g, '');
    const langTable = ATTACK_TIMINGS[safeLang] || ATTACK_TIMINGS.en || {};
    const pair = langTable[safeKey] || (ATTACK_TIMINGS.en && ATTACK_TIMINGS.en[safeKey]) || [2.4, 4.4];

    const blastAtSec = Math.max(0.38, Number(pair[0]) || 2.4);
    const clipDurationSec = Math.max(blastAtSec + 0.35, Number(pair[1]) || 4.4);
    const blastAtMs = Math.round(blastAtSec * 1000);
    const durationMs = Math.max(Math.round(clipDurationSec * 1000), blastAtMs + 1050);

    if (!soundEnabled) {
      return {
        blastAtMs: blastAtMs,
        durationMs: durationMs,
        getLiveElapsedMs: function () {
          return null;
        }
      };
    }

    stopSpeaking();
    stopAttackShout();
    ensureAudio();
    playSound('beam_charge', blastAtSec);

    const myToken = ++attackToken;
    const staticUrl = 'assets/audio/' + safeLang + '/' + safeKey + '.mp3';
    const audio = new Audio(staticUrl);
    audio.volume = 1.0;
    audio.preload = 'auto';
    activeAttackAudioEl = audio;

    let endedAtPerf = null;
    let endedAudioMs = Math.round(clipDurationSec * 1000);
    let playbackFailed = false;

    audio.onended = function () {
      if (myToken !== attackToken) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        endedAudioMs = Math.round(audio.duration * 1000);
      }
      endedAtPerf = performance.now();
      activeAttackAudioEl = null;
    };

    audio.onerror = function () {
      if (myToken !== attackToken) return;
      playbackFailed = true;
      activeAttackAudioEl = null;
      if (fallbackMoveText) {
        speakBrowserFallback(cleanTextForSpeech(fallbackMoveText + '!!'), safeLang, speechToken, function () {});
      }
    };

    audio.play().catch(function () {
      if (myToken !== attackToken) return;
      playbackFailed = true;
      activeAttackAudioEl = null;
    });

    return {
      blastAtMs: blastAtMs,
      durationMs: durationMs,
      getLiveElapsedMs: function () {
        if (myToken !== attackToken || playbackFailed) return null;
        if (endedAtPerf !== null) {
          return endedAudioMs + (performance.now() - endedAtPerf);
        }
        if (audio.currentTime > 0 && !audio.paused) {
          return audio.currentTime * 1000;
        }
        return null;
      }
    };
  }

  function speakBrowserFallback(cleaned, lang, token, onDone) {
    if (!window.speechSynthesis) {
      onDone();
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (_e) {}

    const utter = new SpeechSynthesisUtterance(cleaned);
    const voice = pickBestBrowserVoice(lang);
    utter.lang = (voice && voice.lang) || BCP47_MAP[lang] || 'en-US';
    if (voice) utter.voice = voice;
    utter.rate = lang === 'yue' || lang === 'zh' || lang === 'ja' ? 0.96 : 1.0;
    utter.onend = function () {
      if (token === speechToken) onDone();
    };
    utter.onerror = function () {
      if (token === speechToken) onDone();
    };
    window.speechSynthesis.speak(utter);
  }

  let liveTtsApiAvailable = null;

  function fetchLiveTtsOrBrowserFallback(cleaned, targetLang, ttsLang, effectivePersona, token, finishClean) {
    if (liveTtsApiAvailable === false) {
      speakBrowserFallback(cleaned, targetLang, token, finishClean);
      return;
    }
    const ctrl = new AbortController();
    activeAbortCtrl = ctrl;

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleaned,
        lang: ttsLang,
        persona: effectivePersona,
        speakingRate: 1.0
      }),
      signal: ctrl.signal
    })
      .then((res) => {
        if (res.status === 404 || res.status === 405) {
          liveTtsApiAvailable = false;
          throw new Error('Static host');
        }
        if (!res.ok) throw new Error('TTS HTTP ' + res.status);
        const ct = res.headers.get('Content-Type') || '';
        if (ct.indexOf('audio') === -1) {
          liveTtsApiAvailable = false;
          throw new Error('Invalid TTS Content-Type');
        }
        liveTtsApiAvailable = true;
        return res.blob();
      })
      .then((blob) => {
        if (token !== speechToken) return;
        if (!blob || blob.size < 128) throw new Error('Empty MP3');
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        activeAudioEl = audio;

        function cleanupUrl() {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (_e) {}
        }

        audio.onended = function () {
          cleanupUrl();
          finishClean();
        };
        audio.onerror = function () {
          cleanupUrl();
          if (token === speechToken) {
            speakBrowserFallback(cleaned, targetLang, token, finishClean);
          }
        };
        audio.play().catch(function () {
          cleanupUrl();
          if (token === speechToken) {
            speakBrowserFallback(cleaned, targetLang, token, finishClean);
          }
        });
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return;
        if (token !== speechToken) return;
        speakBrowserFallback(cleaned, targetLang, token, finishClean);
      });
  }

  function playStaticChirpOrFallback(cleaned, targetLang, ttsLang, effectivePersona, audioKey, token, finishClean) {
    if (!audioKey) {
      fetchLiveTtsOrBrowserFallback(cleaned, targetLang, ttsLang, effectivePersona, token, finishClean);
      return;
    }
    const safeLang = /^(?:[a-z]{2,3}|es-419)$/.test(targetLang) ? targetLang : 'en';
    const safeKey = String(audioKey).replace(/[^a-zA-Z0-9_-]/g, '');
    const staticUrl = 'assets/audio/' + safeLang + '/' + safeKey + '.mp3';

    const audio = new Audio(staticUrl);
    activeAudioEl = audio;
    audio.onended = function () {
      finishClean();
    };
    audio.onerror = function () {
      if (token === speechToken) {
        activeAudioEl = null;
        fetchLiveTtsOrBrowserFallback(cleaned, targetLang, ttsLang, effectivePersona, token, finishClean);
      }
    };
    audio.play().catch(function () {
      if (token === speechToken) {
        activeAudioEl = null;
        fetchLiveTtsOrBrowserFallback(cleaned, targetLang, ttsLang, effectivePersona, token, finishClean);
      }
    });
  }

  function speakText(text, lang, onStateChange, audioKey) {
    stopSpeaking();
    stopAttackShout();
    if (!soundEnabled) return false;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return false;

    const token = ++speechToken;
    const targetLang = lang || 'en';
    const ttsLang = targetLang === 'zh' ? 'zh-CN' : targetLang === 'yue' ? 'yue-HK' : targetLang;
    const effectivePersona = resolveEffectivePersona(targetLang);

    if (typeof onStateChange === 'function') {
      activeStateCallback = onStateChange;
      onStateChange(true);
    }

    function finishClean() {
      if (token !== speechToken) return;
      activeAudioEl = null;
      activeAbortCtrl = null;
      if (activeStateCallback) {
        const cb = activeStateCallback;
        activeStateCallback = null;
        cb(false);
      }
    }

    // In default Character Auto mode, play pre-rendered Character-Matched Studio MP3 immediately!
    if ((personaOverride === 'auto' || liveTtsApiAvailable === false) && audioKey) {
      playStaticChirpOrFallback(
        cleaned,
        targetLang,
        ttsLang,
        effectivePersona,
        audioKey,
        token,
        finishClean
      );
      return true;
    }

    fetchLiveTtsOrBrowserFallback(cleaned, targetLang, ttsLang, effectivePersona, token, finishClean);
    return true;
  }

  function isSpeaking() {
    return Boolean(activeStateCallback);
  }

  window.DB_AUDIO = {
    playSound,
    playAttackShout,
    stopAttackShout,
    speakText,
    stopSpeaking,
    isSpeaking,
    setSoundEnabled,
    isSoundEnabled,
    setPersona,
    getPersona,
    setActiveCharacter
  };
})();
