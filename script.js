// Seawind Solution - script.js

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Page loader
const pageLoader = document.getElementById("pageLoader");
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  if (pageLoader) {
    setTimeout(() => pageLoader.classList.add("hidden"), prefersReducedMotion ? 0 : 600);
  }

  // Transform all buttons into premium liquid gooey buttons dynamically!
  const targetButtons = document.querySelectorAll(
    ".btn-primary, .btn-outline, .btn-ghost, .btn-nav"
  );
  targetButtons.forEach(btn => {
    if (btn.querySelector(".liquid-bg") || btn.classList.contains("btn-liquid")) {
      return;
    }

    const btnText = btn.innerHTML;
    btn.innerHTML = `
      <span>${btnText}</span>
      <div class="liquid-bg">
        <div class="btn-base"></div>
        <span class="bubble"></span>
        <span class="bubble"></span>
        <span class="bubble"></span>
        <span class="bubble"></span>
      </div>
    `;

    btn.classList.add("btn-liquid");
    if (btn.classList.contains("btn-primary") || btn.classList.contains("btn-nav")) {
      btn.classList.add("btn-liquid--primary");
    } else {
      btn.classList.add("btn-liquid--outline");
    }
  });
});

// Scroll progress
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : "0%";
}, { passive: true });

// Cursor glow
const cursorGlow = document.getElementById("cursorGlow");
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {
  if (cursorGlow && !prefersReducedMotion) {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = glowX + "px";
    cursorGlow.style.top = glowY + "px";
  } else if (cursorGlow) {
    cursorGlow.style.left = mouseX + "px";
    cursorGlow.style.top = mouseY + "px";
  }
  requestAnimationFrame(animateGlow);
}
animateGlow();

// Nav scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
}, { passive: true });

// Reveal on scroll (staggered)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0, 10);
      setTimeout(() => entry.target.classList.add("visible"), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.04, rootMargin: "0px 0px -10px 0px" });

document.querySelectorAll(".reveal, .stagger-children").forEach(el => revealObserver.observe(el));

// Add stagger to grids
document.querySelectorAll(".services-gallery, .awards-grid, .plans-grid, .tech-panels").forEach(el => {
  if (!el.classList.contains("stagger-children")) {
    el.classList.add("stagger-children");
    revealObserver.observe(el);
  }
});

// Counter animation (eased)
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = prefersReducedMotion ? 0 : 2200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(easeOutQuart(progress) * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  if (duration === 0) el.textContent = target;
  else requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll(".stat-num").forEach(animateCounter);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll(".why-cards").forEach(el => statObserver.observe(el));

// Particle canvas
const canvas = document.getElementById("particleCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? "0,85,204" : "0,200,255";
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  const count = prefersReducedMotion ? 40 : 120;
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    if (!prefersReducedMotion) {
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,85,204,${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// Parallax orbs on scroll
if (!prefersReducedMotion) {
  const orbs = document.querySelectorAll(".orb");
  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.15;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${y * (i + 1) * 0.3}px)`;
    });
  }, { passive: true });
}

// 3D tilt on cards
document.querySelectorAll(".tilt-card, .tech-card").forEach(card => {
  if (prefersReducedMotion) return;
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`;
    
    // Parallax effect on the logo inside tech-card
    const logo = card.querySelector('.tech-logo');
    if (logo) {
      logo.style.transform = `translateZ(30px) scale(1.1) translateX(${x * 10}px) translateY(${y * 10}px)`;
    }
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    const logo = card.querySelector('.tech-logo');
    if (logo) logo.style.transform = "";
  });
});

// Tech tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tech-panel");
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => {
      p.classList.remove("active");
      p.querySelectorAll(".tech-card").forEach(c => {
        c.style.animation = "none";
        c.offsetHeight;
        c.style.animation = "";
      });
    });
    btn.classList.add("active");
    const panel = document.getElementById("tab-" + btn.dataset.tab);
    panel.classList.add("active");
  });
});

// Spotlight tracking on plan feature items
document.querySelectorAll(".plan-features li").forEach(li => {
  if (prefersReducedMotion) return;
  li.addEventListener("mousemove", e => {
    const rect = li.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    li.style.setProperty("--mouse-x", `${x}px`);
    li.style.setProperty("--mouse-y", `${y}px`);
  });
});

// Services Filter
const filterBtns = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (item.dataset.category === filter) {
        item.style.display = "flex";
        item.style.animation = "none";
        item.offsetHeight;
        item.style.animation = "scaleIn 0.45s var(--ease-out-expo) forwards";
      } else {
        item.style.display = "none";
      }
    });
  });
});

// Hamburger menu
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  const open = hamburger.classList.contains("active");
  navLinks.style.display = open ? "flex" : "";
  if (open) {
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "70px";
    navLinks.style.left = "0";
    navLinks.style.right = "0";
    navLinks.style.background = "rgba(4,4,15,0.97)";
    navLinks.style.padding = "24px";
    navLinks.style.borderBottom = "1px solid rgba(255,255,255,0.07)";
    navLinks.style.backdropFilter = "blur(20px)";
    navLinks.style.gap = "20px";
    navLinks.style.animation = "panelIn 0.35s var(--ease-out-expo)";
  }
});

// CTA Form Orbs Tracking
const ctaSection = document.querySelector('.cta-section');
const ctaOrb1 = document.querySelector('.cta-orb-1');
const ctaOrb2 = document.querySelector('.cta-orb-2');

