window.showCustomPrompt = (message, defaultValue = '', type = 'text') => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease';

    const modal = document.createElement('div');
    modal.style.backgroundColor = 'var(--surface-color)';
    modal.style.padding = '24px';
    modal.style.borderRadius = '16px';
    modal.style.width = '85%';
    modal.style.maxWidth = '320px';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    modal.style.transform = 'translateY(20px)';
    modal.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.gap = '16px';

    const title = document.createElement('h3');
    title.innerText = message;
    title.style.margin = '0';
    title.style.color = 'var(--text-primary)';
    title.style.fontSize = '1.1rem';
    title.style.textAlign = 'center';

    const input = document.createElement('input');
    if (type === 'number') {
      input.type = 'number';
      input.step = 'any';
    } else {
      input.type = 'text';
    }
    input.value = defaultValue;
    input.style.width = '100%';
    input.style.padding = '12px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid var(--border-color)';
    input.style.backgroundColor = 'var(--bg-color)';
    input.style.color = 'var(--text-primary)';
    input.style.fontSize = '1rem';
    input.style.textAlign = 'center';
    input.style.outline = 'none';

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '10px';

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = '취소';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.style.flex = '1';
    cancelBtn.style.padding = '10px';
    cancelBtn.style.margin = '0';

    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = '확인';
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.style.flex = '1';
    confirmBtn.style.padding = '10px';
    confirmBtn.style.margin = '0';

    btnGroup.appendChild(cancelBtn);
    btnGroup.appendChild(confirmBtn);

    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(btnGroup);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'translateY(0)';
    });

    input.focus();
    if(type === 'text') {
      const val = input.value;
      input.value = '';
      input.value = val;
    }

    const close = (val) => {
      overlay.style.opacity = '0';
      modal.style.transform = 'translateY(20px)';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        resolve(val);
      }, 200);
    };

    cancelBtn.addEventListener('click', () => close(null));
    confirmBtn.addEventListener('click', () => close(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') close(input.value);
      if (e.key === 'Escape') close(null);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(null);
    });
  });
};


window.makeCustomDropdown = (selectEl) => {
  if (selectEl.dataset.customized) return;
  selectEl.dataset.customized = "true";
  selectEl.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = selectEl.style.width || '100%';
  wrapper.style.flex = selectEl.style.flex || 'initial';
  wrapper.style.marginBottom = selectEl.style.marginBottom || '0';

  const header = document.createElement('div');
  header.style.padding = '12px 36px 12px 12px';
  header.style.backgroundColor = 'var(--bg-color)';
  header.style.border = '1px solid var(--border-color)';
  header.style.borderRadius = '8px';
  header.style.color = 'var(--text-primary)';
  header.style.cursor = 'pointer';
  header.style.textAlign = 'center';
  header.style.display = 'flex';
  header.style.justifyContent = 'center';
  header.style.alignItems = 'center';
  header.style.minHeight = '48px';
  header.style.backgroundImage = 'url(\'data:image/svg+xml;utf8,<svg fill="%2394a3b8" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')';
  header.style.backgroundRepeat = 'no-repeat';
  header.style.backgroundPosition = 'right 12px center';
  header.style.userSelect = 'none';
  
  const textSpan = document.createElement('span');
  textSpan.style.pointerEvents = 'none';
  header.appendChild(textSpan);

  const list = document.createElement('div');
  list.style.position = 'absolute';
  list.style.top = '100%';
  list.style.left = '0';
  list.style.right = '0';
  list.style.marginTop = '4px';
  list.style.backgroundColor = 'var(--surface-color)';
  list.style.border = '1px solid var(--border-color)';
  list.style.borderRadius = '8px';
  list.style.maxHeight = '200px';
  list.style.overflowY = 'auto';
  list.style.zIndex = '999';
  list.style.display = 'none';
  list.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';

  wrapper.appendChild(header);
  wrapper.appendChild(list);
  selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

  let isOpen = false;
  const toggle = (open) => {
    isOpen = open;
    list.style.display = isOpen ? 'block' : 'none';
  };

  header.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(!isOpen);
  });

  document.addEventListener('click', () => {
    if (isOpen) toggle(false);
  });

  const renderOptions = () => {
    list.innerHTML = '';
    const options = Array.from(selectEl.options);
    if(options.length === 0) {
      textSpan.innerText = '항목 없음';
      return;
    }
    
    const selected = options[selectEl.selectedIndex] || options[0];
    if (selected) textSpan.innerText = selected.innerText;

    options.forEach((opt, idx) => {
      const item = document.createElement('div');
      item.style.padding = '12px';
      item.style.textAlign = 'center';
      item.style.cursor = 'pointer';
      item.style.borderBottom = idx < options.length - 1 ? '1px solid var(--border-color)' : 'none';
      item.innerText = opt.innerText;
      
      if(opt.selected) {
        item.style.backgroundColor = 'var(--primary-color)';
        item.style.color = '#fff';
        item.style.fontWeight = 'bold';
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEl.selectedIndex = idx;
        textSpan.innerText = opt.innerText;
        toggle(false);
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        renderOptions();
      });
      list.appendChild(item);
    });
  };

  const observer = new MutationObserver(() => renderOptions());
  observer.observe(selectEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected'] });

  if (!selectEl.dataset.hooked) {
    selectEl.dataset.hooked = "true";
    const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(selectEl, 'value', {
      get: desc.get,
      set: function(v) {
        desc.set.call(this, v);
        renderOptions();
      }
    });
  }

  renderOptions();
};
// --- Store Logic ---
class Store {
  constructor() {
    const storedRoutines = JSON.parse(localStorage.getItem('routines'));
    let routines = storedRoutines;
    let needsRoutineSave = false;

    if (!routines) {
      routines = [];
      const oldSchedule = JSON.parse(localStorage.getItem('schedule'));
      if (oldSchedule) {
        const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        for (let i = 0; i < 7; i++) {
          if (oldSchedule[i] && oldSchedule[i].length > 0) {
            routines.push({
              id: Date.now().toString() + i,
              name: dayNames[i] + ' 루틴',
              items: oldSchedule[i]
            });
          }
        }
      }
      if (routines.length === 0) {
        routines = [{ id: Date.now().toString(), name: '내 루틴 1', items: [] }];
      }
      needsRoutineSave = true;
    }

    this.state = {
      exercises: JSON.parse(localStorage.getItem('exercises')) || [],
      routines: routines,
      categories: JSON.parse(localStorage.getItem('categories')) || ['가슴', '등', '하체', '어깨', '팔', '유산소'],
      timer: {
        isRunning: false,
        timeLeft: 0,
        totalTime: 0,
        type: 'basic', 
        endTime: null
      },
      history: JSON.parse(localStorage.getItem('history')) || [],
      workout: {
        isRecording: false,
        startTime: null,
        selectedRoutineId: routines[0] ? routines[0].id : null,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        records: [],
      todayTargets: {},
        todayTargets: {}, 
      }
    };

    const defaultTimer = this.state.timer;
    const defaultWorkout = this.state.workout;
    
    let savedTimer = JSON.parse(localStorage.getItem('timer')) || defaultTimer;
    let savedWorkout = JSON.parse(localStorage.getItem('workout')) || defaultWorkout;

    if (savedTimer.isRunning && savedTimer.endTime) {
      const now = Date.now();
      if (now >= savedTimer.endTime) {
        savedTimer.isRunning = false;
        savedTimer.timeLeft = 0;
        savedTimer.endTime = null;
      } else {
        savedTimer.timeLeft = Math.ceil((savedTimer.endTime - now) / 1000);
      }
    }

    this.state.timer = savedTimer;
    this.state.workout = savedWorkout;
    
    let needsSave = false;
    this.state.exercises = this.state.exercises.map(ex => {
      if (ex.maxRest === undefined) {
        ex.basicRest = Math.round(ex.basicRest * 60);
        ex.specialRest = Math.round(ex.specialRest * 60);
        ex.maxRest = ex.specialRest; 
        needsSave = true;
      }
      if (typeof ex.interRest !== 'number') {
        ex.interRest = 120;
        needsSave = true;
      }
      return ex;
    });
    if (needsSave) localStorage.setItem('exercises', JSON.stringify(this.state.exercises));
    if (needsRoutineSave) localStorage.setItem('routines', JSON.stringify(this.state.routines));

    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  addExercise(exercise) {
    const newExercise = { ...exercise, id: Date.now().toString() };
    this.state.exercises.push(newExercise);
    this.save('exercises');
    this.notify();
  }

  updateExercise(id, data) {
    const index = this.state.exercises.findIndex(e => e.id === id);
    if (index !== -1) {
      this.state.exercises[index] = { ...this.state.exercises[index], ...data };
      this.save('exercises');
      this.notify();
    }
  }

  deleteExercise(id) {
    this.state.exercises = this.state.exercises.filter(e => e.id !== id);
    this.state.routines.forEach(r => {
      r.items = r.items.filter(item => item.exerciseId !== id);
    });
    this.save('exercises');
    this.save('routines');
    this.notify();
  }

  addCategory(name) {
    if (name && !this.state.categories.includes(name)) {
      this.state.categories.push(name);
      this.save('categories');
      this.notify();
    }
  }

  deleteCategory(name) {
    this.state.categories = this.state.categories.filter(c => c !== name);
    this.state.exercises.forEach(ex => {
      if (ex.category === name) ex.category = '';
    });
    this.save('categories');
    this.save('exercises');
    this.notify();
  }

  reorderExercises(newIdsArray) {
    const ordered = [];
    newIdsArray.forEach(id => {
      const ex = this.state.exercises.find(e => e.id === id);
      if(ex) ordered.push(ex);
    });
    if (ordered.length === this.state.exercises.length) {
      this.state.exercises = ordered;
      this.save('exercises');
      // notification might disrupt visual drag, so we may selectively notify if needed, but it should be fine here
    }
  }

  addRoutine(name) {
    this.state.routines.push({ id: Date.now().toString(), name, items: [] });
    this.save('routines');
    this.notify();
  }

  updateRoutineName(routineId, newName) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (routine) {
      routine.name = newName;
      this.save('routines');
      this.notify();
    }
  }

