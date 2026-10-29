/* ==========================================================================
   DRAGON BALL 3D PORTAL — WEB AUDIO SYNTH & GOOGLE CLOUD CHIRP 3 HD ENGINE
   Multi-Tier Narration across all 12 Languages (en, es, zh, yue, ja, ko, pt,
   fr, it, de, nl, ar):
     1. Live /api/tts Google Cloud Chirp 3 HD MP3 Synthesis (with disk cache)
     2. Neural Browser speechSynthesis Fallback (with Eloquence filter)
   ========================================================================== */

(function () {
  'use strict';

  let audioCtx = null;
  let soundEnabled = true;
  let currentPersona = 'Aoede';

  let speechToken = 0;
  let activeAudioEl = null;
  let activeAbortCtrl = null;
  let activeStateCallback = null;

  const BCP47_MAP = {
    en: 'en-US',
    es: 'es-ES',
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
    }
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  function setPersona(persona) {
    if (persona) {
      currentPersona = String(persona);
    }
  }

  function getPersona() {
    return currentPersona;
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
      // Iconic DBZ Instant Transmission "bwoop-zing!" phase chirp
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
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.34);
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(420, now);
      shimmer.frequency.exponentialRampToValueAtTime(1480, now + 0.34);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(gain);
      shimmer.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      shimmer.start(now);
      osc.stop(now + 0.37);
      shimmer.stop(now + 0.37);
    } else if (type === 'beam_fire') {
      // Punchy anime energy cannon boom + plasma roar
      const sub = ctx.createOscillator();
      const roar = ctx.createOscillator();
      const gain = ctx.createGain();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(190, now);
      sub.frequency.exponentialRampToValueAtTime(44, now + 0.62);
      roar.type = 'square';
      roar.frequency.setValueAtTime(520, now);
      roar.frequency.exponentialRampToValueAtTime(115, now + 0.58);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      sub.connect(gain);
      roar.connect(gain);
      gain.connect(ctx.destination);
      sub.start(now);
      roar.start(now);
      sub.stop(now + 0.66);
      roar.stop(now + 0.66);
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
      if (lang === 'yue' && /^(yue|zh-HK|zh_HK)/i.test(v.lang)) s += 50;
      if (lang === 'nl' && /Google Nederlands|Xander|Claire|Colette|Fenna|Maarten/i.test(name)) s += 35;
      if (lang === 'de' && /Google Deutsch|Anna|Petra|Katja|Conrad|Martin/i.test(name)) s += 35;
      if (lang === 'ar' && /Google العربية|Maged|Tarik|Laila|Mariam|Zariyah|Salma/i.test(name)) s += 35;
      if (v.localService) s += 12;
      return s;
    }

    return pool.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
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

  let liveTtsApiAvailable = null; // null = untested, true = live server, false = static CDN

  function playStaticChirpOrFallback(cleaned, targetLang, audioKey, token, finishClean) {
    if (!audioKey) {
      speakBrowserFallback(cleaned, targetLang, token, finishClean);
      return;
    }
    const safeLang = /^[a-z]{2,3}$/.test(targetLang) ? targetLang : 'en';
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
        speakBrowserFallback(cleaned, targetLang, token, finishClean);
      }
    };
    audio.play().catch(function () {
      if (token === speechToken) {
        activeAudioEl = null;
        speakBrowserFallback(cleaned, targetLang, token, finishClean);
      }
    });
  }

  function speakText(text, lang, onStateChange, audioKey) {
    stopSpeaking();
    if (!soundEnabled) return false;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return false;

    const token = ++speechToken;
    const targetLang = lang || 'en';
    const ttsLang = targetLang === 'zh' ? 'zh-CN' : targetLang === 'yue' ? 'yue-HK' : targetLang;

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

    // On static Firebase Hosting (once /api/tts returns 404/405), go straight to pre-rendered Chirp 3 HD CDN MP3!
    if (liveTtsApiAvailable === false) {
      playStaticChirpOrFallback(cleaned, targetLang, audioKey, token, finishClean);
      return true;
    }

    const ctrl = new AbortController();
    activeAbortCtrl = ctrl;

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleaned,
        lang: ttsLang,
        persona: currentPersona,
        speakingRate: 1.0
      }),
      signal: ctrl.signal
    })
      .then((res) => {
        if (res.status === 404 || res.status === 405) {
          liveTtsApiAvailable = false;
          throw new Error('Static host — use pre-rendered Chirp CDN MP3');
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
            playStaticChirpOrFallback(cleaned, targetLang, audioKey, token, finishClean);
          }
        };
        audio.play().catch(function () {
          cleanupUrl();
          if (token === speechToken) {
            playStaticChirpOrFallback(cleaned, targetLang, audioKey, token, finishClean);
          }
        });
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return;
        if (token !== speechToken) return;
        playStaticChirpOrFallback(cleaned, targetLang, audioKey, token, finishClean);
      });

    return true;
  }

  function isSpeaking() {
    return Boolean(activeStateCallback);
  }

  window.DB_AUDIO = {
    playSound,
    speakText,
    stopSpeaking,
    isSpeaking,
    setSoundEnabled,
    isSoundEnabled,
    setPersona,
    getPersona
  };
})();
