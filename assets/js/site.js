/* PIHOCO — site behaviour. Vanilla JS + Lenis (local). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  /* Display currency for the illustrative menus. Sample data is written in GBP and converted
     at round illustrative rates; prices are rounded the way menus in each market are written. */
  var FX = {
    GBP: { sym: '£',    rate: 1,   round: 0.5, step: 0.5, dec: 2, small: '50p' },
    AED: { sym: 'AED ', rate: 4.7, round: 1,   step: 2,   dec: 0 },
    SGD: { sym: 'S$',   rate: 1.7, round: 0.5, step: 1,   dec: 2 },
    USD: { sym: '$',    rate: 1.3, round: 0.5, step: 1,   dec: 2 }
  };
  var cx = FX.GBP;
  var conv = function (v) { return Math.round(v * cx.rate / cx.round) * cx.round; };
  var convCost = function (v) { return Math.round(v * cx.rate * 100) / 100; };
  var num = function (v) { return cx.dec ? v.toFixed(2) : String(Math.round(v)); };
  var money = function (v) { return cx.sym + num(v); };
  var smallStep = function () { return cx.small || money(cx.step); };

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#' || id.charAt(0) !== '#') return;
      var t = id === '#top' ? 0 : document.querySelector(id);
      if (t === null) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(t, { duration: 1.4 });
      else if (t === 0) window.scrollTo(0, 0);
      else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (t && id !== '#top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* ---------- Hero ---------- */
  var hero = $('.hero');
  var heroImg = $('.hero__img img');
  var ready = function () { if (hero) hero.classList.add('is-ready'); };
  if (reduce) ready();
  else if (heroImg && heroImg.decode) heroImg.decode().then(ready, ready);
  else ready();
  setTimeout(ready, 900);

  /* ---------- Nav + parallax ---------- */
  var nav = $('[data-nav]');
  var pauseImg = $('[data-parallax]');
  var lastY = 0, ticking = false, menuOpen = false;
  function onScroll() {
    var y = window.scrollY, vh = window.innerHeight;
    nav.classList.toggle('is-solid', !hero || y > vh * 0.85);
    if (!menuOpen) {
      if (y > lastY + 4 && y > vh) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');
    }
    if (!reduce && pauseImg) {
      var r = pauseImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        pauseImg.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      }
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = $('[data-menu-toggle]'), menu = $('[data-menu]');
  function closeMenu() { if (menuOpen) setMenu(false); }
  function setMenu(open) {
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', toggle).textContent = open ? 'Close menu' : 'Open menu';
    menu.hidden = !open;
    nav.classList.toggle('is-menu', open);
    if (open) { nav.classList.remove('is-hidden'); nav.classList.add('is-solid'); if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; $('a', menu).focus(); }
    else { if (lenis) lenis.start(); document.body.style.overflow = ''; onScroll(); }
  }
  toggle.addEventListener('click', function () { setMenu(!menuOpen); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { setMenu(false); toggle.focus(); } });

  /* ---------- Line illustrations: prepare strokes to draw ---------- */
  $$('svg.draw').forEach(function (svg) {
    $$('path, rect, circle, line, polyline', svg).forEach(function (el, i) {
      if (el.hasAttribute('stroke-dasharray') || el.classList.contains('fill')) { el.classList.add('f'); }
      else { el.setAttribute('pathLength', '1'); el.classList.add('d'); }
      el.style.transitionDelay = (0.25 + i * 0.07).toFixed(2) + 's';
    });
  });

  /* ---------- Reveal ---------- */
  var els = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      var i = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (i++ * 0.1) + 's';
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Menu-engineering matrix (illustrative data) ----------
     n = items sold over 8 weeks; price/cost in GBP. Kasavana & Smith:
     popularity threshold = 70% of equal share; contribution threshold =
     weighted average contribution margin. */
  var MENU = [
    { id: 'burger', lab: 'left',  name: 'Smash Burger',          n: 420, price: 14.50, cost: 5.10, note: 'Carries volume and margin. Hold the spec and its position.' },
    { id: 'fries', lab: 'left',   name: 'Truffle Fries',         n: 380, price: 6.50,  cost: 1.40, note: 'On every table, but earns little each time. Look at portion and pairing.' },
    { id: 'lamb',    name: 'Braised Lamb Shoulder', n: 140, price: 26.00, cost: 9.10, note: 'Earns well, chosen rarely. Move it up and brief the floor.' },
    { id: 'burrata', lab: 'below', name: 'Burrata & Tomato',      n: 210, price: 12.00, cost: 4.60, note: 'Popular and quick to plate. A small price test is worth trying.' },
    { id: 'katsu', lab: 'above',   name: 'Chicken Katsu Curry',   n: 360, price: 16.00, cost: 5.90, note: 'A star — check it isn’t overloading the fryer at peak.' },
    { id: 'seabass', name: 'Roast Seabass',         n: 95,  price: 24.00, cost: 8.20, note: 'High margin, heavy on the line. Simplify before promoting.' },
    { id: 'risotto', name: 'Mushroom Risotto',      n: 120, price: 15.50, cost: 3.40, note: 'Strong margin. Par-cook the base, then feature it.' },
    { id: 'club', lab: 'left',    name: 'Club Sandwich',         n: 160, price: 13.00, cost: 5.80, note: 'Spec has drifted. Re-cost before repricing.' },
    { id: 'croq', lab: 'right',    name: 'Short Rib Croquettes',  n: 90,  price: 9.50,  cost: 3.60, note: 'Labour-heavy and rarely ordered. Specials or retire.' },
    { id: 'caesar',  name: 'Caesar Salad',          n: 230, price: 11.50, cost: 3.20, note: 'Just below the line — try {two-steps} more and watch it cross.' },
    { id: 'bao', lab: 'below',     name: 'Pork Belly Bao',        n: 85,  price: 10.00, cost: 4.20, note: 'Low on both. Retiring it frees a station.' },
    { id: 'stp',     name: 'Sticky Toffee Pudding', n: 260, price: 8.50,  cost: 1.70, note: 'Popular finish, thin margin. Portion or pairing.' }
  ];
  MENU.forEach(function (d) { d.gbp = d.price; d.gbpCost = d.cost; d.base = d.price; });
  function priceMenu() { MENU.forEach(function (d) { d.price = d.base = conv(d.gbp); d.cost = convCost(d.gbpCost); }); }
  var Q = { star: ['Star', 'Protect it.'], plow: ['Plowhorse', 'Re-cost it.'], puzzle: ['Puzzle', 'Promote it.'], dog: ['Dog', 'Rework or retire it.'] };

  function analyse() {
    var N = 0, s = 0;
    MENU.forEach(function (d) { d.cm = d.price - d.cost; N += d.n; s += d.n * d.cm; });
    var avg = s / N, thr = 0.7 / MENU.length;
    MENU.forEach(function (d) { d.mix = d.n / N; var p = d.mix >= thr, c = d.cm >= avg; d.q = p && c ? 'star' : p ? 'plow' : c ? 'puzzle' : 'dog'; });
    return { avg: avg, thr: thr };
  }

  var mx = $('[data-matrix]');
  if (mx) {
    var dots = $('[data-mx-dots]', mx), vEl = $('[data-mx-v]', mx), hEl = $('[data-mx-h]', mx), insp = $('[data-mx-inspect]', mx);
    var sel = 'caesar';
    MENU.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dot'; b.setAttribute('data-id', d.id); b.setAttribute('data-label', d.name);
      b.addEventListener('click', function () { sel = d.id; render(); });
      dots.appendChild(b);
    });
    var byId = function (id) { return MENU.filter(function (m) { return m.id === id; })[0]; };

    function render() {
      var st = analyse();
      var xMax = Math.max(0.18, Math.max.apply(null, MENU.map(function (d) { return d.mix; })) * 1.12);
      var cms = MENU.map(function (d) { return d.cm; });
      var y0 = 2 * cx.rate, y1 = Math.max(20 * cx.rate, Math.ceil(Math.max.apply(null, cms) + 1.5 * cx.rate));
      var X = function (v) { return v / xMax * 100; }, Y = function (v) { return (v - y0) / (y1 - y0) * 100; };
      vEl.style.left = X(st.thr) + '%'; hEl.style.bottom = Y(st.avg) + '%';
      MENU.slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (d) {
        var b = $('.dot[data-id="' + d.id + '"]', dots), x = X(d.mix), y = Y(d.cm);
        b.style.setProperty('--x', x + '%'); b.style.setProperty('--y', y + '%');
        b.setAttribute('data-q', d.q);
        b.classList.toggle('is-sel', d.id === sel);
        b.classList.toggle('is-left', d.lab === 'left');
        b.classList.toggle('is-below', d.lab === 'below');
        b.classList.toggle('is-above', d.lab === 'above');
        b.setAttribute('aria-pressed', String(d.id === sel));
        b.setAttribute('aria-label', d.name + ', ' + Q[d.q][0]);
      });
      var s = byId(sel), changed = Math.abs(s.price - s.base) > 0.001;
      insp.innerHTML =
        '<p class="ins__q"><i class="k k--' + s.q + '"></i><span class="label">' + Q[s.q][0] + '</span></p>' +
        '<h3 class="ins__name">' + s.name + '</h3>' +
        '<dl class="ins__grid">' +
          '<div><dt>Sold</dt><dd>' + s.n + '</dd></div>' +
          '<div><dt>Price</dt><dd>' + money(s.price) + '</dd></div>' +
          '<div><dt>Contribution</dt><dd>' + money(s.cm) + '</dd></div>' +
        '</dl>' +
        '<p class="ins__move"><strong>' + Q[s.q][1] + '</strong> ' + s.note.replace('{two-steps}', money(cx.step * 2)) + '</p>' +
        '<div class="ins__price"><span class="stepper"><button type="button" data-p="-1" aria-label="Lower price by ' + smallStep() + '">−</button><output>' + money(s.price) + '</output><button type="button" data-p="1" aria-label="Raise price by ' + smallStep() + '">+</button></span>' +
        (changed ? '<button type="button" class="ins__reset" data-reset>Reset</button>' : '') + '</div>' +
        '<p class="ins__hint">Sales held constant for illustration. In practice, price moves are tested, then measured.</p>';
    }
    insp.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var s = byId(sel);
      if (b.hasAttribute('data-p')) s.price = clamp(Math.round((s.price + parseFloat(b.getAttribute('data-p')) * cx.step) * 100) / 100, s.cost + cx.step, s.base + 12 * cx.step);
      else if (b.hasAttribute('data-reset')) s.price = s.base;
      var key = b.getAttribute('data-p');
      render();
      var again = key ? $('[data-p="' + key + '"]', insp) : $('[data-p="1"]', insp);
      if (again) again.focus();
    });
    priceMenu(); render();
    window.addEventListener('pihoco:cur', function () { priceMenu(); render(); });
  }

  /* ---------- Menu X-ray (illustrative) ---------- */
  var card = $('[data-x-card]');
  if (card) {
    var X = {
      small: {
        menu: ['fries', 'caesar', 'burrata', 'bao', 'croq'],
        eng:  ['burrata', 'caesar', 'fries', 'croq', 'bao']
      },
      mains: {
        menu: ['burger', 'katsu', 'risotto', 'seabass', 'lamb'],
        eng:  ['lamb', 'burger', 'katsu', 'risotto', 'seabass']
      }
    };
    var D = {
      fries:   { n: 'Truffle Fries', d: 'Parmesan, truffle oil', p: 6.5, q: 'plow', c: 5.10, a: 'Re-portion' },
      caesar:  { n: 'Caesar Salad', d: 'Gem lettuce, anchovy, croutons', p: 11.5, q: 'plow', c: 8.30, a: 'Reprice', np: 12.5 },
      burrata: { n: 'Burrata & Tomato', d: 'Heritage tomato, basil oil', p: 12, q: 'plow', c: 7.40, a: 'Re-cost spec' },
      bao:     { n: 'Pork Belly Bao', d: 'Pickled cucumber, hoisin', p: 10, q: 'dog', c: 5.80, a: 'Retire', r: 1 },
      croq:    { n: 'Short Rib Croquettes', d: 'Horseradish cream', p: 9.5, q: 'dog', c: 5.90, a: 'Move to specials', r: 1 },
      burger:  { n: 'Smash Burger', d: 'Aged beef, cheddar, pickles', p: 14.5, q: 'star', c: 9.40, a: 'Protect' },
      katsu:   { n: 'Chicken Katsu Curry', d: 'Panko chicken, curry sauce, rice', p: 16, q: 'star', c: 10.10, a: 'Protect' },
      risotto: { n: 'Wild Mushroom Risotto', d: 'Aged parmesan, thyme', p: 15.5, q: 'puzzle', c: 12.10, a: 'Feature' },
      seabass: { n: 'Roast Seabass', d: 'Fennel, brown shrimp butter', p: 24, q: 'puzzle', c: 15.80, a: 'Simplify, then feature' },
      lamb:    { n: 'Braised Lamb Shoulder', d: 'Slow-cooked, salsa verde, potatoes', p: 26, q: 'puzzle', c: 16.90, a: 'Feature', rec: 1 }
    };
    var QN = { star: 'Star', plow: 'Plowhorse', puzzle: 'Puzzle', dog: 'Dog' };
    var CAP = {
      menu: 'A typical menu. Dishes in the order they were added; prices set over time.',
      xray: 'The X-ray. Each dish classified by popularity and contribution — the cash it leaves after food cost.',
      eng:  'Engineered. The best earner is boxed and moved up, a price is corrected, two weak dishes leave the menu.'
    };
    Object.keys(X).forEach(function (sec) {
      var ul = $('[data-x-list="' + sec + '"]', card);
      X[sec].menu.forEach(function (id) {
        var d = D[id], li = document.createElement('li');
        li.className = 'dish' + (d.rec ? ' is-rec' : '') + (d.r ? ' is-retired' : '') + (d.np ? ' is-repriced' : '');
        li.setAttribute('data-id', id);
        li.innerHTML = '<p class="dish__rec">Chef’s recommendation</p>' +
          '<div class="dish__row"><span class="dish__name">' + d.n + '</span><span class="dish__lead"></span><span class="dish__price">' +
          (d.np ? '<span class="dish__old"></span>' : '') + '<span class="dish__now"></span></span></div>' +
          '<p class="dish__desc">' + d.d + '</p>' +
          '<p class="dish__tag"><i class="k k--' + d.q + '"></i><b data-t>' + QN[d.q] + '</b><em data-c></em></p>';
        ul.appendChild(li);
      });
    });
    var paintDish = function (li, state) {
      var d = D[li.getAttribute('data-id')];
      $('[data-t]', li).textContent = state === 'eng' ? d.a + (d.np ? ' ' + money(conv(d.np)) : '') : QN[d.q];
      $('.dish__now', li).textContent = num(conv(state === 'eng' && d.np ? d.np : d.p));
      if (d.np) $('.dish__old', li).textContent = num(conv(d.p));
      $('[data-c]', li).textContent = money(convCost(d.c)) + ' contribution';
    };
    var xState = 'menu', userTouched = false;
    $$('.dish', card).forEach(function (li) { paintDish(li, 'menu'); });
    window.addEventListener('pihoco:cur', function () { $$('.dish', card).forEach(function (li) { paintDish(li, xState); }); });
    var setX = function (state) {
      if (state === xState) return;
      var lis = $$('.dish', card), first = {};
      lis.forEach(function (li) { first[li.getAttribute('data-id')] = li.getBoundingClientRect().top; });
      card.setAttribute('data-state', state);
      Object.keys(X).forEach(function (sec) {
        var ul = $('[data-x-list="' + sec + '"]', card);
        (state === 'eng' ? X[sec].eng : X[sec].menu).forEach(function (id) { ul.appendChild($('[data-id="' + id + '"]', ul)); });
      });
      lis.forEach(function (li) {
        var id = li.getAttribute('data-id'), d = D[id];
        paintDish(li, state);
        if (reduce) return;
        var dy = first[id] - li.getBoundingClientRect().top;
        if (dy) {
          li.style.transition = 'none'; li.style.transform = 'translateY(' + dy + 'px)';
          requestAnimationFrame(function () { requestAnimationFrame(function () { li.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1), background-color .6s, opacity .6s'; li.style.transform = ''; }); });
        }
      });
      xState = state;
      $$('[data-x]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-x') === state)); });
      $('[data-x-caption]').textContent = CAP[state];
    };
    $$('[data-x]').forEach(function (b) { b.addEventListener('click', function () { userTouched = true; setX(b.getAttribute('data-x')); }); });
    if ('IntersectionObserver' in window && !reduce) {
      var xo = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        xo.disconnect();
        setTimeout(function () { if (!userTouched) setX('xray'); }, 1800);
        setTimeout(function () { if (!userTouched) setX('eng'); }, 5200);
      }, { threshold: 0.45 });
      xo.observe(card);
    }
  }

  /* ---------- 60-second menu check ---------- */
  var chk = $('[data-check]');
  if (chk) {
    var QS = $$('fieldset', chk), prog = $('[data-check-progress]', chk), res = $('[data-check-result]', chk);
    var OUT = [
      ['Your menu looks well looked after.', 'An audit would fine-tune what’s already working — and give you a baseline to measure against.'],
      ['There’s likely margin hiding in your menu.', 'A few of the classic signs are there. The audit shows exactly where, and what to change first.'],
      ['Your menu is probably costing you.', 'Most of the signs are there. Start with the Menu Profit Boost Audit — it pays to know which dishes to change first.']
    ];
    chk.addEventListener('submit', function (e) { e.preventDefault(); });
    chk.addEventListener('change', function () {
      var answered = QS.filter(function (f) { return $('input:checked', f); });
      prog.textContent = answered.length + ' of 5 answered';
      if (answered.length < 5) { res.hidden = true; return; }
      var no = QS.filter(function (f) { return $('input:checked', f).value === 'no'; }).length;
      var o = no <= 1 ? OUT[0] : no <= 3 ? OUT[1] : OUT[2];
      $('[data-check-score]', res).textContent = no;
      $('[data-check-title]', res).textContent = o[0];
      $('[data-check-text]', res).textContent = o[1];
      res.hidden = false;
      var summary = QS.map(function (f) { return '• ' + $('legend', f).textContent.replace(/^\d+/, '').trim() + ' ' + $('input:checked', f).value.toUpperCase(); }).join('\n');
      var msg = $('#f-msg'); if (msg) msg.value = 'Menu check: ' + no + ' of 5 signs.\n' + summary;
      var FIX = [
        'Re-cost your top ten sellers this month. Supplier prices move faster than menus.',
        'Rank dishes by contribution (price minus food cost), not food-cost %. A 35% dish can leave more cash than a 25% one.',
        'Take the dish that sells least and earns least, and test removing it for four weeks.',
        'Price delivery separately. Commission and packaging can wipe out the margin of a dine-in price.',
        'Find the dish that slows your busiest station at peak, and simplify its spec.'
      ];
      window.PIHOCO_CHECK = {
        score: no, summary: summary,
        answers: QS.map(function (f) { return $('input:checked', f).value; }),
        fixes: QS.map(function (f, i) { return $('input:checked', f).value === 'no' ? FIX[i] : null; }).filter(Boolean)
      };
    });
  }

  /* ---------- Kitchen ticket: order number + time ---------- */
  var tNo = $('[data-ticket-no]'), tTime = $('[data-ticket-time]');
  if (tNo) tNo.textContent = String(1000 + Math.floor(Math.random() * 9000));
  if (tTime) { var tick = function () { var d = new Date(); tTime.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }; tick(); setInterval(tick, 30000); }

  /* ---------- Seasonal accent (opt-in via <html data-season="auto">) ---------- */
  if (document.documentElement.getAttribute('data-season') === 'auto') {
    var m = new Date().getMonth();
    document.documentElement.setAttribute('data-season', m < 2 || m === 11 ? 'winter' : m < 5 ? 'spring' : m < 8 ? 'summer' : 'autumn');
  }

  /* ---------- Site settings (assets/js/config.js) ---------- */
  var CFG = window.PIHOCO || {};
  var EMAIL = CFG.email || 'contact@pihoco.com';
  $$('[data-email-link]').forEach(function (a) { a.href = 'mailto:' + EMAIL; a.textContent = EMAIL; });
  if (CFG.bookingUrl) {
    $$('[data-booking]').forEach(function (el) { el.hidden = false; });
    $$('[data-booking-link]').forEach(function (a) { a.href = CFG.bookingUrl; });
  }

  /* ---------- Currency (founding / list prices) ---------- */
  var PR = CFG.prices || {};
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  function setCur(c) {
    if (!PR[c]) return;
    $$('[data-price]').forEach(function (el) {
      var v = PR[c][el.getAttribute('data-price')]; if (!v) return;
      el.textContent = PR[c].sym + fmt(el.hasAttribute('data-list') ? v[1] : v[0]) + (el.getAttribute('data-unit') || '');
    });
    $$('[data-cur]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cur') === c)); });
    try { localStorage.setItem('pihoco-cur', c); } catch (e) {}
    cx = FX[c] || FX.USD;
    $$('[data-cur-small]').forEach(function (el) { el.textContent = smallStep(); });
    $$('[data-country]').forEach(function (sel) { sel.value = c; });
    window.dispatchEvent(new CustomEvent('pihoco:cur', { detail: c }));
  }
  var cur = null;
  try { cur = localStorage.getItem('pihoco-cur'); } catch (e) {}
  if (!cur) {
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    cur = /Dubai|Muscat/.test(tz) ? 'AED' : /London|Belfast|Guernsey|Jersey|Isle_of_Man/.test(tz) ? 'GBP' : /Singapore/.test(tz) ? 'SGD' : 'USD';
  }
  setCur(cur);
  $$('[data-cur]').forEach(function (b) { b.addEventListener('click', function () { setCur(b.getAttribute('data-cur')); }); });
  $$('[data-country]').forEach(function (sel) { sel.addEventListener('change', function () { setCur(sel.value); }); });

  /* Buttons that pre-select what the visitor wants in the enquiry form */
  $$('[data-interest]').forEach(function (a) {
    a.addEventListener('click', function () { var sel = $('#f-int'); if (sel) sel.value = a.getAttribute('data-interest'); });
  });

  /* ---------- Sending leads ----------
     With CFG.endpoint (Google Apps Script web app): POST JSON as text/plain (no CORS preflight).
     The script stores the lead in a Google Sheet, saves any menu file to Drive and sends the auto-reply.
     Without an endpoint: fall back to the visitor's email app. */
  var utm = {};
  location.search.replace(/[?&](utm_[a-z]+)=([^&]*)/g, function (_, k, v) { utm[k] = decodeURIComponent(v); });
  var isEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  function sendLead(payload) {
    payload.page = location.pathname; payload.referrer = document.referrer || ''; payload.utm = utm;
    payload.currency = (function () { try { return localStorage.getItem('pihoco-cur') || ''; } catch (e) { return ''; } })();
    if (CFG.web3formsKey) return sendWeb3(payload);
    if (!CFG.endpoint) return Promise.reject('no-endpoint');
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || 'failed'); return j; });
  }
  /* Web3Forms (web3forms.com): emails each submission to the address the access key was made for. */
  var LABEL = { scorecard: 'Free scorecard request', enquiry: 'Enquiry', check: '60-second check result' };
  function sendWeb3(d) {
    var fd = new FormData();
    fd.append('access_key', CFG.web3formsKey);
    fd.append('subject', '[PIHOCO] ' + LABEL[d.type] + (d.business ? ' — ' + d.business : ''));
    fd.append('from_name', 'pihoco.com');
    var rows = [['Type', LABEL[d.type]], ['Name', d.name], ['Business', d.business], ['Venue', d.venue], ['City', d.city],
      ['Interested in', d.interest], ['Menu link', d.menuLink], ['Message', d.message],
      ['Check score', d.score === undefined ? '' : d.score + ' of 5'], ['Fixes sent', (d.fixes || []).join(' | ')],
      ['Currency shown', d.currency], ['Page', d.page], ['Came from', d.referrer], ['Campaign', Object.keys(d.utm || {}).map(function (k) { return k + '=' + d.utm[k]; }).join(', ')]];
    rows.forEach(function (r) { if (r[1] !== undefined && r[1] !== '') fd.append(r[0], String(r[1])); });
    if (d.email) fd.append('email', d.email); // Web3Forms uses this as reply-to
    if (d._file && CFG.allowUpload) fd.append('attachment', d._file);
    return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.success) throw new Error((j && j.message) || 'failed'); return j; });
  }
  function mailFallback(subject, lines) {
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }
  function readFile(file) {
    return new Promise(function (ok, no) {
      if (!file) return ok(null);
      if (file.size > 8 * 1024 * 1024) return no('too-big');
      var r = new FileReader();
      r.onload = function () { ok({ name: file.name, type: file.type || 'application/octet-stream', data: String(r.result).split(',')[1] }); };
      r.onerror = function () { no('read'); };
      r.readAsDataURL(file);
    });
  }

  /* Upload only when the form service accepts files */
  var uploadsOn = CFG.web3formsKey ? !!CFG.allowUpload : true;
  if (!uploadsOn) $$('.file').forEach(function (el) { el.hidden = true; });
  $$('[data-upload-note]').forEach(function (el) { el.hidden = uploadsOn; });
  /* File picker label */
  $$('[data-file]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0], wrap = inp.closest('.file'), lab = $('[data-file-label]', wrap);
      wrap.classList.toggle('has-file', !!f);
      lab.textContent = f ? f.name : 'Upload the menu';
    });
  });

  /* ---------- Lead forms: scorecard + enquiry ---------- */
  $$('[data-lead-form]').forEach(function (form) {
    var type = form.getAttribute('data-lead-form');
    var status = $('[data-form-status]', form), def = status.textContent, btn = $('button[type="submit"]', form);
    var say = function (cls, txt) { status.className = 'form__note' + (cls ? ' ' + cls : ''); status.textContent = txt; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', form).forEach(function (f) {
        var v = f.value.trim(), no = !v || (f.type === 'email' && !isEmail(v));
        f.setAttribute('aria-invalid', String(no)); if (no && !bad) bad = f;
      });
      if (bad) { say('is-error', 'Please add your name, a valid email and your business.'); bad.focus(); return; }
      var d = {}; new FormData(form).forEach(function (v, k) { if (typeof v === 'string') d[k] = v.trim(); });
      if (d.website) return; // honeypot
      var fileInput = $('[data-file]', form), file = fileInput && fileInput.files && fileInput.files[0];
      if (type === 'scorecard' && uploadsOn && !file && !d.menuLink) { say('is-error', 'Add a link to your menu or upload it.'); $('#s-link').focus(); return; }

      btn.disabled = true; say('', 'Sending…');
      readFile(file).then(function (f) {
        var payload = Object.assign({ type: type }, d); delete payload.website;
        if (f) payload.file = f;
        if (file) payload._file = file;
        if (CFG.web3formsKey) delete payload.file;
        return sendLead(payload);
      }).then(function () {
        form.reset(); if (fileInput) fileInput.dispatchEvent(new Event('change'));
        say('is-ok', type === 'scorecard'
          ? (d.menuLink || file ? 'Thank you — your menu is with us. Your scorecard follows by email within two working days.' : 'Thank you — we’ll email you shortly. Reply with a photo or PDF of the menu and your scorecard follows within two working days.')
          : 'Thank you — we’ve received your enquiry and will reply within one working day.');
      }).catch(function (err) {
        if (err === 'too-big') { say('is-error', 'That file is over 8 MB. Please send a link or a smaller file.'); return; }
        if (err === 'no-endpoint') {
          if (type === 'scorecard') {
            mailFallback('Free Menu Scorecard — ' + d.business, ['Name: ' + d.name, 'Email: ' + d.email, 'Business: ' + d.business, 'Type: ' + d.venue, 'City: ' + d.city, 'Menu link: ' + (d.menuLink || '—'), '', file ? '(Please attach your menu file to this email: ' + file.name + ')' : '']);
          } else {
            mailFallback(d.interest + ' — ' + d.business, ['Name: ' + d.name, 'Email: ' + d.email, 'Business: ' + d.business, 'City: ' + (d.city || ''), 'Interested in: ' + d.interest, '', d.message || '']);
          }
          say('is-ok', 'Your email app should open now. If not, write to ' + EMAIL + '.');
          return;
        }
        say('is-error', 'Something went wrong. Please email ' + EMAIL + ' and we’ll reply the same day.');
      }).then(function () { btn.disabled = false; setTimeout(function () { if (status.classList.contains('is-ok')) say('', def); }, 15000); });
    });
  });

  /* ---------- 60-second check: email the fixes ---------- */
  var cSend = $('[data-check-send]');
  if (cSend && chk) {
    var cMail = $('[data-check-email]'), cStat = $('[data-check-status]'), cBox = $('[data-check-capture]');
    var cSay = function (cls, t) { cStat.className = 'capture__note' + (cls ? ' ' + cls : ''); cStat.textContent = t; };
    var go = function () {
      var v = cMail.value.trim();
      if (!isEmail(v)) { cMail.setAttribute('aria-invalid', 'true'); cSay('is-error', 'Please enter a valid email.'); cMail.focus(); return; }
      cMail.setAttribute('aria-invalid', 'false');
      var r = window.PIHOCO_CHECK || {};
      cSend.disabled = true; cSay('', 'Sending…');
      sendLead({ type: 'check', email: v, score: r.score, answers: r.answers, fixes: r.fixes })
        .then(function () { cBox.classList.add('is-done'); cSay('is-ok', 'Thanks. We’ll email your result and fixes to ' + v + ' shortly.'); })
        .catch(function (err) {
          if (err === 'no-endpoint') { mailFallback('My 60-second menu check: ' + r.score + ' of 5 signs', ['Please send me the fixes for my answers.', '', r.summary || '', '', 'Email: ' + v]); cSay('is-ok', 'Your email app should open now.'); }
          else cSay('is-error', 'Something went wrong. Please try again.');
        })
        .then(function () { cSend.disabled = false; });
    };
    cSend.addEventListener('click', go);
    cMail.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  }

  /* ---------- Cafés: cup check calculator ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    var num = function (id) { var v = parseFloat($('#' + id).value); return isNaN(v) ? 0 : v; };
    var out = function (k) { return $('[data-k="' + k + '"]', calc); };
    var n2 = function (v) { return (v < 0 ? '−' : '') + fmt(Math.abs(v).toFixed(2)).replace(/(\.\d+),/g, '$1'); };
    var n0 = function (v) { return (v < 0 ? '−' : '') + fmt(Math.round(Math.abs(v))); };
    var runCalc = function () {
      var price = num('k-price'), tax = num('k-tax'), cups = num('k-cups');
      var net = price / (1 + tax / 100), cost = num('k-coffee') + num('k-milk') + num('k-pack');
      var cm = net - cost, pct = net > 0 ? cost / net * 100 : 0, upNet = 1 / (1 + tax / 100);
      out('cm').textContent = n2(cm);
      out('pct').textContent = net > 0 ? pct.toFixed(0) + '%' : '—';
      out('week').textContent = n0(cm * cups);
      out('up').textContent = '+' + n0(upNet * cups);
      out('cm').classList.toggle('is-low', cm <= 0);
      out('say').textContent = cm <= 0
        ? 'This drink loses money before rent and wages. Worth fixing first.'
        : 'That is ' + n0(cm * cups * 52) + ' a year from one drink, before rent and wages. A small change to price, portion or packaging moves it every week — the audit does this for every item on the board.';
    };
    calc.addEventListener('input', runCalc);
    runCalc();
  }

  var yr = $('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();
})();

