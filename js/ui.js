/* ==========================================================================
   DRAGON BALL 3D PORTAL — MULTILINGUAL + CHIRP 3 HD UI CONTROLLER
   Supports all 12 Languages (en, es, zh, yue, ja, ko, pt, fr, it, de, nl, ar)
   Security Note: Strictly uses document.createElement() and textContent for
   all DOM rendering (zero innerHTML / outerHTML / insertAdjacentHTML).
   ========================================================================== */

(function () {
  'use strict';

  const BASE_DATA = window.DB_PORTAL_DATA;
  const I18N = window.DB_I18N;
  const AUDIO = window.DB_AUDIO;
  const RENDERER = window.DB_RENDERER_3D;

  let activeData = BASE_DATA;

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

  const initialLang = I18N.detectInitialLanguage();

  const state = {
    lang: initialLang,
    activeMode: 'fighters',
    selectedArenaId: BASE_DATA.arenas[0].id,
    selectedArena: BASE_DATA.arenas[0],
    selectedRoleFilter: 'all',
    rosterSearchQuery: '',
    selectedFighterId: 'goku',
    selectedFighter: BASE_DATA.fighters[0],
    selectedFighterFormIndex: 0,
    activeFighterForm: BASE_DATA.fighters[0].forms[0],
    selectedHairFormId: 'ssg-red',
    selectedHairForm: BASE_DATA.hairForms[5],
    selectedFusionRecipeId: BASE_DATA.fusionRecipes[0].id,
    selectedFusionRecipe: BASE_DATA.fusionRecipes[0],
    fusionSpriteA: BASE_DATA.fighters[0].spriteUrl,
    fusionSpriteB: BASE_DATA.fighters[1].spriteUrl,
    fusionAnimTimer: 0,
    selectedEraFilter: 'ALL',
    selectedSagaId: 'dbs-gods-frieza',
    selectedSaga: BASE_DATA.timelineSagas[8],
    battleFighterIdA: 'goku',
    battleFighterA: findFighterById(BASE_DATA, 'goku'),
    battleFormIndexA: 5,
    battleFormA: findFighterById(BASE_DATA, 'goku').forms[5] || findFighterById(BASE_DATA, 'goku').forms[0],
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
      isDragging: false,
      lastX: 0,
      lastY: 0
    }
  };

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

  function makeReadAloudButton(getSpeechString) {
    const btn = createEl('button', 'btn-read-aloud', tr('readAloud'));
    btn.type = 'button';
    let isThisButtonSpeaking = false;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isThisButtonSpeaking) {
        AUDIO.stopSpeaking();
        return;
      }
      AUDIO.speakText(getSpeechString(), state.lang, (speakingNow) => {
        isThisButtonSpeaking = speakingNow;
        btn.classList.toggle('speaking', speakingNow);
        btn.textContent = speakingNow ? tr('stopReading') : tr('readAloud');
      });
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

  function renderStaticShellStrings() {
    document.documentElement.lang = state.lang === 'yue' ? 'yue-Hant-HK' : state.lang;
    document.documentElement.dir = I18N.getLanguageDir(state.lang);

    document.getElementById('ui-brand-title').textContent = tr('brandTitle');
    document.getElementById('ui-brand-sub').textContent = tr('brandSub');

    document.getElementById('tab-btn-fighters').textContent = tr('tabFighters');
    document.getElementById('tab-btn-hair').textContent = tr('tabHair');
    document.getElementById('tab-btn-fusion').textContent = tr('tabFusion');
    document.getElementById('tab-btn-timeline').textContent = tr('tabTimeline');
    document.getElementById('tab-btn-battle').textContent = tr('tabBattleQuiz');

    document.getElementById('ui-scouter-prefix').textContent = tr('scouterLabel');
    document.getElementById('scouter-state-label').textContent = state.scouterActive ? tr('on') : tr('off');

    document.getElementById('ui-sound-prefix').textContent = tr('soundLabel');
    document.getElementById('sound-state-label').textContent = AUDIO.isSoundEnabled() ? tr('on') : tr('off');

    document.getElementById('ui-power-level-label').textContent = tr('powerLevelLabel');
    document.getElementById('power-up-burst-btn').textContent = tr('powerUpBtn');

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

    document.getElementById('shenron-title').textContent = tr('shenronTitle');
    document.getElementById('shenron-speech').textContent = tr('shenronSpeech');
    document.getElementById('wish-ui-goku-btn').textContent = tr('wish1Btn');
    document.getElementById('wish-gogeta-btn').textContent = tr('wish2Btn');
    document.getElementById('close-shenron-btn').textContent = tr('wishCloseBtn');

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

    if (state.activeMode === 'fighters') {
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
    } else if (state.activeMode === 'battle-quiz') {
      eraBadge.textContent = tr('liveBeamStage');
      charName.textContent = state.battleFormA.label + ' VS ' + state.battleFormB.label;
      targetPowerStr = state.beamGame.active
        ? tr('mashOrClickStage')
        : state.battleFormA.power + ' vs ' + state.battleFormB.power;

      hudName.textContent = state.battleFighterA.name.toUpperCase() + ' VS ' + state.battleFighterB.name.toUpperCase();
      hudForm.textContent = '1V1';
      dockContainer.classList.add('hidden');
    }

    if (animatePower) {
      animatePowerReadout(targetPowerStr);
    } else {
      document.getElementById('stage-power-number').textContent = targetPowerStr;
      document.getElementById('hud-target-power').textContent = targetPowerStr;
    }
  }

  // ==========================================================================
  // VIEW 1: CHARACTERS & TRANSFORMATIONS
  // ==========================================================================
  function renderActiveFighterStory() {
    const card = document.getElementById('active-fighter-story');
    card.replaceChildren();

    const fighter = state.selectedFighter;
    const activeForm = getActiveFighterForm(fighter, state.selectedFighterFormIndex);

    const banner = createEl('div', 'story-banner');
    const portraitBox = createEl('div', 'story-portrait');
    portraitBox.style.borderColor = activeForm.auraHex || fighter.auraColor;

    const img = createEl('img');
    img.src = activeForm.spriteUrl;
    img.alt = fighter.name + ' - ' + activeForm.label;
    portraitBox.appendChild(img);

    const infoCol = createEl('div');
    const titleRow = createEl('div', 'story-title-row');
    titleRow.appendChild(createEl('h3', '', fighter.name));

    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', '⚡ ' + activeForm.label + ': ' + activeForm.power));
    actionsWrap.appendChild(
      makeReadAloudButton(() =>
        fighter.name + '. ' + activeForm.label + ', ' + activeForm.power + '. ' + fighter.kidBio + '. ' + tr('signatureMoves') + fighter.signatureMove
      )
    );
    titleRow.appendChild(actionsWrap);

    const subMeta = createEl('p', 'story-text', fighter.race + ' • ' + fighter.series);
    subMeta.style.fontWeight = '700';
    subMeta.style.marginBottom = '0.35rem';

    infoCol.appendChild(titleRow);
    infoCol.appendChild(subMeta);
    infoCol.appendChild(createEl('p', 'story-text', fighter.kidBio));

    banner.appendChild(portraitBox);
    banner.appendChild(infoCol);

    const movesBox = createEl('div', 'moves-callout', tr('signatureMoves') + fighter.signatureMove);

    card.appendChild(banner);
    card.appendChild(movesBox);
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
        state.selectedFighterId = fighter.id;
        state.selectedFighter = fighter;
        state.selectedFighterFormIndex = 0;
        state.powerBurstTimer = 55;
        AUDIO.playSound('scouter');
        renderActiveFighterStory();
        renderFighterGridOnly();
        syncStageUI(true);
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

    const info = createEl('div');
    const titleRow = createEl('div', 'story-title-row');
    titleRow.appendChild(createEl('h3', '', hf.name));

    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', hf.multiplier));
    actionsWrap.appendChild(
      makeReadAloudButton(() =>
        hf.name + '. ' + hf.multiplier + '. ' + hf.meaningForKids + '. ' + tr('funFactLabel') + hf.funFact
      )
    );
    titleRow.appendChild(actionsWrap);

    info.appendChild(titleRow);
    info.appendChild(createEl('p', 'story-text', hf.meaningForKids));
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
        renderHairGuideView();
        syncStageUI(true);
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
    state.fusionSpriteA = fA.spriteUrl;
    state.fusionSpriteB = fB.spriteUrl;
    state.fusionAnimTimer = 80;
    state.powerBurstTimer = 85;
    AUDIO.playSound('fusion');
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

    const formulaRow = createEl('div', 'fusion-formula-row');

    const boxA = createEl('div', 'fusion-fighter-pill');
    const imgA = createEl('img', 'battle-mini-img');
    imgA.src = fA.spriteUrl;
    imgA.alt = fA.name;
    boxA.appendChild(imgA);
    boxA.appendChild(createEl('span', '', fA.name.split('(')[0].trim()));

    const plusSign = createEl('div', 'vs-circle', '+');

    const boxB = createEl('div', 'fusion-fighter-pill');
    const imgB = createEl('img', 'battle-mini-img');
    imgB.src = fB.spriteUrl;
    imgB.alt = fB.name;
    boxB.appendChild(imgB);
    boxB.appendChild(
      createEl('span', '', rec.warriorA === rec.warriorB ? tr('kamiShenron') : fB.name.split('(')[0].trim())
    );

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
      makeReadAloudButton(() => rec.methodName + '. ' + rec.resultName + '. ' + rec.power + '. ' + rec.story)
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

      const mid = createEl('div');
      mid.appendChild(createEl('strong', '', item.resultName));
      mid.appendChild(createEl('p', 'muted-sub', item.methodName));

      const badge = createEl('span', 'gold-badge', item.power);

      btn.appendChild(thumb);
      btn.appendChild(mid);
      btn.appendChild(badge);

      btn.addEventListener('click', () => triggerFusionSequence(item));
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

    const sInfo = createEl('div');
    const tRow = createEl('div', 'story-title-row');
    tRow.appendChild(createEl('h3', '', saga.title));

    const actionsWrap = createEl('div', 'card-inline-actions');
    actionsWrap.appendChild(createEl('span', 'gold-badge', saga.eraFullName + ' (' + saga.years + ')'));
    actionsWrap.appendChild(
      makeReadAloudButton(() =>
        saga.eraFullName + '. ' + saga.title + '. ' + saga.keyEvents + '. ' + tr('lessonLabel') + saga.kidLesson
      )
    );
    tRow.appendChild(actionsWrap);

    sInfo.appendChild(tRow);
    sInfo.appendChild(createEl('p', 'story-text', saga.keyEvents));
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

      const mid = createEl('div');
      mid.appendChild(createEl('strong', '', item.title));
      mid.appendChild(createEl('p', 'muted-sub', tr('villainShort') + item.mainEnemy));

      const tag = createEl('span', 'gold-badge', item.era);

      row.appendChild(rImg);
      row.appendChild(mid);
      row.appendChild(tag);

      row.addEventListener('click', () => {
        AUDIO.stopSpeaking();
        state.selectedSagaId = item.id;
        state.selectedSaga = item;
        state.powerBurstTimer = 45;
        AUDIO.playSound('scouter');
        renderTimelineView();
        syncStageUI(false);
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

  function renderDragonBallStarsBar() {
    const bar = document.getElementById('dragon-balls-progress');
    if (!bar) return;
    bar.replaceChildren();

    for (let star = 1; star <= 7; star++) {
      const orb = createEl(
        'span',
        star <= state.dragonBallsCollected ? 'db-star-orb collected' : 'db-star-orb',
        star + '★'
      );
      bar.appendChild(orb);
    }
  }

  function openShenronModal() {
    AUDIO.playSound('shenron');
    document.getElementById('shenron-modal').classList.remove('hidden');
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
        qData.question + '. ' + perm.map((origIdx) => qData.options[origIdx]).join('. ')
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
          if (state.dragonBallsCollected < 7) {
            state.dragonBallsCollected += 1;
          }
          AUDIO.playSound('transform');
          renderDragonBallStarsBar();
          scoreBadge.textContent = tr('scoreBallsBadge', {
            score: state.quizScore,
            total: totalQ,
            balls: state.dragonBallsCollected
          });

          if (state.dragonBallsCollected === 7 && !state.shenronSummonedOnce) {
            state.shenronSummonedOnce = true;
            window.setTimeout(openShenronModal, 450);
          }
        } else {
          btn.classList.add('wrong');
          AUDIO.playSound('scouter');
        }

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

  function switchMode(newMode) {
    if (newMode !== 'battle-quiz') {
      stopBeamGameLoop();
    }
    AUDIO.stopSpeaking();
    state.activeMode = newMode;
    AUDIO.playSound('scouter');

    document.querySelectorAll('.nav-pill').forEach((btn) => {
      const isMatch = btn.getAttribute('data-mode') === newMode;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    const views = {
      'fighters': 'view-fighters',
      'hair-guide': 'view-hair-guide',
      'fusion-lab': 'view-fusion-lab',
      'timeline': 'view-timeline',
      'battle-quiz': 'view-battle-quiz'
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
      AUDIO.playSound('scouter');
      applyLanguage(langSelect.value);
    });

    // Chirp 3 HD Voice Persona Selector
    const personaSelect = document.getElementById('chirp-persona-select');
    personaSelect.addEventListener('change', () => {
      AUDIO.setPersona(personaSelect.value);
      AUDIO.stopSpeaking();
      AUDIO.playSound('scouter');
    });

    // 5 Main Mode Tabs
    document.querySelectorAll('.nav-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchMode(btn.getAttribute('data-mode'));
      });
    });

    // 3D Battle Arena Selector
    const arenaSelect = document.getElementById('arena-select');
    arenaSelect.addEventListener('change', () => {
      state.selectedArenaId = arenaSelect.value;
      const found = activeData.arenas.find((a) => a.id === state.selectedArenaId);
      if (found) {
        state.selectedArena = found;
        state.powerBurstTimer = 40;
        AUDIO.playSound('scouter');
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

    // Stage Power-Up Burst Button
    document.getElementById('power-up-burst-btn').addEventListener('click', () => {
      state.powerBurstTimer = 85;
      AUDIO.playSound('burst');
    });

    // Start Live Beam Struggle Button
    document.getElementById('run-battle-btn').addEventListener('click', startInteractiveBeamStruggle);

    // Spacebar Mash Support for Live Beam Struggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && state.activeMode === 'battle-quiz' && state.beamGame.active) {
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
  }

  function collectAllRenderUrls() {
    const urls = [];
    BASE_DATA.fighters.forEach((f) => {
      urls.push(f.spriteUrl);
      (f.forms || []).forEach((sf) => urls.push(sf.spriteUrl));
    });
    BASE_DATA.hairForms.forEach((hf) => urls.push(hf.spriteUrl));
    BASE_DATA.fusionRecipes.forEach((r) => urls.push(r.resultSprite));
    BASE_DATA.timelineSagas.forEach((s) => urls.push(s.spriteUrl));
    return urls;
  }

  async function init() {
    RENDERER.getCharacterImage(BASE_DATA.fighters[0].spriteUrl);
    RENDERER.warmImageQueue(collectAllRenderUrls());

    resetAndShuffleQuiz();
    setupEvents();
    await applyLanguage(state.lang);

    const canvasEl = document.getElementById('db-3d-canvas');
    RENDERER.init(canvasEl, () => state);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
