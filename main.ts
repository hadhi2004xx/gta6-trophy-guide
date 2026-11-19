// Leonida 100% — hand-in program for the gta6-trophy-guide-01 bounty.
// Node 22, standard library only. It copies this repository's app/ and
// screenshots/ into the output directory and writes /output/dossier.json with
// the vendored make.fun library, exactly as the scorer expects. Outside the
// grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts is the kit's copy and must stay byte-identical:
// the scorer rebuilds the dossier with its own copy and compares the two.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder beside this file; the output directory is
// /output in the grader, or MAKEFUN_OUTPUT_DIR anywhere else.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Count the files under app/ so the run refuses early when the entry is past
// the scorer's own caps, instead of handing in something it would refuse.
function countAppEntries(folder) {
  let entries = 0;
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    entries += 1;
    if (statSync(path).isDirectory()) entries += countAppEntries(path);
  }
  return entries;
}

const appEntries = countAppEntries(join(repoRoot, 'app'));
if (appEntries > 993) throw new Error(`app/ holds ${appEntries} entries, over the 993 cap`);

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): text_max_bytes shapes the
// dossier text; the rest refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB, more than 993 app entries, or app files
// past 48 MiB in all.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`handed in: ${appEntries} app entries + screenshots -> ${outputDir}/dossier.json (${dossier.length} bytes)`);
