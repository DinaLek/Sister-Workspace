import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');
const ffprobePath = process.env.FFPROBE_PATH || 'C:/Users/Dina lekhovitser/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffprobe.exe';

const root = path.resolve('content-agent/weekly/2026-W39');
const previews = path.join(root, 'previews');
const reels = path.join(root, 'reels');
const review = path.join(root, 'review');
const sampleDir = path.join(review, 'mp4-samples');
fs.mkdirSync(sampleDir, { recursive: true });

const pngs = fs.readdirSync(previews).filter(name => name.endsWith('.png')).sort();
if (pngs.length !== 12) throw new Error(`Expected 12 preview PNGs, found ${pngs.length}`);
for (const name of pngs) {
  const meta = await sharp(path.join(previews, name)).metadata();
  if (meta.width !== 1080 || meta.height !== 1350) throw new Error(`${name}: expected 1080x1350, got ${meta.width}x${meta.height}`);
}

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
const reelNames = ['15-minute-bridge-review.mp4', '3-minute-reset-before-replan-review.mp4'];
const keyTimes = [1.2, 3.5, 6.0, 8.6, 10.8];
const reelMeta = [];
for (const name of reelNames) {
  const reelPath = path.join(reels, name);
  if (!fs.existsSync(reelPath) || fs.statSync(reelPath).size < 100000) throw new Error(`${name}: missing or implausibly small MP4`);
  const probe = JSON.parse(execFileSync(ffprobePath, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate,avg_frame_rate', '-of', 'json', reelPath], { encoding: 'utf8' }));
  const stream = probe.streams?.[0];
  if (stream?.r_frame_rate !== '30/1' || stream?.avg_frame_rate !== '30/1') {
    throw new Error(`${name}: expected final 30fps MP4, got r_frame_rate=${stream?.r_frame_rate} avg_frame_rate=${stream?.avg_frame_rate}`);
  }
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent('<style>html,body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}video{display:block;width:1080px;height:1920px;object-fit:contain}</style><video id="v" muted playsinline></video>');
  const url = `data:video/mp4;base64,${fs.readFileSync(reelPath).toString('base64')}`;
  const meta = await page.evaluate(async (src) => {
    const v = document.querySelector('#v'); v.src = src;
    await new Promise((resolve, reject) => { v.onloadedmetadata = resolve; v.onerror = () => reject(new Error(v.error?.message || 'video load failed')); });
    return { width: v.videoWidth, height: v.videoHeight, duration: v.duration };
  }, url);
  if (meta.width !== 1080 || meta.height !== 1920) throw new Error(`${name}: expected 1080x1920, got ${meta.width}x${meta.height}`);
  if (meta.duration < 11.5 || meta.duration > 12.5) throw new Error(`${name}: expected ~12s, got ${meta.duration}`);
  for (let i = 0; i < keyTimes.length; i++) {
    await page.evaluate(async (t) => {
      const v = document.querySelector('#v');
      await new Promise((resolve, reject) => { v.onseeked = resolve; v.onerror = reject; v.currentTime = t; });
    }, keyTimes[i]);
    await page.locator('#v').screenshot({ path: path.join(sampleDir, `${path.basename(name, '.mp4')}-${String(i+1).padStart(2,'0')}.png`) });
  }
  reelMeta.push({ name, ...meta, ...stream, bytes: fs.statSync(reelPath).size });
  await page.close();
}
await browser.close();

async function contactSheet(names, outName, cols, thumbW, thumbH, baseDir) {
  const rows = Math.ceil(names.length / cols);
  const composites = [];
  for (let i = 0; i < names.length; i++) {
    const input = await sharp(path.join(baseDir, names[i])).resize(thumbW, thumbH, { fit: 'fill' }).png().toBuffer();
    composites.push({ input, left: (i % cols) * thumbW, top: Math.floor(i / cols) * thumbH });
  }
  await sharp({ create: { width: cols * thumbW, height: rows * thumbH, channels: 3, background: '#ffffff' } }).composite(composites).png().toFile(path.join(review, outName));
}

await contactSheet(pngs.filter(n => n.startsWith('calendar-protection-')), 'carousel-02-contact-sheet.png', 3, 360, 450, previews);
await contactSheet(pngs.filter(n => n.startsWith('routine-restart-script-')), 'carousel-05-contact-sheet.png', 3, 360, 450, previews);
await contactSheet(pngs.filter(n => n.startsWith('protect-one-thing-')), 'static-04-contact-sheet.png', 1, 540, 675, previews);
const samples = fs.readdirSync(sampleDir).filter(n => n.endsWith('.png')).sort();
await contactSheet(samples.filter(n => n.startsWith('15-minute-bridge-')), 'reel-01-mp4-samples.png', 5, 216, 384, sampleDir);
await contactSheet(samples.filter(n => n.startsWith('3-minute-reset-')), 'reel-03-mp4-samples.png', 5, 216, 384, sampleDir);

fs.writeFileSync(path.join(review, 'technical-media-check.json'), JSON.stringify({ previewPngCount: pngs.length, previewDimensions: '1080x1350', reels: reelMeta }, null, 2));
console.log(JSON.stringify({ previewPngCount: pngs.length, reels: reelMeta }, null, 2));