if (ctaSection && ctaOrb1 && ctaOrb2 && !prefersReducedMotion) {
  ctaSection.addEventListener('mousemove', e => {
    const rect = ctaSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    ctaOrb1.style.setProperty('--orb-x', `${x * 0.2}px`);
    ctaOrb1.style.setProperty('--orb-y', `${y * 0.2}px`);
    
    ctaOrb2.style.setProperty('--orb-x', `${-x * 0.15}px`);
    ctaOrb2.style.setProperty('--orb-y', `${-y * 0.15}px`);
  });
  
  ctaSection.addEventListener('mouseleave', () => {
    ctaOrb1.style.setProperty('--orb-x', `0px`);
    ctaOrb1.style.setProperty('--orb-y', `0px`);
    ctaOrb2.style.setProperty('--orb-x', `0px`);
    ctaOrb2.style.setProperty('--orb-y', `0px`);
  });
}

// Why Choose Section Orbs Tracking
const whySection = document.querySelector('.why-choose-inner');
const whyOrb1 = document.querySelector('.why-orb-1');
const whyOrb2 = document.querySelector('.why-orb-2');

if (whySection && whyOrb1 && whyOrb2 && !prefersReducedMotion) {
  whySection.addEventListener('mousemove', e => {
    const rect = whySection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    whyOrb1.style.setProperty('--orb-x', `${x * 0.2}px`);
    whyOrb1.style.setProperty('--orb-y', `${y * 0.2}px`);
    
    whyOrb2.style.setProperty('--orb-x', `${-x * 0.15}px`);
    whyOrb2.style.setProperty('--orb-y', `${-y * 0.15}px`);
  });
  
  whySection.addEventListener('mouseleave', () => {
    whyOrb1.style.setProperty('--orb-x', `0px`);
    whyOrb1.style.setProperty('--orb-y', `0px`);
    whyOrb2.style.setProperty('--orb-x', `0px`);
    whyOrb2.style.setProperty('--orb-y', `0px`);
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href === "#") return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    if (window.innerWidth < 768) {
      navLinks.style.display = "";
      hamburger.classList.remove("active");
    }
  });
});

// Hero Slider
const heroSlider = document.getElementById("heroMainSlider");
if (heroSlider) {
  const heroSlides = heroSlider.querySelectorAll(".hero-slide");
  const heroDotsContainer = document.getElementById("heroDots");
  let currentHeroSlide = 0;
  let heroAutoplay;
  const totalHeroSlides = heroSlides.length;

  for (let i = 0; i < totalHeroSlides; i++) {
    const dot = document.createElement("button");
    dot.className = "hero-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goHeroSlide(i));
    heroDotsContainer.appendChild(dot);
  }

  function resetSlideAnimations(slide) {
    const content = slide.querySelector(".hero-slide-content");
    const right = slide.querySelector(".hero-slide-right");
    if (content) {
      content.querySelectorAll("*").forEach(el => {
        el.style.animation = "none";
        el.offsetHeight;
        el.style.animation = "";
      });
    }
    if (right) {
      right.style.transition = "none";
      right.offsetHeight;
      right.style.transition = "";
    }
  }

  function goHeroSlide(index) {
    heroSlides[currentHeroSlide].classList.remove("active");
    resetSlideAnimations(heroSlides[currentHeroSlide]);

    currentHeroSlide = (index + totalHeroSlides) % totalHeroSlides;
    heroSlides[currentHeroSlide].classList.add("active");
    resetSlideAnimations(heroSlides[currentHeroSlide]);

    heroSlider.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
    document.querySelectorAll(".hero-dot").forEach((d, i) => {
      d.classList.toggle("active", i === currentHeroSlide);
    });
  }

  function startAutoplay() {
    clearInterval(heroAutoplay);
    if (!prefersReducedMotion) {
      heroAutoplay = setInterval(() => goHeroSlide(currentHeroSlide + 1), 6000);
    }
  }

  document.getElementById("heroPrev").addEventListener("click", () => {
    goHeroSlide(currentHeroSlide - 1);
    startAutoplay();
  });
  document.getElementById("heroNext").addEventListener("click", () => {
    goHeroSlide(currentHeroSlide + 1);
    startAutoplay();
  });

  heroSlider.parentElement.addEventListener("mouseenter", () => clearInterval(heroAutoplay));
  heroSlider.parentElement.addEventListener("mouseleave", startAutoplay);
  startAutoplay();
}

document.querySelectorAll(".reveal-left, .reveal-right").forEach(el => revealObserver.observe(el));

