/* ============================================================
 * audio.js — Sound System
 * ============================================================
 * PURPOSE:
 *   Manages all audio: startup, hover, select, ambient.
 *   Uses Web Audio API for synthesized fallback sounds.
 *   If CONFIG provides file paths, loads those instead.
 *
 * CUSTOMIZATION:
 *   Set audio file paths in config.js under:
 *     CONFIG.startupSound, CONFIG.hoverSound,
 *     CONFIG.selectSound, CONFIG.ambientSound
 *   Leave empty ("") to use the built-in synthesized sounds.
 *
 * IMPORTANT:
 *   Audio is MUTED by default (browser autoplay policy).
 *   User must click the SFX toggle to enable sound.
 * ============================================================ */

const Audio = (() => {
  'use strict';

  let ctx = null;        // AudioContext (created on first interaction)
  let muted = true;      // Muted by default
  let initialized = false;

  // Cached audio buffers for file-based sounds
  const buffers = {};

  /* ---- INITIALIZATION ----
   * Creates AudioContext and loads any configured audio files.
   * Called on first user interaction to satisfy autoplay policy.
   */
  function init() {
    if (initialized) return;
    initialized = true;

    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('[Audio] Web Audio API not supported:', e);
      return;
    }

    // Attempt to load configured audio files
    if (CONFIG.startupSound) _loadFile('startup', CONFIG.startupSound);
    if (CONFIG.hoverSound)   _loadFile('hover', CONFIG.hoverSound);
    if (CONFIG.selectSound)  _loadFile('select', CONFIG.selectSound);
    if (CONFIG.ambientSound) _loadFile('ambient', CONFIG.ambientSound);
  }

  /** Load an audio file into a buffer */
  async function _loadFile(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      buffers[name] = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn(`[Audio] Failed to load ${name}:`, e);
    }
  }

  /** Play a loaded buffer. Returns the source node. */
  function _playBuffer(name, volume = 0.3, loop = false) {
    if (!ctx || !buffers[name]) return null;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffers[name];
    source.loop = loop;
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start(0);
    return source;
  }

  /* ---- UNLOCK ----
   * Resume AudioContext if suspended (required by browsers).
   */
  function unlock() {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* ---- MUTE CONTROLS ---- */
  function isMuted()    { return muted; }
  function setMuted(v)  { muted = v; }
  function toggleMute() { muted = !muted; return muted; }

  /* ============================================================
   * SYNTHESIZED SOUND EFFECTS (Web Audio API)
   * These are used when no audio file is provided in CONFIG.
   * Each function generates a short retro-arcade sound.
   * ============================================================ */

  /** CRT power-on startup sweep */
  function playStartup() {
    if (muted) return;
    unlock();

    if (buffers.startup) { _playBuffer('startup', 0.4); return; }
    if (!ctx) return;

    // Rising sweep
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(60, ctx.currentTime);
    sweep.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
    sweepGain.gain.setValueAtTime(0.06, ctx.currentTime);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    sweep.connect(sweepGain).connect(ctx.destination);
    sweep.start(ctx.currentTime);
    sweep.stop(ctx.currentTime + 0.6);

    // Chime notes after sweep
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = ctx.currentTime + 0.5 + i * 0.08;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  /** Short arcade click for menu hover */
  function playHover() {
    if (muted) return;
    unlock();

    if (buffers.hover) { _playBuffer('hover', 0.15); return; }
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  /** Retro confirm chime for menu select */
  function playSelect() {
    if (muted) return;
    unlock();

    if (buffers.select) { _playBuffer('select', 0.3); return; }
    if (!ctx) return;

    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.12);
    });
  }

  /** Screen transition whoosh */
  function playTransition() {
    if (muted) return;
    unlock();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.15);
  }

  /** Loading tick (soft blip) */
  function playTick() {
    if (muted) return;
    unlock();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 500 + Math.random() * 300;
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.025);
  }

  /** Descending back sound */
  function playBack() {
    if (muted) return;
    unlock();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  /* ============================================================
   * AMBIENT THEME LOOP
   * ============================================================ */
  let ambientSource = null;

  function playAmbient() {
    if (muted || ambientSource) return;
    unlock();
    if (buffers.ambient) {
      ambientSource = _playBuffer('ambient', 0.25, true); // Play looping theme
    }
  }

  function stopAmbient() {
    if (ambientSource) {
      ambientSource.stop();
      ambientSource.disconnect();
      ambientSource = null;
    }
  }

  return {
    init, unlock,
    isMuted, setMuted, toggleMute,
    playStartup, playHover, playSelect,
    playTransition, playTick, playBack,
    playAmbient, stopAmbient,
  };
})();
