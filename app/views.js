// Views: every DOM render in the guide. Each function takes plain data and
// returns nothing — it writes into the element it is handed.

import { KIND_LABELS, ROADMAP_STAGES, MISSABLE_AUDIT, featuredEight, trophyVisible } from './classify.js';

const RING_CIRCUMFERENCE = 326.7;
const HIDDEN_PLACEHOLDER = 'Hidden trophy — earn it to reveal';

// A hidden trophy shows its real name only when spoilers are off or it is
// earned; otherwise the row is masked so the story stays unspoiled.
export function displayName(trophy, spoilersHidden, earned) {
  if (trophy.hidden && spoilersHidden && !earned.has(trophy.id)) return HIDDEN_PLACEHOLDER;
  return trophy.name;
}

export function displayDescription(trophy, spoilersHidden, earned) {
  if (trophy.hidden && spoilersHidden && !earned.has(trophy.id)) return 'Its description is hidden until earned.';
  return trophy.description;
}

// The progress ring: earned / total as a stroked arc plus the count text.
export function setProgressRing(earnedCount, total) {
  const fill = document.getElementById('ring-fill');
  const text = document.getElementById('progress-text');
  const fraction = total === 0 ? 0 : earnedCount / total;
  if (fill) fill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
  if (text) text.textContent = `${earnedCount} / ${total}`;
}

// The audit strip numbers, computed from the loaded data rather than hard-coded.
export function setAuditNumbers(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let hidden = 0;
  let missable = 0;
  let doEarly = 0;
  for (const trophy of trophies) {
    if (counts[trophy.grade] !== undefined) counts[trophy.grade] += 1;
    if (trophy.hidden) hidden += 1;
    if (trophy.missable) missable += 1;
    if (trophy.doEarly) doEarly += 1;
  }
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  };
  setText('audit-total', trophies.length);
  setText('audit-grades', `${counts.platinum}·${counts.gold}·${counts.silver}·${counts.bronze}`);
  setText('audit-hidden', hidden);
  setText('audit-missable', missable);
  setText('audit-doearly', doEarly);
  setText('audit-online', 0);
}

// Small flag chips shown beside a trophy name: grade, kind, missable, do-early.
function flagChips(trophy) {
  const chips = [`<span class="grade ${trophy.grade}">${trophy.grade}</span>`];
  if (trophy.kind && trophy.kind !== 'story') chips.push(`<span class="flag-tag">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>`);
  if (trophy.missable) chips.push('<span class="flag-tag">Missable</span>');
  if (trophy.doEarly) chips.push('<span class="flag-tag">Do early</span>');
  if (trophy.count !== null && trophy.count !== undefined) chips.push(`<span class="flag-tag">×${trophy.count}</span>`);
  return chips.join('');
}

// The featured excerpt: eight large-type cards, each opening its guide.
export function renderFeaturedCards(trophies, earned, spoilersHidden, openGuide) {
  const list = document.getElementById('featured-list');
  if (!list) return;
  list.innerHTML = '';
  for (const trophy of featuredEight(trophies)) {
    const item = document.createElement('li');
    item.innerHTML = `
      <span class="trophy-name">${displayName(trophy, spoilersHidden, earned)}</span>
      <span class="trophy-desc">${displayDescription(trophy, spoilersHidden, earned)}</span>
      <span class="trophy-meta">${flagChips(trophy)}</span>`;
    item.addEventListener('click', () => openGuide(trophy.id));
    list.appendChild(item);
  }
}

