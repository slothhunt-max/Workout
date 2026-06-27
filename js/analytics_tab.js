function renderAnalyticsTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-analytics';

  let currentView = 'list'; // 'list' or 'chart'
  let selectedExerciseGroup = null;
  let displaySetCount = 5;
  try {
    const savedCount = localStorage.getItem('workout_displaySetCount');
    if (savedCount && savedCount !== 'undefined') {
      displaySetCount = parseInt(savedCount, 10) || 5;
    }
  } catch(e) {}
  
  // store.state.mappings = { 'Alias': 'PrimaryName' }
  if (!store.state.mappings) store.state.mappings = {};

  let chartInstance = null;

  const getMappedName = (name) => {
    return store.state.mappings[name] || name;
  };

  const getAllUniqueExercises = () => {
    const names = new Set();
    if (store.state.history) {
      store.state.history.forEach(h => {
        if (h.records) {
          h.records.forEach(r => {
            const exName = h.exercisesSnapshot?.find(e => e.id === r.exerciseId)?.name;
            if (exName) names.add(exName);
          });
        }
        // Also check imported dummy records without exerciseId
        if (h.importedRecords) {
          h.importedRecords.forEach(r => {
            if (r.name) names.add(r.name);
          });
        }
      });
    }
    return Array.from(names);
  };

  const getExerciseData = (primaryName) => {
    const data = [];
    if (!store.state.history) return data;

    store.state.history.forEach(h => {
      let dObj = new Date(h.date.replace(/\./g, '/').replace(/\-/g, '/'));
      let dStr = isNaN(dObj.getTime()) ? h.date : `${dObj.getFullYear()}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${String(dObj.getDate()).padStart(2, '0')}`;
      
      let sets = [];
      
      // Native records
      if (h.records) {
        h.records.forEach(r => {
          const exName = h.exercisesSnapshot?.find(e => e.id === r.exerciseId)?.name;
          if (exName && getMappedName(exName) === primaryName) {
            sets.push(r);
          }
        });
      }

      // Imported records
      if (h.importedRecords) {
        h.importedRecords.forEach(r => {
          if (getMappedName(r.name) === primaryName) {
            sets = sets.concat(r.sets);
          }
        });
      }

      if (sets.length > 0) {
        // Sort sets
        sets.sort((a, b) => (a.setIndex || 0) - (b.setIndex || 0));
        
        let totalWeight = 0;
        let totalReps = 0;
        let volume = 0;
        let validSetsCount = 0;

        sets.forEach(s => {
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps, 10) || 0;
          if (w > 0 || r > 0) {
            totalWeight += w;
            totalReps += r;
            volume += (w * r);
            validSetsCount++;
          }
        });

        const avgWeight = validSetsCount > 0 ? (totalWeight / validSetsCount) : 0;

        data.push({
          date: dStr,
          timestamp: dObj.getTime(),
          avgWeight: avgWeight,
          totalReps: totalReps,
          volume: volume,
          sets: sets
        });
      }
    });

    data.sort((a, b) => a.timestamp - b.timestamp);
    return data;
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "날짜,운동명,평균중량(kg),1세트,2세트,3세트,4세트,5세트\n";

    const uniqueNames = getAllUniqueExercises();
    
    uniqueNames.forEach(exName => {
      const pName = getMappedName(exName);
      const exData = getExerciseData(pName);
      exData.forEach(d => {
        let row = `${d.date},${pName},${d.avgWeight.toFixed(1)}`;
        for (let i = 0; i < 5; i++) {
          row += `,${d.sets[i] ? d.sets[i].reps : ''}`;
        }
        csvContent += row + "\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "workout_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = (file) => {
    const reader = new FileReader();
    // Default to EUC-KR for Korean Excel CSV, but standard FileReader without encoding param uses UTF-8. 
    // We'll try to read as UTF-8 first. Excel Korea might save as ANSI (euc-kr).
    reader.onload = (e) => {
      let text = e.target.result;
      const lines = text.split(/\r?\n/);
      
      let importedCount = 0;
      let firstDataLine = null;
      
      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // skip header or empty
        
        // Handle comma or tab, ignoring spaces after delimiter
        // Also strip quotes if any
        let cols = line.split(/,|\t/).map(c => c.trim().replace(/^"|"$/g, ''));
        
        if (!firstDataLine) firstDataLine = cols; // For debugging

        if (cols.length >= 4) {
          const date = cols[0];
          const name = cols[1];
          const weight = parseFloat(cols[2]) || 0;
          
          const sets = [];
          for (let i = 3; i < cols.length; i++) {
            const val = cols[i].replace(/[^0-9]/g, ''); // Extract numbers only
            const reps = parseInt(val, 10);
            if (!isNaN(reps)) {
              sets.push({ setIndex: i - 3, weight: weight, reps: reps });
            }
          }
          
          if (sets.length > 0 && date && name) {
            // Find or create history item for this date
            if (!store.state.history) store.state.history = [];
            let hItem = store.state.history.find(h => {
              let dObj = new Date(h.date.replace(/[\.\-\/]/g, '/'));
              let dStr = isNaN(dObj.getTime()) ? h.date : `${dObj.getFullYear()}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${String(dObj.getDate()).padStart(2, '0')}`;
              
              let iObj = new Date(date.replace(/[\.\-\/]/g, '/'));
              let iStr = isNaN(iObj.getTime()) ? date : `${iObj.getFullYear()}/${String(iObj.getMonth() + 1).padStart(2, '0')}/${String(iObj.getDate()).padStart(2, '0')}`;
              return dStr === iStr;
            });

            if (!hItem) {
              hItem = { date: date, routineId: 'imported', routineName: 'Imported', records: [], importedRecords: [] };
              store.state.history.push(hItem);
            }
            if (!hItem.importedRecords) hItem.importedRecords = [];
            hItem.importedRecords.push({ name: name, sets: sets });
            importedCount++;
          }
        }
      });
      
      if (importedCount === 0) {
        alert(`데이터를 1개도 불러오지 못했습니다.\n\n양식이 맞지 않거나 잘못된 파일일 수 있습니다.\n인식된 첫 줄 데이터: ${firstDataLine ? firstDataLine.join(' | ') : '없음'}`);
      } else {
        store.save('history');
        alert(`${importedCount}개의 기록을 성공적으로 불러왔습니다.`);
        renderContent();
      }
    };
    // Use euc-kr to support Korean Excel ANSI CSV saves, fallback to utf-8 implicitly if it's utf-8
    reader.readAsText(file, 'euc-kr');
  };

  const renderContent = () => {
    if (currentView === 'list') {
      const uniqueNames = getAllUniqueExercises();
      const groups = {};
      
      uniqueNames.forEach(name => {
        const pName = getMappedName(name);
        if (!groups[pName]) groups[pName] = [];
        groups[pName].push(name);
      });

      let listHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h1 class="page-title" style="margin:0;">기록 관리</h1>
          <div>
            <button id="btn-export-csv" class="btn btn-secondary" style="width: auto; padding: 6px 12px; font-size: 0.8rem;">내보내기</button>
            <label class="btn btn-primary" style="width: auto; padding: 6px 12px; font-size: 0.8rem; cursor: pointer;">
              불러오기
              <input type="file" id="input-import-csv" accept=".csv" style="display: none;">
            </label>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">과거 기록을 CSV로 통합하고 차트로 확인하세요. 같은 종목은 드래그하여 하나로 묶을 수 있습니다.</p>
        
        <div class="card">
          <h3 style="margin-bottom: 12px; font-size: 1rem;">운동 목록 (클릭하여 차트 보기)</h3>
          <div id="exercise-groups" style="display: flex; flex-direction: column; gap: 8px;">
      `;

      Object.keys(groups).forEach(pName => {
        const aliases = groups[pName].filter(n => n !== pName);
        let aliasHtml = '';
        if (aliases.length > 0) {
          aliasHtml = `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${aliases.map(a => `<span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">${a} <span class="btn-unmerge" data-alias="${a}" style="cursor: pointer; color: #ff5555; font-weight: bold;">&times;</span></span>`).join('')}
          </div>`;
        }
        listHtml += `
          <div class="ex-group-item" data-name="${pName}" draggable="true" style="padding: 12px; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; transition: all 0.2s;">
            <div style="font-weight: 600;">${pName}</div>
            ${aliasHtml}
          </div>
        `;
      });

      listHtml += `</div></div>`;
      container.innerHTML = listHtml;

      container.querySelector('#btn-export-csv').addEventListener('click', exportCSV);
      container.querySelector('#input-import-csv').addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importCSV(e.target.files[0]);
        }
      });

      container.querySelectorAll('.ex-group-item').forEach(el => {
        el.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', el.dataset.name);
          e.currentTarget.style.opacity = '0.4';
        });

        el.addEventListener('dragend', (e) => {
          e.currentTarget.style.opacity = '1';
        });

        el.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.currentTarget.style.border = '2px dashed var(--primary-color)';
        });

        el.addEventListener('dragleave', (e) => {
          e.currentTarget.style.border = '1px solid var(--border-color)';
        });

        el.addEventListener('drop', (e) => {
          e.preventDefault();
          e.currentTarget.style.border = '1px solid var(--border-color)';
          const sourceName = e.dataTransfer.getData('text/plain');
          const targetName = e.currentTarget.dataset.name;
          
          if (sourceName && targetName && sourceName !== targetName) {
            store.state.mappings[sourceName] = targetName;
            
            // Re-point nested mappings
            Object.keys(store.state.mappings).forEach(key => {
              if (store.state.mappings[key] === sourceName) {
                store.state.mappings[key] = targetName;
              }
            });

            store.save('mappings');
            renderContent();
          }
        });

        el.addEventListener('click', (e) => {
          if (e.target.closest('.btn-unmerge')) {
            e.stopPropagation();
            const aliasToRemove = e.target.closest('.btn-unmerge').dataset.alias;
            delete store.state.mappings[aliasToRemove];
            store.save('mappings');
            renderContent();
            return;
          }
          selectedExerciseGroup = el.dataset.name;
          currentView = 'chart';
          renderContent();
        });
      });

    } else if (currentView === 'chart' && selectedExerciseGroup) {
      const data = getExerciseData(selectedExerciseGroup);
      
      let html = `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px; position: relative; min-height: 40px;">
          <button id="btn-back-list" class="btn btn-secondary" style="position: absolute; left: 0; width: auto; padding: 8px 16px;">&larr; 목록</button>
          <h2 style="margin: 0; font-size: 1.25rem; text-align: center; max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${selectedExerciseGroup}</h2>
          <div style="position: absolute; right: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">세트 표시: ${displaySetCount}</span>
            <button id="btn-dec-sets" class="btn btn-secondary" style="padding: 4px 12px; width: auto; font-weight: bold;">-</button>
            <button id="btn-inc-sets" class="btn btn-secondary" style="padding: 4px 12px; width: auto; font-weight: bold;">+</button>
          </div>
        </div>
      `;

      if (data.length === 0) {
        html += `<div style="text-align: center; color: var(--text-secondary); padding: 40px 0;">기록이 없습니다.</div>`;
        container.innerHTML = html;
      } else {
        // Build table
        let maxSets = 0;
        data.forEach(d => { if (d.sets.length > maxSets) maxSets = d.sets.length; });

        let showExtraBulk = maxSets > displaySetCount;

        html += `
          <div id="analytics-table-container" style="overflow-x: auto; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 24px; scroll-behavior: smooth;">
            <table style="width: max-content; border-collapse: separate; border-spacing: 0; text-align: center; font-size: 0.85rem;">
              <thead>
                <tr>
                  <th style="padding: 12px; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 20; border-bottom: 1px solid var(--border-color);">Date</th>
                  ${data.map(d => `<th class="col-header" style="padding: 12px; border-right: 3px solid var(--border-color); min-width: 80px; background: var(--bg-color); border-bottom: 1px solid var(--border-color);">${d.date.substring(5)}</th>`).join('')}
                </tr>
                <tr>
                  <th style="padding: 12px; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 20; border-bottom: 3px solid var(--border-color);">Change</th>
                  ${data.map((d, i) => {
                    let cellBg = 'var(--bg-color)';
                    let cellColor = '';
                    let valStr = '-';
                    if (i > 0) {
                      const prevV = data[i-1].volume;
                      const diff = d.volume - prevV;
                      if (diff > 0) { cellBg = 'rgba(255,50,50,0.8)'; cellColor = 'color: white; font-weight: bold;'; valStr = 'UP'; }
                      else if (diff < 0) { cellBg = 'rgba(50,50,255,0.8)'; cellColor = 'color: white; font-weight: bold;'; valStr = 'DOWN'; }
                    }
                    return `<td style="padding: 12px; border-right: 3px solid var(--border-color); background: ${cellBg}; ${cellColor} border-bottom: 3px solid var(--border-color);">${valStr}</td>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 0; background: var(--card-bg); z-index: 20;">Weight(Avg)</th>
                  ${data.map(d => `<td style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); font-weight: bold;">${d.avgWeight.toFixed(1)}KG</td>`).join('')}
                </tr>
                <tr>
                  <th style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 0; background: var(--card-bg); z-index: 20;">Bulk</th>
                  ${data.map(d => `<td style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color);">${Math.round(d.volume)}</td>`).join('')}
                </tr>
        `;

        if (showExtraBulk) {
          html += `
                <tr>
                  <th style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 0; background: var(--card-bg); z-index: 20; color: var(--text-secondary);">Extra Bulk</th>
                  ${data.map(d => {
                    let extraVol = 0;
                    for (let i = displaySetCount; i < d.sets.length; i++) {
                      extraVol += (parseFloat(d.sets[i].weight) || 0) * (parseInt(d.sets[i].reps, 10) || 0);
                    }
                    return `<td style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); color: var(--text-secondary); background: rgba(255, 255, 255, 0.03);">${extraVol > 0 ? Math.round(extraVol) : '-'}</td>`;
                  }).join('')}
                </tr>
          `;
        }

        for (let s = 0; s < displaySetCount; s++) {
          html += `
                <tr>
                  <th style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: sticky; left: 0; background: var(--card-bg); z-index: 20;">${s+1} SET</th>
                  ${data.map(d => {
                    const rec = d.sets[s];
                    if (rec && rec.reps) return `<td style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color);">${rec.reps}회</td>`;
                    return `<td style="padding: 8px; border-right: 3px solid var(--border-color); border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">-</td>`;
                  }).join('')}
                </tr>
          `;
        }

        html += `
              </tbody>
            </table>
          </div>
          
          <div class="card" style="padding: 16px; margin-bottom: 80px;">
            <canvas id="analyticsChart" style="width: 100%; height: 300px;"></canvas>
          </div>
        `;

        container.innerHTML = html;

        container.querySelector('#btn-back-list').addEventListener('click', () => {
          currentView = 'list';
          selectedExerciseGroup = null;
          renderContent();
        });

        const btnDecSets = container.querySelector('#btn-dec-sets');
        if (btnDecSets) {
          btnDecSets.addEventListener('click', () => {
            if (displaySetCount > 1) {
              displaySetCount--;
              localStorage.setItem('workout_displaySetCount', displaySetCount);
              renderContent();
            }
          });
        }
        
        const btnIncSets = container.querySelector('#btn-inc-sets');
        if (btnIncSets) {
          btnIncSets.addEventListener('click', () => {
            if (displaySetCount < 50) {
              displaySetCount++;
              localStorage.setItem('workout_displaySetCount', displaySetCount);
              renderContent();
            }
          });
        }

        // Draw Chart
        const ctx = document.getElementById('analyticsChart').getContext('2d');
        const labels = data.map(d => d.date.substring(5)); // MM/DD
        const weightData = data.map(d => d.avgWeight);
        const repsData = data.map(d => d.totalReps);
        const volumeData = data.map(d => d.volume);

        if (chartInstance) chartInstance.destroy();
        
        Chart.defaults.color = '#a0a0a0';
        Chart.defaults.font.family = 'Inter';

        const crosshairPlugin = {
          id: 'crosshair',
          afterDraw: chart => {
            if (chart.tooltip?._active && chart.tooltip._active.length) {
              const activeElements = chart.tooltip._active;
              let activePoint = activeElements[0];
              if (chart.lastMouseY !== undefined) {
                let minDist = Infinity;
                for (let p of activeElements) {
                   const dist = Math.abs(p.element.y - chart.lastMouseY);
                   if (dist < minDist) {
                      minDist = dist;
                      activePoint = p;
                   }
                }
              }
              
              const c = chart.ctx;
              const x = activePoint.element.x;
              const y = activePoint.element.y;
              const topY = chart.scales.y.top;
              const bottomY = chart.scales.y.bottom;
              const leftX = chart.scales.x.left;
              const rightX = chart.scales.x.right;

              c.save();
              c.beginPath();
              c.setLineDash([4, 4]);
              // Vertical
              c.moveTo(x, topY);
              c.lineTo(x, bottomY);
              // Horizontal
              c.moveTo(leftX, y);
              c.lineTo(rightX, y);
              c.lineWidth = 1.5;
              c.strokeStyle = 'rgba(255, 235, 59, 1)'; // Yellow
              c.stroke();
              
              // Value label
              const datasetIndex = activePoint.datasetIndex;
              const index = activePoint.index;
              const val = chart.data.datasets[datasetIndex].data[index];
              const isRightAxis = chart.data.datasets[datasetIndex].yAxisID === 'y1';
              
              let labelText = '';
              if (datasetIndex === 0) labelText = val.toFixed(1) + 'kg';
              else if (datasetIndex === 1) labelText = Math.round(val) + '회';
              else labelText = Math.round(val).toString();

              c.font = 'bold 11px Inter';
              const textWidth = c.measureText(labelText).width + 12;
              
              c.setLineDash([]);
              if (isRightAxis) {
                c.fillStyle = 'rgba(255, 235, 59, 1)';
                c.fillRect(rightX, y - 10, textWidth, 20);
                c.fillStyle = '#000';
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.fillText(labelText, rightX + textWidth/2, y);
              } else {
                c.fillStyle = 'rgba(255, 235, 59, 1)';
                c.fillRect(leftX - textWidth, y - 10, textWidth, 20);
                c.fillStyle = '#000';
                c.textAlign = 'center';
                c.textBaseline = 'middle';
                c.fillText(labelText, leftX - textWidth/2, y);
              }

              c.restore();
            }
          }
        };

        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: '평균 중량 (kg)',
                data: weightData,
                borderColor: '#FF5722',
                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
              },
              {
                label: '총 횟수 (회)',
                data: repsData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
              },
              {
                label: '총 볼륨',
                data: volumeData,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
              }
            ]
          },
          plugins: [crosshairPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
            onHover: (e) => {
              if (chartInstance) chartInstance.lastMouseY = e.y;
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: 'rgba(255,255,255,0.1)' }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false }
              }
            }
          }
        });

        const tableContainer = container.querySelector('#analytics-table-container');
        if (tableContainer && chartInstance) {
          tableContainer.addEventListener('scroll', () => {
             const headers = tableContainer.querySelectorAll('.col-header');
             if (headers.length === 0) return;
             
             let activeIdx = 0;
             let minDist = Infinity;
             const containerRect = tableContainer.getBoundingClientRect();
             // Center of the scrollable area (excluding sticky header width ~ 80px)
             const containerCenter = containerRect.left + 80 + (containerRect.width - 80) / 2;
             
             for(let i=0; i<headers.length; i++) {
                const rect = headers[i].getBoundingClientRect();
                const headerCenter = rect.left + rect.width / 2;
                const dist = Math.abs(containerCenter - headerCenter);
                if (dist < minDist) {
                   minDist = dist;
                   activeIdx = i;
                }
             }
             
             const meta = chartInstance.getDatasetMeta(0);
             if (meta && meta.data[activeIdx]) {
                const x = meta.data[activeIdx].x;
                const y = chartInstance.lastMouseY || meta.data[activeIdx].y;
                chartInstance.tooltip.setActiveElements([
                  {datasetIndex: 0, index: activeIdx},
                  {datasetIndex: 1, index: activeIdx},
                  {datasetIndex: 2, index: activeIdx}
                ], {x: x, y: y});
                chartInstance.update();
             }
          });
        }
      }
    }
  };

  setTimeout(() => renderContent(), 0);
  container.forceRender = () => renderContent();
  return container;
}






