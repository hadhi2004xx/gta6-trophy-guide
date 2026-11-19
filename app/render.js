// DOM rendering for the Leonida 100% guide: audit strip, progress ring,
// do-early panel, featured excerpt, checklist rows, open-guide panels, run
// notes and the source list. Rendering is pure DOM construction — no
// innerHTML, no copied text — so every row shows the official name,
// description and grade exactly as the data file carries them.
import { auditCounts, featuredTrophies, doEarlyTrophies } from './data.js';
import { kindLabel } from './filters.js';
import { progressText, ringOffsetForPercent } from './tracker.js';

export function renderAuditStrip(doc) {
  const a = auditCounts(doc);
  document.getElementById('audit-total').textContent = String(a.total);
  document.getElementById('audit-grades').textContent =
    `${a.platinum}·${a.gold}·${a.silver}·${a.bronze}`;
  document.getElementById('audit-hidden').textContent = String(a.hidden);
  document.getElementById('audit-missable').textContent = String(a.missable);
  document.getElementById('audit-doearly').textContent = String(a.doEarly);
  document.getElementById('audit-online').textContent = String(a.online);
}

export function renderProgress(doc, earnedCount) {
  const total = doc.trophies.length;
  const pct = total === 0 ? 0 : Math.round((earnedCount / total) * 100);
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('ring-fill').style.strokeDashoffset = String(ringOffsetForPercent(pct));
  document.getElementById('progress-text').textContent = progressText(earnedCount, total);
}

export function renderDoEarlyPanel(doc) {
  const grid = document.getElementById('doearly-grid');
  grid.replaceChildren();
  for (const t of doEarlyTrophies(doc)) {
    grid.append(renderDoEarlyCard(t));
  }
}

export function renderDoEarlyCard(t) {
  const card = document.createElement('article');
  card.className = 'doearly-card';
  const flag = document.createElement('span');
  flag.className = 'flag';
  flag.textContent = t.missable ? 'Missable' : 'Do early';
  const title = document.createElement('h3');
  title.textContent = t.name;
  const body = document.createElement('p');
  body.textContent = t.missable ? t.missableReason : t.timeSensitiveReason;
  const src = document.createElement('p');
  src.className = 'src';
  src.textContent = `Source: ${t.missable ? 'PowerPyx + GTABase' : 'PowerPyx'}`;
  card.append(flag, title, body, src);
  return card;
}

export function formatCountChip(trophy) {
  if (trophy.count === null || trophy.count === undefined) return null;
  return `${trophy.count.toLocaleString('en-US')} ${trophy.countUnit}`;
}

export function renderSourceLink(doc, key) {
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

export function renderGuidePanel(doc, trophy, masked) {
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
  text.className = 'guide-text';
  text.textContent = trophy.guide;
  box.append(text);
  const why = trophy.missable ? trophy.missableReason : trophy.timeSensitiveReason;
  if (why) {
    const whyBox = document.createElement('p');
    whyBox.className = 'why-box';
    const strong = document.createElement('strong');
    strong.textContent = trophy.missable ? 'WHY IT CAN BE MISSED — ' : 'WHY DO IT EARLY — ';
    whyBox.append(strong, document.createTextNode(why));
    box.append(whyBox);
  }
  const label = document.createElement('p');
  label.className = 'sources-label';
  label.textContent = 'Sources — where each fact comes from';
  const ul = document.createElement('ul');
  for (const key of trophy.sources) {
    const node = renderSourceLink(doc, key);
    if (!node) continue;
    const li = document.createElement('li');
    li.append(node);
    ul.append(li);
  }
  box.append(label, ul);
  return box;
}

export function renderTrophyRow(doc, trophy, state) {
  const article = document.createElement('article');
  article.className = 'trophy' + (state.isEarned(trophy.name) ? ' earned' : '');
  article.dataset.trophyId = String(trophy.id);
  const masked = trophy.hidden && state.spoilersHidden() && !state.isEarned(trophy.name);

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.isEarned(trophy.name);
  box.setAttribute('aria-label', `Mark ${masked ? 'hidden trophy' : trophy.name} as earned`);
  box.addEventListener('change', () => state.toggleEarned(trophy.name, box.checked));
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
    name.textContent = trophy.name;
  }
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'Hidden on PlayStation until earned.' : trophy.description;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const gradeChip = document.createElement('span');
  gradeChip.className = `chip grade-${trophy.grade}`;
  gradeChip.textContent = trophy.grade;
  meta.append(gradeChip);
  // Platinum-path trophies already carry the grade chip, and missable
  // trophies already carry the missable flag — the kind chip would repeat it.
  if (trophy.kind !== 'platinum' && trophy.kind !== 'missable') {
    const kindChip = document.createElement('span');
    kindChip.className = 'chip';
    kindChip.textContent = kindLabel(trophy.kind);
    meta.append(kindChip);
  }
  if (trophy.hidden) {
    const hiddenChip = document.createElement('span');
    hiddenChip.className = 'chip hidden-flag';
    hiddenChip.textContent = 'hidden';
    meta.append(hiddenChip);
  }
  if (trophy.missable) {
    const missChip = document.createElement('span');
    missChip.className = 'chip missable';
    missChip.textContent = 'missable';
    meta.append(missChip);
  } else if (trophy.timeSensitive) {
    const earlyChip = document.createElement('span');
    earlyChip.className = 'chip doearly';
    earlyChip.textContent = 'do early';
    meta.append(earlyChip);
  }
  const countText = formatCountChip(trophy);
  if (countText) {
    const countChip = document.createElement('span');
    countChip.className = 'chip count';
    countChip.textContent = countText;
    meta.append(countChip);
  }
  main.append(name, desc, meta);
  const chevron = document.createElement('span');
  chevron.className = 'chip';
  chevron.textContent = state.openGuide === trophy.id ? 'guide open' : 'guide';
  head.append(box, main, chevron);

  head.addEventListener('click', () => {
    state.openGuide = state.openGuide === trophy.id ? null : trophy.id;
    state.rerenderLists();
  });

  article.append(head);
  if (state.openGuide === trophy.id) article.append(renderGuidePanel(doc, trophy, masked));
  return article;
}

export function renderFeaturedExcerpt(doc, state) {
  const listEl = document.getElementById('featured-list');
  listEl.replaceChildren();
  for (const t of featuredTrophies(doc)) listEl.append(renderTrophyRow(doc, t, state));
}

export function renderTrophyList(doc, shown, state) {
  const listEl = document.getElementById('list');
  listEl.replaceChildren();
  for (const t of shown) listEl.append(renderTrophyRow(doc, t, state));
  document.getElementById('result-count').textContent =
    `Showing ${shown.length} of ${doc.trophies.length} trophies` +
    (state.spoilersHidden() ? ' · spoilers hidden' : ' · spoilers shown');
}

export function renderRunNotes(doc) {
  const ul = document.getElementById('run-notes');
  ul.replaceChildren();
  for (const note of doc.notes) {
    const li = document.createElement('li');
    li.textContent = note;
    ul.append(li);
  }
}

export function renderSourceList(doc) {
  const ul = document.getElementById('source-list');
  ul.replaceChildren();
  for (const [key, src] of Object.entries(doc.sources)) {
    const li = document.createElement('li');
    const node = renderSourceLink(doc, key);
    if (node) li.append(node);
    if (!src.url) li.append(document.createTextNode(' (list consulted at launch; no direct link recorded)'));
    ul.append(li);
  }
}
