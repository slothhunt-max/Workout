import { store } from '../store.js';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function renderScheduleTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-schedule';

  container.innerHTML = `
    <h1 class="page-title">운동 일정</h1>
    
    <div style="display: flex; overflow-x: auto; gap: 10px; margin-bottom: 20px; padding-bottom: 5px;">
      ${DAYS.map((day, i) => `
        <button class="btn btn-secondary day-selector" data-day="${i}" style="flex: 0 0 auto; width: 50px; padding: 8px; ${i === new Date().getDay() ? 'background-color: var(--primary-color); color: white; border-color: var(--primary-color);' : ''}">${day}</button>
      `).join('')}
    </div>

    <div class="card" id="schedule-add-section">
      <h3 style="margin-bottom: 12px; font-size: 1rem;">루틴에 운동 추가</h3>
      <div style="display: flex; gap: 10px;">
        <select id="schedule-exercise-select" style="flex: 1; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);"></select>
        <input type="text" id="schedule-target-reps" placeholder="목표 횟수 (예: 10)" style="width: 100px; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">
        <button id="btn-add-schedule" class="btn" style="width: auto;">추가</button>
      </div>
    </div>

    <div id="schedule-list"></div>
  `;

  let currentDay = new Date().getDay();
  const listContainer = container.querySelector('#schedule-list');
  const select = container.querySelector('#schedule-exercise-select');
  const targetRepsInput = container.querySelector('#schedule-target-reps');
  const btnAdd = container.querySelector('#btn-add-schedule');
  const daySelectors = container.querySelectorAll('.day-selector');

  daySelectors.forEach(btn => {
    btn.addEventListener('click', (e) => {
      daySelectors.forEach(b => {
        b.style.backgroundColor = 'var(--surface-color)';
        b.style.color = 'var(--text-primary)';
        b.style.borderColor = 'var(--border-color)';
      });
      e.target.style.backgroundColor = 'var(--primary-color)';
      e.target.style.color = 'white';
      e.target.style.borderColor = 'var(--primary-color)';
      currentDay = parseInt(e.target.dataset.day, 10);
      renderList(store.state);
    });
  });

  btnAdd.addEventListener('click', () => {
    const exerciseId = select.value;
    const targetReps = targetRepsInput.value || '10';
    if (exerciseId) {
      store.addScheduleItem(currentDay, exerciseId, targetReps);
      targetRepsInput.value = '';
    }
  });

  const renderList = (state) => {
    // Populate select
    const selectedValue = select.value;
    select.innerHTML = state.exercises.length === 0 
      ? '<option value="">운동을 먼저 등록하세요</option>'
      : state.exercises.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('');
    
    if (selectedValue && state.exercises.find(e => e.id === selectedValue)) {
      select.value = selectedValue;
    }

    // Populate list
    const schedule = state.schedule[currentDay] || [];
    listContainer.innerHTML = schedule.length === 0
      ? '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">이 날짜에 등록된 운동이 없습니다.</p>'
      : '';

    schedule.forEach((item, index) => {
      const ex = state.exercises.find(e => e.id === item.exerciseId);
      if (!ex) return;

      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 1rem; margin-bottom: 4px;"><span style="color: var(--primary-color); margin-right: 8px;">${index + 1}</span> ${ex.name}</h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">목표: ${item.targetReps}회 / ${ex.sets}세트</p>
          </div>
          <button class="btn btn-danger" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">삭제</button>
        </div>
      `;
      el.querySelector('button').addEventListener('click', (e) => {
        store.deleteScheduleItem(currentDay, e.target.dataset.id);
      });
      listContainer.appendChild(el);
    });
  };

  store.subscribe(renderList);
  setTimeout(() => renderList(store.state), 0);

  return container;
}
