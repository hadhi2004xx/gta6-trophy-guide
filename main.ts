// Leonida 100% — GTA VI trophy guide, entry program (Node 22, stdlib only).
// Hands the guide in: copies this directory's app/ and screenshots/ to the
// output directory and writes dossier.json with the vendored make.fun
// library, exactly as the kit's starter does. The library file itself is
// the kit's copy and is left untouched.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The scorer's own caps, as the kit's RULES.txt states them: at most 4
// screenshots, each at most 256 KiB; app/ at most 993 files and directories
// and 48 MiB in all. Refuse early with a clear message instead of letting
// the dossier build fail halfway.
const MAX_SCREENSHOTS = 4;
const MAX_SCREENSHOT_BYTES = 262144;
const MAX_APP_FILES = 993;
const MAX_APP_BYTES = 50331648;

function countAppFiles(dir) {
  let files = 0;
  let bytes = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    files += 1;
    if (st.isDirectory()) {
      const sub = countAppFiles(p);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      bytes += st.size;
    }
  }
  return { files, bytes };
}

function checkScreenshots(dir) {
  if (!existsSync(dir)) throw new Error('screenshots/ is missing: the entry needs 3 or 4 screenshots of the guide.');
  const names = readdirSync(dir).filter((n) => !n.startsWith('.')).sort();
  if (names.length < 3 || names.length > MAX_SCREENSHOTS) {
    throw new Error(`screenshots/ holds ${names.length} images, need 3 or 4.`);
  }
  for (const n of names) {
    const st = statSync(join(dir, n));
    if (!st.isFile()) throw new Error(`screenshots/${n} is not a regular file.`);
    if (st.size > MAX_SCREENSHOT_BYTES) throw new Error(`screenshots/${n} is ${st.size} bytes, over the 256 KiB cap.`);
  }
  return names;
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

const appTotals = countAppFiles(appDir);
if (appTotals.files > MAX_APP_FILES) throw new Error(`app/ holds ${appTotals.files} files and directories, over the 993 cap.`);
if (appTotals.bytes > MAX_APP_BYTES) throw new Error(`app/ is ${appTotals.bytes} bytes, over the 48 MiB cap.`);
const shotNames = checkScreenshots(shotsDir);

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: MAX_SCREENSHOTS, max_bytes: MAX_SCREENSHOT_BYTES }, app_max_files: MAX_APP_FILES, app_max_bytes: MAX_APP_BYTES }),
);

console.log(`Leonida 100% handed in: ${appTotals.files} app entries, ${appTotals.bytes} bytes; screenshots: ${shotNames.join(', ')}.`);
