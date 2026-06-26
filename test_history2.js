const formatRest = (seconds) => {
  if (!seconds) return '-';
  return ${Math.floor(seconds / 60)}m s;
};

const history = [{
  id: 123,
  date: '06. 27.',
  routineName: 'Chest',
  records: [{ exerciseId: '1', exerciseIndex: 0, setIndex: 0, reps: 10, weight: 60, restType: 'special' }],
  exercisesSnapshot: [{ id: '1', name: 'Bench Press', basicRest: 60, specialRest: 90, maxRest: 120, interRest: 120 }]
}];

let maxExercises = 0;
history.forEach(h => {
  let sessionMaxExIndex = -1;
  h.records.forEach(r => {
    if (r.exerciseIndex > sessionMaxExIndex) sessionMaxExIndex = r.exerciseIndex;
  });
  if (sessionMaxExIndex + 1 > maxExercises) maxExercises = sessionMaxExIndex + 1;
});

let html = `;
for (let exIdx = 0; exIdx < maxExercises; exIdx++) {
  let maxSets = 0;
  history.forEach(h => {
    const exRecords = h.records.filter(r => r.exerciseIndex === exIdx);
    if (exRecords.length > maxSets) maxSets = exRecords.length;
  });

  if (maxSets === 0) continue;

  for (let s = 0; s < maxSets; s++) {
    const isLastSetRow = (s === maxSets - 1);
    const borderBottom = isLastSetRow ? '' : 'border-bottom: 1px solid var(--border-color);';
    
    html += history.map(h => {
      let d = h.date.replace(/\.\s/g, '/').replace(/\./g, '');
      if (d.length <= 5) d = new Date().getFullYear() + '/' + d;
      const rec = h.records.find(r => r.exerciseIndex === exIdx && r.setIndex === s);
      return rec ? rec.reps : '-';
    }).join('');
  }
}
console.log('Success!', html);
