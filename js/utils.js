/* ============================================================
 * utils.js — Shared Utility Functions
 * ============================================================
 * PURPOSE:
 *   Reusable helpers used across all modules.
 *   DOM shortcuts, math, random, interpolation, etc.
 * ============================================================ */

const Utils = (() => {
  'use strict';

  /* ---- DOM SHORTCUTS ---- */

  /** Shorthand for document.getElementById */
  function $(id) {
    return document.getElementById(id);
  }

  /** Shorthand for document.querySelector */
  function $q(sel, parent = document) {
    return parent.querySelector(sel);
  }

  /** Shorthand for document.querySelectorAll (returns real array) */
  function $qa(sel, parent = document) {
    return Array.from(parent.querySelectorAll(sel));
  }

  /** Create an element with optional className and innerHTML */
  function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  /* ---- MATH HELPERS ---- */

  /** Linear interpolation between a and b by t (0..1) */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /** Clamp value between min and max */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /** Convert degrees to radians */
  function degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  /** Convert radians to degrees */
  function radToDeg(rad) {
    return rad * (180 / Math.PI);
  }

  /* ---- RANDOM HELPERS ---- */

  /** Random integer between min (inclusive) and max (inclusive) */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Random float between min and max */
  function randFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /** Pick a random element from an array */
  function randPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Shuffle array in place (Fisher-Yates) */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---- TIMING HELPERS ---- */

  /** Promise-based delay */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** requestAnimationFrame-based loop with delta time */
  function animationLoop(callback) {
    let lastTime = 0;
    let running = true;

    function tick(time) {
      if (!running) return;
      const dt = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;
      callback(dt, time);
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    // Return a stop function
    return () => { running = false; };
  }

  /* ---- BACKGROUND RENDERER ----
   * Sets a background on a container from a config path.
   * Auto-detects format from file extension.
   *
   * Injects an absolutely-positioned element so the background
   * reliably renders regardless of browser CSS custom-property quirks.
   *
   * USAGE:
   *   Utils.setBackground(containerEl, CONFIG.startBackground);
   */
  function setBackground(container, src) {
    if (!src || !container) return;

    const ext = src.split('.').pop().toLowerCase();
    const videoExts = ['mp4', 'webm'];

    // Remove any existing injected background
    const existing = container.querySelector('.screen-bg-injected');
    if (existing) existing.remove();

    if (videoExts.includes(ext)) {
      // Video background
      const video = createElement('video', 'screen-bg-injected screen-bg-video');
      video.src = src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.style.cssText = `
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        z-index: 0;
        pointer-events: none;
        opacity: 0.5;
      `;
      container.prepend(video);
    } else {
      // Image / GIF background — inject a plain div with background-image
      const bg = createElement('div', 'screen-bg-injected');
      bg.style.cssText = `
        position: absolute; inset: 0;
        background-image: url('${src}');
        background-size: cover;
        background-position: center;
        z-index: 0;
        pointer-events: none;
      `;
      container.prepend(bg);
    }
  }

  /* ---- TYPEWRITER EFFECT ----
   * Types text character-by-character into an element.
   * Returns a promise that resolves when typing is done.
   *
   * USAGE:
   *   await Utils.typewriter(element, "Hello world", 40);
   */
  async function typewriter(element, text, charDelay = 35) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await delay(charDelay);
    }
  }

  /* ---- DETECT SUPPORTS ---- */
  const supportsTouch = 'ontouchstart' in window;

  return {
    $, $q, $qa, createElement,
    lerp, clamp, degToRad, radToDeg,
    randInt, randFloat, randPick, shuffle,
    delay, animationLoop,
    setBackground, typewriter,
    supportsTouch,
  };
})();
