// Leonida 100% — GTA VI trophy tracker, bootstrap.
// Wires the modules together: data.js loads the list, storage.js persists
// progress, tracker.js holds earned state, filters.js matches rows,
// render.js paints the page, roadmap.js paints the six stages.
// The app makes no network request besides fetching its own data file.
// Deep links are real app states: ?trophy=<id> opens one guide,
// ?spoilers=hidden|shown sets the spoiler switch, ?kind / ?grade /
// ?earned-only=1 set the filters, ?view=roadmap jumps to the roadmap.
import { loadTrophyData } from './data.js';
import { loadStoredProgress, saveProgress, exportProgressFile, parseImportedProgress, clearStoredProgress } from './storage.js';
import { createTracker } from './tracker.js';
import { filterTrophies, readFilterState } from './filters.js';
import { renderAuditStrip, renderProgress, renderDoEarlyPanel, renderFeaturedExcerpt, renderTrophyList, renderRunNotes, renderSourceList } from './render.js';
import { renderRoadmap } from './roadmap.js';

const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedOnlyEl = document.getElementById('earned-only');
const spoilersEl = document.getElementById('spoilers');
const listEl = document.getElementById('list');

let doc = null;
let tracker = createTracker(loadStoredProgress());
let openGuide = null;

const state = {
  get openGuide() {
    return openGuide;
  },
  set openGuide(id) {
    openGuide = id;
  },
  isEarned(name) {
    return tracker.isEarned(name);
  },
  toggleEarned(name, checked) {
    tracker.toggleEarned(name, checked);
    saveProgress(tracker.earnedNames());
    renderAll();
  },
  spoilersHidden() {
    return spoilersEl.checked;
  },
  rerenderLists() {
    renderFeaturedExcerpt(doc, state);
    renderTrophyList(doc, visibleTrophies(), state);
  },
};

function currentFilters() {
  return readFilterState(searchEl, kindEl, gradeEl, earnedOnlyEl);
}

function visibleTrophies() {
  return filterTrophies(doc.trophies, currentFilters(), (n) => tracker.isEarned(n));
}

export function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const trophyId = Number.parseInt(params.get('trophy') || '', 10);
  return {
    trophy: Number.isInteger(trophyId) && trophyId > 0 ? trophyId : null,
    spoilers: params.get('spoilers'),
    kind: params.get('kind'),
    grade: params.get('grade'),
    earnedOnly: params.get('earned-only') === '1',
    view: params.get('view'),
  };
}

export function applyUrlState(urlState) {
  if (urlState.spoilers === 'hidden') spoilersEl.checked = true;
  if (urlState.spoilers === 'shown') spoilersEl.checked = false;
  if (urlState.kind && [...kindEl.options].some((o) => o.value === urlState.kind)) kindEl.value = urlState.kind;
  if (urlState.grade && [...gradeEl.options].some((o) => o.value === urlState.grade)) gradeEl.value = urlState.grade;
  if (urlState.earnedOnly) earnedOnlyEl.checked = true;
  if (urlState.trophy !== null) openGuide = urlState.trophy;
}

// Scrolls to a named view only after the list has rendered, so the target
// is at its final position: the roadmap timeline, or the full checklist.
export function scrollToView(view) {
  const target =
    view === 'roadmap'
      ? document.getElementById('roadmap')
      : view === 'checklist'
        ? document.querySelector('.trophies')
        : null;
  if (target) target.scrollIntoView();
}

function renderAll() {
  renderAuditStrip(doc);
  renderProgress(doc, tracker.size());
  renderRoadmap(doc, (n) => tracker.isEarned(n), () => spoilersEl.checked);
  renderFeaturedExcerpt(doc, state);
  renderTrophyList(doc, visibleTrophies(), state);
}

function refreshListOnly() {
  renderTrophyList(doc, visibleTrophies(), state);
}

function wireEvents() {
  searchEl.addEventListener('input', refreshListOnly);
  kindEl.addEventListener('change', refreshListOnly);
  gradeEl.addEventListener('change', refreshListOnly);
  earnedOnlyEl.addEventListener('change', refreshListOnly);
  spoilersEl.addEventListener('change', renderAll);
  document.getElementById('export').addEventListener('click', () => exportProgressFile(doc, tracker.earnedNames()));
  document.getElementById('import').addEventListener('change', async (event) => {
    const result = await parseImportedProgress(event.target.files[0], doc.trophies.map((t) => t.name));
    if (result.ok) {
      tracker.replaceAll(result.earned);
      saveProgress(tracker.earnedNames());
      renderAll();
      document.getElementById('result-count').textContent = `Imported ${result.earned.length} earned trophies from ${result.fileName}.`;
    } else {
      document.getElementById('result-count').textContent = `Import failed: ${result.error}.`;
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies in this browser?')) {
      tracker.clearAll();
      clearStoredProgress();
      renderAll();
    }
  });
}

export async function initApp() {
  const urlState = readUrlState();
  applyUrlState(urlState);
  doc = await loadTrophyData();
  renderAuditStrip(doc);
  renderDoEarlyPanel(doc);
  renderRunNotes(doc);
  renderSourceList(doc);
  wireEvents();
  renderAll();
  if (urlState.trophy !== null) {
    const row = document.querySelector(`[data-trophy-id="${urlState.trophy}"]`);
    if (row) row.scrollIntoView({ block: 'start' });
  } else if (urlState.view) {
    scrollToView(urlState.view);
  }
}

initApp().catch((error) => {
  listEl.textContent = `Could not load the trophy list: ${error.message}`;
});
