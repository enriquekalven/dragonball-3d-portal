/* ==========================================================================
   DRAGON BALL 3D PORTAL — MULTILINGUAL + CHIRP 3 HD UI CONTROLLER
   Supports all 13 Languages (en, es, es-419, zh, yue, ja, ko, pt, fr, it, de, nl, ar)
   Security Note: Strictly uses document.createElement() and textContent for
   all DOM rendering (zero innerHTML / outerHTML / insertAdjacentHTML).
   ========================================================================== */

(function () {
  'use strict';

  const BASE_DATA = window.DB_PORTAL_DATA;
  const I18N = window.DB_I18N;
  const AUDIO = window.DB_AUDIO;
  const RENDERER = window.DB_RENDERER_3D;
  const ANALYTICS = window.DB_ANALYTICS;

  let activeData = BASE_DATA;

  function track(eventName, params) {
    if (ANALYTICS && typeof ANALYTICS.trackEvent === 'function') {
      ANALYTICS.trackEvent(eventName, params);
    }
  }

  function centerActiveRailItem(containerEl) {
    if (!containerEl) return;
    window.requestAnimationFrame(() => {
      const activeBtn = containerEl.querySelector('.active');
      if (!activeBtn || containerEl.scrollWidth <= containerEl.clientWidth) return;
      const targetLeft =
        activeBtn.offsetLeft - containerEl.clientWidth * 0.5 + activeBtn.offsetWidth * 0.5;
      containerEl.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    });
  }

  function findFighterById(dataObj, id) {
    return dataObj.fighters.find((f) => f.id === id) || dataObj.fighters[0];
  }

  function shuffleArray(items) {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  const THEME_STORAGE_KEY = 'db-portal-theme';

  function detectInitialTheme() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
    } catch (_e) {}
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_e) {}
    return 'dark';
  }

  function applyThemeToDom(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#ffffff' : '#070b14');
    }
    const themeBtn = document.getElementById('toggle-theme-btn');
    const themeLabel = document.getElementById('theme-state-label');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
    if (themeLabel) {
      themeLabel.textContent = theme === 'light' ? tr('themeDark') : tr('themeLight');
    }
  }

  const initialLang = I18N.detectInitialLanguage();
  const initialTheme = detectInitialTheme();

  const state = {
    lang: initialLang,
    theme: initialTheme,
    activeMode: 'fighters',
    lastLoreMode: 'hair-guide',
    selectedArenaId: BASE_DATA.arenas[0].id,
    selectedArena: BASE_DATA.arenas[0],
    selectedRoleFilter: 'all',
    rosterSearchQuery: '',
    selectedFighterId: 'goku',
    selectedFighter: BASE_DATA.fighters[0],
    selectedFighterFormIndex: 1,
    activeFighterForm: BASE_DATA.fighters[0].forms[1] || BASE_DATA.fighters[0].forms[0],
    selectedHairFormId: 'ui-silver',
    selectedHairForm: BASE_DATA.hairForms.find((h) => h.id === 'ui-silver') || BASE_DATA.hairForms[0],
    selectedFusionRecipeId: BASE_DATA.fusionRecipes[0].id,
    selectedFusionRecipe: BASE_DATA.fusionRecipes[0],
    fusionSpriteA: BASE_DATA.fighters[0].spriteUrl,
    fusionSpriteB: BASE_DATA.fighters[1].spriteUrl,
    fusionAnimTimer: 0,
    selectedEraFilter: 'ALL',
    selectedSagaId: 'dbs-gods-frieza',
    selectedSaga: BASE_DATA.timelineSagas.find((s) => s.id === 'dbs-gods-frieza') || BASE_DATA.timelineSagas[0],
    battleFighterIdA: 'goku',
    battleFighterA: findFighterById(BASE_DATA, 'goku'),
    battleFormIndexA: Math.max(0, findFighterById(BASE_DATA, 'goku').forms.length - 1),
    battleFormA:
      findFighterById(BASE_DATA, 'goku').forms[findFighterById(BASE_DATA, 'goku').forms.length - 1] ||
      findFighterById(BASE_DATA, 'goku').forms[0],
    battleFighterIdB: 'beerus',
    battleFighterB: findFighterById(BASE_DATA, 'beerus'),
    battleFormIndexB: 0,
    battleFormB: findFighterById(BASE_DATA, 'beerus').forms[0],
    beamGame: {
      active: false,
      position: 0.5,
      intervalId: null,
      winnerSide: null // 'player' | 'rival' | null
    },
    scouterActive: false,
    powerBurstTimer: 45,
    hasLightningActive: false,
    kiCharge: 0,
    kiChargingHold: false,
    fighterPos3D: {
      x: 0,
      y: 0,
      z: 0,
      arrivalTimer: 0,
      returnTimer: 0
    },
    teleportSpotIdx: 0,
    teleportGhost: null,
    signatureAttack: null,
    arenaCrater: null,
    hiddenBall: {
      angle: 2.25,
      radius: 192,
      cooldown: 0,
      lastScreenPos: null
    },
    currentStageSpriteUrl: BASE_DATA.fighters[0].spriteUrl,
    currentStageAuraHex: '#ffd000',
    quizOrder: [], // shuffled indices into activeData.quizQuestions
    quizOptionPermutations: [], // per-question shuffled indices [0..3]
    quizIndex: 0,
    quizScore: 0,
    dragonBallsCollected: 0,
    shenronSummonedOnce: false,
    quizAnswered: false,
    lastQuizSelectedPermIdx: -1,
    camera: {
      rotY: 0.16,
      rotX: 0.08,
      zoom: 1.0,
      targetRotY: null,
      isDragging: false,
      lastX: 0,
      lastY: 0
    }
  };

  let toastTimeoutId = null;
  function showStageToast(message) {
    const el = document.getElementById('stage-toast');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
    if (toastTimeoutId) window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
      el.classList.add('hidden');
    }, 2600);
  }

  function extractShortName(fullName) {
    return String(fullName || '')
      .split('(')[0]
      .split('（')[0]
      .trim();
  }

  function getActiveSignatureAttackSpec() {
    let rawMove = '';
    let atkKey = 'atk_goku';
    let entityId = 'goku';

    if (state.activeMode === 'fighters' || state.activeMode === 'quiz') {
      const f = state.selectedFighter || BASE_DATA.fighters[0];
      rawMove = f ? f.signatureMove : 'Kamehameha';
      const isKidGoku = f && f.id === 'goku' && state.selectedFighterFormIndex === 0;
      entityId = isKidGoku ? 'kid_goku' : (f ? f.id : 'goku');
      atkKey = isKidGoku ? 'atk_kid_goku' : 'atk_' + (f ? f.id : 'goku');
    } else if (state.activeMode === 'fusion-lab') {
      const fid = state.selectedFusionRecipe ? state.selectedFusionRecipe.id : '';
      if (fid.indexOf('potara') !== -1) {
        rawMove = 'Final Kamehameha';
        entityId = 'vegetto';
        atkKey = 'atk_vegetto';
      } else if (fid.indexOf('goten') !== -1) {
        rawMove = 'Super Ghost Kamikaze';
        entityId = 'gotenks';
        atkKey = 'atk_gotenks';
      } else if (fid.indexOf('piccolo') !== -1) {
        rawMove = 'Special Beam Cannon';
        entityId = 'piccolo';
        atkKey = 'atk_piccolo';
      } else {
        rawMove = 'Stardust Breaker';
        entityId = 'gogeta';
        atkKey = 'atk_gogeta';
      }
    } else if (state.activeMode === 'hair-guide') {
      const hfId = (state.selectedHairForm && state.selectedHairForm.id) || '';
      const charLow = ((state.selectedHairForm && state.selectedHairForm.characterName) || '').toLowerCase();
      if (charLow.indexOf('vegeta') !== -1 || hfId.indexOf('ego') !== -1) {
        rawMove = 'Final Flash';
        entityId = 'vegeta';
        atkKey = 'atk_vegeta';
      } else if (charLow.indexOf('gohan') !== -1 || hfId.indexOf('beast') !== -1) {
        rawMove = 'Special Beam Cannon';
        entityId = 'gohan';
        atkKey = 'atk_gohan';
      } else if (charLow.indexOf('freezer') !== -1 || charLow.indexOf('frieza') !== -1) {
        rawMove = 'Death Ball';
        entityId = 'freezer';
        atkKey = 'atk_freezer';
      } else if (charLow.indexOf('broly') !== -1 || hfId.indexOf('legendary') !== -1) {
        rawMove = 'Gigantic Roar';
        entityId = 'broly';
        atkKey = 'atk_broly';
      } else if (charLow.indexOf('black') !== -1 || hfId.indexOf('rose') !== -1) {
        rawMove = 'Divine Lasso';
        entityId = 'goku-black';
        atkKey = 'atk_goku-black';
      } else {
        rawMove = 'Kamehameha';
        entityId = 'goku';
        atkKey = 'atk_goku';
      }
    } else if (state.activeMode === 'timeline') {
      const sagaId = (state.selectedSaga && state.selectedSaga.id) || '';
      rawMove = 'Kamehameha';
      if (
        sagaId.indexOf('pilaf') !== -1 ||
        sagaId.indexOf('red-ribbon') !== -1 ||
        sagaId.indexOf('daima') !== -1
      ) {
        entityId = 'kid_goku';
        atkKey = 'atk_kid_goku';
      } else if (sagaId.indexOf('cell') !== -1) {
        entityId = 'gohan';
        atkKey = 'atk_gohan';
      } else {
        entityId = 'goku';
        atkKey = 'atk_goku';
      }
    }

    const primary = String(rawMove || 'Kamehameha')
      .split(/[,،•·、，/]/)[0]
      .replace(/\([^)]*\)/g, '')
      .replace(/（[^）]*）/g, '')
      .trim();
    const moveName = primary.length > 24 ? primary.slice(0, 22).trim() : (primary || 'Kamehameha');
    const isKamehameha =
      atkKey === 'atk_goku' ||
      atkKey === 'atk_kid_goku' ||
      atkKey === 'atk_goten' ||
      /kamehameha|かめはめ波|龟派气功|龜波氣功|에네르기파|كاميهاميها/i.test(moveName);

    return {
      moveName: moveName,
      atkKey: atkKey,
      entityId: entityId,
      isKamehameha: isKamehameha
    };
  }

  function getActivePrimarySignatureMove() {
    return getActiveSignatureAttackSpec().moveName;
  }

  function findFusionRecipeForFighter(fighterId) {
    if (!fighterId) return null;
    if (fighterId === 'vegetto') {
      return activeData.fusionRecipes.find((r) => r.id === 'goku-vegeta-potara') || activeData.fusionRecipes[0];
    }
    if (fighterId === 'gogeta') {
      return activeData.fusionRecipes.find((r) => r.id === 'goku-vegeta-dance') || activeData.fusionRecipes[0];
    }
    if (fighterId === 'gotenks' || fighterId === 'goten' || fighterId === 'trunks') {
      return activeData.fusionRecipes.find((r) => r.id === 'goten-trunks-dance') || null;
    }
    return (
      activeData.fusionRecipes.find((r) => r.warriorA === fighterId || r.warriorB === fighterId) ||
      null
    );
  }

  function tr(key, vars) {
    return I18N.t(state.lang, key, vars);
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) {
      el.textContent = String(text);
    }
    return el;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Canonical Akira Toriyama manga/anime star constellations inside a 100x100 crystal sphere
  function getCanonicalStarLayout(starCount) {
    const ring = (n, radius, offsetDeg) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const rad = ((offsetDeg + (360 / n) * i) * Math.PI) / 180;
        pts.push([50 + Math.cos(rad) * radius, 50 + Math.sin(rad) * radius]);
      }
      return pts;
    };
    switch (starCount) {
      case 1:
        return { r: 13.0, points: [[50, 50]] };
      case 2:
        return { r: 10.6, points: [[37, 40], [63, 60]] };
      case 3:
        return { r: 9.8, points: [[50, 31], [33.5, 59.5], [66.5, 59.5]] };
      case 4:
        // Grandpa Gohan's 4-Star Ball (Sushinchu): symmetric diamond/square
        return { r: 9.2, points: [[50, 28.5], [28.5, 50], [71.5, 50], [50, 71.5]] };
      case 5:
        return { r: 8.4, points: [[33, 33], [67, 33], [50, 50], [33, 67], [67, 67]] };
      case 6:
        return { r: 7.8, points: [[50, 50]].concat(ring(5, 23.5, -90)) };
      case 7:
      default:
        return { r: 7.5, points: [[50, 50]].concat(ring(6, 24.0, -90)) };
    }
  }

  function buildFivePointStarPolygonPoints(cx, cy, outerR) {
    const innerR = outerR * 0.42;
    const coords = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = ((-90 + i * 36) * Math.PI) / 180;
      const x = (cx + Math.cos(angle) * r).toFixed(2);
      const y = (cy + Math.sin(angle) * r).toFixed(2);
      coords.push(x + ',' + y);
    }
    return coords.join(' ');
  }

  function createDragonBallSvg(starCount, idSuffix) {
    const gradId = 'db-grad-' + idSuffix + '-' + starCount;
    const glowId = 'db-glow-' + idSuffix + '-' + starCount;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'db-crystal-svg');
    svg.setAttribute('aria-hidden', 'true');

    const defs = document.createElementNS(SVG_NS, 'defs');

    const radGrad = document.createElementNS(SVG_NS, 'radialGradient');
    radGrad.setAttribute('id', gradId);
    radGrad.setAttribute('cx', '35%');
    radGrad.setAttribute('cy', '28%');
    radGrad.setAttribute('r', '70%');

    const stops = [
      ['0%', '#fff7b2'],
      ['32%', '#ffbe0b'],
      ['72%', '#fb6f00'],
      ['94%', '#c2410c'],
      ['100%', '#7c2d12']
    ];
    stops.forEach(([offset, color]) => {
      const st = document.createElementNS(SVG_NS, 'stop');
      st.setAttribute('offset', offset);
      st.setAttribute('stop-color', color);
      radGrad.appendChild(st);
    });

    const innerGlow = document.createElementNS(SVG_NS, 'radialGradient');
    innerGlow.setAttribute('id', glowId);
    innerGlow.setAttribute('cx', '58%');
    innerGlow.setAttribute('cy', '68%');
    innerGlow.setAttribute('r', '45%');
    const gStop1 = document.createElementNS(SVG_NS, 'stop');
    gStop1.setAttribute('offset', '0%');
    gStop1.setAttribute('stop-color', '#fde047');
    gStop1.setAttribute('stop-opacity', '0.52');
    const gStop2 = document.createElementNS(SVG_NS, 'stop');
    gStop2.setAttribute('offset', '100%');
    gStop2.setAttribute('stop-color', '#fb6f00');
    gStop2.setAttribute('stop-opacity', '0');
    innerGlow.appendChild(gStop1);
    innerGlow.appendChild(gStop2);

    defs.appendChild(radGrad);
    defs.appendChild(innerGlow);
    svg.appendChild(defs);

    const sphere = document.createElementNS(SVG_NS, 'circle');
    sphere.setAttribute('cx', '50');
    sphere.setAttribute('cy', '50');
    sphere.setAttribute('r', '46.5');
    sphere.setAttribute('fill', 'url(#' + gradId + ')');
    sphere.setAttribute('stroke', '#9a3412');
    sphere.setAttribute('stroke-width', '2.4');
    svg.appendChild(sphere);

    const caustic = document.createElementNS(SVG_NS, 'circle');
    caustic.setAttribute('cx', '54');
    caustic.setAttribute('cy', '60');
    caustic.setAttribute('r', '36');
    caustic.setAttribute('fill', 'url(#' + glowId + ')');
    svg.appendChild(caustic);

    // Embedded crimson 5-pointed stars inside the amber glass
    const layout = getCanonicalStarLayout(starCount);
    layout.points.forEach(([sx, sy]) => {
      const poly = document.createElementNS(SVG_NS, 'polygon');
      poly.setAttribute('points', buildFivePointStarPolygonPoints(sx, sy, layout.r));
      poly.setAttribute('fill', '#dc2626');
      poly.setAttribute('stroke', '#7f1d1d');
      poly.setAttribute('stroke-width', '1.1');
      poly.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(poly);
    });

    // Top-left curved glass specular highlight (drawn over stars for authentic refractive depth!)
    const specMain = document.createElementNS(SVG_NS, 'ellipse');
    specMain.setAttribute('cx', '32');
    specMain.setAttribute('cy', '24');
    specMain.setAttribute('rx', '16');
    specMain.setAttribute('ry', '8.5');
    specMain.setAttribute('transform', 'rotate(-28 32 24)');
    specMain.setAttribute('fill', '#ffffff');
    specMain.setAttribute('fill-opacity', '0.58');
    svg.appendChild(specMain);

    const specDot = document.createElementNS(SVG_NS, 'circle');
    specDot.setAttribute('cx', '20');
    specDot.setAttribute('cy', '36');
    specDot.setAttribute('r', '3.4');
    specDot.setAttribute('fill', '#ffffff');
    specDot.setAttribute('fill-opacity', '0.48');
    svg.appendChild(specDot);

    return svg;
  }

  function makeReadAloudButton(getSpeechString, audioKey) {
    const btn = createEl('button', 'btn-read-aloud', tr('readAloud'));
    btn.type = 'button';
    let isThisButtonSpeaking = false;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isThisButtonSpeaking) {
        AUDIO.stopSpeaking();
        return;
      }
      track('read_aloud', {
        audio_key: String(audioKey || 'custom'),
        language: state.lang
      });
      AUDIO.speakText(
        getSpeechString(),
        state.lang,
        (speakingNow) => {
          isThisButtonSpeaking = speakingNow;
          btn.classList.toggle('speaking', speakingNow);
          btn.textContent = speakingNow ? tr('stopReading') : tr('readAloud');
        },
        audioKey
      );
    });
    return btn;
  }

  let powerRollInterval = null;
  function animatePowerReadout(finalPowerText) {
    const stageEl = document.getElementById('stage-power-number');
    const hudEl = document.getElementById('hud-target-power');
    if (powerRollInterval) {
      window.clearInterval(powerRollInterval);
      powerRollInterval = null;
    }
    let ticks = 0;
    powerRollInterval = window.setInterval(() => {
      ticks += 1;
      if (ticks >= 6) {
        window.clearInterval(powerRollInterval);
        powerRollInterval = null;
        stageEl.textContent = finalPowerText;
        hudEl.textContent = finalPowerText;
      } else {
        const randomDigits = Math.floor(10000000 + Math.random() * 89999999).toLocaleString();
        stageEl.textContent = randomDigits + '...';
        hudEl.textContent = randomDigits;
      }
    }, 35);
  }

  function getActiveFighterForm(fighter, idx) {
    if (fighter && fighter.forms && fighter.forms.length > 0) {
      const safeIdx = Math.min(idx, fighter.forms.length - 1);
      return fighter.forms[safeIdx];
    }
    return {
      label: fighter.name,
      spriteUrl: fighter.spriteUrl,
      auraHex: fighter.auraColor,
      power: fighter.peakPowerLabel,
      powerScore: 70
    };
  }

  function syncReferencesAfterLanguageLoad() {
    state.selectedArena =
      activeData.arenas.find((a) => a.id === state.selectedArenaId) || activeData.arenas[0];
    state.selectedFighter = findFighterById(activeData, state.selectedFighterId);
    state.activeFighterForm = getActiveFighterForm(
      state.selectedFighter,
      state.selectedFighterFormIndex
    );
    state.selectedHairForm =
      activeData.hairForms.find((h) => h.id === state.selectedHairFormId) || activeData.hairForms[0];
    state.selectedFusionRecipe =
      activeData.fusionRecipes.find((r) => r.id === state.selectedFusionRecipeId) ||
      activeData.fusionRecipes[0];
    state.selectedSaga =
      activeData.timelineSagas.find((s) => s.id === state.selectedSagaId) ||
      activeData.timelineSagas[0];
    state.battleFighterA = findFighterById(activeData, state.battleFighterIdA);
    state.battleFighterB = findFighterById(activeData, state.battleFighterIdB);
    state.battleFormA = getActiveFighterForm(state.battleFighterA, state.battleFormIndexA);
    state.battleFormB = getActiveFighterForm(state.battleFighterB, state.battleFormIndexB);
  }

  function syncToyboxUI() {
    const toybox = document.getElementById('stage-toybox');
    const kiFill = document.getElementById('ki-charge-fill');
    const kiLabel = document.getElementById('ki-btn-label');
    const sigLabel = document.getElementById('signature-btn-label');
    const teleLabel = document.getElementById('teleport-btn-label');
    const stepper = document.getElementById('stage-quick-stepper');

    if (toybox) {
      toybox.classList.toggle('hidden', state.activeMode === 'battle');
    }
    if (stepper) {
      stepper.classList.toggle('hidden', state.activeMode === 'battle' || state.activeMode === 'quiz');
    }

    const pct = Math.round(state.kiCharge || 0);
    if (kiFill) {
      kiFill.style.width = pct + '%';
    }
    if (kiLabel) {
      kiLabel.textContent = pct >= 99 ? tr('toyKiMaxed') : tr('toyChargeKi', { pct: pct });
    }
    if (sigLabel) {
      sigLabel.textContent = tr('toyFireMove', { move: getActivePrimarySignatureMove() });
    }
    if (teleLabel) {
      teleLabel.textContent = tr('toyTeleport');
    }
  }

  function syncDragonBallCounters() {
    const balls = state.dragonBallsCollected || 0;
    const navBadge = document.getElementById('nav-balls-badge');
    if (navBadge) navBadge.textContent = balls + '/7 ★';

    const mobBadge = document.getElementById('mobile-balls-badge');
    if (mobBadge) mobBadge.textContent = balls + '/7';

    const radarBtn = document.getElementById('radar-hunt-btn');
    const radarTxt = document.getElementById('radar-btn-text');
    if (radarTxt) {
      radarTxt.textContent =
        balls >= 7 ? tr('radarSummonBtn') : tr('radarBtnLabel', { balls: balls });
    }
    if (radarBtn) {
      radarBtn.classList.toggle('radar-complete', balls >= 7);
    }
  }

  function renderStaticShellStrings() {
    document.documentElement.lang = state.lang === 'yue' ? 'yue-Hant-HK' : state.lang;
    document.documentElement.dir = I18N.getLanguageDir(state.lang);
    applyThemeToDom(state.theme);

    document.getElementById('ui-brand-title').textContent = tr('brandTitle');
    document.getElementById('ui-brand-sub').textContent = tr('brandSub');

    document.getElementById('tab-btn-fighters').textContent = tr('tabFightersShort');
    document.getElementById('tab-btn-fusion').textContent = tr('tabFusionShort');
    document.getElementById('tab-btn-battle').textContent = tr('tabBattleShort');
    const quizTabTxt = document.getElementById('ui-tab-quiz-text');
    if (quizTabTxt) quizTabTxt.textContent = tr('tabQuizShort');
    document.getElementById('tab-btn-hair').textContent = tr('tabHairShort');
    document.getElementById('tab-btn-timeline').textContent = tr('tabTimelineShort');

    // Sync Lore sub-switcher buttons inside View 2 and View 4
    document.querySelectorAll('.lore-switch-btn').forEach((btn) => {
      const target = btn.getAttribute('data-lore-target');
      btn.textContent = target === 'hair-guide' ? tr('tabHairShort') : tr('tabTimelineShort');
    });

    // Sync Mobile Bottom Bar labels
    const mHeroes = document.getElementById('mnav-heroes');
    const mFuse = document.getElementById('mnav-fuse');
    const mBattle = document.getElementById('mnav-battle');
    const mQuiz = document.getElementById('mnav-quiz');
    const mLore = document.getElementById('mnav-lore');
    if (mHeroes) mHeroes.textContent = tr('mobileNavHeroes');
    if (mFuse) mFuse.textContent = tr('mobileNavFuse');
    if (mBattle) mBattle.textContent = tr('mobileNavBattle');
    if (mQuiz) mQuiz.textContent = tr('mobileNavQuiz');
    if (mLore) mLore.textContent = tr('mobileNavLore');

    const randBtn = document.getElementById('random-fighter-btn');
    if (randBtn) randBtn.textContent = tr('randomFighterBtn');
    const stageHint = document.getElementById('ui-stage-hint');
    if (stageHint) stageHint.textContent = tr('stageInteractiveHint');

    document.getElementById('ui-scouter-prefix').textContent = tr('scouterLabel');
    document.getElementById('scouter-state-label').textContent = state.scouterActive ? tr('on') : tr('off');

    document.getElementById('ui-sound-prefix').textContent = tr('soundLabel');
    document.getElementById('sound-state-label').textContent = AUDIO.isSoundEnabled() ? tr('on') : tr('off');

    document.getElementById('ui-power-level-label').textContent = tr('powerLevelLabel');

    document.getElementById('roster-search-input').placeholder = tr('searchPlaceholder');

    document.getElementById('ui-hair-intro-title').textContent = tr('hairIntroTitle');
    document.getElementById('ui-hair-intro-sub').textContent = tr('hairIntroSub');

    document.getElementById('ui-fusion-intro-title').textContent = tr('fusionIntroTitle');
    document.getElementById('ui-fusion-intro-sub').textContent = tr('fusionIntroSub');
    document.getElementById('ui-fusion-select-heading').textContent = tr('fusionSelectHeading');

    document.getElementById('ui-timeline-intro-title').textContent = tr('timelineIntroTitle');
    document.getElementById('ui-timeline-intro-sub').textContent = tr('timelineIntroSub');

    document.getElementById('ui-battle-title').textContent = tr('battleTitle');
    document.getElementById('ui-battle-sub').textContent = tr('battleSub');
    document.getElementById('ui-player1-label').textContent = tr('player1Label');
    document.getElementById('ui-form1-label').textContent = tr('form1Label');
    document.getElementById('ui-rival2-label').textContent = tr('rival2Label');
    document.getElementById('ui-form2-label').textContent = tr('form2Label');
    document.getElementById('run-battle-btn').textContent = tr('startBeamBtn');

    document.getElementById('ui-quiz-title').textContent = tr('quizTitle');
    document.getElementById('ui-quiz-sub').textContent = tr('quizSub');
    const radarTip = document.getElementById('ui-quiz-radar-tip');
    if (radarTip) radarTip.textContent = tr('quizRadarTip');

    document.getElementById('shenron-title').textContent = tr('shenronTitle');
    document.getElementById('shenron-speech').textContent = tr('shenronSpeech');
    document.getElementById('wish-ui-goku-btn').textContent = tr('wish1Btn');
    document.getElementById('wish-gogeta-btn').textContent = tr('wish2Btn');
    document.getElementById('close-shenron-btn').textContent = tr('wishCloseBtn');

    syncDragonBallCounters();
    syncToyboxUI();

    // Arena dropdown options
    const arenaSelect = document.getElementById('arena-select');
    arenaSelect.replaceChildren();
    activeData.arenas.forEach((arena) => {
      const opt = createEl('option', '', arena.name);
      opt.value = arena.id;
      if (arena.id === state.selectedArenaId) opt.selected = true;
      arenaSelect.appendChild(opt);
    });
  }

  // ==========================================================================
  // STAGE HEADER & BOTTOM TRANSFORMATION DOCK SYNC
  // ==========================================================================
  function syncStageUI(animatePower) {
    state.activeFighterForm = getActiveFighterForm(
      state.selectedFighter,
      state.selectedFighterFormIndex
    );

    const eraBadge = document.getElementById('stage-era-badge');
    const charName = document.getElementById('stage-char-name');
    const dockContainer = document.getElementById('stage-transform-dock');
    const dockLabel = document.getElementById('dock-label-text');
    const dockBtns = document.getElementById('stage-form-buttons');

    const hudName = document.getElementById('hud-target-name');
    const hudForm = document.getElementById('hud-target-form');

    dockBtns.replaceChildren();
    let targetPowerStr = '';

    if (state.activeMode === 'fighters' || state.activeMode === 'quiz') {
      const fighter = state.selectedFighter;
      const activeForm = state.activeFighterForm;

      eraBadge.textContent = fighter.series;
      charName.textContent = fighter.name;
      targetPowerStr = activeForm.power;

      hudName.textContent = fighter.name.toUpperCase();
      hudForm.textContent = activeForm.label.toUpperCase();

      dockContainer.classList.remove('hidden');
      dockLabel.textContent =
        fighter.forms && fighter.forms.length > 1
          ? tr('clickToTransform', { name: fighter.name.toUpperCase(), count: fighter.forms.length })
          : tr('characterForm');

      (fighter.forms || [activeForm]).forEach((formItem, idx) => {
        const btn = createEl('button', 'stage-form-btn');
        btn.type = 'button';
        if (idx === state.selectedFighterFormIndex) btn.classList.add('active');

        const dot = createEl('span', 'form-dot');
        dot.style.backgroundColor = formItem.auraHex || fighter.auraColor;
        btn.appendChild(dot);
        btn.appendChild(createEl('span', '', formItem.label));

        btn.addEventListener('click', () => {
          state.selectedFighterFormIndex = idx;
          state.powerBurstTimer = 65;
          AUDIO.playSound('transform');
          track('transform_fighter', {
            fighter_id: fighter.id,
            form_index: idx,
            form_label: formItem.label,
            language: state.lang
          });
          renderActiveFighterStory();
          syncStageUI(true);
        });
        dockBtns.appendChild(btn);
      });
    } else if (state.activeMode === 'hair-guide') {
      const hf = state.selectedHairForm;
      eraBadge.textContent = hf.era;
      charName.textContent = hf.characterName;
      targetPowerStr = hf.powerExample + ' (' + hf.multiplier + ')';

      hudName.textContent = hf.characterName.toUpperCase();
      hudForm.textContent = hf.shortLabel.toUpperCase();

      dockContainer.classList.remove('hidden');
      dockLabel.textContent = tr('quickSwitchHair');

      activeData.hairForms.forEach((formItem) => {
        const btn = createEl('button', 'stage-form-btn');
        btn.type = 'button';
        if (formItem.id === hf.id) btn.classList.add('active');

        const dot = createEl('span', 'form-dot');
        dot.style.backgroundColor = formItem.hairHex;
        btn.appendChild(dot);
        btn.appendChild(createEl('span', '', formItem.shortLabel));

        btn.addEventListener('click', () => {
          state.selectedHairFormId = formItem.id;
          state.selectedHairForm = formItem;
          state.powerBurstTimer = 65;
          AUDIO.playSound('transform');
          track('select_hair_form', { hair_id: formItem.id, language: state.lang });
          renderHairGuideView();
          syncStageUI(true);
        });
        dockBtns.appendChild(btn);
      });
    } else if (state.activeMode === 'fusion-lab') {
      const rec = state.selectedFusionRecipe;
      eraBadge.textContent = rec.methodName;
      charName.textContent = rec.resultName;
      targetPowerStr = rec.power;

      hudName.textContent = rec.resultName.toUpperCase();
      hudForm.textContent = rec.methodName;

      dockContainer.classList.remove('hidden');
      dockLabel.textContent = tr('chooseFusionRecipe');

      activeData.fusionRecipes.forEach((recipe) => {
        const btn = createEl('button', 'stage-form-btn');
        btn.type = 'button';
        if (recipe.id === rec.id) btn.classList.add('active');

        const dot = createEl('span', 'form-dot');
        dot.style.backgroundColor = recipe.auraHex;
        btn.appendChild(dot);
        btn.appendChild(createEl('span', '', recipe.resultName.replace(/[!！]/g, '')));

        btn.addEventListener('click', () => {
          triggerFusionSequence(recipe);
        });
        dockBtns.appendChild(btn);
      });
    } else if (state.activeMode === 'timeline') {
      const saga = state.selectedSaga;
      eraBadge.textContent = saga.eraFullName + ' • ' + saga.years;
      charName.textContent = saga.title;
      targetPowerStr = saga.hairOrFormUnlocked;

      hudName.textContent = saga.mainHero.toUpperCase();
      hudForm.textContent = saga.era;
      dockContainer.classList.add('hidden');
    } else if (state.activeMode === 'battle') {
      eraBadge.textContent = tr('liveBeamStage');
      charName.textContent = state.battleFormA.label + ' VS ' + state.battleFormB.label;
      targetPowerStr = state.beamGame.active
        ? tr('mashOrClickStage')
        : state.battleFormA.power + ' vs ' + state.battleFormB.power;

      hudName.textContent = state.battleFighterA.name.toUpperCase() + ' VS ' + state.battleFighterB.name.toUpperCase();
      hudForm.textContent = '1V1';
      dockContainer.classList.add('hidden');
    }

    if (AUDIO && typeof AUDIO.setActiveCharacter === 'function') {
      AUDIO.setActiveCharacter(getActiveSignatureAttackSpec().entityId);
    }
    syncToyboxUI();
    centerActiveRailItem(dockBtns);

    if (animatePower) {
      animatePowerReadout(targetPowerStr);
    } else {
      document.getElementById('stage-power-number').textContent = targetPowerStr;
      document.getElementById('hud-target-power').textContent = targetPowerStr;
    }
  }

  // ==========================================================================
  // VIEW 1: CHARACTERS & TRANSFORMATIONS (+ ONE-TAP PLAY SHORTCUTS!)
  // ==========================================================================
  function renderActiveFighterStory() {
    const card = document.getElementById('active-fighter-story');
    card.replaceChildren();

    const fighter = state.selectedFighter;
    const activeForm = getActiveFighterForm(fighter, state.selectedFighterFormIndex);
    const shortName = extractShortName(fighter.name);

    const banner = createEl('div', 'story-banner');
    const portraitBox = createEl('div', 'story-portrait');
    portraitBox.style.borderColor = activeForm.auraHex || fighter.auraColor;

    const img = createEl('img');
    img.src = activeForm.spriteUrl;
    img.alt = fighter.name + ' - ' + activeForm.label;
    portraitBox.appendChild(img);

    const infoCol = createEl('div', 'story-info-col');
    const headerMeta = createEl('div', 'story-header-meta');
    const titleRow = createEl('div', 'story-title-row');
    titleRow.appendChild(createEl('h3', '', fighter.name));

    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', '⚡ ' + activeForm.label + ': ' + activeForm.power));
    actionsWrap.appendChild(
      makeReadAloudButton(() =>
        fighter.name + '. ' + activeForm.label + ', ' + activeForm.power + '. ' + fighter.kidBio + '. ' + tr('signatureMoves') + fighter.signatureMove,
        'fighter_' + fighter.id
      )
    );
    titleRow.appendChild(actionsWrap);

    const subMeta = createEl('p', 'story-submeta', fighter.race + ' • ' + fighter.series);
    headerMeta.appendChild(titleRow);
    headerMeta.appendChild(subMeta);

    infoCol.appendChild(headerMeta);
    infoCol.appendChild(createEl('p', 'story-text story-bio-text', fighter.kidBio));

    banner.appendChild(portraitBox);
    banner.appendChild(infoCol);

    const movesBox = createEl('div', 'moves-callout', tr('signatureMoves') + fighter.signatureMove);

    // Kid-Friendly Contextual One-Tap Shortcuts (Jump straight to Battle, Fusion, or Shenron Quiz!)
    const quickRow = createEl('div', 'quick-play-row');

    const battleJumpBtn = createEl(
      'button',
      'quick-play-chip quick-play-primary',
      tr('quickBattleBtn', { name: shortName })
    );
    battleJumpBtn.type = 'button';
    battleJumpBtn.addEventListener('click', () => {
      state.battleFighterIdA = fighter.id;
      state.battleFighterA = fighter;
      state.battleFormIndexA = state.selectedFighterFormIndex;
      if (state.battleFighterIdB === fighter.id) {
        const altId = fighter.id === 'goku' ? 'freezer' : 'goku';
        state.battleFighterIdB = altId;
        state.battleFighterB = findFighterById(activeData, altId);
        state.battleFormIndexB = Math.max(0, (state.battleFighterB.forms || []).length - 1);
      }
      refreshBattleSelectOptions();
      syncBattleFormsFromState();
      state.beamGame.position = 0.5;
      state.beamGame.winnerSide = null;
      renderBattleOutcomeBox();
      switchMode('battle');
    });
    quickRow.appendChild(battleJumpBtn);

    const matchedFusion = findFusionRecipeForFighter(fighter.id);
    if (matchedFusion) {
      const fuseJumpBtn = createEl(
        'button',
        'quick-play-chip',
        tr('quickFuseBtn', { name: shortName })
      );
      fuseJumpBtn.type = 'button';
      fuseJumpBtn.addEventListener('click', () => {
        state.selectedFusionRecipeId = matchedFusion.id;
        state.selectedFusionRecipe = matchedFusion;
        switchMode('fusion-lab');
      });
      quickRow.appendChild(fuseJumpBtn);
    }

    const quizJumpBtn = createEl(
      'button',
      'quick-play-chip',
      tr('quickQuizBtn', { balls: state.dragonBallsCollected })
    );
    quizJumpBtn.type = 'button';
    quizJumpBtn.addEventListener('click', () => {
      switchMode('quiz');
    });
    quickRow.appendChild(quizJumpBtn);

    card.appendChild(banner);
    card.appendChild(movesBox);
    card.appendChild(quickRow);
  }

  function renderFighterGridOnly() {
    const grid = document.getElementById('fighter-roster-grid');
    const countHeading = document.getElementById('roster-count-heading');
    grid.replaceChildren();

    const q = state.rosterSearchQuery.trim().toLowerCase();
    const filtered = activeData.fighters.filter((f) => {
      const roleMatch = state.selectedRoleFilter === 'all' || f.alignment === state.selectedRoleFilter;
      if (!roleMatch) return false;
      if (!q) return true;
      const inForms = (f.forms || []).some((sf) => sf.label.toLowerCase().indexOf(q) !== -1);
      return (
        f.name.toLowerCase().indexOf(q) !== -1 ||
        f.id.toLowerCase().indexOf(q) !== -1 ||
        f.series.toLowerCase().indexOf(q) !== -1 ||
        f.race.toLowerCase().indexOf(q) !== -1 ||
        f.signatureMove.toLowerCase().indexOf(q) !== -1 ||
        inForms
      );
    });

    if (countHeading) {
      countHeading.textContent = tr('chooseCharacterHeading', { count: filtered.length });
    }

    if (filtered.length === 0) {
      grid.appendChild(createEl('p', 'story-text', tr('noSearchMatch', { query: state.rosterSearchQuery })));
      return;
    }

    filtered.forEach((fighter) => {
      const tile = createEl('button', 'char-tile-btn');
      tile.type = 'button';
      if (fighter.id === state.selectedFighterId) {
        tile.classList.add('active');
      }

      const imgWrap = createEl('div', 'char-tile-img-wrap');
      const img = createEl('img', 'char-tile-img');
      img.src = fighter.spriteUrl;
      img.alt = fighter.name;
      img.loading = 'lazy';
      imgWrap.appendChild(img);

      const nameEl = createEl('div', 'char-tile-name', fighter.name);
      const formCount = fighter.forms ? fighter.forms.length : 1;
      const subEl = createEl(
        'div',
        'char-tile-sub',
        formCount > 1 ? tr('transformationsCount', { count: formCount }) : fighter.series
      );

      tile.appendChild(imgWrap);
      tile.appendChild(nameEl);
      tile.appendChild(subEl);

      tile.addEventListener('click', () => {
        AUDIO.stopSpeaking();
        if (AUDIO.stopAttackShout) AUDIO.stopAttackShout();
        state.signatureAttack = null;
        state.selectedFighterId = fighter.id;
        state.selectedFighter = fighter;
        state.selectedFighterFormIndex = fighter.id === 'goku' ? 1 : 0;
        state.powerBurstTimer = 55;
        AUDIO.playSound('scouter');
        track('select_fighter', {
          fighter_id: fighter.id,
          fighter_name: fighter.name,
          language: state.lang
        });
        renderActiveFighterStory();
        renderFighterGridOnly();
        syncStageUI(true);
        if (window.innerWidth <= 1080) {
          const stageSection = document.querySelector('.character-stage');
          if (stageSection) {
            stageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });

      grid.appendChild(tile);
    });
  }

  function renderFightersView() {
    renderActiveFighterStory();

    const filterRow = document.getElementById('roster-role-filters');
    filterRow.replaceChildren();

    const roles = [
      { id: 'all', label: tr('roleAll', { count: activeData.fighters.length }) },
      { id: 'hero', label: tr('roleHero') },
      { id: 'villain', label: tr('roleVillain') },
      { id: 'deity', label: tr('roleDeity') }
    ];

    roles.forEach((role) => {
      const btn = createEl('button', 'filter-btn', role.label);
      btn.type = 'button';
      if (state.selectedRoleFilter === role.id) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.selectedRoleFilter = role.id;
        AUDIO.playSound('scouter');
        renderFightersView();
      });
      filterRow.appendChild(btn);
    });

    renderFighterGridOnly();
  }

  // ==========================================================================
  // VIEW 2: HAIR COLOR GUIDE
  // ==========================================================================
  function renderHairGuideView() {
    const detail = document.getElementById('hair-selected-detail');
    const grid = document.getElementById('hair-color-grid');
    detail.replaceChildren();
    grid.replaceChildren();

    const hf = state.selectedHairForm;

    const banner = createEl('div', 'story-banner');
    const portraitBox = createEl('div', 'story-portrait');
    portraitBox.style.borderColor = hf.hairHex;
    const img = createEl('img');
    img.src = hf.spriteUrl;
    img.alt = hf.name;
    portraitBox.appendChild(img);

    const info = createEl('div', 'story-info-col');
    const headerMeta = createEl('div', 'story-header-meta');
    const titleRow = createEl('div', 'story-title-row');
    titleRow.appendChild(createEl('h3', '', hf.name));

    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', hf.multiplier));
    actionsWrap.appendChild(
      makeReadAloudButton(() =>
        hf.name + '. ' + hf.multiplier + '. ' + hf.meaningForKids + '. ' + tr('funFactLabel') + hf.funFact,
        'hair_' + hf.id
      )
    );
    titleRow.appendChild(actionsWrap);
    headerMeta.appendChild(titleRow);

    info.appendChild(headerMeta);
    info.appendChild(createEl('p', 'story-text story-bio-text', hf.meaningForKids));
    banner.appendChild(portraitBox);
    banner.appendChild(info);

    const howBox = createEl(
      'div',
      'moves-callout',
      tr('howUnlockedLabel') + hf.howUnlocked + ' • ' + tr('funFactLabel') + hf.funFact
    );

    detail.appendChild(banner);
    detail.appendChild(howBox);

    activeData.hairForms.forEach((item) => {
      const btn = createEl('button', 'hair-card-btn');
      btn.type = 'button';
      if (item.id === hf.id) btn.classList.add('active');

      const avatar = createEl('img', 'hair-card-avatar');
      avatar.src = item.spriteUrl;
      avatar.alt = item.shortLabel;
      avatar.loading = 'lazy';
      avatar.style.borderColor = item.hairHex;

      const meta = createEl('div', 'hair-card-meta');
      meta.appendChild(createEl('strong', '', item.shortLabel));
      meta.appendChild(createEl('small', '', item.multiplier));

      btn.appendChild(avatar);
      btn.appendChild(meta);

      btn.addEventListener('click', () => {
        AUDIO.stopSpeaking();
        state.selectedHairFormId = item.id;
        state.selectedHairForm = item;
        state.powerBurstTimer = 65;
        AUDIO.playSound('transform');
        track('select_hair_form', { hair_id: item.id, language: state.lang });
        renderHairGuideView();
        syncStageUI(true);
        if (window.innerWidth <= 1080) {
          detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      grid.appendChild(btn);
    });
  }

  // ==========================================================================
  // VIEW 3: INTERACTIVE FUSION LAB
  // ==========================================================================
  function triggerFusionSequence(recipe) {
    AUDIO.stopSpeaking();
    state.selectedFusionRecipeId = recipe.id;
    state.selectedFusionRecipe = recipe;
    const fA = findFighterById(activeData, recipe.warriorA);
    const fB = findFighterById(activeData, recipe.warriorB);
    state.fusionSpriteA = recipe.spriteA || fA.spriteUrl;
    state.fusionSpriteB = recipe.spriteB || fB.spriteUrl;
    state.fusionAnimTimer = 80;
    state.powerBurstTimer = 85;
    AUDIO.playSound('fusion');
    track('trigger_fusion', {
      recipe_id: recipe.id,
      result_name: recipe.resultName,
      language: state.lang
    });
    renderFusionLabView();
    syncStageUI(true);
  }

  function renderFusionLabView() {
    const activeCard = document.getElementById('fusion-selected-detail');
    const recipeGrid = document.getElementById('fusion-recipes-grid');
    activeCard.replaceChildren();
    recipeGrid.replaceChildren();

    const rec = state.selectedFusionRecipe;
    const fA = findFighterById(activeData, rec.warriorA);
    const fB = findFighterById(activeData, rec.warriorB);
    const displayLabelA = rec.labelA || fA.name.split('(')[0].trim();
    const displayLabelB =
      rec.labelB ||
      (rec.warriorA === rec.warriorB ? tr('kamiShenron') : fB.name.split('(')[0].trim());

    const formulaRow = createEl('div', 'fusion-formula-row');

    const boxA = createEl('div', 'fusion-fighter-pill');
    const imgA = createEl('img', 'battle-mini-img');
    imgA.src = rec.spriteA || fA.spriteUrl;
    imgA.alt = displayLabelA;
    boxA.appendChild(imgA);
    boxA.appendChild(createEl('span', '', displayLabelA));

    const plusSign = createEl('div', 'vs-circle', '+');

    const boxB = createEl('div', 'fusion-fighter-pill');
    const imgB = createEl('img', 'battle-mini-img');
    imgB.src = rec.spriteB || fB.spriteUrl;
    imgB.alt = displayLabelB;
    boxB.appendChild(imgB);
    boxB.appendChild(createEl('span', '', displayLabelB));

    const eqSign = createEl('div', 'vs-circle', '⇒');

    const boxRes = createEl('div', 'fusion-fighter-pill fusion-result-highlight');
    boxRes.style.borderColor = rec.auraHex;
    const imgRes = createEl('img', 'battle-mini-img');
    imgRes.src = rec.resultSprite;
    imgRes.alt = rec.resultName;
    boxRes.appendChild(imgRes);
    boxRes.appendChild(createEl('strong', '', rec.resultName));

    formulaRow.appendChild(boxA);
    formulaRow.appendChild(plusSign);
    formulaRow.appendChild(boxB);
    formulaRow.appendChild(eqSign);
    formulaRow.appendChild(boxRes);

    const headerRow = createEl('div', 'story-title-row');
    headerRow.appendChild(createEl('h3', '', rec.resultName));
    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', '⚡ ' + rec.power));
    actionsWrap.appendChild(
      makeReadAloudButton(() => rec.methodName + '. ' + rec.resultName + '. ' + rec.power + '. ' + rec.story, 'fusion_' + rec.id)
    );
    headerRow.appendChild(actionsWrap);

    const fuseBtn = createEl('button', 'btn-power-up full-btn', tr('replayFusionBtn'));
    fuseBtn.type = 'button';
    fuseBtn.addEventListener('click', () => triggerFusionSequence(rec));

    activeCard.appendChild(headerRow);
    activeCard.appendChild(formulaRow);
    activeCard.appendChild(createEl('p', 'story-text', rec.story));
    activeCard.appendChild(fuseBtn);

    activeData.fusionRecipes.forEach((item) => {
      const btn = createEl('button', 'saga-row-btn');
      btn.type = 'button';
      if (item.id === rec.id) btn.classList.add('active');

      const thumb = createEl('img', 'saga-row-img');
      thumb.src = item.resultSprite;
      thumb.alt = item.resultName;
      thumb.loading = 'lazy';

      const mid = createEl('div', 'saga-row-mid');
      mid.appendChild(createEl('strong', '', item.resultName));
      mid.appendChild(createEl('p', 'muted-sub', item.methodName));

      const badge = createEl('span', 'gold-badge saga-row-badge', item.power);

      btn.appendChild(thumb);
      btn.appendChild(mid);
      btn.appendChild(badge);

      btn.addEventListener('click', () => {
        triggerFusionSequence(item);
        if (window.innerWidth <= 1080) {
          const stageSection = document.querySelector('.character-stage');
          if (stageSection) stageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      recipeGrid.appendChild(btn);
    });
  }

  // ==========================================================================
  // VIEW 4: STORY TIMELINE
  // ==========================================================================
  function renderTimelineView() {
    const tabsRow = document.getElementById('era-filter-tabs');
    const detail = document.getElementById('saga-selected-detail');
    const list = document.getElementById('saga-timeline-list');

    tabsRow.replaceChildren();
    detail.replaceChildren();
    list.replaceChildren();

    const eras = [
      { id: 'ALL', label: tr('eraAll') },
      { id: 'DB', label: tr('eraDB') },
      { id: 'DBZ', label: tr('eraDBZ') },
      { id: 'DAIMA', label: tr('eraDaima') },
      { id: 'DBGT', label: tr('eraDBGT') },
      { id: 'DBS', label: tr('eraDBS') }
    ];

    eras.forEach((era) => {
      const btn = createEl('button', 'filter-btn', era.label);
      btn.type = 'button';
      if (state.selectedEraFilter === era.id) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.selectedEraFilter = era.id;
        const matching = era.id === 'ALL'
          ? activeData.timelineSagas
          : activeData.timelineSagas.filter((s) => s.era === era.id);
        if (matching.length > 0 && !matching.some((s) => s.id === state.selectedSagaId)) {
          state.selectedSagaId = matching[0].id;
          state.selectedSaga = matching[0];
        }
        AUDIO.playSound('scouter');
        renderTimelineView();
        syncStageUI(false);
      });
      tabsRow.appendChild(btn);
    });

    const saga = state.selectedSaga;
    const banner = createEl('div', 'story-banner');
    const pBox = createEl('div', 'story-portrait');
    pBox.style.borderColor = saga.planetColor;
    const sImg = createEl('img');
    sImg.src = saga.spriteUrl;
    sImg.alt = saga.title;
    pBox.appendChild(sImg);

    const sInfo = createEl('div', 'story-info-col');
    const headerMeta = createEl('div', 'story-header-meta');
    const tRow = createEl('div', 'story-title-row');
    tRow.appendChild(createEl('h3', '', saga.title));

    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', saga.eraFullName + ' (' + saga.years + ')'));
    actionsWrap.appendChild(
      makeReadAloudButton(() =>
        saga.eraFullName + '. ' + saga.title + '. ' + saga.keyEvents + '. ' + tr('lessonLabel') + saga.kidLesson,
        'saga_' + saga.id
      )
    );
    tRow.appendChild(actionsWrap);
    headerMeta.appendChild(tRow);

    sInfo.appendChild(headerMeta);
    sInfo.appendChild(createEl('p', 'story-text story-bio-text', saga.keyEvents));
    banner.appendChild(pBox);
    banner.appendChild(sInfo);

    const enemyCallout = createEl(
      'div',
      'moves-callout',
      tr('mainVillainsLabel') + saga.mainEnemy + ' • ' + tr('unlockedLabel') + saga.hairOrFormUnlocked + ' • ' + tr('lessonLabel') + saga.kidLesson
    );

    detail.appendChild(banner);
    detail.appendChild(enemyCallout);

    const filteredSagas = state.selectedEraFilter === 'ALL'
      ? activeData.timelineSagas
      : activeData.timelineSagas.filter((s) => s.era === state.selectedEraFilter);

    filteredSagas.forEach((item) => {
      const row = createEl('button', 'saga-row-btn');
      row.type = 'button';
      if (item.id === saga.id) row.classList.add('active');

      const rImg = createEl('img', 'saga-row-img');
      rImg.src = item.spriteUrl;
      rImg.alt = item.title;
      rImg.loading = 'lazy';

      const mid = createEl('div', 'saga-row-mid');
      mid.appendChild(createEl('strong', '', item.title));
      mid.appendChild(createEl('p', 'muted-sub', tr('villainShort') + item.mainEnemy));

      const tag = createEl('span', 'gold-badge saga-row-badge', item.era);

      row.appendChild(rImg);
      row.appendChild(mid);
      row.appendChild(tag);

      row.addEventListener('click', () => {
        AUDIO.stopSpeaking();
        state.selectedSagaId = item.id;
        state.selectedSaga = item;
        state.powerBurstTimer = 45;
        AUDIO.playSound('scouter');
        track('select_saga', { saga_id: item.id, era: item.era, language: state.lang });
        renderTimelineView();
        syncStageUI(false);
        if (window.innerWidth <= 1080) {
          detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });

      list.appendChild(row);
    });
  }

  // ==========================================================================
  // VIEW 5A: FORM-VS-FORM PLAYABLE 1V1 BEAM STRUGGLE
  // ==========================================================================
  function stopBeamGameLoop() {
    if (state.beamGame.intervalId) {
      window.clearInterval(state.beamGame.intervalId);
      state.beamGame.intervalId = null;
    }
    state.beamGame.active = false;
  }

  function populateFormSelect(selectEl, fighter, selectedIdx) {
    selectEl.replaceChildren();
    const forms = fighter.forms && fighter.forms.length > 0
      ? fighter.forms
      : [getActiveFighterForm(fighter, 0)];
    forms.forEach((formObj, idx) => {
      const opt = createEl('option', '', formObj.label + ' (' + formObj.power + ')');
      opt.value = String(idx);
      if (idx === selectedIdx) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function refreshBattleSelectOptions() {
    const selFighterA = document.getElementById('sim-fighter-a');
    const selFormA = document.getElementById('sim-form-a');
    const selFighterB = document.getElementById('sim-fighter-b');
    const selFormB = document.getElementById('sim-form-b');

    selFighterA.replaceChildren();
    selFighterB.replaceChildren();

    activeData.fighters.forEach((f) => {
      const optA = createEl('option', '', f.name);
      optA.value = f.id;
      if (f.id === state.battleFighterIdA) optA.selected = true;
      selFighterA.appendChild(optA);

      const optB = createEl('option', '', f.name);
      optB.value = f.id;
      if (f.id === state.battleFighterIdB) optB.selected = true;
      selFighterB.appendChild(optB);
    });

    populateFormSelect(selFormA, state.battleFighterA, state.battleFormIndexA);
    populateFormSelect(selFormB, state.battleFighterB, state.battleFormIndexB);
  }

  function syncBattleFormsFromState() {
    state.battleFighterA = findFighterById(activeData, state.battleFighterIdA);
    state.battleFighterB = findFighterById(activeData, state.battleFighterIdB);
    state.battleFormA = getActiveFighterForm(state.battleFighterA, state.battleFormIndexA);
    state.battleFormB = getActiveFighterForm(state.battleFighterB, state.battleFormIndexB);
  }

  function updateBeamMeterDOM() {
    const fill = document.getElementById('beam-tug-fill');
    if (fill) {
      const pct = Math.round(Math.max(4, Math.min(96, state.beamGame.position * 100)));
      fill.style.width = pct + '%';
      fill.style.backgroundColor = state.battleFormA.auraHex || '#00e5ff';
    }
  }

  function checkBeamWinner() {
    if (state.beamGame.position >= 0.92) {
      stopBeamGameLoop();
      state.powerBurstTimer = 90;
      AUDIO.playSound('fusion');
      state.beamGame.winnerSide = 'player';
      renderBattleOutcomeBox();
      syncStageUI(false);
    } else if (state.beamGame.position <= 0.08) {
      stopBeamGameLoop();
      state.powerBurstTimer = 90;
      AUDIO.playSound('burst');
      state.beamGame.winnerSide = 'rival';
      renderBattleOutcomeBox();
      syncStageUI(false);
    }
  }

  function pushBeamForPlayer() {
    if (!state.beamGame.active) return;
    const scoreA = state.battleFormA.powerScore || 70;
    const scoreB = state.battleFormB.powerScore || 70;
    const diffBonus = Math.max(-0.022, Math.min(0.03, (scoreA - scoreB) * 0.0008));
    state.beamGame.position = Math.min(0.98, state.beamGame.position + 0.068 + diffBonus);
    state.powerBurstTimer = 20;
    AUDIO.playSound('clash_hit');
    updateBeamMeterDOM();
    checkBeamWinner();
  }

  function startInteractiveBeamStruggle() {
    stopBeamGameLoop();
    syncBattleFormsFromState();
    state.beamGame.active = true;
    state.beamGame.position = 0.5;
    state.beamGame.winnerSide = null;
    state.powerBurstTimer = 60;
    AUDIO.playSound('burst');
    if (AUDIO && typeof AUDIO.playAttackShout === 'function') {
      const p1IsKid = state.battleFighterIdA === 'goku' && state.battleFormIndexA === 0;
      const p1AtkKey = p1IsKid ? 'atk_kid_goku' : 'atk_' + state.battleFighterIdA;
      AUDIO.playAttackShout(
        p1AtkKey,
        state.battleFighterA ? state.battleFighterA.signatureMove : 'Kamehameha',
        state.lang
      );
    }
    track('start_beam_struggle', {
      fighter_a: state.battleFighterIdA,
      form_a: state.battleFormA.label,
      fighter_b: state.battleFighterIdB,
      form_b: state.battleFormB.label,
      language: state.lang
    });
    renderBattleOutcomeBox();
    syncStageUI(false);

    const scoreA = state.battleFormA.powerScore || 70;
    const scoreB = state.battleFormB.powerScore || 70;
    const aiPushPerTick = Math.max(0.011, Math.min(0.032, 0.019 + (scoreB - scoreA) * 0.00035));

    state.beamGame.intervalId = window.setInterval(() => {
      if (!state.beamGame.active) return;
      state.beamGame.position = Math.max(0.02, state.beamGame.position - aiPushPerTick);
      updateBeamMeterDOM();
      checkBeamWinner();
    }, 65);
  }

  function renderBattleOutcomeBox() {
    const out = document.getElementById('battle-sim-output');
    out.replaceChildren();

    const fA = state.battleFighterA;
    const fB = state.battleFighterB;
    const formA = state.battleFormA;
    const formB = state.battleFormB;

    const portraits = createEl('div', 'battle-clash-portraits');
    const imgA = createEl('img', 'battle-mini-img');
    imgA.src = formA.spriteUrl;
    imgA.alt = formA.label;

    const vsTag = createEl(
      'strong',
      'gold-badge',
      state.beamGame.active ? tr('liveTugBadge') : tr('powerReadoutBadge')
    );

    const imgB = createEl('img', 'battle-mini-img');
    imgB.src = formB.spriteUrl;
    imgB.alt = formB.label;

    portraits.appendChild(imgA);
    portraits.appendChild(vsTag);
    portraits.appendChild(imgB);
    out.appendChild(portraits);

    const meterTrack = createEl('div', 'beam-tug-track');
    meterTrack.style.backgroundColor = formB.auraHex || '#ef4444';
    const meterFill = createEl('div', 'beam-tug-fill');
    meterFill.id = 'beam-tug-fill';
    meterFill.style.width = Math.round(state.beamGame.position * 100) + '%';
    meterFill.style.backgroundColor = formA.auraHex || '#00e5ff';
    meterTrack.appendChild(meterFill);
    out.appendChild(meterTrack);

    if (state.beamGame.active) {
      const pushBtn = createEl('button', 'btn-mash-beam', tr('mashBeamBtn'));
      pushBtn.type = 'button';
      pushBtn.addEventListener('click', pushBeamForPlayer);
      out.appendChild(pushBtn);
    }

    if (state.beamGame.winnerSide === 'player') {
      out.appendChild(
        createEl(
          'strong',
          'winner-banner-text',
          tr('playerVictory', { a: fA.name, formA: formA.label, b: fB.name, formB: formB.label })
        )
      );
    } else if (state.beamGame.winnerSide === 'rival') {
      out.appendChild(
        createEl('strong', 'winner-banner-text', tr('rivalVictory', { b: fB.name, formB: formB.label }))
      );
    } else {
      const loreWinner = (formA.powerScore || 70) >= (formB.powerScore || 70)
        ? fA.name + ' (' + formA.label + ')'
        : fB.name + ' (' + formB.label + ')';
      out.appendChild(
        createEl(
          'p',
          'story-text',
          tr('scouterCompare', {
            formA: formA.label,
            powerA: formA.power,
            formB: formB.label,
            powerB: formB.power,
            winner: loreWinner
          })
        )
      );
    }
  }

  // ==========================================================================
  // VIEW 5B: RANDOMIZED QUIZ + 7-STAR DRAGON BALL SHENRON REWARD
  // ==========================================================================
  function resetAndShuffleQuiz() {
    const indices = activeData.quizQuestions.map((_, idx) => idx);
    state.quizOrder = shuffleArray(indices);
    state.quizOptionPermutations = state.quizOrder.map(() => shuffleArray([0, 1, 2, 3]));
    state.quizIndex = 0;
    state.quizScore = 0;
    state.quizAnswered = false;
    state.lastQuizSelectedPermIdx = -1;
  }

  function mountStaticDragonBalls() {
    const brandOrb = document.getElementById('brand-four-star-ball');
    if (brandOrb) {
      brandOrb.replaceChildren();
      brandOrb.appendChild(createDragonBallSvg(4, 'brand'));
    }
    const modalRow = document.getElementById('shenron-balls-row');
    if (modalRow) {
      modalRow.replaceChildren();
      for (let star = 1; star <= 7; star++) {
        const wrap = createEl('span', 'shenron-modal-ball');
        wrap.appendChild(createDragonBallSvg(star, 'shenron'));
        modalRow.appendChild(wrap);
      }
    }
  }

  function renderDragonBallStarsBar() {
    syncDragonBallCounters();
    const bar = document.getElementById('dragon-balls-progress');
    if (!bar) return;
    bar.replaceChildren();

    for (let star = 1; star <= 7; star++) {
      const orb = createEl(
        'span',
        star <= state.dragonBallsCollected ? 'db-star-orb collected' : 'db-star-orb'
      );
      orb.title = star + '★';
      orb.appendChild(createDragonBallSvg(star, 'quiz'));
      bar.appendChild(orb);
    }
  }

  function openShenronModal() {
    AUDIO.playSound('shenron');
    track('summon_shenron', { language: state.lang });
    document.getElementById('shenron-modal').classList.remove('hidden');
  }

  function awardDragonBall(source) {
    if (state.dragonBallsCollected < 7) {
      state.dragonBallsCollected += 1;
    }
    AUDIO.playSound(source === 'radar' ? 'dragon_ball' : 'transform');
    renderDragonBallStarsBar();

    const scoreBadge = document.getElementById('quiz-score-badge');
    if (scoreBadge && state.quizOrder.length > 0) {
      scoreBadge.textContent = tr('scoreBallsBadge', {
        score: state.quizScore,
        total: state.quizOrder.length,
        balls: state.dragonBallsCollected
      });
    }
    if (state.activeMode === 'fighters') {
      renderActiveFighterStory();
    }

    if (state.dragonBallsCollected === 7 && !state.shenronSummonedOnce) {
      state.shenronSummonedOnce = true;
      window.setTimeout(openShenronModal, 480);
    }
  }

  function collectHiddenBall() {
    if (state.dragonBallsCollected >= 7) {
      openShenronModal();
      return;
    }
    awardDragonBall('radar');
    const starFound = state.dragonBallsCollected;
    state.powerBurstTimer = 55;
    state.hiddenBall.angle = (state.hiddenBall.angle + 2.35 + Math.random() * 1.4) % (Math.PI * 2);
    state.hiddenBall.cooldown = 36;
    state.hiddenBall.lastScreenPos = null;
    showStageToast(tr('radarFoundToast', { star: starFound, balls: state.dragonBallsCollected }));
    track('collect_hidden_dragon_ball', {
      star: starFound,
      dragon_balls: state.dragonBallsCollected,
      language: state.lang
    });
  }

  function focusRadarOnHiddenBall() {
    if (state.dragonBallsCollected >= 7) {
      openShenronModal();
      return;
    }
    if (state.activeMode === 'battle') {
      switchMode('fighters');
    }
    state.hiddenBall.cooldown = 0;
    AUDIO.playSound('scouter');
    // Aim camera so angle + rotY === -0.82 rad (unobstructed front-right foreground)
    const desired = -0.82 - state.hiddenBall.angle;
    const twoPi = Math.PI * 2;
    let delta = (desired - state.camera.rotY) % twoPi;
    if (delta > Math.PI) delta -= twoPi;
    if (delta < -Math.PI) delta += twoPi;
    state.camera.targetRotY = state.camera.rotY + delta;
    track('radar_focus_ball', {
      dragon_balls: state.dragonBallsCollected,
      language: state.lang
    });
  }

  const TELEPORT_PRESETS = [
    { x: -118, y: -28, z: -55 },
    { x: 122, y: -34, z: -48 },
    { x: -92, y: -52, z: 62 },
    { x: 98, y: -20, z: 68 },
    { x: 0, y: -56, z: -78 }
  ];

  function triggerTeleport(normX, normY) {
    if (state.activeMode === 'battle') return;
    const fp = state.fighterPos3D;
    const isCompact = (document.getElementById('db-3d-canvas') || {}).clientWidth < 520;
    const baseY = (isCompact ? 8 : -16) + fp.y;

    state.teleportGhost = {
      x: fp.x,
      y: baseY,
      z: fp.z,
      spriteUrl: state.currentStageSpriteUrl,
      timer: 22
    };

    let nextX = 0;
    let nextY = 0;
    let nextZ = 0;
    if (typeof normX === 'number' && typeof normY === 'number') {
      const clampedX = Math.max(-0.78, Math.min(0.78, normX));
      const clampedY = Math.max(-0.55, Math.min(0.32, normY));
      const screenWorldX = clampedX * 155;
      const screenWorldZ = -35;
      const cosY = Math.cos(-state.camera.rotY);
      const sinY = Math.sin(-state.camera.rotY);
      nextX = screenWorldX * cosY - screenWorldZ * sinY;
      nextZ = screenWorldZ * cosY + screenWorldX * sinY;
      nextY = clampedY * 62;
    } else {
      const spot = TELEPORT_PRESETS[state.teleportSpotIdx % TELEPORT_PRESETS.length];
      state.teleportSpotIdx += 1;
      nextX = spot.x;
      nextY = spot.y;
      nextZ = spot.z;
    }

    state.fighterPos3D = {
      x: nextX,
      y: nextY,
      z: nextZ,
      arrivalTimer: 22,
      returnTimer: 82
    };
    state.powerBurstTimer = Math.max(state.powerBurstTimer, 28);
    AUDIO.playSound('teleport');
    track('stage_teleport', {
      mode: state.activeMode,
      via_canvas: typeof normX === 'number',
      language: state.lang
    });
  }

  function triggerSignatureAttack() {
    if (state.activeMode === 'battle') return;
    const spec = getActiveSignatureAttackSpec();
    const timing =
      AUDIO && typeof AUDIO.playAttackShout === 'function'
        ? AUDIO.playAttackShout(spec.atkKey, spec.moveName, state.lang)
        : { blastAtMs: 2400, durationMs: 4400, getLiveElapsedMs: null };

    state.signatureAttack = {
      active: true,
      moveName: spec.moveName,
      atkKey: spec.atkKey,
      isKamehameha: spec.isKamehameha,
      startedAtMs: performance.now(),
      elapsedMs: 0,
      blastAtMs: timing.blastAtMs,
      durationMs: timing.durationMs,
      getLiveElapsedMs: timing.getLiveElapsedMs,
      craterSpawned: false,
      beamSoundPlayed: false,
      color: state.currentStageAuraHex || '#00e5ff'
    };
    state.powerBurstTimer = 95;
    track('fire_signature_move', {
      move_name: spec.moveName,
      atk_key: spec.atkKey,
      mode: state.activeMode,
      language: state.lang
    });
  }

  function triggerLimitBreakEvolution() {
    state.kiCharge = 0;
    state.kiChargingHold = false;
    state.powerBurstTimer = 95;

    if (state.activeMode === 'fighters' || state.activeMode === 'quiz') {
      const fighter = state.selectedFighter;
      const forms = fighter.forms || [];
      if (forms.length > 1) {
        state.selectedFighterFormIndex = (state.selectedFighterFormIndex + 1) % forms.length;
        const unlocked = forms[state.selectedFighterFormIndex];
        AUDIO.playSound('transform');
        showStageToast(tr('limitBreakToast', { form: unlocked.label }));
        renderActiveFighterStory();
        syncStageUI(true);
        track('ki_limit_break', {
          fighter_id: fighter.id,
          form_label: unlocked.label,
          language: state.lang
        });
        return;
      }
    } else if (state.activeMode === 'hair-guide') {
      const curIdx = activeData.hairForms.findIndex((h) => h.id === state.selectedHairFormId);
      const nextIdx = (curIdx + 1) % activeData.hairForms.length;
      const nextHair = activeData.hairForms[nextIdx];
      state.selectedHairFormId = nextHair.id;
      state.selectedHairForm = nextHair;
      AUDIO.playSound('transform');
      showStageToast(tr('limitBreakToast', { form: nextHair.shortLabel }));
      renderHairGuideView();
      syncStageUI(true);
      return;
    } else if (state.activeMode === 'fusion-lab') {
      triggerFusionSequence(state.selectedFusionRecipe);
      showStageToast(tr('limitBreakToast', { form: state.selectedFusionRecipe.resultName }));
      return;
    }

    AUDIO.playSound('burst');
    syncToyboxUI();
  }

  function stepStageEntity(stepDir) {
    AUDIO.stopSpeaking();
    if (AUDIO.stopAttackShout) AUDIO.stopAttackShout();
    state.signatureAttack = null;
    state.powerBurstTimer = 52;
    AUDIO.playSound('scouter');

    function pickIndex(len, curIdx) {
      if (len <= 1) return 0;
      if (stepDir === 'random') {
        let r = Math.floor(Math.random() * len);
        if (r === curIdx) r = (r + 1) % len;
        return r;
      }
      return (curIdx + stepDir + len) % len;
    }

    if (state.activeMode === 'hair-guide') {
      const cur = Math.max(0, activeData.hairForms.findIndex((h) => h.id === state.selectedHairFormId));
      const next = activeData.hairForms[pickIndex(activeData.hairForms.length, cur)];
      state.selectedHairFormId = next.id;
      state.selectedHairForm = next;
      renderHairGuideView();
      syncStageUI(true);
    } else if (state.activeMode === 'fusion-lab') {
      const cur = Math.max(
        0,
        activeData.fusionRecipes.findIndex((r) => r.id === state.selectedFusionRecipeId)
      );
      const next = activeData.fusionRecipes[pickIndex(activeData.fusionRecipes.length, cur)];
      triggerFusionSequence(next);
    } else if (state.activeMode === 'timeline') {
      const cur = Math.max(
        0,
        activeData.timelineSagas.findIndex((s) => s.id === state.selectedSagaId)
      );
      const next = activeData.timelineSagas[pickIndex(activeData.timelineSagas.length, cur)];
      state.selectedSagaId = next.id;
      state.selectedSaga = next;
      state.selectedEraFilter = 'ALL';
      renderTimelineView();
      syncStageUI(false);
    } else {
      const cur = Math.max(
        0,
        activeData.fighters.findIndex((f) => f.id === state.selectedFighterId)
      );
      const next = activeData.fighters[pickIndex(activeData.fighters.length, cur)];
      state.selectedFighterId = next.id;
      state.selectedFighter = next;
      state.selectedFighterFormIndex =
        stepDir === 'random' && next.forms && next.forms.length > 1
          ? Math.floor(Math.random() * next.forms.length)
          : next.id === 'goku'
            ? 1
            : 0;
      renderActiveFighterStory();
      renderFighterGridOnly();
      syncStageUI(true);
    }

    track('stage_quick_step', {
      direction: String(stepDir),
      mode: state.activeMode,
      language: state.lang
    });
  }

  function renderQuizCard() {
    const scoreBadge = document.getElementById('quiz-score-badge');
    const box = document.getElementById('quiz-question-container');
    box.replaceChildren();

    renderDragonBallStarsBar();
    const totalQ = state.quizOrder.length;
    scoreBadge.textContent = tr('scoreBallsBadge', {
      score: state.quizScore,
      total: totalQ,
      balls: state.dragonBallsCollected
    });

    const rawQIndex = state.quizOrder[state.quizIndex];
    const qData = activeData.quizQuestions[rawQIndex];
    const perm = state.quizOptionPermutations[state.quizIndex];

    const qTopRow = createEl('div', 'story-title-row');
    qTopRow.appendChild(
      createEl('strong', '', tr('questionCounter', { num: state.quizIndex + 1, total: totalQ }) + qData.question)
    );
    qTopRow.appendChild(
      makeReadAloudButton(() =>
        qData.question + '. ' + perm.map((origIdx) => qData.options[origIdx]).join('. '),
        'quiz_' + rawQIndex
      )
    );
    box.appendChild(qTopRow);

    const optList = createEl('div', 'quiz-options-list');
    const feedbackArea = createEl('div');

    function populateFeedback(wasCorrect) {
      feedbackArea.replaceChildren();
      const exp = createEl(
        'div',
        'moves-callout',
        (wasCorrect ? tr('awesomeJob') : tr('goodTry')) + qData.explanation
      );
      const isLast = state.quizIndex + 1 >= totalQ;
      const nextBtn = createEl(
        'button',
        'btn-power-up full-btn',
        isLast ? tr('playNewRound') : tr('nextQuestion')
      );
      nextBtn.type = 'button';
      nextBtn.style.marginTop = '0.6rem';
      nextBtn.addEventListener('click', () => {
        AUDIO.stopSpeaking();
        if (isLast) {
          resetAndShuffleQuiz();
        } else {
          state.quizIndex += 1;
          state.quizAnswered = false;
          state.lastQuizSelectedPermIdx = -1;
        }
        renderQuizCard();
      });
      feedbackArea.appendChild(exp);
      feedbackArea.appendChild(nextBtn);
    }

    perm.forEach((origOptIdx, permIdx) => {
      const isCorrectOpt = origOptIdx === qData.correctIndex;
      const btn = createEl('button', 'quiz-option-btn', qData.options[origOptIdx]);
      btn.type = 'button';

      if (state.quizAnswered) {
        if (isCorrectOpt) btn.classList.add('correct');
        else if (permIdx === state.lastQuizSelectedPermIdx) btn.classList.add('wrong');
      }

      btn.addEventListener('click', () => {
        if (state.quizAnswered) return;
        state.quizAnswered = true;
        state.lastQuizSelectedPermIdx = permIdx;

        Array.from(optList.children).forEach((childBtn, cIdx) => {
          if (perm[cIdx] === qData.correctIndex) {
            childBtn.classList.add('correct');
          }
        });

        if (isCorrectOpt) {
          state.quizScore += 1;
          awardDragonBall('quiz');
        } else {
          btn.classList.add('wrong');
          AUDIO.playSound('scouter');
        }

        track('quiz_answer', {
          correct: isCorrectOpt,
          score: state.quizScore,
          dragon_balls: state.dragonBallsCollected,
          language: state.lang
        });

        populateFeedback(isCorrectOpt);
      });

      optList.appendChild(btn);
    });

    if (state.quizAnswered) {
      const chosenOrig = perm[state.lastQuizSelectedPermIdx];
      populateFeedback(chosenOrig === qData.correctIndex);
    }

    box.appendChild(optList);
    box.appendChild(feedbackArea);
  }

  // ==========================================================================
  // LANGUAGE SWITCHING & FULL VIEW REFRESH
  // ==========================================================================
  async function applyLanguage(newLang) {
    AUDIO.stopSpeaking();
    if (AUDIO.stopAttackShout) AUDIO.stopAttackShout();
    state.signatureAttack = null;
    state.lang = newLang;
    I18N.saveLanguagePreference(newLang);

    const pack = await I18N.loadLocalePack(newLang);
    activeData = I18N.buildLocalizedData(BASE_DATA, pack);
    syncReferencesAfterLanguageLoad();

    renderStaticShellStrings();
    renderFightersView();
    renderHairGuideView();
    renderFusionLabView();
    renderTimelineView();
    refreshBattleSelectOptions();
    renderBattleOutcomeBox();
    renderQuizCard();
    syncStageUI(false);
  }

  function switchMode(rawMode) {
    let newMode = rawMode;
    if (newMode === 'lore') {
      newMode = state.lastLoreMode || 'hair-guide';
    } else if (newMode === 'battle-quiz') {
      newMode = 'battle';
    }

    if (newMode === 'hair-guide' || newMode === 'timeline') {
      state.lastLoreMode = newMode;
    }

    if (newMode !== 'battle') {
      stopBeamGameLoop();
    }
    AUDIO.stopSpeaking();
    if (AUDIO.stopAttackShout) AUDIO.stopAttackShout();
    state.signatureAttack = null;
    state.activeMode = newMode;
    AUDIO.playSound('scouter');
    track('switch_mode', { mode: newMode, language: state.lang });

    document.querySelectorAll('.nav-pill').forEach((btn) => {
      const isMatch = btn.getAttribute('data-mode') === newMode;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    centerActiveRailItem(document.querySelector('.main-tabs'));

    // Sync Mobile Bottom App Bar active button
    document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
      const mMode = btn.getAttribute('data-mobile-mode');
      const isLoreMatch = mMode === 'lore' && (newMode === 'hair-guide' || newMode === 'timeline');
      const isMatch = mMode === newMode || isLoreMatch;
      btn.classList.toggle('active', isMatch);
    });

    // Sync Lore Sub-Switcher pills inside Hair Guide & Timeline views
    document.querySelectorAll('.lore-switch-btn').forEach((btn) => {
      const isMatch = btn.getAttribute('data-lore-target') === newMode;
      btn.classList.toggle('active', isMatch);
    });

    const views = {
      'fighters': 'view-fighters',
      'fusion-lab': 'view-fusion-lab',
      'battle': 'view-battle',
      'quiz': 'view-quiz',
      'hair-guide': 'view-hair-guide',
      'timeline': 'view-timeline'
    };

    Object.entries(views).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', key !== newMode);
    });

    if (newMode === 'fusion-lab') {
      triggerFusionSequence(state.selectedFusionRecipe);
    } else {
      syncStageUI(false);
    }
  }

  function setupEvents() {
    // Populate 12-Language Selector
    const langSelect = document.getElementById('lang-select');
    langSelect.replaceChildren();
    I18N.LANGUAGES.forEach((langItem) => {
      const opt = createEl('option', '', '🌐 ' + langItem.fullLabel);
      opt.value = langItem.code;
      if (langItem.code === state.lang) opt.selected = true;
      langSelect.appendChild(opt);
    });
    langSelect.addEventListener('change', () => {
      const prevLang = state.lang;
      AUDIO.playSound('scouter');
      track('switch_language', { from_language: prevLang, to_language: langSelect.value });
      applyLanguage(langSelect.value);
    });

    // Chirp 3 HD Voice Persona Selector (active when local server.py live proxy is running)
    const personaSelect = document.getElementById('chirp-persona-select');
    const isLocalProxyHost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalProxyHost && personaSelect) {
      personaSelect.classList.add('hidden');
    }
    personaSelect.addEventListener('change', () => {
      AUDIO.setPersona(personaSelect.value);
      AUDIO.stopSpeaking();
      AUDIO.playSound('scouter');
    });

    // 6 Desktop Mode Tabs
    document.querySelectorAll('.nav-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchMode(btn.getAttribute('data-mode'));
      });
    });

    // Sticky Mobile 5-Tab Bottom App Bar
    document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchMode(btn.getAttribute('data-mobile-mode'));
      });
    });

    // Lore Sub-Switcher Buttons (Hair Guide <-> 5-Series Story)
    document.querySelectorAll('.lore-switch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchMode(btn.getAttribute('data-lore-target'));
      });
    });

    // Stage Quick Stepper (Prev / Surprise Random / Next) & Dragon Radar Hunt Button
    const prevBtn = document.getElementById('prev-fighter-btn');
    const nextBtn = document.getElementById('next-fighter-btn');
    const randBtn = document.getElementById('random-fighter-btn');
    const radarBtn = document.getElementById('radar-hunt-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => stepStageEntity(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => stepStageEntity(1));
    if (randBtn) randBtn.addEventListener('click', () => stepStageEntity('random'));
    if (radarBtn) radarBtn.addEventListener('click', focusRadarOnHiddenBall);

    // 3D Battle Arena Selector
    const arenaSelect = document.getElementById('arena-select');
    arenaSelect.addEventListener('change', () => {
      state.selectedArenaId = arenaSelect.value;
      const found = activeData.arenas.find((a) => a.id === state.selectedArenaId);
      if (found) {
        state.selectedArena = found;
        state.arenaCrater = null;
        state.powerBurstTimer = 40;
        AUDIO.playSound('scouter');
        track('select_arena', { arena_id: state.selectedArenaId, language: state.lang });
      }
    });

    // Quick Fighter Search Input
    const searchInput = document.getElementById('roster-search-input');
    searchInput.addEventListener('input', () => {
      state.rosterSearchQuery = searchInput.value || '';
      renderFighterGridOnly();
    });

    // Battle Fighter & Form Selectors
    const selFighterA = document.getElementById('sim-fighter-a');
    const selFormA = document.getElementById('sim-form-a');
    const selFighterB = document.getElementById('sim-fighter-b');
    const selFormB = document.getElementById('sim-form-b');

    selFighterA.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFighterIdA = selFighterA.value;
      state.battleFighterA = findFighterById(activeData, state.battleFighterIdA);
      state.battleFormIndexA = Math.max(0, (state.battleFighterA.forms || []).length - 1);
      populateFormSelect(selFormA, state.battleFighterA, state.battleFormIndexA);
      syncBattleFormsFromState();
      state.beamGame.position = 0.5;
      state.beamGame.winnerSide = null;
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    selFormA.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFormIndexA = Number(selFormA.value) || 0;
      syncBattleFormsFromState();
      state.beamGame.position = 0.5;
      state.beamGame.winnerSide = null;
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    selFighterB.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFighterIdB = selFighterB.value;
      state.battleFighterB = findFighterById(activeData, state.battleFighterIdB);
      state.battleFormIndexB = Math.max(0, (state.battleFighterB.forms || []).length - 1);
      populateFormSelect(selFormB, state.battleFighterB, state.battleFormIndexB);
      syncBattleFormsFromState();
      state.beamGame.position = 0.5;
      state.beamGame.winnerSide = null;
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    selFormB.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFormIndexB = Number(selFormB.value) || 0;
      syncBattleFormsFromState();
      state.beamGame.position = 0.5;
      state.beamGame.winnerSide = null;
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    // Light / Dark Mode Theme Toggle
    const themeBtn = document.getElementById('toggle-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
        } catch (_e) {}
        AUDIO.playSound('scouter');
        applyThemeToDom(state.theme);
        track('toggle_theme', { theme: state.theme, language: state.lang });
      });
    }

    // Scouter HUD Visor Toggle
    const scouterBtn = document.getElementById('toggle-scouter-btn');
    scouterBtn.addEventListener('click', () => {
      state.scouterActive = !state.scouterActive;
      AUDIO.playSound('scouter');
      document.body.classList.toggle('scouter-on', state.scouterActive);
      document.body.classList.toggle('scouter-off', !state.scouterActive);
      scouterBtn.setAttribute('aria-pressed', state.scouterActive ? 'true' : 'false');
      document.getElementById('scouter-state-label').textContent = state.scouterActive ? tr('on') : tr('off');
    });

    // Sound Toggle
    const soundBtn = document.getElementById('toggle-sound-btn');
    soundBtn.addEventListener('click', () => {
      const next = !AUDIO.isSoundEnabled();
      AUDIO.setSoundEnabled(next);
      soundBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
      document.getElementById('sound-state-label').textContent = next ? tr('on') : tr('off');
      if (next) AUDIO.playSound('scouter');
    });

    // Interactive Stage Toybox #1: Hold-or-Tap Ki Charge + 100% Limit-Break Auto-Evolution!
    const kiBtn = document.getElementById('power-up-burst-btn');
    let holdTickCounter = 0;
    if (kiBtn) {
      kiBtn.addEventListener('pointerdown', () => {
        state.kiChargingHold = true;
        holdTickCounter = 0;
        state.powerBurstTimer = Math.max(state.powerBurstTimer, 45);
        AUDIO.playSound('ki_tick', state.kiCharge || 15);
      });
      const stopHold = () => {
        state.kiChargingHold = false;
      };
      kiBtn.addEventListener('pointerup', stopHold);
      kiBtn.addEventListener('pointerleave', stopHold);
      kiBtn.addEventListener('pointercancel', stopHold);

      kiBtn.addEventListener('click', () => {
        state.kiCharge = Math.min(100, (state.kiCharge || 0) + 35);
        state.powerBurstTimer = 75;
        AUDIO.playSound('burst');
        if (state.kiCharge >= 100) {
          triggerLimitBreakEvolution();
        } else {
          syncToyboxUI();
        }
      });
    }

    // Interactive Stage Toybox #2: Signature Ultimate Beam Cannon!
    const sigBtn = document.getElementById('fire-signature-btn');
    if (sigBtn) {
      sigBtn.addEventListener('click', triggerSignatureAttack);
    }

    // Interactive Stage Toybox #3: Zanzoken / Instant Transmission Teleport!
    const teleBtn = document.getElementById('teleport-btn');
    if (teleBtn) {
      teleBtn.addEventListener('click', () => triggerTeleport());
    }

    // Start Live Beam Struggle Button
    document.getElementById('run-battle-btn').addEventListener('click', startInteractiveBeamStruggle);

    // Spacebar Mash Support for Live Beam Struggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && state.activeMode === 'battle' && state.beamGame.active) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        e.preventDefault();
        pushBeamForPlayer();
      }
    });

    // Shenron Modal Wish Buttons
    document.getElementById('close-shenron-btn').addEventListener('click', () => {
      document.getElementById('shenron-modal').classList.add('hidden');
    });
    document.getElementById('wish-gogeta-btn').addEventListener('click', () => {
      document.getElementById('shenron-modal').classList.add('hidden');
      state.selectedFusionRecipeId = activeData.fusionRecipes[1].id;
      state.selectedFusionRecipe = activeData.fusionRecipes[1];
      switchMode('fusion-lab');
    });
    document.getElementById('wish-ui-goku-btn').addEventListener('click', () => {
      document.getElementById('shenron-modal').classList.add('hidden');
      state.selectedFighterId = 'goku';
      state.selectedFighter = findFighterById(activeData, 'goku');
      state.selectedFighterFormIndex = state.selectedFighter.forms.length - 1;
      state.powerBurstTimer = 95;
      renderFightersView();
      switchMode('fighters');
    });

    // Expose frame-level Ki hold sound tick helper on window scope closure
    state._onKiFrameTick = function (kiVal) {
      if (state.kiChargingHold) {
        holdTickCounter += 1;
        if (holdTickCounter % 8 === 0) {
          AUDIO.playSound('ki_tick', kiVal);
        }
      }
      if (kiVal >= 100) {
        triggerLimitBreakEvolution();
      } else {
        syncToyboxUI();
      }
    };
  }

  function collectAllRenderUrls() {
    const urls = ['assets/renders/shenron.webp'];
    BASE_DATA.fighters.forEach((f) => {
      urls.push(f.spriteUrl);
      (f.forms || []).forEach((sf) => urls.push(sf.spriteUrl));
    });
    BASE_DATA.hairForms.forEach((hf) => urls.push(hf.spriteUrl));
    BASE_DATA.fusionRecipes.forEach((r) => {
      urls.push(r.resultSprite);
      if (r.spriteA) urls.push(r.spriteA);
      if (r.spriteB) urls.push(r.spriteB);
    });
    BASE_DATA.timelineSagas.forEach((s) => urls.push(s.spriteUrl));
    return urls;
  }

  async function init() {
    mountStaticDragonBalls();
    RENDERER.getCharacterImage(BASE_DATA.fighters[0].spriteUrl);
    RENDERER.warmImageQueue(collectAllRenderUrls());

    resetAndShuffleQuiz();
    setupEvents();
    await applyLanguage(state.lang);

    const canvasEl = document.getElementById('db-3d-canvas');
    RENDERER.init(canvasEl, () => state, {
      onCollectHiddenBall: collectHiddenBall,
      onStageBeamTap: pushBeamForPlayer,
      onCanvasTeleportTap: triggerTeleport,
      onBeamFireSound: (holdSec) => AUDIO.playSound('beam_fire', holdSec),
      onKiFrameUpdate: (kiVal) => {
        if (typeof state._onKiFrameTick === 'function') {
          state._onKiFrameTick(kiVal);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
