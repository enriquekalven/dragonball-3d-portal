/* ==========================================================================
   DRAGON BALL 3D PORTAL — 3D ARENA, TOYBOX, FUSION & BEAM-STRUGGLE ENGINE
   Features:
   - 5 Selectable 3D Perspective Battle Arenas (Tiles, Sky, Horizon Glow)
   - Hold-to-Charge Ki Scaling (Aura Growth, Rock Levitation, Bio-Lightning)
   - Signature Ultimate Beam Attack (Charge Sphere -> 3D Beam -> Arena Crater!)
   - Instant Transmission / Zanzoken Afterimage Teleport (Button + Arena Tap!)
   - Hidden 3D Crystal Dragon Ball Radar Hunt (Spin 3D Stage & Tap to Collect!)
   - 3D Spiraling Fusion Convergence Sequence & 1v1 Tug-of-War Beam Struggle
   ========================================================================== */

(function () {
  'use strict';

  const imageCache = new Map();
  let canvas = null;
  let ctx = null;
  let getState = null;
  let callbacks = {};

  // Ambient 3D stars / atmospheric motes (kept high/distant, never blocking fighter)
  const stars3D = Array.from({ length: 55 }, () => ({
    x: (Math.random() - 0.5) * 980,
    y: -340 + Math.random() * 440,
    z: 120 + Math.random() * 520,
    size: 0.8 + Math.random() * 1.9
  }));

  // 3D Rising Aura Particles
  const auraParticles = Array.from({ length: 44 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 34 + Math.random() * 88,
    y: (Math.random() - 0.5) * 280,
    speed: 1.4 + Math.random() * 2.5,
    size: 2.0 + Math.random() * 4.2
  }));

  // Perimeter 3D Arena Pebbles (levitate during transformations/Ki charge/power-ups)
  const arenaRocks = Array.from({ length: 14 }, (_, idx) => ({
    angle: (idx / 14) * Math.PI * 2 + Math.random() * 0.25,
    radius: 175 + (idx % 3) * 42,
    baseY: 164,
    lift: 0,
    maxLift: 48 + Math.random() * 90,
    size: 5 + (idx % 4) * 2.6,
    rotSpeed: (Math.random() - 0.5) * 2.5
  }));

  // Canonical star coordinates inside a normalized [-1..1] crystal sphere for 3D canvas Dragon Balls
  function getNormalizedStarOffsets(starCount) {
    const ring = (n, r, deg0) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const rad = ((deg0 + (360 / n) * i) * Math.PI) / 180;
        out.push([Math.cos(rad) * r, Math.sin(rad) * r]);
      }
      return out;
    };
    switch (starCount) {
      case 1:
        return [[0, 0]];
      case 2:
        return [[-0.28, -0.22], [0.28, 0.22]];
      case 3:
        return [[0, -0.38], [-0.34, 0.22], [0.34, 0.22]];
      case 4:
        return [[0, -0.42], [-0.42, 0], [0.42, 0], [0, 0.42]];
      case 5:
        return [[-0.34, -0.34], [0.34, -0.34], [0, 0], [-0.34, 0.34], [0.34, 0.34]];
      case 6:
        return [[0, 0]].concat(ring(5, 0.48, -90));
      case 7:
      default:
        return [[0, 0]].concat(ring(6, 0.49, -90));
    }
  }

  function drawMiniFiveStar(cx, cy, outerR) {
    const innerR = outerR * 0.44;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = ((-90 + i * 36) * Math.PI) / 180;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

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
    const kiRatio = (state.kiCharge || 0) / 100;

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

    // 3b. Destructible Glowing Impact Crater on Arena Floor (after Signature Attack!)
    if (state.arenaCrater && state.arenaCrater.timer > 0) {
      const cr = state.arenaCrater;
      const alpha = Math.min(1, cr.timer / 45);
      const cp = project3D(cr.x, floorY - 1, cr.z, width, height, cam);
      const rOuter = 54 * cp.scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      const cGrad = ctx.createRadialGradient(cp.x, cp.y, 3, cp.x, cp.y, rOuter);
      cGrad.addColorStop(0, '#ffffff');
      cGrad.addColorStop(0.35, cr.color || '#ff6b00');
      cGrad.addColorStop(0.75, 'rgba(15, 23, 42, 0.85)');
      cGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.ellipse(cp.x, cp.y, rOuter, rOuter * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Radial fracture lines
      ctx.strokeStyle = cr.color || '#ffd000';
      ctx.lineWidth = 1.6;
      for (let k = 0; k < 7; k++) {
        const ka = (k / 7) * Math.PI * 2 + 0.3;
        ctx.beginPath();
        ctx.moveTo(cp.x + Math.cos(ka) * rOuter * 0.25, cp.y + Math.sin(ka) * rOuter * 0.1);
        ctx.lineTo(cp.x + Math.cos(ka) * rOuter * 1.15, cp.y + Math.sin(ka) * rOuter * 0.48);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Inner Energy Shockwave Ring on the Arena Floor (expands with Ki Charge!)
    const posX = state.fighterPos3D ? state.fighterPos3D.x : 0;
    const posZ = state.fighterPos3D ? state.fighterPos3D.z : 0;
    const ringRadius = state.powerBurstTimer > 0
      ? 115 + (85 - state.powerBurstTimer) * 1.9
      : 112 + kiRatio * 68 + Math.sin(t * 2.5) * 6;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const ang = (i / 48) * Math.PI * 2 + t * (0.3 + kiRatio * 1.2);
      const rp = project3D(
        posX + Math.cos(ang) * ringRadius,
        floorY - 1,
        posZ + Math.sin(ang) * ringRadius,
        width,
        height,
        cam
      );
      if (i === 0) ctx.moveTo(rp.x, rp.y);
      else ctx.lineTo(rp.x, rp.y);
    }
    ctx.strokeStyle = isLight && auraHex === '#e2e8f0' ? '#7c3aed' : auraHex;
    ctx.lineWidth = state.powerBurstTimer > 0 || kiRatio > 0.35 ? 3.2 : 2;
    ctx.stroke();

    // 5. Perimeter Levitating 3D Rocks during Power-Up / Ki Charge / Battle
    const shouldFloatRocks =
      state.powerBurstTimer > 0 ||
      kiRatio > 0.08 ||
      state.hasLightningActive ||
      state.activeMode === 'battle';
    arenaRocks.forEach((rock) => {
      const boostLift = kiRatio > 0.08 ? rock.maxLift * (0.35 + kiRatio * 0.95) : rock.maxLift;
      const targetLift = shouldFloatRocks ? boostLift : 0;
      rock.lift += (targetLift - rock.lift) * 0.1;
      if (rock.lift < 1.5) return;

      const rx = Math.cos(rock.angle + t * (0.25 + kiRatio * 0.7)) * rock.radius;
      const rz = Math.sin(rock.angle + t * (0.25 + kiRatio * 0.7)) * rock.radius;
      const ry = rock.baseY - rock.lift + Math.sin(t * 3 + rock.angle) * 5;
      const rp = project3D(rx, ry, rz, width, height, cam);
      const rSize = rock.size * rp.scale;

      ctx.save();
      ctx.translate(rp.x, rp.y);
      ctx.rotate(t * rock.rotSpeed * (1 + kiRatio * 1.8));
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

    // 6. Hidden 3D Crystal Dragon Ball on Arena Perimeter (Radar Hunt Mini-Game!)
    drawHidden3DDragonBall(t, width, height, state);
  }

  function drawHidden3DDragonBall(t, width, height, state) {
    const hb = state.hiddenBall;
    if (!hb) return;
    if (state.activeMode === 'battle' || state.dragonBallsCollected >= 7 || hb.cooldown > 0) {
      hb.lastScreenPos = null;
      return;
    }

    const cam = state.camera;
    const starNum = Math.min(7, Math.max(1, (state.dragonBallsCollected || 0) + 1));
    const bx = Math.cos(hb.angle) * hb.radius;
    const bz = Math.sin(hb.angle) * hb.radius;
    const by = (width < 520 ? 44 : 88) + Math.sin(t * 3.4) * 8;
    const proj = project3D(bx, by, bz, width, height, cam);

    const orbR = Math.max(13, 21 * proj.scale);
    hb.lastScreenPos = { x: proj.x, y: proj.y, r: Math.max(28, orbR * 1.65) };

    // Ground shadow under floating Dragon Ball
    drawGroundShadow(bx, bz, 22, width, height, cam);

    ctx.save();
    // Pulsing Golden Dragon Radar Ping Ring
    const pingPhase = (t * 1.4) % 1;
    ctx.strokeStyle = 'rgba(255, 208, 0, ' + (0.85 * (1 - pingPhase)).toFixed(2) + ')';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, orbR * (1.1 + pingPhase * 1.3), 0, Math.PI * 2);
    ctx.stroke();

    // Crystal Amber Sphere Gradient
    const g = ctx.createRadialGradient(
      proj.x - orbR * 0.32,
      proj.y - orbR * 0.34,
      orbR * 0.1,
      proj.x,
      proj.y,
      orbR
    );
    g.addColorStop(0, '#fff7b2');
    g.addColorStop(0.35, '#ffbe0b');
    g.addColorStop(0.78, '#fb6f00');
    g.addColorStop(1, '#9a3412');

    ctx.shadowColor = '#ff9e00';
    ctx.shadowBlur = 16;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, orbR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Canonical Crimson Stars inside the 3D Sphere
    ctx.fillStyle = '#dc2626';
    const pts = getNormalizedStarOffsets(starNum);
    const starSize = starNum === 1 ? orbR * 0.32 : starNum <= 4 ? orbR * 0.22 : orbR * 0.18;
    pts.forEach(([nx, ny]) => {
      drawMiniFiveStar(proj.x + nx * orbR * 0.62, proj.y + ny * orbR * 0.62, starSize);
    });

    // Refractive Glass Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.beginPath();
    ctx.ellipse(
      proj.x - orbR * 0.34,
      proj.y - orbR * 0.38,
      orbR * 0.32,
      orbR * 0.16,
      -0.48,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
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

  // Akira Toriyama Zanzoken (Afterimage) Speed-Scanlines Effect!
  function drawZanzokenGhost(width, height, state, maxHeightPx) {
    const ghost = state.teleportGhost;
    if (!ghost || ghost.timer <= 0) return;

    const cam = state.camera;
    const proj = project3D(ghost.x, ghost.y, ghost.z, width, height, cam);
    const alpha = Math.min(1, ghost.timer / 22);
    const imgEntry = getCharacterImage(ghost.spriteUrl);

    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    if (imgEntry && imgEntry.loaded) {
      const aspect = imgEntry.img.naturalWidth / Math.max(1, imgEntry.img.naturalHeight);
      const h = maxHeightPx * proj.scale;
      const w = h * aspect;
      ctx.drawImage(imgEntry.img, proj.x - w * 0.5, proj.y - h * 0.5, w, h);
    }

    // Classic horizontal anime Zanzoken speed lines across the vanishing spot
    ctx.globalAlpha = alpha * 0.92;
    ctx.strokeStyle = state.theme === 'light' ? '#0f172a' : '#ffffff';
    ctx.lineWidth = 2.2;
    for (let i = -5; i <= 5; i++) {
      const ly = proj.y + i * 16 * proj.scale;
      const halfLen = (68 - Math.abs(i) * 8 + (i % 2 === 0 ? 18 : -8)) * proj.scale;
      ctx.beginPath();
      ctx.moveTo(proj.x - halfLen, ly);
      ctx.lineTo(proj.x + halfLen, ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Signature Ultimate Beam Blast (Kamehameha / Galick Gun / Special Beam Cannon / Hakai!)
  function drawSignatureAttackEffect(t, width, height, state, center, auraHex) {
    const atk = state.signatureAttack;
    if (!atk || atk.timer <= 0) return;

    const cam = state.camera;
    const isCharging = atk.timer > 50;
    const handX = center.x + 22 * center.scale;
    const handY = center.y - 6 * center.scale;
    const beamColor = auraHex === '#e2e8f0' ? '#38bdf8' : auraHex;

    ctx.save();
    if (isCharging) {
      // Phase 1: Condensing Ki Sphere + Inward Rays at Fighter's Hands
      const chargeProgress = 1 - (atk.timer - 50) / 22; // 0 -> 1
      const orbR = (14 + chargeProgress * 28 + Math.sin(t * 35) * 4) * center.scale;
      const g = ctx.createRadialGradient(handX, handY, 2, handX, handY, orbR * 1.9);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.45, beamColor);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(handX, handY, orbR * 1.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let r = 0; r < 8; r++) {
        const ang = (r / 8) * Math.PI * 2 + t * 8;
        const inner = orbR * 0.4;
        const outer = orbR * (2.2 - chargeProgress * 0.8);
        ctx.beginPath();
        ctx.moveTo(handX + Math.cos(ang) * outer, handY + Math.sin(ang) * outer);
        ctx.lineTo(handX + Math.cos(ang) * inner, handY + Math.sin(ang) * inner);
        ctx.stroke();
      }
    } else {
      // Phase 2: Full-Screen 3D Energy Cannon Blast -> Arena Crater Dome!
      const blastRatio = Math.min(1, (50 - atk.timer) / 9); // extends across arena in 9 frames!
      const fadeAlpha = Math.min(1, atk.timer / 12);
      ctx.globalAlpha = fadeAlpha;

      const target3D = project3D(158, 162, -32, width, height, cam);
      const endX = handX + (target3D.x - handX) * blastRatio;
      const endY = handY + (target3D.y - handY) * blastRatio;

      // Outer Colored Plasma Beam
      ctx.lineCap = 'round';
      ctx.strokeStyle = beamColor;
      ctx.shadowColor = beamColor;
      ctx.shadowBlur = 28;
      ctx.lineWidth = (34 + Math.sin(t * 34) * 6) * center.scale;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Inner White-Hot Beam Core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = (14 + Math.sin(t * 40) * 3) * center.scale;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Muzzle Starburst at Hands
      const muzGrad = ctx.createRadialGradient(handX, handY, 3, handX, handY, 52 * center.scale);
      muzGrad.addColorStop(0, '#ffffff');
      muzGrad.addColorStop(0.5, beamColor);
      muzGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = muzGrad;
      ctx.beginPath();
      ctx.arc(handX, handY, 52 * center.scale, 0, Math.PI * 2);
      ctx.fill();

      // 3D Impact Explosion Dome when beam hits the arena!
      if (blastRatio >= 0.92) {
        const domeR = (58 + Math.sin(t * 28) * 10) * target3D.scale;
        const expGrad = ctx.createRadialGradient(endX, endY, 6, endX, endY, domeR * 1.85);
        expGrad.addColorStop(0, '#ffffff');
        expGrad.addColorStop(0.38, '#ffd000');
        expGrad.addColorStop(0.72, beamColor);
        expGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(endX, endY, domeR * 1.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dynamic Anime Attack Shout Callout Banner!
    if (atk.moveName) {
      const label = '☄️ ' + atk.moveName.toUpperCase() + '!!';
      ctx.globalAlpha = Math.min(1, atk.timer / 10);
      ctx.font = '900 ' + (width < 520 ? '15px' : '19px') + ' system-ui, sans-serif';
      const tw = ctx.measureText(label).width;
      const bx = width * 0.5 - tw * 0.5 - 14;
      const by = width < 520 ? 174 : 194;
      ctx.fillStyle = 'rgba(7, 11, 20, 0.88)';
      ctx.strokeStyle = '#ffd000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, tw + 28, 32, 999);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, width * 0.5, by + 16);
    }
    ctx.restore();
  }

  function drawSingleCharacterStage(t, width, height, state, spriteUrl, auraHex, showSparks) {
    const cam = state.camera;
    const isCompactViewport = width < 520;
    const kiRatio = (state.kiCharge || 0) / 100;
    const burstActive =
      state.powerBurstTimer > 0 ||
      kiRatio > 0.25 ||
      Boolean(state.signatureAttack && state.signatureAttack.timer > 0);
    const burstScale = (state.powerBurstTimer > 0 ? 1.24 : 1.0) + kiRatio * 0.42;
    const floatBob = Math.sin(t * 2.6) * 6;

    const singleSpriteMaxH = isCompactViewport
      ? Math.min(height * 0.43, width * 0.64, 198)
      : Math.min(height * 0.60, 355);

    // Draw Zanzoken afterimage at previous position if teleporting!
    drawZanzokenGhost(width, height, state, singleSpriteMaxH);

    const fp = state.fighterPos3D || { x: 0, y: 0, z: 0, arrivalTimer: 0 };
    const baseY = (isCompactViewport ? 8 : -16) + fp.y;
    const center = project3D(fp.x, baseY, fp.z, width, height, cam);

    // Ground shadow directly below character's current 3D X/Z spot
    drawGroundShadow(fp.x, fp.z, 72 - floatBob * 0.8, width, height, cam);

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

    // Rising 3D Aura Particles centered around fighter's 3D spot
    auraParticles.forEach((pt) => {
      pt.y -= pt.speed * (burstActive ? 2.2 + kiRatio * 1.8 : 1.0);
      if (pt.y < -195) pt.y = 165;
      const px = fp.x + Math.cos(pt.angle + t * 1.35) * pt.radius * (1 + kiRatio * 0.35);
      const pz = fp.z + Math.sin(pt.angle + t * 1.35) * pt.radius * (1 + kiRatio * 0.35);
      const proj = project3D(px, pt.y + fp.y * 0.5, pz, width, height, cam);
      ctx.fillStyle = auraHex;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, pt.size * proj.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Authentic Character Render
    drawCharacterSprite(
      spriteUrl,
      center,
      singleSpriteMaxH,
      auraHex,
      floatBob,
      burstActive,
      cam
    );

    // Instant Transmission Arrival Rings!
    if (fp.arrivalTimer && fp.arrivalTimer > 0) {
      const aRatio = fp.arrivalTimer / 22;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 208, 0, ' + aRatio.toFixed(2) + ')';
      ctx.lineWidth = 3;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.ellipse(
          center.x,
          center.y + k * 48 * center.scale,
          (95 + (1 - aRatio) * 55) * center.scale,
          18 * center.scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // Bio-Electric Lightning Bolts (SSJ2 / SSJ3 / Rosé / Ultra Ego / High Ki / Burst)
    if (burstActive || showSparks || kiRatio > 0.55) {
      const boltCount = state.powerBurstTimer > 0 || kiRatio > 0.65 ? 5 : 2;
      for (let b = 0; b < boltCount; b++) {
        const startX = fp.x + (Math.random() - 0.5) * 145;
        const startY = baseY + (Math.random() - 0.5) * 210;
        const pStart = project3D(startX, startY, fp.z + 22, width, height, cam);
        ctx.strokeStyle = state.powerBurstTimer > 0 || kiRatio > 0.75 ? '#ffffff' : '#38bdf8';
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

    // Signature Ultimate Beam Attack Overlay!
    drawSignatureAttackEffect(t, width, height, state, center, auraHex);
  }

  function drawFusionStage(t, width, height, state) {
    const recipe = state.selectedFusionRecipe;
    const cam = state.camera;
    const timer = state.fusionAnimTimer || 0;
    const maxSpread = Math.min(185, Math.max(105, width * 0.32));
    const duoSpriteH = width < 520 ? 175 : 230;

    if (timer > 14) {
      const progress = 1 - (timer - 14) / 66;
      const dist = (1 - progress) * maxSpread;
      const spinAngle = progress * Math.PI * 3.0;

      const xA = -Math.cos(spinAngle) * dist;
      const zA = Math.sin(spinAngle) * dist;
      const xB = Math.cos(spinAngle) * dist;
      const zB = -Math.sin(spinAngle) * dist;

      const posA = project3D(xA, -12, zA, width, height, cam);
      const posB = project3D(xB, -12, zB, width, height, cam);

      drawCharacterSprite(state.fusionSpriteA, posA, duoSpriteH, '#f97316', 0, true, cam);
      drawCharacterSprite(state.fusionSpriteB, posB, duoSpriteH, '#38bdf8', 0, true, cam);

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

    const spreadX = Math.min(175, Math.max(98, width * 0.30));
    const clashSpan = spreadX * 0.77;
    const clashSpriteH = width < 520 ? 168 : 220;

    const leftPos = project3D(-spreadX, -8, 0, width, height, cam);
    const rightPos = project3D(spreadX, -8, 0, width, height, cam);

    const beamRatio = Math.max(0.05, Math.min(0.95, state.beamGame.position));
    const clashX3D = -clashSpan + beamRatio * (clashSpan * 2);
    const clashCenter = project3D(clashX3D, -8, 0, width, height, cam);

    drawGroundShadow(-spreadX, 0, 52, width, height, cam);
    drawGroundShadow(spreadX, 0, 52, width, height, cam);

    [
      { spriteUrl: formA.spriteUrl, aura: auraA, pos: leftPos, dir: 1 },
      { spriteUrl: formB.spriteUrl, aura: auraB, pos: rightPos, dir: -1 }
    ].forEach((side) => {
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

      ctx.strokeStyle = side.aura;
      ctx.lineCap = 'round';
      ctx.lineWidth = (20 + Math.sin(t * 22) * 5) * side.pos.scale;
      ctx.beginPath();
      ctx.moveTo(side.pos.x + side.dir * 26 * side.pos.scale, side.pos.y);
      ctx.lineTo(clashCenter.x, clashCenter.y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = (8 + Math.sin(t * 26) * 2) * side.pos.scale;
      ctx.beginPath();
      ctx.moveTo(side.pos.x + side.dir * 26 * side.pos.scale, side.pos.y);
      ctx.lineTo(clashCenter.x, clashCenter.y);
      ctx.stroke();

      drawCharacterSprite(
        side.spriteUrl,
        side.pos,
        clashSpriteH,
        side.aura,
        Math.sin(t * 3.2 + side.dir) * 4,
        state.beamGame.active,
        cam
      );
    });

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

  function updateInteractivePhysics(state) {
    // Smooth camera radar auto-focus if active
    if (typeof state.camera.targetRotY === 'number') {
      const diff = state.camera.targetRotY - state.camera.rotY;
      if (Math.abs(diff) < 0.015) {
        state.camera.rotY = state.camera.targetRotY;
        state.camera.targetRotY = null;
      } else {
        state.camera.rotY += diff * 0.14;
      }
    } else if (!state.camera.isDragging && state.activeMode !== 'battle') {
      state.camera.rotY += 0.0028;
    }

    if (state.powerBurstTimer > 0) state.powerBurstTimer -= 1;
    if (state.fusionAnimTimer > 0) state.fusionAnimTimer -= 1;

    // Update Hidden Dragon Ball cooldown
    if (state.hiddenBall && state.hiddenBall.cooldown > 0) {
      state.hiddenBall.cooldown -= 1;
    }

    // Update Zanzoken Ghost & Fighter 3D Teleport Return
    if (state.teleportGhost && state.teleportGhost.timer > 0) {
      state.teleportGhost.timer -= 1;
    }
    if (state.fighterPos3D) {
      const fp = state.fighterPos3D;
      if (fp.arrivalTimer > 0) fp.arrivalTimer -= 1;
      if (fp.returnTimer > 0) {
        fp.returnTimer -= 1;
      } else {
        fp.x += (0 - fp.x) * 0.08;
        fp.y += (0 - fp.y) * 0.08;
        fp.z += (0 - fp.z) * 0.08;
      }
    }

    // Update Signature Ultimate Attack & Spawn Impact Crater at Frame 42
    if (state.signatureAttack && state.signatureAttack.timer > 0) {
      state.signatureAttack.timer -= 1;
      if (state.signatureAttack.timer === 50 && typeof callbacks.onBeamFireSound === 'function') {
        callbacks.onBeamFireSound();
      }
      if (state.signatureAttack.timer === 42) {
        state.arenaCrater = {
          x: 158,
          z: -32,
          timer: 185,
          color: state.signatureAttack.color || '#ff6b00'
        };
      }
    }
    if (state.arenaCrater && state.arenaCrater.timer > 0) {
      state.arenaCrater.timer -= 1;
    }

    // Update Hold-to-Charge Ki Meter!
    if (state.kiChargingHold) {
      state.kiCharge = Math.min(100, (state.kiCharge || 0) + 1.45);
      if (typeof callbacks.onKiFrameUpdate === 'function') {
        callbacks.onKiFrameUpdate(state.kiCharge);
      }
    } else if (state.kiCharge > 0) {
      state.kiCharge = Math.max(0, state.kiCharge - 0.35);
      if (typeof callbacks.onKiFrameUpdate === 'function') {
        callbacks.onKiFrameUpdate(state.kiCharge);
      }
    }
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

    updateInteractivePhysics(state);

    // Determine active character visual & aura color
    let activeSpriteUrl = '';
    let auraHex = '#ffd000';
    let showSparks = false;

    if (state.activeMode === 'fighters' || state.activeMode === 'quiz') {
      const fForm = state.activeFighterForm;
      activeSpriteUrl = fForm.spriteUrl;
      auraHex = fForm.auraHex || state.selectedFighter.auraColor;
      showSparks =
        fForm.label.indexOf('2') !== -1 ||
        fForm.label.indexOf('3') !== -1 ||
        fForm.label.indexOf('Ego') !== -1 ||
        fForm.label.indexOf('Rosé') !== -1;
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
    } else if (state.activeMode === 'battle') {
      auraHex = state.battleFormA.auraHex || '#ffd000';
    }
    state.hasLightningActive = showSparks;
    state.currentStageSpriteUrl = activeSpriteUrl || (state.selectedFusionRecipe && state.selectedFusionRecipe.resultSprite);
    state.currentStageAuraHex = auraHex;

    ctx.save();
    // Dynamic Camera Shake during power-up, high Ki charge, beam cannon fire, or 1v1 beam struggle!
    const atkShake =
      state.signatureAttack && state.signatureAttack.timer > 0 && state.signatureAttack.timer <= 50
        ? 3.2
        : 0;
    const kiShake = state.kiCharge > 55 ? ((state.kiCharge - 55) / 45) * 2.2 : 0;
    const burstShake = state.powerBurstTimer > 45 ? (state.powerBurstTimer - 45) * 0.14 : 0;
    const shakeIntensity = Math.max(
      atkShake,
      kiShake,
      burstShake,
      state.beamGame.active ? 1.8 : 0
    );

    if (shakeIntensity > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shakeIntensity * 2,
        (Math.random() - 0.5) * shakeIntensity * 2
      );
    }

    drawArenaBackgroundAndFloor(t, width, height, state, auraHex);

    if (state.activeMode === 'battle') {
      drawBeamClashStage(t, width, height, state);
    } else if (state.activeMode === 'fusion-lab') {
      drawFusionStage(t, width, height, state);
    } else {
      drawSingleCharacterStage(t, width, height, state, activeSpriteUrl, auraHex, showSparks);
    }

    ctx.restore();
    requestAnimationFrame(renderLoop);
  }

  function init(canvasEl, getStateFn, cbMap) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    getState = getStateFn;
    callbacks = cbMap || {};

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let downX = 0;
    let downY = 0;
    let pointerMovedDist = 0;

    canvas.addEventListener('pointerdown', (e) => {
      const st = getState();
      st.camera.isDragging = true;
      st.camera.targetRotY = null;
      st.camera.lastX = e.clientX;
      st.camera.lastY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
      pointerMovedDist = 0;
    });

    window.addEventListener('pointermove', (e) => {
      const st = getState();
      if (!st || !st.camera.isDragging) return;
      const dx = e.clientX - st.camera.lastX;
      const dy = e.clientY - st.camera.lastY;
      pointerMovedDist += Math.hypot(dx, dy);
      st.camera.lastX = e.clientX;
      st.camera.lastY = e.clientY;
      st.camera.rotY += dx * 0.008;
      st.camera.rotX = Math.max(-0.45, Math.min(0.45, st.camera.rotX + dy * 0.006));
    });

    canvas.addEventListener('pointerup', (e) => {
      const st = getState();
      if (!st) return;
      st.camera.isDragging = false;

      // Quick tap on canvas (not a drag-to-orbit gesture!)
      if (pointerMovedDist < 9) {
        const rect = canvas.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;

        // 1. Check if kid tapped the Hidden 3D Dragon Ball!
        if (
          st.hiddenBall &&
          st.hiddenBall.lastScreenPos &&
          Math.hypot(lx - st.hiddenBall.lastScreenPos.x, ly - st.hiddenBall.lastScreenPos.y) <=
            st.hiddenBall.lastScreenPos.r
        ) {
          if (typeof callbacks.onCollectHiddenBall === 'function') {
            callbacks.onCollectHiddenBall();
          }
          return;
        }

        // 2. In 1v1 Beam Struggle, tapping stage pushes player's beam!
        if (st.activeMode === 'battle' && st.beamGame && st.beamGame.active) {
          if (typeof callbacks.onStageBeamTap === 'function') {
            callbacks.onStageBeamTap();
          }
          return;
        }

        // 3. Otherwise, Instant-Transmission Teleport fighter toward tapped spot!
        if (st.activeMode !== 'battle' && typeof callbacks.onCanvasTeleportTap === 'function') {
          const normX = (lx / Math.max(1, rect.width) - 0.5) * 2; // -1..1
          const normY = (ly / Math.max(1, rect.height) - 0.45) * 2;
          callbacks.onCanvasTeleportTap(normX, normY);
        }
      }
    });

    function endDrag() {
      const st = getState();
      if (st) st.camera.isDragging = false;
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

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
