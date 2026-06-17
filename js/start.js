/* ============================================================
 * start.js — Press Start (Title) Screen Controller
 * ============================================================
 * PURPOSE:
 *   The "attract screen" shown after loading completes.
 *   Shows: logo placeholder, floating mascot, PRESS START text,
 *   and ambient particles.
 *
 * CUSTOMIZATION:
 *   - CONFIG.logo: path to event logo image
 *   - CONFIG.mascotImage: path to floating mascot PNG
 *   - CONFIG.startBackground: screen background
 *
 * CONTROLS:
 *   Enter, Space, Mouse Click, Touch Tap, Controller A button
 *   all trigger the transition to the Main Menu.
 *
 * FLOW:
 *   StartScreen.show() → user presses start → calls onStart callback
 * ============================================================ */

const StartScreen = (() => {
  'use strict';

  const $ = Utils.$;
  let active = false;
  let onStartCallback = null;
  let particleTimer = null;

  /* ---- SHOW START SCREEN ---- */
  function show(onStart) {
    onStartCallback = onStart;
    const screen = $('startScreen');
    if (!screen) return;

    // Apply config background
    Utils.setBackground(screen, CONFIG.startBackground);

    // Set logo if configured
    const logoPlaceholder = $('logoPlaceholder');
    if (logoPlaceholder && CONFIG.logo) {
      const img = Utils.createElement('img');
      img.src = CONFIG.logo;
      img.alt = CONFIG.title;
      img.className = 'logo-image';
      img.draggable = false;
      logoPlaceholder.innerHTML = '';
      logoPlaceholder.appendChild(img);
    } else if (logoPlaceholder && !CONFIG.logo) {
      /* Fallback: render title as styled text */
      logoPlaceholder.innerHTML = `<div class="logo-text-fallback">${CONFIG.title}</div>`;
    }

    // Set mascot if configured
    const mascot = $('floatingMascot');
    if (mascot && CONFIG.mascotImage) {
      mascot.src = CONFIG.mascotImage;
      mascot.style.display = 'block';
    }

    // Show screen
    screen.classList.add('active');
    active = true;

    // Start ambient particles
    spawnParticles(screen);

    // Bind input handlers
    bindInputs();
  }

  /* ---- AMBIENT PARTICLES ----
   * Small glowing dots that drift upward.
   * Very lightweight — ~15 at a time.
   */
  function spawnParticles(container) {
    const colors = [
      CONFIG.colors.primary, CONFIG.colors.neonCyan,
      CONFIG.colors.neonGreen, CONFIG.colors.neonPink,
      '#fff',
    ];

    function create() {
      if (!active) return;

      const p = Utils.createElement('div', 'start-particle');
      p.style.left = Utils.randFloat(5, 95) + '%';
      p.style.background = Utils.randPick(colors);
      p.style.setProperty('--p-size', Utils.randInt(2, 4) + 'px');
      p.style.setProperty('--p-dur', Utils.randFloat(4, 8) + 's');
      p.style.setProperty('--p-dx', Utils.randFloat(-40, 40) + 'px');
      container.appendChild(p);

      const dur = parseFloat(p.style.getPropertyValue('--p-dur')) * 1000;
      setTimeout(() => p.remove(), dur);
    }

    // Spawn one every 300ms
    particleTimer = setInterval(() => {
      if (!active) { clearInterval(particleTimer); return; }
      create();
    }, 300);
  }

  /* ---- INPUT BINDING ---- */
  function bindInputs() {
    // Keyboard: Enter or Space
    document.addEventListener('keydown', onKey);

    // Mouse click on the screen
    const screen = $('startScreen');
    if (screen) screen.addEventListener('click', onActivate);

    // Touch tap
    if (screen) screen.addEventListener('touchend', onActivate);

    // Gamepad A button
    document.addEventListener('gamepad:a', onActivate);
  }

  function unbindInputs() {
    document.removeEventListener('keydown', onKey);
    const screen = $('startScreen');
    if (screen) {
      screen.removeEventListener('click', onActivate);
      screen.removeEventListener('touchend', onActivate);
    }
    document.removeEventListener('gamepad:a', onActivate);
  }

  function onKey(e) {
    if (!active) return;
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      onActivate();
    }
  }

  /* ---- ACTIVATE (PRESS START) ---- */
  async function onActivate() {
    if (!active) return;
    active = false;
    unbindInputs();

    // Unlock audio on first interaction
    Audio.unlock();
    Audio.playSelect();

    // Flash the PRESS START text
    const pressStart = $('pressStartText');
    if (pressStart) {
      pressStart.classList.add('activated');
    }

    // Wait a beat, then trigger CRT glitch transition
    await Utils.delay(400);
    await CRT.glitchTransition();

    // Hide start screen
    const screen = $('startScreen');
    if (screen) screen.classList.remove('active');

    // Clear particles
    if (particleTimer) clearInterval(particleTimer);

    // Trigger next screen
    if (onStartCallback) onStartCallback();
  }

  return { show };
})();
