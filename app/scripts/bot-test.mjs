#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = { url: 'http://localhost:3000/', outDir: 'artifacts', mobile: false, ua: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url' && argv[i + 1]) { args.url = argv[++i]; continue; }
    if (a === '--outDir' && argv[i + 1]) { args.outDir = argv[++i]; continue; }
    if (a === '--ua' && argv[i + 1]) { args.ua = argv[++i]; continue; }
    if (a === '--mobile') { args.mobile = true; continue; }
  }
  return args;
}

const GOOGLEBOT_DESKTOP = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const GOOGLEBOT_SMARTPHONE = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

async function main() {
  const args = parseArgs(process.argv);
  const outDir = path.isAbsolute(args.outDir) ? args.outDir : path.join(process.cwd(), args.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = `bot-${args.mobile ? 'mobile' : 'desktop'}-${ts}`;
  const htmlPath = path.join(outDir, `${baseName}.html`);
  const pngPath = path.join(outDir, `${baseName}.png`);

  const userAgent = args.ua || (args.mobile ? GOOGLEBOT_SMARTPHONE : GOOGLEBOT_DESKTOP);

  console.log('[bot-test] Launching Puppeteer');
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  if (args.mobile) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  }
  page.on('console', msg => console.log('[page]', msg.type(), msg.text()));

  console.log('[bot-test] Navigating to', args.url);
  await page.goto(args.url, { waitUntil: 'networkidle2', timeout: 60000 });

  const content = await page.content();
  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log('[bot-test] Saved HTML ->', htmlPath);

  await page.screenshot({ path: pngPath, fullPage: true });
  console.log('[bot-test] Saved screenshot ->', pngPath);

  await browser.close();
  console.log('[bot-test] Done');
}

main().catch(err => {
  console.error('[bot-test] ERROR', err);
  process.exit(1);
});
