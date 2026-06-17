/* ============================================================
 * gamepad.js — Gamepad / Controller Support
 * ============================================================
 * PURPOSE:
 *   Polls connected gamepads each frame.
 *   Emits custom events that other modules can listen for:
 *     'gamepad:up', 'gamepad:down', 'gamepad:left', 'gamepad:right'
 *     'gamepad:a', 'gamepad:b'
 *
 * CUSTOMIZATION:
 *   Button/axis mappings follow the "Standard Gamepad" layout.
 *   Adjust BUTTON_MAP or AXIS_THRESHOLD if your controller differs.
 *
 * USAGE:
 *   document.addEventListener('gamepad:a', handler);
 *   Gamepad.start();  // begin polling
 *   Gamepad.stop();   // stop polling
 * ============================================================ */

const Gamepad = (() => {
  'use strict';

  /* Standard Gamepad button indices */
  const BUTTON_MAP = {
    A: 0,       // Confirm / Select
    B: 1,       // Back / Cancel
    UP: 12,     // D-pad Up
    DOWN: 13,   // D-pad Down
    LEFT: 14,   // D-pad Left
    RIGHT: 15,  // D-pad Right
  };

  /* Analog stick axis threshold for triggering a direction */
  const AXIS_THRESHOLD = 0.5;

  /* Polling state */
  let animFrameId = null;
  let prevButtons = {};   // Track button states to emit only on press (not hold)
  let prevAxes = { x: 0, y: 0 };

  /* ---- EMIT CUSTOM EVENT ---- */
  function emit(name) {
    document.dispatchEvent(new CustomEvent(name));
  }

  /* ---- POLL LOOP ---- */
  function poll() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0]; // Use first connected gamepad

    if (gp) {
      // D-pad buttons
      checkButton(gp, 'UP',    'gamepad:up');
      checkButton(gp, 'DOWN',  'gamepad:down');
      checkButton(gp, 'LEFT',  'gamepad:left');
      checkButton(gp, 'RIGHT', 'gamepad:right');
      checkButton(gp, 'A',     'gamepad:a');
      checkButton(gp, 'B',     'gamepad:b');

      // Left analog stick
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;

      if (axisX < -AXIS_THRESHOLD && prevAxes.x >= -AXIS_THRESHOLD) emit('gamepad:left');
      if (axisX > AXIS_THRESHOLD  && prevAxes.x <= AXIS_THRESHOLD)  emit('gamepad:right');
      if (axisY < -AXIS_THRESHOLD && prevAxes.y >= -AXIS_THRESHOLD) emit('gamepad:up');
      if (axisY > AXIS_THRESHOLD  && prevAxes.y <= AXIS_THRESHOLD)  emit('gamepad:down');

      prevAxes.x = axisX;
      prevAxes.y = axisY;
    }

    animFrameId = requestAnimationFrame(poll);
  }

  /* ---- CHECK SINGLE BUTTON ---- */
  function checkButton(gp, name, event) {
    const idx = BUTTON_MAP[name];
    const pressed = gp.buttons[idx] && gp.buttons[idx].pressed;
    if (pressed && !prevButtons[name]) {
      emit(event);
    }
    prevButtons[name] = pressed;
  }

  /* ---- START / STOP ---- */
  function start() {
    if (animFrameId !== null) return; // Already running
    poll();
  }

  function stop() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  /* Listen for gamepad connection */
  window.addEventListener('gamepadconnected', (e) => {
    console.log(`[Gamepad] Connected: ${e.gamepad.id}`);
    start();
  });

  window.addEventListener('gamepaddisconnected', () => {
    console.log('[Gamepad] Disconnected');
    stop();
  });

  return { start, stop };
})();