  deleteRoutine(routineId) {
    this.state.routines = this.state.routines.filter(r => r.id !== routineId);
    if (this.state.workout.selectedRoutineId === routineId) {
      this.state.workout.selectedRoutineId = this.state.routines[0] ? this.state.routines[0].id : null;
    }
    this.save('routines');
    this.notify();
  }

  addRoutineItem(routineId, exerciseId, targetReps, targetWeight) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (routine) {
      routine.items.push({
        id: Date.now().toString(),
        exerciseId,
        targetReps,
        targetWeight
      });
      this.save('routines');
      this.notify();
    }
  }
  
  deleteRoutineItem(routineId, itemId) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (routine) {
      routine.items = routine.items.filter(item => item.id !== itemId);
      this.save('routines');
      this.notify();
    }
  }

  updateRoutineItem(routineId, itemId, targetReps, targetWeight) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (routine) {
      const item = routine.items.find(i => i.id === itemId);
      if (item) {
        item.targetReps = targetReps;
        item.targetWeight = targetWeight;
        this.save('routines');
        this.notify();
      }
    }
  }

  reorderRoutineItem(routineId, newIdsArray) {
    const routine = this.state.routines.find(r => r.id === routineId);
    if (routine) {
      const ordered = [];
      newIdsArray.forEach(id => {
        const item = routine.items.find(e => e.id === id);
        if (item) ordered.push(item);
      });
      if (ordered.length === routine.items.length) {
        routine.items = ordered;
        this.save('routines');
      }
    }
  }

  startTimer(durationSeconds, type = 'basic') {
    this.state.timer = {
      isRunning: true,
      timeLeft: durationSeconds,
      totalTime: durationSeconds,
      type,
      endTime: Date.now() + durationSeconds * 1000
    };
    this.save('timer');
    this.notify();
  }

  stopTimer() {
    this.state.timer.isRunning = false;
    this.state.timer.timeLeft = 0;
    this.state.timer.endTime = null;
    this.save('timer');
    this.notify();
  }

  addTimerTime(seconds) {
    if (this.state.timer.isRunning) {
      this.state.timer.timeLeft += seconds;
      this.state.timer.totalTime += seconds;
      this.state.timer.endTime += seconds * 1000;
      this.save('timer');
      this.notify();
    }
  }

  tickTimer() {
    if (this.state.timer.isRunning) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((this.state.timer.endTime - now) / 1000));
      this.state.timer.timeLeft = remaining;
      
      if (remaining === 0) {
        this.state.timer.isRunning = false;
        this.state.timer.endTime = null;
        this.save('timer');
      }
      this.notify();
    }
  }

  startWorkout(routineId) {
    this.state.workout = {
      isRecording: true,
      startTime: Date.now(),
      selectedRoutineId: routineId,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      records: [],
      todayTargets: {}
    };
    this.save('workout');
    this.notify();
  }

  stopWorkout() {
    if (this.state.workout.records.length === 0) {
      alert("완료된 세트가 하나도 없어서 기록 일지에 저장되지 않았습니다. 최소 1세트 이상 진행 후 '세트 완료'를 눌러주세요!");
    } else if (this.state.workout.records.length > 0) {
      const routineName = this.state.routines.find(r => r.id === this.state.workout.selectedRoutineId)?.name || '기타';
      const historyEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        routineName: routineName,
        startTime: this.state.workout.startTime,
        endTime: Date.now(),
        records: JSON.parse(JSON.stringify(this.state.workout.records)),
        exercisesSnapshot: JSON.parse(JSON.stringify(this.state.exercises))
      };
      this.state.history.push(historyEntry);
      this.save('history');
    }
    this.state.workout.isRecording = false;
    this.save('workout');
    this.notify();
  }

  recordSet(record) {
    this.state.workout.records.push(record);
    this.save('workout');
    this.notify();
  }

  nextSet(nextExercise = false) {
    if (nextExercise) {
      this.state.workout.currentExerciseIndex++;
      this.state.workout.currentSetIndex = 0;
    } else {
      this.state.workout.currentSetIndex++;
    }
    this.save('workout');
    this.notify();
  }

  save(key) {
    localStorage.setItem(key, JSON.stringify(this.state[key]));
  }
}

const store = new Store();
setInterval(() => { store.tickTimer(); }, 100);

