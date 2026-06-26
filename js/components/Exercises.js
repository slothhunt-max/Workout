import { store } from '../store.js';

export function renderExercisesTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-exercises';

  container.innerHTML = `
    <h1 class="page-title">운동 관리</h1>
    
    <div class="card">
      <form id="exercise-form">
        <div class="form-group">
          <label>운동 이름</label>
          <input type="text" id="ex-name" required placeholder="예: 벤치프레스">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label>기본 휴식 (분)</label>
            <input type="number" id="ex-basic-rest" required min="1" step="0.5" value="1.5">
          </div>
          <div class="form-group" style="flex: 1;">
            <label>특수 휴식 (분)</label>
            <input type="number" id="ex-special-rest" required min="1" step="0.5" value="3">
          </div>
        </div>

        <div class="form-group">
          <label>세트 수</label>
          <input type="number" id="ex-sets" required min="1" value="5">
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="ex-has-jcup">
          <label for="ex-has-jcup" style="margin: 0;">J-Cup 번호 기록</label>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="ex-has-safebar">
          <label for="ex-has-safebar" style="margin: 0;">세이프바 번호 기록</label>
        </div>

        <button type="submit" class="btn">운동 추가</button>
      </form>
    </div>

    <div id="exercise-list"></div>
  `;

  const form = container.querySelector('#exercise-form');
  const listContainer = container.querySelector('#exercise-list');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addExercise({
      name: container.querySelector('#ex-name').value,
      basicRest: parseFloat(container.querySelector('#ex-basic-rest').value),
      specialRest: parseFloat(container.querySelector('#ex-special-rest').value),
      sets: parseInt(container.querySelector('#ex-sets').value, 10),
      hasJCup: container.querySelector('#ex-has-jcup').checked,
      hasSafebar: container.querySelector('#ex-has-safebar').checked
    });
    form.reset();
    // Default values back
    container.querySelector('#ex-basic-rest').value = "1.5";
    container.querySelector('#ex-special-rest').value = "3";
    container.querySelector('#ex-sets').value = "5";
  });

  const renderList = (state) => {
    listContainer.innerHTML = state.exercises.length === 0 
      ? '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">등록된 운동이 없습니다.</p>'
      : '';

    state.exercises.forEach(ex => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3 style="margin-bottom: 8px;">${ex.name}</h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">
              휴식: ${ex.basicRest}분 (특수 ${ex.specialRest}분) / ${ex.sets}세트
            </p>
            <p style="font-size: 0.75rem; color: var(--primary-color); margin-top: 4px;">
              ${ex.hasJCup ? 'J-Cup 기록 ' : ''}${ex.hasSafebar ? '세이프바 기록' : ''}
            </p>
          </div>
          <button class="btn btn-danger" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${ex.id}">삭제</button>
        </div>
      `;
      
      el.querySelector('button').addEventListener('click', (e) => {
        store.deleteExercise(e.target.dataset.id);
      });

      listContainer.appendChild(el);
    });
  };

  store.subscribe(renderList);
  setTimeout(() => renderList(store.state), 0);

  return container;
}
