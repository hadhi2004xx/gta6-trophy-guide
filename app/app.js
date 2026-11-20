// app.js — boot and wiring for the Leonida 100% trophy guide.
// Loads app/data/trophies.json, renders every section, keeps the URL in sync
// (?trophy=, ?spoilers=, ?kind=, ?grade=, ?earned-only=, ?view=), and scrolls
// to deep links only after the first render has finished.

import { computeAudit } from './audit.js';
import { loadState, saveState, toggleEarned, bumpCounter, exportState, importStateText, resetState } from './store.js';
import {
  renderAuditStrip, renderProgress, renderChecklist, renderFeatured,
  renderRoadmap, renderNextUp, renderDetail, renderSources, renderMissableAudit,
} from './views.js';

const DATA_URL = 'data/trophies.json';

const ui = {
  q: '', kind: 'all', grade: 'all', earnedOnly: false,
  view: 'checklist', selectedId: 28, spoilers: null,
};

let trophies = [];
let state = loadState();
let hadDeepLink = false;
let hadTrophyParam = false;

function $(sel) { return document.querySelector(sel); }

function readUrl() {
  const p = new URLSearchParams(location.search);
  const trophy = Number.parseInt(p.get('trophy') || '', 10);
  if (Number.isInteger(trophy) && trophy >= 1 && trophy <= 55) { ui.selectedId = trophy; hadDeepLink = true; hadTrophyParam = true; }
  const spoilers = p.get('spoilers');
  if (spoilers === 'hidden' || spoilers === 'shown') {
    ui.spoilers = spoilers;
    state.spoilers = spoilers;
  }
  const kind = p.get('kind');
  if (kind) ui.kind = kind;
  const grade = p.get('grade');
  if (grade) ui.grade = grade;
  if (p.get('earned-only') === '1') ui.earnedOnly = true;
  const view = p.get('view');
  if (view === 'roadmap' || view === 'checklist') { ui.view = view; hadDeepLink = true; }
  const q = p.get('q');
  if (q) ui.q = q;
}

function writeUrl() {
  const p = new URLSearchParams();
  if (ui.selectedId) p.set('trophy', String(ui.selectedId));
  p.set('spoilers', state.spoilers);
  if (ui.kind !== 'all') p.set('kind', ui.kind);
  if (ui.grade !== 'all') p.set('grade', ui.grade);
  if (ui.earnedOnly) p.set('earned-only', '1');
  if (ui.view !== 'checklist') p.set('view', ui.view);
  if (ui.q) p.set('q', ui.q);
  history.replaceState(null, '', location.pathname + '?' + p.toString());
}

function renderAll() {
  $('#audit-strip').innerHTML = renderAuditStrip(trophies);
  $('#progress').innerHTML = renderProgress(trophies, state);
  $('#featured').innerHTML = renderFeatured(trophies, state);
  $('#checklist').innerHTML = renderChecklist(trophies, state, ui);
  $('#roadmap-grid').innerHTML = renderRoadmap(trophies, state);
  $('#nextup').innerHTML = renderNextUp(trophies, state);
  const selected = trophies.find((t) => t.id === ui.selectedId) || null;
  $('#detail').innerHTML = renderDetail(selected, state);
  $('#sources-list').innerHTML = renderSources(trophies);
  $('#missable-audit').innerHTML = renderMissableAudit();
  document.body.dataset.spoilers = state.spoilers;
  $('#spoiler-toggle').textContent = state.spoilers === 'hidden' ? 'Spoilers: Hidden' : 'Spoilers: Shown';
  $('#spoiler-toggle').setAttribute('aria-pressed', String(state.spoilers === 'shown'));
  $('#earned-only').checked = ui.earnedOnly;
  $('#search').value = ui.q;
  $('#kind-filter').value = ui.kind;
  $('#grade-filter').value = ui.grade;
  document.querySelectorAll('[data-view-tab]').forEach((b) => {
    b.classList.toggle('active', b.dataset.viewTab === ui.view);
  });
  const counts = computeAudit(trophies);
  $('#audit-note').textContent = 'Audit: ' + counts.withSource + '/55 guides cite a source · '
    + counts.stepsCited + '/' + counts.stepsTotal + ' steps cited · '
    + counts.missableCount + ' possibly missable · ' + counts.doEarlyCount + ' do-early · '
    + counts.watchCount + ' watch · ' + counts.disagreeCount + ' disagree';
}

