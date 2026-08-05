/* ============================================================
   Seawind Solution — Premium Scroll-Driven Animations (2025)
   Dependencies: Lenis (CDN), GSAP + ScrollTrigger (already loaded)
   ============================================================ */
(function () {
  'use strict';

  var pRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 768;
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  /* ── 1. LENIS SMOOTH SCROLL INIT ─────────────────────────── */
  var lenis = null;
  if (!pRM && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    /* Expose globally so nav links + other code can call scrollTo */
    window._lenisInstance = lenis;

    /* Use gsap.ticker as the RAF driver when GSAP is available,
       otherwise fall back to a plain rAF loop — never both */
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
      }
    } else {
      (function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      })(0);
    }
  }

  /* ── 2. CUSTOM CURSOR ────────────────────────────────────── */
  if (!isTouch) {
    var dot = document.createElement('div');
    dot.className = 'sw-cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'sw-cursor-ring';
    var label = document.createElement('div');
    label.className = 'sw-cursor-label';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.appendChild(label);

    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function(e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
    });

    (function animRing() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry - 18) + 'px)';
      label.style.transform = 'translate(' + (rx - 18) + 'px,' + (ry - 18) + 'px)';
      requestAnimationFrame(animRing);
    })();

    document.querySelectorAll('a:not(.btn-primary):not(.btn-outline):not(.btn-ghost)').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        dot.classList.add('is-button'); ring.classList.add('is-link');
      });
      el.addEventListener('mouseleave', function() {
        dot.classList.remove('is-button'); ring.classList.remove('is-link');
      });
    });
    document.querySelectorAll('.btn-primary,.btn-outline,.btn-ghost,.btn-nav').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        dot.classList.add('is-button'); ring.classList.add('is-button');
      });
      el.addEventListener('mouseleave', function() {
        dot.classList.remove('is-button'); ring.classList.remove('is-button');
      });
    });
    document.querySelectorAll('.portfolio-card,.service-card').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        dot.classList.add('is-view'); ring.classList.add('is-view');
        label.textContent = 'VIEW'; label.classList.add('is-visible');
      });
      el.addEventListener('mouseleave', function() {
        dot.classList.remove('is-view'); ring.classList.remove('is-view');
        label.classList.remove('is-visible');
      });
    });
  }

  /* ── 3. SCROLL PROGRESS (reinforce existing) ─────────────── */
  var scrollBar = document.getElementById('scrollProgress');
  if (scrollBar) {
    window.addEventListener('scroll', function() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ── 4. HERO STAT COUNT-UP (handled by hero-modern.js) ──── */
  /* The new hero's count-up is driven by hero-modern.js on load */

  /* ── 5. HERO SCROLL-OUT — handled by CSS + Lenis ───────────── */
  /* The .hm-hero uses CSS translate on scroll via hero-modern.css */

  /* ── 6. TRUSTED-BY MARQUEE: PAUSE ON HOVER ────────────────── */
  var trustTrack = document.querySelector('.trust-track');
  var trustLogos = document.querySelector('.trust-logos');
  if (trustTrack && trustLogos) {
    trustTrack.addEventListener('mouseenter', function() {
      trustLogos.style.animationPlayState = 'paused';
    });
    trustTrack.addEventListener('mouseleave', function() {
      trustLogos.style.animationPlayState = 'running';
    });
  }

  /* ── 7. SERVICES GRID: STAGGERED CLIP-PATH REVEAL ───────────── */
  var serviceCards = document.querySelectorAll('.service-card');
  if (!pRM && serviceCards.length) {
    var serviceObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sw-revealed');
          serviceObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    serviceCards.forEach(function(card, i) {
      card.style.transitionDelay = (i % 3) * 0.1 + 's';
      serviceObs.observe(card);
    });
  } else {
    serviceCards.forEach(function(card) { card.classList.add('sw-revealed'); });
  }

  /* ── 8. WHY-US STATS: handled by animations.js one-time trigger ── */
  /* Disabled here to prevent scroll-reversible counting */

  /* ── 9. AWARDS: ALTERNATING SLIDE DIRECTION REVEAL ─────────── */
  var awardCards = document.querySelectorAll('.award-card');
  awardCards.forEach(function(card, i) {
    card.classList.add(i % 2 === 0 ? 'sw-slide-left' : 'sw-slide-right');
    card.style.transitionDelay = (i * 0.1) + 's';
  });
  if (awardCards.length) {
    var awardObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          awardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    awardCards.forEach(function(card) { awardObs.observe(card); });
  }

  /* ── 10. PRICING: FEATURED CARD GLOW ENTRANCE ────────────── */
  var featuredCards = document.querySelectorAll('.plan-card.featured, .pricing-card.featured');
  if (featuredCards.length) {
    var featObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.classList.add('sw-entrance-done');
          }, 400);
          featObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    featuredCards.forEach(function(el) { featObs.observe(el); });
  }

  /* ── 11. PORTFOLIO: HORIZONTAL SCROLL GALLERY ──────────────── */
  var portfolioGrid = document.querySelector('.portfolio-grid');
  if (portfolioGrid && !isMobile) {
    portfolioGrid.classList.add('sw-portfolio-hscroll');

    var track = document.createElement('div');
    track.className = 'sw-portfolio-track';
    track.setAttribute('data-lenis-prevent', '');
    /* Move existing portfolio cards into the track */
    var existingCards = Array.from(portfolioGrid.querySelectorAll('.portfolio-card'));
    existingCards.forEach(function(child) {
      track.appendChild(child);
    });
    portfolioGrid.appendChild(track);

    /* Insert progress controls BEFORE the existing "View Full Portfolio" div */
    var viewAllDiv = portfolioGrid.parentElement &&
      portfolioGrid.parentElement.querySelector('[style*="text-align"]');
    var progressWrap = document.createElement('div');
    progressWrap.className = 'sw-portfolio-progress';
    progressWrap.innerHTML =
      '<div class="sw-portfolio-arrows">' +
        '<button class="sw-portfolio-arrow" id="pPortPrev" aria-label="Previous project">‹</button>' +
      '</div>' +
      '<div class="sw-portfolio-bar-track"><div class="sw-portfolio-bar-fill" id="pPortFill"></div></div>' +
      '<div class="sw-portfolio-arrows">' +
        '<button class="sw-portfolio-arrow" id="pPortNext" aria-label="Next project">›</button>' +
      '</div>';

    if (viewAllDiv) {
      portfolioGrid.parentElement.insertBefore(progressWrap, viewAllDiv);
    } else {
      portfolioGrid.parentElement.appendChild(progressWrap);
    }

    var cardW = 360 + 28;
    var scrollPos = 0;
    var maxScroll = 0;

    function recalcMax() {
      maxScroll = Math.max(0, track.scrollWidth - portfolioGrid.offsetWidth);
    }

    window.addEventListener('load', recalcMax);
    window.addEventListener('resize', recalcMax);

    function updatePortFill() {
      var fill = document.getElementById('pPortFill');
      if (!fill) return;
      fill.style.width = (maxScroll > 0 ? Math.min(100, (scrollPos / maxScroll) * 100) : 33) + '%';
    }

    function scrollPort(dir) {
      recalcMax();
      scrollPos = Math.max(0, Math.min(maxScroll, scrollPos + dir * cardW));
      if (typeof gsap !== 'undefined') {
        gsap.to(track, { x: -scrollPos, duration: 0.7, ease: 'power3.out' });
      } else {
        track.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
        track.style.transform = 'translateX(' + (-scrollPos) + 'px)';
      }
      updatePortFill();
    }

    var prevBtn = document.getElementById('pPortPrev');
    var nextBtn = document.getElementById('pPortNext');
    if (prevBtn) prevBtn.addEventListener('click', function() { scrollPort(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { scrollPort(1); });

    /* Drag-to-scroll */
    var dragStart = null;
    var dragStartPos = 0;
    track.addEventListener('mousedown', function(e) {
      dragStart = e.clientX;
      dragStartPos = scrollPos;
      track.style.transition = 'none';
    });
    document.addEventListener('mousemove', function(e) {
      if (dragStart === null) return;
      var delta = dragStart - e.clientX;
      scrollPos = Math.max(0, Math.min(maxScroll, dragStartPos + delta));
      track.style.transform = 'translateX(' + (-scrollPos) + 'px)';
      updatePortFill();
    });
    document.addEventListener('mouseup', function() {
      if (dragStart !== null) {
        dragStart = null;
        track.style.transition = '';
      }
    });

    /* Clip-path reveal for cards as they become visible */
    existingCards.forEach(function(card) {
      var img = card.querySelector('.portfolio-card-image img');
      if (img) {
        img.style.clipPath = 'inset(0 100% 0 0)';
        img.style.transition = 'clip-path 0.9s var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1))';
      }
    });
    /* Reveal first card immediately */
    setTimeout(function() {
      existingCards.forEach(function(card, i) {
        var img = card.querySelector('.portfolio-card-image img');
        if (img) {
          setTimeout(function() { img.style.clipPath = 'inset(0 0% 0 0)'; }, i * 150);
        }
      });
    }, 300);
  }

  /* ── 12. FAQ: SMOOTH HEIGHT ACCORDION ─────────────────────── */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    var btn = item.querySelector('.faq-question');
    var icon = item.querySelector('.faq-icon');
    if (!btn) return;

    btn.addEventListener('click', function() {
      var isOpen = item.classList.contains('open');

      /* Close all others */
      faqItems.forEach(function(other) {
        if (other !== item) {
          other.classList.remove('open');
          var oi = other.querySelector('.faq-icon');
          if (oi) oi.style.transform = 'rotate(0deg)';
        }
      });

      /* Toggle current */
      item.classList.toggle('open', !isOpen);
      if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(45deg)';
    });

    if (icon) {
      icon.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1)';
    }
  });

  /* ── 13. CTA SECTION: BIG TYPE REVEAL ─────────────────────── */
  var ctaH2 = document.querySelector('.cta-section .cta-inner h2');
  if (ctaH2 && !pRM) {
    var originalHTML = ctaH2.innerHTML;
    var words = ctaH2.textContent.split(/\s+/);
    ctaH2.classList.add('sw-cta-h2');
    ctaH2.innerHTML = '';
    originalHTML.split(/(<[^>]+>|\s+)/).forEach(function(part) {
      if (!part.trim()) { ctaH2.innerHTML += part; return; }
      if (part.startsWith('<')) { ctaH2.innerHTML += part; return; }
      var wordEl = document.createElement('span');
      wordEl.className = 'sw-cta-word';
      var inner = document.createElement('span');
      inner.className = 'sw-cta-word-inner';
      inner.innerHTML = part;
      wordEl.appendChild(inner);
      ctaH2.appendChild(wordEl);
    });

    var ctaObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.sw-cta-word-inner').forEach(function(w, i) {
            w.style.transitionDelay = (i * 0.06) + 's';
          });
          entry.target.classList.add('sw-cta-revealed');
          ctaObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    ctaObs.observe(ctaH2);
  }

  /* ── 14. FOOTER: STAGGERED FADE IN ────────────────────────── */
  var footerEls = document.querySelectorAll('.footer .footer-brand, .footer .footer-col');
  if (footerEls.length) {
    footerEls.forEach(function(el, i) {
      el.style.transitionDelay = (i * 0.12) + 's';
    });
    var footObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          footObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    footerEls.forEach(function(el) { footObs.observe(el); });
  }

  /* ── 15. SECTION-HEADER CLIP REVEAL ──────────────────────── */
  var sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(function(h) {
    if (!pRM) h.classList.add('sw-fade-up');
  });
  var headerObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        entry.target.classList.add('visible'); /* also trigger .reveal */
        headerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
  document.querySelectorAll('.sw-fade-up, .section-header').forEach(function(el) {
    headerObs.observe(el);
  });

  /* ── 16. SECTION TAG + H2: UNDERLINE DRAW ────────────────── */
  var sectionObsUnder = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sectionObsUnder.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
  document.querySelectorAll('.section-header').forEach(function(el) { sectionObsUnder.observe(el); });

  /* ── 17. BLOG CARDS: STAGGER FADE ─────────────────────────── */
  var blogCards = document.querySelectorAll('.blog-card');
  if (!pRM && blogCards.length) {
    blogCards.forEach(function(card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = 'opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo)';
      card.style.transitionDelay = (i * 0.12) + 's';
    });
    var blogObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          blogObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    blogCards.forEach(function(card) { blogObs.observe(card); });
  }

  /* ── 18. MAGNETIC BUTTONS (enhanced, namespaced to avoid double-apply) ── */
  if (!isTouch && !pRM && !window._swMagneticDone) {
    window._swMagneticDone = true;
    document.querySelectorAll('.btn-primary,.btn-outline,.btn-ghost,.btn-nav').forEach(function(btn) {
      btn.setAttribute('data-sw-magnetic', '1');
      btn.addEventListener('mousemove', function(e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.22;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });
  }

  /* ── 19. TESTIMONIALS MARQUEE: PAUSE ON HOVER ───────────── */
  var testTrack = document.getElementById('marqueeTrack');
  if (testTrack) {
    var testWrap = testTrack.closest('.marquee-testimonials');
    if (testWrap) {
      testWrap.addEventListener('mouseenter', function() {
        testTrack.style.animationPlayState = 'paused';
      });
      testWrap.addEventListener('mouseleave', function() {
        testTrack.style.animationPlayState = 'running';
      });
    }
  }

  /* ── 20. SCROLL CUE FADE OUT — handled by hero-3d.js GSAP ── */
  /* (hero-3d.js already fades .hero3d-scrollcue via ScrollTrigger scrub) */

})(); /* end IIFE */

