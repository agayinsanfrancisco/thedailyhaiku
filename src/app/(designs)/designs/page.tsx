import Link from "next/link";

const MAKER = {
  name: "the daily haiku",
  tagline: "a new haiku every day",
  haiku: {
    line1: "cherry blossoms fall",
    line2: "a warm breeze carries the scent",
    line3: "of another year",
  },
  author: "— Maya Chen",
  headline: "The Day the World Went Mobile",
  description: "On June 29, 2007, Apple's first iPhone hit store shelves, transforming the way we communicate forever.",
  date: "June 29",
  category: "Technology",
};

const designs = [
  {
    id: "brutalist",
    name: "Brutalist",
    vibe: "Raw, unfiltered, high-contrast",
    css: `
      .ds-Brutalist { background: #fff; color: #000; font-family: 'Inter', system-ui, sans-serif; }
      .ds-Brutalist .ds-header { border-bottom: 4px solid #000; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
      .ds-Brutalist .ds-logo { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
      .ds-Brutalist .ds-nav { display: flex; gap: 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
      .ds-Brutalist .ds-main { max-width: 500px; margin: 0 auto; padding: 48px 24px; }
      .ds-Brutalist .ds-date { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 48px; padding-bottom: 8px; border-bottom: 2px solid #000; display: inline-block; }
      .ds-Brutalist .ds-haiku { margin-bottom: 24px; }
      .ds-Brutalist .ds-haiku p { font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 4px; }
      .ds-Brutalist .ds-haiku p:nth-child(2) { margin-left: 24px; }
      .ds-Brutalist .ds-meta { font-size: 12px; font-weight: 600; color: #666; margin-bottom: 32px; display: flex; gap: 12px; }
      .ds-Brutalist .ds-event { border: 3px solid #000; padding: 16px; }
      .ds-Brutalist .ds-event p { font-size: 13px; margin: 0; line-height: 1.5; }
      .ds-Brutalist .ds-event strong { display: block; font-size: 15px; margin-bottom: 4px; }
      .ds-Brutalist .ds-cta { display: inline-block; margin-top: 24px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 2px solid #000; padding: 10px 20px; text-decoration: none; color: #000; }
    `,
  },
  {
    id: "ambient",
    name: "Ambient",
    vibe: "Soft, ethereal, glassmorphism",
    css: `
      .ds-Ambient { background: linear-gradient(135deg, #fdf6f0 0%, #f0e6e0 50%, #e8f0f2 100%); min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
      .ds-Ambient .ds-main { max-width: 480px; margin: 0 auto; padding: 60px 24px; }
      .ds-Ambient .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 64px; }
      .ds-Ambient .ds-logo { font-size: 14px; font-weight: 400; color: #8a7a6a; letter-spacing: 1px; }
      .ds-Ambient .ds-nav { display: flex; gap: 16px; font-size: 12px; color: #8a7a6a; }
      .ds-Ambient .ds-date { font-size: 11px; color: #8a7a6a; letter-spacing: 2px; margin-bottom: 32px; text-align: center; }
      .ds-Ambient .ds-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
      .ds-Ambient .ds-haiku { margin-bottom: 24px; }
      .ds-Ambient .ds-haiku p { font-size: 24px; line-height: 1.4; margin: 0 0 4px; color: #3a2a1a; }
      .ds-Ambient .ds-meta { display: flex; gap: 12px; font-size: 12px; color: #8a7a6a; margin-bottom: 24px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06); }
      .ds-Ambient .ds-event { margin-top: 0; }
      .ds-Ambient .ds-event strong { font-size: 14px; color: #3a2a1a; display: block; margin-bottom: 4px; font-weight: 500; }
      .ds-Ambient .ds-event p { font-size: 12px; color: #8a7a6a; line-height: 1.6; margin: 0; }
      .ds-Ambient .ds-cta { display: inline-block; margin-top: 20px; font-size: 12px; color: #8a7a6a; text-decoration: none; border-bottom: 1px solid #8a7a6a; padding-bottom: 2px; }
    `,
  },
  {
    id: "neobrutal",
    name: "Neo-Brutal",
    vibe: "Playful, bold colors, thick borders",
    css: `
      .ds-NeoBrutal { background: #f5f0e8; font-family: 'Inter', system-ui, sans-serif; }
      .ds-NeoBrutal .ds-main { max-width: 480px; margin: 0 auto; padding: 32px 16px; }
      .ds-NeoBrutal .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: #ffe66d; padding: 12px 16px; border: 3px solid #000; border-radius: 12px; }
      .ds-NeoBrutal .ds-logo { font-size: 16px; font-weight: 800; text-transform: uppercase; }
      .ds-NeoBrutal .ds-nav { display: flex; gap: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
      .ds-NeoBrutal .ds-date { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; background: #ff6b6b; color: #fff; padding: 4px 12px; display: inline-block; border: 2px solid #000; border-radius: 8px; }
      .ds-NeoBrutal .ds-haiku { background: #fff; border: 3px solid #000; border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 6px 6px 0 #000; }
      .ds-NeoBrutal .ds-haiku p { font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0 0 4px; }
      .ds-NeoBrutal .ds-meta { display: flex; gap: 8px; font-size: 11px; font-weight: 600; margin-bottom: 16px; }
      .ds-NeoBrutal .ds-meta span { background: #c7f9cc; padding: 2px 10px; border: 2px solid #000; border-radius: 20px; }
      .ds-NeoBrutal .ds-event { background: #a9d6ff; border: 3px solid #000; border-radius: 12px; padding: 16px; }
      .ds-NeoBrutal .ds-event strong { font-size: 14px; display: block; margin-bottom: 4px; }
      .ds-NeoBrutal .ds-event p { font-size: 12px; margin: 0; line-height: 1.5; }
      .ds-NeoBrutal .ds-cta { display: inline-block; margin-top: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ff6b6b; color: #fff; border: 3px solid #000; border-radius: 10px; padding: 10px 20px; text-decoration: none; }
    `,
  },
  {
    id: "retrowave",
    name: "Retro-Wave",
    vibe: "Dark, neon, grid lines, synthwave",
    css: `
      .ds-Retrowave { background: #0a0a1a; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; position: relative; overflow: hidden; }
      .ds-Retrowave::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,0,128,0.03) 40px, rgba(255,0,128,0.03) 41px); pointer-events: none; }
      .ds-Retrowave .ds-sun { position: absolute; right: -60px; top: 20px; width: 200px; height: 200px; background: linear-gradient(180deg, #ff006e, #ffbe0b); border-radius: 50%; opacity: 0.3; filter: blur(30px); }
      .ds-Retrowave .ds-main { max-width: 480px; margin: 0 auto; padding: 48px 24px; position: relative; z-index: 1; }
      .ds-Retrowave .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; border-bottom: 1px solid rgba(255,0,110,0.3); padding-bottom: 16px; }
      .ds-Retrowave .ds-logo { font-size: 14px; font-weight: 600; background: linear-gradient(90deg, #ff006e, #ffbe0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 4px; }
      .ds-Retrowave .ds-nav { display: flex; gap: 20px; font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
      .ds-Retrowave .ds-date { font-size: 10px; color: rgba(255,0,110,0.6); letter-spacing: 4px; text-transform: uppercase; margin-bottom: 32px; }
      .ds-Retrowave .ds-haiku p { font-size: 26px; line-height: 1.3; margin: 0 0 4px; color: #fff; }
      .ds-Retrowave .ds-haiku p:nth-child(2) { color: rgba(255,190,11,0.7); }
      .ds-Retrowave .ds-meta { display: flex; gap: 12px; font-size: 11px; color: rgba(255,255,255,0.3); margin: 24px 0; }
      .ds-Retrowave .ds-event { border-left: 2px solid #ff006e; padding-left: 16px; margin-top: 24px; }
      .ds-Retrowave .ds-event strong { color: #ffbe0b; font-size: 14px; display: block; margin-bottom: 4px; }
      .ds-Retrowave .ds-event p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0; line-height: 1.6; }
      .ds-Retrowave .ds-cta { display: inline-block; margin-top: 24px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #ff006e; text-decoration: none; border: 1px solid #ff006e; padding: 8px 20px; }
    `,
  },
  {
    id: "nordic",
    name: "Nordic Minimal",
    vibe: "Clean, airy, muted, spacious",
    css: `
      .ds-Nordic { background: #f8f7f4; font-family: 'Inter', system-ui, sans-serif; }
      .ds-Nordic .ds-main { max-width: 440px; margin: 0 auto; padding: 80px 24px; }
      .ds-Nordic .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 64px; }
      .ds-Nordic .ds-logo { font-size: 20px; font-weight: 300; color: #4a4a4a; letter-spacing: -0.5px; }
      .ds-Nordic .ds-nav { display: flex; gap: 24px; font-size: 12px; color: #9a9a9a; font-weight: 400; }
      .ds-Nordic .ds-date { font-size: 10px; color: #baba9a; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
      .ds-Nordic .ds-haiku { margin-bottom: 32px; }
      .ds-Nordic .ds-haiku p { font-size: 20px; line-height: 1.5; margin: 0 0 2px; color: #3a3a3a; font-weight: 300; }
      .ds-Nordic .ds-meta { display: flex; gap: 16px; font-size: 11px; color: #baba9a; margin-bottom: 32px; }
      .ds-Nordic .ds-event { border-top: 1px solid #e8e7e0; padding-top: 24px; }
      .ds-Nordic .ds-event strong { font-size: 13px; color: #6a6a5a; display: block; margin-bottom: 4px; font-weight: 400; }
      .ds-Nordic .ds-event p { font-size: 12px; color: #9a9a8a; margin: 0; line-height: 1.7; }
      .ds-Nordic .ds-cta { display: inline-block; margin-top: 24px; font-size: 11px; color: #6a6a5a; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #d0cfc5; padding-bottom: 2px; }
    `,
  },
  {
    id: "editorial",
    name: "Editorial",
    vibe: "Magazine, bold typography, high-impact",
    css: `
      .ds-Editorial { background: #f3efe8; font-family: 'Inter', system-ui, sans-serif; }
      .ds-Editorial .ds-main { max-width: 520px; margin: 0 auto; padding: 0 24px; }
      .ds-Editorial .ds-header { padding: 20px 0; border-bottom: 2px solid #1a1a1a; display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
      .ds-Editorial .ds-logo { font-size: 22px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.5px; }
      .ds-Editorial .ds-nav { display: flex; gap: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #8a8a7a; }
      .ds-Editorial .ds-date { font-size: 11px; color: #8a8a7a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
      .ds-Editorial .ds-superhead { font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -3px; color: #1a1a1a; margin-bottom: 32px; max-width: 400px; }
      .ds-Editorial .ds-haiku { margin-bottom: 24px; border-left: 4px solid #1a1a1a; padding-left: 20px; }
      .ds-Editorial .ds-haiku p { font-size: 18px; line-height: 1.5; margin: 0 0 2px; color: #3a3a3a; }
      .ds-Editorial .ds-meta { display: flex; gap: 12px; font-size: 11px; color: #8a8a7a; margin-bottom: 24px; }
      .ds-Editorial .ds-event { background: #fff; padding: 20px; border-top: 2px solid #1a1a1a; margin-bottom: 24px; }
      .ds-Editorial .ds-event strong { font-size: 16px; display: block; margin-bottom: 4px; }
      .ds-Editorial .ds-event p { font-size: 13px; color: #5a5a4a; margin: 0; line-height: 1.6; }
      .ds-Editorial .ds-cta { display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #1a1a1a; text-decoration: none; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; }
    `,
  },
  {
    id: "darkmode",
    name: "Dark Mode",
    vibe: "Dark background, accent glow, moody",
    css: `
      .ds-Darkmode { background: #121212; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; }
      .ds-Darkmode .ds-main { max-width: 460px; margin: 0 auto; padding: 48px 24px; }
      .ds-Darkmode .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; border-bottom: 1px solid #2a2a2a; padding-bottom: 16px; }
      .ds-Darkmode .ds-logo { font-size: 14px; color: #aaa; letter-spacing: 0.5px; }
      .ds-Darkmode .ds-logo span { color: #6a9a9a; }
      .ds-Darkmode .ds-nav { display: flex; gap: 16px; font-size: 12px; color: #5a5a5a; }
      .ds-Darkmode .ds-date { font-size: 10px; color: #5a5a5a; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 32px; }
      .ds-Darkmode .ds-haiku p { font-size: 26px; line-height: 1.3; margin: 0 0 4px; color: #e0e0e0; }
      .ds-Darkmode .ds-haiku p:nth-child(2) { color: #6a9a9a; }
      .ds-Darkmode .ds-meta { display: flex; gap: 12px; font-size: 12px; color: #5a5a5a; margin: 24px 0; }
      .ds-Darkmode .ds-meta span { color: #6a9a9a; }
      .ds-Darkmode .ds-event { border-top: 1px solid #2a2a2a; padding-top: 24px; }
      .ds-Darkmode .ds-event strong { color: #c0c0c0; font-size: 14px; display: block; margin-bottom: 4px; }
      .ds-Darkmode .ds-event p { color: #6a6a6a; font-size: 12px; margin: 0; line-height: 1.6; }
      .ds-Darkmode .ds-cta { display: inline-block; margin-top: 24px; font-size: 11px; color: #6a9a9a; text-decoration: none; border: 1px solid #2a4a4a; padding: 8px 20px; }
    `,
  },
  {
    id: "japanese",
    name: "Japanese Zen",
    vibe: "Ink wash, sumi-e, vertical, washi paper",
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600&display=swap');
      .ds-Japanese { background: #f5f0e8; font-family: 'Noto Serif JP', 'Cormorant Garamond', Georgia, serif; position: relative; }
      .ds-Japanese .ds-main { max-width: 460px; margin: 0 auto; padding: 48px 24px; position: relative; }
      .ds-Japanese .ds-brush { position: absolute; top: 0; right: 24px; width: 60px; height: 300px; opacity: 0.04; background: radial-gradient(ellipse at center, #000 0%, transparent 70%); }
      .ds-Japanese .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 56px; position: relative; }
      .ds-Japanese .ds-logo { font-size: 14px; font-weight: 400; color: #5a4a3a; writing-mode: horizontal-tb; }
      .ds-Japanese .ds-logo::before { content: '◌'; margin-right: 8px; font-size: 8px; color: #9a8a7a; }
      .ds-Japanese .ds-nav { display: flex; gap: 20px; font-size: 11px; color: #9a8a7a; }
      .ds-Japanese .ds-date { font-size: 10px; color: #9a8a7a; letter-spacing: 4px; margin-bottom: 32px; }
      .ds-Japanese .ds-seal { width: 32px; height: 32px; border: 2px solid #3a2a1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #3a2a1a; margin-bottom: 24px; opacity: 0.3; }
      .ds-Japanese .ds-haiku { margin-bottom: 24px; }
      .ds-Japanese .ds-haiku p { font-size: 24px; line-height: 1.5; margin: 0 0 2px; color: #3a2a1a; font-weight: 400; }
      .ds-Japanese .ds-haiku p::before { content: ''; display: inline-block; width: 16px; }
      .ds-Japanese .ds-meta { display: flex; gap: 12px; font-size: 11px; color: #9a8a7a; margin-bottom: 24px; border-top: 1px solid #e0d8d0; padding-top: 16px; }
      .ds-Japanese .ds-event { border: 1px solid #e0d8d0; padding: 20px; background: rgba(255,255,255,0.3); }
      .ds-Japanese .ds-event strong { font-size: 14px; color: #3a2a1a; display: block; margin-bottom: 4px; font-weight: 600; }
      .ds-Japanese .ds-event p { font-size: 12px; color: #7a6a5a; margin: 0; line-height: 1.7; }
      .ds-Japanese .ds-cta { display: inline-block; margin-top: 20px; font-size: 11px; color: #7a6a5a; text-decoration: none; border: 1px solid #d0c8b8; padding: 8px 24px; }
    `,
  },
  {
    id: "kinetic",
    name: "Kinetic Typography",
    vibe: "Motion, oversized type, dynamic",
    css: `
      .ds-Kinetic { background: #faf8f4; font-family: 'Inter', system-ui, sans-serif; overflow: hidden; }
      .ds-Kinetic .ds-main { max-width: 520px; margin: 0 auto; padding: 32px 24px; }
      .ds-Kinetic .ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; position: relative; z-index: 2; }
      .ds-Kinetic .ds-logo { font-size: 13px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 4px; }
      .ds-Kinetic .ds-nav { display: flex; gap: 16px; font-size: 11px; color: #bbb; }
      .ds-Kinetic .ds-hero { position: relative; margin-bottom: 24px; }
      .ds-Kinetic .ds-hero-word { font-size: clamp(56px, 10vw, 96px); font-weight: 800; line-height: 0.9; letter-spacing: -4px; color: #1a1a1a; margin: 0; }
      .ds-Kinetic .ds-hero-word:nth-child(2) { color: #eee; -webkit-text-stroke: 2px #1a1a1a; margin-top: -8px; }
      .ds-Kinetic .ds-date { font-size: 10px; color: #bbb; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 24px; }
      .ds-Kinetic .ds-haiku { margin-bottom: 20px; position: relative; z-index: 1; }
      .ds-Kinetic .ds-haiku p { font-size: 20px; line-height: 1.4; margin: 0 0 2px; color: #4a4a4a; }
      .ds-Kinetic .ds-meta { display: flex; gap: 8px; font-size: 11px; color: #aaa; margin-bottom: 24px; }
      .ds-Kinetic .ds-event { position: relative; border-top: 1px solid #e0ddd5; padding-top: 20px; }
      .ds-Kinetic .ds-event strong { font-size: 13px; color: #1a1a1a; display: block; margin-bottom: 4px; font-weight: 600; }
      .ds-Kinetic .ds-event p { font-size: 12px; color: #8a8a7a; margin: 0; line-height: 1.6; }
      .ds-Kinetic .ds-cta { display: inline-block; margin-top: 20px; font-size: 11px; color: #1a1a1a; text-decoration: none; border-bottom: 1px solid #1a1a1a; }
    `,
  },
  {
    id: "magazine",
    name: "Art Gallery",
    vibe: "Curated, gallery walls, visual-first",
    css: `
      .ds-Gallery { background: #efeae2; font-family: 'Cormorant Garamond', serif; }
      .ds-Gallery .ds-main { max-width: 600px; margin: 0 auto; padding: 0; }
      .ds-Gallery .ds-header { padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.08); }
      .ds-Gallery .ds-logo { font-size: 18px; color: #3a2a1a; letter-spacing: -0.5px; }
      .ds-Gallery .ds-nav { display: flex; gap: 20px; font-size: 11px; color: #8a7a6a; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 2px; }
      .ds-Gallery .ds-frame { padding: 40px 32px; }
      .ds-Gallery .ds-image { width: 100%; height: 200px; background: linear-gradient(135deg, #d4c5b5 0%, #c5b5a5 50%, #b5a595 100%); margin-bottom: 24px; display: flex; align-items: center; justify-content: center; position: relative; }
      .ds-Gallery .ds-image::before { content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid rgba(255,255,255,0.2); }
      .ds-Gallery .ds-image span { font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'Inter', sans-serif; letter-spacing: 3px; text-transform: uppercase; }
      .ds-Gallery .ds-date { font-size: 10px; color: #8a7a6a; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; }
      .ds-Gallery .ds-haiku { margin-bottom: 16px; }
      .ds-Gallery .ds-haiku p { font-size: 28px; line-height: 1.35; margin: 0 0 2px; color: #3a2a1a; }
      .ds-Gallery .ds-meta { display: flex; gap: 16px; font-size: 13px; color: #8a7a6a; margin-bottom: 24px; font-style: italic; }
      .ds-Gallery .ds-event { border: 1px solid rgba(0,0,0,0.06); padding: 20px; background: rgba(255,255,255,0.2); }
      .ds-Gallery .ds-event strong { font-size: 16px; display: block; margin-bottom: 4px; color: #3a2a1a; }
      .ds-Gallery .ds-event p { font-size: 13px; color: #6a5a4a; margin: 0; line-height: 1.6; }
      .ds-Gallery .ds-cta { display: inline-block; margin-top: 20px; font-size: 12px; color: #6a5a4a; text-decoration: none; font-family: 'Inter', sans-serif; letter-spacing: 1px; }
    `,
  },
];

export default function DesignsPage() {
  return (
    <div>
      <div style={{
        padding: "48px 24px",
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{ marginBottom: 48, borderBottom: "2px solid #000", paddingBottom: 16 }}>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>DESIGN EXPLORATION</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>10 Directions for the daily haiku</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 32 }}>
          {designs.map((d) => (
            <div key={d.id} className={`ds-${d.id}`}>
              <style>{d.css}</style>
              <div className="ds-main" style={{ padding: "24px 16px !important", maxWidth: "100% !important", margin: 0 }}>
                <div className="ds-header">
                  <div className="ds-logo">{MAKER.name.toLowerCase()}</div>
                  <div className="ds-nav">
                    <span>Write</span>
                    <span>Browse</span>
                  </div>
                </div>
                <div className="ds-date">{MAKER.date}</div>

                {d.id === "editorial" && <div className="ds-superhead">{MAKER.headline}</div>}
                {d.id === "kinetic" && (
                  <div className="ds-hero">
                    <p className="ds-hero-word">mobile.</p>
                    <p className="ds-hero-word">forever.</p>
                  </div>
                )}

                <div className="ds-haiku">
                  <p>{MAKER.haiku.line1}</p>
                  <p>{MAKER.haiku.line2}</p>
                  <p>{MAKER.haiku.line3}</p>
                </div>
                <div className="ds-meta">
                  <span>{MAKER.author}</span>
                  <span>{MAKER.category}</span>
                </div>
                <div className="ds-event">
                  <strong>{MAKER.headline}</strong>
                  <p>{MAKER.description}</p>
                </div>
                <a className="ds-cta" href="#">Write today&rsquo;s haiku</a>
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #eee" }}>
                <p style={{ fontSize: 11, fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>{d.name}</p>
                <p style={{ fontSize: 10, color: "#888", margin: "2px 0 0" }}>{d.vibe}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
