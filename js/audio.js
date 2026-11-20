/* ==========================================================================
   太鼓 — SnackerTracker geluidsmotor
   Alles wordt live gesynthetiseerd met de Web Audio API: gong, taiko,
   katana, munten en een generatieve koto/taiko-soundtrack.
   ========================================================================== */
(function () {
  'use strict';

  const A = {
    ctx: null, master: null, sfxBus: null, musicBus: null, reverb: null,
    sfxOn: true, musicOn: false, _noise: null, _plucks: new Map(), _music: null
  };

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = A.ctx = new AC();
    A.master = ctx.createGain(); A.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    A.master.connect(comp).connect(ctx.destination);

    A.reverb = ctx.createConvolver();
    A.reverb.buffer = makeImpulse(ctx, 3.2, 2.6);
    const revGain = ctx.createGain(); revGain.gain.value = 0.32;
    A.reverb.connect(revGain).connect(A.master);

    A.sfxBus = ctx.createGain(); A.sfxBus.gain.value = 1;
    A.sfxBus.connect(A.master); A.sfxBus.connect(A.reverb);
    A.musicBus = ctx.createGain(); A.musicBus.gain.value = 0.42;
    A.musicBus.connect(A.master); A.musicBus.connect(A.reverb);
    return ctx;
  };

  function makeImpulse(ctx, seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function noiseBuffer() {
    if (A._noise) return A._noise;
    const ctx = A.ctx, len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (A._noise = buf);
  }

  function ready(isMusic) {
    if (!A.ctx) return false;
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return isMusic ? true : A.sfxOn;
  }

  function env(g, t, a, peak, d, end) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end || 0.0001, t + a + d);
  }

  /* ---------------- GONG ---------------- */
  A.gong = function (vol = 1, when = 0, bus) {
    if (!ready(!!bus)) return;
    const ctx = A.ctx, t = ctx.currentTime + when, out = bus || A.sfxBus;
    const base = 82 + Math.random() * 6;
    const partials = [1, 1.47, 2.09, 2.56, 2.98, 3.62, 4.17, 5.43, 6.8];
    const g = ctx.createGain(); g.connect(out);
    env(g, t, 0.02, 0.55 * vol, 6.5);
    partials.forEach((p, i) => {
      const o = ctx.createOscillator();
      o.type = i % 3 === 0 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(base * p * 1.012, t);
      o.frequency.exponentialRampToValueAtTime(base * p, t + 1.5);
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(0.0001, t);
      pg.gain.exponentialRampToValueAtTime((1 / (i + 1.2)) * 0.9, t + 0.03 + i * 0.04);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 6.5 - i * 0.45);
      // langzame zwelling, typisch voor een gong
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.6 + i * 0.37;
      const lg = ctx.createGain(); lg.gain.value = 0.25 / (i + 1);
      lfo.connect(lg).connect(pg.gain);
      o.connect(pg).connect(g);
      o.start(t); o.stop(t + 7); lfo.start(t); lfo.stop(t + 7);
    });
    // klap van de hamer
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
    const ng = ctx.createGain(); env(ng, t, 0.005, 0.5 * vol, 0.25);
    n.connect(f).connect(ng).connect(out); n.start(t); n.stop(t + 0.4);
  };

  /* ---------------- TAIKO ---------------- */
  A.taiko = function (vol = 1, when = 0, bus, pitch = 1) {
    if (!ready(!!bus)) return;
    const ctx = A.ctx, t = ctx.currentTime + when, out = bus || A.sfxBus;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(48 * pitch, t + 0.35);
    const g = ctx.createGain(); env(g, t, 0.004, 1.1 * vol, 0.7);
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.9);
    const o2 = ctx.createOscillator(); o2.type = 'triangle';
    o2.frequency.setValueAtTime(260 * pitch, t);
    o2.frequency.exponentialRampToValueAtTime(90 * pitch, t + 0.12);
    const g2 = ctx.createGain(); env(g2, t, 0.002, 0.35 * vol, 0.18);
    o2.connect(g2).connect(out); o2.start(t); o2.stop(t + 0.3);
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8;
    const ng = ctx.createGain(); env(ng, t, 0.001, 0.4 * vol, 0.06);
    n.connect(f).connect(ng).connect(out); n.start(t, Math.random()); n.stop(t + 0.1);
  };

  /* klein randje/stokje (kachi) */
  A.tick = function (vol = 0.4, when = 0, bus) {
    if (!ready(!!bus)) return;
    const ctx = A.ctx, t = ctx.currentTime + when, out = bus || A.sfxBus;
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 1800 + Math.random() * 200;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2500; f.Q.value = 3;
    const g = ctx.createGain(); env(g, t, 0.001, vol * 0.5, 0.04);
    o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + 0.06);
  };

  /* houten blok, voor UI-klikjes */
  A.wood = function (vol = 0.5) {
    if (!ready()) return;
    const ctx = A.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(720, t); o.frequency.exponentialRampToValueAtTime(540, t + 0.08);
    const g = ctx.createGain(); env(g, t, 0.002, vol * 0.6, 0.11);
    o.connect(g).connect(A.sfxBus); o.start(t); o.stop(t + 0.15);
  };

  /* ---------------- KATANA ---------------- */
  A.slash = function (vol = 1) {
    if (!ready()) return;
    const ctx = A.ctx, t = ctx.currentTime;
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.2;
    f.frequency.setValueAtTime(7500, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.22);
    const g = ctx.createGain(); env(g, t, 0.01, 0.7 * vol, 0.24);
    n.connect(f).connect(g).connect(A.sfxBus); n.start(t, Math.random()); n.stop(t + 0.3);
    // metalen ring na de slag
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 3150 + Math.random() * 300;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 4720 + Math.random() * 300;
    const rg = ctx.createGain(); env(rg, t + 0.05, 0.005, 0.08 * vol, 0.9);
    o.connect(rg); o2.connect(rg); rg.connect(A.sfxBus);
    o.start(t + 0.05); o2.start(t + 0.05); o.stop(t + 1.1); o2.stop(t + 1.1);
  };

  A.whoosh = function (vol = 0.6, dur = 0.6) {
    if (!ready()) return;
    const ctx = A.ctx, t = ctx.currentTime;
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + dur * 0.6);
    f.frequency.exponentialRampToValueAtTime(500, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(A.sfxBus); n.start(t, Math.random()); n.stop(t + dur + 0.05);
  };

  /* ---------------- MUNTEN ---------------- */
  A.coin = function (vol = 0.5) {
    if (!ready()) return;
    const ctx = A.ctx, t = ctx.currentTime;
    [[1318.5, 0], [1975.5, 0.07]].forEach(([fq, dt]) => {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = fq;
      const g = ctx.createGain(); env(g, t + dt, 0.003, vol * 0.4, 0.35);
      o.connect(g).connect(A.sfxBus); o.start(t + dt); o.stop(t + dt + 0.4);
    });
  };

  /* rammelende bamboestokjes (orakel) */
  A.rattle = function (dur = 1.4) {
    if (!ready()) return;
    const ctx = A.ctx, t0 = ctx.currentTime;
    const hits = Math.floor(dur * 22);
    for (let i = 0; i < hits; i++) {
      const t = t0 + (i / hits) * dur + Math.random() * 0.02;
      const o = ctx.createOscillator(); o.type = 'square';
      o.frequency.value = 900 + Math.random() * 900;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600 + Math.random() * 1500; f.Q.value = 6;
      const g = ctx.createGain(); env(g, t, 0.001, 0.12 + Math.random() * 0.1, 0.03);
      o.connect(f).connect(g).connect(A.sfxBus); o.start(t); o.stop(t + 0.05);
    }
  };

  /* ---------------- KOTO (Karplus-Strong) ---------------- */
  function pluckBuffer(freq) {
    const key = Math.round(freq * 10);
    if (A._plucks.has(key)) return A._plucks.get(key);
    const ctx = A.ctx, sr = ctx.sampleRate, len = Math.floor(sr * 2.2);
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    const N = Math.max(2, Math.round(sr / freq));
    for (let i = 0; i < N; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / N * 0.4);
    const decay = 0.9965 - Math.max(0, (freq - 400)) * 0.000004;
    for (let i = N; i < len; i++) d[i] = decay * 0.5 * (d[i - N] + d[i - N - 1 < 0 ? 0 : i - N - 1]);
    // fade-out
    for (let i = len - 2000; i < len; i++) d[i] *= (len - i) / 2000;
    A._plucks.set(key, buf);
    return buf;
  }

  A.pluck = function (freq, vol = 0.5, when = 0, bus) {
    if (!ready(!!bus)) return;
    const ctx = A.ctx, t = ctx.currentTime + when;
    const s = ctx.createBufferSource(); s.buffer = pluckBuffer(freq);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = Math.min(9000, freq * 7);
    const g = ctx.createGain(); g.gain.value = vol;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = (Math.random() - 0.5) * 0.6; s.connect(f).connect(g).connect(pan).connect(bus || A.sfxBus); }
    else s.connect(f).connect(g).connect(bus || A.sfxBus);
    s.start(t);
  };

  // D hirajoshi: D E F A Bb
  const SCALE = [0, 2, 3, 7, 8];
  function scaleFreq(step, root = 146.83) {
    const oct = Math.floor(step / SCALE.length), idx = ((step % SCALE.length) + SCALE.length) % SCALE.length;
    return root * Math.pow(2, oct + SCALE[idx] / 12);
  }
  A.scaleFreq = scaleFreq;

  let addStep = 4;
  /** Oplopende koto-noot bij elk toegevoegd item */
  A.addNote = function () {
    addStep = addStep >= 13 ? 4 : addStep + 1;
    A.pluck(scaleFreq(addStep), 0.55);
    A.pluck(scaleFreq(addStep + 5), 0.18, 0.06);
  };

  /** Fanfare: snelle koto-run + gong */
  A.fanfare = function () {
    if (!ready()) return;
    for (let i = 0; i < 8; i++) A.pluck(scaleFreq(5 + i), 0.4, i * 0.055);
    A.taiko(1, 0); A.taiko(0.8, 0.18); A.gong(0.8, 0.42);
  };

  /** Intro: DON — DON — DOKODON — GONG */
  A.intro = function () {
    if (!ready()) return;
    A.taiko(1.2, 0); A.taiko(1.2, 0.42); A.taiko(0.8, 0.84); A.taiko(0.8, 0.98); A.taiko(1.3, 1.12);
    A.gong(1.1, 1.3);
    for (let i = 0; i < 6; i++) A.pluck(scaleFreq(10 - i), 0.32, 1.45 + i * 0.09);
  };

  /* ---------------- GENERATIEVE SOUNDTRACK ---------------- */
  A.startMusic = function () {
    if (!A.init() || A._music) return;
    A.musicOn = true;
    const ctx = A.ctx, bus = A.musicBus;
    const bpm = 86, step = 60 / bpm / 4; // zestienden
    let next = ctx.currentTime + 0.15, s = 0, bar = 0, mel = 7;

    // drone: grondtoon + kwint, ademend
    const drone = ctx.createGain(); drone.gain.value = 0.0001;
    drone.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 4);
    const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 520;
    drone.connect(dl).connect(bus);
    const oscs = [73.42, 110, 146.83].map((fq, i) => {
      const o = ctx.createOscillator(); o.type = i === 1 ? 'sawtooth' : 'triangle';
      o.frequency.value = fq; o.detune.value = (i - 1) * 6;
      const g = ctx.createGain(); g.gain.value = i === 1 ? 0.12 : 0.5;
      o.connect(g).connect(drone); o.start(); return o;
    });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg).connect(dl.frequency); lfo.start();

    const rhythms = [
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
    ];
    let rhythm = rhythms[0];

    function schedule() {
      while (next < ctx.currentTime + 0.25) {
        const i = s % 16, dt = next - ctx.currentTime;
        if (i === 0) {
          rhythm = rhythms[(Math.random() * rhythms.length) | 0];
          if (bar % 8 === 0) A.gong(0.45, dt, bus);
        }
        // taiko-patroon
        const intense = bar % 8 >= 4;
        if (i === 0 || i === 8) A.taiko(0.9, dt, bus);
        if (i === 6 || (intense && i === 14)) A.taiko(0.55, dt, bus, 1.2);
        if (intense && (i === 11 || i === 12)) A.taiko(0.4, dt, bus, 1.5);
        if (i % 4 === 2) A.tick(0.35, dt, bus);
        if (bar % 4 === 3 && i >= 12) A.taiko(0.35 + (i - 12) * 0.12, dt, bus, 1.3);
        // koto-melodie
        if (rhythm[i] && bar % 16 !== 15) {
          const move = [-2, -1, -1, 1, 1, 2, 0][(Math.random() * 7) | 0];
          mel = Math.max(3, Math.min(14, mel + move));
          A.pluck(scaleFreq(mel), 0.42, dt, bus);
          if (Math.random() < 0.2) A.pluck(scaleFreq(mel + 5), 0.15, dt + step * 0.5, bus);
          if (Math.random() < 0.08) for (let k = 1; k < 4; k++) A.pluck(scaleFreq(mel + k), 0.18, dt + step * k * 0.33, bus);
        }
        next += step; s++;
        if (s % 16 === 0) bar++;
      }
    }
    const timer = setInterval(schedule, 60);
    schedule();
    A._music = { timer, oscs, lfo, drone };
  };

  A.stopMusic = function () {
    A.musicOn = false;
    const m = A._music; if (!m) return;
    clearInterval(m.timer);
    const t = A.ctx.currentTime;
    m.drone.gain.cancelScheduledValues(t);
    m.drone.gain.setValueAtTime(m.drone.gain.value || 0.0001, t);
    m.drone.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    setTimeout(() => { m.oscs.forEach(o => o.stop()); m.lfo.stop(); }, 1400);
    A._music = null;
  };

  // muziek pauzeren als het tabblad verborgen is
  document.addEventListener('visibilitychange', () => {
    if (!A.ctx) return;
    if (document.hidden) A.ctx.suspend(); else A.ctx.resume();
  });

  window.SFX = A;
})();
