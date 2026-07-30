/* ============================================================
   Seawind — Premium 3D Immersive Scroll Hero (logic)
   Requires: three.js (r128+), gsap 3.x + ScrollTrigger
   Usage: include after those two CDN scripts, on a page that
   contains the .hero3d markup from hero-3d-section.html
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.querySelector(".hero3d");
  if (!hero) return;

  /* ---------------- Three.js: animated ocean/wave mesh ---------------- */
  var scene, camera, renderer, waveMesh, waveGeo, clock;
  var mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;

  function initWaveScene() {
    var canvas = hero.querySelector(".hero3d-canvas");
    if (!canvas || typeof THREE === "undefined") return false;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, hero.clientWidth / hero.clientHeight, 0.1, 1000);
    camera.position.set(0, 55, 95);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(hero.clientWidth, hero.clientHeight);

    var isMobile = window.innerWidth < 768;
    var segments = isMobile ? 32 : 64;
    waveGeo = new THREE.PlaneGeometry(320, 220, segments, Math.round(segments * 0.6));
    waveGeo.rotateX(-Math.PI / 2.3);

    var accent = new THREE.Color(0x0055cc);
    var accent3 = new THREE.Color(0x00c8ff);
    var colors = [];
    var pos = waveGeo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var t = (pos.getY(i) + 40) / 80;
      var c = accent.clone().lerp(accent3, THREE.MathUtils.clamp(t, 0, 1));
      colors.push(c.r, c.g, c.b);
    }
    waveGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    var mat = new THREE.PointsMaterial({
      size: isMobile ? 1.6 : 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    waveMesh = new THREE.Points(waveGeo, mat);
    waveMesh.position.y = -18;
    scene.add(waveMesh);

    clock = new THREE.Clock();
    return true;
  }

  function animateWave() {
    if (!renderer) return;
    requestAnimationFrame(animateWave);
    var t = clock.getElapsedTime();
    var pos = waveGeo.attributes.position;
    var arr = pos.array;
    for (var i = 0; i < arr.length; i += 3) {
      var x = arr[i];
      var z = arr[i + 2];
      arr[i + 1] = Math.sin(x * 0.05 + t * 0.6) * 6 + Math.cos(z * 0.08 + t * 0.4) * 4;
    }
    pos.needsUpdate = true;

    targetRotY += (mouseX * 0.15 - targetRotY) * 0.04;
    targetRotX += (mouseY * 0.08 - targetRotX) * 0.04;
    scene.rotation.y = targetRotY;
    scene.rotation.x = targetRotX;

    renderer.render(scene, camera);
  }

  function onResize() {
    if (!renderer || !camera) return;
    var w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---------------- Mouse parallax on content/cards ---------------- */
  function initParallax() {
    var content = hero.querySelector(".hero3d-content");
    var stage = hero.querySelector(".hero3d-stage");
    if (!content || !stage || typeof gsap === "undefined") return;

    var qContentX = gsap.quickTo(content, "rotateY", { duration: 0.6, ease: "power3.out" });
    var qContentY = gsap.quickTo(content, "rotateX", { duration: 0.6, ease: "power3.out" });
    var qStageX = gsap.quickTo(stage, "rotateY", { duration: 0.5, ease: "power3.out" });
    var qStageY = gsap.quickTo(stage, "rotateX", { duration: 0.5, ease: "power3.out" });

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = px * 2;
      mouseY = py * 2;
      qContentX(px * 4);
      qContentY(-py * 4);
      qStageX(px * -10);
      qStageY(py * 10);
    });
    hero.addEventListener("mouseleave", function () {
      mouseX = 0; mouseY = 0;
      qContentX(0); qContentY(0); qStageX(0); qStageY(0);
    });
  }

  /* ---------------- GSAP intro + scroll-driven depth timeline ---------------- */
  function initTimelines() {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(window.ScrollTrigger);

    var words = hero.querySelectorAll(".hero3d-line .word");
    var intro = gsap.timeline({ delay: 0.2 });

    intro
      .to(".hero3d-badge", { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" })
      .to(words, {
        opacity: 1,
        translateZ: 0,
        translateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: "power4.out",
        stagger: 0.045,
      }, "-=0.2")
      .to(".hero3d-sub", { opacity: 1, translateZ: 0, translateY: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .to(".hero3d-cta", { opacity: 1, translateZ: 0, translateY: 0, duration: 0.7, ease: "power3.out" }, "-=0.55")
      .to(".hero3d-trust", { opacity: 1, translateZ: 0, translateY: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
      .to(".hero3d-stage", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .from(".hero3d-card-main", { y: 40, duration: 0.9, ease: "power3.out" }, "-=0.8")
      .from(".hero3d-card-float-1", { y: 30, x: -20, duration: 0.8, ease: "back.out(1.4)" }, "-=0.7")
      .from(".hero3d-card-float-2", { y: -30, x: 20, duration: 0.8, ease: "back.out(1.4)" }, "-=0.7")
      .to(".hero3d-scrollcue", { opacity: 1, duration: 0.5 }, "-=0.3");

    if (reduceMotion) return;

    /* Floating idle motion for the cards */
    gsap.to(".hero3d-card-float-1", { y: "+=14", duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".hero3d-card-float-2", { y: "-=14", duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.4 });

    /* Scroll-pinned dive: camera pushes forward, content exits in 3D */
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        if (camera) {
          camera.position.z = 95 - p * 55;
          camera.position.y = 55 - p * 20;
          camera.lookAt(0, 0, 0);
        }
        gsap.set(".hero3d-grid-overlay", { opacity: Math.min(p * 2, 1) * 0.9 });
        gsap.set(".hero3d-content", {
          rotateX: p * 18,
          y: p * -60,
          opacity: 1 - p * 1.15,
        });
        gsap.set(".hero3d-stage", {
          rotateX: p * -14,
          scale: 1 + p * 0.12,
          y: p * -40,
          opacity: 1 - p * 1.15,
        });
        gsap.set(".hero3d-scrollcue", { opacity: 1 - p * 3 });
      },
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    var wavesOk = false;
    if (!reduceMotion) {
      wavesOk = initWaveScene();
      if (wavesOk) {
        animateWave();
        window.addEventListener("resize", onResize);
      }
      initParallax();
    }
    initTimelines();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 0);
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
