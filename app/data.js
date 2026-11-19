// Loading and checking the trophy data for the Leonida 100% guide.
// The official list lives in app/data/trophies.json: 55 trophies with their
// official name, description and grade, plus this entry's own guide,
// sources and roadmap fields. This module fetches it from the app's own
// server only — the guide makes no network request to any other host.
export const DATA_URL = 'data/trophies.json';
export const EXPECTED_TROPHY_COUNT = 55;

export async function loadTrophyData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`trophies.json failed: ${response.status}`);
  const doc = await response.json();
  validateTrophyData(doc);
  return doc;
}

export function validateTrophyData(doc) {
  if (!doc || !Array.isArray(doc.trophies)) {
    throw new Error('trophies.json has no trophy list');
  }
  if (doc.trophies.length !== EXPECTED_TROPHY_COUNT) {
    throw new Error(`expected ${EXPECTED_TROPHY_COUNT} trophies, found ${doc.trophies.length}`);
  }
  const seen = new Set();
  for (const t of doc.trophies) {
    if (typeof t.id !== 'number' || !t.name || !t.description || !t.grade) {
      throw new Error(`trophy ${JSON.stringify(t && t.id)} is missing id, name, description or grade`);
    }
    if (seen.has(t.name)) throw new Error(`duplicate trophy name: ${t.name}`);
    seen.add(t.name);
    if (typeof t.guide !== 'string' || t.guide.trim() === '') {
      throw new Error(`trophy ${t.name} has no guide text`);
    }
    if (!Array.isArray(t.sources) || t.sources.length === 0) {
      throw new Error(`trophy ${t.name} names no source`);
    }
  }
  return true;
}

export function trophyById(doc, id) {
  return doc.trophies.find((t) => t.id === id) || null;
}

export function trophiesByIds(doc, ids) {
  const byId = new Map(doc.trophies.map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export function countTrophiesByGrade(doc) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) {
    if (counts[t.grade] !== undefined) counts[t.grade] += 1;
  }
  return counts;
}

export function auditCounts(doc) {
  const grades = countTrophiesByGrade(doc);
  return {
    total: doc.trophies.length,
    platinum: grades.platinum,
    gold: grades.gold,
    silver: grades.silver,
    bronze: grades.bronze,
    hidden: doc.trophies.filter((t) => t.hidden).length,
    missable: doc.trophies.filter((t) => t.missable).length,
    doEarly: doc.trophies.filter((t) => t.timeSensitive && !t.missable).length,
    online: 0,
  };
}

export function featuredTrophies(doc) {
  // The eight that shape the run: the missable one, the Platinum, the
  // first mission, the 100% gate, and the biggest grinds. Kept in data so
  // the featured excerpt and the full list can never drift apart.
  const order = [28, 1, 2, 14, 15, 25, 33, 40];
  return trophiesByIds(doc, order);
}

export function doEarlyTrophies(doc) {
  return doc.trophies.filter((t) => t.missable || t.timeSensitive);
}