// --- DND Helper ---
function makeListSortable(listContainer, onReorder) {
  let draggingEle;
  let placeholder;
  let isDraggingStarted = false;
  let x = 0;
  let y = 0;

  const mouseDownHandler = function (e) {
    if (!e.target.classList.contains('drag-handle')) return;
    draggingEle = e.target.closest('.card');
    if (!draggingEle) return;

    const event = e.touches ? e.touches[0] : e;
    const rect = draggingEle.getBoundingClientRect();
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;

    document.addEventListener('mousemove', mouseMoveHandler, { passive: false });
    document.addEventListener('mouseup', mouseUpHandler);
    document.addEventListener('touchmove', mouseMoveHandler, { passive: false });
    document.addEventListener('touchend', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    if (!draggingEle) return;
    const event = e.touches ? e.touches[0] : e;
    
    // Prevent default to disable scrolling during drag on mobile
    e.preventDefault();

    if (!isDraggingStarted) {
      isDraggingStarted = true;
      const draggingRect = draggingEle.getBoundingClientRect();
      
      placeholder = document.createElement('div');
      placeholder.classList.add('placeholder');
      placeholder.style.height = `${draggingRect.height}px`;
      placeholder.style.border = '2px dashed var(--primary-color)';
      placeholder.style.borderRadius = '12px';
      placeholder.style.marginBottom = '16px';

      draggingEle.parentNode.insertBefore(placeholder, draggingEle);

      draggingEle.style.position = 'fixed';
      draggingEle.style.zIndex = '9999';
      draggingEle.style.width = `${draggingRect.width}px`;
      draggingEle.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
    }

    draggingEle.style.top = `${event.clientY - y}px`;
    draggingEle.style.left = `${event.clientX - x}px`;

    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling === draggingEle ? draggingEle.nextElementSibling : placeholder.nextElementSibling;
    
    if (prevEle && isAbove(draggingEle, prevEle)) {
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
    }
    if (nextEle && isAbove(nextEle, draggingEle)) {
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    }
  };

  const mouseUpHandler = function () {
    if (!draggingEle) return;

    placeholder && placeholder.parentNode && placeholder.parentNode.replaceChild(draggingEle, placeholder);
    
    draggingEle.style.removeProperty('top');
    draggingEle.style.removeProperty('left');
    draggingEle.style.removeProperty('position');
    draggingEle.style.removeProperty('z-index');
    draggingEle.style.removeProperty('width');
    draggingEle.style.removeProperty('box-shadow');

    x = null;
    y = null;
    draggingEle = null;
    isDraggingStarted = false;
    
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
    document.removeEventListener('touchmove', mouseMoveHandler);
    document.removeEventListener('touchend', mouseUpHandler);
    
    const newItems = Array.from(listContainer.children);
    const newIds = newItems.map(item => item.dataset.id).filter(Boolean);
    if(onReorder) onReorder(newIds);
  };

  const isAbove = function (nodeA, nodeB) {
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();
    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
  };

  const swap = function (nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
    nodeB.parentNode.insertBefore(nodeA, nodeB);
    parentA.insertBefore(nodeB, siblingA);
  };

  listContainer.addEventListener('mousedown', mouseDownHandler);
  listContainer.addEventListener('touchstart', mouseDownHandler, { passive: false });
}

// --- Exercises Tab ---
function renderExercisesTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-exercises';

  container.innerHTML = `
    <h1 class="page-title">운동 관리</h1>
    
    <div class="card">
      <form id="exercise-form">
        <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 16px;">
          <div class="form-group" style="flex: 2; margin-bottom: 0;">
            <label>운동 이름</label>
            <input type="text" id="ex-name" required>
          </div>
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <label>분류</label>
            <select id="ex-category" style="width: 100%; padding: 12px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);"></select>
          </div>
          <button type="button" id="btn-manage-categories" class="btn btn-secondary" style="flex: 0 0 auto; width: auto; padding: 12px; height: 46px;">⚙️</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 0;">
            <label style="margin: 0; white-space: nowrap; width: 75px; text-align: right;">세트 수</label>
            <div style="display: flex; gap: 5px; flex: 1;">
              <input type="number" id="ex-sets" required min="1" value="5" style="width: 100%;">
              <span style="visibility: hidden; white-space: nowrap; align-self: center;">초</span>
            </div>
          </div>
          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 0;">
            <label style="margin: 0; white-space: nowrap; width: 75px; text-align: right;">기본 휴식</label>
            <div style="display: flex; gap: 5px; flex: 1;">
              <input type="number" id="ex-basic-m" min="0" value="1" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">분</span>
              <input type="number" id="ex-basic-s" min="0" max="59" value="30" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">초</span>
            </div>
          </div>
          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 0;">
            <label style="margin: 0; white-space: nowrap; width: 75px; text-align: right;">특수 휴식</label>
            <div style="display: flex; gap: 5px; flex: 1;">
              <input type="number" id="ex-special-m" min="0" value="3" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">분</span>
              <input type="number" id="ex-special-s" min="0" max="59" value="0" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">초</span>
            </div>
          </div>
          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 0;">
            <label style="margin: 0; white-space: nowrap; width: 75px; text-align: right;">최대 휴식</label>
            <div style="display: flex; gap: 5px; flex: 1;">
              <input type="number" id="ex-max-m" min="0" value="5" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">분</span>
              <input type="number" id="ex-max-s" min="0" max="59" value="0" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">초</span>
            </div>
          </div>
          <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 0;">
            <label style="margin: 0; white-space: nowrap; width: 75px; text-align: right;">종목 휴식</label>
            <div style="display: flex; gap: 5px; flex: 1;">
              <input type="number" id="ex-inter-m" min="0" value="2" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">분</span>
              <input type="number" id="ex-inter-s" min="0" max="59" value="0" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">초</span>
            </div>
          </div>
        </div>

        <div class="checkbox-group" style="align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 150px;">
            <input type="checkbox" id="ex-has-jcup">
            <label for="ex-has-jcup" style="margin: 0;">J-Cup 번호 입력</label>
          </div>
          <input type="number" id="ex-jcup-val" placeholder="입력" disabled style="flex: 1; min-width: 100px; padding: 8px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); opacity: 0.5;">
        </div>

        <div class="checkbox-group" style="align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 150px;">
            <input type="checkbox" id="ex-has-safebar">
            <label for="ex-has-safebar" style="margin: 0;">안전바 번호 입력</label>
          </div>
          <input type="number" id="ex-safebar-val" placeholder="입력" disabled style="flex: 1; min-width: 100px; padding: 8px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); opacity: 0.5;">
        </div>

        <div style="display: flex; gap: 10px;">
          <button type="submit" id="btn-submit-exercise" class="btn" style="flex: 1;">운동 추가</button>
          <button type="button" id="btn-cancel-edit" class="btn btn-secondary" style="display: none; flex: 1;">취소</button>
        </div>
      </form>
    </div>

    <div id="category-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">분류 관리</h2>
          <button type="button" class="modal-close" id="btn-close-category-modal">&times;</button>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <input type="text" id="new-category-name" placeholder="새 분류 이름" style="flex: 1; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">
          <button type="button" id="btn-add-category" class="btn btn-accent" style="width: auto;">추가</button>
        </div>
        <div id="category-list" style="max-height: 200px; overflow-y: auto;"></div>
      </div>
    </div>

    <div id="exercise-list"></div>
  `;

  const form = container.querySelector('#exercise-form');
  const listContainer = container.querySelector('#exercise-list');

  const categorySelect = container.querySelector('#ex-category');
  const btnManageCategories = container.querySelector('#btn-manage-categories');
  const categoryModal = container.querySelector('#category-modal');
  const btnCloseModal = container.querySelector('#btn-close-category-modal');
  const newCategoryInput = container.querySelector('#new-category-name');
  const btnAddCategory = container.querySelector('#btn-add-category');
  const modalCategoryList = container.querySelector('#category-list');

  const nameInput = container.querySelector('#ex-name');
  const basicM = container.querySelector('#ex-basic-m');
  const basicS = container.querySelector('#ex-basic-s');
  const specialM = container.querySelector('#ex-special-m');
  const specialS = container.querySelector('#ex-special-s');
  const maxM = container.querySelector('#ex-max-m');
  const maxS = container.querySelector('#ex-max-s');
  const setsInput = container.querySelector('#ex-sets');
  const interM = container.querySelector('#ex-inter-m');
  const interS = container.querySelector('#ex-inter-s');

  const jcupCheck = container.querySelector('#ex-has-jcup');
  const jcupInput = container.querySelector('#ex-jcup-val');
  const safebarCheck = container.querySelector('#ex-has-safebar');
  const safebarInput = container.querySelector('#ex-safebar-val');
  
  const submitBtn = container.querySelector('#btn-submit-exercise');
  const cancelBtn = container.querySelector('#btn-cancel-edit');

  let editModeId = null;

  jcupCheck.addEventListener('change', (e) => {
    jcupInput.disabled = !e.target.checked;
    jcupInput.style.opacity = e.target.checked ? '1' : '0.5';
    if (!e.target.checked) jcupInput.value = '';
  });

  safebarCheck.addEventListener('change', (e) => {
    safebarInput.disabled = !e.target.checked;
    safebarInput.style.opacity = e.target.checked ? '1' : '0.5';
    if (!e.target.checked) safebarInput.value = '';
  });

  const resetForm = () => {
    form.reset();
    editModeId = null;
    submitBtn.textContent = '운동 추가';
    submitBtn.classList.remove('btn-accent');
    cancelBtn.style.display = 'none';
    jcupInput.disabled = true;
    jcupInput.style.opacity = '0.5';
    safebarInput.disabled = true;
    safebarInput.style.opacity = '0.5';
    basicM.value = "1"; basicS.value = "30";
    specialM.value = "3"; specialS.value = "0";
    maxM.value = "5"; maxS.value = "0";
    setsInput.value = "5";
    interM.value = "2"; interS.value = "0";
    categorySelect.value = '';
  };

  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = {
      name: nameInput.value,
      category: categorySelect.value,
      basicRest: parseInt(basicM.value || 0)*60 + parseInt(basicS.value || 0),
      specialRest: parseInt(specialM.value || 0)*60 + parseInt(specialS.value || 0),
      maxRest: parseInt(maxM.value || 0)*60 + parseInt(maxS.value || 0),
      sets: parseInt(setsInput.value, 10),
      interRest: parseInt(interM.value || 0)*60 + parseInt(interS.value || 0),
      hasJCup: jcupCheck.checked,
      jcupValue: jcupCheck.checked ? jcupInput.value : null,
      hasSafebar: safebarCheck.checked,
      safebarValue: safebarCheck.checked ? safebarInput.value : null
    };

    if (editModeId) {
      if (confirm('수정하시겠습니까?')) {
        store.updateExercise(editModeId, data);
        resetForm();
      }
    } else {
      store.addExercise(data);
      resetForm();
    }
  });

  const enterEditMode = (ex) => {
    editModeId = ex.id;
    nameInput.value = ex.name;
    categorySelect.value = ex.category || '';
    basicM.value = Math.floor(ex.basicRest / 60);
    basicS.value = ex.basicRest % 60;
    specialM.value = Math.floor(ex.specialRest / 60);
    specialS.value = ex.specialRest % 60;
    maxM.value = Math.floor(ex.maxRest / 60);
    maxS.value = ex.maxRest % 60;
    setsInput.value = ex.sets;
    interM.value = Math.floor((ex.interRest ?? 120) / 60);
    interS.value = (ex.interRest ?? 120) % 60;
    
    jcupCheck.checked = ex.hasJCup;
    jcupInput.disabled = !ex.hasJCup;
    jcupInput.style.opacity = ex.hasJCup ? '1' : '0.5';
    jcupInput.value = ex.jcupValue || '';

    safebarCheck.checked = ex.hasSafebar;
    safebarInput.disabled = !ex.hasSafebar;
    safebarInput.style.opacity = ex.hasSafebar ? '1' : '0.5';
    safebarInput.value = ex.safebarValue || '';

    submitBtn.textContent = '수정 완료';
    submitBtn.classList.add('btn-accent');
    cancelBtn.style.display = 'block';

    // Scroll to top
    container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderList = (state) => {
    listContainer.innerHTML = state.exercises.length === 0 
      ? '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">등록된 운동이 없습니다.</p>'
      : '';

    state.exercises.forEach(ex => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.id = ex.id;
      el.innerHTML = `
        <div style="display: flex; align-items: center;">
          <div class="drag-handle" style="padding: 10px 15px 10px 0; cursor: grab; color: var(--text-secondary);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
          <div style="flex: 1;">
            <h3 style="margin-bottom: 8px;">
              ${ex.category ? `<span class="category-tag">${ex.category}</span>` : ''}
              ${ex.name}
            </h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 2px;">
              목표: ${ex.sets}세트
            </p>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 2px;">
              기본 휴식: ${Math.floor(ex.basicRest/60)}분 ${ex.basicRest%60}초<br>
              특수 휴식: ${Math.floor(ex.specialRest/60)}분 ${ex.specialRest%60}초<br>
              최대 휴식: ${Math.floor(ex.maxRest/60)}분 ${ex.maxRest%60}초<br>
              종목간 휴식: ${Math.floor((ex.interRest ?? 120)/60)}분 ${(ex.interRest ?? 120)%60}초
            </p>
            <p style="font-size: 0.75rem; color: var(--primary-color); margin-top: 4px;">
              ${ex.hasJCup ? `J-Cup: ${ex.jcupValue || '미지정'} ` : ''}${ex.hasSafebar ? `세이프바: ${ex.safebarValue || '미지정'}` : ''}
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-secondary btn-edit" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${ex.id}">편집</button>
            <button class="btn btn-danger btn-delete" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${ex.id}">삭제</button>
          </div>
        </div>
      `;
      
      el.querySelector('.btn-delete').addEventListener('click', (e) => {
        if (confirm('정말 삭제하시겠습니까?')) {
          store.deleteExercise(e.target.dataset.id);
        }
      });

      el.querySelector('.btn-edit').addEventListener('click', (e) => {
        enterEditMode(ex);
      });

      listContainer.appendChild(el);
    });
  };

  const updateCategoryOptions = () => {
    const currentVal = categorySelect.value;
    categorySelect.innerHTML = '<option value="">선택 안 함</option>' + 
      store.state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    if (currentVal && store.state.categories.includes(currentVal)) {
      categorySelect.value = currentVal;
    }
  };

  const renderCategoryModalList = () => {
    modalCategoryList.innerHTML = '';
    store.state.categories.forEach(cat => {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.justifyContent = 'space-between';
      el.style.alignItems = 'center';
      el.style.padding = '8px 0';
      el.style.borderBottom = '1px solid var(--border-color)';
      el.innerHTML = `
        <span>${cat}</span>
        <button type="button" class="btn btn-danger" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">삭제</button>
      `;
      el.querySelector('button').addEventListener('click', () => {
        if (confirm(`'${cat}' 분류를 정말 삭제하시겠습니까?\n(이 분류를 사용하는 운동은 '선택 안 함'으로 변경됩니다)`)) {
          store.deleteCategory(cat);
          renderCategoryModalList();
          updateCategoryOptions();
        }
      });
      modalCategoryList.appendChild(el);
    });
  };

  btnManageCategories.addEventListener('click', () => {
    categoryModal.classList.add('active');
    renderCategoryModalList();
  });
  btnCloseModal.addEventListener('click', () => {
    categoryModal.classList.remove('active');
  });
  categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) categoryModal.classList.remove('active');
  });

  btnAddCategory.addEventListener('click', () => {
    const val = newCategoryInput.value.trim();
    if (val) {
      store.addCategory(val);
      newCategoryInput.value = '';
      renderCategoryModalList();
      updateCategoryOptions();
    }
  });

  store.subscribe((state) => {
    updateCategoryOptions();
    renderList(state);
  });
  
  setTimeout(() => {
    updateCategoryOptions();
    renderList(store.state);
    makeListSortable(listContainer, (newIds) => store.reorderExercises(newIds));
  }, 0);

  return container;
}

