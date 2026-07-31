// Creative animations — Seawind Solution
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Cursor ring
  const ring = document.getElementById("cursorRing");
  let rx = 0, ry = 0, rgx = 0, rgy = 0;
  let lastSpeed = 0;

  document.addEventListener("mousemove", e => {
    rx = e.clientX;
    ry = e.clientY;
  });

  function moveRing() {
    if (ring) {
      const dx = rx - rgx;
      const dy = ry - rgy;
      rgx += dx * 0.22;
      rgy += dy * 0.22;
      lastSpeed = Math.hypot(dx, dy);

      const speedScale = 1 + Math.min(lastSpeed / 180, 0.14);
      ring.style.left = rgx + "px";
      ring.style.top = rgy + "px";
      ring.style.transform = `translate(-50%, -50%) scale(${speedScale})`;
    }
    requestAnimationFrame(moveRing);
  }
  moveRing();

  document.querySelectorAll("a, button, .tilt-card, .service-card").forEach(el => {
    el.addEventListener("mouseenter", () => ring?.classList.add("hovering"));
    el.addEventListener("mouseleave", () => ring?.classList.remove("hovering"));
  });

  // Magnetic buttons
  document.querySelectorAll(".btn-primary, .btn-nav, .btn-outline").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.2;
      const y = (e.clientY - r.top - r.height / 2) * 0.2;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });

  // Magnetic links and social icons
  document.querySelectorAll(".nav-links a:not(.btn-nav), .social-links a").forEach(link => {
    link.addEventListener("mousemove", e => {
      const r = link.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      link.style.transform = `translate(${x}px, ${y}px)`;
    });
    link.addEventListener("mouseleave", () => {
      link.style.transform = "";
    });
  });



  // Split heading reveal (recursive, supports spans, gradient-text, etc.)
  function splitTextElement(element, state = { index: 0 }) {
    if (element.classList.contains("gradient-text")) {
      element.classList.add("split-char");
      element.style.setProperty("--i", state.index++);
      element.style.display = "inline-block";
      return;
    }

    const nodes = Array.from(element.childNodes);
    element.innerHTML = "";
    
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const fragment = document.createDocumentFragment();
        
        const words = text.split(" ");
        words.forEach((word, wi) => {
          if (word.length > 0) {
            const wordSpan = document.createElement("span");
            wordSpan.className = "split-line";
            wordSpan.style.display = "inline-block";
            
            word.split("").forEach(ch => {
              const chSpan = document.createElement("span");
              chSpan.className = "split-char";
              chSpan.textContent = ch;
              chSpan.style.setProperty("--i", state.index++);
              wordSpan.appendChild(chSpan);
            });
            fragment.appendChild(wordSpan);
          }
          
          if (wi < words.length - 1) {
            const spaceSpan = document.createElement("span");
            spaceSpan.className = "split-char";
            spaceSpan.textContent = "\u00a0";
            spaceSpan.style.setProperty("--i", state.index++);
            fragment.appendChild(spaceSpan);
          }
        });
        element.appendChild(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        splitTextElement(node, state);
        element.appendChild(node);
      }
    });
  }

  document.querySelectorAll(".section-header h2, .why-left h2").forEach(h2 => {
    if (h2.querySelector(".split-char")) return;
    h2.classList.add("split-heading");
    splitTextElement(h2);
  });

  const animObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      animObs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".split-heading, .clip-reveal, .blur-in").forEach(el => animObs.observe(el));

  document.querySelectorAll(".service-card, .award-card, .tech-card, .testimonial-card").forEach((el, i) => {
    el.classList.add("blur-in");
    el.style.transitionDelay = (i % 6) * 0.06 + "s";
    animObs.observe(el);
  });

  document.querySelectorAll(".section-header").forEach(h => animObs.observe(h));


  // Parallax on scroll
  const parallaxEls = document.querySelectorAll("[data-parallax], .hero-img-frame, .award-card");
  parallaxEls.forEach(el => el.setAttribute("data-parallax", el.getAttribute("data-parallax") || "0.08"));

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    document.querySelectorAll("[data-parallax]").forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.05;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transform = `translateY(${y * speed * 0.15}px)`;
      }
    });
  }, { passive: true });

  // Tech tab sliding indicator
  const techTabs = document.querySelector(".tech-tabs");
  if (techTabs) {
    const indicator = document.createElement("div");
    indicator.className = "tab-indicator";
    techTabs.style.position = "relative";
    techTabs.insertBefore(indicator, techTabs.firstChild);
    function moveIndicator() {
      const active = techTabs.querySelector(".tab-btn.active");
      if (!active) return;
      indicator.style.left = active.offsetLeft + "px";
      indicator.style.width = active.offsetWidth + "px";
      indicator.style.height = active.offsetHeight + "px";
      indicator.style.top = active.offsetTop + "px";
    }
    moveIndicator();
    techTabs.querySelectorAll(".tab-btn").forEach(btn => btn.addEventListener("click", () => setTimeout(moveIndicator, 10)));
    window.addEventListener("resize", moveIndicator);
  }

  // Inject spotlight glows for card hovers
  document.querySelectorAll(".tilt-card, .service-card, .plan-card, .pricing-card, .award-card").forEach(card => {
    if (card.querySelector(".spotlight-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "spotlight-wrap";
    wrap.style.position = "absolute";
    wrap.style.inset = "0";
    wrap.style.overflow = "hidden";
    wrap.style.borderRadius = "inherit";
    wrap.style.zIndex = "0";
    wrap.style.pointerEvents = "none";
    
    const glow = document.createElement("span");
    glow.className = "spotlight-glow";
    wrap.appendChild(glow);
    card.appendChild(wrap);
    
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  });
})();

