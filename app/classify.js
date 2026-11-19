// Classification: kinds, grades, audit counts, the featured eight, the six
// roadmap stages and the missable-audit panel. Everything here is derived from
// the official trophy descriptions, never from a playthrough.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  'do-early': 'Do early',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  exploration: 'Exploration',
  money: 'Money',
};

export const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

// The eight trophies that shape the run, in the order a new player should meet
// them: the one missable, the three chapter-gated, the hardest gold, the finale
// gold, and the two longest grinds.
export const FEATURED_IDS = [28, 40, 41, 46, 14, 7, 15, 30];

// Count trophies per grade, in platinum/gold/silver/bronze order.
export function countByGrade(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
  }
  return counts;
}

// How many trophies stay hidden on PlayStation until earned.
export function countHidden(trophies) {
  return trophies.filter((trophy) => trophy.hidden).length;
}

// The single missable trophy, or undefined when the data holds none.
export function missableTrophy(trophies) {
  return trophies.find((trophy) => trophy.missable);
}

// Chapter-gated steps that are not missable but must be taken when they appear.
export function doEarlyTrophies(trophies) {
  return trophies.filter((trophy) => trophy.doEarly);
}

// The featured excerpt, in FEATURED_IDS order, skipping any id the data lacks.
export function featuredEight(trophies) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  return FEATURED_IDS.map((id) => byId.get(id)).filter(Boolean);
}

// Does one trophy match the current kind filter? The missable and do-early
// filters match flags, the rest match the trophy's primary kind.
export function trophyMatchesKind(trophy, kind) {
  if (!kind) return true;
  if (kind === 'missable') return trophy.missable;
  if (kind === 'do-early') return trophy.doEarly;
  return trophy.kind === kind;
}

// Does one trophy match the search text? Name, description and guide are all
// searched, case-insensitively, so a search for "vault" finds the vault trophies.
export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [trophy.name, trophy.description, trophy.guide]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

// Full row filter: kind, grade, earned-only, and search text, all combined.
export function trophyVisible(trophy, filters, earned) {
  if (filters.kind && !trophyMatchesKind(trophy, filters.kind)) return false;
  if (filters.grade && trophy.grade !== filters.grade) return false;
  if (filters.earnedOnly && !earned.has(trophy.id)) return false;
  if (!trophyMatchesSearch(trophy, filters.query)) return false;
  return true;
}

// Six roadmap stages, built from the official descriptions: which story
// chapters and missions, which collectibles and counts, in what order.
export const ROADMAP_STAGES = [
  {
    number: 1,
    title: 'Chapters 1–2 — learn Leonida',
    note: 'Play the story and do the first meditation now — it is the only one that can be missed.',
    ids: [2, 3, 4, 8, 28, 46],
  },
  {
    number: 2,
    title: 'Chapters 3–5 — finish the story',
    note: 'The remaining chapter and mission trophies, through the finale. Stranger chains stay open after the story.',
    ids: [5, 6, 7, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27],
  },
  {
    number: 3,
    title: 'Strangers & side chains',
    note: 'Eight stranger strands, Bret’s hunt, and the first activity trophies.',
    ids: [25, 29, 16, 20, 21],
  },
  {
    number: 4,
    title: 'Activities & skills',
    note: 'The long grinds: stunts, shooting range, drone and road races, challenges.',
    ids: [15, 17, 18, 19, 32, 47, 51],
  },
  {
    number: 5,
    title: 'Crime & money',
    note: 'Vaults, gangs, shops and fences — take the Chapter 4 vault mission when it appears.',
    ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 45, 48, 52, 53, 54, 55],
  },
  {
    number: 6,
    title: 'Collectibles, exploration & platinum',
    note: 'Cards, WAiNK, vehicles, the whole map — then the 100% gold and the platinum.',
    ids: [30, 31, 35, 42, 44, 49, 50, 14, 1],
  },
];

// Candidates for "missable" that were checked against the best source and
// cleared. PowerPyx: "Number of missable trophies: Potentially 1".
export const MISSABLE_AUDIT = [
  {
    name: 'Stranger mission chains',
    verdict: 'Cleared',
    text: 'PowerPyx: all trophy-related quest givers are still there after the story in free-roam. Start a chain as soon as it unlocks, but it cannot be missed.',
  },
  {
    name: 'Kenton’s chain',
    verdict: 'Cleared',
    text: 'Kenton is temporarily unavailable in Chapters 2–3 and returns later. A gap in availability is not a miss.',
  },
  {
    name: 'Let’s Go Bowling valuables',
    verdict: 'Cleared',
    text: 'The robbery icon respawns if you miss a valuable, so the trophy is not missable — the Chapter 2 mission is only the natural first chance.',
  },
  {
    name: 'Gunslinger and Retail Therapy one-attempt conditions',
    verdict: 'Cleared',
    text: 'Both are free-roam conditions, not tied to a specific story mission or chapter, so they fail the task’s own rule for a missable trophy.',
  },
  {
    name: 'Missable story missions',
    verdict: 'Cleared',
    text: 'PowerPyx: missable missions do not affect trophies or 100%. A missed mission is not a missed trophy.',
  },
];