// Interactive floating AI assistant features
(function() {
  // SVG Icon definitions
  const svgSparkle = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ai-suggestion-sparkle"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
  const svgGlobe = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle; display:inline-block;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
  const svgPhone = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle; display:inline-block;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
  const svgCpu = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle; display:inline-block;"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>`;
  const svgChart = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle; display:inline-block;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
  const svgMail = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align:middle; display:inline-block;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
  
  const svgBotAvatar = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="#00f0ff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 2v2M8 4h8M12 11V8M12 8A2.5 2.5 0 0 1 12 3M9 16h6"></path></svg>`;
  const svgUserAvatar = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

  // 1. Create and inject the floating widget markup dynamically
  const wrapper = document.createElement("div");
  wrapper.className = "ai-assistant-wrapper";
  wrapper.innerHTML = `
    <div class="ai-suggestion-bubble">
      ${svgSparkle}
      <span class="ai-suggestion-text" id="aiSuggestionText">Plan my project in 60s</span>
    </div>
    <button class="ai-assistant-widget" id="aiAssistantWidget" type="button" aria-label="Ask Seawind AI">
      <div class="ai-assistant-widget-bg"></div>
      <span class="ai-assistant-pulse" aria-hidden="true"></span>
      <div class="ai-assistant-icon" aria-hidden="true">
        <svg class="ai-svg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 12.5 7.5 18 8C12.5 8.5 12 14 12 14C12 14 11.5 8.5 6 8C11.5 7.5 12 2 12 2Z" fill="url(#ai-sparkle-grad)"/>
          <path d="M19 13C19 13 19.25 15.75 22 16C19.25 16.25 19 19 19 19C19 19 18.75 16.25 16 16C18.75 15.75 19 13 19 13Z" fill="url(#ai-sparkle-grad2)"/>
          <path d="M6 15C6 15 6.15 16.65 7.8 16.8C6.15 16.95 6 18.6 6 18.6C6 18.6 5.85 16.95 4.2 16.8C5.85 16.65 6 15 6 15Z" fill="url(#ai-sparkle-grad)"/>
          <defs>
            <linearGradient id="ai-sparkle-grad" x1="6" y1="2" x2="18" y2="14" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00f0ff"/>
              <stop offset="0.5" stop-color="#0072ff"/>
              <stop offset="1" stop-color="#00f0ff"/>
            </linearGradient>
            <linearGradient id="ai-sparkle-grad2" x1="16" y1="13" x2="22" y2="19" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00f0ff"/>
              <stop offset="1" stop-color="#0072ff"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="ai-assistant-copy">
        <strong>Ask Seawind AI</strong>
        <small>Plan my project</small>
      </span>
    </button>
  `;
  document.body.appendChild(wrapper);

  // 2. Create and inject the chat modal markup dynamically
  const modal = document.createElement("div");
  modal.className = "ai-chat-modal";
  modal.id = "aiChatModal";
  modal.innerHTML = `
    <div class="ai-chat-container">
      <div class="ai-chat-header">
        <div class="ai-chat-header-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00f0ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <span>Seawind AI Planner</span>
        </div>
        <button class="ai-chat-close" id="aiChatClose" aria-label="Close modal">&times;</button>
      </div>
      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-chat-msg ai-msg-bot">
          <div class="ai-msg-avatar">${svgBotAvatar}</div>
          <div class="ai-msg-bubble">
            Hi! I'm Seawind AI. Let's outline your project in a few quick steps. What kind of project are you looking to build?
          </div>
        </div>
        <div class="ai-chat-options" id="aiChatOptions">
          <button class="ai-chat-opt-btn" data-value="Web Development">${svgGlobe}Web Development</button>
          <button class="ai-chat-opt-btn" data-value="Mobile App Development">${svgPhone}Mobile App</button>
          <button class="ai-chat-opt-btn" data-value="AI Solutions">${svgCpu}AI Solutions</button>
          <button class="ai-chat-opt-btn" data-value="Digital Marketing">${svgChart}Digital Marketing</button>
        </div>
      </div>
      <form class="ai-chat-input-area" id="aiChatForm" style="display:none;">
        <input type="text" id="aiChatInput" placeholder="Tell me more about your requirements & email..." required autocomplete="off" />
        <button type="submit" aria-label="Send message">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Coordinate tracker for hover shine
  const widget = document.getElementById("aiAssistantWidget");
  if (widget) {
    widget.addEventListener("mousemove", (e) => {
      const rect = widget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      widget.style.setProperty("--x", `${x}px`);
      widget.style.setProperty("--y", `${y}px`);
    });

    widget.addEventListener("click", () => {
      resetChat();
      modal.classList.add("active");
    });
  }

  // Global trigger-ai-planner listener
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".trigger-ai-planner");
    if (trigger) {
      e.preventDefault();
      resetChat();
      modal.classList.add("active");
    }
  });

  // 4. Suggestion Pill Cycler
  const suggestionText = document.getElementById("aiSuggestionText");
  const suggestions = [
    "Plan my project in 60s",
    "Estimate custom app cost",
    "What tech stacks fit my app?",
    "Check out AI services",
    "Let's schedule a call"
  ];
  if (suggestionText) {
    let currentIdx = 0;
    setInterval(() => {
      suggestionText.classList.add("fade-out");
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % suggestions.length;
        suggestionText.textContent = suggestions[currentIdx];
        suggestionText.classList.remove("fade-out");
        suggestionText.classList.add("fade-in");
        setTimeout(() => {
          suggestionText.classList.remove("fade-in");
        }, 300);
      }, 300);
    }, 4500);
  }

  // Close modal logic
  const closeBtn = document.getElementById("aiChatClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  // Conversation State
  let serviceType = "";
  let budget = "";
  let step = 1; // 1: Service type selection, 2: Budget selection, 3: Details form

  const chatBody = document.getElementById("aiChatBody");
  const chatOptions = document.getElementById("aiChatOptions");
  const chatForm = document.getElementById("aiChatForm");
  const chatInput = document.getElementById("aiChatInput");

  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `ai-chat-msg ${sender === 'bot' ? 'ai-msg-bot' : 'ai-msg-user'}`;
    msg.innerHTML = `
      <div class="ai-msg-avatar">${sender === 'bot' ? svgBotAvatar : svgUserAvatar}</div>
      <div class="ai-msg-bubble">${text}</div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTypingIndicator() {
    const msg = document.createElement("div");
    msg.className = "ai-chat-msg ai-msg-bot ai-typing-msg";
    msg.innerHTML = `
      <div class="ai-msg-avatar">${svgBotAvatar}</div>
      <div class="ai-msg-bubble" style="padding: 12px 18px;">
        <div class="ai-typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  function handleOptionClick(val) {
    if (step === 1) {
      serviceType = val;
      appendMessage("user", val);
      chatOptions.style.display = "none";
      step = 2;

      const typingIndicator = showTypingIndicator();
      setTimeout(() => {
        typingIndicator.remove();
        appendMessage("bot", `Excellent decision. To help configure scope, what is your estimated budget for ${serviceType}?`);
        
        // Show budget choices
        chatOptions.innerHTML = `
          <button class="ai-chat-opt-btn" data-value="Under $5,000">Under $5k</button>
          <button class="ai-chat-opt-btn" data-value="$5,000 - $15,000">$5k - $15k</button>
          <button class="ai-chat-opt-btn" data-value="$15,000 - $50,000">$15k - $50k</button>
          <button class="ai-chat-opt-btn" data-value="$50,000+">$50k+</button>
        `;
        chatOptions.style.display = "flex";
        bindOptionListeners();
      }, 1000);
    } else if (step === 2) {
      budget = val;
      appendMessage("user", val);
      chatOptions.style.display = "none";
      step = 3;

      const typingIndicator = showTypingIndicator();
      setTimeout(() => {
        typingIndicator.remove();
        appendMessage("bot", `Perfect. Now, please describe what you want to build and provide your email address (e.g. "Build an e-commerce app. contact@email.com") so we can draft your outline!`);
        chatForm.style.display = "flex";
        chatInput.focus();
      }, 1000);
    }
  }

  function bindOptionListeners() {
    chatOptions.querySelectorAll(".ai-chat-opt-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        handleOptionClick(btn.dataset.value);
      });
    });
  }

  function resetChat() {
    step = 1;
    serviceType = "";
    budget = "";
    chatBody.innerHTML = `
      <div class="ai-chat-msg ai-msg-bot">
        <div class="ai-msg-avatar">${svgBotAvatar}</div>
        <div class="ai-msg-bubble">
          Hi! I'm Seawind AI. Let's outline your project in a few quick steps. What kind of project are you looking to build?
        </div>
      </div>
      <div class="ai-chat-options" id="aiChatOptions">
        <button class="ai-chat-opt-btn" data-value="Web Development">${svgGlobe}Web Development</button>
        <button class="ai-chat-opt-btn" data-value="Mobile App Development">${svgPhone}Mobile App</button>
        <button class="ai-chat-opt-btn" data-value="AI Solutions">${svgCpu}AI Solutions</button>
        <button class="ai-chat-opt-btn" data-value="Digital Marketing">${svgChart}Digital Marketing</button>
      </div>
    `;
    chatOptions.style.display = "flex";
    chatForm.style.display = "none";
    chatInput.value = "";
    bindOptionListeners();
  }

  bindOptionListeners();

  // Send message submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const txt = chatInput.value.trim();
    if (!txt) return;

    appendMessage("user", txt);
    chatInput.value = "";
    chatForm.style.display = "none";

    const typingIndicator = showTypingIndicator();

    setTimeout(async () => {
      const payload = {
        formType: 'ai-project-planner',
        service: serviceType,
        budget: budget,
        message: txt
      };

      let success = false;
      const config = window.SEAWIND_FORMS || { fallbackEmail: "info@seawindsolution.com" };

      try {
        if (config.web3formsKey) {
          const web3Payload = {
            access_key: config.web3formsKey,
            subject: `AI Planner Brief - ${serviceType}`,
            from_name: "AI Planner Assistant",
            email: config.fallbackEmail,
            message: `Project Type: ${serviceType}\nBudget: ${budget}\nRequirements & Email: ${txt}`,
            form_type: 'ai-project-planner'
          };
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(web3Payload),
          });
          const json = await res.json();
          success = res.ok && json.success;
        } else {
          // php submit fallback
          const rootPath = window.location.pathname.replace(/\\/g, "/");
          const base = /\/(services|blog|portfolio)\//.test(rootPath) ? "../" : "";
          const url = base + (config.endpoint || "api/send-mail.php").replace(/^\//, "");
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          success = res.ok && json.success;
        }
      } catch (err) {
        console.error("AI form submit error:", err);
      }

      setTimeout(() => {
        typingIndicator.remove();

        if (success) {
          appendMessage("bot", `Project Brief Created! Our experts are on it. We've sent a notification, and you will receive a follow-up directly within 24 hours. Let's build something epic!`);
        } else {
          // mailto fallback
          appendMessage("bot", `Almost done! Click the button below to email your brief directly to our team.`);
          const mailtoBtn = document.createElement("div");
          mailtoBtn.className = "ai-chat-options";
          mailtoBtn.style.paddingLeft = "42px";
          
          const subject = encodeURIComponent(`[AI Project Planner] ${serviceType}`);
          const body = encodeURIComponent(`Project Type: ${serviceType}\nBudget: ${budget}\nRequirements: ${txt}`);
          
          mailtoBtn.innerHTML = `
            <a href="mailto:${config.fallbackEmail}?subject=${subject}&body=${body}" class="ai-chat-opt-btn" style="text-decoration:none;display:inline-block;">${svgMail}Send Project Brief</a>
          `;
          chatBody.appendChild(mailtoBtn);
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }, 1000);
    }, 1200);
  });
})();