function scrollToDeepLink() {
  // No deep link in the URL: stay at the top of the page (the cover).
  if (!hadDeepLink) return;
  // Scroll only after renderAll has finished, in the next frame, so the
  // target rows exist and are laid out. Every section and row carries
  // scroll-margin-top in CSS, so nothing lands under the sticky bar.
  requestAnimationFrame(() => {
    if (ui.view === 'roadmap') {
      const roadmap = document.getElementById('roadmap');
      if (roadmap) roadmap.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }
    // view === 'checklist': a ?trophy= link lands on that row; a bare
    // ?view=checklist lands at the top of the section (block start, never
    // center — the section is far taller than the viewport).
    if (hadTrophyParam) {
      const row = document.getElementById('row-' + ui.selectedId);
      if (row) {
        row.scrollIntoView({ behavior: 'auto', block: 'center' });
        return;
      }
    }
    const section = document.getElementById('checklist-section');
    if (section) section.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
}

function selectTrophy(id, scroll) {
  ui.selectedId = id;
  renderAll();
  writeUrl();
  if (scroll) {
    requestAnimationFrame(() => {
      const detail = document.getElementById('detail-section');
      if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function downloadFile(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindEvents() {
  document.addEventListener('click', (ev) => {
    const tick = ev.target.closest('[data-tick]');
    if (tick) {
      toggleEarned(state, Number(tick.dataset.tick));
      renderAll();
      writeUrl();
      return;
    }
    const open = ev.target.closest('[data-open]');
    if (open) {
      selectTrophy(Number(open.dataset.open), true);
      return;
    }
    const inc = ev.target.closest('[data-inc]');
    if (inc) {
      const t = trophies.find((x) => x.id === Number(inc.dataset.inc));
      if (t && t.count) { bumpCounter(state, t.id, t.count.step, t.count.target); renderAll(); }
      return;
    }
    const dec = ev.target.closest('[data-dec]');
    if (dec) {
      const t = trophies.find((x) => x.id === Number(dec.dataset.dec));
      if (t && t.count) { bumpCounter(state, t.id, -t.count.step, t.count.target); renderAll(); }
      return;
    }
    const tab = ev.target.closest('[data-view-tab]');
    if (tab) {
      ui.view = tab.dataset.viewTab;
      renderAll();
      writeUrl();
      const target = document.getElementById(ui.view === 'roadmap' ? 'roadmap' : 'checklist-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('.trow')) {
      selectTrophy(Number(ev.target.dataset.trophy), true);
    }
  });

  $('#search').addEventListener('input', (ev) => {
    ui.q = ev.target.value;
    renderAll();
    writeUrl();
  });
  $('#kind-filter').addEventListener('change', (ev) => { ui.kind = ev.target.value; renderAll(); writeUrl(); });
  $('#grade-filter').addEventListener('change', (ev) => { ui.grade = ev.target.value; renderAll(); writeUrl(); });
  $('#earned-only').addEventListener('change', (ev) => { ui.earnedOnly = ev.target.checked; renderAll(); writeUrl(); });
  $('#spoiler-toggle').addEventListener('click', () => {
    state.spoilers = state.spoilers === 'hidden' ? 'shown' : 'hidden';
    saveState(state);
    renderAll();
    writeUrl();
  });
  $('#export-btn').addEventListener('click', () => {
    downloadFile('leonida-100-progress.json', exportState(state));
  });
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state = importStateText(text);
      renderAll();
      writeUrl();
      $('#import-status').textContent = 'Imported ' + state.earned.length + ' earned trophies.';
    } catch (err) {
      $('#import-status').textContent = 'Import failed: ' + err.message;
    }
    ev.target.value = '';
  });
  $('#reset-btn').addEventListener('click', () => {
    if (window.confirm('Reset all earned trophies and counters? This cannot be undone.')) {
      state = resetState();
      renderAll();
      writeUrl();
    }
  });
}

async function boot() {
  readUrl();
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('Could not load ' + DATA_URL);
  const data = await res.json();
  trophies = data.trophies;
  bindEvents();
  renderAll();
  scrollToDeepLink();
}

boot().catch((err) => {
  const el = document.getElementById('app-error');
  if (el) el.textContent = 'Failed to load the trophy data: ' + err.message;
});
