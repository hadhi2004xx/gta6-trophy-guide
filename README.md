# Leonida 100% — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Checklist** — every trophy with its official name, description and grade, tickable, saved in the browser (localStorage).
- **Cited guides** — every trophy has a numbered step-by-step guide; every step cites its source (`[1]`–`[7]`). 55/55 guides cite a source.
- **7-stage roadmap** — story first (S1–S3), character questlines (S4), robberies and money (S5), activities and one-offs (S6), 100% cleanup (S7).
- **Missable audit** — 1 possibly missable trophy (Positive Mental Attitude), 3 do-early, 3 on watch; every cleared candidate is documented with its sources.
- **Tracker** — search, kind and grade filters, earned-only, a spoiler setting (hidden trophies stay masked until earned, default ON), per-trophy counters for count-based trophies, export/import JSON, reset.
- **Deep links** — `?trophy=28`, `?spoilers=hidden|shown`, `?kind=`, `?grade=`, `?earned-only=1`, `?view=roadmap|checklist`.

## Audit (computed live from the data, never hard-coded)

55 official trophies · 28 hidden · 55/55 guides cite a source · every step cited · 7 sources read 20 Nov 2026 · 1 possibly missable · 3 watch · 1 unconfirmed · 0 single-source · 5 disagree.

## Sources (read 20 Nov 2026)

1. PowerPyx — full trophy guide & roadmap
2. OutputLog — trophy list & robbery / partner guides
3. KeenGamer — trophy guide & platinum roadmap
4. EGamers — 55-trophy list, hidden table & hardest ones
5. Official PS5 list as shipped in the kit
6. GTA-Zone — trophy list, Gamerscore & platinum roadmap
7. TechWiser — trophy list claims as quoted by EGamers

Guide text is written for this entry in its own words; sources are cited, never copied. Official trophy names, descriptions and grades are shown as PlayStation publishes them. No Rockstar logo, artwork, or game screenshots anywhere in the app.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The app is plain static files under `app/` — no build step, no network at run time. Serve `app/` from any static server with `app/` at its root.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## Layout

- `app/index.html` — page shell: masthead, audit strip, progress, sticky controls, checklist, roadmap, detail, missable audit, sources.
- `app/style.css` — Precision Technical / Swiss Grid: obsidian, hairlines, one green accent, amber for missable callouts only.
- `app/app.js` — boot, URL state, events, deep-link scrolling.
- `app/views.js` — renders the checklist, roadmap, detail panel, and audit/source panels.
- `app/store.js` — earned state, counters, export/import/reset (localStorage).
- `app/audit.js` — the 7 sources, the 7 roadmap stages, and the audit computation.
- `app/data/trophies.json` — the 55 official trophies with guides, steps, sources, stages, and flags.

## License

MIT — see `LICENSE`.