// --- Routine Tab ---
function renderScheduleTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-schedule'; // Keep ID for index.html compatibility

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h1 class="page-title">루틴 관리</h1>
      <button id="btn-create-routine" class="btn btn-secondary" style="width: auto; padding: 8px 12px; height: 36px; font-size: 0.875rem;">+ 새 루틴</button>
    </div>
    
    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <select id="routine-select" style="flex: 1; padding: 12px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);"></select>
        <button id="btn-rename-routine" class="btn btn-secondary" style="width: auto; padding: 12px;">이름 변경</button>
        <button id="btn-delete-routine" class="btn btn-danger" style="width: auto; padding: 12px;">삭제</button>
      </div>
    </div>

    <div class="card" id="schedule-add-section">
      <h3 style="margin-bottom: 12px; font-size: 1rem;">현재 루틴에 운동 추가</h3>
      <div style="display: flex; gap: 10px;">
        <select id="schedule-exercise-select" style="flex: 1; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);"></select>
        <div style="display: flex; gap: 5px;">
          <button id="btn-add-schedule" class="btn" style="width: auto;">추가</button>
        </div>
      </div>
    </div>

    <div id="schedule-list"></div>
  `;

  let currentRoutineId = store.state.routines.length > 0 ? store.state.routines[0].id : null;
  const listContainer = container.querySelector('#schedule-list');
  const routineSelect = container.querySelector('#routine-select');
  const btnCreateRoutine = container.querySelector('#btn-create-routine');
  const btnRenameRoutine = container.querySelector('#btn-rename-routine');
  const btnDeleteRoutine = container.querySelector('#btn-delete-routine');

  const select = container.querySelector('#schedule-exercise-select');
  const targetRepsInput = container.querySelector('#schedule-target-reps');
  const targetWeightInput = container.querySelector('#schedule-target-weight');
  const btnAdd = container.querySelector('#btn-add-schedule');
  
  let editModeItemId = null;
  
  const resetScheduleForm = () => {
    editModeItemId = null;
    btnAdd.textContent = '추가';
    btnAdd.classList.remove('btn-accent');
  };

  

  const updateRoutineSelect = () => {
    routineSelect.innerHTML = store.state.routines.length === 0 
      ? '<option value="">루틴이 없습니다.</option>'
      : store.state.routines.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    
    if (currentRoutineId && store.state.routines.find(r => r.id === currentRoutineId)) {
      routineSelect.value = currentRoutineId;
    } else if (store.state.routines.length > 0) {
      currentRoutineId = store.state.routines[0].id;
      routineSelect.value = currentRoutineId;
    } else {
      currentRoutineId = null;
    }
  };

  routineSelect.addEventListener('change', (e) => {
    currentRoutineId = e.target.value;
    renderList(store.state);
  });

  btnCreateRoutine.addEventListener('click', async () => {
    const name = await window.showCustomPrompt('새 루틴 이름을 입력하세요:');
    if (name && name.trim()) {
      store.addRoutine(name.trim());
      currentRoutineId = store.state.routines[store.state.routines.length - 1].id;
      updateRoutineSelect();
      renderList(store.state);
    }
  });

  btnRenameRoutine.addEventListener('click', async () => {
    if (!currentRoutineId) return;
    const routine = store.state.routines.find(r => r.id === currentRoutineId);
    const newName = await window.showCustomPrompt('새로운 이름을 입력하세요:', routine.name);
    if (newName && newName.trim()) {
      store.updateRoutineName(currentRoutineId, newName.trim());
      updateRoutineSelect();
    }
  });

  btnDeleteRoutine.addEventListener('click', () => {
    if (!currentRoutineId) return;
    const routine = store.state.routines.find(r => r.id === currentRoutineId);
    if (confirm(`'${routine.name}' 루틴을 정말 삭제하시겠습니까?`)) {
      store.deleteRoutine(currentRoutineId);
      updateRoutineSelect();
      renderList(store.state);
    }
  });

  btnAdd.addEventListener('click', () => {
    if (!currentRoutineId) return alert('루틴을 먼저 선택하거나 만들어주세요.');
    const exerciseId = select.value;
    const targetReps = targetRepsInput ? targetRepsInput.value : '10';
    const targetWeight = targetWeightInput ? targetWeightInput.value : '';
    if (exerciseId) {
      if (editModeItemId) {
        if (confirm('수정하시겠습니까?')) {
          store.updateRoutineItem(currentRoutineId, editModeItemId, targetReps, targetWeight);
          resetScheduleForm();
        }
      } else {
        store.addRoutineItem(currentRoutineId, exerciseId, targetReps, targetWeight);
        resetScheduleForm();
      }
    }
  });

  const renderList = (state) => {
    const selectedValue = select.value;
    select.innerHTML = state.exercises.length === 0 
      ? '<option value="">운동을 먼저 등록하세요</option>'
      : state.exercises.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('');
    
    if (selectedValue && state.exercises.find(e => e.id === selectedValue)) {
      select.value = selectedValue;
    }

    if (!currentRoutineId) {
      listContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">루틴을 선택하거나 새로 만들어주세요.</p>';
      return;
    }

    const routine = state.routines.find(r => r.id === currentRoutineId);
    if (!routine || routine.items.length === 0) {
      listContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">이 루틴에 등록된 운동이 없습니다.</p>';
      return;
    }

    listContainer.innerHTML = '';
    routine.items.forEach((item, index) => {
      const ex = state.exercises.find(e => e.id === item.exerciseId);
      if (!ex) return;

      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.id = item.id;
      el.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="drag-handle" style="padding: 10px 15px 10px 0; cursor: grab; color: var(--text-secondary);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
          <div style="flex: 1;">
            <h3 style="font-size: 1rem; margin-bottom: 4px;"><span style="color: var(--primary-color); margin-right: 8px;">${index + 1}</span> ${ex.name}</h3>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 2px;">${ex.sets}세트</p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 2px;">
              기본 휴식: ${Math.floor(ex.basicRest/60)}분 ${ex.basicRest%60}초<br>
              특수 휴식: ${Math.floor(ex.specialRest/60)}분 ${ex.specialRest%60}초<br>
              최대 휴식: ${Math.floor(ex.maxRest/60)}분 ${ex.maxRest%60}초<br>
              종목간 휴식: ${Math.floor((ex.interRest ?? 120)/60)}분 ${(ex.interRest ?? 120)%60}초
            </p>
            <p style="font-size: 0.75rem; color: var(--primary-color);">
              ${ex.hasJCup ? `J-Cup: ${ex.jcupValue || '미지정'} ` : ''}${ex.hasSafebar ? `세이프바: ${ex.safebarValue || '미지정'}` : ''}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-danger btn-delete" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">삭제</button>
          </div>
        </div>
      `;
      

      el.querySelector('.btn-delete').addEventListener('click', (e) => {
        if (confirm('정말 삭제하시겠습니까?')) {
          store.deleteRoutineItem(currentRoutineId, e.target.dataset.id);
          if (editModeItemId === e.target.dataset.id) {
            resetScheduleForm();
          }
        }
      });
      listContainer.appendChild(el);
    });
  };

  store.subscribe((state) => {
    updateRoutineSelect();
    renderList(state);
  });
  
  setTimeout(() => {
    updateRoutineSelect();
    renderList(store.state);
    makeListSortable(listContainer, (newIds) => store.reorderRoutineItem(currentRoutineId, newIds));
  }, 0);

  return container;
}

