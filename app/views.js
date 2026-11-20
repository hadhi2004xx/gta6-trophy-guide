// views.js — every visible section of the guide, rendered from
// app/data/trophies.json plus the tracker state. Pure string builders:
// app.js owns events, URL state and scrolling.

import { SOURCES, STAGES, FEATURED_IDS, MISSABLE_AUDIT, SOURCES_READ_DATE, computeAudit, sourceName } from './audit.js';
import { isEarned, counterValue } from './store.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function gradeChip(grade) {
  const map = { platinum: 'PLATINUM', gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE' };
  return '<span class="chip grade-' + grade + '">' + (map[grade] || grade.toUpperCase()) + '</span>';
}

export function kindLabel(kind) {
  const map = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', platinum: 'Platinum' };
  return map[kind] || kind;
}

export function isMasked(t, state) {
  return t.hidden && state.spoilers === 'hidden' && !isEarned(state, t.id);
}

export function displayName(t, state) {
  return isMasked(t, state) ? 'Hidden trophy' : t.name;
}

export function displayDesc(t, state) {
  return isMasked(t, state) ? 'Earn this trophy to reveal its name and description.' : t.description;
}

export function flagChips(t) {
  let out = '';
  if (t.missable) out += '<span class="chip flag-missable">POSSIBLY MISSABLE</span>';
  if (t.doEarly) out += '<span class="chip flag-doearly">DO EARLY</span>';
  if (t.watch) out += '<span class="chip flag-watch">WATCH</span>';
  if (t.disagree) out += '<span class="chip flag-disagree">SOURCES DISAGREE</span>';
  if (t.hidden) out += '<span class="chip flag-hidden">HIDDEN</span>';
  return out;
}

export function renderAuditStrip(trophies) {
  const a = computeAudit(trophies);
  const g = a.grades;
  const cells = [
    ['55', 'official trophies'],
    ['1P 2G 6S 46B', g.platinum + ' platinum · ' + g.gold + ' gold · ' + g.silver + ' silver · ' + g.bronze + ' bronze'],
    [String(a.hidden), 'hidden until earned'],
    [a.withSource + '/55', 'guides cite a source'],
    [a.stepsCited + '/' + a.stepsTotal, 'steps cited'],
    ['7', 'sources read ' + SOURCES_READ_DATE],
    [String(a.missableCount), 'possibly missable'],
    [String(a.watchCount), 'watch'],
    [String(a.unconfirmedCount), 'unconfirmed'],
    [String(a.singleSourceCount), 'single-source'],
    [String(a.disagreeCount), 'disagree'],
  ];
  return '<div class="audit-strip" role="status">' + cells.map(([n, l]) =>
    '<div class="audit-cell"><span class="audit-num">' + esc(n) + '</span><span class="audit-label">' + esc(l) + '</span></div>').join('') + '</div>';
}

export function renderProgress(trophies, state) {
  const earned = state.earned.length;
  const total = trophies.length;
  const pct = Math.round((earned / total) * 100);
  const golds = trophies.filter((t) => t.grade === 'gold');
  const goldEarned = golds.filter((t) => isEarned(state, t.id)).length;
  const goldPct = Math.round((goldEarned / golds.length) * 100);
  const bar = (p) => '<div class="goalbar"><div class="goalbar-fill" style="width:' + p + '%"></div></div>';
  return '<div class="progress-wrap">'
    + '<div class="progress-line"><span class="progress-big">' + earned + ' / ' + total + '</span><span class="progress-note">trophies earned · ' + pct + '% to platinum</span></div>'
    + bar(pct)
    + '<div class="progress-line sub"><span>Platinum goal — Vice Got a Price! needs the other 54</span><span>' + goldEarned + ' / ' + golds.length + ' gold · ' + goldPct + '%</span></div>'
    + bar(goldPct)
    + '</div>';
}

export function trophyRow(t, state) {
  const earned = isEarned(state, t.id);
  const masked = isMasked(t, state);
  const counter = t.count ? '<span class="row-count">' + counterValue(state, t.id) + ' / ' + t.count.target + ' ' + esc(t.count.unit) + '</span>' : '';
  return '<article class="trow' + (earned ? ' earned' : '') + (masked ? ' masked' : '') + '" id="row-' + t.id + '" data-trophy="' + t.id + '" tabindex="0">'
    + '<button class="tick" data-tick="' + t.id + '" aria-pressed="' + earned + '" title="' + (earned ? 'Mark as not earned' : 'Mark as earned') + '">' + (earned ? '✓' : '') + '</button>'
    + '<div class="trow-main"><div class="trow-title">' + esc(displayName(t, state)) + ' ' + gradeChip(t.grade) + '</div>'
    + '<div class="trow-desc">' + esc(displayDesc(t, state)) + '</div>'
    + '<div class="trow-meta">' + flagChips(t)
    + '<span class="chip kind-chip">' + esc(kindLabel(t.kind)) + '</span>'
    + '<span class="chip stage-chip">S' + t.stage + '</span>' + counter + '</div></div>'
    + '<button class="open" data-open="' + t.id + '">Guide →</button>'
    + '</article>';
}

