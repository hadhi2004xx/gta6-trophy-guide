// Bootstrap: load the trophy data, read the URL state, wire the controls, and
// render everything. The only module the page loads directly; the rest arrive
// through its static imports.

import { readProgress, writeProgress, makeExportPayload, parseImportedProgress, clearProgress } from './store.js';
import {
  setProgressRing,
  setAuditNumbers,
  renderFeaturedCards,
  renderTrophyRows,
  renderGuidePanel,
  renderRoadmapStages,
  renderMissableAudit,
} from './views.js';

// Read the URL state: ?trophy=<id>, ?spoilers=hidden|shown, ?kind, ?grade,
// ?earned-only=1, ?view=roadmap|checklist. Every value is validated against
// the loaded data before it is used, so a bad link never breaks the page.
export function parseUrlState(params, trophies) {
  const state = { trophyId: null, spoilersHidden: true, kind: '', grade: '', earnedOnly: false, view: '' };
  const rawTrophy = Number(params.get('trophy'));
  if (Number.isInteger(rawTrophy) && trophies.some((trophy) => trophy.id === rawTrophy)) state.trophyId = rawTrophy;
  if (params.get('spoilers') === 'shown') state.spoilersHidden = false;
  const kind = params.get('kind') ?? '';
  if (['story', 'missable', 'do-early', 'collectibles', 'activities', 'crime', 'exploration', 'money'].includes(kind)) state.kind = kind;
  const grade = params.get('grade') ?? '';
  if (['platinum', 'gold', 'silver', 'bronze'].includes(grade)) state.grade = grade;
  if (params.get('earned-only') === '1') state.earnedOnly = true;
  const view = params.get('view') ?? '';
  if (view === 'roadmap' || view === 'checklist') state.view = view;
  return state;
}

// Push the URL state into the controls so a shared link shows what it says.
export function applyUrlState(state) {
  const kind = document.getElementById('kind-filter');
  const grade = document.getElementById('grade-filter');
  const earnedOnly = document.getElementById('earned-only');
  const spoiler = document.getElementById('spoiler-toggle');
  if (kind) kind.value = state.kind;
  if (grade) grade.value = state.grade;
  if (earnedOnly) earnedOnly.checked = state.earnedOnly;
  if (spoiler) spoiler.checked = state.spoilersHidden;
}

// Read the current control values back into a filter object.
export function readFilters() {
  return {
    kind: document.getElementById('kind-filter')?.value ?? '',
    grade: document.getElementById('grade-filter')?.value ?? '',
    earnedOnly: document.getElementById('earned-only')?.checked ?? false,
    query: document.getElementById('search')?.value ?? '',
  };
}

