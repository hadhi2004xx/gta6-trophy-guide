// Earned-state math for the Leonida 100% tracker.
// A tracker holds a Set of earned trophy names and answers the questions
// the UI asks: is this one earned, how many are done, what percent is
// that. It knows nothing about the DOM or storage; render.js and
// storage.js handle those.
export function createTracker(initialNames) {
  const earned = new Set(Array.isArray(initialNames) ? initialNames : []);
  return {
    isEarned(name) {
      return earned.has(name);
    },
    toggleEarned(name, checked) {
      if (checked) earned.add(name);
      else earned.delete(name);
      return checked;
    },
    earnedCount(trophies) {
      return trophies.filter((t) => earned.has(t.name)).length;
    },
    progressPercent(total) {
      if (!total || total <= 0) return 0;
      return Math.round((earned.size / total) * 100);
    },
    earnedNames() {
      return [...earned].sort();
    },
    earnedSet() {
      return new Set(earned);
    },
    replaceAll(names) {
      earned.clear();
      for (const n of names) earned.add(n);
    },
    clearAll() {
      earned.clear();
    },
    size() {
      return earned.size;
    },
  };
}

export function earnedCountFor(trophies, earnedSet) {
  return trophies.filter((t) => earnedSet.has(t.name)).length;
}

export function progressText(done, total) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return `${done} of ${total} earned · ${pct}% · ${total - done} to go`;
}

export function ringOffsetForPercent(pct) {
  // The ring's circumference is 2 * pi * 30 = 188.5. Full progress hides
  // the offset entirely; zero progress shows the whole track.
  const clamped = Math.max(0, Math.min(100, pct));
  return 188.5 * (1 - clamped / 100);
}
