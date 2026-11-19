// Leonida 100% — the hand-in program for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is plain static files under app/:
// index.html + app.js + roadmap.js + style.css + data/trophies.json, and 3-4
// screenshots/ renders of it. This program copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json there
// with buildDossier from the vendored make.fun library — the summary the
// judge reads (screenshots, first-load files and bytes, and the source).
// vendor/makefun-frontend.ts is the kit's copy and must stay byte-identical:
// the scorer rebuilds the dossier with its own copy and compares the two.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

function countEntries(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += 1;
    if (statSync(path).isDirectory()) total += countEntries(path);
  }
  return total;
}

function appBytes(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);
    total += stats.isDirectory() ? appBytes(path) : stats.size;
  }
  return total;
}

// Refuse early, with a readable message, when the app would bust the
// scorer's caps instead of letting the dossier build fail obscurely.
const appEntries = countEntries(appDir);
const appSize = appBytes(appDir);
if (appEntries > 993) throw new Error(`app/ holds ${appEntries} entries, over the 993 cap`);
if (appSize > 50331648) throw new Error(`app/ is ${appSize} bytes, over the 48 MiB cap`);

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`handed in: app/ (${appEntries} entries, ${appSize} bytes) + screenshots/ -> ${out}`);
