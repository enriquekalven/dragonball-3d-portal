/* ==========================================================================
   DRAGON BALL 3D PORTAL — 3D ARENA, FUSION & BEAM-STRUGGLE CANVAS ENGINE
   Features:
   - 5 Selectable 3D Perspective Battle Arenas (Tiles, Sky, Horizon Glow)
   - Ground Shadow, Camera Shake & Levitating Perimeter Pebbles on Power-Up
   - 3D Spiraling Fusion Convergence Sequence (Potara & Dance)
   - Live Tug-of-War 1v1 Beam Struggle Visualization
   - Lazy Idle-Callback Render Preloader for Instant Startup
   - Zero obstructing floating planets or Dragon Balls over characters!
   ========================================================================== */

(function () {
  'use strict';

  const imageCache = new Map();
  let canvas = null;
  let ctx = null;
  let getState = null;

  // Ambient 3D stars / atmospheric motes (kept high/distant, never blocking fighter)
  const stars3D = Array.from({ length: 55 }, () => ({
    x: (Math.random() - 0.5) * 980,
    y: -340 + Math.random() * 440,
    z: 120 + Math.random() * 520,
    size: 0.8 + Math.random() * 1.9
  }));

  // 3D Rising Aura Particles
  const auraParticles = Array.from({ length: 40 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 34 + Math.random() * 88,
    y: (Math.random() - 0.5) * 280,
    speed: 1.4 + Math.random() * 2.5,
    size: 2.0 + Math.random() * 4.2
  }));

  // Perimeter 3D Arena Pebbles (levitate during transformations/power-ups; wide radius so character stays 100% clear)
  const arenaRocks = Array.from({ length: 14 }, (_, idx) => ({
    angle: (idx / 14) * Math.PI * 2 + Math.random() * 0.25,
    radius: 175 + (idx % 3) * 42,
    baseY: 164,
    lift: 0,
    maxLift: 45 + Math.random() * 85,
    size: 5 + (idx % 4) * 2.6,
    rotSpeed: (Math.random() - 0.5) * 2.5
  }));

  function getCharacterImage(url) {
    if (!url) return null;
    if (imageCache.has(url)) {
      return imageCache.get(url);
    }
    const img = new Image();
    const entry = { img, loaded: false };
    img.onload = function () {
      entry.loaded = true;
    };
    img.src = url;
    imageCache.set(url, entry);
    return entry;
  }

  function warmImageQueue(urls) {
    const unique = Array.from(new Set((urls || []).filter(Boolean)));
    let index = 0;

    function loadNextBatch() {
      const batchEnd = Math.min(unique.length, index + 4);
      while (index < batchEnd) {
        getCharacterImage(unique[index]);
        index += 1;
      }
      if (index < unique.length) {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(loadNextBatch, { timeout: 600 });
        } else {
          window.setTimeout(loadNextBatch, 80);
        }
      }
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(loadNextBatch, { timeout: 400 });
    } else {
      window.setTimeout(loadNextBatch, 60);
    }
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(300, Math.floor(rect.width * dpr));
    canvas.height = Math.max(300, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project3D(x, y, z, width, height, camera) {
    const cosY = Math.cos(camera.rotY);
    const sinY = Math.sin(camera.rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(camera.rotX);
    const sinX = Math.sin(camera.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const fov = 560 * camera.zoom;
    const viewerDist = 650;
    const scale = fov / Math.max(70, viewerDist + z2);

    return {
      x: width * 0.5 + x1 * scale,
      y: height * 0.45 + y2 * scale,
      z: z2,
      scale: scale
    };
  }

  const DAYLIGHT_ARENAS = {
    'space-capsule': {
      skyInner: '#e0f2fe',
      skyOuter: '#7dd3fc',
      gridColor: 'rgba(15, 23, 42, 0.16)',
      rockColor: '#64748b',
      floorTileA: 'rgba(255, 255, 255, 0.82)',
      floorTileB: 'rgba(226, 232, 240, 0.85)'
    },
    'planet-namek': {
      skyInner: '#d1fae5',
      skyOuter: '#34d399',
      gridColor: 'rgba(6, 95, 70, 0.22)',
      rockColor: '#059669',
      floorTileA: 'rgba(167, 243, 208, 0.78)',
      floorTileB: 'rgba(110, 231, 183, 0.78)'
    },
    'cell-games': {
      skyInner: '#dbeafe',
      skyOuter: '#60a5fa',
      gridColor: 'rgba(30, 58, 138, 0.18)',
      rockColor: '#64748b',
      floorTileA: 'rgba(248, 250, 252, 0.90)',
      floorTileB: 'rgba(203, 213, 225, 0.85)'
    },
    'time-chamber': {
      skyInner: '#ffffff',
      skyOuter: '#cbd5e1',
      gridColor: 'rgba(71, 85, 105, 0.18)',
      rockColor: '#94a3b8',
      floorTileA: 'rgba(255, 255, 255, 0.92)',
      floorTileB: 'rgba(226, 232, 240, 0.85)'
    },
    'world-of-void': {
      skyInner: '#f3e8ff',
      skyOuter: '#c084fc',
      gridColor: 'rgba(88, 28, 135, 0.20)',
      rockColor: '#7e22ce',
      floorTileA: 'rgba(243, 232, 255, 0.82)',
      floorTileB: 'rgba(216, 180, 254, 0.78)'
    }
  };

  function drawArenaBackgroundAndFloor(t, width, height, state, auraHex) {
    const isLight = state.theme === 'light';
    const baseArena = state.selectedArena;
    const arena = (isLight && DAYLIGHT_ARENAS[baseArena.id]) ? DAYLIGHT_ARENAS[baseArena.id] : baseArena;
    const cam = state.camera;

    // 1. Dynamic Arena Sky Gradient
    const skyGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.42,
      20,
      width * 0.5,
      height * 0.46,
      Math.max(width, height) * 0.78
    );
    skyGrad.addColorStop(0, arena.skyInner);
    skyGrad.addColorStop(1, arena.skyOuter);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Distant Atmospheric Stars / Motes
    stars3D.forEach((star) => {
      const p = project3D(star.x, star.y, star.z, width, height, cam);
      if (p.scale > 0) {
        ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(226, 232, 240, 0.42)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, star.size * p.scale * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 3. True 3D Perspective Checkerboard Arena Stage Floor (y = 170)
    const gridCount = 6;
    const tileSize = 92;
    const halfSpan = (gridCount * tileSize) * 0.5;
    const floorY = 170;

    for (let gz = gridCount - 1; gz >= 0; gz--) {
      for (let gx = 0; gx < gridCount; gx++) {
        const x0 = -halfSpan + gx * tileSize;
        const x1 = x0 + tileSize;
        const z0 = -halfSpan + gz * tileSize;
        const z1 = z0 + tileSize;

        const p0 = project3D(x0, floorY, z0, width, height, cam);
        const p1 = project3D(x1, floorY, z0, width, height, cam);
        const p2 = project3D(x1, floorY, z1, width, height, cam);
        const p3 = project3D(x0, floorY, z1, width, height, cam);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        ctx.fillStyle = (gx + gz) % 2 === 0 ? arena.floorTileA : arena.floorTileB;
        ctx.fill();
        ctx.strokeStyle = arena.gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 4. Inner Energy Shockwave Ring on the Arena Floor
    const ringRadius = state.powerBurstTimer > 0
      ? 135 + (85 - state.powerBurstTimer) * 1.9
      : 135 + Math.sin(t * 2.5) * 6;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const ang = (i / 48) * Math.PI * 2 + t * 0.3;
      const rp = project3D(
        Math.cos(ang) * ringRadius,
        floorY - 1,
        Math.sin(ang) * ringRadius,
        width,
        height,
        cam
      );
      if (i === 0) ctx.moveTo(rp.x, rp.y);
      else ctx.lineTo(rp.x, rp.y);
    }
    ctx.strokeStyle = isLight && auraHex === '#e2e8f0' ? '#7c3aed' : auraHex;
    ctx.lineWidth = state.powerBurstTimer > 0 ? 3 : 2;
    ctx.stroke();

    // 5. Perimeter Levitating 3D Rocks during Power-Up / Intense Ki
    const shouldFloatRocks = state.powerBurstTimer > 0 || state.hasLightningActive || state.activeMode === 'battle-quiz';
    arenaRocks.forEach((rock) => {
      const targetLift = shouldFloatRocks ? rock.maxLift : 0;
      rock.lift += (targetLift - rock.lift) * 0.08;
      if (rock.lift < 1.5) return;

      const rx = Math.cos(rock.angle + t * 0.25) * rock.radius;
      const rz = Math.sin(rock.angle + t * 0.25) * rock.radius;
      const ry = rock.baseY - rock.lift + Math.sin(t * 3 + rock.angle) * 5;
      const rp = project3D(rx, ry, rz, width, height, cam);
      const rSize = rock.size * rp.scale;

      ctx.save();
      ctx.translate(rp.x, rp.y);
      ctx.rotate(t * rock.rotSpeed);
      ctx.fillStyle = arena.rockColor;
      ctx.strokeStyle = auraHex;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-rSize, -rSize * 0.4);
      ctx.lineTo(0, -rSize);
      ctx.lineTo(rSize, -rSize * 0.3);
      ctx.lineTo(rSize * 0.7, rSize * 0.8);
      ctx.lineTo(-rSize * 0.7, rSize * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawGroundShadow(x3d, z3d, radiusX, width, height, cam) {
    const sp = project3D(x3d, 168, z3d, width, height, cam);
    ctx.save();
    const isLight = getState && getState().theme === 'light';
    ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.24)' : 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, radiusX * sp.scale, radiusX * 0.34 * sp.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCharacterSprite(spriteUrl, centerProj, maxHeightPx, auraHex, floatBob, burstActive, cam) {
    const imgEntry = getCharacterImage(spriteUrl);
    if (!imgEntry || !imgEntry.loaded) return;

    const img = imgEntry.img;
    const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    const targetHeight = maxHeightPx * centerProj.scale * (burstActive ? 1.05 : 1.0);
    const targetWidth = targetHeight * aspect;
    const isLight = getState && getState().theme === 'light';

    ctx.save();
    ctx.translate(centerProj.x, centerProj.y + floatBob);
    // Subtle 3D horizontal perspective skew when user orbits camera
    const subtleTilt = Math.sin(cam.rotY) * 0.035;
    ctx.transform(1, 0, subtleTilt, 1, 0, 0);
    ctx.shadowColor = (isLight && (auraHex === '#e2e8f0' || auraHex === '#f8fafc'))
      ? '#6366f1'
      : auraHex;
    ctx.shadowBlur = burstActive ? 38 : 22;
    ctx.drawImage(
      img,
      -targetWidth * 0.5,
      -targetHeight * 0.5,
      targetWidth,
      targetHeight
    );
    ctx.restore();
  }

  function drawSingleCharacterStage(t, width, height, state, spriteUrl, auraHex, showSparks) {
    const cam = state.camera;
    const burstActive = state.powerBurstTimer > 0;
    const burstScale = burstActive ? 1.24 : 1.0;
    const floatBob = Math.sin(t * 2.6) * 6;
    const center = project3D(0, -14, 0, width, height, cam);

    // Ground shadow directly on arena floor
    drawGroundShadow(0, 0, 72 - floatBob * 0.8, width, height, cam);

    // Volumetric Multi-Layer Ki Aura Glow behind Character
    const auraGrad = ctx.createRadialGradient(
      center.x,
      center.y,
      18 * center.scale,
      center.x,
      center.y,
      210 * center.scale * burstScale
    );
    auraGrad.addColorStop(0, '#ffffff');
    auraGrad.addColorStop(0.28, auraHex);
    auraGrad.addColorStop(0.65, auraHex + '44');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      center.x,
      center.y,
      155 * center.scale * burstScale,
      215 * center.scale * burstScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Rising 3D Aura Particles
    auraParticles.forEach((pt) => {
      pt.y -= pt.speed * (burstActive ? 2.3 : 1.0);
      if (pt.y < -195) pt.y = 165;
      const px = Math.cos(pt.angle + t * 1.35) * pt.radius;
      const pz = Math.sin(pt.angle + t * 1.35) * pt.radius;
      const proj = project3D(px, pt.y, pz, width, height, cam);
      ctx.fillStyle = auraHex;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, pt.size * proj.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Authentic Character Render
    drawCharacterSprite(
      spriteUrl,
      center,
      Math.min(height * 0.62, 365),
      auraHex,
      floatBob,
      burstActive,
      cam
    );

    // Bio-Electric Lightning Bolts (SSJ2 / SSJ3 / Rosé / Ultra Ego / Power-Up Burst)
    if (burstActive || showSparks) {
      const boltCount = burstActive ? 5 : 2;
      for (let b = 0; b < boltCount; b++) {
        const startX = (Math.random() - 0.5) * 145;
        const startY = (Math.random() - 0.5) * 220;
        const pStart = project3D(startX, startY, 22, width, height, cam);
        ctx.strokeStyle = burstActive ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        for (let seg = 1; seg <= 4; seg++) {
          ctx.lineTo(
            pStart.x + (Math.random() - 0.5) * 36,
            pStart.y - seg * 16 + (Math.random() - 0.5) * 12
          );
        }
        ctx.stroke();
      }
    }
  }

  function drawFusionStage(t, width, height, state) {
    const recipe = state.selectedFusionRecipe;
    const cam = state.camera;
    const timer = state.fusionAnimTimer || 0;

    if (timer > 14) {
      // Spiraling Convergence of Warrior A and Warrior B!
      const progress = 1 - (timer - 14) / 66; // 0.0 -> 1.0
      const dist = (1 - progress) * 185;
      const spinAngle = progress * Math.PI * 3.0;

      const xA = -Math.cos(spinAngle) * dist;
      const zA = Math.sin(spinAngle) * dist;
      const xB = Math.cos(spinAngle) * dist;
      const zB = -Math.sin(spinAngle) * dist;

      const posA = project3D(xA, -12, zA, width, height, cam);
      const posB = project3D(xB, -12, zB, width, height, cam);

      drawCharacterSprite(state.fusionSpriteA, posA, 230, '#f97316', 0, true, cam);
      drawCharacterSprite(state.fusionSpriteB, posB, 230, '#38bdf8', 0, true, cam);

      // Growing Fusion Core Starburst in Center
      const center = project3D(0, -12, 0, width, height, cam);
      const coreR = (25 + progress * 150) * center.scale;
      const grad = ctx.createRadialGradient(center.x, center.y, 4, center.x, center.y, coreR);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, recipe.auraHex);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, coreR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fused Warrior Revealed!
      drawSingleCharacterStage(
        t,
        width,
        height,
        state,
        recipe.resultSprite,
        recipe.auraHex,
        true
      );
      if (timer > 0) {
        const flashAlpha = timer / 14;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (flashAlpha * 0.65).toFixed(2) + ')';
        ctx.fillRect(0, 0, width, height);
      }
    }
  }

  function drawBeamClashStage(t, width, height, state) {
    const cam = state.camera;
    const formA = state.battleFormA;
    const formB = state.battleFormB;
    const auraA = formA.auraHex || '#00e5ff';
    const auraB = formB.auraHex || '#ef4444';

    const leftPos = project3D(-175, -8, 0, width, height, cam);
    const rightPos = project3D(175, -8, 0, width, height, cam);

    // Tug-of-war beam clash X coordinate (-130 to +130 based on beamPosition 0..1)
    const beamRatio = Math.max(0.05, Math.min(0.95, state.beamGame.position));
    const clashX3D = -135 + beamRatio * 270;
    const clashCenter = project3D(clashX3D, -8, 0, width, height, cam);

    drawGroundShadow(-175, 0, 52, width, height, cam);
    drawGroundShadow(175, 0, 52, width, height, cam);

    [
      { spriteUrl: formA.spriteUrl, aura: auraA, pos: leftPos, dir: 1 },
      { spriteUrl: formB.spriteUrl, aura: auraB, pos: rightPos, dir: -1 }
    ].forEach((side) => {
      // Fighter Aura Sphere
      const g = ctx.createRadialGradient(
        side.pos.x,
        side.pos.y,
        10,
        side.pos.x,
        side.pos.y,
        120 * side.pos.scale
      );
      g.addColorStop(0, side.aura);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(side.pos.x, side.pos.y, 120 * side.pos.scale, 0, Math.PI * 2);
      ctx.fill();

      // Outer Energy Beam
      ctx.strokeStyle = side.aura;
      ctx.lineCap = 'round';
      ctx.lineWidth = (20 + Math.sin(t * 22) * 5) * side.pos.scale;
      ctx.beginPath();
      ctx.moveTo(side.pos.x + side.dir * 26 * side.pos.scale, side.pos.y);
      ctx.lineTo(clashCenter.x, clashCenter.y);
      ctx.stroke();

      // Inner White-Hot Beam Core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = (8 + Math.sin(t * 26) * 2) * side.pos.scale;
      ctx.beginPath();
      ctx.moveTo(side.pos.x + side.dir * 26 * side.pos.scale, side.pos.y);
      ctx.lineTo(clashCenter.x, clashCenter.y);
      ctx.stroke();

      // Fighter Full Render
      drawCharacterSprite(
        side.spriteUrl,
        side.pos,
        220,
        side.aura,
        Math.sin(t * 3.2 + side.dir) * 4,
        state.beamGame.active,
        cam
      );
    });

    // Central Tug-of-War Plasma Collision Sphere!
    const pulseR = (36 + Math.sin(t * 18) * 9) * clashCenter.scale;
    const clashGrad = ctx.createRadialGradient(
      clashCenter.x,
      clashCenter.y,
      4,
      clashCenter.x,
      clashCenter.y,
      pulseR * 2.3
    );
    clashGrad.addColorStop(0, '#ffffff');
    clashGrad.addColorStop(0.35, '#ffd000');
    clashGrad.addColorStop(0.7, auraA + '99');
    clashGrad.addColorStop(1, 'rgba(255, 107, 0, 0)');
    ctx.fillStyle = clashGrad;
    ctx.beginPath();
    ctx.arc(clashCenter.x, clashCenter.y, pulseR * 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderLoop(timestamp) {
    const state = getState ? getState() : null;
    if (!state || !canvas || !ctx) {
      requestAnimationFrame(renderLoop);
      return;
    }

    const t = timestamp * 0.001;
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 500;

    if (!state.camera.isDragging && state.activeMode !== 'battle-quiz') {
      state.camera.rotY += 0.003;
    }
    if (state.powerBurstTimer > 0) {
      state.powerBurstTimer -= 1;
    }
    if (state.fusionAnimTimer > 0) {
      state.fusionAnimTimer -= 1;
    }

    // Determine active character visual & aura color
    let activeSpriteUrl = '';
    let auraHex = '#ffd000';
    let showSparks = false;

    if (state.activeMode === 'fighters') {
      const fForm = state.activeFighterForm;
      activeSpriteUrl = fForm.spriteUrl;
      auraHex = fForm.auraHex || state.selectedFighter.auraColor;
      showSparks = fForm.label.indexOf('2') !== -1 || fForm.label.indexOf('3') !== -1 || fForm.label.indexOf('Ego') !== -1 || fForm.label.indexOf('Rosé') !== -1;
    } else if (state.activeMode === 'hair-guide') {
      activeSpriteUrl = state.selectedHairForm.spriteUrl;
      auraHex = state.selectedHairForm.auraHex;
      showSparks = Boolean(state.selectedHairForm.hasLightning);
    } else if (state.activeMode === 'fusion-lab') {
      auraHex = state.selectedFusionRecipe.auraHex;
      showSparks = true;
    } else if (state.activeMode === 'timeline') {
      activeSpriteUrl = state.selectedSaga.spriteUrl;
      auraHex = state.selectedSaga.planetColor;
    } else if (state.activeMode === 'battle-quiz') {
      auraHex = state.battleFormA.auraHex || '#ffd000';
    }
    state.hasLightningActive = showSparks;

    ctx.save();
    // Subtle Camera Shake during intense power-up burst or live beam struggle
    const shakeIntensity = state.powerBurstTimer > 45
      ? (state.powerBurstTimer - 45) * 0.14
      : (state.beamGame.active ? 1.8 : 0);
    if (shakeIntensity > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shakeIntensity * 2,
        (Math.random() - 0.5) * shakeIntensity * 2
      );
    }

    drawArenaBackgroundAndFloor(t, width, height, state, auraHex);

    if (state.activeMode === 'battle-quiz') {
      drawBeamClashStage(t, width, height, state);
    } else if (state.activeMode === 'fusion-lab') {
      drawFusionStage(t, width, height, state);
    } else {
      drawSingleCharacterStage(t, width, height, state, activeSpriteUrl, auraHex, showSparks);
    }

    ctx.restore();
    requestAnimationFrame(renderLoop);
  }

  function init(canvasEl, getStateFn) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    getState = getStateFn;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('pointerdown', (e) => {
      const st = getState();
      st.camera.isDragging = true;
      st.camera.lastX = e.clientX;
      st.camera.lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      const st = getState();
      if (!st || !st.camera.isDragging) return;
      const dx = e.clientX - st.camera.lastX;
      const dy = e.clientY - st.camera.lastY;
      st.camera.lastX = e.clientX;
      st.camera.lastY = e.clientY;
      st.camera.rotY += dx * 0.008;
      st.camera.rotX = Math.max(-0.45, Math.min(0.45, st.camera.rotX + dy * 0.006));
    });

    window.addEventListener('pointerup', () => {
      const st = getState();
      if (st) st.camera.isDragging = false;
    });

    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const st = getState();
        if (!st) return;
        const factor = e.deltaY > 0 ? -0.07 : 0.07;
        st.camera.zoom = Math.max(0.72, Math.min(1.45, st.camera.zoom + factor));
      },
      { passive: false }
    );

    requestAnimationFrame(renderLoop);
  }

  window.DB_RENDERER_3D = {
    init,
    resizeCanvas,
    getCharacterImage,
    warmImageQueue
  };
})();
