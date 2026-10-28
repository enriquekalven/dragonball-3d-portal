/* ==========================================================================
   DRAGON BALL 3D PORTAL — KID-FRIENDLY UI, FUSION LAB, BEAM GAME & QUIZ
   Security Note: Strictly uses document.createElement() and textContent for
   all DOM rendering (zero innerHTML / outerHTML / insertAdjacentHTML).
   ========================================================================== */

(function () {
  'use strict';

  const DATA = window.DB_PORTAL_DATA;
  const AUDIO = window.DB_AUDIO;
  const RENDERER = window.DB_RENDERER_3D;

  function findFighterById(id) {
    return DATA.fighters.find((f) => f.id === id) || DATA.fighters[0];
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

  // Central Portal State shared with DB_RENDERER_3D
  const state = {
    activeMode: 'fighters', // 'fighters' | 'hair-guide' | 'fusion-lab' | 'timeline' | 'battle-quiz'
    selectedArena: DATA.arenas[0],
    selectedRoleFilter: 'all',
    rosterSearchQuery: '',
    selectedFighter: DATA.fighters[0], // Son Goku
    selectedFighterFormIndex: 0,
    activeFighterForm: DATA.fighters[0].forms[0],
    selectedHairForm: DATA.hairForms[5], // Super Saiyan God (Red) highlighted initially in Hair tab!
    selectedFusionRecipe: DATA.fusionRecipes[0],
    fusionSpriteA: DATA.fighters[0].spriteUrl,
    fusionSpriteB: DATA.fighters[1].spriteUrl,
    fusionAnimTimer: 0,
    selectedEraFilter: 'ALL',
    selectedSaga: DATA.timelineSagas[8], // Battle of Gods (Super Saiyan God vs. Beerus)
    battleFighterA: findFighterById('goku'),
    battleFormIndexA: 5, // Super Saiyan God (Red)
    battleFormA: findFighterById('goku').forms[5] || findFighterById('goku').forms[0],
    battleFighterB: findFighterById('beerus'),
    battleFormIndexB: 0,
    battleFormB: findFighterById('beerus').forms[0],
    beamGame: {
      active: false,
      position: 0.5, // 0.0 (Fighter B wins) -> 0.5 (Center) -> 1.0 (Fighter A wins)
      intervalId: null,
      winnerText: ''
    },
    scouterActive: false,
    powerBurstTimer: 45,
    hasLightningActive: false,
    quizDeck: [],
    quizIndex: 0,
    quizScore: 0,
    dragonBallsCollected: 0,
    shenronSummonedOnce: false,
    quizAnswered: false,
    camera: {
      rotY: 0.16,
      rotX: 0.08,
      zoom: 1.0,
      isDragging: false,
      lastX: 0,
      lastY: 0
    }
  };

  // Safe DOM factory helper (strictly textContent + safe attributes)
  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) {
      el.textContent = String(text);
    }
    return el;
  }

  function makeReadAloudButton(getSpeechString) {
    const btn = createEl('button', 'btn-read-aloud', '🔊 Read Aloud');
    btn.type = 'button';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      AUDIO.speakText(getSpeechString());
    });
    return btn;
  }

  // Animated Scouter Number Roll Effect
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
          ? 'CLICK TO TRANSFORM ' + fighter.name.toUpperCase() + ' (' + fighter.forms.length + ' FORMS):'
          : 'CHARACTER FORM:';

      (fighter.forms || [activeForm]).forEach((formItem, idx) => {
        const btn = createEl('button', 'stage-form-btn');
        btn.type = 'button';
        if (idx === state.selectedFighterFormIndex) btn.classList.add('active');

        const dot = createEl('span', 'form-dot');
        dot.style.backgroundColor = formItem.auraHex || fighter.auraColor;
        const lbl = createEl('span', '', formItem.label);

        btn.appendChild(dot);
        btn.appendChild(lbl);
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
      dockLabel.textContent = 'QUICK-SWITCH SAIYAN HAIR COLORS (12 FORMS):';

      DATA.hairForms.forEach((formItem) => {
        const btn = createEl('button', 'stage-form-btn');
        btn.type = 'button';
        if (formItem.id === hf.id) btn.classList.add('active');

        const dot = createEl('span', 'form-dot');
        dot.style.backgroundColor = formItem.hairHex;
        btn.appendChild(dot);
        btn.appendChild(createEl('span', '', formItem.shortLabel));

        btn.addEventListener('click', () => {
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
      hudForm.textContent = 'FUSED WARRIOR';

      dockContainer.classList.remove('hidden');
      dockLabel.textContent = 'CHOOSE A FUSION RECIPE TO LAUNCH IN 3D:';

      DATA.fusionRecipes.forEach((recipe) => {
        const btn = createEl('button', 'stage-form-btn');
        btn.type = 'button';
        if (recipe.id === rec.id) btn.classList.add('active');

        const dot = createEl('span', 'form-dot');
        dot.style.backgroundColor = recipe.auraHex;
        btn.appendChild(dot);
        btn.appendChild(createEl('span', '', recipe.resultName.replace('!', '')));

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
      eraBadge.textContent = 'LIVE 3D FORM-VS-FORM BEAM STRUGGLE';
      charName.textContent = state.battleFormA.label + ' VS ' + state.battleFormB.label;
      targetPowerStr = state.beamGame.active
        ? 'MASH SPACEBAR OR CLICK PUSH!'
        : state.battleFormA.power + ' vs ' + state.battleFormB.power;

      hudName.textContent = state.battleFighterA.name.toUpperCase() + ' VS ' + state.battleFighterB.name.toUpperCase();
      hudForm.textContent = 'BEAM CLASH';
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
  // VIEW 1: CHARACTERS & TRANSFORMATIONS (25 Fighters + Search + Voice)
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
        fighter.name + '. Current transformation: ' + activeForm.label + ', power level ' + activeForm.power + '. ' + fighter.kidBio + ' Signature moves: ' + fighter.signatureMove
      )
    );
    titleRow.appendChild(actionsWrap);

    const subMeta = createEl('p', 'story-text', fighter.race + ' • ' + fighter.series);
    subMeta.style.fontWeight = '700';
    subMeta.style.marginBottom = '0.35rem';

    const bioP = createEl('p', 'story-text', fighter.kidBio);

    infoCol.appendChild(titleRow);
    infoCol.appendChild(subMeta);
    infoCol.appendChild(bioP);

    banner.appendChild(portraitBox);
    banner.appendChild(infoCol);

    const movesBox = createEl(
      'div',
      'moves-callout',
      '🔥 Signature Moves: ' + fighter.signatureMove
    );

    card.appendChild(banner);
    card.appendChild(movesBox);
  }

  function renderFighterGridOnly() {
    const grid = document.getElementById('fighter-roster-grid');
    const countHeading = document.getElementById('roster-count-heading');
    grid.replaceChildren();

    const q = state.rosterSearchQuery.trim().toLowerCase();
    const filtered = DATA.fighters.filter((f) => {
      const roleMatch = state.selectedRoleFilter === 'all' || f.alignment === state.selectedRoleFilter;
      if (!roleMatch) return false;
      if (!q) return true;
      const inForms = (f.forms || []).some((sf) => sf.label.toLowerCase().indexOf(q) !== -1);
      return (
        f.name.toLowerCase().indexOf(q) !== -1 ||
        f.series.toLowerCase().indexOf(q) !== -1 ||
        f.race.toLowerCase().indexOf(q) !== -1 ||
        f.signatureMove.toLowerCase().indexOf(q) !== -1 ||
        inForms
      );
    });

    if (countHeading) {
      countHeading.textContent = 'Choose Any Character (' + filtered.length + ' Fighters)';
    }

    if (filtered.length === 0) {
      grid.appendChild(
        createEl('p', 'story-text', 'No fighters matched "' + state.rosterSearchQuery + '". Try searching "Goku", "God", "Freezer", or "Fusion"!')
      );
      return;
    }

    filtered.forEach((fighter) => {
      const tile = createEl('button', 'char-tile-btn');
      tile.type = 'button';
      if (fighter.id === state.selectedFighter.id) {
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
        formCount > 1 ? formCount + ' Transformations' : fighter.series
      );

      tile.appendChild(imgWrap);
      tile.appendChild(nameEl);
      tile.appendChild(subEl);

      tile.addEventListener('click', () => {
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
      { id: 'all', label: 'All (' + DATA.fighters.length + ')' },
      { id: 'hero', label: '🦸 Heroes & Fusions' },
      { id: 'villain', label: '😈 Villains & Rivals' },
      { id: 'deity', label: '👑 Gods & Angels' }
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
  // VIEW 2: WHAT EVERY HAIR COLOR MEANS (12 Hair Colors + Voice Narrator)
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
        hf.name + '. Multiplier: ' + hf.multiplier + '. ' + hf.meaningForKids + ' Fun fact: ' + hf.funFact
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
      '💡 How It Is Unlocked: ' + hf.howUnlocked + ' • 🌟 Fun Fact: ' + hf.funFact
    );

    detail.appendChild(banner);
    detail.appendChild(howBox);

    DATA.hairForms.forEach((item) => {
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
  // VIEW 3: INTERACTIVE FUSION LAB (Potara Earrings vs. Fusion Dance!)
  // ==========================================================================
  function triggerFusionSequence(recipe) {
    state.selectedFusionRecipe = recipe;
    const fA = findFighterById(recipe.warriorA);
    const fB = findFighterById(recipe.warriorB);
    state.fusionSpriteA = fA.spriteUrl;
    state.fusionSpriteB = fB.spriteUrl;
    state.fusionAnimTimer = 80; // ~1.3s 3D convergence + flash in stage!
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
    const fA = findFighterById(rec.warriorA);
    const fB = findFighterById(rec.warriorB);

    // Visual Formula Row: Fighter A + Fighter B = Fused Warrior!
    const formulaRow = createEl('div', 'fusion-formula-row');

    const boxA = createEl('div', 'fusion-fighter-pill');
    const imgA = createEl('img', 'battle-mini-img');
    imgA.src = fA.spriteUrl;
    imgA.alt = fA.name;
    boxA.appendChild(imgA);
    boxA.appendChild(createEl('span', '', fA.name.split(' ')[0]));

    const plusSign = createEl('div', 'vs-circle', '+');

    const boxB = createEl('div', 'fusion-fighter-pill');
    const imgB = createEl('img', 'battle-mini-img');
    imgB.src = fB.spriteUrl;
    imgB.alt = fB.name;
    boxB.appendChild(imgB);
    boxB.appendChild(createEl('span', '', rec.warriorA === rec.warriorB ? 'Kami + Shenron' : fB.name.split(' ')[0]));

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
      makeReadAloudButton(() => rec.methodName + '. ' + rec.resultName + '. Power level: ' + rec.power + '. ' + rec.story)
    );
    headerRow.appendChild(actionsWrap);

    const fuseBtn = createEl('button', 'btn-power-up full-btn', '✨ REPLAY 3D FUSION SEQUENCE! ("FUUU-SION... HA!")');
    fuseBtn.type = 'button';
    fuseBtn.addEventListener('click', () => triggerFusionSequence(rec));

    activeCard.appendChild(headerRow);
    activeCard.appendChild(formulaRow);
    activeCard.appendChild(createEl('p', 'story-text', rec.story));
    activeCard.appendChild(fuseBtn);

    DATA.fusionRecipes.forEach((item) => {
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
  // VIEW 4: STORY TIMELINE (DB -> DBZ -> DBGT -> DBS)
  // ==========================================================================
  function renderTimelineView() {
    const tabsRow = document.getElementById('era-filter-tabs');
    const detail = document.getElementById('saga-selected-detail');
    const list = document.getElementById('saga-timeline-list');

    tabsRow.replaceChildren();
    detail.replaceChildren();
    list.replaceChildren();

    const eras = [
      { id: 'ALL', label: 'All 4 Series' },
      { id: 'DB', label: '🟠 Dragon Ball (Kid Goku)' },
      { id: 'DBZ', label: '⚡ Dragon Ball Z' },
      { id: 'DBGT', label: '🐉 Dragon Ball GT' },
      { id: 'DBS', label: '💠 Dragon Ball Super' }
    ];

    eras.forEach((era) => {
      const btn = createEl('button', 'filter-btn', era.label);
      btn.type = 'button';
      if (state.selectedEraFilter === era.id) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.selectedEraFilter = era.id;
        const matching = era.id === 'ALL'
          ? DATA.timelineSagas
          : DATA.timelineSagas.filter((s) => s.era === era.id);
        if (matching.length > 0 && matching.indexOf(state.selectedSaga) === -1) {
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
        saga.eraFullName + ': ' + saga.title + '. Heroes: ' + saga.mainHero + '. Enemies: ' + saga.mainEnemy + '. ' + saga.keyEvents + ' Kid lesson: ' + saga.kidLesson
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
      '😈 Main Villains: ' + saga.mainEnemy + ' • ⚡ Unlocked: ' + saga.hairOrFormUnlocked + ' • 💡 Lesson: ' + saga.kidLesson
    );

    detail.appendChild(banner);
    detail.appendChild(enemyCallout);

    const filteredSagas = state.selectedEraFilter === 'ALL'
      ? DATA.timelineSagas
      : DATA.timelineSagas.filter((s) => s.era === state.selectedEraFilter);

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
      mid.appendChild(createEl('p', 'muted-sub', 'Villain: ' + item.mainEnemy));

      const tag = createEl('span', 'gold-badge', item.era);

      row.appendChild(rImg);
      row.appendChild(mid);
      row.appendChild(tag);

      row.addEventListener('click', () => {
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
  // VIEW 5A: FORM-VS-FORM PLAYABLE 1V1 BEAM STRUGGLE MINI-GAME
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

  function syncBattleFormsFromSelects() {
    state.battleFormA = getActiveFighterForm(state.battleFighterA, state.battleFormIndexA);
    state.battleFormB = getActiveFighterForm(state.battleFighterB, state.battleFormIndexB);
  }

  function pushBeamForPlayer() {
    if (!state.beamGame.active) return;
    const scoreA = state.battleFormA.powerScore || 70;
    const scoreB = state.battleFormB.powerScore || 70;
    // Give player responsive boost even in underdog matchups!
    const diffBonus = Math.max(-0.022, Math.min(0.03, (scoreA - scoreB) * 0.0008));
    state.beamGame.position = Math.min(0.98, state.beamGame.position + 0.068 + diffBonus);
    state.powerBurstTimer = 20;
    AUDIO.playSound('clash_hit');
    updateBeamMeterDOM();
    checkBeamWinner();
  }

  function checkBeamWinner() {
    if (state.beamGame.position >= 0.92) {
      stopBeamGameLoop();
      state.powerBurstTimer = 90;
      AUDIO.playSound('fusion');
      state.beamGame.winnerText =
        '🏆 PLAYER VICTORY! ' + state.battleFighterA.name + ' (' + state.battleFormA.label + ') overwhelmed ' + state.battleFighterB.name + ' (' + state.battleFormB.label + ') in the 3D Beam Struggle!';
      renderBattleOutcomeBox();
      syncStageUI(false);
    } else if (state.beamGame.position <= 0.08) {
      stopBeamGameLoop();
      state.powerBurstTimer = 90;
      AUDIO.playSound('burst');
      state.beamGame.winnerText =
        '💥 RIVAL VICTORY! ' + state.battleFighterB.name + ' (' + state.battleFormB.label + ') pushed the beam all the way back! Click START to rematch or power up Fighter 1\'s form!';
      renderBattleOutcomeBox();
      syncStageUI(false);
    }
  }

  function updateBeamMeterDOM() {
    const fill = document.getElementById('beam-tug-fill');
    if (fill) {
      const pct = Math.round(Math.max(4, Math.min(96, state.beamGame.position * 100)));
      fill.style.width = pct + '%';
      fill.style.backgroundColor = state.battleFormA.auraHex || '#00e5ff';
    }
  }

  function startInteractiveBeamStruggle() {
    stopBeamGameLoop();
    syncBattleFormsFromSelects();
    state.beamGame.active = true;
    state.beamGame.position = 0.5;
    state.beamGame.winnerText = '';
    state.powerBurstTimer = 60;
    AUDIO.playSound('burst');
    renderBattleOutcomeBox();
    syncStageUI(false);

    const scoreA = state.battleFormA.powerScore || 70;
    const scoreB = state.battleFormB.powerScore || 70;
    // AI opponent pushes steadily every 65ms scaled by its form's powerScore
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

    const vsTag = createEl('strong', 'gold-badge', state.beamGame.active ? '⚡ LIVE TUG-OF-WAR!' : '⚡ POWER READOUT');

    const imgB = createEl('img', 'battle-mini-img');
    imgB.src = formB.spriteUrl;
    imgB.alt = formB.label;

    portraits.appendChild(imgA);
    portraits.appendChild(vsTag);
    portraits.appendChild(imgB);
    out.appendChild(portraits);

    // Tug-of-War Progress Bar + Mash Button
    const meterTrack = createEl('div', 'beam-tug-track');
    meterTrack.style.backgroundColor = formB.auraHex || '#ef4444';
    const meterFill = createEl('div', 'beam-tug-fill');
    meterFill.id = 'beam-tug-fill';
    meterFill.style.width = Math.round(state.beamGame.position * 100) + '%';
    meterFill.style.backgroundColor = formA.auraHex || '#00e5ff';
    meterTrack.appendChild(meterFill);
    out.appendChild(meterTrack);

    if (state.beamGame.active) {
      const pushBtn = createEl(
        'button',
        'btn-mash-beam',
        '⚡ TAP FAST OR MASH SPACEBAR TO PUSH KAMEHAMEHA! ⚡'
      );
      pushBtn.type = 'button';
      pushBtn.addEventListener('click', pushBeamForPlayer);
      out.appendChild(pushBtn);
    }

    if (state.beamGame.winnerText) {
      out.appendChild(createEl('strong', 'winner-banner-text', state.beamGame.winnerText));
    } else {
      const loreWinner = (formA.powerScore || 70) >= (formB.powerScore || 70) ? fA.name + ' (' + formA.label + ')' : fB.name + ' (' + formB.label + ')';
      out.appendChild(
        createEl(
          'p',
          'story-text',
          '📊 Scouter Comparison: ' + formA.label + ' [' + formA.power + '] vs. ' + formB.label + ' [' + formB.power + ']. Canon Power Edge: ' + loreWinner + '!'
        )
      );
    }
  }

  // ==========================================================================
  // VIEW 5B: RANDOMIZED KIDS' QUIZ + 7-STAR DRAGON BALL SHENRON REWARD
  // ==========================================================================
  function resetAndShuffleQuiz() {
    state.quizDeck = shuffleArray(DATA.quizQuestions).map((q) => {
      const indexedOptions = q.options.map((optText, idx) => ({
        text: optText,
        isCorrect: idx === q.correctIndex
      }));
      return {
        question: q.question,
        explanation: q.explanation,
        shuffledOptions: shuffleArray(indexedOptions)
      };
    });
    state.quizIndex = 0;
    state.quizScore = 0;
    state.quizAnswered = false;
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
      orb.title = star + '-Star Dragon Ball';
      bar.appendChild(orb);
    }
  }

  function openShenronModal() {
    AUDIO.playSound('shenron');
    const modal = document.getElementById('shenron-modal');
    modal.classList.remove('hidden');
  }

  function renderQuizCard() {
    const scoreBadge = document.getElementById('quiz-score-badge');
    const box = document.getElementById('quiz-question-container');
    box.replaceChildren();

    renderDragonBallStarsBar();
    scoreBadge.textContent =
      'SCORE: ' + state.quizScore + ' / ' + state.quizDeck.length + ' • 🟠 ' + state.dragonBallsCollected + '/7 BALLS';

    const currentQ = state.quizDeck[state.quizIndex];

    const qTopRow = createEl('div', 'story-title-row');
    qTopRow.appendChild(
      createEl('strong', '', 'Question ' + (state.quizIndex + 1) + ' of ' + state.quizDeck.length + ': ' + currentQ.question)
    );
    qTopRow.appendChild(
      makeReadAloudButton(() =>
        currentQ.question + ' Options: ' + currentQ.shuffledOptions.map((o) => o.text).join('. ')
      )
    );
    box.appendChild(qTopRow);

    const optList = createEl('div', 'quiz-options-list');
    const feedbackArea = createEl('div');

    currentQ.shuffledOptions.forEach((optObj) => {
      const btn = createEl('button', 'quiz-option-btn', optObj.text);
      btn.type = 'button';

      btn.addEventListener('click', () => {
        if (state.quizAnswered) return;
        state.quizAnswered = true;

        Array.from(optList.children).forEach((childBtn, cIdx) => {
          if (currentQ.shuffledOptions[cIdx].isCorrect) {
            childBtn.classList.add('correct');
          }
        });

        if (optObj.isCorrect) {
          state.quizScore += 1;
          if (state.dragonBallsCollected < 7) {
            state.dragonBallsCollected += 1;
          }
          AUDIO.playSound('transform');
          renderDragonBallStarsBar();
          scoreBadge.textContent =
            'SCORE: ' + state.quizScore + ' / ' + state.quizDeck.length + ' • 🟠 ' + state.dragonBallsCollected + '/7 BALLS';

          if (state.dragonBallsCollected === 7 && !state.shenronSummonedOnce) {
            state.shenronSummonedOnce = true;
            window.setTimeout(openShenronModal, 450);
          }
        } else {
          btn.classList.add('wrong');
          AUDIO.playSound('scouter');
        }

        const exp = createEl(
          'div',
          'moves-callout',
          (optObj.isCorrect ? '✅ Awesome Job! ' : '💡 Good Try! ') + currentQ.explanation
        );

        const isLast = state.quizIndex + 1 >= state.quizDeck.length;
        const nextBtn = createEl(
          'button',
          'btn-power-up full-btn',
          isLast ? '🔄 Play New Shuffled Round!' : '➡️ Next Question'
        );
        nextBtn.type = 'button';
        nextBtn.style.marginTop = '0.6rem';
        nextBtn.addEventListener('click', () => {
          if (isLast) {
            resetAndShuffleQuiz();
          } else {
            state.quizIndex += 1;
            state.quizAnswered = false;
          }
          renderQuizCard();
        });

        feedbackArea.appendChild(exp);
        feedbackArea.appendChild(nextBtn);
      });

      optList.appendChild(btn);
    });

    box.appendChild(optList);
    box.appendChild(feedbackArea);
  }

  function initBattleAndQuiz() {
    const selFighterA = document.getElementById('sim-fighter-a');
    const selFormA = document.getElementById('sim-form-a');
    const selFighterB = document.getElementById('sim-fighter-b');
    const selFormB = document.getElementById('sim-form-b');

    selFighterA.replaceChildren();
    selFighterB.replaceChildren();

    DATA.fighters.forEach((f) => {
      const optA = createEl('option', '', f.name);
      optA.value = f.id;
      if (f.id === state.battleFighterA.id) optA.selected = true;
      selFighterA.appendChild(optA);

      const optB = createEl('option', '', f.name);
      optB.value = f.id;
      if (f.id === state.battleFighterB.id) optB.selected = true;
      selFighterB.appendChild(optB);
    });

    populateFormSelect(selFormA, state.battleFighterA, state.battleFormIndexA);
    populateFormSelect(selFormB, state.battleFighterB, state.battleFormIndexB);
    syncBattleFormsFromSelects();

    selFighterA.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFighterA = findFighterById(selFighterA.value);
      state.battleFormIndexA = Math.max(0, (state.battleFighterA.forms || []).length - 1);
      populateFormSelect(selFormA, state.battleFighterA, state.battleFormIndexA);
      syncBattleFormsFromSelects();
      state.beamGame.position = 0.5;
      state.beamGame.winnerText = '';
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    selFormA.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFormIndexA = Number(selFormA.value) || 0;
      syncBattleFormsFromSelects();
      state.beamGame.position = 0.5;
      state.beamGame.winnerText = '';
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    selFighterB.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFighterB = findFighterById(selFighterB.value);
      state.battleFormIndexB = Math.max(0, (state.battleFighterB.forms || []).length - 1);
      populateFormSelect(selFormB, state.battleFighterB, state.battleFormIndexB);
      syncBattleFormsFromSelects();
      state.beamGame.position = 0.5;
      state.beamGame.winnerText = '';
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    selFormB.addEventListener('change', () => {
      stopBeamGameLoop();
      state.battleFormIndexB = Number(selFormB.value) || 0;
      syncBattleFormsFromSelects();
      state.beamGame.position = 0.5;
      state.beamGame.winnerText = '';
      renderBattleOutcomeBox();
      syncStageUI(false);
    });

    renderBattleOutcomeBox();
    resetAndShuffleQuiz();
    renderQuizCard();
  }

  // ==========================================================================
  // NAVIGATION, ARENA SELECTOR, KEYBOARD & MODAL EVENTS
  // ==========================================================================
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
    // 5 Main Mode Tabs
    document.querySelectorAll('.nav-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchMode(btn.getAttribute('data-mode'));
      });
    });

    // 3D Battle Arena Selector
    const arenaSelect = document.getElementById('arena-select');
    arenaSelect.replaceChildren();
    DATA.arenas.forEach((arena) => {
      const opt = createEl('option', '', arena.name);
      opt.value = arena.id;
      arenaSelect.appendChild(opt);
    });
    arenaSelect.addEventListener('change', () => {
      const found = DATA.arenas.find((a) => a.id === arenaSelect.value);
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

    // Scouter HUD Visor Toggle
    const scouterBtn = document.getElementById('toggle-scouter-btn');
    scouterBtn.addEventListener('click', () => {
      state.scouterActive = !state.scouterActive;
      AUDIO.playSound('scouter');
      document.body.classList.toggle('scouter-on', state.scouterActive);
      document.body.classList.toggle('scouter-off', !state.scouterActive);
      scouterBtn.setAttribute('aria-pressed', state.scouterActive ? 'true' : 'false');
      document.getElementById('scouter-state-label').textContent = state.scouterActive ? 'ON' : 'OFF';
    });

    // Sound Toggle
    const soundBtn = document.getElementById('toggle-sound-btn');
    soundBtn.addEventListener('click', () => {
      const next = !AUDIO.isSoundEnabled();
      AUDIO.setSoundEnabled(next);
      soundBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
      document.getElementById('sound-state-label').textContent = next ? 'ON' : 'OFF';
      if (next) AUDIO.playSound('scouter');
    });

    // Stage Power-Up Burst Button
    document.getElementById('power-up-burst-btn').addEventListener('click', () => {
      state.powerBurstTimer = 85;
      AUDIO.playSound('burst');
    });

    // Start Live Beam Struggle Button
    document.getElementById('run-battle-btn').addEventListener('click', startInteractiveBeamStruggle);

    // Spacebar Mash Support for Live Beam Struggle!
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && state.activeMode === 'battle-quiz' && state.beamGame.active) {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        e.preventDefault();
        pushBeamForPlayer();
      }
    });

    // Shenron Certificate Modal Wish Buttons
    document.getElementById('close-shenron-btn').addEventListener('click', () => {
      document.getElementById('shenron-modal').classList.add('hidden');
    });
    document.getElementById('wish-gogeta-btn').addEventListener('click', () => {
      document.getElementById('shenron-modal').classList.add('hidden');
      state.selectedFusionRecipe = DATA.fusionRecipes[1]; // Gogeta SSB Evolved
      switchMode('fusion-lab');
    });
    document.getElementById('wish-ui-goku-btn').addEventListener('click', () => {
      document.getElementById('shenron-modal').classList.add('hidden');
      state.selectedFighter = DATA.fighters[0];
      state.selectedFighterFormIndex = DATA.fighters[0].forms.length - 1; // Ultra Instinct
      state.powerBurstTimer = 95;
      renderFightersView();
      switchMode('fighters');
    });
  }

  function collectAllRenderUrls() {
    const urls = [];
    DATA.fighters.forEach((f) => {
      urls.push(f.spriteUrl);
      (f.forms || []).forEach((sf) => urls.push(sf.spriteUrl));
    });
    DATA.hairForms.forEach((hf) => urls.push(hf.spriteUrl));
    DATA.fusionRecipes.forEach((r) => urls.push(r.resultSprite));
    DATA.timelineSagas.forEach((s) => urls.push(s.spriteUrl));
    return urls;
  }

  function init() {
    // Load Goku Base immediately, warm the rest lazily during browser idle time!
    RENDERER.getCharacterImage(state.selectedFighter.spriteUrl);
    RENDERER.warmImageQueue(collectAllRenderUrls());

    renderFightersView();
    renderHairGuideView();
    renderFusionLabView();
    renderTimelineView();
    initBattleAndQuiz();
    syncStageUI(false);
    setupEvents();

    const canvasEl = document.getElementById('db-3d-canvas');
    RENDERER.init(canvasEl, () => state);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
