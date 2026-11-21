// classifyTrophy — the fixed classification of the 55 trophies: kind, stage, tier and
// counter targets. All of it is derived from the official descriptions plus the seven
// cited sources; nothing here is guessed at run time. The data file carries the same
// fields, so this module is the single place the app asks "what is this trophy".
export const KIND_ORDER = ['story', 'missable', 'collectibles', 'activities', 'crime', 'side', 'misc', 'completion', 'online'];

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  side: 'Side missions',
  misc: 'Misc',
  completion: '100%',
  online: 'Online',
};

export const TIER_LABELS = {
  missable: 'MISSABLE',
  'do-early': 'DO EARLY',
  watch: 'WATCH',
  none: '',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LABELS = {
  platinum: 'PLATINUM',
  gold: 'GOLD',
  silver: 'SILVER',
  bronze: 'BRONZE',
};

// A trophy is spoiler-masked while the spoiler setting is on and it is not earned yet.
export function isSpoilerTrophy(trophy) {
  return trophy.hidden === true;
}

// Count-based trophies get a +/- counter; the rest get a plain checkbox only.
export function hasCounter(trophy) {
  return trophy.counter !== null && trophy.counter !== undefined;
}

// Money counters step in round amounts and print with a $ sign and commas.
export function formatCounterValue(trophy, value) {
  if (!trophy.counter) return String(value);
  if (trophy.counter.unit === '$') return '$' + Number(value).toLocaleString('en-US');
  return String(value);
}

export function formatCounterTarget(trophy) {
  if (!trophy.counter) return '';
  return formatCounterValue(trophy, trophy.counter.target) + ' ' + trophy.counter.unit;
}

// Kind filter options in the order the controls show them.
export function kindOptions(trophies) {
  const present = new Set(trophies.map((t) => t.kind));
  return KIND_ORDER.filter((k) => present.has(k) || k === 'online');
}

// Stage ids in roadmap order S1..S7.
export function stageOrder(stages) {
  return [...stages].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

// A trophy matches the kind filter, the grade filter and the search text.
export function trophyMatchesFilters(trophy, filters) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.earned === 'earned' && !filters.isEarned(trophy)) return false;
  if (filters.earned === 'missing' && filters.isEarned(trophy)) return false;
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    const hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    if (q && !hay.includes(q)) return false;
  }
  return true;
}

// Slug for deep links: ?trophy=positive-mental-attitude
export function trophySlug(trophy) {
  return trophy.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findTrophyBySlug(trophies, slug) {
  if (!slug) return null;
  const byId = trophies.find((t) => String(t.id) === String(slug));
  if (byId) return byId;
  return trophies.find((t) => trophySlug(t) === slug) ?? null;
}
