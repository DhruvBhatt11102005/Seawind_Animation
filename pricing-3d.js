/**
 * pricing-3d.js — Ultra-Premium Scroll-Driven 3D Pricing Section
 * Seawind Solution  |  Requires: GSAP, ScrollTrigger, Three.js
 * ──────────────────────────────────────────────────────────────
 * Phase 1  (0–20%)  : Entry — blur clear, title, sphere, particles
 * Phase 2  (20–40%) : Cards fly in with 3D rotation
 * Phase 3  (40–60%) : Zoom to Corporate, holographic ring, orbit
 * Phase 4  (60–80%) : Depth separation — front/mid/back layers
 * Phase 5  (80–100%): Settle, light wave, buttons activate
 */
(function () {
  'use strict';

  /* ── Guard: reduced-motion → skip all animation ──────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('#plans .plan-card, #plans .section-header').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  /* ── Wait for DOM + GSAP ─────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[pricing-3d] GSAP or ScrollTrigger not found — aborting.');
      revealFallback();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    buildScene();
  }

  function revealFallback() {
    document.querySelectorAll('#plans .plan-card, #plans .section-header').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ════════════════════════════════════════════════════════════════
     SCENE CONSTRUCTION
  ════════════════════════════════════════════════════════════════ */
  function buildScene() {
    const section = document.getElementById('plans');
    if (!section) return;

    /* ── 1. SECTION: SET SCROLL HEIGHT ───────────────────────────── */
    // pinSpacing:true means ScrollTrigger inserts its own spacer div — 
    // we just need to set the section to relative positioning.
    section.style.position = 'relative';


    // Strip conflicting animation classes — GSAP owns these elements now
    section.classList.remove('reveal-slide-left');
    section.querySelectorAll('.plan-card').forEach(card => {
      card.classList.remove('reveal-left', 'reveal-right', 'tilt-card');
      // Mark as GSAP-owned so animations.js tilt handler skips them
      card.setAttribute('data-p3d-card', 'true');
    });
    // Make plans-grid "visible" immediately so animation.css won't fight
    const plansGrid = section.querySelector('.plans-grid');
    if (plansGrid) plansGrid.classList.add('visible');

    // Pre-mark price elements — GSAP Phase 3 counter will own them
    section.querySelectorAll('.price-num[data-price]').forEach(el => {
      el.dataset.animated = '1'; // Prevents animations.js IntersectionObserver from firing
    });

    // Pre-hide elements synchronously — GSAP will reveal them via scroll animation
    // This prevents a flash of the unstyled/positioned content before gsap.set() runs
    section.querySelectorAll('.plan-card').forEach((card, i) => {
      card.style.opacity = '0';
      // Smaller initial offsets that stay inside the clipping boundary
      if (card.classList.contains('featured')) {
        card.style.transform = 'translateY(60px) scale(0.92)';
      } else if (card.dataset.entry === 'left') {
        card.style.transform = 'translateX(-80px) rotateY(-18deg)';
      } else {
        card.style.transform = 'translateX(80px) rotateY(18deg)';
      }
      card.style.willChange = 'transform, opacity';
    });
    const headerEl = section.querySelector('.section-header');
    if (headerEl) {
      headerEl.style.opacity = '0';
      headerEl.style.transform = 'translateY(40px)';
      headerEl.style.willChange = 'transform, opacity';
    }

    /* ── 2. INJECT STICKY WRAPPER ───────────────────────────────── */
    const container = section.querySelector('.container');
    if (!container) return;

    // Wrap the container in a sticky viewport
    const stickyWrap = document.createElement('div');
    stickyWrap.className = 'p3d-sticky-wrap';
    section.insertBefore(stickyWrap, container);
    stickyWrap.appendChild(container);

    /* ── 3. INJECT BACKGROUND LAYERS ────────────────────────────── */
    const bgLayer = el('div', 'p3d-bg-layer');
    const fogLayer = el('div', 'p3d-fog');
    stickyWrap.insertBefore(fogLayer, stickyWrap.firstChild);
    stickyWrap.insertBefore(bgLayer, stickyWrap.firstChild);

    /* ── 4. ENERGY SPHERE ────────────────────────────────────────── */
    const sphere = el('div', 'p3d-energy-sphere');
    stickyWrap.appendChild(sphere);

    /* ── 5. STREAKS ─────────────────────────────────────────────── */
    for (let i = 1; i <= 3; i++) {
      stickyWrap.appendChild(el('div', `p3d-streak p3d-streak-${i}`));
    }

    /* ── 6. FLOATING PARTICLES ──────────────────────────────────── */
    const particleContainer = el('div', 'p3d-particles');
    const PARTICLE_COUNT = isMobile() ? 18 : 36;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = el('div', 'p3d-particle');
      const size = rnd(3, 9);
      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${rnd(0, 100)}%;
        top: ${rnd(0, 100)}%;
        --dur: ${rnd(6, 14)}s;
        --delay: ${rnd(0, 8)}s;
        --op: ${rnd(0.3, 0.7)};
        opacity: 0;
      `;
      particleContainer.appendChild(p);
      particles.push(p);
    }
    stickyWrap.appendChild(particleContainer);

    /* ── 7. ROTATING RINGS ──────────────────────────────────────── */
    const ringsHost = el('div', 'p3d-rings');
    for (let i = 1; i <= 3; i++) ringsHost.appendChild(el('div', `p3d-ring p3d-ring-${i}`));
    stickyWrap.appendChild(ringsHost);

    /* ── 8. HOLOGRAPHIC RING (Corporate card child) ─────────────── */
    const featuredCard = section.querySelector('.plan-card.featured');
    const holoRing = el('div', 'p3d-holo-ring');
    if (featuredCard) featuredCard.appendChild(holoRing);

    /* ── 9. LIGHT BEAMS ─────────────────────────────────────────── */
    for (let i = 1; i <= 3; i++) stickyWrap.appendChild(el('div', `p3d-beam p3d-beam-${i}`));

    /* ── 10. ORBIT PARTICLES (around featured card) ─────────────── */
    const orbitParticles = [];
    const ORBIT_COUNT = isMobile() ? 4 : 8;
    for (let i = 0; i < ORBIT_COUNT; i++) {
      const op = el('div', 'p3d-orbit-particle');
      if (featuredCard) featuredCard.appendChild(op);
      orbitParticles.push(op);
    }

    /* ── 11. LIGHT WAVE (Phase 5) ────────────────────────────────── */
    const lightWave = el('div', 'p3d-light-wave');
    stickyWrap.appendChild(lightWave);

    /* ── 12. THREE.JS CANVAS ─────────────────────────────────────── */
    initThreeJS(stickyWrap);

    /* ── GRAB ELEMENTS ──────────────────────────────────────────── */
    const header     = section.querySelector('.section-header');
    const underline  = section.querySelector('.heading-underline');
    const cards      = Array.from(section.querySelectorAll('.plan-card'));
    const cardLeft   = cards.find(c => c.dataset.entry === 'left');
    const cardCenter = cards.find(c => c.classList.contains('featured'));
    const cardRight  = cards.find(c => c.dataset.entry === 'right');
    const allRings   = Array.from(ringsHost.querySelectorAll('.p3d-ring'));
    const allBeams   = Array.from(stickyWrap.querySelectorAll('.p3d-beam'));

    /* ── 13. MARK BUTTONS ────────────────────────────────────────── */
    section.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.classList.add('p3d-btn');
      addRippleEffect(btn);
    });

    /* ═══════════════════════════════════════════════════════════════
       GSAP PINNED SCROLL TIMELINE
    ═══════════════════════════════════════════════════════════════ */

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=250%',
        pin: stickyWrap,
        pinSpacing: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    /* ─── PHASE 1: 0–20% — Entry & Header ──────────────────────── */

    // Set GSAP initial states — synced with inline styles applied above
    gsap.set(stickyWrap, { filter: 'blur(8px)', opacity: 0.2 });
    gsap.set(header, { y: 40, opacity: 0, scale: 0.96 });
    gsap.set(underline, { width: 0 });
    gsap.set(sphere, { scale: 0, opacity: 0 });
    gsap.set(allRings, { opacity: 0 });
    gsap.set(particles, { opacity: 0, scale: 0 });
    // Sync cards with the inline styles already applied
    if (cardLeft)   gsap.set(cardLeft,   { x: -80, rotateY: -18, opacity: 0 });
    if (cardCenter) gsap.set(cardCenter, { y: 60, scale: 0.92, opacity: 0 });
    if (cardRight)  gsap.set(cardRight,  { x: 80, rotateY: 18, opacity: 0 });

    tl
      // Blur clears
      .to(stickyWrap, { filter: 'blur(0px)', opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
      // Energy sphere forms
      .to(sphere, { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.05)
      // Header fades up
      .to(header, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }, 0.1)
      // Underline expands from left
      .to(underline, { width: '120px', duration: 0.4, ease: 'power2.out' }, 0.25)
      // Rings become visible
      .to(allRings, { opacity: 1, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0.15)
      // Particles pop in
      .to(particles.slice(0, Math.floor(PARTICLE_COUNT * 0.5)), {
        opacity: 1, scale: 1,
        stagger: { amount: 0.3, from: 'random' },
        duration: 0.2, ease: 'back.out(1.7)'
      }, 0.2);

    /* ─── PHASE 2: 20–40% — Cards fly in ──────────────────────── */

    tl
      // Left card: from left + rotateY
      .to(cardLeft, {
        x: 0, y: 0,
        opacity: 1,
        rotateY: 0,
        z: 0,
        duration: 0.55, ease: 'power4.out'
      }, 0.35)
      // Center card: from bottom + scale
      .to(cardCenter, {
        y: 0, scale: 1,
        opacity: 1,
        z: 0,
        duration: 0.6, ease: 'expo.out'
      }, 0.4)
      // Right card: from right + rotateY
      .to(cardRight, {
        x: 0, y: 0,
        opacity: 1,
        rotateY: 0,
        z: 0,
        duration: 0.55, ease: 'power4.out'
      }, 0.45)
      // More particles appear
      .to(particles.slice(Math.floor(PARTICLE_COUNT * 0.5)), {
        opacity: 1, scale: 1,
        stagger: { amount: 0.2, from: 'random' },
        duration: 0.2, ease: 'back.out(1.4)'
      }, 0.4);

    /* ─── PHASE 3: 40–60% — Zoom to Corporate ─────────────────── */

    tl
      // Left card recedes
      .to(cardLeft, { z: -120, x: -30, rotateY: -10, scale: 0.92, opacity: 0.9, duration: 0.4, ease: 'power2.inOut' }, 0.6)
      // Right card recedes
      .to(cardRight, { z: -120, x: 30, rotateY: 10, scale: 0.92, opacity: 0.9, duration: 0.4, ease: 'power2.inOut' }, 0.6)
      // Center card zooms in
      .to(cardCenter, { scale: 1.06, z: 40, duration: 0.4, ease: 'power2.inOut' }, 0.6)
      // Holo ring appears
      .to(holoRing, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.63)
      // Light beams activate
      .to(allBeams, { opacity: 1, stagger: 0.04, duration: 0.2, ease: 'power2.out' }, 0.65)
      // Price counter animation
      .add(() => { animatePrices(section); }, 0.65)
      // Orbit particles
      .add(() => { startOrbit(orbitParticles, featuredCard, 1.0); }, 0.65)
      // Sphere brightens
      .to(sphere, { scale: 1.3, opacity: 0.9, duration: 0.4, ease: 'power2.inOut' }, 0.62);

    /* ─── PHASE 4: 60–80% — Depth Separation ──────────────────── */

    tl
      // Left card → front layer
      .to(cardLeft, {
        z: 80, x: -20, rotateY: -5, scale: 1.02, opacity: 1,
        duration: 0.4, ease: 'power2.inOut',
        onUpdate: () => cardLeft.classList.add('p3d-depth-front')
      }, 0.8)
      // Center card → middle layer
      .to(cardCenter, {
        z: 0, scale: 1.0, rotateY: 0,
        duration: 0.4, ease: 'power2.inOut',
        onUpdate: () => { cardCenter.classList.add('p3d-depth-mid'); cardCenter.classList.remove('p3d-depth-front'); }
      }, 0.8)
      // Right card → back layer
      .to(cardRight, {
        z: -160, x: 20, rotateY: 8, scale: 0.88, opacity: 0.85,
        duration: 0.4, ease: 'power2.inOut',
        onUpdate: () => cardRight.classList.add('p3d-depth-back')
      }, 0.8)
      // Holo ring tilts
      .to(holoRing, { rotationX: 55, duration: 0.4, ease: 'power2.inOut' }, 0.82);

    /* ─── PHASE 5: 80–100% — Settle + Wave ────────────────────── */

    tl
      // All cards return to neutral
      .to([cardLeft, cardRight], {
        z: 0, x: 0, rotateY: 0, scale: 1, opacity: 1,
        duration: 0.4, ease: 'power3.out',
        onComplete: () => {
          [cardLeft, cardRight, cardCenter].forEach(c => {
            if (c) {
              c.classList.remove('p3d-depth-front', 'p3d-depth-mid', 'p3d-depth-back');
              c.classList.add('p3d-active');
            }
          });
        }
      }, 0.98)
      .to(cardCenter, { z: 0, scale: 1.03, rotateY: 0, duration: 0.4, ease: 'power3.out' }, 0.98)
      // Holo ring fades
      .to(holoRing, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 1.0)
      // Beams fade
      .to(allBeams, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 1.0)
      // Light wave sweeps
      .to(lightWave, { x: '200%', duration: 0.6, ease: 'power2.inOut' }, 1.02)
      // Particles disperse
      .to(particles, {
        opacity: 0, scale: 0,
        stagger: { amount: 0.3, from: 'random' },
        duration: 0.3, ease: 'power2.in'
      }, 1.05)
      // Sphere fades
      .to(sphere, { opacity: 0, scale: 0.5, duration: 0.3, ease: 'power2.in' }, 1.05)
      // Rings fade
      .to(allRings, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 1.08);

    /* ═══════════════════════════════════════════════════════════════
       MOUSE PARALLAX
    ═══════════════════════════════════════════════════════════════ */
    initMouseParallax(section, cards, particles);

    /* ═══════════════════════════════════════════════════════════════
       MAGNETIC BUTTONS
    ═══════════════════════════════════════════════════════════════ */
    initMagneticButtons(section);
  }

  /* ════════════════════════════════════════════════════════════════
     THREE.JS — BACKGROUND PARTICLES + WAVES
  ════════════════════════════════════════════════════════════════ */
  function initThreeJS(host) {
    if (typeof THREE === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.id = 'p3d-canvas';
    host.insertBefore(canvas, host.firstChild);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile(),
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.offsetWidth, host.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, host.offsetWidth / host.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    /* Wave plane */
    const waveGeo = new THREE.PlaneGeometry(20, 14, 80, 50);
    const waveMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime:    { value: 0 },
        uColor1:  { value: new THREE.Color(0x0055cc) },
        uColor2:  { value: new THREE.Color(0x00c8ff) },
        uOpacity: { value: 0.06 }
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave1 = sin(pos.x * 0.8 + uTime * 0.6) * 0.18;
          float wave2 = sin(pos.y * 0.6 + uTime * 0.4) * 0.14;
          float wave3 = cos((pos.x + pos.y) * 0.5 + uTime * 0.3) * 0.10;
          pos.z += wave1 + wave2 + wave3;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float mixFactor = vUv.x + sin(vUv.y * 3.14159) * 0.4;
          vec3 color = mix(uColor1, uColor2, clamp(mixFactor, 0.0, 1.0));
          float alpha = uOpacity * (0.5 + sin(vUv.y * 3.14159) * 0.5);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 4;
    waveMesh.position.z = -2;
    scene.add(waveMesh);

    /* Particle system */
    const PARTICLE_COUNT_3D = isMobile() ? 200 : 500;
    const positions = new Float32Array(PARTICLE_COUNT_3D * 3);
    const colors    = new Float32Array(PARTICLE_COUNT_3D * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT_3D);

    const c1 = new THREE.Color(0x1a7fff);
    const c2 = new THREE.Color(0x00c8ff);
    const c3 = new THREE.Color(0x0055cc);

    for (let i = 0; i < PARTICLE_COUNT_3D; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;

      const col = [c1, c2, c3][Math.floor(Math.random() * 3)];
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(pos.x * 0.5 + uTime * 0.4) * 0.15;
          pos.x += cos(pos.y * 0.4 + uTime * 0.3) * 0.12;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (350.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * 0.7;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });

    const particleMesh = new THREE.Points(pGeo, pMat);
    scene.add(particleMesh);

    /* RAF loop */
    let frameId;
    const clock = new THREE.Clock();
    let isVisible = false;

    /* IntersectionObserver to pause when off-screen */
    const io = new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !frameId) animate();
      else if (!isVisible && frameId) { cancelAnimationFrame(frameId); frameId = null; }
    }, { threshold: 0.01 });
    io.observe(canvas.parentElement || document.getElementById('plans'));

    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      waveMat.uniforms.uTime.value = t;
      pMat.uniforms.uTime.value = t;
      particleMesh.rotation.y = t * 0.015;
      renderer.render(scene, camera);
    }

    // Show canvas
    requestAnimationFrame(() => canvas.classList.add('p3d-visible'));

    /* Resize handler */
    const onResize = debounce(() => {
      const w = host.offsetWidth, h = host.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }, 200);
    window.addEventListener('resize', onResize);
  }

  /* ════════════════════════════════════════════════════════════════
     MOUSE PARALLAX
  ════════════════════════════════════════════════════════════════ */
  function initMouseParallax(section, cards, cssParticles) {
    let mouseX = 0, mouseY = 0;
    let rafId;

    function onMouseMove(e) {
      const rect = section.getBoundingClientRect();
      if (rect.height === 0) return;
      // Normalized -1 to 1
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    }

    function applyParallax() {
      const mX = mouseX, mY = mouseY;
      const isST_active = ScrollTrigger.getAll().some(st => st.isActive);

      cards.forEach((card, i) => {
        if (!card.classList.contains('p3d-active')) return;
        const rotX = mY * -8;
        const rotY = mX * 10;
        const tz   = i === 1 ? 10 : 0;
        gsap.to(card, {
          rotateX: rotX, rotateY: rotY, z: tz,
          duration: 0.6, ease: 'power2.out',
          overwrite: 'auto'
        });
        // Move reflection
        const pct = ((mX + 1) / 2) * 100;
        card.style.setProperty('--reflect-x', pct + '%');
      });

      // Subtle particle parallax
      cssParticles.forEach((p, i) => {
        const depth = (i % 3 + 1) * 0.15;
        const tx = mouseX * 12 * depth;
        const ty = mouseY * 8  * depth;
        p.style.transform = `translate(${tx}px, ${ty}px) scale(${1 + Math.abs(mouseX) * 0.05})`;
      });

      rafId = requestAnimationFrame(applyParallax);
    }

    section.addEventListener('mousemove', onMouseMove, { passive: true });
    section.addEventListener('mouseenter', () => { rafId = requestAnimationFrame(applyParallax); });
    section.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
      mouseX = 0; mouseY = 0;
      cards.forEach(card => {
        if (!card.classList.contains('p3d-active')) return;
        gsap.to(card, { rotateX: 0, rotateY: 0, z: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     MAGNETIC BUTTONS (enhanced, scoped to #plans)
  ════════════════════════════════════════════════════════════════ */
  function initMagneticButtons(section) {
    section.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        gsap.to(btn, { x: dx, y: dy, scale: 1.04, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     RIPPLE EFFECT
  ════════════════════════════════════════════════════════════════ */
  function addRippleEffect(btn) {
    btn.addEventListener('click', e => {
      const r    = btn.getBoundingClientRect();
      const rDiv = document.createElement('span');
      rDiv.className = 'p3d-ripple';
      const size = Math.max(r.width, r.height) * 2;
      rDiv.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - r.left - size/2}px;
        top:  ${e.clientY - r.top  - size/2}px;
      `;
      btn.appendChild(rDiv);
      setTimeout(() => rDiv.remove(), 700);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     PRICE COUNTER ANIMATION
  ════════════════════════════════════════════════════════════════ */
  let pricesAnimated = false;
  function animatePrices(section) {
    if (pricesAnimated) return;
    pricesAnimated = true;
    section.querySelectorAll('.price-num[data-price]').forEach(el => {
      const target = parseInt(el.dataset.price, 10);
      const start  = Math.max(0, target - 3000);
      const obj    = { val: start };
      gsap.to(obj, {
        val: target, duration: 1.2, ease: 'power2.out',
        onUpdate() {
          el.textContent = '₹' + Math.round(obj.val).toLocaleString('en-IN');
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     ORBIT PARTICLES ANIMATION
  ════════════════════════════════════════════════════════════════ */
  function startOrbit(particles, card, duration) {
    if (!card || particles.length === 0) return;
    const r  = card.getBoundingClientRect();
    const cx = r.width  / 2;
    const cy = r.height / 2;
    const radius = Math.min(cx, cy) * 0.9;

    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      gsap.to(p, {
        opacity: 1,
        duration: 0.3,
        onComplete() {
          gsap.to({ a: angle }, {
            a: angle + Math.PI * 2,
            duration: 3 + i * 0.3,
            ease: 'none',
            repeat: -1,
            onUpdate() {
              const a = this.targets()[0].a;
              const x = cx + Math.cos(a) * radius - 2.5;
              const y = cy + Math.sin(a) * (radius * 0.35) - 2.5;
              p.style.left = x + 'px';
              p.style.top  = y + 'px';
            }
          });
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     CARD SWEEP EFFECT (for Phase 5 button activate)
  ════════════════════════════════════════════════════════════════ */
  function triggerCardSweeps(cards) {
    cards.forEach((c, i) => {
      setTimeout(() => {
        c.classList.add('p3d-sweep');
        setTimeout(() => c.classList.remove('p3d-sweep'), 900);
      }, i * 150);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     UTILS
  ════════════════════════════════════════════════════════════════ */
  function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function isMobile() { return window.innerWidth < 768; }
  function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  }

  /* ── Kick off when DOM is ready ─────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small defer to let other scripts (GSAP, Three.js) fully load
    setTimeout(init, 80);
  }

})();
