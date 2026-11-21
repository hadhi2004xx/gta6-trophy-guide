// renderLeonidaGuide — the bootstrap: load the trophy data, build the store, render
// every section, wire the controls, then honour the deep links (?view=, ?trophy=,
// ?kind=, ?grade=, ?spoiler=, ?stage=) only after the first full render, so a link
// never lands mid-render. Sets window.__shotReady when the page is complete.
import { createTrophyStore } from './store.js';
import { computeAudit } from './audit.js';
import { renderAuditStrip, renderGoalBar, renderStageChips, renderChecklist, renderRoadmap, renderSourcesPanel } from './views.js';
import { findTrophyBySlug, kindOptions, stageOrder, trophyMatchesFilters, KIND_LABELS } from './classify.js';

const store = createTrophyStore();
const params = new URLSearchParams(location.search);
const expandedIds = new Set();
let data = null;
let audit = null;
let activeStage = params.get('stage') ?? 'all';

const filters = {
  kind: params.get('kind') ?? 'all',
  grade: params.get('grade') ?? 'all',
  earned: 'all',
  query: params.get('q') ?? '',
  match(trophy) {
    if (activeStage !== 'all' && trophy.stage !== activeStage) return false;
    return trophyMatchesFilters(trophy, { ...this, isEarned: (t) => store.isEarned(t) });
  },
};

function $(id) {
  return document.getElementById(id);
}

function renderAll() {
  audit = computeAudit(data, store);
  const sourcesById = new Map(data.sources.map((s) => [s.id, s]));
  renderAuditStrip($('audit-strip'), audit, data.sources.length);
  renderGoalBar($('goal-bar'), audit);
  renderStageChips($('stage-chips'), stageOrder(data.stages), audit, activeStage, (stage) => {
    activeStage = stage;
    renderAll();
    scrollToSection('checklist-section');
  });
  $('progress-line').textContent = audit.earned + ' of ' + audit.total + ' earned · ' + (audit.gradeEarned.platinum ?? 0) + '/1 platinum · ' + (audit.gradeEarned.gold ?? 0) + '/2 gold';
  const shown = renderChecklist($('rows'), $('empty-note'), data.trophies, store, sourcesById, filters, expandedIds, {
    onProgress: () => renderAll(),
    onToggleGuide: (trophy) => {
      if (expandedIds.has(trophy.id)) expandedIds.delete(trophy.id);
      else expandedIds.add(trophy.id);
      renderAll();
    },
  });
  $('shown-line').textContent = shown + ' of ' + audit.total + ' shown';
  renderRoadmap($('roadmap-body'), data, audit);
  renderSourcesPanel($('sources-body'), data, audit);
  window.__shotReady = true;
}

function scrollToSection(id) {
  const node = $(id);
  if (node) node.scrollIntoView({ behavior: 'instant', block: 'start' });
}

function honourDeepLinks() {
  const trophy = findTrophyBySlug(data.trophies, params.get('trophy'));
  if (trophy) {
    expandedIds.add(trophy.id);
    renderAll();
    requestAnimationFrame(() => {
      const row = $('trophy-' + trophy.id);
      if (row) row.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return;
  }
  const view = params.get('view');
  if (view === 'roadmap') scrollToSection('roadmap-section');
  else if (view === 'sources') scrollToSection('sources-section');
  // No view param: stay at the top, so the cover shows the masthead first.
}

function wireControls() {
  const kindSelect = $('filter-kind');
  for (const kind of kindOptions(data.trophies)) {
    const option = document.createElement('option');
    option.value = kind;
    option.textContent = KIND_LABELS[kind] ?? kind;
    kindSelect.append(option);
  }
  kindSelect.value = KIND_LABELS[filters.kind] ? filters.kind : 'all';
  kindSelect.addEventListener('change', () => {
    filters.kind = kindSelect.value;
    renderAll();
  });

  const gradeSelect = $('filter-grade');
  gradeSelect.value = filters.grade;
  gradeSelect.addEventListener('change', () => {
    filters.grade = gradeSelect.value;
    renderAll();
  });

  const earnedSelect = $('filter-earned');
  earnedSelect.addEventListener('change', () => {
    filters.earned = earnedSelect.value;
    renderAll();
  });

  const search = $('search');
  search.value = filters.query;
  search.addEventListener('input', () => {
    filters.query = search.value;
    renderAll();
  });

  const spoiler = $('spoiler-toggle');
  spoiler.checked = store.spoilerOn();
  spoiler.addEventListener('change', () => {
    store.setSpoiler(spoiler.checked);
    renderAll();
  });

  $('view-checklist').addEventListener('click', () => scrollToSection('checklist-section'));
  $('view-roadmap').addEventListener('click', () => scrollToSection('roadmap-section'));
  $('view-sources').addEventListener('click', () => scrollToSection('sources-section'));

  $('export-btn').addEventListener('click', () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-100-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
    $('status-line').textContent = 'Progress exported.';
  });

  $('import-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await file.text().then((text) => store.importJson(text, data.trophies));
      $('status-line').textContent = 'Imported ' + result.earned + ' earned trophies.';
      renderAll();
    } catch {
      $('status-line').textContent = 'Import failed — that file is not a Leonida 100% export.';
    }
    event.target.value = '';
  });

  $('reset-btn').addEventListener('click', () => {
    store.resetAll();
    expandedIds.clear();
    $('status-line').textContent = 'Progress cleared.';
    renderAll();
  });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophies.json did not load');
  data = await response.json();
  // URL overrides for the screenshot views: the cover shows every name, the
  // tracker shot shows the spoiler mask at work.
  if (params.get('spoiler') === 'off') store.setSpoiler(false);
  if (params.get('spoiler') === 'on') store.setSpoiler(true);
  wireControls();
  renderAll();
  honourDeepLinks();
}

boot().catch((error) => {
  const note = $('empty-note');
  note.textContent = 'The guide did not load: ' + error.message;
  note.hidden = false;
  window.__shotReady = false;
});