/* ── RESELLER SECTION GSAP SCROLL ANIMATION ── */
(function initResellerAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const resellerSection = document.getElementById('reseller');
  if (!resellerSection) return;

  const content = resellerSection.querySelector('.reseller-content');
  const tag = content ? content.querySelector('.section-tag') : null;
  const title = content ? content.querySelector('h2') : null;
  const desc = content ? content.querySelector('p') : null;
  const checks = content ? content.querySelectorAll('.reseller-list li') : [];
  const btn = content ? content.querySelector('.btn-primary') : null;

  const visual = resellerSection.querySelector('.reseller-visual');
  const dashboard = visual ? visual.querySelector('.dashboard-frame') : null;
  const widgets = visual ? visual.querySelectorAll('.floating-widget') : [];

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initGSAP, 100);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: resellerSection,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 0.8,
      }
    });

    if (tag && title) {
      tl.fromTo([tag, title],
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0
      );
    }
    if (desc) {
      tl.fromTo(desc,
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.15
      );
    }
    if (checks.length) {
      tl.fromTo(checks,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 0.3
      );
    }
    if (btn) {
      tl.fromTo(btn,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.5
      );
    }

    if (dashboard) {
      tl.fromTo(dashboard,
        { x: 100, scale: 0.9, opacity: 0, filter: 'blur(10px)' },
        { x: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'back.out(1.2)' }, 0.2
      );
    }
    if (widgets.length) {
      tl.fromTo(widgets,
        { y: 30, scale: 0.8, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.35, stagger: 0.1, ease: 'back.out(1.5)' }, 0.4
      );
    }

    tl.to({}, { duration: 0.4 });

    if (content) tl.to(content, { x: -100, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0');
    if (visual)  tl.to(visual,  { x: 100, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAP);
  } else {
    initGSAP();
  }
})();


