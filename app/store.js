// Progress store: earned trophies live in localStorage under one key, and can be
// exported to a JSON file and imported back. Nothing here touches the network.

export const PROGRESS_KEY = 'leonida-trophy-progress-v1';

// Read the earned set from localStorage. A corrupt or foreign value is treated
// as empty progress rather than throwing, so one bad entry never breaks the page.
export function readProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

// Persist the earned set. localStorage writes are synchronous and small here.
export function writeProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// Build the export payload: a versioned envelope so an import can check it
// came from this guide before applying it.
export function makeExportPayload(earned, total) {
  return {
    app: 'leonida-100-gta6-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    total,
  };
}

// Turn an imported file's text into an earned set, or null when the file is
// not a progress export from this guide. Unknown ids are dropped, never kept.
export function parseImportedProgress(text, knownIds) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || parsed.app !== 'leonida-100-gta6-trophy-guide') return null;
    if (!Array.isArray(parsed.earned)) return null;
    const known = new Set(knownIds);
    return new Set(parsed.earned.filter((id) => Number.isInteger(id) && known.has(id)));
  } catch {
    return null;
  }
}

// Clear saved progress entirely (the Reset button).
export function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}
