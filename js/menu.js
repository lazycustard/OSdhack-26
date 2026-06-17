/* ============================================================
 * menu.js — Circular Menu Controller (Elliptical Ring)
 * ============================================================
 * PURPOSE:
 *   Renders and controls the elliptical navigation ring.
 *   All items from CONFIG.menuItems are positioned using
 *   sin/cos on an ellipse (wider than tall).
 *
 * FEATURES:
 *   - Elliptical orbit with visible dashed path (SVG)
 *   - Pixel-art SVG icons in golden circles
 *   - Ring slowly auto-rotates, pauses on hover
 *   - Night scene background with stars/trees/water
 *   - Logo in center, "PRESS START" below
 *   - Keyboard: Arrow keys, WASD; Enter to select
 *   - Mouse: hover glow, click to select
 *   - Gamepad: D-pad/joystick, A to select
 *
 * CUSTOMIZATION:
 *   - CONFIG.menuItems[]: add/remove/reorder
 *   - CONFIG.logo: center logo image
 *   - CONFIG.timings.menuRotationSpeed: seconds per full orbit
 * ============================================================ */

const MenuScreen = (() => {
  'use strict';

  const $ = Utils.$;
  let active = false;
  let currentIndex = 0;
  let rotationAngle = 0;
  let rotationPaused = false;
  let stopRotation = null;
  let nodes = [];

  /* ---- PIXEL-ART SVG ICONS ----
   * Each icon is an inline SVG matching the golden arcade style.
   * These are used as the visual inside each menu node circle.
   * If you want to use image files instead, set icon in CONFIG
   * to a file path and this will be skipped.
   */
  const SVG_ICONS = {
    about: `<svg viewBox="0 0 32 32"><circle cx="16" cy="8" r="4"/><rect x="13" y="14" width="6" height="14" rx="1"/><rect x="12" y="14" width="8" height="3" rx="1"/></svg>`,
    tracks: `<svg viewBox="0 0 32 32"><path d="M12 4v18c-1.5-1-3.5-1.5-5 0-2 2-1 5 2 5s5-2 5-4V10h8v10c-1.5-1-3.5-1.5-5 0-2 2-1 5 2 5s5-2 5-4V4H12z"/></svg>`,
    rules: `<svg viewBox="0 0 32 32"><path d="M8 2h16v4h-4v2h6v22H6V8h6V6H8V2zm4 6v4h8v-4h-8zM10 16h12v2H10v-2zm0 5h12v2H10v-2z"/><path d="M14 3h4v4h-4z"/></svg>`,
    schedule: `<svg viewBox="0 0 32 32"><rect x="3" y="6" width="26" height="23" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="3" y1="12" x2="29" y2="12" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="3" x2="10" y2="9" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="3" x2="22" y2="9" stroke="currentColor" stroke-width="2.5"/><rect x="7" y="16" width="4" height="3" rx="0.5"/><rect x="14" y="16" width="4" height="3" rx="0.5"/><rect x="21" y="16" width="4" height="3" rx="0.5"/><rect x="7" y="22" width="4" height="3" rx="0.5"/><rect x="14" y="22" width="4" height="3" rx="0.5"/></svg>`,
    prizes: `<svg viewBox="0 0 32 32"><path d="M10 4h12v10c0 5-3 8-6 10-3-2-6-5-6-10V4z"/><path d="M10 8H5c0 6 3 7 5 7"/><path d="M22 8h5c0 6-3 7-5 7"/><rect x="13" y="24" width="6" height="3"/><rect x="10" y="27" width="12" height="2"/></svg>`,
    sponsors: `<svg viewBox="0 0 32 32"><polygon points="16,2 20.5,11 30,12.5 23,20 25,30 16,25 7,30 9,20 2,12.5 11.5,11"/></svg>`,
    faq: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 12c0-3 2.5-5 4-5 3 0 5 2 5 4.5 0 2.5-2.5 3-4.5 5"/><rect x="15" y="24" width="3" height="3" rx="0.5"/></svg>`,
    team: `<svg viewBox="0 0 32 32"><circle cx="10" cy="9" r="4"/><circle cx="22" cy="9" r="4"/><path d="M2 26c0-5 5-9 8-9 1.5 0 3 .5 4 2"/><path d="M18 19c1-1.5 2.5-2 4-2 3 0 8 4 8 9"/><circle cx="16" cy="13" r="4"/><path d="M6 30c0-6 6-10 10-10s10 4 10 10"/></svg>`,
    topics: `<svg viewBox="0 0 32 32"><rect x="2" y="4" width="20" height="14" rx="2"/><polygon points="8,18 12,23 16,18"/><rect x="10" y="14" width="20" height="14" rx="2"/><polygon points="24,28 20,32 16,28"/></svg>`,
    announcements: `<svg viewBox="0 0 32 32"><path d="M6 12h4l10-7v22L10 20H6a2 2 0 01-2-2v-4a2 2 0 012-2z"/><path d="M24 10c2 2 3 4 3 6s-1 4-3 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    participate: `<svg viewBox="0 0 32 32"><circle cx="10" cy="8" r="4"/><circle cx="22" cy="8" r="4"/><circle cx="16" cy="14" r="4"/><path d="M2 28c0-6 5-10 8-10 2 0 4 1 6 3 2-2 4-3 6-3 3 0 8 4 8 10"/></svg>`,
    contact: `<svg viewBox="0 0 32 32"><rect x="2" y="6" width="28" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M2 8l14 10L30 8" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`,
  };

  /* ---- SHOW MENU SCREEN ---- */
  function show() {
    const screen = $('menuScreen');
    if (!screen) return;

    // Apply config background
    Utils.setBackground(screen, CONFIG.menuBackground);

    // Initialize the pizza game instead of the logo
    if (window.PizzaGame) {
      PizzaGame.init();
    }

    // Build menu nodes + orbit path
    buildNodes();
    buildOrbitPath();
    buildStars();

    // Show screen
    screen.classList.add('active');
    active = true;

    // Start auto-rotation
    startRotation();
    positionNodes();
    bindInputs();
  }

  /* ---- BUILD ORBIT PATH (dashed ellipse SVG) ---- */
  function buildOrbitPath() {
    const container = $('menuOrbitPath');
    if (!container) return;

    container.innerHTML = `
      <svg width="100%" height="100%" style="overflow: visible;">
        <ellipse cx="50%" cy="50%" rx="50%" ry="50%"/>
      </svg>`;
  }

  /* ---- BUILD STARS ---- */
  function buildStars() {
    const container = $('menuStars');
    if (!container || container.children.length > 0) return;

    for (let i = 0; i < 60; i++) {
      const star = Utils.createElement('div', 'menu-star');
      star.style.left = Utils.randFloat(0, 100) + '%';
      star.style.top = Utils.randFloat(0, 55) + '%';
      star.style.setProperty('--tw-a', Utils.randFloat(0.3, 0.8).toFixed(2));
      star.style.setProperty('--tw-dur', Utils.randFloat(1, 4).toFixed(1) + 's');
      star.style.setProperty('--tw-del', Utils.randFloat(0, 3).toFixed(1) + 's');
      const size = Math.random() < 0.15 ? 3 : (Math.random() < 0.4 ? 2 : 1);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      container.appendChild(star);
    }
  }

  /* ---- BUILD MENU NODES ---- */
  function buildNodes() {
    const ring = $('menuRing');
    if (!ring) return;
    ring.innerHTML = '';
    nodes = [];

    CONFIG.menuItems.forEach((item, i) => {
      const node = Utils.createElement('div', 'menu-node');
      node.setAttribute('data-id', item.id);
      node.setAttribute('data-index', i);
      node.style.setProperty('--node-color', item.color || '#FF8C00');

      // Icon circle
      const iconWrap = Utils.createElement('div', 'menu-node-icon');
      // User will put PNGs later. Leaving icon empty.
      /*
      if (SVG_ICONS[item.id]) {
        iconWrap.innerHTML = SVG_ICONS[item.id];
      } else {
        iconWrap.textContent = item.icon || '⭐';
      }
      */
      iconWrap.innerHTML = '';
      node.appendChild(iconWrap);

      // Label
      const label = Utils.createElement('div', 'menu-node-label');
      label.textContent = item.label;
      node.appendChild(label);

      // Mouse events
      node.addEventListener('mouseenter', () => {
        if (!active) return;
        rotationPaused = true;
        if (i !== currentIndex) {
          currentIndex = i;
          updateSelection();
          Audio.playHover();
        }
      });

      node.addEventListener('mouseleave', () => {
        rotationPaused = false;
      });

      node.addEventListener('click', () => {
        if (!active) return;
        currentIndex = i;
        selectCurrent();
      });

      ring.appendChild(node);
      nodes.push(node);
    });
  }

  /* ---- POSITION NODES (elliptical) ---- */
  function positionNodes() {
    const total = nodes.length;
    if (total === 0) return;

    const angleStep = 360 / total;

    nodes.forEach((node, i) => {
      // Start from top (-90°) and distribute clockwise
      const baseAngle = -90 + (i * angleStep);
      const finalAngle = baseAngle + rotationAngle;
      const rad = Utils.degToRad(finalAngle);

      // Elliptical: cos for x, sin for y
      const cx = Math.cos(rad);
      const cy = Math.sin(rad);

      node.style.setProperty('--cx', cx.toFixed(4));
      node.style.setProperty('--cy', cy.toFixed(4));
    });

    updateSelection();
  }

  /* ---- UPDATE SELECTION ---- */
  function updateSelection() {
    nodes.forEach((node, i) => {
      node.classList.toggle('selected', i === currentIndex);
    });

    const centerLabel = $('menuCenterLabel');
    if (centerLabel && CONFIG.menuItems[currentIndex]) {
      const item = CONFIG.menuItems[currentIndex];
      centerLabel.textContent = '▸ ' + item.label + ' ◂';
      centerLabel.style.color = item.color || '#FFD700';
    }
  }

  /* ---- AUTO-ROTATION ---- */
  function startRotation() {
    const speed = 360 / CONFIG.timings.menuRotationSpeed;

    stopRotation = Utils.animationLoop((dt) => {
      if (rotationPaused || !active) return;
      rotationAngle += speed * dt;
      if (rotationAngle >= 360) rotationAngle -= 360;
      positionNodes();
    });
  }

  /* ---- NAVIGATE ---- */
  function navigate(direction) {
    if (!active) return;
    const total = CONFIG.menuItems.length;
    currentIndex = (currentIndex + direction + total) % total;
    updateSelection();
    Audio.playHover();
    rotationPaused = true;
    setTimeout(() => { rotationPaused = false; }, 2000);
  }

  /* ---- SELECT CURRENT ---- */
  function selectCurrent() {
    if (!active) return;
    const item = CONFIG.menuItems[currentIndex];
    if (!item) return;

    Audio.playSelect();
    const node = nodes[currentIndex];
    if (node) node.classList.add('activating');

    console.log(`[Menu] Selected: ${item.label} (${item.id})`);
    setTimeout(() => {
      if (node) node.classList.remove('activating');
    }, 600);
  }

  /* ---- INPUT BINDING ---- */
  function bindInputs() {
    document.addEventListener('keydown', onKey);
    document.addEventListener('gamepad:left',  () => navigate(-1));
    document.addEventListener('gamepad:right', () => navigate(1));
    document.addEventListener('gamepad:up',    () => navigate(-1));
    document.addEventListener('gamepad:down',  () => navigate(1));
    document.addEventListener('gamepad:a',     () => selectCurrent());
  }

  function onKey(e) {
    if (!active) return;
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': e.preventDefault(); navigate(-1); break;
      case 'ArrowRight': case 'KeyD': e.preventDefault(); navigate(1); break;
      case 'ArrowUp': case 'KeyW': e.preventDefault(); navigate(-1); break;
      case 'ArrowDown': case 'KeyS': e.preventDefault(); navigate(1); break;
      case 'Enter': case 'Space': e.preventDefault(); selectCurrent(); break;
    }
  }

  function hide() {
    active = false;
    const screen = $('menuScreen');
    if (screen) screen.classList.remove('active');
    if (stopRotation) stopRotation();
  }

  function returnToMenu() { show(); }

  return { show, hide, returnToMenu };
})();
