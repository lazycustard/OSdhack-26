/* ============================================================
 * app.js — Main Application Orchestrator
 * ============================================================
 * PURPOSE:
 *   The master controller that boots the CRT, then chains:
 *   Loading Screen → Start Screen → Main Menu.
 *
 * INITIALIZATION ORDER:
 *   1. DOM loaded
 *   2. CRT power-on boot animation plays
 *   3. LoadingScreen.start() — shows pizza loading bar & facts
 *   4. StartScreen.show() — "PRESS START" attract screen
 *   5. MenuScreen.show() — circular navigation hub
 *
 * CUSTOMIZATION:
 *   All behavior is driven by CONFIG. No changes needed here
 *   unless you want to alter the screen flow order.
 * ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async () => {

    /* ---- SET PAGE TITLE FROM CONFIG ---- */
    document.title = CONFIG.title + ' — Arcade Hackathon';

    /* ---- INIT AUDIO (stays muted until user toggles) ---- */
    Audio.init();

    /* ---- INIT GAMEPAD POLLING ---- */
    Gamepad.start();

    /* ---- BIND SFX TOGGLE BUTTON ---- */
    const sfxBtn = Utils.$('sfxToggle');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        Audio.unlock();
        const muted = Audio.toggleMute();
        sfxBtn.classList.toggle('muted', muted);
        sfxBtn.textContent = muted ? '🔇 SFX' : '🔊 SFX';
        
        if (!muted) {
          Audio.playHover();
          Audio.playAmbient(); // Start looping theme
        } else {
          Audio.stopAmbient(); // Stop theme if muted
        }
      });
    }

    /* ============================================================
     * SCREEN FLOW CHAIN
     * Each screen calls the next when it finishes.
     * ============================================================ */

    /* Step 1: CRT Power-On Boot */
    await CRT.boot();

    /* Step 2: Loading Screen */
    LoadingScreen.start(() => {

      /* Step 3: Press Start Screen */
      StartScreen.show(() => {

        /* Step 4: Main Menu */
        MenuScreen.show();
      });
    });

  });
})();
