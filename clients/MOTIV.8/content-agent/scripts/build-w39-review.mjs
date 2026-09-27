import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve('content-agent/weekly/2026-W39');
const working = path.join(root, 'working');
const previews = path.join(root, 'previews');
const reels = path.join(root, 'reels');
const keyframes = path.join(root, 'reel-keyframes');
const ffmpegPath = process.env.FFMPEG_PATH || 'C:/Users/Dina lekhovitser/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe';
for (const dir of [working, previews, reels, keyframes]) fs.mkdirSync(dir, { recursive: true });
// Carousel filenames are semantic. Remove only the previous W39-02 exports so a
// copy revision cannot leave stale slides in its contact sheet or Drive handoff.
for (const name of fs.readdirSync(previews)) {
  if (/^calendar-protection-.*\.png$/i.test(name)) fs.rmSync(path.join(previews, name), { force: true });
}

const fontRegular = path.join(root, 'sources', 'instrument-sans-regular.ttf');
const fontMedium = path.join(root, 'sources', 'instrument-sans-medium.ttf');
if (!fs.existsSync(fontRegular) || !fs.existsSync(fontMedium)) throw new Error('Approved Instrument Sans font files are missing');
const fontRegularDataUrl = `data:font/ttf;base64,${fs.readFileSync(fontRegular).toString('base64')}`;

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('’', '&#8217;').replaceAll('“', '&#8220;').replaceAll('”', '&#8221;');
const safe = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 52);
const fontSizeFor = (headline, support = '') => {
  const n = Math.max(headline.length, support.length);
  if (n > 84) return 68;
  if (n > 64) return 74;
  if (n > 42) return 82;
  return 92;
};

const sets = [
  {
    slug: 'calendar-protection', bg: '#F4F0E7', accent: '#356A55',
    slides: [
      ['Before you say yes', 'to one more thing', { noRule: true, sameSize: true }],
      ['Ask one question', 'What will this replace?', { noRule: true, sameSize: true }],
      ['Name the exact thing', 'Your workout\nDinner with a friend\nAn hour to finish your work\nA quiet evening', { noRule: true, supportSize: 46 }],
      ['If you would not choose\nto move it', 'do not add the new request today', { noRule: true, sameSize: true }],
      ['A full calendar is full\nof trade-offs', 'Make yours visible', { noRule: true, sameSize: true }]
    ]
  },
  {
    slug: 'routine-restart-script', bg: '#C9C6BE', accent: '#3C7F79',
    slides: [
      ['When your routine breaks', 'do not start from zero'],
      ['Say what happened', 'This week changed'],
      ['Keep the goal', 'Reduce the version'],
      ['Choose the next repeat', 'When can I do the smallest version'],
      ['Not run 5K tomorrow', 'Put my shoes by the door for a 10-minute walk', { noRule: true, sameSize: true }],
      ['A restart is a new agreement with real life', '']
    ]
  }
];

const htmlForSlide = ({ bg, accent }, headline, support, hasArrow, options = {}) => {
  const size = fontSizeFor(headline, support);
  const supportSize = options.sameSize ? size : options.supportSize || (support.length > 78 ? 42 : 48);
  const headlineHtml = options.highlightOne ? esc(headline).replace('ONE', `<span class="accent">ONE</span>`) : esc(headline);
  const divider = options.noRule ? '' : '<div class="rule"></div>';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:Instrument;src:url('../sources/instrument-sans-regular.ttf') format('truetype');font-weight:400}
  @font-face{font-family:Instrument;src:url('../sources/instrument-sans-medium.ttf') format('truetype');font-weight:500}
  *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden;background:${bg};color:#171717}
  main{position:relative;width:1080px;height:1350px;padding:110px 78px;display:flex;align-items:center;justify-content:center;text-align:center}
  .block{width:920px;display:flex;flex-direction:column;align-items:center;justify-content:center}
  h1{font:400 ${size}px/1.04 Instrument,sans-serif;letter-spacing:-.057em;margin:0;max-width:920px;text-wrap:balance}.accent{color:${accent}}
  .rule{width:330px;height:5px;background:${accent};margin:48px 0}
  p{font:400 ${supportSize}px/1.14 Instrument,sans-serif;letter-spacing:-.042em;margin:0;max-width:860px;white-space:pre-line;text-wrap:balance}
  .arrow{position:absolute;right:92px;bottom:76px;color:${accent};font:400 46px Instrument,sans-serif}
  </style></head><body><main><section class="block"><h1>${headlineHtml}</h1>${support ? `${divider}<p>${esc(support)}</p>` : divider}</section>${hasArrow ? '<span class="arrow">→</span>' : ''}</main></body></html>`;
};

const staticHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Instrument;src:url('../sources/instrument-sans-regular.ttf') format('truetype');font-weight:400}
*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden;background:#C9C6BE;color:#171717}
main{position:relative;width:1080px;height:1350px;display:flex;align-items:center;justify-content:center;padding:110px 78px;text-align:center}
.copy{width:920px}h1{font:400 88px/1.04 Instrument,sans-serif;letter-spacing:-.058em;margin:0;text-wrap:balance}.accent{color:#356A55}
</style></head><body><main><section class="copy"><h1>Before the week fills up, protect <span class="accent">one thing</span> that matters to you.</h1></section></main></body></html>`;

