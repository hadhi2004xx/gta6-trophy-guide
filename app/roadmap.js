// Roadmap renderer for the Leonida 100% guide: turns the six stages in
// trophies.json into stage cards, masking hidden trophy names while the
// spoiler setting is on and counting each stage's earned trophies.
const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  exploration: 'Exploration',
  money: 'Money',
  unconfirmed: 'Unconfirmed',
  platinum: 'Platinum',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}

export function renderRoadmap(doc, isEarned, spoilersHidden) {
  const stagesEl = document.getElementById('stages');
  const byId = new Map(doc.trophies.map((t) => [t.id, t]));
  stagesEl.replaceChildren();
  for (const stage of doc.roadmap) {
    const li = document.createElement('li');
    li.className = 'stage';
    const num = document.createElement('p');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage} of ${doc.roadmap.length}`;
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const note = document.createElement('p');
    note.textContent = stage.note;
    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    let done = 0;
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const earned = isEarned(t.name);
      if (earned) done += 1;
      const row = document.createElement('li');
      const label = document.createElement('span');
      const masked = t.hidden && spoilersHidden() && !earned;
      label.textContent = masked ? 'Hidden trophy' : t.name;
      if (earned) label.classList.add('done');
      const count = document.createElement('span');
      count.className = 'stage-count';
      count.textContent = earned ? 'earned' : t.grade;
      row.append(label, count);
      list.append(row);
    }
    const summary = document.createElement('p');
    summary.className = 'stage-count';
    summary.textContent = `${done} of ${stage.trophies.length} earned in this stage`;
    li.append(num, title, note, list, summary);
    stagesEl.append(li);
  }
}