// Dark / Light Mode Toggle
(function() {
  const sunSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  const btn = document.createElement('button');
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.innerHTML = moonSvg;

  // Place as fixed bottom-left button, back on body
  const navInner = document.querySelector('.nav-inner');
  if (navInner) {
    const navRight = navInner.querySelector('.nav-right');
    if (navRight) {
      // Restore hamburger back to nav-inner and remove the wrapper
      const hamburger = navRight.querySelector('.hamburger');
      if (hamburger) navInner.appendChild(hamburger);
      navRight.remove();
    }
  }
  document.body.appendChild(btn);

  const ripple = document.createElement('div');
  ripple.className = 'theme-ripple';
  document.body.appendChild(ripple);

  const savedTheme = localStorage.getItem('seawind-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  btn.innerHTML = savedTheme === 'dark' ? sunSvg : moonSvg;

  btn.addEventListener('click', () => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) * 2;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    ripple.style.width = ripple.style.height = `${maxR}px`;
    ripple.style.left = `${cx - maxR / 2}px`;
    ripple.style.top = `${cy - maxR / 2}px`;
    ripple.style.background = newTheme === 'dark' ? '#090b11' : '#f8fafc';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    ripple.style.transition = 'none';
    void ripple.offsetWidth;
    ripple.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.65s ease';
    ripple.style.transform = 'scale(1)';

    setTimeout(() => {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('seawind-theme', newTheme);
      btn.innerHTML = newTheme === 'dark' ? sunSvg : moonSvg;
      ripple.style.transition = 'opacity 0.3s ease';
      ripple.style.opacity = '0';
    }, 350);
  });
})();