/* ── PLANS & PRICING SECTIONS GSAP SCROLL ANIMATION ── */
(function initPricingPlansAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function animateCardsSection(sectionSelector, cardSelector) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const header = section.querySelector('.section-header');
    const cards = Array.from(section.querySelectorAll(cardSelector));
    if (!cards.length) return;

    function initGSAP() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        setTimeout(initGSAP, 100);
        return;
      }
      gsap.registerPlugin(ScrollTrigger);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: 0.8,
        }
      });

      if (header) {
        tl.fromTo(header,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0
        );
      }

      cards.forEach((card) => {
        const entry = card.dataset.entry || 'bottom';
        let fromState = { opacity: 0, scale: 0.9, filter: 'blur(8px)' };
        if (entry === 'left') {
          fromState.x = -100; fromState.y = 0;
        } else if (entry === 'right') {
          fromState.x = 100; fromState.y = 0;
        } else {
          fromState.x = 0; fromState.y = 80;
        }

        let toState = { x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'back.out(1.2)' };
        if (card.classList.contains('featured')) {
          toState.scale = 1.03;
        }

        tl.fromTo(card, fromState, toState, 0.2);
      });

      tl.to({}, { duration: 0.4 });

      if (header) tl.to(header, { y: -50, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0');
      if (cards.length) tl.to(cards, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGSAP);
    } else {
      initGSAP();
    }
  }

  animateCardsSection('#plans', '.plan-card');
  animateCardsSection('#pricing', '.pricing-card');
})();