export function applyFilters(trophies, state, ui) {
  const q = (ui.q || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (ui.kind && ui.kind !== 'all' && t.kind !== ui.kind) return false;
    if (ui.grade && ui.grade !== 'all' && t.grade !== ui.grade) return false;
    if (ui.earnedOnly && !isEarned(state, t.id)) return false;
    if (q) {
      const masked = isMasked(t, state);
      const hay = masked ? '' : (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.steps || []).map((s) => s.text).join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function renderChecklist(trophies, state, ui) {
  const list = applyFilters(trophies, state, ui);
  const earnedShown = list.filter((t) => isEarned(state, t.id)).length;
  let html = '<p class="section-count">' + list.length + ' of 55 trophies shown · ' + earnedShown + ' earned in this view</p>';
  if (list.length === 0) html += '<p class="empty">No trophies match these filters. Clear the search or widen the filters.</p>';
  html += list.map((t) => trophyRow(t, state)).join('');
  return html;
}

export function renderFeatured(trophies, state) {
  const rows = FEATURED_IDS.map((id) => trophies.find((t) => t.id === id)).filter(Boolean);
  return rows.map((t) => {
    const why = {
      28: 'The one trophy that can be missed — do the Chapter 1 balcony meditation.',
      40: 'Do early: the Chapter 4 optional mission unlocks all bank vaults.',
      41: 'Do early: the same mission counts as robbing an armored truck.',
      46: 'Do early: the Chapter 2 optional mission holds the 3 valuables.',
      14: 'The hardest trophy — the 100% checklist, done last.',
      1: 'The platinum: earn the other 54 and this pops.',
      15: '250 stunts of 397 — under-bridge flights are fastest.',
      17: 'Gold in all 42 Shooting Range challenges.',
    }[t.id] || '';
    return '<button class="feat-row" data-open="' + t.id + '"><span class="feat-id">#' + t.id + '</span>'
      + '<span class="feat-name">' + esc(displayName(t, state)) + '</span>' + gradeChip(t.grade)
      + '<span class="feat-why">' + esc(why) + '</span></button>';
  }).join('');
}

export function renderRoadmap(trophies, state) {
  return STAGES.map((st) => {
    const members = trophies.filter((t) => t.stage === st.n);
    const earned = members.filter((t) => isEarned(state, t.id)).length;
    const flags = members.filter((t) => t.missable || t.doEarly).map((t) =>
      '<span class="chip ' + (t.missable ? 'flag-missable' : 'flag-doearly') + '">' + (t.missable ? 'MISSABLE' : 'DO EARLY') + ' · ' + esc(displayName(t, state)) + '</span>').join('');
    return '<section class="stage-card" id="stage-' + st.n + '">'
      + '<div class="stage-num">S' + st.n + '</div>'
      + '<div class="stage-body"><h3>' + esc(st.title) + '</h3><p class="stage-sub">' + esc(st.sub) + '</p>'
      + '<p class="stage-count">' + earned + ' / ' + members.length + ' earned</p>'
      + '<div class="stage-flags">' + flags + '</div>'
      + '<ul class="stage-list">' + members.map((t) =>
        '<li data-open="' + t.id + '"' + (isEarned(state, t.id) ? ' class="done"' : '') + '><span class="stage-li-num">#' + t.id + '</span> ' + esc(displayName(t, state)) + '</li>').join('') + '</ul>'
      + '</div></section>';
  }).join('');
}

export function renderNextUp(trophies, state) {
  const order = [...trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  const next = order.filter((t) => !isEarned(state, t.id)).slice(0, 3);
  if (next.length === 0) return '<p class="nextup-done">Every trophy is earned. Vice Got a Price! is yours.</p>';
  return next.map((t) => {
    const first = (t.steps && t.steps[0]) ? t.steps[0].text : t.guide;
    return '<div class="nextup-row" data-open="' + t.id + '"><span class="nextup-stage">S' + t.stage + ' · #' + t.id + '</span>'
      + '<span class="nextup-name">' + esc(displayName(t, state)) + '</span>' + gradeChip(t.grade)
      + '<span class="nextup-step">' + esc(first) + '</span></div>';
  }).join('');
}

export function renderDetail(t, state) {
  if (!t) return '<p class="empty">Select a trophy from the checklist or the roadmap to read its guide.</p>';
  const masked = isMasked(t, state);
  const earned = isEarned(state, t.id);
  let html = '<div class="detail-head"><h3>' + esc(displayName(t, state)) + '</h3>' + gradeChip(t.grade)
    + '<span class="chip kind-chip">' + esc(kindLabel(t.kind)) + '</span><span class="chip stage-chip">Stage S' + t.stage + '</span>' + flagChips(t) + '</div>'
    + '<p class="detail-desc">' + esc(displayDesc(t, state)) + '</p>';
  if (masked) {
    html += '<p class="detail-masked">Spoilers are hidden. This is a hidden trophy — tick it as earned (or switch spoilers to Shown) to reveal its guide.</p>';
    return html;
  }
  html += '<p class="detail-guide">' + esc(t.guide) + '</p>';
  if (t.missable) {
    html += '<aside class="missable-box"><h4>WHY IT CAN BE MISSED</h4><p>After the mission Down to Earth, Lucia meditates on the balcony of Jason’s house in Chapter 1 — and that moment disappears once Chapter 1 ends. PowerPyx calls it “Potentially 1” and OutputLog agrees: it counts toward the trophy, and it is still unconfirmed whether the trophy strictly needs it. Do it, and keep a Chapter 1 save until the trophy pops.</p><p class="box-src">Sources: PowerPyx [1], OutputLog [2], KeenGamer [3], EGamers [4], GTA-Zone [6]</p></aside>';
  }
  if (t.disagree) {
    html += '<aside class="disagree-box"><h4>SOURCES DISAGREE · BOTH VERSIONS SHOWN</h4><p>' + esc(t.disagree) + '</p></aside>';
  }
  if (t.watch) {
    html += '<aside class="watch-box"><h4>WATCH — TRIGGER UNCONFIRMED</h4><p>The trigger for this trophy is not yet confirmed by the sources. The guide above gives the best current lead; treat it as a lead, not a confirmed method, and re-check the sources as launch-era reports come in.</p></aside>';
  }
  html += '<ol class="steps">' + (t.steps || []).map((s) =>
    '<li>' + esc(s.text.replace(/\s*\[[0-9]\]/g, '')) + ' ' + (s.sources || []).map((sid) => '<a class="srcref" href="#sources" data-source="' + sid + '">[' + sid + ']</a>').join(' ') + '</li>').join('') + '</ol>';
  if (t.count) {
    const v = counterValue(state, t.id);
    const pct = Math.round((v / t.count.target) * 100);
    html += '<div class="counter" data-counter="' + t.id + '"><span class="counter-label">Your count</span>'
      + '<button data-dec="' + t.id + '" aria-label="Decrease count">−</button>'
      + '<span class="counter-value">' + v + ' / ' + t.count.target + ' ' + esc(t.count.unit) + '</span>'
      + '<button data-inc="' + t.id + '" aria-label="Increase count">+</button>'
      + '<div class="counter-bar"><div class="counter-fill" style="width:' + pct + '%"></div></div>'
      + '<span class="counter-hint">' + (v >= t.count.target ? 'Target reached — tick the trophy above when it pops in-game.' : 'Step: ±' + t.count.step + ' ' + esc(t.count.unit) + ' per tap.') + '</span></div>';
  }
  html += '<p class="detail-sources">Sources for this guide: ' + (t.sources || []).map((sid) => '<a href="#sources" data-source="' + sid + '">' + esc(sourceName(sid)) + ' [' + sid + ']</a>').join(' · ') + '</p>';
  html += '<button class="tick-big" data-tick="' + t.id + '">' + (earned ? '✓ Earned — tap to unmark' : 'Mark as earned') + '</button>';
  return html;
}

export function renderSources(trophies) {
  const a = computeAudit(trophies);
  return SOURCES.map((s) => {
    const n = a.citedBy.get(s.id) || 0;
    return '<div class="source-row"><span class="source-id">[' + s.id + ']</span>'
      + '<span class="source-name">' + esc(s.name) + '</span>'
      + '<span class="source-note">' + esc(s.note) + '</span>'
      + '<span class="source-cited">cited by ' + n + ' of 55 guides</span>'
      + '<a class="source-url" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.url.replace('https://', '')) + '</a></div>';
  }).join('') + '<p class="sources-foot">All 7 sources read ' + SOURCES_READ_DATE + '. Guide text is written in this entry’s own words; sources are cited, never copied. Official trophy names, descriptions and grades are shown as PlayStation publishes them.</p>';
}

export function renderMissableAudit() {
  return MISSABLE_AUDIT.map((row) =>
    '<div class="audit-row"><span class="chip ' + (row.verdict === 'CLEARED' ? 'flag-cleared' : 'flag-watch') + '">' + row.verdict + '</span>'
    + '<span class="audit-row-name">' + esc(row.name) + '</span>'
    + '<span class="audit-row-why">' + esc(row.why) + '</span>'
    + '<span class="audit-row-src">' + row.sources.map((sid) => '[' + sid + ']').join(' ') + '</span></div>').join('')
    + '<p class="audit-foot">Verdict: 1 possibly missable trophy (Positive Mental Attitude), 3 do-early, 3 on watch. No other trophy has a closing window in any source read ' + SOURCES_READ_DATE + '.</p>';
}
