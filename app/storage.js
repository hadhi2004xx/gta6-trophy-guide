// Progress persistence for the Leonida 100% tracker.
// Earned trophies live in localStorage under one key, so progress survives a
// reload and never leaves the browser. Export writes a JSON file the reader
// can keep; import reads that file back and keeps only names the list knows.
export const STORAGE_KEY = 'gta6-trophy-tracker-v1';

export function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

export function saveProgress(earnedNames) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedNames].sort()));
    return true;
  } catch {
    // Private mode or full storage: the checklist still works in memory.
    return false;
  }
}

export function clearStoredProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, or storage is unavailable: nothing to clear.
  }
}

export function buildExportPayload(doc, earnedNames) {
  return {
    game: doc.game,
    platform: doc.platform,
    exportedAt: new Date().toISOString(),
    earned: [...earnedNames].sort(),
  };
}

export function exportProgressFile(doc, earnedNames) {
  const payload = buildExportPayload(doc, earnedNames);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  return payload.earned.length;
}

export async function parseImportedProgress(file, knownNames) {
  if (!file) return { ok: false, error: 'no file chosen' };
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: 'that file is not valid JSON' };
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    return { ok: false, error: 'expected a list of trophy names' };
  }
  const known = new Set(knownNames);
  const earned = names.filter((n) => typeof n === 'string' && known.has(n));
  return { ok: true, earned, fileName: file.name };
}