/* ============================================================
   PART 2 — GSAP-POWERED SECTION ANIMATIONS
   Runs after DOM ready, waits for GSAP to be available
   ============================================================ */
(function () {
  'use strict';

  var pRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 768;

  /* Wait for both DOM + GSAP before wiring anything */
  function waitForGSAP(cb) {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      cb();
    } else {
      setTimeout(function () { waitForGSAP(cb); }, 80);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    waitForGSAP(initAll);
  });

  function initAll() {
    if (!pRM) {
      initAiWorkflowPin();
      initServicesStagger();
      initTechStackReveal();
      initTestimonialsReveal();
      initPortfolioReveal();
    }
    initCursorBodyClass();
    initNavSmoothScroll();
    initResizeDebounce();
  }

  /* ── A. AI WORKFLOW: SCROLL-PINNED STEP PROGRESSION ─────── */
  function initAiWorkflowPin() {
    if (isMobile) return; /* mobile: normal vertical stack */

    var section = document.querySelector('.ai-workflow');
    var cards = section && section.querySelectorAll('.orbital-card');
    var progressLine = section && section.querySelector('.workflow-line span');
    if (!section || !cards.length) return;

    /* We DON'T use full pinning because OrbitalCarousel already handles
       its own pinnedScroll logic. Instead we enhance with a scroll-driven
       progress line and card entrance animations as the section scrolls in. */
    gsap.from(cards, {
      y: 40,
      opacity: 0,
      scale: 0.94,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      }
    });

    /* Animate the workflow progress line on scroll */
    if (progressLine) {
      gsap.fromTo(progressLine,
        { width: '0%' },
        {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 1,
          }
        }
      );
    }
  }

  /* ── B. SERVICES GRID: ROW-BY-ROW STAGGER ───────────────── */
  function initServicesStagger() {
    var gallery = document.getElementById('servicesGallery');
    if (!gallery) return;

    /* Visible cards (active tab) get staggered on first reveal */
    gsap.from(gallery.querySelectorAll('.gallery-item:not([style*="display: none"])'), {
      y: 36,
      opacity: 0,
      stagger: { each: 0.08, grid: 'auto', from: 'start' },
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: gallery,
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  }

  /* ── C. TECH STACK: ICON STAGGER ON TAB SWITCH ──────────── */
  function initTechStackReveal() {
    var techSection = document.querySelector('.tech');
    if (!techSection) return;

    gsap.from(techSection.querySelectorAll('.tech-card'), {
      scale: 0.85,
      opacity: 0,
      stagger: 0.05,
      duration: 0.55,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: techSection,
        start: 'top 75%',
        toggleActions: 'play none none none',
      }
    });

    /* Re-animate on tab switch */
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panelId = 'tab-' + btn.dataset.tab;
        var panel = document.getElementById(panelId);
        if (!panel) return;
        var cards = panel.querySelectorAll('.tech-card');
        gsap.fromTo(cards,
          { scale: 0.85, opacity: 0, y: 14 },
          { scale: 1, opacity: 1, y: 0, stagger: 0.04, duration: 0.45, ease: 'back.out(1.4)' }
        );
      });
    });
  }

  /* ── D. TESTIMONIALS: ENTRANCE ──────────────────────────── */
  function initTestimonialsReveal() {
    var section = document.querySelector('.testimonials');
    if (!section) return;

    gsap.from(section.querySelector('.section-header'), {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ── E. PORTFOLIO CARDS: CLIP ON SCROLL (mobile fallback) ── */
  function initPortfolioReveal() {
    var cards = document.querySelectorAll('.portfolio-card');
    if (!cards.length) return;

    gsap.from(cards, {
      y: 50, opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: cards[0].closest('section') || cards[0].parentElement,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ── F. BODY CLASS for custom cursor ──────────────────────── */
  function initCursorBodyClass() {
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) {
      document.body.classList.add('sw-custom-cursor');
    }
  }

  /* ── G. NAV LINKS: smooth scroll via Lenis ────────────────── */
  function initNavSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        if (window._lenisInstance) {
          window._lenisInstance.scrollTo(target, { offset: -80, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── H. DEBOUNCED RESIZE ─────────────────────────────────── */
  function initResizeDebounce() {
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        isMobile = window.innerWidth < 768;
      }, 200);
    });
  }

})();

/* ============================================================
   PART 3 — POLISH: Active Nav, Star Pop, Loader Exit,
             Text marquee, Portfolio "View" hover label update
   ============================================================ */
(function () {
  'use strict';

  var pRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Active nav section highlight ────────────────────────── */
  var navLinks = Array.from(document.querySelectorAll('.nav-links a:not(.btn-nav)'));
  var sections = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      var el = document.getElementById(href.slice(1));
      if (el) sections.push({ link: link, el: el });
    }
  });

  if (sections.length) {
    var activeNavObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('sw-nav-active'); });
          match.link.classList.add('sw-nav-active');
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { activeNavObs.observe(s.el); });
  }

  /* ── Testimonial star pop-in when card enters view ────────── */
  var testCards = document.querySelectorAll('.testimonial-card');
  if (testCards.length) {
    testCards.forEach(function (card) {
      var starsEl = card.querySelector('.stars');
      if (starsEl && starsEl.textContent.trim()) {
        /* Wrap each ★ in a span for individual animation */
        var chars = starsEl.textContent.trim().split('');
        starsEl.innerHTML = chars.map(function (c) {
          return '<span>' + c + '</span>';
        }).join('');
      }
    });
    var starObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('sw-stars-animated');
          starObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    testCards.forEach(function (card) { starObs.observe(card); });
  }

  /* ── Text marquee: pause on hover ───────────────────────────── */
  var textMarqueeWrap = document.querySelector('.marquee-wrap');
  var textMarqueeTrack = document.querySelector('.marquee-track');
  if (textMarqueeWrap && textMarqueeTrack) {
    textMarqueeWrap.addEventListener('mouseenter', function () {
      textMarqueeTrack.style.animationPlayState = 'paused';
    });
    textMarqueeWrap.addEventListener('mouseleave', function () {
      textMarqueeTrack.style.animationPlayState = 'running';
    });
  }

  /* ── Portfolio hover: update cursor label ─────────────────── */
  document.querySelectorAll('.portfolio-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var label = document.querySelector('.sw-cursor-label');
      if (label) { label.textContent = 'VIEW'; }
    });
  });

  /* ── Loader: scale-out with logo fade ────────────────────── */
  var loader = document.getElementById('pageLoader');
  var loaderImg = loader && loader.querySelector('.loader-custom-img');
  if (loader && !pRM) {
    window.addEventListener('load', function () {
      /* Spin down the loader logo before hiding */
      if (loaderImg) {
        setTimeout(function () {
          loaderImg.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease';
          loaderImg.style.transform = 'scale(1.15) rotate(30deg)';
          loaderImg.style.opacity = '0';
        }, 700);
      }
    });
  }

  /* ── Lenis: make href="#X" anchor navigation work ────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      if (window._lenisInstance) {
        e.preventDefault();
        window._lenisInstance.scrollTo(target, { offset: -80, duration: 1.4 });
      }
      /* else: native smooth scroll still works */
    });
  });

})();