// The full checklist, filtered by the current controls. Returns the count shown.
export function renderTrophyRows(trophies, filters, earned, spoilersHidden, openGuide, toggleEarned) {
  const list = document.getElementById('trophy-list');
  if (!list) return 0;
  list.innerHTML = '';
  let shown = 0;
  for (const trophy of trophies) {
    if (!trophyVisible(trophy, filters, earned)) continue;
    shown += 1;
    const row = document.createElement('li');
    row.className = `trophy-row${earned.has(trophy.id) ? ' earned' : ''}`;
    row.id = `trophy-${trophy.id}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      toggleEarned(trophy.id);
    });
    const body = document.createElement('div');
    body.innerHTML = `
      <span class="trophy-name">${displayName(trophy, spoilersHidden, earned)}</span>
      <span class="trophy-desc">${displayDescription(trophy, spoilersHidden, earned)}</span>`;
    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    meta.innerHTML = flagChips(trophy);
    row.appendChild(box);
    row.appendChild(body);
    row.appendChild(meta);
    row.addEventListener('click', () => openGuide(trophy.id));
    list.appendChild(row);
  }
  const count = document.getElementById('result-count');
  if (count) count.textContent = `${shown} shown`;
  return shown;
}

// The detail view: one trophy in large type, its guide, the missable box when
// it applies, and every named source beside it.
export function renderGuidePanel(trophy, earned, spoilersHidden) {
  const panel = document.getElementById('guide-panel');
  if (!panel || !trophy) return;
  const masked = trophy.hidden && spoilersHidden && !earned.has(trophy.id);
  const missBox = trophy.missable
    ? `<div class="miss-box"><h4>Why it can be missed</h4><p>The first meditation — Lucia on the balcony at Jason’s house — happens only in Chapter 1, after the mission Down to Earth. Accept when she offers; after Chapter 1 it never comes back. PowerPyx and GTABase both flag this as the only possibly missable trophy.</p></div>`
    : '';
  const doEarlyBox = !trophy.missable && trophy.doEarly
    ? `<div class="miss-box"><h4>Why to do it early</h4><p>This trophy is gated behind a chapter mission that only appears once. It is not missable, but the mission is the natural first chance — take it when it is marked.</p></div>`
    : '';
  const sources = (trophy.sources ?? []).map((source) =>
    source.url
      ? `<li><a href="${source.url}" target="_blank" rel="noopener">${source.name}</a></li>`
      : `<li>${source.name}</li>`,
  ).join('');
  panel.innerHTML = `
    <h3>${masked ? HIDDEN_PLACEHOLDER : trophy.name}</h3>
    <span class="trophy-desc">${masked ? 'Its description is hidden until earned.' : trophy.description}</span>
    <span class="trophy-meta">${flagChips(trophy)}</span>
    <p class="guide-body">${masked ? 'Earn this trophy to reveal its guide.' : trophy.guide}</p>
    ${missBox}${doEarlyBox}
    <ul class="source-list"><li><span class="src-label">Sources — named, not copied</span></li>${sources}</ul>
    <div class="guide-actions">
      <button type="button" class="primary" data-earn="${trophy.id}">${earned.has(trophy.id) ? '✓ Earned — untick' : 'Mark as earned'}</button>
    </div>`;
  const earnButton = panel.querySelector('[data-earn]');
  if (earnButton) {
    earnButton.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('leonida:toggle-earned', { detail: { id: trophy.id } }));
    });
  }
}

// The six-stage roadmap grid, with per-stage earned counts and flags on the
// first names line.
export function renderRoadmapStages(trophies, earned, spoilersHidden, openGuide) {
  const grid = document.getElementById('roadmap');
  if (!grid) return;
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  grid.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const members = stage.ids.map((id) => byId.get(id)).filter(Boolean);
    const done = members.filter((trophy) => earned.has(trophy.id)).length;
    const names = members.map((trophy) => {
      const label = displayName(trophy, spoilersHidden, earned);
      const flags = [
        trophy.missable ? '<span class="flag-tag">Missable</span>' : '',
        trophy.doEarly ? '<span class="flag-tag">Do early</span>' : '',
      ].join(' ');
      return `${label} ${flags}`.trim();
    }).join(' · ');
    const card = document.createElement('article');
    card.className = 'stage-card';
    card.innerHTML = `
      <span class="stage-num">${stage.number}</span>
      <h3>${stage.title}</h3>
      <p>${stage.note}</p>
      <p class="stage-names">${names}</p>
      <span class="stage-count">${done} / ${members.length} earned in this stage</span>`;
    card.addEventListener('click', () => openGuide(members[0]?.id));
    grid.appendChild(card);
  }
}

// The missable audit: each checked candidate and why it was cleared.
export function renderMissableAudit() {
  const list = document.getElementById('missable-audit-list');
  if (!list) return;
  list.innerHTML = '';
  for (const entry of MISSABLE_AUDIT) {
    const item = document.createElement('li');
    item.innerHTML = `<span class="verdict">${entry.verdict}</span><strong>${entry.name}.</strong> ${entry.text}`;
    list.appendChild(item);
  }
}
