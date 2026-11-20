/* ==========================================================================
   侍 SNACKERTRACKER — het brein
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- hulpjes ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EUR = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
  const eur = n => EUR.format(n).replace(/ /g, ' ');
  const rand = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vibrate = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* stil */ } };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('st:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('st:' + k, JSON.stringify(v)); } catch (e) { /* privémodus */ } },
    del(k) { try { localStorage.removeItem('st:' + k); } catch (e) { /* stil */ } }
  };
  const reduced = window.FX && FX.reduced;
  const D = window.DOJO;

  /* ---------------- menu-index ---------------- */
  const ITEMS = {};
  MENU.forEach(c => c.items.forEach(it => { it.cat = c.id; ITEMS[it.id] = it; }));

  function parseKey(k) {
    const [id, v] = String(k).split('~');
    return { it: ITEMS[id], v: v == null ? null : parseInt(v, 10) };
  }
  function validKey(k) {
    const { it, v } = parseKey(k);
    if (!it) return false;
    if (it.variants) return Number.isInteger(v) && v >= 0 && v < it.variants.length;
    return v === null;
  }
  function priceOf(k) { const { it, v } = parseKey(k); return it.variants ? it.variants[v].p : it.price; }
  function labelOf(k) { const { it, v } = parseKey(k); return it.name + (it.variants ? ` (${it.variants[v].n})` : ''); }
  function keyFor(it, v) { return it.variants ? `${it.id}~${v == null ? 0 : v}` : it.id; }

  /* ---------------- toestand ---------------- */
  const S = {
    cart: (store.get('cart', []) || []).filter(e => e && validKey(e.k) && e.q > 0).map(e => ({ k: e.k, q: clamp(e.q | 0, 1, 99) })),
    sel: {},
    profile: Object.assign({ honor: 0, orders: 0, frik: 0, name: '', mode: 'bezorgen', addr: '', egg: false }, store.get('profile', {})),
    settings: Object.assign({ sfx: true, music: true }, store.get('settings', {})),
    tracker: store.get('tracker', null),
    clan: null,
    cartFromClan: false,
    fired: new Set(),
    streak: 0, lastAdd: 0,
    pending: null, fate: null,
    entered: false, pendingClan: false
  };

  /* ==========================================================================
     MENU RENDEREN
     ========================================================================== */
  const STAT_K = [['力', 'Kracht'], ['炎', 'Vuur'], ['油', 'Vet']];
  const pips = n => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');

  function cardHTML(it) {
    const v = S.sel[it.id] || 0;
    const price = it.variants ? it.variants[v].p : it.price;
    return `<article class="card${it.boss ? ' is-boss' : ''}" data-id="${it.id}">
      <span class="card__wm brush" aria-hidden="true">${it.kanji}</span>
      <span class="incart" hidden></span>
      <div class="card__top">
        <div class="medal" aria-hidden="true">${it.emoji}</div>
        <div class="card__titles">
          <h3 class="card__epic">${esc(it.epic)}</h3>
          <p class="card__name">${esc(it.name)}${it.veg ? '<span class="tag tag--veg">vega</span>' : ''}${it.stats[1] >= 4 ? '<span class="tag tag--hot">heet</span>' : ''}</p>
        </div>
      </div>
      <p class="card__desc">${esc(it.desc)}</p>
      <div class="stats" role="img" aria-label="Kracht ${it.stats[0]}, vuur ${it.stats[1]}, vet ${it.stats[2]} van de 5">${STAT_K.map((s, i) =>
        `<span class="stat" title="${s[1]}"><span class="brush">${s[0]}</span><span class="pips">${pips(it.stats[i])}</span></span>`).join('')}</div>
      ${it.variants ? `<div class="variants" role="group" aria-label="Kies formaat">${it.variants.map((vv, i) =>
        `<button type="button" data-action="variant" data-id="${it.id}" data-v="${i}" aria-pressed="${i === v}">${esc(vv.n)}</button>`).join('')}</div>` : ''}
      <div class="card__foot">
        <span class="price">${it.est ? '<span class="est" title="Geschatte prijs">≈</span>' : ''}<span class="price__v">${eur(price)}</span></span>
        <button type="button" class="add" data-action="add" data-id="${it.id}" aria-label="${esc(it.name)} toevoegen aan je bento"><span class="brush" aria-hidden="true">斬</span> Hak toe</button>
      </div>
    </article>`;
  }

  function renderMenu() {
    $('#catnav').innerHTML = MENU.map(c =>
      `<a href="#cat-${c.id}" data-cat="${c.id}"><span class="brush" aria-hidden="true">${c.kanji}</span>${esc(c.sub)}</a>`).join('');
    $('#menu').innerHTML = MENU.map(c => `
      <section class="cat" id="cat-${c.id}" aria-labelledby="h-${c.id}">
        <header class="section-head">
          <span class="section-head__kanji brush" aria-hidden="true">${c.kanji}</span>
          <div><p class="section-head__sub">${esc(c.sub)}</p><h2 class="section-head__title" id="h-${c.id}">${esc(c.title)}</h2></div>
        </header>
        <p class="cat__intro">${esc(c.intro)}</p>
        <div class="grid">${c.items.map(cardHTML).join('')}</div>
      </section>`).join('');
  }

  /* ==========================================================================
     BENTO (winkelmand)
     ========================================================================== */
  const cartCount = () => S.cart.reduce((s, e) => s + e.q, 0);
  const cartTotal = () => S.cart.reduce((s, e) => s + priceOf(e.k) * e.q, 0);
  function saveCart() { store.set('cart', S.cart); }
  function cartAdd(k, n = 1) {
    const e = S.cart.find(x => x.k === k);
    if (e) e.q = clamp(e.q + n, 1, 99); else S.cart.push({ k, q: clamp(n, 1, 99) });
    saveCart(); renderCart();
  }
  function cartSet(k, q) {
    const i = S.cart.findIndex(x => x.k === k);
    if (i < 0) return;
    if (q <= 0) S.cart.splice(i, 1); else S.cart[i].q = clamp(q, 1, 99);
    if (!S.cart.length) { S.fired.clear(); S.cartFromClan = false; }
    saveCart(); renderCart();
  }

  function renderCart() {
    const count = cartCount(), total = cartTotal();
    $('#cartList').innerHTML = S.cart.map(e => {
      const { it } = parseKey(e.k);
      return `<li class="cart-item">
        <span class="cart-item__emoji" aria-hidden="true">${it.emoji}</span>
        <div>
          <div class="cart-item__name">${esc(labelOf(e.k))}<span class="cart-item__epic">${esc(it.epic)}</span></div>
          <div class="qty">
            <button type="button" data-action="dec" data-k="${e.k}" aria-label="Eén ${esc(it.name)} minder">−</button>
            <span aria-label="aantal">${e.q}</span>
            <button type="button" data-action="inc" data-k="${e.k}" aria-label="Eén ${esc(it.name)} meer">+</button>
          </div>
        </div>
        <div class="cart-item__right"><span class="cart-item__price">${eur(priceOf(e.k) * e.q)}</span></div>
      </li>`;
    }).join('');
    $('#cart').classList.toggle('is-empty', !count);
    $('#cartTotal').textContent = eur(total);
    $('#cartHonor').textContent = Math.round(total * 10);
    $('#bentoCount').textContent = count;
    $('#bentoTotal').textContent = eur(total);
    $('#bentoFab').classList.toggle('is-empty', !count);
    $('#bentoFab').setAttribute('aria-label', `Open je bento: ${count} items, ${eur(total)}`);
    // badges op de kaarten
    const per = {};
    S.cart.forEach(e => { const id = e.k.split('~')[0]; per[id] = (per[id] || 0) + e.q; });
    $$('.card').forEach(c => {
      const b = c.querySelector('.incart'), n = per[c.dataset.id] || 0;
      b.hidden = !n; b.textContent = `×${n}`; b.title = `${n} in je bento`;
    });
    $('#haiku').hidden = true;
  }

  function bumpFab() {
    const f = $('#bentoFab');
    f.classList.remove('is-bump'); void f.offsetWidth; f.classList.add('is-bump');
  }

  /* ---------------- toevoegen met katana ---------------- */
  function addItem(btn) {
    const id = btn.dataset.id, it = ITEMS[id];
    if (!it) return;
    const key = keyFor(it, S.sel[id] || 0);
    const before = cartCount(), beforeTotal = cartTotal();
    cartAdd(key, 1);
    SFX.slash(); SFX.addNote(); vibrate(18);
    const card = btn.closest('.card');
    if (card) {
      const r = card.getBoundingClientRect();
      slashFx(r);
      card.classList.remove('is-hit'); void card.offsetWidth; card.classList.add('is-hit');
      flyTo(it.emoji, card.querySelector('.medal').getBoundingClientRect());
    }
    setTimeout(bumpFab, 520);
    combos(it, before, beforeTotal);
  }

  function slashFx(r) {
    const sx = r.left - 10, sy = r.bottom - r.height * 0.22;
    const ex = r.right + 10, ey = r.top + r.height * 0.24;
    const a = Math.atan2(ey - sy, ex - sx);
    const el = document.createElement('div');
    el.className = 'slash';
    el.style.left = sx + 'px'; el.style.top = sy + 'px';
    el.style.width = Math.hypot(ex - sx, ey - sy) + 'px';
    el.style.setProperty('--a', a + 'rad');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 500);
    setTimeout(() => FX.burst(ex - 20, ey + 6, { n: 26, angle: a, min: 160, max: 560 }), 120);
  }

  function flyTo(emoji, from) {
    if (reduced) return;
    const to = $('#bentoFab .bento-fab__icon').getBoundingClientRect();
    const sx = from.left + from.width / 2 - 16, sy = from.top + from.height / 2 - 16;
    const ex = to.left + to.width / 2 - 16, ey = to.top + to.height / 2 - 16;
    const outer = document.createElement('div');
    outer.className = 'fly';
    const inner = document.createElement('span');
    inner.textContent = emoji;
    outer.appendChild(inner);
    document.body.appendChild(outer);
    const dur = 620;
    outer.animate([{ transform: `translateX(${sx}px)` }, { transform: `translateX(${ex}px)` }], { duration: dur, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    inner.animate([
      { transform: `translateY(${sy}px) scale(1) rotate(0)` },
      { transform: `translateY(${Math.min(sy, ey) - 140}px) scale(1.5) rotate(200deg)`, offset: 0.4, easing: 'cubic-bezier(.5,0,1,1)' },
      { transform: `translateY(${ey}px) scale(.5) rotate(540deg)`, opacity: 0.4 }
    ], { duration: dur, easing: 'cubic-bezier(0,0,.6,1)', fill: 'forwards' });
    setTimeout(() => outer.remove(), dur + 40);
  }

  /* ---------------- combo's & omroeper ---------------- */
  const fireOnce = k => (S.fired.has(k) ? false : (S.fired.add(k), true));
  const ADD_TOASTS = [
    ['De Meester knikt goedkeurend.', '師'], ['Een wijze keuze, krijger.', '賢'], ['Je voorouders zijn trots.', '祖'],
    ['De frituurdraak likt zijn lippen.', '龍'], ['Je bento wordt zwaarder. Je eer ook.', '誉'], ['Het zwaard is getrokken.', '剣']
  ];
  function trinity() {
    const cats = new Set(S.cart.map(e => parseKey(e.k).it.cat));
    const sauced = S.cart.some(e => ['friet-mayo', 'friet-speciaal', 'friet-oorlog'].includes(parseKey(e.k).it.id));
    return cats.has('frites') && (cats.has('snacks') || cats.has('vega')) && (cats.has('sauzen') || sauced);
  }
  function combos(it, before, beforeTotal) {
    const now = Date.now();
    S.streak = now - S.lastAdd < 1500 ? S.streak + 1 : 1;
    S.lastAdd = now;
    const count = cartCount(), total = cartTotal();
    if (before === 0) return announce('EERSTE BLOED!', 'De strijd is begonnen', '血');
    if (it.war && fireOnce('war')) return announce('OORLOG!', 'Drie koninkrijken botsen', '戦', { flash: true });
    if (it.boss && fireOnce('boss-' + it.id)) return announce('MEESTERLIJK!', 'Een keuze voor ware heersers', '王', { gong: true });
    if ([3, 5, 8, 12, 20].includes(S.streak)) return announce(`MULTI-SLASH ×${S.streak}`, 'Je zwaard is sneller dan het licht', '斬');
    if (trinity() && fireOnce('trinity')) return announce('HEILIGE DRIE-EENHEID', 'Friet · snack · saus', '三');
    if (count >= 10 && fireOnce('ten')) return announce('SHOGUN-HONGER!', '10 wapens in je bento', '将', { gong: true });
    if (total >= 50 && beforeTotal < 50 && fireOnce('fifty')) return announce('CLAN-FEESTMAAL!', 'Meer dan € 50 aan buit', '宴', { gong: true });
    if (it.frik && fireOnce('frik')) return toast('Het Zwaard van Van Beckers is getrokken.', '剣');
    if (Math.random() < 0.3) { const t = rand(ADD_TOASTS); toast(t[0], t[1]); }
  }

  function announce(text, sub, kanji, o = {}) {
    const box = $('#announcer');
    box.innerHTML = `<div class="announce"><span class="announce__bg" aria-hidden="true">${kanji || ''}</span>
      <span class="announce__text">${esc(text)}</span>${sub ? `<br><span class="announce__sub">${esc(sub)}</span>` : ''}</div>`;
    if (!o.silent) { SFX.taiko(1.1); SFX.taiko(0.8, 0.13); SFX.taiko(1.25, 0.26); }
    if (o.gong) SFX.gong(0.8, 0.3);
    shake();
    if (o.flash && !reduced) {
      const f = document.createElement('div'); f.className = 'flash';
      document.body.appendChild(f); setTimeout(() => f.remove(), 600);
    }
    clearTimeout(announce.t);
    announce.t = setTimeout(() => { box.innerHTML = ''; }, 1800);
  }

  function shake() {
    if (reduced) return;
    ['main', '.top'].forEach(s => { const el = $(s); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); });
    setTimeout(() => $$('.shake').forEach(el => el.classList.remove('shake')), 500);
  }

  function toast(msg, kanji = '侍') {
    const box = $('#toasts');
    while (box.children.length > 2) box.firstChild.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="brush" aria-hidden="true">${kanji}</span>${esc(msg)}`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 2700);
  }

  /* ==========================================================================
     OVERLAYS: drawer, modal, tracker, ceremonie
     ========================================================================== */
  let lastFocus = null;
  function lock() {
    const open = ['#cart', '#modal', '#tracker', '#ceremony'].some(s => $(s).classList.contains('is-open'));
    document.body.classList.toggle('is-locked', open);
  }

  function openCart() {
    renderCart();
    const c = $('#cart');
    lastFocus = document.activeElement;
    c.classList.add('is-open'); c.setAttribute('aria-hidden', 'false');
    SFX.whoosh(0.35); lock();
    setTimeout(() => $('.drawer__head .x').focus({ preventScroll: true }), 50);
  }
  function closeCart() {
    const c = $('#cart');
    if (!c.classList.contains('is-open')) return;
    c.classList.remove('is-open'); c.setAttribute('aria-hidden', 'true'); lock();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function openModal(html, mount) {
    const m = $('#modal');
    if (!m.classList.contains('is-open')) lastFocus = document.activeElement;
    $('#modalContent').innerHTML = html;
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
    $('.modal__box').scrollTop = 0;
    lock();
    if (mount) mount($('#modalContent'));
    setTimeout(() => {
      const f = $('#modalContent input:not([type=hidden]):not([readonly])');
      (f || $('.modal__box .x')).focus({ preventScroll: true });
    }, 60);
  }
  function closeModal() {
    const m = $('#modal');
    if (!m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); lock();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function closeTop() {
    if ($('#ceremony').classList.contains('is-open')) return closeCeremony();
    if ($('#modal').classList.contains('is-open')) return closeModal();
    if ($('#tracker').classList.contains('is-open')) return closeTracker();
    if ($('#cart').classList.contains('is-open')) return closeCart();
  }

  /* ==========================================================================
     RANGEN & EER
     ========================================================================== */
  function rankOf(h) {
    let i = 0;
    RANKS.forEach((r, j) => { if (h >= r.min) i = j; });
    return Object.assign({ i, next: RANKS[i + 1] || null }, RANKS[i]);
  }
  function renderProfile() {
    const P = S.profile, r = rankOf(P.honor);
    $('#rankKanji').textContent = r.k;
    $('#rankName').textContent = r.n;
    const pct = r.next ? ((P.honor - r.min) / (r.next.min - r.min)) * 100 : 100;
    $('#rankBar').style.width = clamp(pct, 3, 100) + '%';
    $('#statHonor').textContent = P.honor.toLocaleString('nl-NL');
    $('#statOrders').textContent = P.orders;
    $('#statFrik').textContent = P.frik;
  }
  function gainHonor(n) {
    const old = rankOf(S.profile.honor);
    S.profile.honor += n;
    store.set('profile', S.profile);
    renderProfile();
    const nr = rankOf(S.profile.honor);
    return nr.i > old.i ? nr : null;
  }

  function openRank() {
    const P = S.profile, r = rankOf(P.honor);
    const nextTxt = r.next ? `Nog <b>${(r.next.min - P.honor).toLocaleString('nl-NL')}</b> eer tot <b>${esc(r.next.n)}</b> ${r.next.k}.` : 'Je hebt de hoogste rang bereikt. De frituur buigt voor jou.';
    openModal(`
      <div class="m-head"><span class="brush">${r.k}</span><h2 id="modalTitle">${esc(r.n)}</h2>
        <p>${P.honor.toLocaleString('nl-NL')} eer · ${P.orders} bestellingen · ${P.frik} frikandellen geveld</p></div>
      <p class="note" style="margin-bottom:16px">${nextTxt} Je verdient <b>10 eer per euro</b> door het bestelritueel te voltooien.</p>
      <ol class="ranks">${RANKS.map((x, i) => `
        <li class="${i <= r.i ? 'is-reached' : ''}${i === r.i ? ' is-current' : ''}">
          <span class="brush">${x.k}</span><span><b>${esc(x.n)}</b><br><small>${x.min.toLocaleString('nl-NL')} eer</small></span>
          <span>${i < r.i ? '✓' : i === r.i ? '◆' : ''}</span>
        </li>`).join('')}</ol>
      <div style="text-align:center;margin-top:18px"><button type="button" class="btn btn--small btn--danger" data-action="reset-honor">Wis mijn eer en begin opnieuw</button></div>`);
  }

  function ceremony(r) {
    const c = $('#ceremony');
    c.innerHTML = `<div><p class="ceremony__kicker">Rang verhoogd</p>
      <div class="ceremony__kanji brush" aria-hidden="true">${r.k}</div>
      <p class="ceremony__name">${esc(r.n)}</p>
      <button type="button" class="btn btn--primary" data-action="close-ceremony"><span class="brush">礼</span> Buig en ga verder</button></div>`;
    c.classList.add('is-open'); c.setAttribute('aria-hidden', 'false'); lock();
    SFX.fanfare(); SFX.gong(1, 0.5);
    FX.flyDragon({ y: innerHeight * 0.22 });
    FX.petalRain(70);
    setTimeout(() => { const b = $('#ceremony .btn'); if (b) b.focus({ preventScroll: true }); }, 400);
  }
  function closeCeremony() {
    const c = $('#ceremony');
    c.classList.remove('is-open'); c.setAttribute('aria-hidden', 'true'); lock();
  }

  /* ==========================================================================
     HET RITUEEL (afrekenen)
     ========================================================================== */
  function openCheckout() {
    if (!S.cart.length) { toast('Je bento is leeg, krijger.', '空'); return; }
    closeCart();
    const P = S.profile, total = cartTotal(), count = cartCount();
    SFX.gong(0.5);
    openModal(`
      <div class="m-head"><span class="brush">儀</span><h2 id="modalTitle">Het Ritueel</h2>
        <p>${count} ${count === 1 ? 'wapen' : 'wapens'} · ${eur(total)} · Kies hoe je buit bij je komt.</p></div>
      <form id="checkoutForm" novalidate>
        <div class="field"><label for="coName">Krijgersnaam</label>
          <input id="coName" name="name" autocomplete="name" maxlength="40" required value="${esc(P.name)}" placeholder="bv. Tim de Onverzadigbare"></div>
        <div class="field"><span class="label">Hoe?</span>
          <div class="seg" role="group" aria-label="Bezorgen of afhalen">
            <button type="button" data-mode="bezorgen" aria-pressed="true"><span class="brush">走</span> Bezorgen</button>
            <button type="button" data-mode="afhalen" aria-pressed="false"><span class="brush">取</span> Afhalen</button>
          </div></div>
        <div class="field" id="addrField"><label for="coAddr">Adres van je kasteel</label>
          <input id="coAddr" name="addr" autocomplete="street-address" maxlength="120" value="${esc(P.addr)}" placeholder="Straat + huisnummer, Aalsmeer"></div>
        <div class="row2">
          <div class="field"><label for="coTime">Gewenste tijd</label><input id="coTime" name="time" type="time"></div>
          <div class="field"><label for="coPhone">Telefoon <small>(optioneel)</small></label><input id="coPhone" name="phone" type="tel" autocomplete="tel" maxlength="20"></div>
        </div>
        <div class="field"><label for="coNote">Opmerking voor de Meester</label>
          <textarea id="coNote" name="note" maxlength="300" placeholder="Extra uitjes. Veel extra uitjes."></textarea></div>
        <button class="btn btn--primary btn--block" type="submit"><span class="brush">印</span> Stempel de bestelrol</button>
      </form>`, root => {
      const form = $('#checkoutForm', root);
      let mode = P.mode === 'afhalen' ? 'afhalen' : 'bezorgen';
      const setMode = m => {
        mode = m;
        $$('.seg button', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
        $('#addrField', root).hidden = m !== 'bezorgen';
      };
      $$('.seg button', root).forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode); SFX.wood(); }));
      setMode(mode);
      form.addEventListener('submit', ev => {
        ev.preventDefault();
        const f = new FormData(form);
        const name = String(f.get('name') || '').trim();
        const addr = String(f.get('addr') || '').trim();
        if (!name) { toast('Een krijger zonder naam? Vul je naam in.', '名'); $('#coName').focus(); return; }
        if (mode === 'bezorgen' && !addr) { toast('Waar moet de ninja heen? Vul je adres in.', '所'); $('#coAddr').focus(); return; }
        Object.assign(S.profile, { name, mode, addr: addr || S.profile.addr });
        store.set('profile', S.profile);
        S.pending = {
          name, mode, addr, phone: String(f.get('phone') || '').trim(),
          time: String(f.get('time') || ''), note: String(f.get('note') || '').trim(),
          items: S.cart.map(e => ({ ...e })), total: cartTotal(), count: cartCount(),
          frik: S.cart.reduce((s, e) => s + (parseKey(e.k).it.frik ? e.q : 0), 0)
        };
        SFX.taiko(1.2); SFX.gong(0.6, 0.15);
        showOrderScroll();
      });
    });
  }

  function orderText(p) {
    const L = [];
    L.push(`🏯 BESTELLING — ${D.name}`);
    L.push(`👤 ${p.name}${p.phone ? ' · ' + p.phone : ''}`);
    L.push(p.mode === 'bezorgen' ? `🛵 Bezorgen: ${p.addr}` : '🥡 Afhalen');
    L.push(`⏰ ${p.time ? 'Om ' + p.time : 'Zo snel mogelijk'}`);
    L.push('──────────────');
    p.items.forEach(e => L.push(`${e.q}× ${labelOf(e.k)} — ${eur(priceOf(e.k) * e.q)}`));
    L.push('──────────────');
    L.push(`💰 Totaal (indicatief): ${eur(p.total)}`);
    if (p.note) L.push(`📝 ${p.note}`);
    if (S.cartFromClan && S.clan && S.clan.m.length) {
      L.push('');
      L.push(`⚔️ Clan “${S.clan.c}” — per krijger:`);
      S.clan.m.forEach(m => L.push(`• ${m.n}: ${eur(memberTotal(m))}`));
    }
    L.push('');
    L.push('— via SnackerTracker 侍');
    return L.join('\n');
  }

  function showOrderScroll() {
    const p = S.pending;
    const text = orderText(p);
    p.text = text;
    const wa = 'https://wa.me/?text=' + encodeURIComponent(text);
    openModal(`
      <div class="m-head"><span class="brush">印</span><h2 id="modalTitle">Je Bestelrol</h2>
        <p>De rol is gestempeld. Nu moet hij nog naar de dojo.</p></div>
      <div class="note"><b>Let op, krijger:</b> SnackerTracker is een fan-app zonder directe lijn naar de keuken.
        De dojo ontvangt je bestelling pas als jij <b>belt</b> of via de <b>officiële site</b> bestelt. Lees de rol gewoon voor aan de telefoon.</div>
      <pre class="order-scroll" id="orderScroll">${esc(text)}</pre>
      <div class="actions actions--2">
        <a class="btn btn--primary" href="${D.phoneHref}"><span class="brush">話</span> Bel de dojo</a>
        <a class="btn" href="${D.site}" target="_blank" rel="noopener"><span class="brush">網</span> Officiële site</a>
        <button type="button" class="btn" data-action="copy-order"><span class="brush">写</span> Kopieer rol</button>
        <a class="btn" href="${wa}" target="_blank" rel="noopener"><span class="brush">送</span> Deel via WhatsApp</a>
      </div>
      <div class="divider">daarna</div>
      <div class="field"><label for="etaInput">De Meester zei: klaar over … minuten</label>
        <input id="etaInput" type="number" inputmode="numeric" min="5" max="240" value="${p.mode === 'bezorgen' ? 45 : 20}"></div>
      <button type="button" class="btn btn--primary btn--block" data-action="confirm-order"><span class="brush">誓</span> Ik heb besteld — start de SnackerTracker</button>
      <div style="text-align:center;margin-top:12px"><button type="button" class="btn btn--small" data-action="open-checkout">← Terug naar het formulier</button></div>`);
  }

  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove(); return ok;
    }
  }

  function confirmOrder() {
    const p = S.pending;
    if (!p) return;
    const eta = clamp(parseInt(($('#etaInput') || {}).value, 10) || (p.mode === 'bezorgen' ? 45 : 20), 5, 240);
    const gained = Math.round(p.total * 10);
    S.profile.orders += 1;
    S.profile.frik += p.frik;
    const newRank = gainHonor(gained);
    S.tracker = { start: Date.now(), eta: eta * 60000, mode: p.mode, name: p.name, count: p.count, total: p.total, done: false, celebrated: false, lastStage: -1 };
    store.set('tracker', S.tracker);
    S.cart = []; S.fired.clear(); S.cartFromClan = false; S.pending = null;
    saveCart(); renderCart();
    closeModal();
    SFX.fanfare();
    FX.petalBurst(innerWidth / 2, innerHeight / 2, 50);
    announce('RITUEEL VOLTOOID', `+${gained} eer`, '誓', { gong: true, silent: true });
    updateTracker();
    setTimeout(() => {
      openTracker();
      if (newRank) setTimeout(() => ceremony(newRank), 900);
    }, 1500);
  }

  /* ==========================================================================
     DE SNACKERTRACKER
     ========================================================================== */
  const STAGES = {
    bezorgen: [
      { at: 0, k: '受', t: 'Rol ontvangen', d: 'De Meester heeft je bestelrol ontvangen.' },
      { at: 0.12, k: '炎', t: 'De olie ontwaakt', d: 'De frituurdraak brult op 180 graden.' },
      { at: 0.38, k: '鍛', t: 'Het smeden', d: 'Burgers worden gesmeed, frites gehard.' },
      { at: 0.66, k: '走', t: 'De ninja vertrekt', d: 'Een schaduw snelt door Aalsmeer.' },
      { at: 1, k: '着', t: 'Aangekomen', d: 'Eet met eer. Itadakimasu!' }
    ],
    afhalen: [
      { at: 0, k: '受', t: 'Rol ontvangen', d: 'De Meester heeft je bestelrol ontvangen.' },
      { at: 0.15, k: '炎', t: 'De olie ontwaakt', d: 'De frituurdraak brult op 180 graden.' },
      { at: 0.45, k: '鍛', t: 'Het smeden', d: 'Burgers worden gesmeed, frites gehard.' },
      { at: 0.85, k: '包', t: 'Ingepakt', d: 'Je buit wordt ingepakt. Trek je sandalen aan.' },
      { at: 1, k: '取', t: 'Klaar om op te halen', d: 'Ga naar de dojo en claim je buit!' }
    ]
  };
  const trackerProgress = t => (t.done ? 1 : clamp((Date.now() - t.start) / t.eta, 0, 1));
  const isTrackerOpen = () => $('#tracker').classList.contains('is-open');

  function openTracker() {
    const t = S.tracker;
    if (!t) { toast('Er is geen actief ritueel.', '無'); return; }
    const st = STAGES[t.mode] || STAGES.bezorgen;
    const route = t.mode === 'bezorgen' ? `
      <div class="route" aria-hidden="true">
        <svg viewBox="0 0 560 250">
          <path class="r-water" d="M0 150 C 60 130, 120 170, 180 210 C 230 240, 120 250, 0 250 Z"/>
          <path class="r-water" d="M300 250 C 330 215, 400 225, 440 250 Z"/>
          <text class="r-label--water" x="20" y="220">Westeinderplassen</text>
          <path id="rPath" class="r-path" d="M455 70 C 390 30, 340 130, 270 112 S 170 175, 110 168"/>
          <text x="455" y="58" font-size="30" text-anchor="middle">⛩️</text>
          <text class="r-label" x="455" y="98" text-anchor="middle">De Dojo</text>
          <text x="110" y="160" font-size="30" text-anchor="middle">🏯</text>
          <text class="r-label" x="110" y="198" text-anchor="middle">Jouw kasteel</text>
          <text id="rFire" x="492" y="74" font-size="22" text-anchor="middle">🔥</text>
          <text id="rNinja" x="455" y="80" font-size="28" text-anchor="middle">🥷</text>
        </svg>
      </div>` : `<p class="note" style="max-width:460px;margin:0 auto 24px">Afhalen bij <b>${esc(D.street)}</b>. <a href="${D.maps}" target="_blank" rel="noopener">Open de route naar de dojo</a>.</p>`;
    $('#trackerInner').innerHTML = `
      <p class="kicker" style="justify-content:center"><span class="brush">追跡</span> SnackerTracker</p>
      <h2 id="trackerTitle">Het Ritueel van Geduld</h2>
      <p class="tracker__sub">${esc(t.name)} · ${t.count} ${t.count === 1 ? 'wapen' : 'wapens'} · ${eur(t.total)} · ${t.mode === 'bezorgen' ? 'bezorgen' : 'afhalen'}</p>
      <div class="enso">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <defs><filter id="brushy" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7"/>
            <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/>
          </filter></defs>
          <circle class="enso__track" cx="100" cy="100" r="80"/>
          <path id="ensoInk" class="enso__ink" d="M100 20 A80 80 0 1 1 99.99 20" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>
        </svg>
        <div class="enso__center" role="status">
          <span class="enso__kanji brush" id="ensoKanji">${st[0].k}</span>
          <span class="enso__time" id="ensoTime">…</span>
          <span class="enso__label" id="ensoLabel">geschat</span>
        </div>
      </div>
      <ol class="stages" id="stages">${st.map(s => `<li><span class="st-k brush">${s.k}</span><span><b>${esc(s.t)}</b><span>${esc(s.d)}</span></span></li>`).join('')}</ol>
      ${route}
      <p class="tracker__disc">De voortgang is een schatting op basis van de tijd die de dojo noemde. SnackerTracker heeft geen live lijn met de keuken — dit is een ritueel van geduld.</p>
      <div class="tracker__actions">
        <button type="button" class="btn btn--small" data-action="tracker-plus">+5 min · de Meester is druk</button>
        <button type="button" class="btn btn--small btn--primary" data-action="tracker-done"><span class="brush">食</span> Mijn eten is er!</button>
        <button type="button" class="btn btn--small btn--danger" data-action="tracker-end">Beëindig ritueel</button>
      </div>`;
    const tr = $('#tracker');
    tr.classList.add('is-open'); tr.setAttribute('aria-hidden', 'false'); lock();
    tr.scrollTop = 0;
    t.lastStage = -1;
    updateTracker(true);
    SFX.whoosh(0.4);
  }
  function closeTracker() {
    const tr = $('#tracker');
    tr.classList.remove('is-open'); tr.setAttribute('aria-hidden', 'true'); lock();
  }

  function updateTracker(fresh) {
    const t = S.tracker, chip = $('#trackerChip');
    if (!t) { chip.hidden = true; return; }
    const p = trackerProgress(t);
    const left = Math.max(0, Math.ceil((t.eta - (Date.now() - t.start)) / 60000));
    chip.hidden = !S.entered;
    $('#trackerChipText').textContent = p >= 1 ? 'Klaar!' : `${left} min`;
    if (!isTrackerOpen()) return;
    const st = STAGES[t.mode] || STAGES.bezorgen;
    let si = 0;
    st.forEach((s, i) => { if (p >= s.at) si = i; });
    if (si !== t.lastStage) {
      if (t.lastStage >= 0 && !fresh) { SFX.taiko(1); SFX.taiko(0.8, 0.15); toast(st[si].t, st[si].k); }
      t.lastStage = si;
      const k = $('#ensoKanji');
      k.textContent = st[si].k;
      k.style.animation = 'none'; void k.offsetWidth; k.style.animation = '';
    }
    $('#ensoInk').setAttribute('stroke-dashoffset', String(100 - p * 96));
    $('#ensoTime').textContent = p >= 1 ? (t.mode === 'bezorgen' ? 'Aangekomen!' : 'Klaar!') : `nog ~${left} min`;
    $('#ensoLabel').textContent = p >= 1 ? 'itadakimasu' : 'geschat';
    $$('#stages li').forEach((li, i) => {
      li.classList.toggle('is-done', i < si || p >= 1);
      li.classList.toggle('is-now', i === si && p < 1);
    });
    const path = $('#rPath');
    if (path) {
      const q = clamp((p - 0.66) / 0.34, 0, 1);
      const pt = path.getPointAtLength(path.getTotalLength() * q);
      const n = $('#rNinja');
      n.setAttribute('x', pt.x); n.setAttribute('y', pt.y + 10);
      $('#rFire').style.display = p >= 0.12 && p < 0.66 ? '' : 'none';
    }
    if (p >= 1 && !t.celebrated) {
      t.celebrated = true;
      store.set('tracker', t);
      setTimeout(celebrate, fresh ? 600 : 0);
    }
  }

  function celebrate() {
    const t = S.tracker;
    SFX.fanfare();
    FX.petalRain(90);
    FX.flyDragon({ y: innerHeight * 0.25 });
    announce(t && t.mode === 'afhalen' ? 'CLAIM JE BUIT!' : 'ITADAKIMASU!', 'Eet met eer, krijger', '食', { gong: true, silent: true });
  }

  /* ==========================================================================
     HET ORAKEL
     ========================================================================== */
  function openOracle() {
    S.fate = null;
    openModal(`
      <div class="m-head"><span class="brush">籤</span><h2 id="modalTitle">Het Orakel van de Frituur</h2>
        <p>Twijfel je? Schud de koker. Het lot kiest je maaltijd.</p></div>
      <div class="oracle">
        <div class="tube" id="tube" aria-hidden="true"><div class="tube__sticks">${'<i></i>'.repeat(7)}</div><div class="tube__body"><span class="brush">運</span></div></div>
        <button type="button" class="btn btn--primary" data-action="shake" id="shakeBtn"><span class="brush">振</span> Schud de koker</button>
        <div id="fortune" style="width:100%" aria-live="polite"></div>
      </div>`);
  }

  function weighted(levels) {
    const sum = levels.reduce((s, l) => s + l.w, 0);
    let r = Math.random() * sum;
    for (const l of levels) { r -= l.w; if (r <= 0) return l; }
    return levels[0];
  }

  function shakeOracle(btn) {
    const tube = $('#tube');
    if (!tube || tube.classList.contains('is-shaking')) return;
    btn.disabled = true;
    $('#fortune').innerHTML = '';
    const old = tube.querySelector('.stick-out'); if (old) old.remove();
    tube.classList.add('is-shaking');
    SFX.rattle(1.3); vibrate([30, 40, 30, 40, 30, 40, 30]);
    setTimeout(() => {
      tube.classList.remove('is-shaking');
      const n = 1 + ((Math.random() * 100) | 0);
      const stick = document.createElement('div');
      stick.className = 'stick-out'; stick.innerHTML = `<b>${n}</b>`;
      tube.appendChild(stick);
      SFX.gong(0.55, 0.1);
      setTimeout(() => {
        showFortune(n);
        btn.disabled = false;
        btn.innerHTML = '<span class="brush">振</span> Schud opnieuw';
      }, 650);
    }, reduced ? 200 : 1300);
  }

  function showFortune(n) {
    const lvl = weighted(ORACLE.levels);
    const bad = lvl.k === '凶';
    const text = bad ? rand(ORACLE.bad) : rand(ORACLE.fortunes);
    const pool = MENU.filter(c => ['frites', 'snacks', 'burgers', 'menus', 'vega'].includes(c.id)).flatMap(c => c.items);
    const main = bad ? ITEMS.groentekroket : rand(pool);
    const picks = [keyFor(main, main.variants ? (Math.random() * main.variants.length) | 0 : null)];
    if (!bad && ['frites', 'snacks'].includes(main.cat) && Math.random() < 0.75) picks.push(keyFor(rand(MENU.find(c => c.id === 'sauzen').items)));
    if (!bad && Math.random() < 0.55) {
      const drinks = MENU.filter(c => c.id === 'dranken' || c.id === 'shakes').flatMap(c => c.items).filter(i => i.id !== 'heineken');
      const d = rand(drinks);
      picks.push(keyFor(d, d.variants ? (Math.random() * d.variants.length) | 0 : null));
    }
    S.fate = picks;
    $('#fortune').innerHTML = `<div class="fortune">
      <p class="fortune__lvl brush">${lvl.k}</p>
      <p class="fortune__lvl-name">Lot nr. ${n} · ${esc(lvl.n)}</p>
      <p class="fortune__text">“${esc(text)}”</p>
      ${picks.map(k => { const { it } = parseKey(k); return `<div class="fortune__pick"><span class="em" aria-hidden="true">${it.emoji}</span><div><b>${esc(it.epic)}</b>${esc(labelOf(k))} · ${eur(priceOf(k))}</div></div>`; }).join('')}
      <button type="button" class="btn btn--primary btn--block" data-action="accept-fate"><span class="brush">運</span> Aanvaard het lot</button>
    </div>`;
    if (lvl.k === '大吉') { FX.petalBurst(innerWidth / 2, innerHeight * 0.45, 40); SFX.fanfare(); }
    else for (let i = 0; i < 5; i++) SFX.pluck(SFX.scaleFreq(8 + i), 0.35, i * 0.07);
  }

  function acceptFate() {
    if (!S.fate) return;
    S.fate.forEach(k => cartAdd(k, 1));
    const n = S.fate.length;
    S.fate = null;
    closeModal();
    SFX.slash(); SFX.addNote();
    bumpFab();
    announce('HET LOT IS BEZEGELD', `${n} ${n === 1 ? 'wapen' : 'wapens'} in je bento`, '運', { gong: true });
  }

  /* ==========================================================================
     CLAN-BESTELLING (via deelbare link)
     ========================================================================== */
  const memberTotal = m => m.i.reduce((s, [k, q]) => s + priceOf(k) * q, 0);
  const clanTotal = c => c.m.reduce((s, m) => s + memberTotal(m), 0);

  function sanitizeClan(c) {
    if (!c || typeof c !== 'object') return null;
    const name = String(c.c || '').trim().slice(0, 40) || 'Naamloze clan';
    const members = [];
    (Array.isArray(c.m) ? c.m : []).slice(0, 30).forEach(x => {
      if (!x || typeof x !== 'object') return;
      const n = String(x.n || '').trim().slice(0, 24);
      if (!n) return;
      const items = (Array.isArray(x.i) ? x.i : []).slice(0, 60)
        .filter(e => Array.isArray(e) && validKey(String(e[0])))
        .map(e => [String(e[0]), clamp(parseInt(e[1], 10) || 1, 1, 99)]);
      const idx = members.findIndex(mm => mm.n.toLowerCase() === n.toLowerCase());
      if (idx >= 0) members.splice(idx, 1);
      members.push({ n, i: items });
    });
    return { c: name, m: members };
  }
  function encodeClan(c) {
    const bytes = new TextEncoder().encode(JSON.stringify(c));
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeClan(s) {
    try {
      const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
      const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
      const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
      return sanitizeClan(JSON.parse(new TextDecoder().decode(bytes)));
    } catch (e) { return null; }
  }
  const clanLink = () => location.origin + location.pathname + '#clan=' + encodeClan(S.clan);
  function saveClan() {
    if (S.clan) {
      store.set('clan', S.clan);
      try { history.replaceState(null, '', '#clan=' + encodeClan(S.clan)); } catch (e) { /* file:// */ }
    } else {
      store.del('clan');
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// */ }
    }
  }

  function openClan() {
    closeCart();
    if (!S.clan) {
      const count = cartCount();
      openModal(`
        <div class="m-head"><span class="brush">族</span><h2 id="modalTitle">Roep je Clan bijeen</h2>
          <p>Eén gedeelde link. Iedereen voegt zijn eigen bestelling toe. Eén krijger belt de dojo voor de hele clan.</p></div>
        <form id="clanForm" novalidate>
          <div class="field"><label for="clanC">Naam van de clan</label>
            <input id="clanC" maxlength="40" value="De Clan van de Gouden Staaf"></div>
          <div class="field"><label for="clanN">Jouw krijgersnaam</label>
            <input id="clanN" maxlength="24" autocomplete="given-name" value="${esc(S.profile.name)}" placeholder="bv. Sanne de Snelle"></div>
          <p class="note" style="margin:0 0 16px">${count
            ? `Je bento (<b>${count} items · ${eur(cartTotal())}</b>) wordt jouw inzet in de clan.`
            : 'Je bento is nog leeg. Je kunt de clan alvast stichten en je bestelling later toevoegen.'}</p>
          <button class="btn btn--primary btn--block" type="submit"><span class="brush">旗</span> Sticht de clan</button>
        </form>`, root => {
        $('#clanForm', root).addEventListener('submit', ev => {
          ev.preventDefault();
          const c = $('#clanC').value.trim() || 'Naamloze clan';
          const n = $('#clanN').value.trim().slice(0, 24);
          S.clan = { c: c.slice(0, 40), m: [] };
          if (n) { S.profile.name = n; store.set('profile', S.profile); }
          if (n && S.cart.length) S.clan.m.push({ n, i: S.cart.map(e => [e.k, e.q]) });
          saveClan();
          announce('CLAN GESTICHT', S.clan.c, '族', { gong: true });
          renderClan();
        });
      });
      return;
    }
    renderClan();
  }

  function renderClan() {
    const C = S.clan, me = (S.profile.name || '').toLowerCase();
    const link = clanLink();
    const shareText = `⚔️ De clan “${C.c}” verzamelt zich voor ${D.name}!\nVoeg je eigen bestelling toe in SnackerTracker:\n${link}`;
    const mine = C.m.find(m => m.n.toLowerCase() === me);
    openModal(`
      <div class="m-head"><span class="brush">族</span><h2 id="modalTitle">${esc(C.c)}</h2>
        <p>${C.m.length} ${C.m.length === 1 ? 'krijger' : 'krijgers'} · totaal ${eur(clanTotal(C))}</p></div>
      ${C.m.length ? C.m.map((m, i) => `
        <div class="clan-member${m.n.toLowerCase() === me ? ' is-me' : ''}">
          <div class="clan-member__head"><span class="clan-member__name"><span class="brush">侍</span>${esc(m.n)}</span><span class="clan-member__sum">${eur(memberTotal(m))}</span></div>
          <ul>${m.i.map(([k, q]) => `<li>${q}× ${esc(labelOf(k))}</li>`).join('') || '<li>Nog niets gekozen</li>'}</ul>
          <button type="button" class="rm" data-action="clan-remove" data-i="${i}">verwijder ${esc(m.n)}</button>
        </div>`).join('') : '<p class="note">Nog geen krijgers met een bestelling. Voeg de jouwe toe en deel de link.</p>'}
      <div class="clan-total"><span>Clantotaal <small>(indicatief)</small></span><strong>${eur(clanTotal(C))}</strong></div>

      <div class="field"><label for="clanMe">Jouw krijgersnaam</label>
        <input id="clanMe" maxlength="24" value="${esc(S.profile.name)}" placeholder="bv. Sanne de Snelle"></div>
      <button type="button" class="btn btn--primary btn--block" data-action="clan-add"${S.cart.length ? '' : ' disabled'}>
        <span class="brush">加</span> ${mine ? 'Werk mijn bestelling bij' : 'Voeg mijn bento toe'} · ${eur(cartTotal())}</button>
      ${S.cart.length ? '' : '<p class="fine" style="text-align:center">Vul eerst je bento via de menurollen.</p>'}

      <div class="divider">verspreid de oproep</div>
      <div class="linkbox"><input id="clanLink" readonly value="${esc(link)}" aria-label="Clan-link"><button type="button" class="btn btn--small" data-action="clan-copy">Kopieer</button></div>
      <div class="actions actions--2" style="margin-top:10px">
        <a class="btn" href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener"><span class="brush">送</span> WhatsApp</a>
        ${navigator.share ? '<button type="button" class="btn" data-action="clan-share"><span class="brush">広</span> Deel…</button>' : ''}
      </div>
      <p class="fine">Elke keer dat iemand iets toevoegt, ontstaat er een nieuwe link. Deel steeds de nieuwste versie.</p>

      <div class="divider">voor de besteller</div>
      <button type="button" class="btn btn--block" data-action="clan-load"${C.m.length ? '' : ' disabled'}><span class="brush">集</span> Laad de hele clanbestelling in mijn bento</button>
      <div style="text-align:center;margin-top:14px"><button type="button" class="btn btn--small btn--danger" data-action="clan-leave">Verlaat deze clan</button></div>`);
    S._shareText = shareText;
  }

  function clanAdd() {
    const n = ($('#clanMe') || {}).value ? $('#clanMe').value.trim().slice(0, 24) : '';
    if (!n) { toast('Vul je krijgersnaam in.', '名'); $('#clanMe') && $('#clanMe').focus(); return; }
    if (!S.cart.length) { toast('Je bento is leeg.', '空'); return; }
    S.profile.name = n; store.set('profile', S.profile);
    const entry = { n, i: S.cart.map(e => [e.k, e.q]) };
    const idx = S.clan.m.findIndex(m => m.n.toLowerCase() === n.toLowerCase());
    if (idx >= 0) S.clan.m[idx] = entry; else S.clan.m.push(entry);
    saveClan();
    SFX.taiko(1.1); SFX.taiko(0.9, 0.15); SFX.coin();
    toast('Je krijgsbuit is bij de clan gevoegd. Deel de nieuwe link!', '族');
    renderClan();
  }

  function clanLoad() {
    if (!S.clan || !S.clan.m.length) return;
    if (S.cart.length && !confirm('Je huidige bento wordt vervangen door de complete clanbestelling. Doorgaan?')) return;
    const merged = [];
    S.clan.m.forEach(m => m.i.forEach(([k, q]) => {
      const e = merged.find(x => x.k === k);
      if (e) e.q = clamp(e.q + q, 1, 99); else merged.push({ k, q });
    }));
    S.cart = merged; S.cartFromClan = true;
    saveCart(); renderCart();
    closeModal();
    announce('CLANBUIT GELADEN', `${cartCount()} items · ${eur(cartTotal())}`, '集', { gong: true });
    setTimeout(openCart, 1100);
  }

  /* ==========================================================================
     HAIKU
     ========================================================================== */
  const H1 = ['Olie fluistert zacht', 'Maan boven Aalsmeer', 'Stilte in de dojo', 'Kersenbloesem valt', 'Herfstwind door de stad', 'De gong klinkt eenmaal', 'Rook boven het plein'];
  const H2 = x => [`${x} ontwaakt in vuur`, `mijn ${x} wacht op mij`, `${x}, goud in de nacht`, `de ${x} roept mijn naam`, `ik droom van ${x}`];
  const H3 = ['honger buigt het hoofd', 'de saus spreekt waarheid', 'de Meester glimlacht', 'ik buig voor de mayo', 'de clan eet in vrede', 'de ninja rent al', 'eer zonder servet'];
  function haiku() {
    if (!S.cart.length) return;
    const it = parseKey(rand(S.cart).k).it;
    const x = it.name.replace(/\s*\(.*\)\s*/g, '').toLowerCase();
    const r = rankOf(S.profile.honor);
    const el = $('#haiku');
    el.innerHTML = `${esc(rand(H1))}\n${esc(rand(H2(x)))}\n${esc(rand(H3))}<small>— ${esc(S.profile.name || 'Naamloze krijger')}, ${esc(r.n)}</small>`;
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    [0, 2, 4, 3, 7].forEach((s, i) => SFX.pluck(SFX.scaleFreq(6 + s), 0.4, i * 0.16));
  }

  /* ==========================================================================
     OPENINGSTIJDEN
     ========================================================================== */
  const DAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const hh = h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  function amsNow() {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const get = t => (parts.find(p => p.type === t) || {}).value;
    const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: wd < 0 ? new Date().getDay() : wd, h: parseInt(get('hour'), 10) + parseInt(get('minute'), 10) / 60 };
  }
  function renderHours() {
    const now = amsNow();
    const order = [1, 2, 3, 4, 5, 6, 0];
    $('#hoursTable tbody').innerHTML = order.map(d => {
      const b = D.hours.bezorgen[d], a = D.hours.afhalen[d];
      return `<tr class="${d === now.day ? 'is-today' : ''}"><td>${DAYS[d]}</td><td>${hh(b[0])} – ${hh(b[1])}</td><td>${hh(a[0])} – ${hh(a[1])}</td></tr>`;
    }).join('');
  }
  function updateStatus() {
    const now = amsNow(), el = $('#dojoStatus'), txt = $('#dojoStatusText');
    const a = D.hours.afhalen[now.day], b = D.hours.bezorgen[now.day];
    const open = now.h >= a[0] && now.h < a[1];
    el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open);
    if (open) {
      const deliv = now.h >= b[0] && now.h < b[1];
      txt.textContent = deliv ? `OPEN — de olie is heet · bezorgen tot ${hh(b[1])}` : `OPEN — alleen afhalen, tot ${hh(a[1])}`;
    } else {
      const label = now.h < a[0]
        ? `vandaag om ${hh(a[0])}`
        : `morgen om ${hh(D.hours.afhalen[(now.day + 1) % 7][0])}`;
      txt.textContent = `GESLOTEN — de Meester mediteert · open ${label}`;
    }
  }

  /* ==========================================================================
     WIJSHEID
     ========================================================================== */
  let wisdomIdx = (Math.random() * WISDOM.length) | 0;
  function rotateWisdom() {
    const q = $('#wisdom');
    q.classList.add('is-fading');
    setTimeout(() => {
      wisdomIdx = (wisdomIdx + 1 + ((Math.random() * (WISDOM.length - 1)) | 0)) % WISDOM.length;
      q.textContent = WISDOM[wisdomIdx];
      q.classList.remove('is-fading');
    }, 500);
  }

  /* ==========================================================================
     GELUID-INSTELLINGEN
     ========================================================================== */
  function applySettingsUI() {
    SFX.sfxOn = !!S.settings.sfx;
    $('#sfxBtn').setAttribute('aria-pressed', String(!!S.settings.sfx));
    $('#musicBtn').setAttribute('aria-pressed', String(!!SFX.musicOn));
  }
  function toggleMusic() {
    if (SFX.musicOn) { SFX.stopMusic(); S.settings.music = false; }
    else { SFX.init(); SFX.startMusic(); S.settings.music = true; toast('Krijgsmuziek aan. De taiko slaat.', '楽'); }
    store.set('settings', S.settings); applySettingsUI();
  }
  function toggleSfx() {
    S.settings.sfx = !S.settings.sfx;
    store.set('settings', S.settings);
    applySettingsUI();
    if (S.settings.sfx) { SFX.init(); SFX.wood(0.8); toast('Geluidseffecten aan.', '音'); }
  }

  /* ==========================================================================
     DE POORT
     ========================================================================== */
  function enterDojo(sound) {
    if (S.entered) return;
    S.entered = true;
    if (sound) { S.settings.sfx = true; SFX.init(); }
    else { S.settings.sfx = false; S.settings.music = false; }
    store.set('settings', S.settings);
    applySettingsUI();
    const gate = $('#gate');
    const ang = Math.atan2(-0.16 * innerHeight, innerWidth) * 180 / Math.PI;
    gate.style.setProperty('--slash-angle', ang + 'deg');
    const kan = $('.gate__kanji');
    const cut = () => {
      gate.classList.add('is-opening');
      SFX.slash(1.3);
      setTimeout(() => {
        gate.classList.add('is-gone');
        document.body.classList.remove('is-gated');
        afterEnter(sound);
      }, reduced ? 50 : 1250);
    };
    if (sound && !reduced) {
      SFX.intro();
      [0, 420, 840, 980, 1120].forEach(ms => setTimeout(() => { kan.classList.remove('beat'); void kan.offsetWidth; kan.classList.add('beat'); }, ms));
      setTimeout(cut, 1300);
    } else cut();
  }
  function afterEnter(sound) {
    if (sound && S.settings.music) SFX.startMusic();
    applySettingsUI();
    FX.flyDragon({ y: innerHeight * 0.32 });
    updateTracker();
    if (S.pendingClan && S.clan) {
      S.pendingClan = false;
      announce('DE CLAN ROEPT!', S.clan.c, '族', { gong: true });
      setTimeout(openClan, 1500);
    }
  }

  /* ==========================================================================
     EASTER EGGS
     ========================================================================== */
  let gongHits = [];
  function hitGong(btn) {
    SFX.gong(1); shake(); vibrate(40);
    btn.classList.remove('is-hit'); void btn.offsetWidth; btn.classList.add('is-hit');
    const r = btn.querySelector('.gong__disc').getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 34, gravity: 260, min: 100, max: 420 });
    const now = Date.now();
    gongHits = gongHits.filter(t => now - t < 4000);
    gongHits.push(now);
    if (gongHits.length >= 5) {
      gongHits = [];
      if (FX.flyDragon()) announce('DE DRAAK ONTWAAKT', 'Vijf slagen op de gong', '龍', { flash: true });
    } else if (gongHits.length === 1) toast(rand(['De gong galmt door Aalsmeer.', 'De Meester kijkt op.', 'Ergens in de verte wordt een friteuse aangezet.']), '響');
  }

  function dragonMode() {
    announce('DRAKENMODUS', 'Je hebt de oude code gevonden', '龍', { flash: true, gong: true });
    FX.flyDragon({ dur: 7, onDone: () => FX.flyDragon({ dir: -1, y: innerHeight * 0.6 }) });
    if (!S.profile.egg) {
      S.profile.egg = true;
      const nr = gainHonor(88);
      setTimeout(() => toast('Geheime eer ontvangen: +88. Acht brengt geluk.', '八'), 1800);
      if (nr) setTimeout(() => ceremony(nr), 2600);
    }
  }

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let kpos = 0, typed = '';
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeTop(); return; }
    if (!S.entered || (e.target && e.target.matches && e.target.matches('input, textarea, select'))) return;
    const k = (e.key || '').toLowerCase();
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; dragonMode(); }
    typed = (typed + k).slice(-5);
    if (typed === 'draak') { typed = ''; dragonMode(); }
  });

  /* ==========================================================================
     ACTIES
     ========================================================================== */
  const ACTIONS = {
    'enter': t => enterDojo(t.dataset.sound === '1'),
    'add': t => addItem(t),
    'variant': t => {
      const id = t.dataset.id, v = parseInt(t.dataset.v, 10), it = ITEMS[id];
      S.sel[id] = v;
      const card = t.closest('.card');
      $$('.variants button', card).forEach(b => b.setAttribute('aria-pressed', String(b === t)));
      $('.price__v', card).textContent = eur(it.variants[v].p);
      SFX.wood(0.5);
    },
    'open-cart': () => openCart(),
    'close-cart': () => closeCart(),
    'inc': t => { const e = S.cart.find(x => x.k === t.dataset.k); if (e) { cartSet(e.k, e.q + 1); SFX.addNote(); } },
    'dec': t => { const e = S.cart.find(x => x.k === t.dataset.k); if (e) { cartSet(e.k, e.q - 1); SFX.wood(0.6); } },
    'clear-cart': () => {
      if (!S.cart.length || !confirm('Je hele bento legen? De Meester zal teleurgesteld zijn.')) return;
      S.cart = []; S.fired.clear(); S.cartFromClan = false; saveCart(); renderCart();
      SFX.whoosh(0.5); toast('Je bento is leeg. Begin opnieuw, krijger.', '空');
    },
    'haiku': () => haiku(),
    'open-checkout': () => openCheckout(),
    'copy-order': async () => {
      const ok = S.pending && await copyText(S.pending.text);
      toast(ok ? 'Bestelrol gekopieerd.' : 'Kopiëren mislukt — selecteer de tekst handmatig.', '写');
      if (ok) SFX.coin();
    },
    'confirm-order': () => confirmOrder(),
    'open-tracker': () => openTracker(),
    'close-tracker': () => closeTracker(),
    'tracker-plus': () => {
      if (!S.tracker) return;
      S.tracker.eta += 5 * 60000; S.tracker.done = false; S.tracker.celebrated = trackerProgress(S.tracker) >= 1;
      store.set('tracker', S.tracker); updateTracker(); SFX.wood(); toast('Geduld is ook een wapen. +5 minuten.', '忍');
    },
    'tracker-done': () => {
      if (!S.tracker) return;
      S.tracker.done = true; store.set('tracker', S.tracker); updateTracker();
    },
    'tracker-end': () => {
      S.tracker = null; store.del('tracker'); closeTracker(); updateTracker();
      toast('Het ritueel is beëindigd. Tot de volgende veldslag.', '終');
    },
    'open-oracle': () => { closeCart(); openOracle(); },
    'shake': t => shakeOracle(t),
    'accept-fate': () => acceptFate(),
    'open-clan': () => openClan(),
    'clan-add': () => clanAdd(),
    'clan-remove': t => {
      const i = parseInt(t.dataset.i, 10), m = S.clan && S.clan.m[i];
      if (!m || !confirm(`${m.n} uit de clan verwijderen?`)) return;
      S.clan.m.splice(i, 1); saveClan(); renderClan();
    },
    'clan-copy': async () => { const ok = await copyText(clanLink()); toast(ok ? 'Clan-link gekopieerd. Verspreid hem!' : 'Kopiëren mislukt.', '族'); if (ok) SFX.coin(); },
    'clan-share': async () => { try { await navigator.share({ title: `Clan ${S.clan.c} — SnackerTracker`, text: S._shareText.split('\n').slice(0, 2).join('\n'), url: clanLink() }); } catch (e) { /* geannuleerd */ } },
    'clan-load': () => clanLoad(),
    'clan-leave': () => {
      if (!confirm('Deze clan verlaten? De link blijft werken voor de anderen.')) return;
      S.clan = null; S.cartFromClan = false; saveClan(); closeModal(); toast('Je hebt de clan verlaten. Een ronin ben je nu.', '浪');
    },
    'toggle-music': () => toggleMusic(),
    'toggle-sfx': () => toggleSfx(),
    'gong': t => hitGong(t),
    'dragon-poke': () => { if (FX.flyDragon()) { SFX.gong(0.7); toast('Je hebt de draak gewekt.', '龍'); } },
    'open-rank': () => openRank(),
    'reset-honor': () => {
      if (!confirm('Al je eer, rangen en statistieken wissen? Dit kan niet ongedaan worden gemaakt.')) return;
      Object.assign(S.profile, { honor: 0, orders: 0, frik: 0, egg: false });
      store.set('profile', S.profile); renderProfile(); closeModal(); toast('Je begint opnieuw als boerenknecht.', '農');
    },
    'close-modal': () => closeModal(),
    'close-ceremony': () => closeCeremony(),
    'scroll-menu': () => SFX.whoosh(0.4)
  };

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-action]');
    if (!t) { if (e.target.closest('#catnav a')) SFX.wood(0.4); return; }
    const fn = ACTIONS[t.dataset.action];
    if (fn) fn(t, e);
  });

  /* ==========================================================================
     NAVIGATIE, PARALLAX, KANTELEN
     ========================================================================== */
  function setupNav() {
    const links = $$('#catnav a'), nav = $('#catnav');
    const setActive = id => {
      links.forEach(a => a.classList.toggle('is-active', a.dataset.cat === id));
      const a = links.find(x => x.dataset.cat === id);
      if (a) nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id.replace('cat-', '')); }),
        { rootMargin: '-35% 0px -60% 0px' });
      $$('.cat').forEach(s => io.observe(s));
    }
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { document.documentElement.style.setProperty('--scroll', String(scrollY)); ticking = false; });
    }, { passive: true });
  }

  function setupTilt() {
    if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--tx', (x * 7).toFixed(2) + 'deg');
        card.style.setProperty('--ty', (-y * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--tx', '0deg'); card.style.setProperty('--ty', '0deg'); });
    });
  }

  function readClanHash() {
    const m = location.hash.match(/^#clan=([A-Za-z0-9_-]+)$/);
    if (!m) return false;
    const c = decodeClan(m[1]);
    if (!c) { toast('Deze clan-link is beschadigd.', '破'); return false; }
    S.clan = c; store.set('clan', c);
    return true;
  }

  /* ==========================================================================
     START
     ========================================================================== */
  function init() {
    S.clan = sanitizeClan(store.get('clan', null));
    if (readClanHash()) {
      S.pendingClan = true;
      $('.gate__kicker').textContent = `⚔ Opgeroepen door clan “${S.clan.c}”`;
    }
    renderMenu();
    renderCart();
    renderProfile();
    renderHours();
    updateStatus();
    applySettingsUI();
    setupNav();
    setupTilt();
    FX.init();
    $('#wisdom').textContent = WISDOM[wisdomIdx];
    setInterval(rotateWisdom, 9000);
    setInterval(updateStatus, 30000);
    setInterval(() => updateTracker(), 1000);
    addEventListener('hashchange', () => { if (readClanHash() && S.entered) openClan(); });
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  init();
})();
