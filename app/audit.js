// audit.js — the audit strip, the sources panel and the missable audit.
// Every number on the page is computed here from app/data/trophies.json,
// never hard-coded, so the audit strip cannot drift from the data.

export const SOURCES = [
  { id: 1, name: 'PowerPyx', note: 'Full trophy guide & roadmap', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
  { id: 2, name: 'OutputLog', note: 'Trophy list & robbery / partner guides', url: 'https://outputlag.com/guides/gta-6-trophy-list/' },
  { id: 3, name: 'KeenGamer', note: 'Trophy guide & platinum roadmap', url: 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/' },
  { id: 4, name: 'EGamers', note: '55-trophy list, hidden table & hardest ones', url: 'https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/' },
  { id: 5, name: 'Official PS5 list', note: 'Names, descriptions & grades as shipped in the kit', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/' },
  { id: 6, name: 'GTA-Zone', note: 'Trophy list, Gamerscore & platinum roadmap', url: 'https://gta-zone.com/news/gta-6-trophies-achievements/' },
  { id: 7, name: 'TechWiser', note: 'Trophy list claims as quoted by EGamers', url: 'https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/' },
];

export const SOURCES_READ_DATE = '20 Nov 2026';

export const STAGES = [
  { n: 1, title: 'Chapters 1–2', sub: 'Story + do it now' },
  { n: 2, title: 'Chapters 3–4', sub: 'Story continues' },
  { n: 3, title: 'Chapter 5', sub: 'Finale' },
  { n: 4, title: 'Character quests', sub: 'Andy · Kenton · Billy · Randy · Tyrone · Bret' },
  { n: 5, title: 'Robberies & money', sub: 'Vaults · gangs · garages · bills' },
  { n: 6, title: 'Activities & one-offs', sub: 'Races · stunts · ranges · secrets' },
  { n: 7, title: '100% cleanup', sub: 'Checklist, then platinum' },
];

export const FEATURED_IDS = [28, 40, 41, 46, 14, 1, 15, 17];

export const MISSABLE_AUDIT = [
  { verdict: 'CLEARED', name: 'Let’s Go Bowling', why: 'PowerPyx: the 3 valuables can be collected on a later respawn of the robbery icon, so missing one during the mission does not lock the trophy.', sources: [1] },
  { verdict: 'CLEARED', name: 'Maximum Withdrawal + A Classic Blitz Play', why: 'Chapter-gated, not missable: the optional mission That’s Where The Money Is… can be taken any time after it unlocks, and vaults stay open in free-roam.', sources: [1, 2] },
  { verdict: 'CLEARED', name: 'Stranger questlines (Andy · Kenton · Billy · Randy · Tyrone · Bret)', why: 'PowerPyx and OutputLog: every quest giver is still available after the story; Kenton pauses in Chapter 1 and returns in Chapters 2–3.', sources: [1, 2] },
  { verdict: 'CLEARED', name: 'Yago’s timed race (Race Against Yago)', why: 'OutputLog flags the hourglass icon and advises saving first, then racing the moment it appears — a timed strand inside Strangers & Freaks, not a missable trophy.', sources: [2] },
  { verdict: 'WATCH', name: 'Bad Luck, I Guess', why: 'Trigger still unconfirmed (Payday Loans store lead only). No source flags a closing window, so this is watched, not counted missable.', sources: [1, 4] },
  { verdict: 'WATCH', name: 'Ten Pin', why: 'Motorcycle-kick method is single-source (PowerPyx); EGamers still lists the steps as unconfirmed. No closing window is reported.', sources: [1, 4] },
  { verdict: 'WATCH', name: 'Fair Game', why: 'Which animal unlocks it is unconfirmed by every source. Bret’s line stays open after the story, so it is watched, not counted missable.', sources: [1, 4] },
];

export function gradeCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) counts[t.grade] = (counts[t.grade] || 0) + 1;
  return counts;
}

export function computeAudit(trophies) {
  const total = trophies.length;
  const grades = gradeCounts(trophies);
  const hidden = trophies.filter((t) => t.hidden).length;
  const withSource = trophies.filter((t) => Array.isArray(t.sources) && t.sources.length > 0).length;
  let stepsTotal = 0;
  let stepsCited = 0;
  for (const t of trophies) {
    for (const s of t.steps || []) {
      stepsTotal += 1;
      if (Array.isArray(s.sources) && s.sources.length > 0) stepsCited += 1;
    }
  }
  const missable = trophies.filter((t) => t.missable);
  const doEarly = trophies.filter((t) => t.doEarly);
  const watch = trophies.filter((t) => t.watch);
  const disagree = trophies.filter((t) => t.disagree);
  const singleSource = trophies.filter((t) => Array.isArray(t.sources) && t.sources.length === 1);
  const unconfirmed = trophies.filter((t) => t.unconfirmed);
  const citedBy = new Map();
  for (const s of SOURCES) citedBy.set(s.id, 0);
  for (const t of trophies) {
    for (const sid of new Set(t.sources || [])) {
      if (citedBy.has(sid)) citedBy.set(sid, citedBy.get(sid) + 1);
    }
  }
  return {
    total, grades, hidden, withSource, stepsTotal, stepsCited,
    missableCount: missable.length,
    doEarlyCount: doEarly.length,
    watchCount: watch.length,
    disagreeCount: disagree.length,
    singleSourceCount: singleSource.length,
    unconfirmedCount: unconfirmed.length,
    citedBy,
  };
}

export function sourceName(id) {
  const s = SOURCES.find((x) => x.id === id);
  return s ? s.name : 'Source ' + id;
}

export function sourceNames(ids) {
  return (ids || []).map(sourceName);
}
