/* ============================================================
 * loading.js — BIOS-Style Loading Screen Controller
 * ============================================================
 * PURPOSE:
 *   Green phosphor terminal that mimics an arcade BIOS boot:
 *   1. BIOS header appears
 *   2. Boot check lines appear one by one with [OK]
 *   3. Pizza-slice loading bar fills (🍕 segments)
 *   4. Console messages scroll
 *   5. Pizza tip rotates at bottom
 *   Then transitions to the Start Screen.
 *
 * CUSTOMIZATION:
 *   - CONFIG.loadingBackground: screen background
 *   - CONFIG.pizzaSprite: mascot in the tip box
 *   - CONFIG.pizzaFacts[]: rotating tip messages
 *   - CONFIG.timings.loadingDuration: total load time
 *   - CONFIG.timings.factRotateInterval: ms between tips
 *
 * FLOW:
 *   LoadingScreen.start(onComplete) → fills bar → calls callback
 * ============================================================ */

const LoadingScreen = (() => {
  'use strict';

  const $ = Utils.$;
  let onCompleteCallback = null;

  /* ---- BOOT CHECK MESSAGES ----
   * These appear as BIOS-style status lines with dot padding.
   * Format: "> TEXT...........[OK]"
   */
  const BOOT_CHECKS = [
    { text: 'MEMORY CHECK', dots: 15 },
    { text: 'PIZZA DRIVE DETECTED', dots: 10 },
    { text: 'ARCADE SYSTEMS ONLINE', dots: 9 },
    { text: 'HACK MODULES LOADED', dots: 10 },
    { text: 'CHEESE PROTOCOL ENABLED', dots: 7 },
  ];

  /* ---- CONSOLE MESSAGES ----
   * Scroll below the loading bar during progress.
   */
  const CONSOLE_MSGS = [
    '> MOUNTING PIZZA DRIVE....',
    '> LOADING TRACK DATABASE....',
    '> CONNECTING TO HACK NETWORK...',
    '> SPAWNING TEAM TOKENS...',
    '> INITIALIZING JUDGING MATRIX...',
    '> WARMING UP PIXEL OVEN...',
    '> SYNCING SPONSOR MODULES...',
    '> ARCADE ENGINE READY ✓',
  ];

  /* ---- START LOADING ---- */
  function start(onComplete) {
    onCompleteCallback = onComplete;
    const screen = $('loadingScreen');
    if (!screen) return;

    // Apply config background if set
    Utils.setBackground(screen, CONFIG.loadingBackground);

    // Set mascot in tip box
    const mascotImg = $('tipMascotImg');
    const mascotFallback = $('tipMascotFallback');
    if (mascotImg && CONFIG.pizzaSprite) {
      mascotImg.src = CONFIG.pizzaSprite;
      mascotImg.style.display = 'block';
      if (mascotFallback) mascotFallback.style.display = 'none';
    }

    // Show screen
    screen.classList.add('active');

    // Run the boot sequence
    runBootSequence();
  }

  /* ---- BOOT SEQUENCE ---- */
  async function runBootSequence() {
    const duration = CONFIG.timings.loadingDuration;

    /* Phase 1: Show boot check lines one by one */
    const checksContainer = $('bootChecks');
    if (checksContainer) {
      checksContainer.innerHTML = '';

      for (let i = 0; i < BOOT_CHECKS.length; i++) {
        const check = BOOT_CHECKS[i];
        const dots = '.'.repeat(check.dots);
        const line = Utils.createElement('div', 'boot-check-line');
        line.style.setProperty('--line-delay', (i * 0.25) + 's');
        line.innerHTML = `> ${check.text}${dots}<span class="ok-tag">[OK]</span>`;
        checksContainer.appendChild(line);
        Audio.playTick();
        await Utils.delay(280);
      }
    }

    await Utils.delay(300);

    /* Phase 2: Start the pizza loading bar + console + tips simultaneously */
    startPizzaBar();
    startConsoleMessages();
    startTipRotation();

    /* Phase 3: Wait for loading to finish */
    await Utils.delay(duration);

    /* Phase 4: Finish and transition */
    finishLoading();
  }

  /* ---- PIZZA SLICE LOADING BAR ---- */
  function startPizzaBar() {
    const segments = Utils.$qa('.pizza-segment');
    const percentLabel = $('pizzaBarPercent');
    const totalSegments = segments.length;
    const duration = CONFIG.timings.loadingDuration;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Utils.randFloat(1.5, 4.5);
      if (progress > 100) progress = 100;

      // Update percentage
      if (percentLabel) {
        percentLabel.textContent = Math.floor(progress) + '%';
      }

      // Light up segments
      const litCount = Math.floor((progress / 100) * totalSegments);
      segments.forEach((seg, i) => {
        seg.classList.toggle('filled', i < litCount);
      });

      Audio.playTick();

      if (progress >= 100) {
        clearInterval(interval);
        if (percentLabel) percentLabel.textContent = '100%';
      }
    }, duration / 28);
  }

  /* ---- CONSOLE MESSAGES ---- */
  function startConsoleMessages() {
    const consoleEl = $('loadingConsole');
    if (!consoleEl) return;
    consoleEl.innerHTML = '';

    const duration = CONFIG.timings.loadingDuration;
    const msgInterval = duration / CONSOLE_MSGS.length;
    let i = 0;

    const timer = setInterval(() => {
      if (i >= CONSOLE_MSGS.length) { clearInterval(timer); return; }

      const line = Utils.createElement('div', 'console-line');
      line.textContent = CONSOLE_MSGS[i];

      // Add cursor to the last line
      if (i === CONSOLE_MSGS.length - 1) {
        const cursor = Utils.createElement('span', 'console-cursor');
        line.appendChild(cursor);
      }

      consoleEl.appendChild(line);
      consoleEl.scrollTop = consoleEl.scrollHeight;
      i++;
    }, msgInterval);
  }

  /* ---- TIP ROTATION ---- */
  function startTipRotation() {
    const tipEl = $('pizzaTipText');
    if (!tipEl) return;

    const facts = CONFIG.pizzaFacts;
    let shuffled = Utils.shuffle([...facts]);
    let idx = 0;

    // Show first tip
    showTip();

    const interval = setInterval(() => {
      idx++;
      if (idx >= shuffled.length) {
        shuffled = Utils.shuffle([...facts]);
        idx = 0;
      }
      showTip();
    }, CONFIG.timings.factRotateInterval);

    // Store for cleanup
    tipEl._tipInterval = interval;

    function showTip() {
      tipEl.style.opacity = '0';
      setTimeout(() => {
        Utils.typewriter(tipEl, shuffled[idx], 20);
        tipEl.style.opacity = '1';
      }, 250);
    }
  }

  /* ---- FINISH LOADING ---- */
  async function finishLoading() {
    await Utils.delay(500);

    const screen = $('loadingScreen');
    if (screen) {
      screen.classList.add('fade-out');
      await Utils.delay(500);
      screen.classList.remove('active', 'fade-out');
    }

    // Cleanup tip interval
    const tipEl = $('pizzaTipText');
    if (tipEl && tipEl._tipInterval) clearInterval(tipEl._tipInterval);

    // Trigger next screen
    if (onCompleteCallback) onCompleteCallback();
  }

  return { start };
})();
