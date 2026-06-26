const formatRest = (seconds) => {
  if (!seconds) return '-';
  return ${Math.floor(seconds / 60)}m s;
};

const state = {
  history: [{
    id: 123,
    date: '06. 27.',
    routineName: 'Chest',
    records: [{ exerciseId: '1', exerciseIndex: 0, setIndex: 0, reps: 10, weight: 60 }],
    exercisesSnapshot: [{ id: '1', name: 'Bench Press', basicRest: 60, specialRest: 90, maxRest: 120 }]
  }]
};

const history = state.history || [];
let maxExercises = 0;
history.forEach(h => {
  let sessionMaxExIndex = -1;
  h.records.forEach(r => {
    if (r.exerciseIndex > sessionMaxExIndex) sessionMaxExIndex = r.exerciseIndex;
  });
  if (sessionMaxExIndex + 1 > maxExercises) maxExercises = sessionMaxExIndex + 1;
});

let html = '';
for (let exIdx = 0; exIdx < maxExercises; exIdx++) {
  const isMain = exIdx === 0;
  const title = isMain ? 'Main' : Aux ;
  
  let maxSets = 0;
  history.forEach(h => {
    const exRecords = h.records.filter(r => r.exerciseIndex === exIdx);
    if (exRecords.length > maxSets) maxSets = exRecords.length;
  });

  if (maxSets === 0) continue;

  html += history.map(h => {
    const exRec = h.records.find(r => r.exerciseIndex === exIdx);
    const exName = exRec ? (h.exercisesSnapshot?.find(e => e.id === exRec.exerciseId)?.name || 'Unknown') : '-';
    return exName;
  }).join('');
}
console.log('Success:', html);
