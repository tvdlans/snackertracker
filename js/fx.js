/* ==========================================================================
   龍 — SnackerTracker effecten
   Canvas-laag met kersenbloesem, sintels en vonken, plus een
   procedureel getekende Chinese draak die een vlammende parel achtervolgt.
   ========================================================================== */
(function () {
  'use strict';

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FX = { reduced, petals: [], fpetals: [], embers: [], sparks: [], flames: [], dragon: null };

  let cv, cvTop, ctxBg, ctxTop, cx, W = 0, H = 0, DPR = 1, raf = 0, last = 0;

  FX.init = function () {
    cv = document.getElementById('fx');
    cvTop = document.getElementById('fxTop');
    if (!cv || !cvTop) return;
    cx = ctxBg = cv.getContext('2d');
    ctxTop = cvTop.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (reduced) return;
    {
      const n = Math.round(Math.min(38, Math.max(14, W / 38)));
      for (let i = 0; i < n; i++) FX.petals.push(newPetal(true));
      for (let i = 0; i < 26; i++) FX.embers.push(newEmber(true));
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); loop(last); } });
    last = performance.now();
    loop(last);
  };

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    [[cv, ctxBg], [cvTop, ctxTop]].forEach(([c, x]) => {
      c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
      c.style.width = W + 'px'; c.style.height = H + 'px';
      x.setTransform(DPR, 0, 0, DPR, 0, 0);
    });
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  const clampIdx = (i, len) => Math.max(0, Math.min(len - 1, i));

  function newPetal(anywhere) {
    return {
      x: rnd(-40, W + 40), y: anywhere ? rnd(-H * 0.1, H) : rnd(-60, -10),
      s: rnd(5, 11), r: rnd(0, Math.PI * 2), vr: rnd(-1.6, 1.6),
      vy: rnd(18, 42), vx: rnd(-14, 22), sw: rnd(0.6, 1.6), ph: rnd(0, 6.28),
      hue: rnd(335, 355), l: rnd(78, 90), a: rnd(0.55, 0.9), flip: rnd(0, 6.28)
    };
  }
  function newEmber(anywhere) {
    return {
      x: rnd(0, W), y: anywhere ? rnd(H * 0.4, H + 20) : H + rnd(0, 40),
      vy: rnd(-26, -70), vx: rnd(-8, 8), s: rnd(0.8, 2.4), life: 0, max: rnd(4, 10), ph: rnd(0, 6.28)
    };
  }

  function drawPetal(p, t) {
    const sc = Math.cos(p.flip + t * p.sw * 1.7);
    cx.save();
    cx.translate(p.x, p.y);
    cx.rotate(p.r);
    cx.scale(1, 0.35 + Math.abs(sc) * 0.65);
    cx.globalAlpha = p.a;
    const s = p.s;
    cx.beginPath();
    cx.moveTo(0, -s);
    cx.bezierCurveTo(s * 0.9, -s * 0.9, s * 1.05, s * 0.35, 0, s);
    cx.bezierCurveTo(-s * 1.05, s * 0.35, -s * 0.9, -s * 0.9, 0, -s);
    cx.closePath();
    cx.fillStyle = `hsl(${p.hue} 85% ${p.l}%)`;
    cx.fill();
    // inkeping en nerf
    cx.globalAlpha = p.a * 0.5;
    cx.strokeStyle = `hsl(${p.hue} 70% 62%)`;
    cx.lineWidth = 0.7;
    cx.beginPath(); cx.moveTo(0, s * 0.85); cx.lineTo(0, -s * 0.2); cx.stroke();
    cx.restore();
  }

  /* ----------- vonken & bursts ----------- */
  FX.sparks = [];
  FX.burst = function (x, y, opts = {}) {
    if (reduced) return;
    const n = opts.n || 28, colors = opts.colors || ['#ffd36b', '#ff9a3c', '#fff1c2', '#ff5a2a'];
    for (let i = 0; i < n; i++) {
      const a = (opts.angle != null ? opts.angle + rnd(-0.6, 0.6) : rnd(0, Math.PI * 2));
      const sp = rnd(opts.min || 120, opts.max || 520);
      FX.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rnd(0.35, 0.9),
        c: colors[(Math.random() * colors.length) | 0], s: rnd(1.2, 3.2), g: opts.gravity == null ? 700 : opts.gravity });
    }
  };
  FX.petalBurst = function (x, y, n = 40) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const p = newPetal(false);
      p.x = x; p.y = y; p.vx = rnd(-260, 260); p.vy = rnd(-380, -60); p.burst = true; p.s = rnd(6, 12);
      FX.fpetals.push(p);
    }
  };
  FX.petalRain = function (n = 60) {
    if (reduced) return;
    for (let i = 0; i < n; i++) { const p = newPetal(false); p.y = rnd(-H * 0.6, -10); p.vy = rnd(60, 140); FX.fpetals.push(p); }
  };

  /* ----------- DRAAK ----------- */
  FX.dragon = null;
  FX.flyDragon = function (opts = {}) {
    if (reduced || FX.dragon) return false;
    const S = Math.max(0.5, Math.min(1.15, W / 1300));
    const segs = 64;
    FX.dragon = {
      t: 0, dur: opts.dur || (5.5 + W / 900), S, segs, trail: [],
      dir: opts.dir || (Math.random() < 0.5 ? 1 : -1),
      y0: opts.y != null ? opts.y : H * rnd(0.28, 0.45),
      amp: H * rnd(0.08, 0.14), freq: rnd(1.8, 2.6), fire: opts.fire !== false, onDone: opts.onDone
    };
    return true;
  };

  function dragonPos(d, t) {
    const span = W + 900 * d.S + 260;
    const p = t / d.dur;
    const x0 = -220 * d.S;
    let x = x0 + p * (span + 650 * d.S);
    if (d.dir < 0) x = W - x;
    const y = d.y0 + Math.sin(t * d.freq) * d.amp + Math.sin(t * 0.9 + 1) * d.amp * 0.5;
    return { x, y };
  }

  function updateDragon(dt) {
    const d = FX.dragon; if (!d) return;
    d.t += dt;
    const spacing = 11 * d.S;
    // fijnmazig spoor van de kop bijhouden
    const steps = 4;
    for (let k = 1; k <= steps; k++) {
      const tt = d.t - dt + (dt * k) / steps;
      const p = dragonPos(d, tt);
      const lastP = d.trail[d.trail.length - 1];
      if (!lastP || Math.hypot(p.x - lastP.x, p.y - lastP.y) >= spacing * 0.5) d.trail.push(p);
    }
    if (d.trail.length > d.segs * 2 + 10) d.trail.splice(0, d.trail.length - (d.segs * 2 + 10));
    // vuur spuwen
    if (d.fire && d.trail.length > 3 && Math.sin(d.t * 1.7) > 0.35) {
      const h = d.trail[d.trail.length - 1], h2 = d.trail[d.trail.length - 3];
      const a = Math.atan2(h.y - h2.y, h.x - h2.x);
      for (let i = 0; i < 3; i++) {
        const sp = rnd(320, 560) * d.S, aa = a + rnd(-0.22, 0.22);
        FX.flames.push({ x: h.x + Math.cos(a) * 62 * d.S, y: h.y + Math.sin(a) * 62 * d.S + 8 * d.S,
          vx: Math.cos(aa) * sp, vy: Math.sin(aa) * sp, life: 0, max: rnd(0.35, 0.7), s: rnd(8, 18) * d.S });
      }
    }
    if (d.t > d.dur + 1.2) { const cb = d.onDone; FX.dragon = null; if (cb) cb(); }
  }

  function drawDragon(time) {
    const d = FX.dragon; if (!d || d.trail.length < 3) return;
    const S = d.S, tr = d.trail, N = Math.min(d.segs, Math.floor((tr.length - 1) / 2));
    if (N < 4) return;
    const R = 30 * S;
    const seg = i => tr[clampIdx(tr.length - 1 - Math.max(0, i) * 2, tr.length)];

    // parel vóór de draak
    const head = seg(0), neck = seg(2);
    const ang = Math.atan2(head.y - neck.y, head.x - neck.x);
    const px = head.x + Math.cos(ang) * 150 * S + Math.sin(time * 3) * 10 * S;
    const py = head.y + Math.sin(ang) * 150 * S - 30 * S + Math.cos(time * 2.4) * 12 * S;
    const pg = cx.createRadialGradient(px, py, 2, px, py, 46 * S);
    pg.addColorStop(0, 'rgba(255,255,230,1)'); pg.addColorStop(0.25, 'rgba(255,210,90,0.95)');
    pg.addColorStop(0.6, 'rgba(255,110,30,0.35)'); pg.addColorStop(1, 'rgba(255,60,0,0)');
    cx.fillStyle = pg; cx.beginPath(); cx.arc(px, py, 46 * S, 0, 7); cx.fill();
    for (let k = 0; k < 5; k++) {
      const fa = time * 4 + k * 1.26;
      cx.fillStyle = 'rgba(255,150,40,0.5)';
      cx.beginPath();
      cx.ellipse(px + Math.cos(fa) * 18 * S, py + Math.sin(fa) * 18 * S, 7 * S, 14 * S, fa, 0, 7); cx.fill();
    }

    // lichaam, van staart naar kop
    for (let i = N - 1; i >= 1; i--) {
      const p = seg(i), q = seg(i - 1);
      const a = Math.atan2(q.y - p.y, q.x - p.x);
      const nx = -Math.sin(a), ny = Math.cos(a);
      const k = i / N;
      const r = R * (0.22 + 0.78 * Math.pow(1 - k, 0.55)) * (i < 4 ? 0.82 + i * 0.045 : 1);
      // dorsale vinnen
      if (i % 2 === 0) {
        const up = (Math.sin(time * 6 + i * 0.5) * 0.15 + 1) * r * 1.05;
        cx.fillStyle = i % 4 === 0 ? '#ffcc4d' : '#ff8a1f';
        cx.beginPath();
        cx.moveTo(p.x - nx * r * 0.75 - Math.cos(a) * r * 0.5, p.y - ny * r * 0.75 - Math.sin(a) * r * 0.5);
        cx.lineTo(p.x - nx * (r + up) - Math.cos(a) * r * 0.7, p.y - ny * (r + up) - Math.sin(a) * r * 0.7);
        cx.lineTo(p.x - nx * r * 0.75 + Math.cos(a) * r * 0.6, p.y - ny * r * 0.75 + Math.sin(a) * r * 0.6);
        cx.closePath(); cx.fill();
      }
      // poten
      if (i === 7 || i === 9 || i === 27 || i === 29) {
        const sw = Math.sin(time * 7 + i) * 0.5;
        const lx = p.x + nx * r * 0.6, ly = p.y + ny * r * 0.6;
        const ex = lx + (nx * 1.1 + Math.cos(a + sw) * 0.6) * r * 1.4, ey = ly + (ny * 1.1 + Math.sin(a + sw) * 0.6) * r * 1.4;
        cx.strokeStyle = '#a5110d'; cx.lineWidth = r * 0.42; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(lx, ly); cx.lineTo(ex, ey); cx.stroke();
        cx.strokeStyle = '#ffd36b'; cx.lineWidth = 2.2 * S;
        for (let c = -1; c <= 1; c++) {
          const ca = a + c * 0.5 + 0.4;
          cx.beginPath(); cx.moveTo(ex, ey); cx.lineTo(ex + Math.cos(ca) * r * 0.55, ey + Math.sin(ca) * r * 0.55); cx.stroke();
        }
      }
      // segment
      const g = cx.createRadialGradient(p.x - nx * r * 0.35, p.y - ny * r * 0.35, r * 0.1, p.x, p.y, r);
      g.addColorStop(0, '#ff4a2a'); g.addColorStop(0.65, '#c4140f'); g.addColorStop(1, '#5e0606');
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(p.x, p.y, r, 0, Math.PI * 2); cx.fill();
      // buik
      cx.fillStyle = '#f7c548';
      cx.beginPath(); cx.ellipse(p.x + nx * r * 0.58, p.y + ny * r * 0.58, r * 0.55, r * 0.3, a, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = 'rgba(140,70,0,0.55)'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(p.x + nx * r * 0.32 - Math.cos(a) * r * 0.4, p.y + ny * r * 0.32 - Math.sin(a) * r * 0.4);
      cx.lineTo(p.x + nx * r * 0.85, p.y + ny * r * 0.85); cx.stroke();
      // schub
      cx.strokeStyle = 'rgba(255,200,90,0.55)'; cx.lineWidth = 1.4 * S;
      cx.beginPath(); cx.arc(p.x, p.y, r * 0.62, a + Math.PI * 0.6, a + Math.PI * 1.4); cx.stroke();
    }
    // staartpluim
    const tl = seg(N - 1), tl2 = seg(N - 3);
    const ta = Math.atan2(tl.y - tl2.y, tl.x - tl2.x);
    for (let k = -2; k <= 2; k++) {
      const aa = ta + k * 0.32 + Math.sin(time * 5 + k) * 0.15;
      cx.fillStyle = k % 2 ? '#ff8a1f' : '#ffcc4d';
      cx.beginPath(); cx.moveTo(tl.x, tl.y);
      cx.quadraticCurveTo(tl.x + Math.cos(aa + 0.3) * 30 * S, tl.y + Math.sin(aa + 0.3) * 30 * S, tl.x + Math.cos(aa) * 58 * S, tl.y + Math.sin(aa) * 58 * S);
      cx.quadraticCurveTo(tl.x + Math.cos(aa - 0.3) * 30 * S, tl.y + Math.sin(aa - 0.3) * 30 * S, tl.x, tl.y);
      cx.fill();
    }

    // KOP
    cx.save();
    cx.translate(head.x, head.y);
    cx.rotate(ang);
    const flipY = Math.cos(ang) < 0 ? -1 : 1;
    cx.scale(S, S * flipY);
    // manen
    for (let k = 0; k < 7; k++) {
      const wa = Math.sin(time * 6 + k) * 6;
      cx.fillStyle = k % 2 ? '#ff9b2a' : '#ffd25a';
      cx.beginPath(); cx.moveTo(-6, -18 + k * 6);
      cx.quadraticCurveTo(-40, -40 + k * 10 + wa, -78 - k * 3, -30 + k * 12 + wa);
      cx.quadraticCurveTo(-36, -14 + k * 7, -4, -10 + k * 5);
      cx.fill();
    }
    // hoorns
    cx.strokeStyle = '#ffd36b'; cx.lineWidth = 6; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(4, -22); cx.quadraticCurveTo(-24, -54, -62, -58); cx.stroke();
    cx.beginPath(); cx.moveTo(-28, -44); cx.lineTo(-30, -62); cx.stroke();
    cx.lineWidth = 4;
    cx.beginPath(); cx.moveTo(10, -20); cx.quadraticCurveTo(-8, -46, -36, -66); cx.stroke();
    // schedel
    const hg = cx.createLinearGradient(0, -30, 0, 30);
    hg.addColorStop(0, '#ff4a2a'); hg.addColorStop(1, '#8e0c0a');
    cx.fillStyle = hg;
    cx.beginPath(); cx.ellipse(6, -2, 36, 27, 0, 0, Math.PI * 2); cx.fill();
    // snuit
    cx.beginPath();
    cx.moveTo(18, -22); cx.quadraticCurveTo(64, -26, 76, -10); cx.quadraticCurveTo(82, 0, 70, 4);
    cx.lineTo(24, 6); cx.closePath(); cx.fill();
    // kaak (open/dicht)
    const jaw = (Math.sin(time * 3.4) * 0.5 + 0.5) * 0.45 + (FX.flames.length > 10 ? 0.25 : 0);
    cx.save(); cx.translate(22, 6); cx.rotate(jaw);
    cx.fillStyle = '#9c0f0c';
    cx.beginPath(); cx.moveTo(0, 0); cx.quadraticCurveTo(30, 4, 50, 0); cx.quadraticCurveTo(46, 12, 0, 14); cx.closePath(); cx.fill();
    cx.fillStyle = '#fff6e0';
    for (let k = 0; k < 5; k++) { cx.beginPath(); cx.moveTo(10 + k * 8, 1); cx.lineTo(14 + k * 8, -6); cx.lineTo(18 + k * 8, 1); cx.fill(); }
    cx.restore();
    // bovenste tanden
    cx.fillStyle = '#fff6e0';
    for (let k = 0; k < 5; k++) { cx.beginPath(); cx.moveTo(30 + k * 8, 5); cx.lineTo(34 + k * 8, 12); cx.lineTo(38 + k * 8, 5); cx.fill(); }
    // wenkbrauw
    cx.fillStyle = '#ffcc4d';
    cx.beginPath(); cx.moveTo(8, -26); cx.quadraticCurveTo(34, -36, 46, -20); cx.quadraticCurveTo(30, -26, 10, -18); cx.fill();
    // oog
    cx.fillStyle = '#fff3c4';
    cx.beginPath(); cx.ellipse(30, -14, 9, 6.5, -0.2, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = '#120202';
    cx.beginPath(); cx.ellipse(33, -14, 3.2, 5.5, 0, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = 'rgba(255,60,20,0.35)';
    cx.beginPath(); cx.arc(30, -14, 15, 0, 7); cx.fill();
    // neusgat
    cx.fillStyle = '#3a0303'; cx.beginPath(); cx.ellipse(70, -8, 4, 2.4, 0.3, 0, 7); cx.fill();
    // snorharen
    cx.strokeStyle = '#ffd36b'; cx.lineWidth = 2.6;
    for (let k = 0; k < 2; k++) {
      const w1 = Math.sin(time * 4 + k * 2) * 18, w2 = Math.cos(time * 3 + k) * 26;
      cx.beginPath(); cx.moveTo(66, -6 + k * 6);
      cx.bezierCurveTo(96, -30 + w1 + k * 40, 130, 10 + w2, 168, -16 + w1 + k * 30);
      cx.stroke();
    }
    cx.restore();
  }

  function stepPetals(arr, dt, t, ambient) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      if (p.burst) { p.vy += 380 * dt; p.vx *= 0.985; if (p.vy > 70) { p.burst = false; p.vy = rnd(40, 80); p.vx = rnd(-30, 30); } }
      p.x += (p.vx + Math.sin(t * p.sw + p.ph) * 22) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      if (p.y > H + 30 || p.x < -80 || p.x > W + 80) {
        if (ambient) arr[i] = newPetal(false); else arr.splice(i, 1);
        continue;
      }
      drawPetal(p, t);
    }
    cx.globalAlpha = 1;
  }

  /* ----------- hoofdlus ----------- */
  function loop(now) {
    cancelAnimationFrame(raf);
    if (document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const t = now / 1000;
    ctxBg.clearRect(0, 0, W, H);
    ctxTop.clearRect(0, 0, W, H);

    // achterlaag: sintels + bloesem
    cx = ctxBg;
    cx.globalCompositeOperation = 'lighter';
    for (let i = FX.embers.length - 1; i >= 0; i--) {
      const e = FX.embers[i];
      e.life += dt; e.x += (e.vx + Math.sin(t * 2 + e.ph) * 12) * dt; e.y += e.vy * dt;
      const k = e.life / e.max;
      if (k >= 1 || e.y < -10) { FX.embers[i] = newEmber(false); continue; }
      const a = Math.sin(Math.PI * k) * 0.8;
      cx.fillStyle = `rgba(255,${140 + (1 - k) * 80 | 0},40,${a})`;
      cx.beginPath(); cx.arc(e.x, e.y, e.s * (1.4 - k * 0.6), 0, 7); cx.fill();
      cx.fillStyle = `rgba(255,90,20,${a * 0.18})`;
      cx.beginPath(); cx.arc(e.x, e.y, e.s * 4, 0, 7); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
    stepPetals(FX.petals, dt, t, true);

    // voorlaag: vuur, draak, feestbloesem, vonken
    cx = ctxTop;
    updateDragon(dt);
    cx.globalCompositeOperation = 'lighter';
    for (let i = FX.flames.length - 1; i >= 0; i--) {
      const f = FX.flames[i];
      f.life += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy -= 120 * dt; f.vx *= 0.985;
      const k = f.life / f.max;
      if (k >= 1) { FX.flames.splice(i, 1); continue; }
      const r = f.s * (0.6 + k * 1.8);
      const g = cx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, `rgba(255,250,210,${0.9 * (1 - k)})`);
      g.addColorStop(0.4, `rgba(255,170,40,${0.7 * (1 - k)})`);
      g.addColorStop(1, 'rgba(255,40,0,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(f.x, f.y, r, 0, 7); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
    drawDragon(t);
    stepPetals(FX.fpetals, dt, t, false);

    cx.globalCompositeOperation = 'lighter';
    for (let i = FX.sparks.length - 1; i >= 0; i--) {
      const s = FX.sparks[i];
      s.life += dt;
      if (s.life > s.max) { FX.sparks.splice(i, 1); continue; }
      const px = s.x, py = s.y;
      s.vy += s.g * dt; s.vx *= 0.97; s.vy *= 0.97;
      s.x += s.vx * dt; s.y += s.vy * dt;
      cx.strokeStyle = s.c; cx.globalAlpha = 1 - s.life / s.max; cx.lineWidth = s.s;
      cx.beginPath(); cx.moveTo(px, py); cx.lineTo(s.x, s.y); cx.stroke();
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'source-over';

    raf = requestAnimationFrame(loop);
  }

  window.FX = FX;
})();
