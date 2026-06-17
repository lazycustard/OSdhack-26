/* ============================================================
 * config.js — Central Configuration
 * ============================================================
 * PURPOSE:
 *   Single source of truth for ALL customizable values.
 *   Change assets, text, colors, and timings here only.
 *   No other file should contain hardcoded paths or strings.
 *
 * CUSTOMIZATION:
 *   - Replace empty strings with paths to your assets.
 *   - Supported formats for backgrounds: .gif, .mp4, .jpg, .png, .webp
 *   - Supported formats for images: .png, .gif, .webp, .svg
 *   - Supported formats for audio: .mp3, .ogg, .wav (or leave empty for Web Audio synth)
 *
 * ASSET LOCATIONS:
 *   Place files in /assets/images/, /assets/gifs/, /assets/audio/, /assets/icons/
 * ============================================================ */

const CONFIG = {

  /* ---- GENERAL ---- */
  title: "OSDHACK'26",
  subtitle: "THE ARCADE HACKATHON",
  tagline: "CODE · BUILD · DEVOUR",

  /* ---- LOGO ----
   * Path to your event logo PNG/SVG.
   * Leave empty ("") and a styled text fallback will render.
   * Recommended: transparent PNG, 400–800px wide.
   * Example: "assets/images/logo.png"
   */
  logo: "assets/images/main.png",

  /* ---- MASCOT ----
   * Path to a floating mascot/character PNG.
   * It will float, rotate subtly, and have a shadow.
   * Example: "assets/images/pizza-mascot.png"
   */
  mascotImage: "",

  /* ---- BACKGROUNDS ----
   * Each screen supports: .gif, .mp4, .jpg, .png, .webp
   * The system auto-detects format from the file extension.
   * Leave empty ("") for the default CSS gradient background.
   *
   * Examples:
   *   "assets/gifs/pizzeria.gif"
   *   "assets/images/arcade-room.jpg"
   *   "assets/gifs/retro-bg.mp4"
   */
  loadingBackground: "",
  startBackground: "assets/images/bg_start.png",
  menuBackground: "",

  /* ---- AUDIO ----
   * Paths to sound effect files (.mp3, .ogg, .wav).
   * Leave empty ("") to use built-in Web Audio API synthesized sounds.
   *
   * Examples:
   *   "assets/audio/startup.mp3"
   *   "assets/audio/hover.ogg"
   */
  startupSound: "",
  hoverSound: "",
  selectSound: "",
  ambientSound: "assets/audio/bg_theme.mp3",

  /* ---- PIZZA SPRITE ----
   * Path to a pizza sprite for the loading screen.
   * It will bounce across the loading scene.
   * Example: "assets/images/pizza-sprite.png"
   */
  pizzaSprite: "",

  /* ---- TIMINGS (milliseconds) ---- */
  timings: {
    crtBootDuration: 2200,      // CRT power-on animation length
    loadingDuration: 4500,      // Loading bar fill time
    factRotateInterval: 2000,   // Time between pizza fact changes
    menuRotationSpeed: 45,      // Seconds per full ring rotation
    screenTransition: 600,      // Transition between screens
  },

  /* ---- COLORS ---- */
  colors: {
    primary: '#FFD700',         // Gold/Yellow — main accent
    secondary: '#FF8C00',       // Orange — secondary accent
    danger: '#CC4400',          // Deep red — shadow/danger
    neonCyan: '#00e5ff',        // Cyan — tech/info accent
    neonGreen: '#39ff14',       // Green — success/terminal
    neonPink: '#e040fb',        // Pink — highlight
    neonOrange: '#ff6e40',      // Orange — warm accent
    neonPurple: '#b388ff',      // Purple — sponsor/special
    screenBg: '#0a0e1a',       // Deep blue-black — monitor interior
    bezelColor: '#1a1a2e',     // Monitor bezel
    textDim: 'rgba(224, 208, 255, 0.4)',
  },

  /* ---- MENU ITEMS ----
   * Each entry defines a navigation node on the circular menu ring.
   * - id: unique identifier, used as CSS/HTML id
   * - label: display text on the node
   * - icon: emoji or path to icon image
   * - color: hex color for glow/border
   *
   * Add, remove, or reorder items freely.
   * The circle automatically distributes them evenly.
   */
  menuItems: [
    { id: 'about', label: 'ABOUT', icon: '📖', color: '#00e5ff' },
    { id: 'tracks', label: 'TRACKS', icon: '🏁', color: '#39ff14' },
    { id: 'rules', label: 'RULES', icon: '📋', color: '#e040fb' },
    { id: 'schedule', label: 'SCHEDULE', icon: '📅', color: '#FFD700' },
    { id: 'prizes', label: 'PRIZES', icon: '🏆', color: '#ff6e40' },
    { id: 'sponsors', label: 'SPONSORS', icon: '💎', color: '#b388ff' },
    { id: 'faq', label: 'FAQ', icon: '❓', color: '#ff6e40' },
    { id: 'team', label: 'TEAM', icon: '👥', color: '#00e5ff' },
  ],

  /* ---- LOADING SCREEN FACTS ----
   * Displayed one at a time with typewriter animation.
   * At least 50 entries required for variety.
   * Add your own! Keep them short (under ~60 chars).
   */
  pizzaFacts: [
    "Pineapple pizza causes merge conflicts.",
    "Never deploy hungry.",
    "Production bugs love cold pizza.",
    "If it works on localhost, you're halfway there.",
    "Someone is debugging without console.log.",
    "Your teammate definitely forgot to push.",
    "Pizza and code share one truth: layers matter.",
    "The cheese pull is a metaphor for spaghetti code.",
    "Pepperoni: the original loading spinner.",
    "git commit -m 'added extra cheese'",
    "404: Pizza not found. Try reloading.",
    "Ctrl+Z won't un-eat that last slice.",
    "One does not simply 'just fix the CSS'.",
    "Hackathons run on caffeine and carbs.",
    "Your code compiles? Celebrate with pizza.",
    "npm install pizza --save-forever",
    "There's a bug in my pizza. Oh wait, that's an olive.",
    "First rule of hackathon: always order extra pizza.",
    "Debugging is like removing olives blindfolded.",
    "sudo make me a pizza",
    "The only framework you need: pizza box.",
    "Pizza toppings > npm dependencies.",
    "My code is like pizza: messy but functional.",
    "Semicolons are the pepperoni of code.",
    "Don't push to main on an empty stomach.",
    "Stack overflow? More like stack of pizza boxes.",
    "console.log('Is there more pizza?')",
    "Every great app starts with a pizza break.",
    "You can't unit test pizza quality.",
    "The cloud is just someone else's pizza oven.",
    "Dark mode saves battery. Pizza saves developers.",
    "Agile methodology: eat pizza in sprints.",
    "Remember: pizza is round, box is square, slices are triangles.",
    "Your code has fewer layers than a deep dish.",
    "Rubber duck debugging works better with pizza.",
    "The best code review happens over pizza.",
    "Cheese > blockchain. Fight me.",
    "Touch grass? I touch pizza.",
    "Hot take: tabs are superior. So is thin crust.",
    "Pizza delivery ETA > deployment ETA.",
    "Refactoring is just reheating pizza with extra steps.",
    "There are 10 types of developers: those who love pizza, and liars.",
    "Your API needs more endpoints. Your pizza needs more toppings.",
    "Microservices? More like micro-slices.",
    "Keep your friends close and your pizza closer.",
    "The real MVP: whoever orders the pizza.",
    "In a world of hamburger menus, be a pizza menu.",
    "Technical debt tastes like day-old pizza.",
    "Containerize your pizza for maximum portability.",
    "Don't be a 10x developer. Be a 10-slice developer.",
    "Pizza is proof that good things come in circles.",
    "Your commit messages should be as clear as your pizza order.",
    "async/await for pizza delivery.",
    "The DOM is like pizza dough: stretch it too far and it breaks.",
    "Infinite scroll? More like infinite pizza scroll.",
    "AI can write code but it can't eat pizza.",
    "The blockchain of pizza: from oven to box to mouth.",
    "Types of tests: unit, integration, and pizza taste test.",
    "Loading extra cheese modules...",
  ],
};