// --- Workout Tab ---
function renderWorkoutTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-workout';

  container.innerHTML = `
    <h1 class="page-title">운동 기록</h1>
    
    <div id="workout-setup">
      <div class="card">
        <h3 style="margin-bottom: 12px;">오늘 수행할 루틴</h3>
        <select id="workout-routine-select" style="width: 100%; padding: 12px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); margin-bottom: 16px;"></select>
        <button id="btn-start-workout" class="btn btn-accent">운동 시작</button>
      </div>
    </div>

    <div id="workout-active" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <span style="color: var(--text-secondary); font-size: 0.875rem;">총 소요 시간</span>
          <div id="total-stopwatch" style="font-size: 1.5rem; font-weight: bold; font-variant-numeric: tabular-nums;">00:00:00</div>
        </div>
        <button id="btn-finish-workout-early" class="btn btn-secondary" style="width: auto; border: 1px solid var(--danger-color); color: var(--danger-color); background: transparent;">운동 종료</button>
      </div>

      <div id="workout-timer-section" style="display: none; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div style="position: relative; width: 250px; height: 250px;">
          <svg class="timer-svg" viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color)" stroke-width="6" />
            <circle id="workout-timer-progress" cx="50" cy="50" r="45" fill="none" stroke="var(--primary-color)" stroke-width="6" stroke-dasharray="282.743" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear, stroke 0.3s ease; stroke-linecap: round;" />
          </svg>
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div id="workout-timer-type" style="font-size: 1.2rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">휴식</div>
            <div id="workout-timer-display" style="font-size: 3.5rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1;">00:00</div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px; width: 100%; max-width: 300px;">
          <button id="btn-workout-timer-add" class="btn btn-secondary" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); background: var(--surface-color);">+ 특수 휴식 연장</button>
          <button id="btn-workout-timer-stop" class="btn btn-secondary" style="flex: 1; padding: 12px; border: 1px solid var(--border-color); background: var(--surface-color);">휴식 건너뛰기</button>
        </div>

        <div id="workout-timer-finished" style="display: none; text-align: center; margin-top: 15px; width: 100%; max-width: 300px;">
          <p style="color: var(--primary-color); font-weight: 600; font-size: 1.1rem; margin-bottom: 12px;">휴식이 완료되었습니다!</p>
          <div style="display: flex; gap: 10px;">
            <button id="btn-workout-timer-extend" class="btn btn-secondary" style="flex: 1;">휴식 연장</button>
            <button id="btn-workout-timer-close" class="btn btn-accent" style="flex: 1;">알람 끄기</button>
          </div>
        </div>
      </div>

      <div id="active-exercise-container"></div>
    </div>
  `;

  const setupView = container.querySelector('#workout-setup');
  const activeView = container.querySelector('#workout-active');
  const routineSelect = container.querySelector('#workout-routine-select');
  const btnStart = container.querySelector('#btn-start-workout');
  const stopwatchDisplay = container.querySelector('#total-stopwatch');
  const exerciseContainer = container.querySelector('#active-exercise-container');
  const btnFinishEarly = container.querySelector('#btn-finish-workout-early');
  
  let stopwatchInterval;
  let alarmPlayed = false;
  let lastWasRunning = false;

  const updateRoutineOptions = () => {
    routineSelect.innerHTML = store.state.routines.length === 0
      ? '<option value="">루틴을 먼저 만드세요</option>'
      : store.state.routines.map(r => `<option value="${r.id}" ${r.id === store.state.workout.selectedRoutineId ? 'selected' : ''}>${r.name}</option>`).join('');
  };

  const updateStopwatch = () => {
    if (store.state.workout.isRecording) {
      const diff = Math.floor((Date.now() - store.state.workout.startTime) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      stopwatchDisplay.textContent = `${h}:${m}:${s}`;
    }
  };
  
  btnFinishEarly.addEventListener('click', () => {
    if (confirm('운동을 조기 종료하시겠습니까? 기록은 저장됩니다.')) {
      store.stopWorkout();
      store.stopTimer();
      stopAlarm();
    }
  });

  const renderActiveWorkout = (state) => {
    const { workout, routines, exercises, timer } = state;
    if (!workout.todayTargets) workout.todayTargets = {};
    updateRoutineOptions();
    
    if (workout.isRecording) {
      setupView.style.display = 'none';
      activeView.style.display = 'block';

      const timerSection = container.querySelector('#workout-timer-section');
      const timerProgress = container.querySelector('#workout-timer-progress');
      const timerTypeLabel = container.querySelector('#workout-timer-type');
      const timerDisplay = container.querySelector('#workout-timer-display');
      const btnTimerAdd = container.querySelector('#btn-workout-timer-add');
      const btnTimerStop = container.querySelector('#btn-workout-timer-stop');
      const timerFinished = container.querySelector('#workout-timer-finished');
      const btnTimerExtend = container.querySelector('#btn-workout-timer-extend');
      const btnTimerClose = container.querySelector('#btn-workout-timer-close');

      const circumference = 2 * Math.PI * 45;

        timerSection.style.display = 'flex';
        
        const m = Math.floor(timer.timeLeft / 60).toString().padStart(2, '0');
        const s = (timer.timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;

        if (timer.totalTime > 0) {
          const offset = circumference - (timer.timeLeft / timer.totalTime) * circumference;
          timerProgress.style.strokeDashoffset = offset;
        } else {
          timerProgress.style.strokeDashoffset = 0;
        }

        if (timer.type === 'basic') {
          timerProgress.style.stroke = 'var(--primary-color)';
          timerTypeLabel.textContent = '기본 휴식';
        } else if (timer.type === 'special') {
          timerProgress.style.stroke = 'var(--warning-color)';
          timerTypeLabel.textContent = '특수 휴식';
        } else if (timer.type === 'max') {
          timerProgress.style.stroke = 'var(--danger-color)';
          timerTypeLabel.textContent = '최대 휴식';
        } else if (timer.type === 'inter') {
          timerProgress.style.stroke = 'var(--accent-color)';
          timerTypeLabel.textContent = '종목간 휴식';
        }

        if (timer.isRunning) {
          btnTimerAdd.style.display = (timer.type === 'max' || timer.type === 'inter') ? 'none' : 'block';
          if (timer.type === 'basic') btnTimerAdd.textContent = '+ 특수 휴식 연장';
          else if (timer.type === 'special') btnTimerAdd.textContent = '+ 최대 휴식 연장';
          btnTimerStop.style.display = 'block';
          timerFinished.style.display = 'none';
          lastWasRunning = true;
          alarmPlayed = false;
        } else {
          btnTimerAdd.style.display = 'none';
          btnTimerStop.style.display = 'none';
          
          if (lastWasRunning && timer.timeLeft === 0) {
            timerFinished.style.display = 'block';
            btnTimerExtend.style.display = (timer.type === 'max' || timer.type === 'inter') ? 'none' : 'block';
            if (timer.type === 'basic') btnTimerExtend.textContent = '특수 휴식 연장';
            else if (timer.type === 'special') btnTimerExtend.textContent = '최대 휴식 연장';
            
            if (!alarmPlayed) {
              const alarm = document.getElementById('alarm-sound');
              if (alarm) {
                alarm.currentTime = 0;
                alarm.play().catch(e => console.log("Audio play blocked", e));
              }
              alarmPlayed = true;
            }
          }
        }
      const routine = routines.find(r => r.id === workout.selectedRoutineId);
      if (!routine) return;
      const currentScheduleItem = routine.items[workout.currentExerciseIndex];

      if (!currentScheduleItem) {
        exerciseContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 40px 20px;">
            <h2 style="margin-bottom: 10px;">🎉 모든 운동 완료!</h2>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">오늘의 루틴을 훌륭하게 소화하셨습니다.</p>
            <button id="btn-finish-workout" class="btn btn-accent" style="width: auto;">운동 종료</button>
          </div>
        `;
        document.getElementById('btn-finish-workout').addEventListener('click', () => {
          store.stopWorkout();
          store.stopTimer();
          stopAlarm();
        });
        return;
      }

      const exercise = exercises.find(e => e.id === currentScheduleItem.exerciseId);
      if (exercise) {
        const targetData = workout.todayTargets[currentScheduleItem.id] || { weight: '', reps: '10', totalSets: exercise.sets };
        const totalSets = targetData.totalSets || exercise.sets;
        const isLastSet = workout.currentSetIndex >= totalSets - 1;

        const precedingRecords = workout.records.filter(r => r.exerciseId === exercise.id && r.exerciseIndex === workout.currentExerciseIndex);
        let setsHtml = '<div style="margin-bottom: 16px;">';
        
        for (let i = 0; i < workout.currentSetIndex; i++) {
          const rec = precedingRecords.find(r => r.setIndex === i);
          if (rec) {
            setsHtml += `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color); opacity: 0.5;">
                <span style="font-weight: 600; color: var(--text-secondary); width: 60px;">${i + 1}세트</span>
                <span style="color: var(--text-secondary); flex: 1; text-align: center;">${rec.weight ? rec.weight + ' kg' : '맨몸'}</span>
                <span style="color: var(--text-secondary); flex: 1; text-align: center;">${rec.reps} 회</span>
                <button type="button" class="btn-edit-set" data-set-index="${i}" style="background: none; border: none; color: var(--text-primary); cursor: pointer; padding: 4px;">✏️</button>
                <span style="color: var(--primary-color); margin-left: 10px; font-weight: bold;">✓</span>
              </div>
            `;
          }
        }

        const showNextSet = !timer.isRunning && !(lastWasRunning && timer.timeLeft === 0);

        if (workout.currentSetIndex < totalSets && showNextSet) {
          const lastRec = precedingRecords[precedingRecords.length - 1];
          const defaultWeight = lastRec ? (lastRec.weight || '') : (targetData.weight || '');
          const defaultReps = lastRec ? lastRec.reps : targetData.reps;

          setsHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
              <span style="font-weight: 600; color: var(--primary-color); width: 60px;">${workout.currentSetIndex + 1}세트</span>
              <div style="display: flex; gap: 8px; flex: 1; justify-content: flex-end;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <input type="number" id="record-weight" step="0.5" value="${defaultWeight}" placeholder="무게" style="width: 70px; padding: 8px; text-align: center; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-primary);">
                  <span style="font-size: 0.875rem;">kg</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <input type="number" id="record-reps" required value="${defaultReps}" placeholder="횟수" style="width: 60px; padding: 8px; text-align: center; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-primary);">
                  <span style="font-size: 0.875rem;">회</span>
                </div>
              </div>
            </div>
          `;
        }
        setsHtml += '</div>';

        exerciseContainer.innerHTML = `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
              <h2 style="font-size: 1.25rem;">${exercise.name}</h2>
              <span style="color: var(--primary-color); font-weight: 600;">${Math.min(workout.currentSetIndex + 1, totalSets)} / ${totalSets} 세트</span>
            </div>
            
            <div style="background: var(--bg-color); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
              <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 4px;">목표: <strong style="color: var(--text-primary);">${targetData.weight ? targetData.weight + 'kg / ' : ''}${targetData.reps}회</strong></p>
              <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0;">휴식: 기본 ${Math.floor(exercise.basicRest/60)}분 ${exercise.basicRest%60}초 / 특수 ${Math.floor(exercise.specialRest/60)}분 ${exercise.specialRest%60}초</p>
            </div>

            <form id="record-set-form">
              ${setsHtml}

              ${isLastSet && showNextSet ? `
                <button type="button" id="btn-add-set" class="btn btn-secondary" style="margin-bottom: 10px; width: 100%; border: 1px dashed var(--border-color); background: transparent;">
                  + 세트 추가
                </button>
              ` : ''}

              ${showNextSet ? `
                <button type="submit" class="btn" style="height: 50px; font-size: 1.1rem; margin-top: 10px;">
                  ${isLastSet ? '마지막 세트 완료' : '세트 완료 및 휴식 시작'}
                </button>
              ` : `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                  휴식 중입니다. 휴식 완료 후 다음 세트 입력이 가능합니다.
                </div>
              `}
            </form>
          </div>
        `;

        if (showNextSet) {
          container.querySelector('#record-set-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const reps = parseInt(container.querySelector('#record-reps').value, 10);
            const weightInput = container.querySelector('#record-weight');
            const weight = weightInput && weightInput.value ? parseFloat(weightInput.value) : null;
            
            const lastRestType = store.state.timer.type;

            store.recordSet({
              exerciseId: exercise.id,
              exerciseIndex: workout.currentExerciseIndex,
              setIndex: workout.currentSetIndex,
              reps: reps,
              weight: weight
            });

            // Update the previous set's restType with the timer type that was just active
            const records = store.state.workout.records;
            const prevRecord = records[records.length - 2];
            if (prevRecord && prevRecord.exerciseIndex === workout.currentExerciseIndex) {
              prevRecord.restType = lastRestType;
              store.save('workout');
            }

            store.nextSet(isLastSet);

            const nextScheduleItem = routine.items[store.state.workout.currentExerciseIndex];
            if (nextScheduleItem) {
              const restTime = isLastSet ? (exercise.interRest ?? 120) : exercise.basicRest;
              store.startTimer(restTime, isLastSet ? 'inter' : 'basic');
            }
          });
        }
        
        if (isLastSet && showNextSet) {
          const btnAddSet = container.querySelector('#btn-add-set');
          if (btnAddSet) {
            btnAddSet.addEventListener('click', () => {
              targetData.totalSets = totalSets + 1;
              store.save('workout');
              store.notify();
            });
          }
        }
        
        container.querySelectorAll('.btn-edit-set').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const setIdx = parseInt(e.target.dataset.setIndex, 10);
            const weight = await window.showCustomPrompt('세트 중량 입력하세요 (빈칸 시 맨몸)', '', 'number');
            const reps = await window.showCustomPrompt('세트 횟수 입력하세요', '10', 'number');
            
            if (reps) {
              store.state.workout.records = store.state.workout.records.map(r => {
                if (r.exerciseIndex === workout.currentExerciseIndex && r.setIndex === setIdx) {
                  return { ...r, reps: parseInt(reps, 10), weight: weight ? parseFloat(weight) : null };
                }
                return r;
              });
              store.save('workout');
              store.notify();
            }
          });
        });

      }
    } else {
      setupView.style.display = 'block';
      activeView.style.display = 'none';
    }
  };

  btnStart.addEventListener('click', () => {
    const routineId = routineSelect.value;
    if (!store.state.workout.todayTargets) store.state.workout.todayTargets = {};
    if (!routineId) {
      alert('[루틴 관리] 탭에서 먼저 추가해주세요.');
      return;
    }
    
    const routine = store.state.routines.find(r => r.id === routineId);
    if (!routine) return;
    
    store.startWorkout(routineId);
    
    routine.items.forEach(item => {
      const ex = store.state.exercises.find(e => e.id === item.exerciseId);
      store.state.workout.todayTargets[item.id] = {
        weight: '',
        reps: '10',
        totalSets: ex ? ex.sets : 5
      };
    });
    store.save('workout');
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    updateStopwatch();
  });

  const stopAlarm = () => {
    const alarm = document.getElementById('alarm-sound');
    if (alarm) { alarm.pause(); alarm.currentTime = 0; }
  };

  const getNextTimerTypeAndAddedTime = (currentType) => {
    let nextType = 'special';
    let addedTime = 60;
    
    const workout = store.state.workout;
    if (workout.isRecording) {
      const routine = store.state.routines.find(r => r.id === workout.selectedRoutineId);
      if (routine) {
        const currentScheduleItem = routine.items[workout.currentExerciseIndex];
        if (currentScheduleItem) {
          const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
          if (exercise) {
            if (currentType === 'basic') {
              addedTime = Math.max(0, exercise.specialRest - exercise.basicRest);
              nextType = 'special';
            } else if (currentType === 'special') {
              addedTime = Math.max(0, exercise.maxRest - exercise.specialRest);
              nextType = 'max';
            }
          }
        }
      }
    }
    return { addedTime, nextType };
  };

  container.addEventListener('click', (e) => {
    if (e.target.id === 'btn-workout-timer-add') {
      const { addedTime, nextType } = getNextTimerTypeAndAddedTime(store.state.timer.type);
      if (addedTime > 0) {
        store.addTimerTime(addedTime);
        store.state.timer.type = nextType; 
        store.notify();
      }
    } else if (e.target.id === 'btn-workout-timer-stop') {
      lastWasRunning = false;
      store.stopTimer();
      stopAlarm();
    } else if (e.target.id === 'btn-workout-timer-extend') {
      const { addedTime, nextType } = getNextTimerTypeAndAddedTime(store.state.timer.type);
      store.startTimer(addedTime, nextType);
      
      const records = store.state.workout.records;
      if (records.length > 0) {
        records[records.length - 1].restType = nextType;
        store.save('workout');
      }
      
      container.querySelector('#workout-timer-finished').style.display = 'none';
      stopAlarm();
    } else if (e.target.id === 'btn-workout-timer-close') {
      lastWasRunning = false;
      store.stopTimer();
      container.querySelector('#workout-timer-finished').style.display = 'none';
      stopAlarm();
    }
  });

  store.subscribe(renderActiveWorkout);

  setTimeout(() => renderActiveWorkout(store.state), 0);
  setInterval(updateStopwatch, 1000);
  updateStopwatch();

  return container;
}

