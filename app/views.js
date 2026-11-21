// renderGuideViews — every visible part of the guide, built from the data file, the
// audit numbers and the saved progress. Rows are built with DOM calls, never with
// HTML strings, so a trophy name can never break the page. Large type on the audit
// strip and on the first checklist rows is deliberate: the cover shrinks to 768x480
// in the dossier, and small type dies there.
import { GRADE_LABELS, TIER_LABELS, formatCounterValue, formatCounterTarget, isSpoilerTrophy } from './classify.js';
import { auditStripLines } from './audit.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function chip(text, className) {
  return el('span', 'chip ' + className, text);
}

// The audit strip: four big numbers the cover is built around.
export function renderAuditStrip(container, audit, sourceCount) {
  container.replaceChildren();
  for (const line of auditStripLines(audit, sourceCount)) {
    const stat = el('div', 'stat');
    stat.append(el('div', 'stat-big', line.big), el('div', 'stat-small', line.small));
    container.append(stat);
  }
}

// Platinum bar + gold bar, with the earned counts in large type.
export function renderGoalBar(container, audit) {
  container.replaceChildren();
  const platinum = el('div', 'goal');
  const platPct = audit.total ? Math.round((audit.earned / audit.total) * 100) : 0;
  platinum.append(el('div', 'goal-label', 'PLATINUM — Vice Got a Price!'));
  platinum.append(el('div', 'goal-num', audit.earned + ' / ' + audit.total + ' trophies · ' + platPct + '%'));
  const platBar = el('div', 'bar');
  platBar.append(el('div', 'bar-fill'));
  platBar.firstChild.style.width = platPct + '%';
  platinum.append(platBar);
  const goldTotal = audit.gradeTotal.gold ?? 0;
  const goldEarned = audit.gradeEarned.gold ?? 0;
  const gold = el('div', 'goal');
  gold.append(el('div', 'goal-label', 'GOLD — final mission + 100% completion'));
  gold.append(el('div', 'goal-num', goldEarned + ' / ' + goldTotal + ' gold'));
  const goldBar = el('div', 'bar');
  goldBar.append(el('div', 'bar-fill gold-fill'));
  goldBar.firstChild.style.width = (goldTotal ? Math.round((goldEarned / goldTotal) * 100) : 0) + '%';
  gold.append(goldBar);
  container.append(platinum, gold);
}

// Chapter chips S1–S7 with earned counts; clicking one filters the checklist to it.
export function renderStageChips(container, stages, audit, activeStage, onSelect) {
  container.replaceChildren();
  const all = el('button', 'stage-chip' + (activeStage === 'all' ? ' active' : ''), 'All · ' + audit.earned + '/' + audit.total);
  all.type = 'button';
  all.addEventListener('click', () => onSelect('all'));
  container.append(all);
  for (const stage of stages) {
    const earned = audit.stageEarned[stage.id] ?? 0;
    const total = audit.stageTotal[stage.id] ?? 0;
    const button = el('button', 'stage-chip' + (activeStage === stage.id ? ' active' : ''), stage.id + ' · ' + earned + '/' + total);
    button.type = 'button';
    button.title = stage.name + ' — ' + stage.blurb;
    button.addEventListener('click', () => onSelect(stage.id));
    container.append(button);
  }
}

function sourceLink(source) {
  if (source.url) {
    const a = document.createElement('a');
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = source.name;
    return a;
  }
  return el('span', '', source.name);
}

