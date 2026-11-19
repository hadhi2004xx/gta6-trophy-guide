[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![make.fun · gta6-trophy-guide-01 · rank](https://make.fun/badge/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![make.fun · gta6-trophy-guide-01 · reward](https://make.fun/badge/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida 100% — GTA VI Trophy Guide & Tracker

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun.

## What it is

- **Every trophy, official and complete** — all 55 names, descriptions and grades exactly as PlayStation publishes them: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden until earned, 0 online.
- **A guide per trophy, in our own words, with its sources named beside it** — PowerPyx, GTABase and EGamers, with direct links. A source is cited, never copied. Five trophies whose triggers are still launch-era leads say so honestly instead of inventing steps.
- **A tracker** — checklist saved in localStorage, export to a JSON file and import back, filters by kind (story, missable, do early, collectibles, activities, crime, exploration, money) and by grade, text search, earned-only view, and a spoiler setting (on by default) that masks hidden story trophies until they are earned.
- **A roadmap to the platinum in six stages**, built from the official descriptions — which story chapters and missions, which collectibles and counts, in what order. Roughly 200 hours in total, per PowerPyx.
- **One missable trophy, honestly counted** — Positive Mental Attitude, whose first meditation happens only in Chapter 1 — plus three do-early trophies gated behind chapter missions, and a missable-audit panel listing the candidates that were checked and cleared.

## Design

Precision Technical / Swiss Grid: obsidian `#090A0D`, 1px hairlines, tabular numerals on every number, one accent `#10B981`. Static files only, no network at run time, no Rockstar logo or artwork. The cover is built for the dossier contact sheet: hero audit strip, progress ring, sticky filters, and a short eight-trophy excerpt in large type.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. Screenshots are real headless-Chromium renders of the app; see `shots.json` for the four views.

## Files

- `app/index.html` — the page: masthead, audit strip, sticky controls, featured excerpt, guide panel, checklist, roadmap, missable audit.
- `app/app.js` — bootstrap: loads the data, reads the URL state (`?trophy=<id>`, `?spoilers=`, `?kind`, `?grade`, `?earned-only=1`, `?view=roadmap`), wires the controls, renders.
- `app/store.js` — progress in localStorage, export and import.
- `app/classify.js` — kinds, audit counts, the featured eight, the six roadmap stages, the missable audit.
- `app/views.js` — every DOM render: audit strip, progress ring, featured cards, trophy rows, guide panel, roadmap, audit list.
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, hidden flag, kind, missable / do-early flags, count, guide, and named sources.
- `main.ts` — the hand-in program. `vendor/makefun-frontend.ts` is the kit's copy, unchanged.
