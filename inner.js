// Seawind Solution — inner.js (shared across inner pages)

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── Services filter (used on services.html) ──
const filterBtns = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");
if (filterBtns.length) {
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
}

// ── Inquiry tabs (contact page) ──
const inquiryTabs = document.querySelectorAll(".inquiry-tab");
const inquiryInput = document.getElementById("inquiryType");
if (inquiryTabs.length && inquiryInput) {
  inquiryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      inquiryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      inquiryInput.value = tab.dataset.inquiry || tab.textContent.trim();
    });
  });
}

// ── Portfolio filter (portfolio.html) ──
const portfolioFilters = document.getElementById("portfolioFilters");
const portfolioItems = document.querySelectorAll(".portfolio-card[data-category]");
if (portfolioFilters && portfolioItems.length) {
  portfolioFilters.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      portfolioFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.portfolioFilter;
      portfolioItems.forEach(item => {
        const show = filter === "all" || item.dataset.category === filter;
        item.style.display = show ? "flex" : "none";
      });
    });
  });
}

// ── Tilt cards on inner pages ──
document.querySelectorAll(".tilt-card").forEach(card => {
  if (prefersReducedMotion) return;
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

// ── Reveal observer ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: "0px 0px -10px 0px" });

document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach(el => revealObs.observe(el));

// ── Counter animation ──
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

const statObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll(".stat-num").forEach(animateCounter);
      statObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll(".why-cards, .about-img-badge").forEach(el => statObs.observe(el));
