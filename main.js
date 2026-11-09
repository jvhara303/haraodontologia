(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('toggle');

  function onNav() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  var items = document.querySelectorAll('.reveal');
  function show(el) { el.classList.add('is-in'); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.96) show(el);
      });
    });
    setTimeout(function () { items.forEach(show); }, 4000);
  } else {
    items.forEach(show);
  }

  window.addEventListener('scroll', onNav, { passive: true });
  onNav();

  document.querySelectorAll('img').forEach(function (img) {
    function miss() { img.style.visibility = 'hidden'; }
    if (img.complete && img.naturalWidth === 0) miss();
    else img.addEventListener('error', miss, { once: true });
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
