/* Round Carousel — Vanilla JS */
(function () {
  'use strict';

  const TECH_SETS = {
    ai: [
      { src: 'images/technologies/chat-gpt.png',             label: 'OpenAI' },
      { src: 'images/technologies/Codex.png',                label: 'Codex' },
      { src: 'images/technologies/Verterx-ai.png',           label: 'Vertex AI' },
      { src: 'images/technologies/cloud-vision.png',         label: 'Cloud Vision' },
      { src: 'images/technologies/openCv.png',               label: 'OpenCV' },
      { src: 'images/technologies/tensor-flow.png',          label: 'TensorFlow' },
      { src: 'images/technologies/IBM-Watson.png',           label: 'IBM Watson' },
      { src: 'images/technologies/Gemini.png',               label: 'Gemini' },
      { src: 'images/technologies/Anthropic.png',            label: 'Anthropic' },
      { src: 'images/technologies/Mistral.png',              label: 'Mistral' },
      { src: 'images/technologies/LLama.png',                label: 'Meta Llama' },
      { src: 'images/technologies/Cognitive-services.png',   label: 'Cognitive Svc' },
      { src: 'images/technologies/Bot-Framework.png',        label: 'Bot Framework' },
      { src: 'images/technologies/Cloud-Natural-Language.png', label: 'Cloud NLP' },
    ],
    mobile: [
      { src: 'images/technologies/ios.png',           label: 'iOS' },
      { src: 'images/technologies/android.png',       label: 'Android' },
      { src: 'images/technologies/flutter-logo.png',  label: 'Flutter' },
      { src: 'images/technologies/react-native.png',  label: 'React Native' },
      { src: 'images/technologies/Swift.png',         label: 'Swift' },
      { src: 'images/technologies/kotlin.png',        label: 'Kotlin' },
      { src: 'images/technologies/Titanium.png',      label: 'Titanium' },
    ],
    frontend: [
      { src: 'images/technologies/react-Js.png',          label: 'React' },
      { src: 'images/technologies/Vue.js_Logo.png',        label: 'Vue.js' },
      { src: 'images/technologies/AngularJS.png',          label: 'Angular' },
      { src: 'images/technologies/javascript-logo.png',    label: 'JavaScript' },
      { src: 'images/technologies/typescript.png',         label: 'TypeScript' },
      { src: 'images/technologies/html.png',               label: 'HTML5' },
      { src: 'images/technologies/css.png',                label: 'CSS3' },
    ],
    database: [
      { src: 'images/technologies/my-sql.png',              label: 'MySQL' },
      { src: 'images/technologies/PostgreSQL.png',          label: 'PostgreSQL' },
      { src: 'images/technologies/mongodb.png',             label: 'MongoDB' },
      { src: 'images/technologies/Sqlite-square-icon.png',  label: 'SQLite' },
      { src: 'images/technologies/Oracle.png',              label: 'Oracle' },
      { src: 'images/technologies/redis.png',               label: 'Redis' },
    ],
    backend: [
      { src: 'images/technologies/Node.js_logo.svg.png',  label: 'Node.js' },
      { src: 'images/technologies/php.png',               label: 'PHP' },
      { src: 'images/technologies/Java.png',              label: 'Java' },
      { src: 'images/technologies/dot-net.png',           label: '.NET' },
      { src: 'images/technologies/Python.png',            label: 'Python' },
      { src: 'images/technologies/rubyonrails.png',       label: 'Ruby on Rails' },
      { src: 'images/technologies/WordPress.png',         label: 'WordPress' },
    ],
    cms: [
      { src: 'images/technologies/WordPress.png',  label: 'WordPress' },
      { src: 'images/technologies/drupal.png',     label: 'Drupal' },
      { src: 'images/technologies/joomla.png',     label: 'Joomla' },
      { src: 'images/technologies/shopify.png',    label: 'Shopify' },
      { src: 'images/technologies/magento.png',    label: 'Magento' },
    ],
    devops: [
      { src: 'images/technologies/docker.png',       label: 'Docker' },
      { src: 'images/technologies/Kubernetes.png',   label: 'Kubernetes' },
      { src: 'images/technologies/aws.png',          label: 'AWS' },
      { src: 'images/technologies/azure_Devops.png', label: 'Azure DevOps' },
      { src: 'images/technologies/Terraform.png',    label: 'Terraform' },
      { src: 'images/technologies/jenkins.png',      label: 'Jenkins' },
    ],
  };

  /* Card size & spacing */
  const W = 130, H = 130, SPACING = 1.3, SPEED = 6, TILT = -8, PERSPECTIVE = 3000;
  const BASE_DEG_PER_SEC = SPEED * 6;

  function RoundCarousel(wrap, images) {
    const count  = images.length;
    const angle  = 360 / count;
    /* SPACING multiplier pushes cards apart → bigger circle */
    const radius = (W * SPACING) / (2 * Math.tan(Math.PI / count));
    const degPerSec = BASE_DEG_PER_SEC;

    let rotY = 0, vel = 0, lastT = 0, raf = 0;
    let hoverDir = 1; /* 1 = normal, -1 = reversed */
    const drag = { active: false, x: 0 };

    /* ── DOM ── */
    wrap.innerHTML = '';

    const tiltDiv = document.createElement('div');
    tiltDiv.className = 'rc-tilt';

    const ring = document.createElement('div');
    ring.className = 'rc-ring';
    ring.style.width  = W + 'px';
    ring.style.height = H + 'px';

    const faces = [];

    images.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'rc-item';
      item.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`;

      const face = document.createElement('div');
      face.className = 'rc-face';
      face.style.backgroundImage = `url(${img.src})`;

      const lbl = document.createElement('span');
      lbl.className = 'rc-label';
      lbl.textContent = img.label;
      face.appendChild(lbl);

      const glow = document.createElement('div');
      glow.className = 'rc-glow';
      face.appendChild(glow);

      item.appendChild(face);
      ring.appendChild(item);
      faces.push({ item, face, baseAngle: i * angle });
    });

    tiltDiv.appendChild(ring);
    wrap.appendChild(tiltDiv);

    /* ── Mouse-reactive 3D Tech Ring ── */
    let mouseTargetX = 0, mouseTargetY = 0;
    let currX = 0, currY = 0;

    function onMouseMove(e) {
      if (!wrap || !wrap.offsetParent) return;
      const rect = wrap.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      const distance = 25;
      const angle = Math.atan2(dy, dx);

      mouseTargetX = Math.cos(angle) * distance;
      mouseTargetY = Math.sin(angle) * distance;

      if (Math.abs(dx) > 15) {
        hoverDir = dx > 0 ? 1 : -1;
      }
    }

    document.addEventListener("mousemove", onMouseMove);

    /* ── Animation ── */
    function apply() {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotY}deg)`;

      /* Dim back-facing cards so the full ring is visible but depth is clear */
      faces.forEach(({ face, baseAngle }) => {
        /* world angle of this card's normal */
        const worldAngle = ((baseAngle + rotY) % 360 + 360) % 360;
        /* cos of the angle: 1 = fully front, -1 = fully back */
        const cosA = Math.cos(worldAngle * Math.PI / 180);
        /* front: brightness 1, back: brightness 0.25 */
        const brightness = cosA > 0
          ? 0.55 + 0.45 * cosA          /* front half  → 0.55 … 1.0  */
          : 0.25 + 0.30 * (1 + cosA);   /* back half   → 0.25 … 0.55 */
        face.style.filter = `brightness(${brightness.toFixed(3)})`;
      });
    }

    function draw(now) {
      const dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0;
      lastT = now;

      // Lerp tech ring towards mouse direction
      currX += (mouseTargetX - currX) * 0.1;
      currY += (mouseTargetY - currY) * 0.1;

      tiltDiv.style.transform = `rotateX(${-8 + currY * 0.4}deg) rotateY(${currX * 0.4}deg) translate(${currX * 1.2}px, ${currY * 1.2}px)`;

      if (!drag.active) {
        if (Math.abs(vel) > 0.01) { rotY += vel * dt; vel *= 0.93; }
        else { rotY += degPerSec * hoverDir * dt; }
      }
      apply();
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    /* ── Hover direction reversal & reset ── */
    wrap.addEventListener('mouseleave', () => {
      mouseTargetX = 0;
      mouseTargetY = 0;
      hoverDir = 1;
    });

    /* ── Drag ── */
    wrap.addEventListener('pointerdown', e => {
      wrap.setPointerCapture(e.pointerId);
      drag.active = true; drag.x = e.clientX; vel = 0;
    });
    wrap.addEventListener('pointermove', e => {
      if (!drag.active) return;
      const dx = e.clientX - drag.x; drag.x = e.clientX;
      rotY += dx * 1.2; vel = dx * 1.2 * 60;
    });
    const stopDrag = e => {
      wrap.releasePointerCapture(e.pointerId); drag.active = false;
    };
    wrap.addEventListener('pointerup',     stopDrag);
    wrap.addEventListener('pointercancel', stopDrag);

    return {
      destroy() {
        cancelAnimationFrame(raf);
        document.removeEventListener("mousemove", onMouseMove);
        wrap.innerHTML = '';
      }
    };

  }

  /* ── Init ── */
  function init() {
    const wrap = document.getElementById('roundCarouselWrap');
    if (!wrap) return;
    let current = null;

    function load(key) {
      if (current) current.destroy();
      current = RoundCarousel(wrap, TECH_SETS[key] || TECH_SETS.ai);
    }

    document.querySelectorAll('.tech-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tech-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        load(btn.dataset.tab);
      });
    });

    load('ai');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