/* ── WHY CHOOSE SEAWIND SOLUTION PREMIUM SCROLL ANIMATIONS ── */
(function initWhyChooseAnimation() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const whySection = document.querySelector('.why-us');
  if (!whySection) return;

  const whyLeft = whySection.querySelector('.why-left');
  const sectionTag = whyLeft ? whyLeft.querySelector('.section-tag') : null;
  const heading = whyLeft ? whyLeft.querySelector('h2') : null;
  const desc = whyLeft ? whyLeft.querySelector('p') : null;
  const bullets = whyLeft ? whyLeft.querySelectorAll('.why-list li') : [];
  const buttonGroup = whyLeft ? whyLeft.querySelector('.cta-flex-group') : null;

  const whyRight = whySection.querySelector('.why-right');
  const cards = whySection.querySelectorAll('.why-card');
  const statNums = whySection.querySelectorAll('.stat-num');

  const canvas = whySection.querySelector('.why-bg-canvas');
  const circle1 = whySection.querySelector('.why-dec-circle-1');
  const circle2 = whySection.querySelector('.why-dec-circle-2');

  // 1. BACKGROUND PARTICLES SYSTEM
  let particles = [];
  let ctx = null;

  if (canvas) {
    ctx = canvas.getContext('2d');
    function resizeCanvas() {
      if (!canvas || !whySection) return;
      canvas.width = whySection.offsetWidth;
      canvas.height = whySection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 600),
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.45 + 0.2
      });
    }

    function renderParticles() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 160, 255, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 160, 255, 0.8)';
        ctx.fill();
      });
      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  // 2. MOUSE INTERACTION (3D Card Tilt max 3deg, Dynamic Shadow, Light Reflection, Cursor Follow)
  let mouseTargetX = 0, mouseTargetY = 0;
  let currCircleX = 0, currCircleY = 0;

  whySection.addEventListener('mousemove', e => {
    const rect = whySection.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    mouseTargetX = dx;
    mouseTargetY = dy;

    // Normalize mouse coords (-1 to 1) for cards 3D tilt
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    // Max rotation 3 deg
    const rotX = Math.max(-3, Math.min(3, -normY * 6));
    const rotY = Math.max(-3, Math.min(3, normX * 6));

    cards.forEach(card => {
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      const shadowX = -rotY * 3;
      const shadowY = -rotX * 3;
      card.style.boxShadow = `${shadowX}px ${shadowY + 15}px 35px rgba(0, 119, 255, 0.18)`;

      // Dynamic light reflection shine
      const cardRect = card.getBoundingClientRect();
      const shineX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
      const shineY = ((e.clientY - cardRect.top) / cardRect.height) * 100;
      card.style.setProperty('--shine-x', `${shineX}%`);
      card.style.setProperty('--shine-y', `${shineY}%`);
    });
  });

  whySection.addEventListener('mouseleave', () => {
    mouseTargetX = 0;
    mouseTargetY = 0;
    cards.forEach(card => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // Smooth lerp for decorative circles following cursor
  function updateCircleFollow() {
    currCircleX += (mouseTargetX - currCircleX) * 0.05;
    currCircleY += (mouseTargetY - currCircleY) * 0.05;

    if (circle1) {
      circle1.style.transform = `translate(${currCircleX * 0.08}px, ${currCircleY * 0.08}px)`;
    }
    if (circle2) {
      circle2.style.transform = `translate(${-currCircleX * 0.06}px, ${-currCircleY * 0.06}px)`;
    }
    requestAnimationFrame(updateCircleFollow);
  }
  updateCircleFollow();

  // 3. CARD FLOATING ANIMATION (Subtle idle float after animation)
  let floatTime = 0;
  function updateCardFloat() {
    floatTime += 0.02;
    cards.forEach((card, index) => {
      if (!card.matches(':hover')) {
        const floatY = Math.sin(floatTime + index * 0.8) * 4;
        card.style.transform = `translateY(${floatY}px)`;
      }
    });
    requestAnimationFrame(updateCardFloat);
  }

  // 4. GSAP & SCROLLTRIGGER REVERSIBLE ANIMATIONS
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initGSAPAnimations, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initial state setup for left side elements
    const leftElements = [];
    if (sectionTag) leftElements.push(sectionTag);
    if (heading) leftElements.push(heading);

    // Counter targets
    const countersData = Array.from(statNums).map(el => ({
      el,
      target: parseInt(el.dataset.target || '0', 10)
    }));

    // Master Scrub Timeline for 100% Reversibility
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: whySection,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 0.8, // Smooth scrub frame-by-frame on scroll up & down
      }
    });

    // --- PHASE 1: ENTRY ANIMATION ---
    // Left side sequence: Heading -> Description -> Bullet points -> Button
    if (sectionTag && heading) {
      tl.fromTo([sectionTag, heading], 
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0
      );
    }
    if (desc) {
      tl.fromTo(desc, 
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.15
      );
    }
    if (bullets.length) {
      tl.fromTo(bullets, 
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 0.3
      );
    }
    if (buttonGroup) {
      tl.fromTo(buttonGroup, 
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.5
      );
    }

    // Right side cards sequence: Card 1 -> Card 2 -> Card 3 -> Card 4
    if (cards.length) {
      tl.fromTo(cards, 
        { x: 100, scale: 0.9, opacity: 0, filter: 'blur(10px)' },
        { x: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.45, stagger: 0.12, ease: 'back.out(1.2)' }, 0.25
      );
    }

    // Counter animation synchronized with card appearance
    countersData.forEach((c, idx) => {
      const counterObj = { val: 0 };
      tl.to(counterObj, {
        val: c.target,
        duration: 0.5,
        ease: 'power1.out',
        onUpdate: function() {
          c.el.textContent = Math.floor(counterObj.val).toLocaleString();
        }
      }, 0.35 + idx * 0.1);
    });

    // --- PHASE 2: ACTIVE MID-STATION ---
    tl.to({}, { duration: 0.4 }); // Hold state while user scrolls through section center

    // --- PHASE 3: EXIT ANIMATION (Scroll Down Exit & Reverse on Scroll Up) ---
    if (whyLeft) {
      tl.to(whyLeft, { x: -100, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0');
    }
    if (whyRight) {
      tl.to(whyRight, { x: 100, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<');
    }
    if (circle1 && circle2) {
      tl.to([circle1, circle2], { opacity: 0, duration: 0.4 }, '<');
    }

    // Start idle card float after GSAP init
    updateCardFloat();
  }

  // Initialize GSAP scroll animations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAPAnimations);
  } else {
    initGSAPAnimations();
  }

})();