// Load and validate the trophy data. The file must hold a trophies array of
// 55 entries with a name and a non-blank guide each.
export async function loadTrophyData() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json failed to load (${response.status})`);
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length !== 55) throw new Error('trophies.json must hold 55 trophies');
  for (const trophy of trophies) {
    if (typeof trophy.name !== 'string' || !trophy.name.trim()) throw new Error('every trophy needs a name');
    if (typeof trophy.guide !== 'string' || !trophy.guide.trim()) throw new Error(`trophy ${trophy.id} has no guide`);
  }
  return trophies;
}

// Scroll to a section or a trophy row after rendering, so deep links land on
// their target instead of under the sticky bar.
export function scrollToView(state) {
  if (state.view === 'roadmap') {
    document.getElementById('roadmap')?.scrollIntoView();
    return;
  }
  if (state.trophyId !== null) {
    document.getElementById(`trophy-${state.trophyId}`)?.scrollIntoView({ block: 'start' });
    document.getElementById('guide-panel')?.scrollIntoView({ block: 'start' });
  }
}

// Render everything from the current state: audit strip, ring, featured
// excerpt, checklist, roadmap and the missable audit.
export function renderAll(context) {
  const { trophies, earned, state } = context;
  setAuditNumbers(trophies);
  setProgressRing(earned.size, trophies.length);
  const spoilersHidden = state.spoilersHidden;
  renderFeaturedCards(trophies, earned, spoilersHidden, (id) => openGuide(context, id));
  renderTrophyRows(trophies, readFilters(), earned, spoilersHidden, (id) => openGuide(context, id), (id) => toggleEarned(context, id));
  renderRoadmapStages(trophies, earned, spoilersHidden, (id) => openGuide(context, id));
  renderMissableAudit();
  if (state.trophyId !== null) {
    const trophy = trophies.find((item) => item.id === state.trophyId);
    if (trophy) renderGuidePanel(trophy, earned, spoilersHidden);
  }
}

// Open one trophy's guide in the detail panel and scroll to it.
export function openGuide(context, id) {
  const trophy = context.trophies.find((item) => item.id === id);
  if (!trophy) return;
  context.state.trophyId = id;
  renderGuidePanel(trophy, context.earned, context.state.spoilersHidden);
  document.getElementById('guide-panel')?.scrollIntoView({ block: 'start' });
}

// Toggle one trophy's earned state, persist it, and re-render.
export function toggleEarned(context, id) {
  if (context.earned.has(id)) context.earned.delete(id);
  else context.earned.add(id);
  writeProgress(context.earned);
  renderAll(context);
  if (context.state.trophyId === id) {
    const trophy = context.trophies.find((item) => item.id === id);
    if (trophy) renderGuidePanel(trophy, context.earned, context.state.spoilersHidden);
  }
}

// Export progress: download a JSON file the reader can keep or import back.
export function handleExportClick(context) {
  const payload = makeExportPayload(context.earned, context.trophies.length);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-100-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Import progress: read the chosen file, validate it, and apply it.
export async function handleImportFile(context, file) {
  if (!file) return;
  const text = await file.text();
  const imported = parseImportedProgress(text, context.trophies.map((trophy) => trophy.id));
  if (!imported) {
    alert('That file is not a Leonida 100% progress export.');
    return;
  }
  context.earned = imported;
  writeProgress(context.earned);
  renderAll(context);
  alert(`Imported ${imported.size} earned trophies.`);
}

// Reset: clear saved progress after a confirm, then re-render.
export function handleResetClick(context) {
  if (!confirm('Clear all saved progress? This cannot be undone.')) return;
  clearProgress();
  context.earned = new Set();
  renderAll(context);
}

// Wire every control in the sticky bar to a re-render.
export function wireControls(context) {
  const rerender = () => renderAll(context);
  document.getElementById('search')?.addEventListener('input', rerender);
  document.getElementById('kind-filter')?.addEventListener('change', rerender);
  document.getElementById('grade-filter')?.addEventListener('change', rerender);
  document.getElementById('earned-only')?.addEventListener('change', rerender);
  document.getElementById('spoiler-toggle')?.addEventListener('change', (event) => {
    context.state.spoilersHidden = event.target.checked;
    renderAll(context);
  });
  document.getElementById('export-btn')?.addEventListener('click', () => handleExportClick(context));
  document.getElementById('import-btn')?.addEventListener('click', () => document.getElementById('import-file')?.click());
  document.getElementById('import-file')?.addEventListener('change', (event) => {
    handleImportFile(context, event.target.files?.[0]);
    event.target.value = '';
  });
  document.getElementById('reset-btn')?.addEventListener('click', () => handleResetClick(context));
  document.addEventListener('leonida:toggle-earned', (event) => toggleEarned(context, event.detail.id));
}

// Start the app: load data, read URL state, wire controls, render, then scroll.
export async function initApp() {
  const trophies = await loadTrophyData();
  const context = {
    trophies,
    earned: readProgress(),
    state: parseUrlState(new URLSearchParams(window.location.search), trophies),
  };
  applyUrlState(context.state);
  wireControls(context);
  renderAll(context);
  requestAnimationFrame(() => scrollToView(context.state));
}

initApp().catch((error) => {
  const panel = document.getElementById('guide-panel');
  if (panel) panel.innerHTML = `<p class="guide-empty">The guide could not load: ${error.message}</p>`;
});