// Schedule Callback Drawer
(function() {
  const phoneIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"></path></svg>`;
  const checkIcon = `<svg viewBox="0 0 24 24" width="28" height="28" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  // Create tab trigger
  const tab = document.createElement('button');
  tab.className = 'callback-tab';
  tab.setAttribute('aria-label', 'Schedule a callback');
  tab.innerHTML = `${phoneIcon}<span>Schedule a Call</span>`;
  document.body.appendChild(tab);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'callback-overlay';
  document.body.appendChild(overlay);

  // Create drawer
  const drawer = document.createElement('div');
  drawer.className = 'callback-drawer';
  drawer.id = 'callbackDrawer';
  drawer.innerHTML = `
    <div class="callback-drawer-header">
      <div class="callback-drawer-title">
        <strong>Schedule a Call</strong>
        <span>Our team will call you back shortly</span>
      </div>
      <button class="callback-close" id="callbackClose" aria-label="Close">&times;</button>
    </div>
    <div class="callback-drawer-body" id="callbackForm">
      <div class="callback-field">
        <label>Your Name</label>
        <input type="text" id="cbName" placeholder="Full name" autocomplete="name" />
      </div>
      <div class="callback-field">
        <label>Phone Number</label>
        <input type="tel" id="cbPhone" placeholder="+91 00000 00000" autocomplete="tel" />
      </div>
      <div>
        <div class="callback-time-label">Preferred Time</div>
        <div class="callback-time-chips">
          <button class="callback-chip" data-time="Morning (9am - 12pm)">Morning</button>
          <button class="callback-chip" data-time="Afternoon (12pm - 4pm)">Afternoon</button>
          <button class="callback-chip" data-time="Evening (4pm - 7pm)">Evening</button>
        </div>
      </div>
      <button class="callback-submit" id="callbackSubmit">Request Callback</button>
    </div>
    <div class="callback-success" id="callbackSuccess">
      <div class="callback-success-icon">${checkIcon}</div>
      <h4>Call Scheduled!</h4>
      <p>Our team will reach out to you at your preferred time. Thank you!</p>
    </div>
  `;
  document.body.appendChild(drawer);

  let selectedTime = '';

  // Chip selection
  drawer.querySelectorAll('.callback-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      drawer.querySelectorAll('.callback-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedTime = chip.dataset.time;
    });
  });

  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    tab.style.display = 'none';
  }
  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    tab.style.display = '';
  }

  tab.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('callbackClose').addEventListener('click', closeDrawer);

  document.getElementById('callbackSubmit').addEventListener('click', async () => {
    const name = document.getElementById('cbName').value.trim();
    const phone = document.getElementById('cbPhone').value.trim();
    if (!name || !phone) {
      document.getElementById('cbName').style.borderColor = !name ? '#ef4444' : '';
      document.getElementById('cbPhone').style.borderColor = !phone ? '#ef4444' : '';
      return;
    }
    const config = window.SEAWIND_FORMS || { fallbackEmail: 'info@seawindsolution.com' };
    let success = false;
    try {
      if (config.web3formsKey) {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: config.web3formsKey,
            subject: 'Callback Request - Seawind Solution',
            from_name: name,
            message: `Callback Request\nName: ${name}\nPhone: ${phone}\nPreferred Time: ${selectedTime || 'Any time'}`,
            form_type: 'callback'
          })
        });
        const json = await res.json();
        success = res.ok && json.success;
      }
    } catch (e) {}
    if (!success) {
      const sub = encodeURIComponent('Callback Request');
      const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nPreferred Time: ${selectedTime || 'Any time'}`);
      window.open(`mailto:${config.fallbackEmail}?subject=${sub}&body=${body}`);
      success = true;
    }
    if (success) {
      document.getElementById('callbackForm').style.display = 'none';
      document.getElementById('callbackSuccess').classList.add('show');
      setTimeout(closeDrawer, 3200);
    }
  });
})();

