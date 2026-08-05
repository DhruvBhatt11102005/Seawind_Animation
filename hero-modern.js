/* ============================================================
   Seawind — Modern Hero: load sequence, stat count-up,
   nav dark-hero toggle, subtle parallax
   ============================================================ */
(function () {
  'use strict';

  var pRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Trigger hero loaded animation after loader exits ──── */
  function activateHero() {
    var hero = document.querySelector('.hm-hero');
    if (!hero) return;
    hero.classList.add('loaded');
    startStatCountUp(hero);
  }

  window.addEventListener('load', function () {
    setTimeout(activateHero, pRM ? 0 : 1400);
  });

  /* ── 2. Stat count-up ────────────────────────────────────── */
  function startStatCountUp(hero) {
    hero.querySelectorAll('.hm-stat-num[data-target]').forEach(function (el) {
      var target = parseInt(el.dataset.target, 10);
      var suffix = el.dataset.suffix || '';
      if (pRM) { el.textContent = target + suffix; return; }
      var dur = 2200;
      var startTime = null;
      function tick(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.floor(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
    });
  }

  /* ── 3. Nav: dark when over hero, light when past it ──────── */
  var nav = document.getElementById('nav');
  var hero = document.querySelector('.hm-hero');

  if (nav && hero) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        nav.classList.toggle('over-dark-hero', entry.isIntersecting);
      });
    }, { threshold: 0.01 });
    heroObserver.observe(hero);
  }

  /* ── 4. Subtle mouse parallax on headline ────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (pRM) return;
    var heroEl = document.querySelector('.hm-hero');
    var headline = document.querySelector('.hm-headline');
    if (!heroEl || !headline) return;

    var tx = 0, ty = 0, cx = 0, cy = 0;
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) / r.width;
      ty = (e.clientY - r.top - r.height / 2) / r.height;
    });
    heroEl.addEventListener('mouseleave', function () { tx = 0; ty = 0; });

    (function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      headline.style.transform = 'translate(' + (cx * 14) + 'px,' + (cy * 8) + 'px)';
      requestAnimationFrame(loop);
    })();
  });

  /* ── 5. Continue button: smooth scroll to next section ──── */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.hm-continue-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.querySelector('.trust-marquee') ||
                 document.querySelector('.hm-hero + *');
      if (!next) return;
      if (window._lenisInstance) {
        window._lenisInstance.scrollTo(next, { offset: -80, duration: 1.4 });
      } else {
        next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
