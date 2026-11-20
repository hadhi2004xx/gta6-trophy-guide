// store.js — tracker state: earned trophies, per-trophy counters, spoiler
// setting. Everything is saved to localStorage on every change, and can be
// exported to a JSON file and imported back. No network is ever used.

export const STORAGE_KEY = 'leonida100-tracker-v5';

export function blankState() {
  return { version: 5, earned: [], counters: {}, spoilers: 'hidden' };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    return {
      version: 5,
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      spoilers: parsed.spoilers === 'shown' ? 'shown' : 'hidden',
    };
  } catch (err) {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    return false;
  }
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const i = state.earned.indexOf(id);
  if (i >= 0) state.earned.splice(i, 1);
  else state.earned.push(id);
  state.earned.sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function counterValue(state, id) {
  const v = state.counters[String(id)];
  return Number.isInteger(v) && v >= 0 ? v : 0;
}

export function setCounter(state, id, value, target) {
  const clamped = Math.max(0, Math.min(target, Math.floor(value)));
  state.counters[String(id)] = clamped;
  saveState(state);
  return clamped;
}

export function bumpCounter(state, id, delta, target) {
  return setCounter(state, id, counterValue(state, id) + delta, target);
}

export function exportState(state) {
  return JSON.stringify(
    { app: 'leonida-100-gta6-trophy-tracker', version: 5, exportedAt: new Date().toISOString(), earned: state.earned, counters: state.counters, spoilers: state.spoilers },
    null,
    2,
  );
}

export function importStateText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a JSON object.');
  if (!Array.isArray(parsed.earned) && !parsed.counters) throw new Error('No earned list or counters found.');
  const next = blankState();
  if (Array.isArray(parsed.earned)) {
    next.earned = parsed.earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
    next.earned.sort((a, b) => a - b);
  }
  if (parsed.counters && typeof parsed.counters === 'object') {
    for (const [k, v] of Object.entries(parsed.counters)) {
      const id = Number(k);
      if (Number.isInteger(id) && id >= 1 && id <= 55 && Number.isInteger(v) && v >= 0) next.counters[String(id)] = v;
    }
  }
  if (parsed.spoilers === 'shown' || parsed.spoilers === 'hidden') next.spoilers = parsed.spoilers;
  saveState(next);
  return next;
}

export function resetState() {
  const next = blankState();
  saveState(next);
  return next;
}