// ─── Project Cost Estimator ───────────────────────────────────────────────────
(function () {
  'use strict';

  /* ── Data ── */
  const PROJECT_TYPES = [
    { id: 'web',       icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="#0055cc" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`, name: 'Web App / Website', base: 1500,  label: 'From $1,500' },
    { id: 'mobile',    icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="#0055cc" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`, name: 'Mobile App',         base: 4000,  label: 'From $4,000' },
    { id: 'ai',        icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="#0055cc" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>`, name: 'AI / ML Solution',   base: 6000,  label: 'From $6,000' },
    { id: 'marketing', icon: `<svg viewBox="0 0 24 24" width="22" height="22" stroke="#0055cc" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, name: 'Digital Marketing',  base: 800,   label: 'From $800' },
  ];

  const FEATURES = [
    { id: 'auth',    label: 'User Authentication', cost: 600 },
    { id: 'pay',     label: 'Payment Gateway',     cost: 900 },
    { id: 'dash',    label: 'Admin Dashboard',     cost: 1200 },
    { id: 'cms',     label: 'CMS / Blog',           cost: 700 },
    { id: 'api',     label: 'API Integration',      cost: 800 },
    { id: 'chat',    label: 'Live Chat / Support',  cost: 500 },
    { id: 'notif',   label: 'Push Notifications',  cost: 450 },
    { id: 'i18n',    label: 'Multi-Language',       cost: 600 },
    { id: 'analytics', label: 'Analytics & Reports', cost: 700 },
    { id: 'seo',     label: 'SEO Optimisation',     cost: 500 },
  ];

  /* ── State ── */
  let currentStep = 1;
  let selectedType = null;
  let selectedFeatures = new Set();
  let timeline = 4; // months

  /* ── Build HTML ── */
  const backdrop = document.createElement('div');
  backdrop.className = 'estimator-backdrop';
  backdrop.id = 'estimatorBackdrop';
  backdrop.innerHTML = `
    <div class="estimator-modal" role="dialog" aria-modal="true" aria-label="Project Cost Estimator">
      <!-- Header -->
      <div class="estimator-header">
        <h2>Project Cost Estimator</h2>
        <p>Get a ballpark figure in under 60 seconds</p>
        <button class="estimator-close" id="estimatorClose" aria-label="Close estimator">&times;</button>
      </div>

      <!-- Step progress -->
      <div class="estimator-steps">
        <div class="estimator-step-dot active" id="estDot1">1</div>
        <div class="estimator-step-line"><div class="estimator-step-line-fill" id="estLine1"></div></div>
        <div class="estimator-step-dot" id="estDot2">2</div>
        <div class="estimator-step-line"><div class="estimator-step-line-fill" id="estLine2"></div></div>
        <div class="estimator-step-dot" id="estDot3">3</div>
      </div>

      <!-- Body -->
      <div class="estimator-body">

        <!-- Step 1: Project Type -->
        <div class="estimator-step active" id="estStep1">
          <div class="estimator-step-title">What are you building?</div>
          <div class="estimator-step-sub">Choose the primary type of project.</div>
          <div class="estimator-type-grid" id="estTypeGrid"></div>
          <div class="estimator-nav">
            <div></div>
            <button class="estimator-btn-next" id="estNext1" disabled>Next →</button>
          </div>
        </div>

        <!-- Step 2: Features + Timeline -->
        <div class="estimator-step" id="estStep2">
          <div class="estimator-step-title">Customise your project</div>
          <div class="estimator-step-sub">Pick the features you need and set your timeline.</div>
          <div class="estimator-features-label">Features (select all that apply)</div>
          <div class="estimator-feature-chips" id="estFeatureChips"></div>
          <div class="estimator-slider-row">
            <span class="estimator-slider-label">Timeline</span>
            <span class="estimator-slider-val" id="estTimelineVal">4 months</span>
          </div>
          <input type="range" class="estimator-range" id="estTimeline"
                 min="1" max="12" value="4" step="1" style="--pct:25%">
          <div class="estimator-nav">
            <button class="estimator-btn-back" id="estBack2">← Back</button>
            <button class="estimator-btn-next" id="estNext2">See Estimate →</button>
          </div>
        </div>

        <!-- Step 3: Result -->
        <div class="estimator-step" id="estStep3">
          <div class="estimator-step-title">Your Estimate</div>
          <div class="estimator-step-sub">Based on your selections — actual quote may vary.</div>
          <div class="estimator-cost-display">
            <div class="estimator-cost-label">Estimated Investment</div>
            <div class="estimator-cost-value" id="estCostValue">$0</div>
            <div class="estimator-cost-range" id="estCostRange"></div>
          </div>
          <div class="estimator-breakdown" id="estBreakdown"></div>
          <a href="contact.html?ref=estimator" class="estimator-quote-btn">
            Get an Exact Quote &rarr;
          </a>
          <p class="estimator-disclaimer">
            This is a rough estimate for budgeting purposes only.<br>
            Final pricing is based on detailed requirements.
          </p>
          <div class="estimator-nav" style="justify-content:flex-start">
            <button class="estimator-btn-back" id="estBack3">← Recalculate</button>
          </div>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  /* ── Populate project type cards ── */
  const typeGrid = document.getElementById('estTypeGrid');
  PROJECT_TYPES.forEach(pt => {
    const card = document.createElement('button');
    card.className = 'estimator-type-card';
    card.dataset.id = pt.id;
    card.innerHTML = `
      <span class="estimator-type-icon">${pt.icon}</span>
      <span class="estimator-type-name">${pt.name}</span>
      <span class="estimator-type-base">${pt.label}</span>
    `;
    card.addEventListener('click', () => {
      typeGrid.querySelectorAll('.estimator-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedType = pt;
      document.getElementById('estNext1').disabled = false;
    });
    typeGrid.appendChild(card);
  });

  /* ── Populate feature chips ── */
  const chipsContainer = document.getElementById('estFeatureChips');
  FEATURES.forEach(feat => {
    const chip = document.createElement('button');
    chip.className = 'estimator-chip';
    chip.textContent = feat.label;
    chip.dataset.id = feat.id;
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      if (selectedFeatures.has(feat.id)) selectedFeatures.delete(feat.id);
      else selectedFeatures.add(feat.id);
    });
    chipsContainer.appendChild(chip);
  });

  /* ── Timeline slider ── */
  const slider = document.getElementById('estTimeline');
  const timelineVal = document.getElementById('estTimelineVal');
  slider.addEventListener('input', () => {
    timeline = parseInt(slider.value, 10);
    timelineVal.textContent = `${timeline} month${timeline > 1 ? 's' : ''}`;
    const pct = ((timeline - 1) / 11 * 100).toFixed(1) + '%';
    slider.style.setProperty('--pct', pct);
  });

  /* ── Cost calculation ── */
  function calcCost() {
    if (!selectedType) return 0;
    let base = selectedType.base;
    let featureTotal = 0;
    FEATURES.forEach(f => {
      if (selectedFeatures.has(f.id)) featureTotal += f.cost;
    });
    const timeMultiplier = 1 + (timeline - 1) * 0.05; // 5% per extra month
    return Math.round((base + featureTotal) * timeMultiplier);
  }

  /* ── Animated number counter ── */
  function animateCounter(el, target, duration) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (target - start) * eased);
      el.textContent = '$' + current.toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Build breakdown ── */
  function buildBreakdown(total) {
    const breakdown = document.getElementById('estBreakdown');
    breakdown.innerHTML = '';

    const selectedFeatList = FEATURES.filter(f => selectedFeatures.has(f.id));
    const featureTotal = selectedFeatList.reduce((s, f) => s + f.cost, 0);
    const timelineBonus = total - selectedType.base - featureTotal;

    function addRow(key, val, cls) {
      const row = document.createElement('div');
      row.className = `estimator-breakdown-row${cls ? ' ' + cls : ''}`;
      row.innerHTML = `<span class="estimator-breakdown-key">${key}</span><span class="estimator-breakdown-val">$${val.toLocaleString('en-US')}</span>`;
      breakdown.appendChild(row);
    }
    function addDivider() {
      const d = document.createElement('div');
      d.className = 'estimator-breakdown-divider';
      breakdown.appendChild(d);
    }

    addRow(`${selectedType.icon} ${selectedType.name}`, selectedType.base);
    if (selectedFeatList.length) {
      selectedFeatList.forEach(f => addRow(f.label, f.cost));
    }
    if (timelineBonus > 0) addRow(`Timeline factor (${timeline}mo)`, Math.round(timelineBonus));
    addDivider();
    addRow('Estimated Total', total, 'estimator-breakdown-total');

    // range
    const lo = Math.round(total * 0.85);
    const hi = Math.round(total * 1.25);
    document.getElementById('estCostRange').textContent =
      `Likely range: $${lo.toLocaleString('en-US')} – $${hi.toLocaleString('en-US')}`;
  }

  /* ── Step navigation ── */
  function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.estimator-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`estStep${step}`).classList.add('active');

    // Update dots
    [1, 2, 3].forEach(i => {
      const dot = document.getElementById(`estDot${i}`);
      dot.classList.remove('active', 'done');
      if (i < step) { dot.classList.add('done'); dot.textContent = '✓'; }
      else if (i === step) { dot.classList.add('active'); dot.textContent = i; }
      else { dot.textContent = i; }
    });

    // Update lines
    [1, 2].forEach(i => {
      const fill = document.getElementById(`estLine${i}`);
      fill.classList.toggle('filled', step > i);
    });

    currentStep = step;

    // Trigger cost animation on step 3
    if (step === 3) {
      const total = calcCost();
      buildBreakdown(total);
      animateCounter(document.getElementById('estCostValue'), total, 1400);
    }
  }

  /* ── Wire up buttons ── */
  document.getElementById('estNext1').addEventListener('click', () => goToStep(2));
  document.getElementById('estBack2').addEventListener('click', () => goToStep(1));
  document.getElementById('estNext2').addEventListener('click', () => goToStep(3));
  document.getElementById('estBack3').addEventListener('click', () => goToStep(2));

  /* ── Open / Close ── */
  function openEstimator() {
    // Reset state
    currentStep = 1;
    selectedType = null;
    selectedFeatures.clear();
    timeline = 4;
    slider.value = 4;
    timelineVal.textContent = '4 months';
    slider.style.setProperty('--pct', '25%');
    typeGrid.querySelectorAll('.estimator-type-card').forEach(c => c.classList.remove('selected'));
    chipsContainer.querySelectorAll('.estimator-chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('estNext1').disabled = true;
    goToStep(1);
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeEstimator() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Expose globally for any external calls
  window._openEstimator = openEstimator;

  document.getElementById('estimatorClose').addEventListener('click', closeEstimator);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeEstimator(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && backdrop.classList.contains('active')) closeEstimator(); });

  /* ── Floating left-edge tab (mirrors Schedule a Call tab) ── */
  const calcIcon = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="11" y2="16"/></svg>`;
  const estTab = document.createElement('button');
  estTab.className = 'estimator-tab';
  estTab.setAttribute('aria-label', 'Open project cost estimator');
  estTab.innerHTML = `${calcIcon}<span>Estimate Cost</span>`;
  document.body.appendChild(estTab);
  estTab.addEventListener('click', openEstimator);
})();

