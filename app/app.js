// Leonida 100% — GTA VI trophy tracker.
// Loads app/data/trophies.json, renders the checklist, roadmap, filters,
// spoiler setting and export/import. Progress lives in localStorage only;
// the app makes no network request besides fetching its own data file.
import { renderRoadmap, kindLabel } from './roadmap.js';

const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'gta6-trophy-tracker-v1';

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedOnlyEl = document.getElementById('earned-only');
const spoilersEl = document.getElementById('spoilers');

let doc = null;
let earned = new Set(loadStoredProgress());
let openGuide = null;

function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
  } catch {
    // Private mode or full storage: the checklist still works in memory.
  }
}

function isEarned(name) {
  return earned.has(name);
}

function spoilersHidden() {
  return spoilersEl.checked;
}

function formatCount(t) {
  if (t.count === null || t.count === undefined) return null;
  return `${t.count.toLocaleString('en-US')} ${t.countUnit}`;
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !isEarned(t.name)) return false;
  return true;
}

function sourceLink(key) {
  const src = doc.sources[key];
  if (!src) return null;
  if (src.url) {
    const a = document.createElement('a');
    a.href = src.url;
    a.rel = 'noopener';
    a.textContent = src.name;
    return a;
  }
  const span = document.createElement('span');
  span.textContent = src.name;
  return span;
}

function renderGuide(t, masked) {
  const box = document.createElement('div');
  box.className = 'guide';
  if (masked) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Hidden on PlayStation until earned. Turn off “Hide story spoilers” above, or earn it, to reveal its guide.';
    box.append(note);
    return box;
  }
  const text = document.createElement('p');
  text.textContent = t.guide;
  const label = document.createElement('p');
  label.className = 'sources-label';
  label.textContent = 'Sources';
  const ul = document.createElement('ul');
  for (const key of t.sources) {
    const node = sourceLink(key);
    if (!node) continue;
    const li = document.createElement('li');
    li.append(node);
    ul.append(li);
  }
  box.append(text, label, ul);
  return box;
}

function renderTrophy(t) {
  const article = document.createElement('article');
  article.className = 'trophy' + (isEarned(t.name) ? ' earned' : '');
  article.dataset.trophyId = String(t.id);
  const masked = t.hidden && spoilersHidden() && !isEarned(t.name);

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(t.name);
  box.setAttribute('aria-label', `Mark ${masked ? 'hidden trophy' : t.name} as earned`);
  box.addEventListener('change', () => {
    toggleEarned(t.name, box.checked);
  });
  box.addEventListener('click', (event) => event.stopPropagation());

  const main = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'trophy-name';
  if (masked) {
    const span = document.createElement('span');
    span.className = 'masked';
    span.textContent = 'Hidden trophy — earn it to reveal';
    name.append(span);
  } else {
    name.textContent = t.name;
  }
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'Hidden on PlayStation until earned.' : t.description;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const gradeChip = document.createElement('span');
  gradeChip.className = `chip grade-${t.grade}`;
  gradeChip.textContent = t.grade;
  meta.append(gradeChip);
  const kindChip = document.createElement('span');
  kindChip.className = 'chip';
  kindChip.textContent = kindLabel(t.kind);
  // Platinum-path trophies already carry the grade chip, so the kind chip
  // would repeat it; missable trophies keep the kind chip as their flag.
  if (t.kind !== 'platinum') meta.append(kindChip);
  if (t.hidden) {
    const hiddenChip = document.createElement('span');
    hiddenChip.className = 'chip hidden-flag';
    hiddenChip.textContent = 'hidden';
    meta.append(hiddenChip);
  }
  if (t.missable && t.kind !== 'missable') {
    const missChip = document.createElement('span');
    missChip.className = 'chip missable';
    missChip.textContent = 'missable';
    meta.append(missChip);
  }
  const countText = formatCount(t);
  if (countText) {
    const countChip = document.createElement('span');
    countChip.className = 'chip count';
    countChip.textContent = countText;
    meta.append(countChip);
  }
  main.append(name, desc, meta);
  const chevron = document.createElement('span');
  chevron.className = 'chip';
  chevron.textContent = openGuide === t.id ? 'guide open' : 'guide';
  head.append(box, main, chevron);

  head.addEventListener('click', () => {
    openGuide = openGuide === t.id ? null : t.id;
    renderTrophyList();
  });

  article.append(head);
  if (openGuide === t.id) article.append(renderGuide(t, masked));
  return article;
}

