function renderHistoryTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-history';

  const formatRest = (seconds) => {
    if (!seconds) return '-';
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const renderContent = (state) => {
    const history = state.history || [];
    if (history.length === 0) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary); margin-top: 50px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
          <p>아직 저장된 운동 기록이 없습니다.</p>
          <p style="font-size: 0.85rem; margin-top: 8px;">운동을 완료하면 이곳에 일지가 기록됩니다.</p>
        </div>
      `;
      return;
    }

    let maxExercises = 0;
    history.forEach(h => {
      let sessionMaxExIndex = -1;
      h.records.forEach(r => {
        if (r.exerciseIndex > sessionMaxExIndex) sessionMaxExIndex = r.exerciseIndex;
      });
      if (sessionMaxExIndex + 1 > maxExercises) maxExercises = sessionMaxExIndex + 1;
    });

    let html = `
      <div style="padding: 16px; padding-bottom: 80px;">
        <h2 style="margin-bottom: 16px; font-size: 1.25rem;">운동 기록 일지</h2>
        <div style="overflow-x: auto; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color);">
          <table style="width: 100%; border-collapse: collapse; min-width: max-content; text-align: center; font-size: 0.85rem;">
            <thead>
              <tr style="background: var(--bg-color); border-bottom: 2px solid var(--border-color);">
                <th colspan="2" style="padding: 12px 8px; border-right: 2px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 10;">일자</th>
                ${history.map(h => {
                  let d = h.date.replace(/\.\s/g, '/').replace(/\./g, '');
                  if (d.length <= 5) d = new Date().getFullYear() + '/' + d;
                  return `<th colspan="2" style="padding: 12px 16px; border-right: 1px solid var(--border-color); min-width: 140px;">${d}</th>`;
                }).join('')}
              </tr>
              <tr style="background: var(--bg-color); border-bottom: 2px solid var(--border-color);">
                <th colspan="2" style="padding: 8px; border-right: 2px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 10;">대분류</th>
                ${history.map(h => `<th colspan="2" style="padding: 8px 16px; border-right: 1px solid var(--border-color); color: var(--primary-color);">${h.routineName}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
    `;

    for (let exIdx = 0; exIdx < maxExercises; exIdx++) {
      const isMain = exIdx === 0;
      const title = isMain ? '주운동' : `보조운동 ${exIdx}`;
      
      let maxSets = 0;
      history.forEach(h => {
        const exRecords = h.records.filter(r => r.exerciseIndex === exIdx);
        if (exRecords.length > maxSets) maxSets = exRecords.length;
      });

      if (maxSets === 0) continue;

      const rowSpan = 5 + maxSets * 2; 

      html += `
        <tr style="border-top: 2px solid var(--border-color);">
          <th rowspan="${rowSpan}" style="padding: 8px; border-right: 2px solid var(--border-color); position: sticky; left: 0; background: var(--card-bg); z-index: 5; writing-mode: vertical-rl; text-orientation: upright; letter-spacing: 4px;">${title}</th>
          <th style="padding: 8px; border-right: 2px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 60px; background: var(--card-bg); z-index: 5; white-space: nowrap;">운동 종류</th>
          ${history.map(h => {
            const exRec = h.records.find(r => r.exerciseIndex === exIdx);
            const exName = exRec ? (h.exercisesSnapshot?.find(e => e.id === exRec.exerciseId)?.name || 'Unknown') : '-';
            return `<td colspan="2" style="padding: 8px; border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); font-weight: bold;">${exName}</td>`;
          }).join('')}
        </tr>
      `;

      const rests = [
        { label: '기본 휴식', key: 'basicRest' },
        { label: '특수 휴식', key: 'specialRest' },
        { label: '최대 휴식', key: 'maxRest' },
        { label: '종목간 휴식', key: 'interRest' }
      ];

      rests.forEach(rest => {
        html += `
          <tr>
            <th style="padding: 8px; border-right: 2px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 60px; background: var(--card-bg); z-index: 5; font-weight: normal; white-space: nowrap;">${rest.label}</th>
            ${history.map(h => {
              const exRec = h.records.find(r => r.exerciseIndex === exIdx);
              const ex = exRec ? h.exercisesSnapshot?.find(e => e.id === exRec.exerciseId) : null;
              return `<td colspan="2" style="padding: 8px; border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">${ex ? formatRest(ex[rest.key]) : '-'}</td>`;
            }).join('')}
          </tr>
        `;
      });

      const totalHalfRows = maxSets * 2;
      for (let h_idx = 0; h_idx < totalHalfRows; h_idx++) {
        const s = Math.floor(h_idx / 2);
        const isTopHalf = (h_idx % 2 === 0);
        
        html += `<tr style="height: 18px;">`;
        
        if (isTopHalf) {
          const thBorderBottom = (s === maxSets - 1) ? '' : 'border-bottom: 1px solid var(--border-color);';
          html += `<th rowspan="2" style="padding: 0 8px; border-right: 2px solid var(--border-color); ${thBorderBottom} position: sticky; left: 60px; background: var(--card-bg); z-index: 5; font-weight: normal; white-space: nowrap; vertical-align: middle;">SET ${s + 1}</th>`;
        }
        
        history.map(h => {
          if (h_idx === 0) {
            html += `<td rowspan="1" style="width: 24px; font-size: 9px; padding: 2px; color: var(--text-secondary); border-right: 1px dotted var(--border-color); border-bottom: none; vertical-align: top; text-align: center;">변칙</td>`;
          } else if (h_idx === totalHalfRows - 1) {
            html += `<td rowspan="1" style="width: 24px; font-size: 9px; padding: 2px; color: var(--text-secondary); border-right: 1px dotted var(--border-color); border-bottom: 1px solid var(--border-color); vertical-align: bottom; text-align: center;">여부</td>`;
          } else if (!isTopHalf) {
            const rec = h.records.find(r => r.exerciseIndex === exIdx && r.setIndex === s);
            let restLabel = '';
            if (rec) {
              if (rec.restType === 'special') restLabel = '특수';
              else if (rec.restType === 'max') restLabel = '최대';
            }
            const labelColor = restLabel ? 'var(--primary-color)' : 'transparent';
            const restBorderBottom = (h_idx === totalHalfRows - 2) ? 'border-bottom: none;' : 'border-bottom: 1px dotted var(--border-color);';
            
            html += `<td rowspan="2" style="width: 24px; padding: 0 2px; font-weight: bold; font-size: 10px; color: ${labelColor}; border-right: 1px dotted var(--border-color); ${restBorderBottom} vertical-align: middle; text-align: center;">${restLabel || '-'}</td>`;
          }
          
          if (isTopHalf) {
            const rec = h.records.find(r => r.exerciseIndex === exIdx && r.setIndex === s);
            const tdBorderBottom = (s === maxSets - 1) ? '' : 'border-bottom: 1px solid var(--border-color);';
            
            if (rec) {
              const weightStr = rec.weight ? `${rec.weight}kg ` : '';
              html += `<td rowspan="2" style="padding: 0 8px; border-right: 1px solid var(--border-color); ${tdBorderBottom} vertical-align: middle;">${weightStr}${rec.reps}회</td>`;
            } else {
              html += `<td rowspan="2" style="padding: 0 8px; border-right: 1px solid var(--border-color); ${tdBorderBottom} color: var(--border-color); vertical-align: middle;">-</td>`;
            }
          }
        });
        
        html += `</tr>`;
      }
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  };

  store.subscribe((state) => {
    if (container.classList.contains('active')) {
      renderContent(state);
    }
  });
  
  setTimeout(() => renderContent(store.state), 0);
  container.forceRender = () => renderContent(store.state);
  return container;
}
