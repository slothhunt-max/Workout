function renderHistoryTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-history';

  let currentView = 'calendar';
  let selectedHistoryItem = null;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  const formatRest = (seconds) => {
    if (!seconds) return '-';
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const renderDetailTable = (historyArray) => {
    const history = historyArray;
    if (history.length === 0) return '';

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
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <button id="btn-back-calendar" class="btn btn-secondary" style="width: auto; padding: 8px 16px; margin-right: 16px;">&larr; 달력으로</button>
          <h2 style="margin: 0; font-size: 1.25rem;">기록 상세</h2>
        </div>
        <div style="overflow-x: auto; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color);">
          <table style="width: max-content; border-collapse: collapse; text-align: center; font-size: 0.85rem;">
            <thead>
              <tr style="background: var(--bg-color); border-bottom: 3px solid var(--border-color);">
                <th colspan="2" style="padding: 12px 8px; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 10;">일자</th>
                ${history.map(h => {
                  let d = h.date.replace(/\.\s/g, '/').replace(/\./g, '');
                  if (d.length <= 5) d = new Date().getFullYear() + '/' + d;
                  return `<th colspan="2" style="padding: 12px 4px; border-right: 1px solid var(--border-color); min-width: 90px;">${d}</th>`;
                }).join('')}
              </tr>
              <tr style="background: var(--bg-color); border-bottom: 3px solid var(--border-color);">
                <th colspan="2" style="padding: 8px; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 10;">대분류</th>
                ${history.map(h => `<th colspan="2" style="padding: 8px 4px; border-right: 1px solid var(--border-color); color: var(--primary-color); white-space: pre-wrap; word-break: keep-all; line-height: 1.2;">${h.routineName}</th>`).join('')}
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
        <tr style="border-top: 3px solid var(--border-color);">
          <th rowspan="${rowSpan}" style="padding: 8px 0; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--card-bg); z-index: 5; width: 40px; min-width: 40px; max-width: 40px; box-sizing: border-box; text-align: center; vertical-align: middle;"><div style="writing-mode: vertical-rl; text-orientation: upright; letter-spacing: 4px; margin: 0 auto; display: inline-block;">${title}</div></th>
          <th style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 40px; background: var(--card-bg); z-index: 5; white-space: nowrap;">운동 종류</th>
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
            <th style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 40px; background: var(--card-bg); z-index: 5; font-weight: normal; white-space: nowrap;">${rest.label}</th>
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
          html += `<th rowspan="2" style="padding: 0 8px; border-right: 3px solid var(--border-color); ${thBorderBottom} position: sticky; left: 40px; background: var(--card-bg); z-index: 5; font-weight: normal; white-space: nowrap; vertical-align: middle;">SET ${s + 1}</th>`;
        }
        
        history.map(h => {
          if (h_idx === 0) {
            html += `<td rowspan="1" style="width: 24px; font-size: 9px; padding: 2px; color: var(--text-secondary); border-right: 1px dotted var(--border-color); border-bottom: 1px dotted var(--border-color); vertical-align: top; text-align: center;">변칙</td>`;
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
              html += `<td rowspan="2" style="padding: 0 8px; border-right: 1px solid var(--border-color); ${tdBorderBottom} vertical-align: middle; min-width: 60px;">${weightStr}${rec.reps}회</td>`;
            } else {
              html += `<td rowspan="2" style="padding: 0 8px; border-right: 1px solid var(--border-color); ${tdBorderBottom} color: var(--border-color); vertical-align: middle; min-width: 60px;">-</td>`;
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
    return html;
  };

  const renderCalendar = (history) => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let html = `
      <div style="padding: 16px; padding-bottom: 80px; display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; justify-content: space-between; width: 100%; max-width: 600px; align-items: center; margin-bottom: 20px;">
          <button id="cal-prev" class="btn btn-secondary" style="width: 40px; height: 40px; padding: 0;">&lt;</button>
          <h2 style="margin: 0; font-size: 1.25rem;">${currentYear}년 ${currentMonth + 1}월</h2>
          <button id="cal-next" class="btn btn-secondary" style="width: 40px; height: 40px; padding: 0;">&gt;</button>
        </div>
        
        <div style="width: 100%; max-width: 600px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">
          <div style="font-weight: bold; padding: 8px 0; color: var(--danger-color);">일</div>
          <div style="font-weight: bold; padding: 8px 0;">월</div>
          <div style="font-weight: bold; padding: 8px 0;">화</div>
          <div style="font-weight: bold; padding: 8px 0;">수</div>
          <div style="font-weight: bold; padding: 8px 0;">목</div>
          <div style="font-weight: bold; padding: 8px 0;">금</div>
          <div style="font-weight: bold; padding: 8px 0; color: var(--primary-color);">토</div>
    `;

    for (let i = 0; i < firstDay; i++) {
      html += `<div style="padding: 8px;"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}/${String(currentMonth + 1).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
      
      const dayHistoryItems = history.filter(h => {
        let hd = h.date.replace(/\.\s/g, '/').replace(/\./g, '');
        if (hd.length <= 5) hd = new Date().getFullYear() + '/' + hd;
        return hd === dateStr;
      });

      const todayStr = `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      let bg = 'var(--card-bg)';
      let border = '1px solid var(--border-color)';
      let cursor = 'default';
      let content = `<span style="font-weight: ${isToday ? 'bold' : 'normal'}; margin-bottom: 4px; ${isToday ? 'color: var(--primary-color);' : ''}">${d}</span>`;
      let historyIdxAttr = '';

      if (dayHistoryItems.length > 0) {
        bg = 'var(--bg-color)';
        border = '2px solid var(--primary-color)';
        cursor = 'pointer';
        
        const hItem = dayHistoryItems[dayHistoryItems.length - 1]; // Use last workout if multiple
        const hIdx = history.indexOf(hItem);
        historyIdxAttr = `data-history-idx="${hIdx}"`;
        
        let routinesHtml = '';
        dayHistoryItems.forEach(item => {
           routinesHtml += `<span style="font-size: 0.7rem; color: var(--primary-color); word-break: keep-all; line-height: 1.1; margin-top: 2px;">${item.routineName}</span>`;
        });

        content += `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">${routinesHtml}</div>`;
      }

      html += `
        <div class="cal-day" ${historyIdxAttr} style="border: ${border}; border-radius: 8px; padding: 4px; min-height: 80px; display: flex; flex-direction: column; align-items: center; cursor: ${cursor}; background: ${bg}; transition: all 0.2s;">
          ${content}
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
    return html;
  };

  const renderContent = (state) => {
    const history = state.history || [];
    
    if (currentView === 'calendar') {
      container.innerHTML = renderCalendar(history);
      
      const btnPrev = container.querySelector('#cal-prev');
      const btnNext = container.querySelector('#cal-next');
      
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          currentMonth--;
          if (currentMonth < 0) { currentMonth = 11; currentYear--; }
          renderContent(state);
        });
      }
      
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          currentMonth++;
          if (currentMonth > 11) { currentMonth = 0; currentYear++; }
          renderContent(state);
        });
      }

      container.querySelectorAll('.cal-day').forEach(el => {
        if (el.dataset.historyIdx !== undefined && el.dataset.historyIdx !== '') {
          el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.historyIdx, 10);
            selectedHistoryItem = history[idx];
            currentView = 'detail';
            renderContent(state);
          });
        }
      });
      
    } else if (currentView === 'detail' && selectedHistoryItem) {
      container.innerHTML = renderDetailTable([selectedHistoryItem]);
      
      const btnBack = container.querySelector('#btn-back-calendar');
      if (btnBack) {
        btnBack.addEventListener('click', () => {
          currentView = 'calendar';
          selectedHistoryItem = null;
          renderContent(state);
        });
      }
    }
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
