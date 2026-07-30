/* ============================================================
   Orbital Carousel Component — Vanilla JS
   Features: Drag (mouse + touch), arrow nav, dot nav, keyboard,
             snap-to-center, depth scaling, onChange callback,
             responsive recalculation, click-to-focus cards.
   ============================================================ */

(function (global) {
  'use strict';

  const TAU = Math.PI * 2;
  const DEG_TO_RAD = Math.PI / 180;
  const RAD_TO_DEG = 180 / Math.PI;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const wrapAngle = (a, center) => {
    const span = TAU;
    const half = span / 2;
    return center - (((center - a + half) % span + span) % span - half);
  };

  const easings = {
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    outSpring: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
  };

  class OrbitalCarousel {
    constructor(root, options = {}) {
      if (!root) throw new Error('OrbitalCarousel: root element required');

      this.root = root;
      this.options = Object.assign(
        {
          minScale: 0.72,
          minOpacity: 0.55,
          maxTiltY: 45,
          perspective: 1400,
          dragSensitivity: 0.0042,
          wheelSensitivity: 0.0025,
          wheelEnabled: false,
          snapEasing: 'outSpring',
          snapDuration: 850,
          onChange: null,
          initialIndex: 0,
          keyboard: true,
          clickToFocus: true,
          infinite: false,
        },
        options
      );

      this._init();
    }

    _init() {
      this.stage = this.root.querySelector('.orbital-carousel__stage');
      this.cardsWrap = this.root.querySelector('.orbital-carousel__cards');
      this.cards = Array.from(this.root.querySelectorAll('.orbital-card'));
      this.N = this.cards.length;
      if (this.N === 0) throw new Error('OrbitalCarousel: no .orbital-card elements found');

      this.controls = this.root.querySelector('.orbital-carousel__controls');
      this.btnPrev = this.root.querySelector('.orbital-nav-btn--prev');
      this.btnNext = this.root.querySelector('.orbital-nav-btn--next');
      this.dotsWrap = this.root.querySelector('.orbital-dots');
      this.progressRing = this.root.querySelector('.orbital-progress-ring circle');

      this._readCSSVars();
      this._halfIdx = (this.N - 1) / 2;
      this.rotation = this._rotationForIndex(this.options.initialIndex);
      this.targetRotation = this.rotation;
      this.activeIndex = this.options.initialIndex;

      this._buildDots();
      this._bindCardClicks();
      this._bindControls();
      this._bindDrag();
      this._bindKeyboard();
      if (this.options.wheelEnabled) this._bindWheel();
      this._initGSAPScrollTrigger();

      this._onResize = this._debounce(() => {
        this._readCSSVars();
        if (!this.options.infinite) {
          const [lo, hi] = this._rotationBounds();
          this.rotation = clamp(this.rotation, lo, hi);
        }
        this._render(true);
      }, 120);
      window.addEventListener('resize', this._onResize);

      this._render(true);
      this._setActive(this.options.initialIndex, true);

      requestAnimationFrame(() => this.root.classList.add('is-ready'));
    }

    _initGSAPScrollTrigger() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      
      gsap.registerPlugin(ScrollTrigger);

      const section = this.root.closest('.ai-workflow') || this.root.parentElement || this.root;
      
      if (this.options.pinnedScroll) {
        // Pin section in center of viewport and rotate cleanly from card 01 to 05
        ScrollTrigger.create({
          trigger: section,
          start: 'center center',
          end: `+=${(this.N - 1) * 350}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const rawIdx = self.progress * (this.N - 1);
            const targetRot = this._rotationForIndex(rawIdx);
            this.rotation = targetRot;
            const nearest = clamp(Math.round(rawIdx), 0, this.N - 1);
            if (nearest !== this.activeIndex) {
              this._setActive(nearest, false);
            }
            this._render(false);
          }
        });
      } else {
        // Unpinned natural scroll trigger: starts when cards top reaches 80% viewport (Card 01 focused)
        const targetElement = this.root.querySelector('.orbital-carousel__stage') || this.root;
        ScrollTrigger.create({
          trigger: targetElement,
          start: 'top 80%',
          end: 'bottom top',
          scrub: 0.5,
          onUpdate: (self) => {
            const rawIdx = self.progress * (this.N - 1);
            const targetRot = this._rotationForIndex(rawIdx);
            this.rotation = targetRot;
            const nearest = clamp(Math.round(rawIdx), 0, this.N - 1);
            if (nearest !== this.activeIndex) {
              this._setActive(nearest, false);
            }
            this._render(false);
          }
        });
      }
    }

    _readCSSVars() {
      const cs = getComputedStyle(this.root);
      const arcSpanDeg = parseFloat(cs.getPropertyValue('--oc-arc-span')) || 200;
      this.arcSpan = arcSpanDeg * DEG_TO_RAD;
      this.stepAngle = this.N > 1 ? this.arcSpan / (this.N - 1) : 0;
      this.radius = parseFloat(cs.getPropertyValue('--oc-radius')) || 340;
      this.cardWidth = parseFloat(cs.getPropertyValue('--oc-card-width')) || 260;
      this.cardHeight = parseFloat(cs.getPropertyValue('--oc-card-height')) || 300;
      return true;
    }

    _rotationForIndex(idx) {
      return (this._halfIdx - idx) * this.stepAngle;
    }

    _rotationBounds() {
      const r0 = this._rotationForIndex(0);
      const rN = this._rotationForIndex(this.N - 1);
      return [Math.min(r0, rN), Math.max(r0, rN)];
    }

    _buildDots() {
      if (!this.dotsWrap) return;
      this.dotsWrap.innerHTML = '';
      this.dots = [];
      for (let i = 0; i < this.N; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'orbital-dot' + (i === this.activeIndex ? ' is-active' : '');
        b.setAttribute('aria-label', `Go to step ${i + 1}`);
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goTo(i);
        });
        this.dotsWrap.appendChild(b);
        this.dots.push(b);
      }
    }

    _bindCardClicks() {
      if (!this.options.clickToFocus) return;
      this.cards.forEach((card, i) => {
        const hit = card.querySelector('.orbital-card__click-surface') || card;
        hit.addEventListener('click', (e) => {
          if (this._wasDragging) {
            this._wasDragging = false;
            return;
          }
          e.stopPropagation();
          this.goTo(i);
        });
      });
    }

    _bindControls() {
      if (this.btnPrev) {
        this.btnPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          this.prev();
        });
      }
      if (this.btnNext) {
        this.btnNext.addEventListener('click', (e) => {
          e.stopPropagation();
          this.next();
        });
      }
    }

    _bindDrag() {
      const stage = this.stage || this.root;
      let startX = 0;
      let startY = 0;
      let startRotation = 0;
      let dragging = false;
      let lastX = 0;
      let lastT = 0;
      let velocity = 0;

      const onDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        const p = this._pointer(e);
        startX = p.x;
        startY = p.y;
        startRotation = this.rotation;
        dragging = true;
        lastX = p.x;
        lastT = performance.now();
        velocity = 0;
        this._stopAnimation();
        this.root.classList.add('is-dragging');
      };

      const onMove = (e) => {
        if (!dragging) return;
        const p = this._pointer(e);
        const dx = p.x - startX;
        const dy = p.y - startY;
        if (!this._dragMoved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        this._dragMoved = true;
        e.preventDefault && e.preventDefault();

        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        velocity = (p.x - lastX) / dt;
        lastX = p.x;
        lastT = now;

        let newRot = startRotation + dx * this.options.dragSensitivity;
        if (!this.options.infinite) {
          const [lo, hi] = this._rotationBounds();
          newRot = clamp(newRot, lo, hi);
        }
        this.rotation = newRot;
        this._render(false);
      };

      const onUp = (e) => {
        if (!dragging) return;
        dragging = false;
        this.root.classList.remove('is-dragging');

        this._wasDragging = this._dragMoved;
        this._dragMoved = false;

        const snapIdx = this._nearestIndexWithMomentum(velocity);
        this._snapTo(snapIdx);
      };

      stage.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);

      stage.addEventListener('touchstart', onDown, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
      window.addEventListener('touchcancel', onUp);
    }

    _bindKeyboard() {
      if (!this.options.keyboard) return;
      this.root.setAttribute('tabindex', '0');
      this.root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'Home') {
          e.preventDefault();
          this.goTo(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          this.goTo(this.N - 1);
        }
      });
    }

    _bindWheel() {
      let wheelLock = false;
      this.root.addEventListener(
        'wheel',
        (e) => {
          if (wheelLock) return;
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (Math.abs(delta) < 10) return;
          e.preventDefault();
          this._stopAnimation();
          this.rotation -= delta * this.options.wheelSensitivity;
          if (!this.options.infinite) {
            const [lo, hi] = this._rotationBounds();
            this.rotation = clamp(this.rotation, lo, hi);
          }
          this._render(false);
          clearTimeout(wheelLock);
          wheelLock = setTimeout(() => {
            const idx = this._nearestIndex(this.rotation);
            this._snapTo(idx);
          }, 140);
        },
        { passive: false }
      );
      const stage = this.stage || this.root;
      stage.addEventListener('wheel', (e) => {
        if (!this.options.wheelEnabled) return;
        
        const delta = e.deltaY;
        if (Math.abs(delta) < 10) return;

        // If pinned scroll mode is enabled
        if (this.options.pinnedScroll) {
          if (delta > 0) {
            // Scrolling down -> go to next item if not at end
            if (this.activeIndex < this.N - 1) {
              e.preventDefault();
              if (!this._wheelCooldown) {
                this.next();
                this._setWheelCooldown();
              }
            }
          } else {
            // Scrolling up -> go to prev item if not at top
            if (this.activeIndex > 0) {
              e.preventDefault();
              if (!this._wheelCooldown) {
                this.prev();
                this._setWheelCooldown();
              }
            }
          }
          return;
        }

        // Default wheel handling
        e.preventDefault();
        const rotDelta = -delta * this.options.wheelSensitivity;
        let newRot = this.rotation + rotDelta;
        if (!this.options.infinite) {
          const [lo, hi] = this._rotationBounds();
          newRot = clamp(newRot, lo, hi);
        }
        this.rotation = newRot;
        this._render(false);

        clearTimeout(this._wheelSnapTimer);
        this._wheelSnapTimer = setTimeout(() => {
          const snapIdx = this._nearestIndex();
          this._snapTo(snapIdx);
        }, 150);
      }, { passive: false });
    }

    _setWheelCooldown() {
      this._wheelCooldown = true;
      setTimeout(() => {
        this._wheelCooldown = false;
      }, 400);
    }

    _pointer(e) {
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    _nearestIndex() {
      const half = (this.N - 1) / 2;
      let minDiff = Infinity;
      let bestIdx = 0;
      for (let i = 0; i < this.N; i++) {
        const targetRot = (half - i) * this.stepAngle;
        const diff = Math.abs(this.rotation - targetRot);
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    _nearestIndexWithMomentum(velocity) {
      const baseIdx = this._nearestIndex();
      const threshold = 0.45;
      if (Math.abs(velocity) > threshold) {
        const dir = velocity > 0 ? -1 : 1;
        const candidate = baseIdx + dir;
        if (candidate >= 0 && candidate < this.N) return candidate;
      }
      return baseIdx;
    }

    _snapTo(idx) {
      idx = clamp(Math.round(idx), 0, this.N - 1);
      const targetRot = this._rotationForIndex(idx);
      this._animateTo(targetRot, () => {
        this._setActive(idx, false);
      });
    }

    _animateTo(targetRot, onDone) {
      this._stopAnimation();
      const startRot = this.rotation;
      const delta = targetRot - startRot;
      const duration = this.options.snapDuration;
      const easing = easings[this.options.snapEasing] || easings.outSpring;
      const startT = performance.now();

      const step = (now) => {
        const t = clamp((now - startT) / duration, 0, 1);
        const e = easing(t);
        this.rotation = startRot + delta * e;
        this._render(false);
        if (t < 1) {
          this._raf = requestAnimationFrame(step);
        } else {
          this.rotation = targetRot;
          this._raf = null;
          onDone && onDone();
        }
      };
      this._raf = requestAnimationFrame(step);
    }

    _stopAnimation() {
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
    }

    _setActive(idx, silent) {
      const changed = idx !== this.activeIndex;
      this.activeIndex = idx;

      this.cards.forEach((c, i) => {
        if (i === idx) c.classList.add('is-active');
        else c.classList.remove('is-active');
      });

      if (this.dots) {
        this.dots.forEach((d, i) => {
          if (i === idx) d.classList.add('is-active');
          else d.classList.remove('is-active');
        });
      }

      if (this.progressRing) {
        const r = parseFloat(this.progressRing.getAttribute('r')) || 49.5;
        const circumference = r * TAU;
        const progress = this.N > 1 ? idx / (this.N - 1) : 0;
        this.progressRing.style.strokeDasharray = `${circumference}`;
        this.progressRing.style.strokeDashoffset = `${circumference * (1 - progress)}`;
      }

      if (changed && !silent && typeof this.options.onChange === 'function') {
        try {
          this.options.onChange(idx, this.cards[idx]);
        } catch (_) {}
      }
    }

    _render(snap) {
      const arcHalf = this.arcSpan / 2;
      const half = (this.N - 1) / 2;

      this.cards.forEach((card, i) => {
        const baseAngle = (i - half) * this.stepAngle;
        const a = baseAngle + this.rotation;

        const clampedA = clamp(a, -arcHalf, arcHalf);
        const absA = Math.abs(a);
        const excess = Math.max(0, absA - arcHalf);
        const normOnArc = arcHalf === 0 ? 0 : clamp(absA / arcHalf, 0, 1);
        const excessFalloff = Math.min(1, excess / (Math.PI - arcHalf + 0.01));
        const norm = clamp(normOnArc + excessFalloff * 0.8, 0, 1);
        const sign = a >= 0 ? 1 : -1;

        const scale = lerp(1, this.options.minScale, norm);
        const opacity = lerp(1, this.options.minOpacity, norm) * (1 - excessFalloff * 0.5);
        const blur = norm > 0.7 ? (norm - 0.7) * 4 : 0;
        const brightness = lerp(1, 0.92, norm * 0.5);

        const r = this.radius;
        // Wider horizontal spread so 3 cards are clearly spaced (2.2× radius)
        const rotOffset = Math.sin(clampedA) * (r * 2.2);
        // Strong arc curve — side cards drop 35% of card height below center
        const arcDrop = norm * (this.cardHeight * 0.35);
        const excessStack = excess > 0 ? excess * 30 : 0;
        const stackX = sign * excessStack;
        const zDepth = 1 - norm;
        const zIndex = Math.round(zDepth * this.N * 10) + this.N - Math.round(norm * (this.N - i - 1));

        card.style.transform = `translate3d(${rotOffset + stackX}px, ${arcDrop}px, 0) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
        card.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px) brightness(${brightness})` : `brightness(${brightness})`;
        card.style.pointerEvents = excessFalloff > 0.5 ? 'none' : 'auto';
      });
    }

    _debounce(fn, wait) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    goTo(idx) {
      this._stopAnimation();
      this._snapTo(clamp(Math.round(idx), 0, this.N - 1));
    }

    next() {
      this.goTo(Math.min(this.activeIndex + 1, this.N - 1));
    }

    prev() {
      this.goTo(Math.max(this.activeIndex - 1, 0));
    }

    getActiveIndex() {
      return this.activeIndex;
    }

    setOnChange(cb) {
      this.options.onChange = cb;
    }

    destroy() {
      this._stopAnimation();
      window.removeEventListener('resize', this._onResize);
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrbitalCarousel;
  } else {
    global.OrbitalCarousel = OrbitalCarousel;
  }
})(typeof window !== 'undefined' ? window : this);
