(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('is-ready'); });
  });

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('toggle');
  var main = document.getElementById('conteudo');
  var foot = document.querySelector('.foot');

  function onNav() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (main) main.inert = open;
    if (foot) foot.inert = open;
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
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
    var groups = new Map();
    items.forEach(function (el) {
      var p = el.parentElement;
      var i = groups.get(p) || 0;
      el.style.setProperty('--d', Math.min(i * 0.06, 0.24) + 's');
      groups.set(p, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    function sweep() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.96) show(el);
      });
    }
    requestAnimationFrame(sweep);
    window.addEventListener('load', sweep);
    setTimeout(sweep, 800);
    setTimeout(function () { items.forEach(show); }, 4000);
  } else {
    items.forEach(show);
  }

  window.addEventListener('scroll', onNav, { passive: true });
  onNav();

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.visibility = 'hidden';
    }, { once: true });
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