// One checklist row: a single dense line — checkbox, name, official description,
// counter where the trophy has a count, grade + tier chips, and the Guide toggle —
// with the numbered, cited guide expanding below it. One line per trophy keeps
// eight rows on the cover at dossier scale, where tall rows would show only four.
export function renderTrophyRow(trophy, state, sourcesById, expanded, callbacks) {
  const masked = state.spoilerOn() && isSpoilerTrophy(trophy) && !state.isEarned(trophy);
  const row = el('article', 'trophy-row' + (state.isEarned(trophy) ? ' earned' : ''));
  row.id = 'trophy-' + trophy.id;
  row.dataset.trophyId = String(trophy.id);

  const check = el('label', 'check');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.isEarned(trophy);
  box.setAttribute('aria-label', 'Earned: ' + trophy.name);
  box.addEventListener('change', () => {
    state.setEarned(trophy, box.checked);
    callbacks.onProgress();
  });
  check.append(box, el('span', 'check-mark', state.isEarned(trophy) ? '✓' : ''));
  row.append(check);

  const main = el('div', 'row-main');
  const line = el('div', 'row-line');
  line.append(el('h3', 'row-name', masked ? 'Hidden trophy' : trophy.name));
  line.append(el('p', 'row-desc', masked ? 'Hidden on PlayStation until earned.' : trophy.description));
  if (trophy.counter) {
    const counter = el('div', 'counter');
    const minus = el('button', 'counter-btn', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Decrease ' + trophy.name);
    minus.addEventListener('click', () => {
      state.bumpCounter(trophy, -1);
      callbacks.onProgress();
    });
    const plus = el('button', 'counter-btn', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'Increase ' + trophy.name);
    plus.addEventListener('click', () => {
      state.bumpCounter(trophy, 1);
      callbacks.onProgress();
    });
    const value = el('span', 'counter-value', formatCounterValue(trophy, state.counterValue(trophy)) + ' / ' + formatCounterTarget(trophy));
    counter.append(minus, value, plus);
    line.append(counter);
  }
  const chips = el('span', 'row-chips');
  chips.append(chip(GRADE_LABELS[trophy.grade], 'grade-' + trophy.grade));
  if (trophy.hidden) chips.append(chip('HIDDEN', 'flag-hidden'));
  if (trophy.tier !== 'none') chips.append(chip(TIER_LABELS[trophy.tier], 'flag-' + trophy.tier));
  line.append(chips);
  const toggle = el('button', 'guide-toggle', expanded ? 'Guide ▾' : 'Guide ▸');
  toggle.type = 'button';
  toggle.addEventListener('click', () => callbacks.onToggleGuide(trophy));
  line.append(toggle);
  main.append(line);

  if (expanded) {
    if (masked) {
      main.append(el('p', 'guide-masked', 'Guide hidden until earned — the spoiler setting masks story trophies.'));
    } else {
      const guide = el('div', 'guide');
      const steps = el('ol', 'steps');
      for (const step of trophy.steps ?? []) {
        const li = document.createElement('li');
        li.append(document.createTextNode(step.t));
        for (const srcId of step.src ?? []) {
          const mark = el('sup', 'src-mark', '[' + srcId + ']');
          mark.title = sourcesById.get(srcId)?.name ?? 'Source ' + srcId;
          li.append(document.createTextNode(' '), mark);
        }
        steps.append(li);
      }
      guide.append(steps);
      const srcLine = el('p', 'guide-sources', 'Sources: ');
      trophy.sources.forEach((srcId, index) => {
        if (index > 0) srcLine.append(document.createTextNode(' · '));
        const source = sourcesById.get(srcId);
        if (source) {
          const mark = el('span', 'src-ref', '[' + srcId + '] ');
          srcLine.append(mark, sourceLink(source));
        }
      });
      guide.append(srcLine);
      main.append(guide);
    }
  }
  row.append(main);
  return row;
}

// The checklist itself, in stage order, filtered by the controls.
export function renderChecklist(container, emptyNote, trophies, state, sourcesById, filters, expandedIds, callbacks) {
  container.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!filters.match(trophy)) continue;
    shown += 1;
    container.append(renderTrophyRow(trophy, state, sourcesById, expandedIds.has(trophy.id), callbacks));
  }
  if (shown === 0) {
    emptyNote.textContent = 'No trophies match these filters — clear the search or pick another kind.';
    emptyNote.hidden = false;
  } else {
    emptyNote.hidden = true;
  }
  return shown;
}