// ─── FAQ Accordion ───────────────────────────────────────────────────────────
(function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other items
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      
      // Toggle current item
      item.classList.toggle('open', !isOpen);
    });
  });
})();

// ─── Back to Top Button ───────────────────────────────────────────────────────
(function () {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ─── Reading Progress Bar (blog posts only) ───────────────────────────────────
(function () {
  // Only activate on blog article pages
  const isBlogPost = document.querySelector('.blog-post-content, .blog-article, article.post, .post-body, .blog-body');
  const isBlogDir = window.location.pathname.includes('/blog/');
  if (!isBlogPost && !isBlogDir) return;

  const bar = document.createElement('div');
  bar.className = 'blog-reading-progress';
  bar.innerHTML = `<div class="blog-reading-progress-fill" id="blogProgressFill"></div>`;
  document.body.appendChild(bar);

  const label = document.createElement('div');
  label.className = 'blog-reading-label';
  label.id = 'blogProgressLabel';
  document.body.appendChild(label);

  const fill = document.getElementById('blogProgressFill');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    fill.style.width = pct + '%';
    label.textContent = pct + '% read';
    label.classList.toggle('visible', pct > 2 && pct < 100);
  }, { passive: true });
})();

// ─── Cookie Consent Banner ────────────────────────────────────────────────────
(function () {
  const COOKIE_KEY = 'seawind-cookie-consent';
  if (localStorage.getItem(COOKIE_KEY)) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="cookie-banner-icon">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0055cc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
        <circle cx="8.5" cy="9" r="1.5" fill="#0055cc" stroke="none"/>
        <circle cx="14.5" cy="14.5" r="1" fill="#0055cc" stroke="none"/>
        <circle cx="15" cy="8.5" r="1" fill="#0055cc" stroke="none"/>
      </svg>
    </div>
    <div class="cookie-banner-text">
      <strong>We use cookies</strong>
      <p>We use cookies to enhance your browsing experience, analyse site traffic, and personalise content. By clicking "Accept", you consent to our use of cookies. <a href="privacy-policy.html">Privacy Policy</a></p>
    </div>
    <div class="cookie-banner-actions">
      <button class="cookie-btn-decline" id="cookieDecline">Decline</button>
      <button class="cookie-btn-accept" id="cookieAccept">Accept All</button>
    </div>
  `;
  document.body.appendChild(banner);

  // Slide in after short delay
  setTimeout(() => banner.classList.add('visible'), 1200);

  function dismiss(choice) {
    banner.style.transform = 'translateX(-50%) translateY(120px)';
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 500);
    localStorage.setItem(COOKIE_KEY, choice);
  }

  document.getElementById('cookieAccept').addEventListener('click', () => dismiss('accepted'));
  document.getElementById('cookieDecline').addEventListener('click', () => dismiss('declined'));
})();

// ─── Services Search ──────────────────────────────────────────────────────────
(function () {
  const input = document.getElementById('servicesSearch');
  const clearBtn = document.getElementById('servicesSearchClear');
  const gallery = document.getElementById('servicesGallery');
  const filterBtns = document.querySelectorAll('#serviceFilters .filter-btn');
  if (!input || !gallery) return;

  const cards = gallery.querySelectorAll('.service-card');

  // Inject no-results message
  const noResults = document.createElement('p');
  noResults.className = 'services-no-results';
  noResults.textContent = 'No services found. Try a different keyword.';
  gallery.appendChild(noResults);

  function doSearch(query) {
    const q = query.trim().toLowerCase();
    clearBtn.classList.toggle('visible', q.length > 0);

    if (!q) {
      // Restore tab filter
      noResults.classList.remove('visible');
      const activeTab = document.querySelector('#serviceFilters .filter-btn.active');
      const activeFilter = activeTab ? activeTab.dataset.filter : 'tab-web';
      cards.forEach(card => {
        card.style.display = card.dataset.category === activeFilter ? '' : 'none';
      });
      return;
    }

    // Show all matching cards regardless of tab
    let found = 0;
    cards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const match = title.includes(q) || desc.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) found++;
    });
    noResults.classList.toggle('visible', found === 0);
  }

  input.addEventListener('input', () => doSearch(input.value));

  clearBtn.addEventListener('click', () => {
    input.value = '';
    doSearch('');
    input.focus();
  });
})();