for (const set of sets) {
  set.slides.forEach(([headline, support, options], index) => {
    const number = String(index + 1).padStart(2, '0');
    const name = `${set.slug}-${number}-${safe(headline)}.html`;
    fs.writeFileSync(path.join(working, name), htmlForSlide(set, headline, support, index < set.slides.length - 1, options));
  });
}
fs.writeFileSync(path.join(working, 'protect-one-thing-static.html'), staticHtml);

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
for (const set of sets) {
  for (let index = 0; index < set.slides.length; index++) {
    const [headline] = set.slides[index];
    const number = String(index + 1).padStart(2, '0');
    const htmlName = `${set.slug}-${number}-${safe(headline)}.html`;
    const pngName = `${set.slug}-${number}-${safe(headline)}.png`;
    await page.goto(pathToFileURL(path.join(working, htmlName)).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(previews, pngName), type: 'png' });
  }
}
await page.goto(pathToFileURL(path.join(working, 'protect-one-thing-static.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(previews, 'protect-one-thing-before-the-week-fills-up.png'), type: 'png' });
await page.close();

const reelDefs = [
  {
    slug: '15-minute-bridge', image: 'reel-15-minute-bridge-background-v1.png', direction: 1,
    beats: [
      'Your plan changed. You have 15 minutes.',
      'Do not rebuild the whole day.',
      'Pick the next task that becomes easier after 15 minutes.',
      'Open the document. Write the first three lines. Stop.',
      'You made a bridge back to it.'
    ]
  },
  {
    slug: '3-minute-reset-before-replan', image: 'reel-3-minute-reset-background-v1.png', direction: -1,
    beats: [
      'Before you re-plan: pause for 3 minutes.',
      'Minute 1: name what changed.',
      'Minute 2: cross out what no longer fits.',
      'Minute 3: protect one next step.',
      'Now make a smaller plan.'
    ]
  }
];

for (const def of reelDefs) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const media = await page.evaluate(async ({ def, imageUrl, regularUrl }) => {
    const font = new FontFace('Instrument', `url(${regularUrl})`, { weight: '400' });
    await font.load(); document.fonts.add(font); await document.fonts.ready;
    const img = new Image(); img.src = imageUrl; await img.decode();
    // Render at half-size to reliably sustain 30fps, then upscale with FFmpeg.
    // The design coordinates remain 1080×1920 so typography and composition do not change.
    const canvas = document.createElement('canvas'); canvas.width = 540; canvas.height = 960; document.body.append(canvas);
    const ctx = canvas.getContext('2d'); ctx.scale(.5, .5);
    const stream = canvas.captureStream(30);
    const mimeType = ['video/mp4;codecs=avc1.42E01E','video/mp4;codecs=avc1','video/mp4'].find(MediaRecorder.isTypeSupported);
    if (!mimeType) throw new Error('Chrome MediaRecorder does not support MP4/H.264');
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 9000000 });
    const chunks = []; recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const duration = 12; const beatStarts = [0, 2.4, 4.7, 7.4, 9.8]; const keyTimes = [1.2, 3.5, 6.0, 8.6, 10.8];
    const snapshots = Array(5).fill(null); let started = performance.now();
    const wrap = (context, text, maxWidth) => {
      const words = text.split(' '); const lines = []; let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (context.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
      }
      if (line) lines.push(line); return lines;
    };
    const draw = (t) => {
      const scale = 1.04 + 0.06 * (t / duration);
      const sw = img.width / scale, sh = img.height / scale;
      const driftX = def.direction * 42 * (t / duration);
      const driftY = -24 * (t / duration);
      const sx = Math.max(0, Math.min(img.width - sw, (img.width - sw) / 2 + driftX));
      const sy = Math.max(0, Math.min(img.height - sh, (img.height - sh) / 2 + driftY));
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1080, 1920);
      // These rooms already have a window and visible greenery. Animate only a
      // soft cast shadow on the wall, as if a breeze moves leaves outside.
      // The treatment is continuous across the whole Reel and stays behind copy.
      ctx.save();
      ctx.filter = 'blur(12px)';
      ctx.fillStyle = 'rgba(42, 57, 33, .14)';
      const shadowX = 690 + def.direction * Math.sin(t * .42) * 27;
      const shadowY = 410 + Math.cos(t * .55) * 22;
      [[0, 0, 86, 23, -.52], [86, 64, 64, 18, .25], [-64, 118, 72, 20, .56], [36, 184, 96, 25, -.34], [-104, 246, 54, 16, .16]].forEach(([x, y, rx, ry, angle], i) => {
        ctx.save();
        ctx.translate(shadowX + x + Math.sin(t * .7 + i) * 9, shadowY + y + Math.cos(t * .63 + i) * 7);
        ctx.rotate(angle + Math.sin(t * .58 + i) * .12);
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
      const grad = ctx.createLinearGradient(0, 0, 0, 1920); grad.addColorStop(0, 'rgba(23,23,23,.30)'); grad.addColorStop(.5, 'rgba(23,23,23,.45)'); grad.addColorStop(1, 'rgba(23,23,23,.62)'); ctx.fillStyle = grad; ctx.fillRect(0,0,1080,1920);
      let idx = beatStarts.length - 1; for (let i = 0; i < beatStarts.length - 1; i++) if (t < beatStarts[i+1]) { idx = i; break; }
      const local = t - beatStarts[idx]; const reveal = Math.min(1, local / .48);
      const paintText = (text, alpha, offsetY) => {
        const size = text.length > 54 ? 72 : text.length > 38 ? 80 : 92;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(0, offsetY);
        ctx.font = `400 ${size}px Instrument`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFFDF9';
        const lines = wrap(ctx, text, 880); const lineHeight = size * 1.08; const blockHeight = lines.length * lineHeight; const firstY = 960 - blockHeight/2 + lineHeight/2;
        lines.forEach((line, i) => ctx.fillText(line, 540, firstY + i * lineHeight));
        ctx.fillStyle = '#356A55'; ctx.fillRect(375, firstY + (lines.length - 1) * lineHeight + size * .78, 330, 5);
        ctx.restore();
      };
      // The previous line and the new line overlap briefly, so no empty frame or hard cut appears.
      if (idx > 0 && local < .48) paintText(def.beats[idx - 1], 1 - reveal, -10 * reveal);
      paintText(def.beats[idx], reveal, (1 - reveal) * 22);
    };
    const stopped = new Promise(resolve => recorder.onstop = resolve);
    recorder.start(250);
    await new Promise(resolve => {
      const frame = (now) => {
        const t = Math.min(duration, (now - started) / 1000); draw(t);
        keyTimes.forEach((kt, i) => { if (!snapshots[i] && t >= kt) snapshots[i] = canvas.toDataURL('image/png'); });
        if (t < duration) requestAnimationFrame(frame); else { recorder.stop(); resolve(); }
      };
      requestAnimationFrame(frame);
    });
    await stopped;
    const blob = new Blob(chunks, { type: mimeType }); const ab = await blob.arrayBuffer();
    let binary = ''; const bytes = new Uint8Array(ab); const step = 0x8000; for (let i=0;i<bytes.length;i+=step) binary += String.fromCharCode(...bytes.subarray(i,i+step));
    return { video: btoa(binary), snapshots, mimeType, size: bytes.length };
  }, {
    def,
    imageUrl: `data:image/png;base64,${fs.readFileSync(path.join(root, 'sources', def.image)).toString('base64')}`,
    regularUrl: fontRegularDataUrl
  });
  const mp4Path = path.join(reels, `${def.slug}-review.mp4`);
  const rawMp4Path = path.join(reels, `${def.slug}-raw.mp4`);
  const encodedMp4Path = path.join(reels, `${def.slug}-encoded.mp4`);
  fs.writeFileSync(rawMp4Path, Buffer.from(media.video, 'base64'));
  execFileSync(ffmpegPath, ['-y', '-i', rawMp4Path, '-vf', 'scale=1080:1920:flags=lanczos,fps=30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', encodedMp4Path], { stdio: 'ignore' });
  fs.renameSync(encodedMp4Path, mp4Path);
  fs.rmSync(rawMp4Path, { force: true });
  media.snapshots.forEach((data, i) => {
    const file = path.join(keyframes, `${def.slug}-${String(i+1).padStart(2,'0')}.png`);
    fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  });
  await page.close();
}

await browser.close();
console.log('Built 12 PNG review frames, 10 Reel keyframes, and 2 smooth 30fps MP4 review renders.');
