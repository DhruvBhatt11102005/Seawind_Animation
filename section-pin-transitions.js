/* ======================================================================
   SECTION PIN TRANSITIONS (v2 — height-aware)
   Fixes: tall sections (grids, testimonials, pricing) no longer get
   position:sticky, so their content can never be clipped/unreachable.
   Only sections that are <= ~1.15x viewport tall are pinned+crossfaded
   like the hero. Everything else gets a lighter fade+rise on scroll.
   ====================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var FADE_VH = 45;          // vh distance for pin-scene crossfade band
  var PIN_MAX_RATIO = 1.15;  // a section can be at most 1.15x viewport tall to qualify for pinning

  var sections = Array.prototype.slice.call(document.querySelectorAll('section.section'));
  if (sections.length < 2) return;

  var pinScenes = [];
  var fadeScenes = [];

  function classify() {
    var vh = window.innerHeight;
    sections.forEach(function (sec) {
      var h = sec.getBoundingClientRect().height || sec.offsetHeight;
      var shouldPin = h <= vh * PIN_MAX_RATIO;

      if (shouldPin) {
        sec.classList.add('pin-scene');
        sec.classList.remove('fade-scene');
      } else {
        sec.classList.add('fade-scene');
        sec.classList.remove('pin-scene');
        sec.style.zIndex = '';
      }
    });

    pinScenes = sections.filter(function (s) { return s.classList.contains('pin-scene'); });
    fadeScenes = sections.filter(function (s) { return s.classList.contains('fade-scene'); });

    // z-index only matters among pinned scenes, ordered by DOM position
    pinScenes.forEach(function (sec) {
      sec.style.zIndex = sections.indexOf(sec) + 1;
    });
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var fadePx = vh * (FADE_VH / 100);

    // Pinned scenes: full crossfade behavior (only ever short sections now)
    pinScenes.forEach(function (sec) {
      var idx = sections.indexOf(sec);
      var next = sections[idx + 1];
      var rect = sec.getBoundingClientRect();

      var enter = clamp(1 - rect.top / fadePx, 0, 1);
      var exit = 0;
      if (next) {
        var nextTop = next.getBoundingClientRect().top;
        exit = clamp(1 - nextTop / fadePx, 0, 1);
      }

      var opacity = enter * (1 - exit * 0.92);
      var riseIn = (1 - enter) * 40;
      var recede = exit * -26;
      var scale = 1 - exit * 0.035;
      var blur = exit * 6;

      sec.style.opacity = opacity;
      sec.style.transform = 'translateY(' + (riseIn + recede) + 'px) scale(' + scale + ')';
      sec.style.filter = blur > 0.05 ? 'blur(' + blur + 'px)' : 'none';
      sec.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';
    });

    // Fade scenes: simple, non-pinned reveal — never clips, never blocks scroll
    fadeScenes.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      var enter = clamp(1 - rect.top / fadePx, 0, 1);
      // fade out only near the very bottom of the doc-flow section itself,
      // based on how much of it has already scrolled past the top
      var exitRaw = clamp(-rect.top / (rect.height || vh), 0, 1);
      var exit = clamp((exitRaw - 0.82) / 0.18, 0, 1); // only kicks in on final 18% of its own scroll

      var opacity = enter * (1 - exit * 0.85);
      var riseIn = (1 - enter) * 32;

      sec.style.opacity = opacity;
      sec.style.transform = 'translateY(' + riseIn + 'px)';
      sec.style.filter = 'none';
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function onResize() {
    classify();
    update();
  }

  classify();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
})();
