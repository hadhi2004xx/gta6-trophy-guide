# Leonida 100% — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hadhi2004xx/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft
Auto VI — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden until
earned, 0 needing online play. Built for the make.fun
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty.

## What it is

`app/` is plain static files — no build step, no network at runtime. Open
`app/index.html` in a browser (or run `node serve.ts` and visit
http://localhost:8080) and it works with the network off.

- **Full official list.** Every trophy with its official name, description and
  grade exactly as PlayStation publishes them (as listed by Exophase and
  PSNProfiles), plus a per-trophy guide written in our own words.
- **Cited guidance.** Each guide names its sources beside it — GTABase,
  PowerPyx, EGamers, Output Lag, GTA Vice City Hub, GGRecon — so a reader can
  see where every specific location or step comes from. Where the launch-era
  sources could not confirm a trigger (5 trophies), the guide says so
  honestly instead of inventing one.
- **Tracker.** Checklist saved in `localStorage`, export to a JSON file and
  import it back, filters by kind (story, missable, collectibles, activities,
  crime, exploration, money, unconfirmed) and by grade, text search, and an
  earned-only view.
- **Spoiler setting.** On by default: hidden story trophies stay masked until
  you earn them (or turn the setting off).
- **Roadmap to the Platinum.** Six stages in order, built from the official
  descriptions — story chapters and missions, side characters and strangers,
  activities, collectibles and exploration, crime and money, then the 100%
  cleanup. The one possibly missable trophy, Positive Mental Attitude
  (Lucia's Chapter 1 balcony meditation), is flagged in stage 1.
- **Audit strip.** The header shows the list's counts at a glance: 55 / 1-2-6-46
  / 28 hidden / 1 missable / 0 online, with live progress (earned count and
  percent).

## Layout

```
app/
  index.html            page shell: audit strip, progress, controls, roadmap, list
  app.js                tracker: load, filter, spoiler mode, export/import
  roadmap.js            roadmap renderer (six stages from trophies.json)
  style.css             Precision Technical / Swiss Grid: obsidian, hairlines,
                        tabular numerals, one accent (#10B981)
  data/trophies.json    the 55 trophies + sources, roadmap stages, run notes
main.ts                 hands the entry in: copies app/ + screenshots/ to
                        /output and writes /output/dossier.json
serve.ts                dev-only static server for app/
screenshots/            4 renders of the app taken in a headless browser
```

## Verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`, which is the kit's copy and is left unchanged.

## Sources

- Exophase and PSNProfiles — the official 55-trophy list (names, descriptions,
  grades, hidden flags).
- GTABase trophy guide — https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- EGamers trophy list — https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- Output Lag trophy list — https://outputlag.com/guides/gta-6-trophy-list/
- GTA Vice City Hub achievements — https://www.gtavicecityhub.com/achievements
- GGRecon trophy list — https://www.ggrecon.com/articles/gta-6-trophies-achievements-list-platinum/

An unofficial fan guide. Grand Theft Auto and GTA are trademarks of Rockstar
Games; no Rockstar logo, artwork or game screenshot is used anywhere here.
