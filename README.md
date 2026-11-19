# Leonida 100% — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft
Auto VI — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden until
earned, 1 potentially missable, 3 more with chapter-gated steps, 0 needing
online play. Built for the make.fun
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty.

## What it is

`app/` is plain static files — no build step, no network at runtime. Open
`app/index.html` in a browser (or run `node serve.ts` and visit
http://localhost:8080) and it works with the network off.

- **Full official list.** Every trophy with its official name, description and
  grade exactly as PlayStation publishes them (as listed by Exophase and
  PSNProfiles), plus a per-trophy guide written in our own words.
- **Cited guidance.** Each guide names its sources beside it — PowerPyx's
  full launch guide first of all, plus GTABase, EGamers, Output Lag, GTA Vice
  City Hub, GGRecon and CryptoGames — so a reader can see where every
  specific location, count or step comes from. PowerPyx's guide, read on
  20 Nov 2026, confirmed the triggers for 5 of the 6 trophies that were
  unknown at launch (In The Beginning…, Capital Offense, Let's Go Bowling,
  Personal Best, The Truth Is Out There); the last two leads (Bad Luck,
  I Guess; Ten Pin) are stated as leads, not confirmed methods.
- **Missable audit.** PowerPyx lists exactly one potentially missable
  trophy — Positive Mental Attitude, whose first meditation happens only in
  Chapter 1. The roadmap carries a written audit of the candidates that
  were checked and cleared (Kenton returns, side strands persist, Kingpin
  Bowling respawns, disappearing optional missions never block a trophy),
  each with its source. Three further trophies are flagged "do early" for
  their chapter-gated steps: Maximum Withdrawal, A Classic Blitz Play and
  Let's Go Bowling.
- **Tracker.** Checklist saved in `localStorage`, export to a JSON file and
  import it back, filters by kind (story, missable, do early, collectibles,
  activities, crime, exploration, money, platinum path) and by grade, text
  search, and an earned-only view. A progress ring and bar track the run.
- **Spoiler setting.** On by default: hidden story trophies stay masked until
  earned. Earned hidden trophies reveal their real names.
- **Roadmap.** Six stages in order, built from the official descriptions and
  PowerPyx's launch roadmap: 5 chapters and roughly 91–93 story missions,
  side characters, activities, collectibles, crime and money, and the 35-task
  100% checklist last. Each stage shows its chapter range, trophy count and
  earned count, with missable and do-early flags on the rows inside it.
- **Deep links.** Real app states, used for the screenshots:
  `?trophy=28` opens one trophy's guide, `?spoilers=hidden|shown` sets the
  spoiler switch, `?kind` / `?grade` / `?earned-only=1` set the filters,
  `?view=roadmap` jumps to the roadmap.

## Layout

- `app/index.html` — page structure: hero audit strip, do-early panel,
  controls, featured excerpt, full checklist, roadmap, notes, sources.
- `app/style.css` — Precision Technical / Swiss Grid: obsidian `#090A0D`,
  hairlines, tabular numerals, one accent `#10B981`. Type is sized for the
  dossier contact sheet, where the cover shrinks to 768×480.
- `app/app.js` — bootstrap: URL state, event wiring, render-all.
- `app/data.js` — load and validate `trophies.json`; audit counts, featured
  eight, do-early set.
- `app/storage.js` — localStorage load/save, export file, import parsing.
- `app/tracker.js` — earned-state math: counts, percents, ring offset.
- `app/filters.js` — search, kind, grade and earned-only matching.
- `app/render.js` — audit strip, progress ring, do-early cards, checklist
  rows, open-guide panels, notes, source list.
- `app/roadmap.js` — six-stage timeline cards with earned counts and flags.
- `app/data/trophies.json` — the 55 trophies, guides, sources and roadmap.
- `main.ts` — hand-in program: copies `app/` + `screenshots/`, writes
  `dossier.json` with the vendored `buildDossier`.
- `screenshots/` — 4 real headless-Chromium renders of the app:
  1-cover (hero stats + featured excerpt), 2-guide (Positive Mental
  Attitude open, large type), 3-roadmap (six-stage timeline + missable
  audit), 4-tracker (spoiler on, 12 earned, export/import visible).
  `shots.json` records each shot's URL state.

## Verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # run twice; dossier.json must be byte-identical
node serve.ts                                          # http://localhost:8080
```

## Sources

PowerPyx — GTA 6 Trophy Guide & Roadmap:
https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
GTABase — GTA 6 Trophy & Achievement Guide:
https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
EGamers — GTA 6 Trophy List:
https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
Output Lag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/
GTA Vice City Hub — GTA 6 Achievements: https://www.gtavicecityhub.com/achievements
GGRecon — GTA 6's trophy list is out, and the Platinum needs 100%:
https://www.ggrecon.com/articles/gta-6-trophies-achievements-list-platinum/
CryptoGames — GTA 6 Trophies and Achievements:
https://cryptogames.gg/gta-6-trophies-achievements-full-list/
Exophase and PSNProfiles carry the official list; their pages were consulted
at launch and no direct link is recorded for them.