/* ── DOMAIN SECTION PREMIUM SCROLL ANIMATIONS ── */
(function initDomainAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const domainSection = document.querySelector('.domain');
  if (!domainSection) return;

  const domainLeft   = domainSection.querySelector('.domain-left');
  const sectionTag   = domainLeft ? domainLeft.querySelector('.section-tag') : null;
  const heading      = domainLeft ? domainLeft.querySelector('h2') : null;
  const desc         = domainLeft ? domainLeft.querySelector('p') : null;
  const features     = domainLeft ? domainLeft.querySelectorAll('.domain-feature') : [];

  const domainRight  = domainSection.querySelector('.domain-right');
  const rightHeading = domainRight ? domainRight.querySelector('h3') : null;
  const rightDesc    = domainRight ? domainRight.querySelector('p') : null;
  const searchBar    = domainRight ? domainRight.querySelector('.domain-search-bar') : null;
  const toolBtns     = domainRight ? domainRight.querySelectorAll('.domain-tool-btn') : [];

  const glassCard    = domainSection.querySelector('.domain-glass-card');
  const canvas       = domainSection.querySelector('.domain-bg-canvas');
  const circle1      = domainSection.querySelector('.domain-dec-circle-1');
  const circle2      = domainSection.querySelector('.domain-dec-circle-2');

  // 1. FLOATING PARTICLES
  if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      canvas.width  = domainSection.offsetWidth;
      canvas.height = domainSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 500),
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.15
      });
    }

    function renderParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 160, 255, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 160, 255, 0.8)';
        ctx.fill();
      });
      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  // 2. 3D MOUSE TILT + decorative circle cursor-follow
  let mouseTargetX = 0, mouseTargetY = 0;
  let currX = 0, currY = 0;

  domainSection.addEventListener('mousemove', e => {
    const rect  = domainSection.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width  - 0.5;
    const normY = (e.clientY - rect.top)  / rect.height - 0.5;
    const rotX  = Math.max(-4, Math.min(4, -normY * 8));
    const rotY  = Math.max(-4, Math.min(4,  normX * 8));
    mouseTargetX = (e.clientX - rect.left  - rect.width  / 2);
    mouseTargetY = (e.clientY - rect.top   - rect.height / 2);
    if (glassCard) {
      glassCard.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      glassCard.style.boxShadow = `${-rotY * 4}px ${-rotX * 4 + 20}px 60px rgba(0,85,204,0.18)`;
    }
  });

  domainSection.addEventListener('mouseleave', () => {
    mouseTargetX = 0; mouseTargetY = 0;
    if (glassCard) { glassCard.style.transform = ''; glassCard.style.boxShadow = ''; }
  });

  function updateCircleFollow() {
    currX += (mouseTargetX - currX) * 0.05;
    currY += (mouseTargetY - currY) * 0.05;
    if (circle1) circle1.style.transform = `translate(${currX * 0.08}px, ${currY * 0.08}px)`;
    if (circle2) circle2.style.transform = `translate(${-currX * 0.06}px, ${-currY * 0.06}px)`;
    requestAnimationFrame(updateCircleFollow);
  }
  updateCircleFollow();

  // 3. GSAP REVERSIBLE SCRUB TIMELINE
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initGSAP, 100);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: domainSection,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 0.8,
      }
    });

    // Left: tag + heading → description → feature items (staggered)
    if (sectionTag && heading) {
      tl.fromTo([sectionTag, heading],
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0
      );
    }
    if (desc) {
      tl.fromTo(desc,
        { x: -70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.15
      );
    }
    if (features.length) {
      tl.fromTo(features,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.09, ease: 'power2.out' }, 0.28
      );
    }

    // Right: heading → desc → search bar → tool buttons (staggered)
    if (rightHeading) {
      tl.fromTo(rightHeading,
        { x: 90, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.05
      );
    }
    if (rightDesc) {
      tl.fromTo(rightDesc,
        { x: 70, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.18
      );
    }
    if (searchBar) {
      tl.fromTo(searchBar,
        { y: 30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }, 0.3
      );
    }
    if (toolBtns.length) {
      tl.fromTo(toolBtns,
        { y: 28, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.28, stagger: 0.06, ease: 'back.out(1.5)' }, 0.42
      );
    }

    // Hold phase while user scrolls through the centre of the section
    tl.to({}, { duration: 0.4 });

    // Exit: left exits left, right exits right (reversed on scroll up)
    if (domainLeft)  tl.to(domainLeft,  { x: -100, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=0');
    if (domainRight) tl.to(domainRight, { x:  100, opacity: 0, duration: 0.4, ease: 'power2.in' }, '<');
    if (circle1 && circle2) tl.to([circle1, circle2], { opacity: 0, duration: 0.4 }, '<');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAP);
  } else {
    initGSAP();
  }
})();
