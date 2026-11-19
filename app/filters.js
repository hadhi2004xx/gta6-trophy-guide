// Checklist filtering for the Leonida 100% tracker.
// One predicate per control — search text, kind, grade, earned-only — combined
// by trophyMatches. Kinds follow the bounty: story, missable, collectibles,
// activities, and online (the list has none); crime, exploration, money and
// the platinum path are our own subdivisions of the same list.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  'do-early': 'Do early',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  exploration: 'Exploration',
  money: 'Money',
  platinum: 'Platinum',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}

export function matchSearchText(trophy, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return hay.includes(q);
}

export function matchKindFilter(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'do-early') return trophy.missable === true || trophy.timeSensitive === true;
  return trophy.kind === kind;
}

export function matchGradeFilter(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchEarnedOnly(trophy, earnedOnly, isEarned) {
  return !earnedOnly || isEarned(trophy.name);
}

export function trophyMatches(trophy, filters, isEarned) {
  return (
    matchSearchText(trophy, filters.query) &&
    matchKindFilter(trophy, filters.kind) &&
    matchGradeFilter(trophy, filters.grade) &&
    matchEarnedOnly(trophy, filters.earnedOnly, isEarned)
  );
}

export function filterTrophies(trophies, filters, isEarned) {
  return trophies.filter((t) => trophyMatches(t, filters, isEarned));
}

export function readFilterState(searchEl, kindEl, gradeEl, earnedOnlyEl) {
  return {
    query: searchEl.value,
    kind: kindEl.value,
    grade: gradeEl.value,
    earnedOnly: earnedOnlyEl.checked,
  };
}
