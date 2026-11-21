// computeAudit — the numbers the audit strip and the Sources panel show. Every figure
// is counted from the data file and the saved progress, never hard-coded, so the strip
// cannot drift from the guide it describes.
export function computeAudit(data, state) {
  const trophies = data.trophies;
  const total = trophies.length;
  const earned = trophies.filter((t) => state.isEarned(t)).length;
  const guidesCited = trophies.filter((t) => Array.isArray(t.sources) && t.sources.length > 0).length;
  const steps = trophies.flatMap((t) => t.steps ?? []);
  const stepsCited = steps.filter((s) => Array.isArray(s.src) && s.src.length > 0).length;
  const missable = trophies.filter((t) => t.tier === 'missable').length;
  const doEarly = trophies.filter((t) => t.tier === 'do-early').length;
  const watch = trophies.filter((t) => t.tier === 'watch').length;
  const hidden = trophies.filter((t) => t.hidden).length;

  const gradeEarned = {};
  const gradeTotal = {};
  for (const t of trophies) {
    gradeTotal[t.grade] = (gradeTotal[t.grade] ?? 0) + 1;
    if (state.isEarned(t)) gradeEarned[t.grade] = (gradeEarned[t.grade] ?? 0) + 1;
  }

  const stageEarned = {};
  const stageTotal = {};
  for (const t of trophies) {
    stageTotal[t.stage] = (stageTotal[t.stage] ?? 0) + 1;
    if (state.isEarned(t)) stageEarned[t.stage] = (stageEarned[t.stage] ?? 0) + 1;
  }

  const sourceCitations = data.sources.map((s) => ({
    ...s,
    citedBy: trophies.filter((t) => (t.sources ?? []).includes(s.id)).length,
  }));

  const counterProgress = trophies
    .filter((t) => t.counter)
    .map((t) => ({ trophy: t, value: state.counterValue(t), target: t.counter.target }));

  return {
    total,
    earned,
    guidesCited,
    stepsTotal: steps.length,
    stepsCited,
    missable,
    doEarly,
    watch,
    hidden,
    gradeEarned,
    gradeTotal,
    stageEarned,
    stageTotal,
    sourceCitations,
    counterProgress,
  };
}

// auditStripLines — the four big statements of the cover strip, in display order.
export function auditStripLines(audit, sourceCount) {
  return [
    { big: audit.guidesCited + '/' + audit.total, small: 'guides cite a source' },
    { big: audit.stepsCited + '/' + audit.stepsTotal, small: 'steps cited' },
    { big: String(sourceCount), small: 'sources read 21 Nov 2026' },
    { big: String(audit.missable), small: 'missable verified' },
  ];
}