function renderTrophyList() {
  const shown = doc.trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(renderTrophy(t));
  document.getElementById('result-count').textContent =
    `Showing ${shown.length} of ${doc.trophies.length} trophies` +
    (spoilersHidden() ? ' · spoilers hidden' : ' · spoilers shown');
}

function updateProgressBar() {
  const total = doc.trophies.length;
  const done = doc.trophies.filter((t) => isEarned(t.name)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('progress-text').textContent =
    `${done} of ${total} earned · ${pct}% · ${total - done} to go`;
}

function renderAuditStrip() {
  const a = doc.audit;
  document.getElementById('audit-total').textContent = String(a.total);
  document.getElementById('audit-platinum').textContent = String(a.platinum);
  document.getElementById('audit-gold').textContent = String(a.gold);
  document.getElementById('audit-silver').textContent = String(a.silver);
  document.getElementById('audit-bronze').textContent = String(a.bronze);
  document.getElementById('audit-hidden').textContent = String(a.hidden);
  document.getElementById('audit-missable').textContent = String(a.missable);
  document.getElementById('audit-online').textContent = String(a.online);
}

function renderRunNotes() {
  const ul = document.getElementById('run-notes');
  ul.replaceChildren();
  for (const note of doc.notes) {
    const li = document.createElement('li');
    li.textContent = note;
    ul.append(li);
  }
}

function renderSourceList() {
  const ul = document.getElementById('source-list');
  ul.replaceChildren();
  for (const [key, src] of Object.entries(doc.sources)) {
    const li = document.createElement('li');
    if (src.url) {
      const a = document.createElement('a');
      a.href = src.url;
      a.rel = 'noopener';
      a.textContent = src.name;
      li.append(a);
    } else {
      li.textContent = `${src.name} (list consulted at launch; no direct link recorded)`;
    }
    ul.append(li);
  }
}

function toggleEarned(name, checked) {
  if (checked) earned.add(name);
  else earned.delete(name);
  saveProgress();
  renderAll();
}

function renderAll() {
  renderAuditStrip();
  renderRoadmap(doc, isEarned, spoilersHidden);
  renderTrophyList();
  updateProgressBar();
}

function exportProgress() {
  const payload = {
    game: doc.game,
    platform: doc.platform,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    document.getElementById('result-count').textContent = 'Import failed: that file is not valid JSON.';
    return;
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    document.getElementById('result-count').textContent = 'Import failed: expected a list of trophy names.';
    return;
  }
  const known = new Set(doc.trophies.map((t) => t.name));
  earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
  saveProgress();
  renderAll();
  document.getElementById('result-count').textContent =
    `Imported ${earned.size} earned trophies from ${file.name}.`;
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`trophies.json failed: ${response.status}`);
  doc = await response.json();
  renderAuditStrip();
  renderRunNotes();
  renderSourceList();
  renderAll();
}

searchEl.addEventListener('input', renderTrophyList);
kindEl.addEventListener('change', renderTrophyList);
gradeEl.addEventListener('change', renderTrophyList);
earnedOnlyEl.addEventListener('change', renderTrophyList);
spoilersEl.addEventListener('change', renderAll);
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (window.confirm('Clear all earned trophies in this browser?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

loadTrophies().catch((error) => {
  listEl.textContent = `Could not load the trophy list: ${error.message}`;
});
