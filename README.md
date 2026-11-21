[![Leonida 100% rank](https://make.fun/badge/hadhi2004xx/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/leaderboard)
[![Leonida 100% reward](https://make.fun/badge/hadhi2004xx/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Leonida 100% on make.fun](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Leonida 100% — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 trophies** of Grand Theft Auto VI on
PlayStation 5: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online.
Every trophy shows its official name, description and grade as PlayStation
publishes them, plus a guide written in our own words — numbered steps, each
with its source in brackets — and a tracker that saves in the browser.

## What it proves, in numbers

- **55/55 guides cite a source** — 7 sources read 21 Nov 2026 (PowerPyx,
  OutputLag, KeenGamer, EGamers, the official list, GTA-Zone, GTA Vibes /
  TechWiser).
- **153/153 steps cited** — no step without a source marker.
- **1 missable verified**: Positive Mental Attitude — the first meditation, on
  the balcony at Jason's house in Chapter 1, disappears when the chapter ends.
- **6 do-early** (chapter-gated stranger chains + bank vaults) and **11 watch**
  (triggers still unconfirmed — both versions shown, never guessed).
- **17 counters** for the counted trophies (meditation 0/18, stunts 0/250,
  vaults 0/5, …), with +/- buttons that tick the trophy at the target.

## Features

- **Checklist** — all 55 trophies in roadmap order (stages S1–S7), with earned
  ticks saved in `localStorage`, plus export to JSON and import back.
- **Filters** — by kind (story, missable, collectibles, activities, crime,
  side missions, misc, 100%, online), grade, earned/missing, and free search.
- **Spoiler setting** (on by default) — hidden story trophies stay masked as
  "Hidden trophy" until earned.
- **Roadmap to the platinum** — the three PowerPyx steps (story 60–80 h,
  100% checklist about 100 h, cleanup about 10 h), the ground rules on saves
  and cheats, the missable / do-early / watch tiers, and the S1–S7 stage
  cards with earned counts.
- **Sources panel** — every source with its link and a "cited by N of 55
  guides" count, plus a "Sources disagree · both versions shown" box
  (meditation 18 vs 15; the finale called Chapter 5 by some guides).
- **Deep links** — `?view=roadmap`, `?view=sources`, `?trophy=<id-or-slug>`,
  `?kind=`, `?grade=`, `?spoiler=off`.
- **Offline** — static files under `app/`, no build step, no network request
  at run time. No Rockstar logo or artwork is used anywhere.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Build the hand-in dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html` — masthead, audit strip, goal bars, stage chips, controls.
- `app/style.css` — Precision Technical / Swiss Grid: obsidian ground,
  hairline rules, tabular numbers, one accent.
- `app/app.js` — bootstrap, controls, deep links, render-all.
- `app/store.js` — saved progress: earned ticks, counters, export/import.
- `app/views.js` — checklist rows, roadmap, missable panel, sources panel.
- `app/classify.js` — kind / stage / tier classification and deep-link slugs.
- `app/audit.js` — the audit numbers, counted from the data, never hard-coded.
- `app/data/trophies.json` — the 55 official trophies, their guides and the
  7 sources.
- `main.ts` — copies `app/` + `screenshots/` to `/output` and writes the
  dossier with the vendored make.fun library.
- `shots.json` — the 4 screenshots: cover, guide open, roadmap, tracker.

## License

MIT — see [LICENSE](LICENSE).