// --- History Tab ---
function renderHistoryTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-history';

  let currentView = 'calendar';
  let selectedHistoryItem = null;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let isEditingHistory = false;

  const formatRest = (seconds) => {
    if (!seconds) return '-';
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getRoutineDisplayName = (h) => {
    let rName = h.routineName;
    if (!rName || rName === 'Imported' || rName === '') {
      if (h.importedRecords && h.importedRecords.length > 0) {
        rName = h.importedRecords.map(r => r.name).join(', ');
      } else if (h.records && h.records.length > 0) {
        rName = Array.from(new Set(h.records.map(r => {
          const ex = h.exercisesSnapshot?.find(e => e.id === r.exerciseId);
          return ex ? ex.name : '';
        }).filter(Boolean))).join(', ');
      } else {
        rName = '기록 없음';
      }
    }
    return rName;
  };

  const renderDetailTable = (historyArray) => {
    const history = historyArray.map(h => {
      let mappedRecords = [...(h.records || [])];
      let exSnapshot = [...(h.exercisesSnapshot || [])];
      
      if (h.importedRecords && h.importedRecords.length > 0) {
        let maxIdx = -1;
        mappedRecords.forEach(r => { if (r.exerciseIndex > maxIdx) maxIdx = r.exerciseIndex; });
        
        h.importedRecords.forEach((ir, irIdx) => {
          maxIdx++;
          const tempExId = 'imported_ex_' + maxIdx;
          exSnapshot.push({ id: tempExId, name: ir.name, basicRest: 0, specialRest: 0, maxRest: 0, interRest: 0 });
          
          ir.sets.forEach((set, sIdx) => {
             mappedRecords.push({
               exerciseIndex: maxIdx,
               exerciseId: tempExId,
               setIndex: set.setIndex !== undefined ? set.setIndex : sIdx,
               weight: set.weight,
               reps: set.reps,
               jcup: '', safebar: ''
             });
          });
        });
      }
      return { ...h, records: mappedRecords, exercisesSnapshot: exSnapshot };
    });

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
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px; position: relative; min-height: 40px;">
          <button id="btn-back-calendar" class="btn btn-secondary" style="position: absolute; left: 0; width: auto; padding: 8px 16px;">&larr; 달력으로</button>
          <h2 style="margin: 0; font-size: 1.25rem; text-align: center;">기록 상세</h2>
          <div style="position: absolute; right: 0;">
            ${isEditingHistory 
              ? `<button id="btn-cancel-history" class="btn btn-secondary" style="width: auto; padding: 6px 12px; margin-right: 8px; font-size: 0.85rem;">취소</button>
                 <button id="btn-save-history" class="btn btn-primary" style="width: auto; padding: 6px 12px; font-size: 0.85rem;">저장</button>`
              : `<button id="btn-edit-history" class="btn btn-secondary" style="width: auto; padding: 6px 12px; font-size: 0.85rem;">편집</button>`
            }
          </div>
        </div>
        <div style="overflow-x: auto; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color);">
          <table style="width: max-content; border-collapse: collapse; text-align: center; font-size: 0.85rem;">
            <thead>
              <tr style="background: var(--bg-color); border-bottom: 3px solid var(--border-color);">
                <th colspan="2" style="padding: 12px 8px; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 10;">일자</th>
                ${history.map(h => {
                  let dStr = h.date;
                  try {
                    let dObj = new Date(h.date.replace(/\./g, '/').replace(/\-/g, '/'));
                    if (!isNaN(dObj.getTime())) {
                      dStr = `${dObj.getFullYear()}/${dObj.getMonth()+1}/${dObj.getDate()}`;
                    }
                  } catch(e) {}
                  return `<th colspan="2" style="padding: 12px 4px; border-right: 1px solid var(--border-color); min-width: 140px;">${dStr}</th>`;
                }).join('')}
              </tr>
              <tr style="background: var(--bg-color); border-bottom: 3px solid var(--border-color);">
                <th colspan="2" style="padding: 8px; border-right: 3px solid var(--border-color); position: sticky; left: 0; background: var(--bg-color); z-index: 10;">루틴</th>
                ${history.map(h => `<th colspan="2" style="padding: 8px 4px; border-right: 1px solid var(--border-color); color: var(--primary-color); white-space: pre-wrap; word-break: keep-all; line-height: 1.2;">${getRoutineDisplayName(h)}</th>`).join('')}
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
              if (isEditingHistory) {
                const w = rec.weight || 0;
                const r = rec.reps || 0;
                html += `<td rowspan="2" style="padding: 0 4px; border-right: 1px solid var(--border-color); ${tdBorderBottom} vertical-align: middle; min-width: 120px;">
                  <input type="number" class="edit-weight" data-ex="${exIdx}" data-set="${s}" value="${w}" style="width: 45px; padding: 4px; text-align: center; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-primary); font-size: 0.8rem;"> kg
                  <input type="number" class="edit-reps" data-ex="${exIdx}" data-set="${s}" value="${r}" style="width: 40px; padding: 4px; text-align: center; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-primary); font-size: 0.8rem;"> 회
                </td>`;
              } else {
                const weightStr = rec.weight ? `${rec.weight}kg ` : '';
                html += `<td rowspan="2" style="padding: 0 8px; border-right: 1px solid var(--border-color); ${tdBorderBottom} vertical-align: middle; min-width: 120px;">${weightStr}${rec.reps}회</td>`;
              }
            } else {
              html += `<td rowspan="2" style="padding: 0 8px; border-right: 1px solid var(--border-color); ${tdBorderBottom} color: var(--border-color); vertical-align: middle; min-width: 120px;">-</td>`;
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
        try {
          let dateString = h.date.replace(/\./g, '/').replace(/\-/g, '/');
          let dObj = new Date(dateString);
          if (isNaN(dObj.getTime())) {
            let parts = h.date.split(/[\.\/\s\-]+/).filter(Boolean);
            if (parts.length >= 3) {
              let y = parts[0].length === 4 ? parts[0] : parts[2].length === 4 ? parts[2] : new Date().getFullYear();
              let m = parts[0].length === 4 ? parts[1] : parts[0];
              let day = parts[0].length === 4 ? parts[2] : parts[1];
              dObj = new Date(`${y}/${m}/${day}`);
            }
          }
          if (!isNaN(dObj.getTime())) {
            return dObj.getFullYear() === currentYear && dObj.getMonth() === currentMonth && dObj.getDate() === d;
          }
        } catch (e) {}
        return false;
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
           let rName = item.routineName;
           if (!rName || rName === 'Imported' || rName === '') {
             if (item.importedRecords && item.importedRecords.length > 0) {
               rName = item.importedRecords.map(r => r.name).join(', ');
             } else if (item.records && item.records.length > 0) {
               rName = Array.from(new Set(item.records.map(r => {
                 const ex = item.exercisesSnapshot?.find(e => e.id === r.exerciseId);
                 return ex ? ex.name : '';
               }).filter(Boolean))).join(', ');
             } else {
               rName = '기록 없음';
             }
           }
           routinesHtml += `<span style="font-size: 0.7rem; color: var(--primary-color); word-break: keep-all; line-height: 1.1; margin-top: 2px;">${rName}</span>`;
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
    } else if (currentView === 'detail' && selectedHistoryItem) {
      try {
        container.innerHTML = renderDetailTable([selectedHistoryItem]);
      } catch (e) {
        alert("표 렌더링 에러: " + e.message);
        currentView = 'calendar';
        container.innerHTML = renderCalendar(history);
      }
    }
  };

  container.addEventListener('click', (e) => {
    const state = store.state;
    
    const calDay = e.target.closest('.cal-day');
    if (calDay && currentView === 'calendar') {
      const hIdx = calDay.getAttribute('data-history-idx');
      if (hIdx !== null && hIdx !== '') {
        const idx = parseInt(hIdx, 10);
        if (state.history && state.history[idx]) {
          selectedHistoryItem = state.history[idx];
          currentView = 'detail';
          renderContent(state);
        }
      }
    }
    
    const btnBack = e.target.closest('#btn-back-calendar');
    if (btnBack && currentView === 'detail') {
      currentView = 'calendar';
      selectedHistoryItem = null;
      isEditingHistory = false;
      renderContent(state);
    }

    const btnEdit = e.target.closest('#btn-edit-history');
    if (btnEdit && currentView === 'detail') {
      isEditingHistory = true;
      renderContent(state);
    }

    const btnCancel = e.target.closest('#btn-cancel-history');
    if (btnCancel && currentView === 'detail') {
      isEditingHistory = false;
      renderContent(state);
    }

    const btnSave = e.target.closest('#btn-save-history');
    if (btnSave && currentView === 'detail') {
      // Gather inputs
      const weights = container.querySelectorAll('.edit-weight');
      const reps = container.querySelectorAll('.edit-reps');
      
      weights.forEach(wInput => {
        const exIdx = parseInt(wInput.dataset.ex, 10);
        const sIdx = parseInt(wInput.dataset.set, 10);
        const rec = selectedHistoryItem.records.find(r => r.exerciseIndex === exIdx && r.setIndex === sIdx);
        if (rec) {
          rec.weight = parseFloat(wInput.value) || 0;
        }
      });
      
      reps.forEach(rInput => {
        const exIdx = parseInt(rInput.dataset.ex, 10);
        const sIdx = parseInt(rInput.dataset.set, 10);
        const rec = selectedHistoryItem.records.find(r => r.exerciseIndex === exIdx && r.setIndex === sIdx);
        if (rec) {
          rec.reps = parseInt(rInput.value, 10) || 0;
        }
      });

      store.save('history');
      isEditingHistory = false;
      renderContent(state);
    }
    
    const btnPrev = e.target.closest('#cal-prev');
    if (btnPrev && currentView === 'calendar') {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderContent(state);
    }
    
    const btnNext = e.target.closest('#cal-next');
    if (btnNext && currentView === 'calendar') {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderContent(state);
    }
  });

  store.subscribe((state) => {
    if (container.classList.contains('active')) {
      renderContent(state);
    }
  });
  
  setTimeout(() => renderContent(store.state), 0);
  container.forceRender = () => renderContent(store.state);
  return container;
}

// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const autoDropdownObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.tagName === 'SELECT') window.makeCustomDropdown(node);
          node.querySelectorAll('select').forEach(window.makeCustomDropdown);
        }
      });
    });
  });
  autoDropdownObserver.observe(document.body, { childList: true, subtree: true });

  // Initial pass for any already in DOM
  document.querySelectorAll('select').forEach(window.makeCustomDropdown);
  const contentArea = document.getElementById('tab-content');
  const navButtons = document.querySelectorAll('.nav-btn');

  const tabs = {
    exercises: renderExercisesTab(),
    schedule: renderScheduleTab(),
    workout: renderWorkoutTab(),
    history: renderHistoryTab(),
    analytics: renderAnalyticsTab()
  };

  for (const key in tabs) {
    contentArea.appendChild(tabs[key]);
  }

  if (!store.state.timer.isRunning) { store.state.timer.timeLeft = 0; store.save('timer'); }
  const switchTab = (tabId) => {
    navButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    for (const key in tabs) {
      if (key === tabId) {
        tabs[key].classList.add('active');
        if (tabs[key].forceRender) tabs[key].forceRender();
      } else {
        tabs[key].classList.remove('active');
      }
    }
  };

  switchTab('workout');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
});
























































