# Leonida 100% — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Every PlayStation 5 trophy in Grand Theft Auto VI — all 55 of them, with the
official name, description and grade for each, a guide written for this
entry, and a tracker that remembers what you have earned. The split is
1 Platinum, 2 Gold, 6 Silver and 46 Bronze; 28 trophies stay hidden on
PlayStation until you earn them, exactly one can be missed for good, three
more have steps tied to a story chapter, and none of them needs online play.
Built for the make.fun
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty.

## Running it

`app/` is static files only — no build step and no network at run time.
Open `app/index.html` directly, or serve it with `node serve.ts` and visit
http://localhost:8080. Either way it works with the network off.

## What is inside

- **The whole official list.** All 55 trophies with PlayStation's official
  name, description and grade, as published on Exophase and PSNProfiles.
  Each one also carries a guide in this entry's own words.
- **A source beside every guide.** Each trophy's guide names where its
  facts come from — PowerPyx's full launch guide first, then GTABase,
  EGamers, Output Lag, GTA Vice City Hub, GGRecon and CryptoGames — so a
  reader can check any location, count or step. PowerPyx's guide, read on
  20 Nov 2026, pinned down the triggers for 5 of the 6 trophies that were
  still unknown at launch (In The Beginning…, Capital Offense, Let's Go
  Bowling, Personal Best, The Truth Is Out There). The last two leads
  (Bad Luck, I Guess; Ten Pin) are labelled as leads, not confirmed ways
  to earn them.
- **A missable audit.** PowerPyx names exactly one trophy that can be
  missed — Positive Mental Attitude, whose first meditation only happens
  in Chapter 1. The roadmap carries a written audit of the candidates that
  were checked and cleared (Kenton comes back, the side strands stay
  open, Kingpin Bowling's robbery icon respawns, and optional missions
  that disappear never block a trophy), each with its source. Three more
  trophies are flagged "do early" because their steps sit behind story
  chapters: Maximum Withdrawal, A Classic Blitz Play and Let's Go Bowling.
- **A tracker.** Tick trophies off and the checklist keeps them in
  `localStorage`. Export the earned list to a JSON file and import it
  back, filter by kind (story, missable, do early, collectibles,
  activities, crime, exploration, money, platinum path) or by grade,
  search by name or keyword, and show earned-only. A ring and a bar
  track the run.
- **Spoilers off by default — on, in the sense that hiding is on.**
  Hidden story trophies stay masked until you earn them. Earn one and
  its real name appears.
- **A roadmap.** Six stages in order, drawn from the official descriptions
  and PowerPyx's launch roadmap: 5 chapters and about 91–93 story
  missions, the side characters, activities, collectibles, crime and
  money, and the 35-task 100% checklist last. Every stage shows its
  chapter range, how many trophies it holds and how many are earned,
  with the missable and do-early flags on the rows inside it.
- **Deep links.** The URL states are real app states, and the screenshots
  use them: `?trophy=28` opens one trophy's guide,
  `?spoilers=hidden|shown` sets the spoiler switch, `?kind` / `?grade` /
  `?earned-only=1` set the filters, `?view=roadmap` jumps to the roadmap.

## Files

- `app/index.html` — page structure: hero audit strip, do-early panel,
  controls, featured excerpt, full checklist, roadmap, notes, sources.
- `app/style.css` — Precision Technical / Swiss Grid: obsidian `#090A0D`,
  hairlines, tabular numerals, a single accent `#10B981`. The type is
  sized so the cover still reads when the dossier shrinks it to 768×480.
- `app/app.js` — bootstrap: URL state, event wiring, render-all.
- `app/data.js` — load and validate `trophies.json`; audit counts, the
  featured eight, the do-early set.
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
  audit), 4-tracker (spoilers on, 11 earned, export/import visible).
  `shots.json` records each shot's URL state.

## Checking it

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
