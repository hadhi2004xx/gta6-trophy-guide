// Leonida 100% — the entry program (Node 22, standard library only). It hands the
// guide in: it copies this repository's app/ and screenshots/ to /output and writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts, exactly as
// the scorer rebuilds it. The run is deterministic: same files in, same bytes out,
// no timestamps, no network, no randomness anywhere in the copy.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The app itself is plain static files under app/: index.html at the root, vanilla
// ES modules, one stylesheet, and app/data/trophies.json with the 55 official
// trophies and a cited guide for each. It runs with the network off.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly, before writing anything, when the entry is incomplete.
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');
for (const required of [join(appDir, 'index.html'), join(appDir, 'data', 'trophies.json')]) {
  if (!existsSync(required)) throw new Error('missing required file: ' + required);
}
if (!existsSync(shotsDir) || readdirSync(shotsDir).filter((f) => statSync(join(shotsDir, f)).isFile()).length < 3) {
  throw new Error('screenshots/ must hold at least 3 images');
}
mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

// Read the dossier back: it must parse, and it must fit the 1.5 MiB cap the gate
// enforces. A run that writes a dossier it cannot read back has failed.
const dossierPath = join(out, 'dossier.json');
const dossierBytes = readFileSync(dossierPath);
const dossier = JSON.parse(dossierBytes.toString('utf-8'));
if (!dossier || typeof dossier !== 'object') throw new Error('dossier.json did not parse');
if (dossierBytes.length > 1572864) throw new Error('dossier.json over the 1.5 MiB cap: ' + dossierBytes.length + ' bytes');
console.log('dossier.json: ' + dossierBytes.length + ' bytes');
