// Roadmap renderer for the Leonida 100% guide: turns the six stages in
// trophies.json into a timeline of stage cards, masking hidden trophy names
// while the spoiler setting is on and counting each stage's earned trophies.
// A stage card shows its chapter range, its trophy count, the trophies it
// holds, and a flag on any missable or do-early step inside it.
import { trophiesByIds } from './data.js';
import { earnedCountFor } from './tracker.js';

export function stageTrophies(doc, stage) {
  return trophiesByIds(doc, stage.trophies);
}

export function stageEarnedCount(doc, stage, earnedSet) {
  return earnedCountFor(stageTrophies(doc, stage), earnedSet);
}

export function stageFlagFor(trophy) {
  if (trophy.missable) return 'missable';
  if (trophy.timeSensitive) return 'do early';
  return null;
}

export function renderRoadmap(doc, isEarned, spoilersHidden) {
  const stagesEl = document.getElementById('stages');
  const earnedSet = new Set(doc.trophies.filter((t) => isEarned(t.name)).map((t) => t.name));
  stagesEl.replaceChildren();
  for (const stage of doc.roadmap) {
    stagesEl.append(renderStageCard(doc, stage, earnedSet, spoilersHidden));
  }
}

// Gated steps first: a missable trophy, then a do-early one, then the rest
// in list order — so the flag a reader must act on is the first thing they
// see in the stage, not buried at the end of its names.
export function sortStageTrophies(trophies) {
  const rank = (t) => (t.missable ? 0 : t.timeSensitive ? 1 : 2);
  return [...trophies].sort((a, b) => rank(a) - rank(b) || a.id - b.id);
}

export function renderStageCard(doc, stage, earnedSet, spoilersHidden) {
  const trophies = sortStageTrophies(stageTrophies(doc, stage));
  const done = earnedCountFor(trophies, earnedSet);
  const isEarned = (name) => earnedSet.has(name);
  const li = document.createElement('li');
  li.className = 'stage';

  const num = document.createElement('p');
  num.className = 'stage-num';
  const big = document.createElement('strong');
  big.textContent = String(stage.stage).padStart(2, '0');
  num.append(big, document.createTextNode(`Stage ${stage.stage} of ${doc.roadmap.length}`));

  const title = document.createElement('h3');
  title.textContent = stage.title;
  const sub = document.createElement('p');
  sub.className = 'stage-sub';
  sub.textContent = `${stage.chapters} · ${trophies.length} trophies`;
  const note = document.createElement('p');
  note.className = 'stage-note';
  note.textContent = stage.note;
  const names = document.createElement('p');
  names.className = 'stage-trophies';
  appendStageNames(names, trophies, isEarned, spoilersHidden);

  const summary = document.createElement('p');
  summary.className = 'stage-count';
  const strong = document.createElement('strong');
  strong.textContent = `${done}/${trophies.length}`;
  summary.append(strong, document.createTextNode(' earned in this stage'));
  li.append(num, title, sub, note, names, summary);
  return li;
}

// Lists a stage's trophies inline, separated by middots. Consecutive
// spoiler-masked trophies collapse into one "Hidden trophy ×N" span, so a
// stage of hidden story trophies reads as masking at work instead of the
// same label twelve times — and any missable or do-early flag inside the
// run is still shown on the group, so a gated step never hides behind the
// mask. Earned hidden trophies show their real names.
export function appendStageNames(namesEl, trophies, isEarned, spoilersHidden) {
  let hiddenRun = 0;
  let hiddenRunFlag = null;
  const flushHiddenRun = () => {
    if (hiddenRun === 0) return;
    const span = document.createElement('span');
    span.className = 't-name';
    span.textContent = hiddenRun === 1 ? 'Hidden trophy' : `Hidden trophy ×${hiddenRun}`;
    namesEl.append(span);
    if (hiddenRunFlag) {
      const flagEl = document.createElement('span');
      flagEl.className = 'flag';
      flagEl.textContent = hiddenRunFlag;
      namesEl.append(flagEl);
    }
    namesEl.append(document.createTextNode(' · '));
    hiddenRun = 0;
    hiddenRunFlag = null;
  };
  for (const t of trophies) {
    const earned = isEarned(t.name);
    if (t.hidden && spoilersHidden() && !earned) {
      hiddenRun += 1;
      const flag = stageFlagFor(t);
      if (flag && !hiddenRunFlag) hiddenRunFlag = flag;
      continue;
    }
    flushHiddenRun();
    const span = document.createElement('span');
    span.className = 't-name' + (earned ? ' done' : '');
    span.textContent = t.name;
    namesEl.append(span);
    const flag = stageFlagFor(t);
    if (flag) {
      const flagEl = document.createElement('span');
      flagEl.className = 'flag';
      flagEl.textContent = flag;
      namesEl.append(flagEl);
    }
    namesEl.append(document.createTextNode(' · '));
  }
  flushHiddenRun();
  if (namesEl.lastChild) namesEl.removeChild(namesEl.lastChild);
}
