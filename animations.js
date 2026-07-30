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

  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    const cards = pricingSection.querySelectorAll('.pricing-card');
    const lists = pricingSection.querySelectorAll('.pricing-card ul li');
    const checks = pricingSection.querySelectorAll('.pricing-check');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        cards.forEach((card, index) => {
          card.style.transition = `opacity 0.65s ease, transform 0.65s ease`;
          card.style.transitionDelay = `${index * 0.12}s`;
          card.classList.add('visible');
          const cardChecks = card.querySelectorAll('ul li');
          cardChecks.forEach((li, liIndex) => {
            const check = li.querySelector('.pricing-check');
            if (check) {
              const delay = 0.35 + liIndex * 0.08;
              li.style.transition = `opacity 0.45s ease, transform 0.45s ease ${delay}s`;
              li.classList.add('visible');
              check.classList.add('visible');
            }
          });
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    obs.observe(pricingSection);
  }

  const resellerSection = document.getElementById('reseller');
  if (resellerSection) {
    const items = resellerSection.querySelectorAll('.stagger-item');
    const checks = resellerSection.querySelectorAll('.reseller-list li');
    const badges = resellerSection.querySelectorAll('.floating-widget');
    const resellerObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        items.forEach((item, index) => {
          item.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
          item.style.transitionDelay = `${index * 0.14}s`;
          item.classList.add('visible');
        });
        checks.forEach((li, index) => {
          li.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
          li.style.transitionDelay = `${0.4 + index * 0.08}s`;
          li.classList.add('visible');
          const tick = li.querySelector('.check');
          if (tick) tick.classList.add('draw-visible');
        });
        badges.forEach((badge, index) => {
          badge.style.transition = `opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)`;
          badge.style.transitionDelay = `${0.5 + index * 0.12}s`;
          badge.classList.add('visible');
        });
        const title = resellerSection.querySelector('.reseller-title');
        if (title) title.classList.add('visible');

        resellerObs.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    resellerObs.observe(resellerSection);
  }

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


// ── NEW ANIMATIONS ──────────────────────────────────────────

(function () {
  // Reveal the plans grid when the featured corporate card reaches view
  const plansGrid = document.querySelector('.plans-grid');
  const featuredCard = document.querySelector('.plan-card.featured');
  if (plansGrid && featuredCard) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio < 0.75) return;
        plansGrid.classList.add('visible');
        const corp = plansGrid.querySelector('.corporate-tiers');
        if (corp) corp.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.75 });
    obs.observe(featuredCard);
  }

  // Count-up for price numbers
  const priceEls = document.querySelectorAll('.price-num');
  if (priceEls.length) {
    const priceObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio < 0.5) return;
        const el = entry.target;
        if (el.dataset.animated) { priceObs.unobserve(el); return; }
        const target = parseInt(el.dataset.price, 10);
        if (isNaN(target)) { priceObs.unobserve(el); return; }
        el.dataset.animated = '1';
        const duration = 900;
        const start = performance.now();
        function step(now) {
          const t = Math.min((now - start) / duration, 1);
          const val = Math.floor(t * target);
          el.textContent = '₹' + val.toLocaleString();
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = '₹' + target.toLocaleString();
        }
        requestAnimationFrame(step);
        priceObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    priceEls.forEach(e => priceObs.observe(e));
  }

})();

