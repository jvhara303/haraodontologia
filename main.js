(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame.bind(window);

  // entrada do hero
  raf(function () { raf(function () { root.classList.add('is-ready'); }); });

  // header: encolhe ao rolar, esconde ao descer, volta ao subir
  var nav = document.getElementById('nav'), toggle = document.getElementById('toggle');
  var lastY = window.scrollY;
  function onNav() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > 600 && y > lastY + 4);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  }
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('.nav__links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });

  // manifesto: palavra por palavra
  var mt = document.querySelector('[data-words]'), words = [];
  if (mt) {
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) split(n);
      });
    })(mt);
  }

  // reveals com escalonamento por grupo
  var items = document.querySelectorAll('.reveal, .clip');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement, i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i * 0.09, 0.45) + 's');
    groups.set(p, i + 1);
  });
  // fail-safe: threshold 0, revela o que já está na tela ou acima dela, checagem no scroll e timeout final
  function show(el) { el.classList.add('is-in'); }
  function sweep() {
    var vh = window.innerHeight;
    items.forEach(function (el) { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.98) show(el); });
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) { io.observe(el); });
    sweep();
    window.addEventListener('load', sweep);
    setTimeout(sweep, 1500);
    setTimeout(function () { items.forEach(show); }, 6000);
  } else items.forEach(show);

  // especialidades: troca de imagem
  var rows = document.querySelectorAll('.spec__row'), shots = document.querySelectorAll('.spec__viewer img');
  function activate(k) {
    rows.forEach(function (r) { r.classList.toggle('is-active', r.dataset.k === k); });
    shots.forEach(function (im) { im.classList.toggle('is-on', im.dataset.k === k); });
  }
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { activate(r.dataset.k); }); });
  if (rows.length && window.matchMedia('(min-width: 1000px)').matches) activate('0');

  // botões magnéticos
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.18) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3) + 'px');
      });
      b.addEventListener('mouseleave', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  // loop de rolagem: parallax, manifesto, timeline
  var heroImg = document.querySelector('[data-parallax]');
  var tl = document.getElementById('timeline'), fill = document.getElementById('tlFill');
  var tls = tl ? tl.querySelectorAll('.tl') : [];
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    onNav();
    if (typeof sweep === 'function') sweep();
    if (reduce) return;
    if (heroImg && y < vh * 1.2) heroImg.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)';
    if (words.length) {
      var r = mt.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var n = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    }
    if (tl) {
      var t = tl.getBoundingClientRect();
      var q = Math.min(1, Math.max(0, (vh * 0.6 - t.top) / t.height));
      fill.parentNode.style.setProperty('--p', q);
      fill.style.transform = 'scaleY(' + q + ')';
      tls.forEach(function (li) { li.classList.toggle('is-lit', li.getBoundingClientRect().top < vh * 0.6); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; raf(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
  if (reduce) words.forEach(function (w) { w.classList.add('on'); });

  // imagem ausente
  document.querySelectorAll('img').forEach(function (img) {
    function miss() { img.style.visibility = 'hidden'; }
    if (img.complete && img.naturalWidth === 0) miss(); else img.addEventListener('error', miss, { once: true });
  });

  var ano = document.getElementById('ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
