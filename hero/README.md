# Seawind — Premium 3D Immersive Scroll Hero

A drop-in replacement for the current `.hero` slider section on [dhruvbhatt11102005.github.io/Seawind_Animation](https://dhruvbhatt11102005.github.io/Seawind_Animation/). Built to match the live site's existing theme exactly — same fonts (Inter + Space Grotesk), same blue/cyan brand colours (`--accent #0055cc`, `--accent2 #1a7fff`, `--accent3 #00c8ff`), same pill buttons and badge style. No new color tokens were introduced.

## What it does

- **WebGL wave/particle ocean** (Three.js) rendered behind the hero content in the site's blue → cyan gradient — a nod to "Seawind" itself.
- **3D depth intro**: badge, heading words, subtitle, CTAs and floating dashboard-style cards fly in from Z-depth on load (CSS 3D transforms driven by GSAP).
- **Mouse parallax**: the text block and the floating card stack tilt gently toward the cursor for a tactile, immersive feel.
- **Scroll-pinned dive**: as the user scrolls past the hero, it stays pinned while the camera pushes forward through the wave and the content/cards rotate and fade away in 3D, revealing the next section — built with GSAP ScrollTrigger.
- Respects `prefers-reduced-motion` (falls back to a static, fully-visible hero) and scales down complexity on mobile (fewer particles, floating side-cards hidden under 560px).

## Files

| File | Purpose |
|---|---|
| `preview.html` | Fully self-contained demo — open directly to see it working, includes a placeholder "next section" so you can see the scroll-exit transition. |
| `hero-3d-section.html` | Just the `<section class="hero3d">...</section>` markup — this is what you paste into `index.html`. |
| `hero-3d.css` | Drop-in stylesheet. Uses your site's existing CSS variables (`--accent`, `--grad`, `--radius`, etc.) — nothing new to theme. |
| `hero-3d.js` | The Three.js scene + GSAP intro/scroll logic. |

## How to preview it right now

Open `preview.html` in a browser (it pulls Three.js/GSAP from CDN, so you need internet access) — no build step needed.

## How to integrate into your real site

1. Copy `hero-3d.css` and `hero-3d.js` into your repo root (next to `style.css`).
2. In `index.html`, add to `<head>` (after your existing font/CSS links):
   ```html
   <link rel="stylesheet" href="hero-3d.css" />
   ```
3. Replace the existing `<section class="hero">...</section>` block (and its slider markup) with the contents of `hero-3d-section.html`.
4. Right before your closing `</body>` tag, after your existing `script.js`/`animations.js` includes, add:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
   <script src="hero-3d.js"></script>
   ```
5. Delete the old hero slider JS logic (arrows/dots/autoplay) from `script.js` if you're fully retiring the slider — the new hero doesn't use it.

Copy is placeholder text pulled from your real homepage ("Now is the Time for your Dream Website", "Ahmedabad's #1 Digital Agency", etc.) — swap in whatever headline/stats you want for each of your other hero slides, or turn this into slide 1 of a rebuilt slider if you still want multiple rotating messages.

## Heads-up: old files in your personal space

`index-enhanced.html`, `premium-3d.css`, and `premium-3d.js` already existed in your personal space before this task. They use a **dark violet/cyan theme** (`#07070f` background, `#7c3aed` purple) that doesn't match your actual live site's light blue/white theme — looks like an earlier attempt that guessed at a theme instead of checking the real one. I left them untouched; let me know if you'd like them deleted or reconciled.