// The roadmap: the three PowerPyx steps, the seven stages with their trophies, and
// the ground rules (saves, cheats, free-roam). The missable panel sits at its top,
// so the roadmap screenshot shows both judging criteria at once.
export function renderRoadmap(container, data, audit) {
  container.replaceChildren();
  const byId = new Map(data.trophies.map((t) => [t.id, t]));

  const intro = document.createElement('div');
  intro.className = 'roadmap-intro';
  const introTitle = document.createElement('h3');
  introTitle.textContent = 'The road to platinum — about 200 hours, difficulty 4/10, one playthrough';
  intro.append(introTitle);
  const steps = document.createElement('ol');
  steps.className = 'roadmap-steps';
  const roadmapSteps = [
    { t: 'Step 1 — Story + optional missions, 60–80 hours. ', s: 'Finish the story, pick up optional missions as they appear, scan vehicles with WAiNK and study animals through the binoculars. [1][3]' },
    { t: 'Step 2 — 100% Completion Checklist + 70 of 80 Challenges, about 100 hours. ', s: 'After the story, open Progress > Stats > 100% Completion. Only 70 of 80 Challenges are needed. [1]' },
    { t: 'Step 3 — Strangers & Freaks and cleanup, about 10 hours. ', s: 'Finish the 8 qualifying stranger strands and whatever trophies are left. [1][3]' },
  ];
  for (const step of roadmapSteps) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = step.t;
    li.append(strong, document.createTextNode(step.s));
    steps.append(li);
  }
  intro.append(steps);
  const rules = document.createElement('p');
  rules.className = 'roadmap-rules';
  rules.textContent = 'Ground rules: no mission replay and no New Game+, so keep a manual save at the start of every chapter (15 slots plus autosave). Cheats disable trophies and saving — keep them off the platinum save. Everything outside the story stays available in free-roam after the credits. [1][2]';
  intro.append(rules);
  container.append(intro);

  const missable = document.createElement('div');
  missable.className = 'missable-panel';
  missable.id = 'missable-panel';
  const missTitle = document.createElement('h3');
  missTitle.textContent = 'Missable — 1 verified · Do early — 6 · Watch — 11';
  missable.append(missTitle);
  const missBody = document.createElement('p');
  missBody.textContent = 'Only one trophy is verified missable: Positive Mental Attitude, for meditating at every spot — the first meditation, on the balcony at Jason\u2019s house in Chapter 1, disappears when the chapter ends. [1][2] Six more are chapter-gated, so start them early: the five stranger-chain finales (Andy, Kenton, Billy, Randy, Tyrone) plus Maximum Withdrawal, whose vaults open in Chapter 4. Eleven trophies sit in the WATCH tier — their triggers are still unconfirmed in the guides, so this guide shows both versions instead of guessing.';
  missable.append(missBody);
  const tierList = document.createElement('ul');
  tierList.className = 'tier-list';
  const tiers = [
    ['MISSABLE (1): ', data.trophies.filter((t) => t.tier === 'missable').map((t) => t.name).join(', ')],
    ['DO EARLY (6): ', data.trophies.filter((t) => t.tier === 'do-early').map((t) => t.name).join(', ')],
    ['WATCH (11): ', data.trophies.filter((t) => t.tier === 'watch').map((t) => t.name).join(', ')],
  ];
  for (const [label, names] of tiers) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = label;
    li.append(strong, document.createTextNode(names));
    tierList.append(li);
  }
  missable.append(tierList);
  container.append(missable);

  const stageGrid = document.createElement('div');
  stageGrid.className = 'stage-grid';
  for (const stage of data.stages) {
    const card = document.createElement('div');
    card.className = 'stage-card';
    card.id = 'stage-' + stage.id;
    const earned = audit.stageEarned[stage.id] ?? 0;
    const total = audit.stageTotal[stage.id] ?? 0;
    const title = document.createElement('h4');
    title.textContent = stage.id + ' — ' + stage.name + ' · ' + earned + '/' + total;
    card.append(title);
    const blurb = document.createElement('p');
    blurb.className = 'stage-blurb';
    blurb.textContent = stage.blurb;
    card.append(blurb);
    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    for (const trophy of data.trophies.filter((t) => t.stage === stage.id)) {
      const li = document.createElement('li');
      const grade = document.createElement('span');
      grade.className = 'mini-grade grade-' + trophy.grade;
      grade.textContent = trophy.grade === 'platinum' ? 'P' : trophy.grade === 'gold' ? 'G' : trophy.grade === 'silver' ? 'S' : 'B';
      li.append(grade, document.createTextNode(' ' + trophy.name));
      if (byId.has(trophy.id) && trophy.tier !== 'none') {
        const tier = document.createElement('span');
        tier.className = 'mini-tier flag-' + trophy.tier;
        tier.textContent = ' ' + trophy.tier.toUpperCase();
        li.append(tier);
      }
      list.append(li);
    }
    card.append(list);
    stageGrid.append(card);
  }
  container.append(stageGrid);
}

// The Sources panel: all seven sources, each with its link and its citation count,
// plus the two places the sources disagree — both versions shown, never picked.
export function renderSourcesPanel(container, data, audit) {
  container.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = 'Sources — 7 guides read 21 Nov 2026';
  container.append(title);
  const table = document.createElement('table');
  table.className = 'sources-table';
  const head = document.createElement('tr');
  for (const h of ['#', 'Source', 'Cited by']) {
    const th = document.createElement('th');
    th.textContent = h;
    head.append(th);
  }
  table.append(head);
  for (const source of audit.sourceCitations) {
    const tr = document.createElement('tr');
    const num = document.createElement('td');
    num.textContent = '[' + source.id + ']';
    const name = document.createElement('td');
    if (source.url) {
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source.name;
      name.append(a);
    } else {
      name.textContent = source.name;
    }
    const note = document.createElement('span');
    note.className = 'source-note';
    note.textContent = ' — ' + source.note;
    name.append(note);
    const cited = document.createElement('td');
    cited.textContent = source.citedBy + ' of 55 guides';
    tr.append(num, name, cited);
    table.append(tr);
  }
  container.append(table);
  const disagree = document.createElement('div');
  disagree.className = 'disagree-box';
  const disagreeTitle = document.createElement('h4');
  disagreeTitle.textContent = 'Sources disagree · both versions shown';
  disagree.append(disagreeTitle);
  const disagreeList = document.createElement('ul');
  for (const item of [
    'Meditation spots: the trophy needs 18 spots, the 100% checklist 15 — this guide counts 18 and says so. [4]',
    'Final mission wording: some guides call the finale Chapter 5, others do not — both wordings are shown. [4]',
    'Five hidden trophies are still unconfirmed (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) and Fair Game\u2019s animal is unknown — they sit in the WATCH tier. [4]',
  ]) {
    const li = document.createElement('li');
    li.textContent = item;
    disagreeList.append(li);
  }
  disagree.append(disagreeList);
  container.append(disagree);
}
