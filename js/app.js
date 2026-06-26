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
      workout: {
        isRecording: false,
        startTime: null,
        selectedRoutineId: routines[0] ? routines[0].id : null,
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        records: [], 
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
      records: []
    };
    this.save('workout');
    this.notify();
  }

  stopWorkout() {
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

// --- Timer Tab ---
function renderTimerTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-timer';

  container.innerHTML = `
    <h1 class="page-title">타이머</h1>
    <div class="timer-container">
      <svg class="timer-svg" viewBox="0 0 100 100">
        <circle class="timer-circle-bg" cx="50" cy="50" r="45"></circle>
        <circle class="timer-circle-progress" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="0"></circle>
      </svg>
      <div class="timer-text" id="timer-display">00:00</div>
      <div class="timer-label" id="timer-type">대기 중</div>
    </div>
    
    <div id="timer-controls">
      <button class="btn btn-accent" id="btn-add-rest" style="display: none; margin-bottom: 12px;">+ 추가 휴식 (특수 휴식 전환)</button>
      <button class="btn btn-danger" id="btn-stop-timer" style="display: none;">타이머 종료</button>
    </div>

    <div id="timer-finished-options" style="display: none; margin-top: 20px;">
      <p style="text-align: center; margin-bottom: 10px; color: var(--warning-color); font-weight: bold;">시간이 종료되었습니다!</p>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-accent" id="btn-extend-rest">추가 휴식</button>
        <button class="btn btn-secondary" id="btn-close-timer">끄기</button>
      </div>
    </div>
  `;

  const display = container.querySelector('#timer-display');
  const typeLabel = container.querySelector('#timer-type');
  const progressCircle = container.querySelector('.timer-circle-progress');
  const btnAddRest = container.querySelector('#btn-add-rest');
  const btnStop = container.querySelector('#btn-stop-timer');
  const finishedOptions = container.querySelector('#timer-finished-options');
  const btnExtend = container.querySelector('#btn-extend-rest');
  const btnClose = container.querySelector('#btn-close-timer');
  
  const circumference = 2 * Math.PI * 45; 

  let lastWasRunning = false;
  let alarmPlayed = false;

  const updateUI = (state) => {
    const { isRunning, timeLeft, totalTime, type } = state.timer;
    
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;

    if (totalTime > 0) {
      const offset = circumference - (timeLeft / totalTime) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    } else {
      progressCircle.style.strokeDashoffset = 0;
    }

    if (type === 'basic') {
      progressCircle.style.stroke = 'var(--primary-color)';
      typeLabel.textContent = '기본 휴식';
    } else if (type === 'special') {
      progressCircle.style.stroke = 'var(--warning-color)';
      typeLabel.textContent = '특수 휴식';
    } else if (type === 'max') {
      progressCircle.style.stroke = 'var(--danger-color)';
      typeLabel.textContent = '최대 휴식';
    } else {
      typeLabel.textContent = '대기 중';
      progressCircle.style.stroke = 'var(--accent-color)';
    }

    if (isRunning) {
      btnAddRest.style.display = type === 'max' ? 'none' : 'block';
      if (type === 'basic') btnAddRest.textContent = '+ 특수 휴식으로 연장';
      else if (type === 'special') btnAddRest.textContent = '+ 최대 휴식으로 연장';
      btnStop.style.display = 'block';
      finishedOptions.style.display = 'none';
      lastWasRunning = true;
      alarmPlayed = false;
    } else {
      btnAddRest.style.display = 'none';
      btnStop.style.display = 'none';
      
      if (lastWasRunning && timeLeft === 0) {
        finishedOptions.style.display = 'block';
        btnExtend.style.display = type === 'max' ? 'none' : 'block';
        if (type === 'basic') btnExtend.textContent = '특수 휴식으로 연장';
        else if (type === 'special') btnExtend.textContent = '최대 휴식으로 연장';
        if (!alarmPlayed) {
          const alarm = document.getElementById('alarm-sound');
          if (alarm) {
            alarm.currentTime = 0;
            alarm.play().catch(e => console.log("Audio play blocked", e));
          }
          alarmPlayed = true;
        }
      } else if (timeLeft === 0) {
        finishedOptions.style.display = 'none';
      }
    }
  };

  store.subscribe(updateUI);
  setTimeout(() => updateUI(store.state), 0);

  btnAddRest.addEventListener('click', () => {
    const workout = store.state.workout;
    let addedTime = 60; 
    let nextType = 'special';
    
    if (workout.isRecording) {
      const schedule = store.state.schedule[workout.selectedDay];
      const currentScheduleItem = schedule[workout.currentExerciseIndex];
      if (currentScheduleItem) {
        const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
        if (exercise) {
          if (store.state.timer.type === 'basic') {
            addedTime = Math.max(0, exercise.specialRest - exercise.basicRest);
            nextType = 'special';
          } else if (store.state.timer.type === 'special') {
            addedTime = Math.max(0, exercise.maxRest - exercise.specialRest);
            nextType = 'max';
          }
        }
      }
    } else {
      if (store.state.timer.type === 'basic') nextType = 'special';
      else nextType = 'max';
    }
    
    if (addedTime > 0) {
      store.addTimerTime(addedTime);
      store.state.timer.type = nextType; 
      store.notify();
    }
  });

  btnStop.addEventListener('click', () => {
    store.stopTimer();
    const alarm = document.getElementById('alarm-sound');
    if (alarm) { alarm.pause(); alarm.currentTime = 0; }
  });

  btnExtend.addEventListener('click', () => {
    const workout = store.state.workout;
    let addedTime = 60;
    let nextType = 'special';
    
    if (workout.isRecording) {
      const schedule = store.state.schedule[workout.selectedDay];
      const currentScheduleItem = schedule[workout.currentExerciseIndex];
      if (currentScheduleItem) {
        const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
        if (exercise) {
          if (store.state.timer.type === 'basic') {
            addedTime = Math.max(0, exercise.specialRest - exercise.basicRest);
            nextType = 'special';
          } else if (store.state.timer.type === 'special') {
            addedTime = Math.max(0, exercise.maxRest - exercise.specialRest);
            nextType = 'max';
          }
        }
      }
    } else {
      if (store.state.timer.type === 'basic') nextType = 'special';
      else nextType = 'max';
    }
    store.startTimer(addedTime, nextType);
    finishedOptions.style.display = 'none';
    const alarm = document.getElementById('alarm-sound');
    if (alarm) { alarm.pause(); alarm.currentTime = 0; }
  });

  btnClose.addEventListener('click', () => {
    store.stopTimer();
    finishedOptions.style.display = 'none';
    const alarm = document.getElementById('alarm-sound');
    if (alarm) { alarm.pause(); alarm.currentTime = 0; }
  });

  return container;
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
            <input type="text" id="ex-name" required placeholder="예: 벤치프레스">
          </div>
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <label>분류</label>
            <select id="ex-category" style="width: 100%; padding: 12px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);"></select>
          </div>
          <button type="button" id="btn-manage-categories" class="btn btn-secondary" style="flex: 0 0 auto; width: auto; padding: 12px; height: 46px;">관리</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label>기본 휴식</label>
            <div style="display: flex; gap: 5px;">
              <input type="number" id="ex-basic-m" min="0" value="1" style="width: 100%;">
              <span style="align-self: center;">분</span>
              <input type="number" id="ex-basic-s" min="0" max="59" value="30" style="width: 100%;">
              <span style="align-self: center;">초</span>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>특수 휴식</label>
            <div style="display: flex; gap: 5px;">
              <input type="number" id="ex-special-m" min="0" value="3" style="width: 100%;">
              <span style="align-self: center;">분</span>
              <input type="number" id="ex-special-s" min="0" max="59" value="0" style="width: 100%;">
              <span style="align-self: center;">초</span>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>최대 휴식</label>
            <div style="display: flex; gap: 5px;">
              <input type="number" id="ex-max-m" min="0" value="5" style="width: 100%;">
              <span style="align-self: center;">분</span>
              <input type="number" id="ex-max-s" min="0" max="59" value="0" style="width: 100%;">
              <span style="align-self: center;">초</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>세트 수</label>
          <input type="number" id="ex-sets" required min="1" value="5">
        </div>

        <div class="checkbox-group" style="align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 150px;">
            <input type="checkbox" id="ex-has-jcup">
            <label for="ex-has-jcup" style="margin: 0;">J-Cup 번호 저장</label>
          </div>
          <input type="number" id="ex-jcup-val" placeholder="입력" disabled style="flex: 1; min-width: 100px; padding: 8px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); opacity: 0.5;">
        </div>

        <div class="checkbox-group" style="align-items: center; justify-content: space-between; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 150px;">
            <input type="checkbox" id="ex-has-safebar">
            <label for="ex-has-safebar" style="margin: 0;">세이프바 번호 저장</label>
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
            <p style="font-size: 0.875rem; color: var(--text-secondary);">
              휴식: ${Math.floor(ex.basicRest/60)}분 ${ex.basicRest%60}초 (특수 ${Math.floor(ex.specialRest/60)}분 ${ex.specialRest%60}초 / 최대 ${Math.floor(ex.maxRest/60)}분 ${ex.maxRest%60}초) / ${ex.sets}세트
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
        <input type="number" id="schedule-target-weight" placeholder="중량(kg)" style="width: 80px; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">
        <input type="text" id="schedule-target-reps" placeholder="횟수" style="width: 70px; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">
        <div style="display: flex; gap: 5px;">
          <button id="btn-add-schedule" class="btn" style="width: auto;">추가</button>
          <button id="btn-cancel-schedule-edit" class="btn btn-secondary" style="width: auto; display: none;">취소</button>
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
  const btnCancelEdit = container.querySelector('#btn-cancel-schedule-edit');
  let editModeItemId = null;
  
  const resetScheduleForm = () => {
    editModeItemId = null;
    targetRepsInput.value = '';
    targetWeightInput.value = '';
    btnAdd.textContent = '추가';
    btnAdd.classList.remove('btn-accent');
    btnCancelEdit.style.display = 'none';
  };

  btnCancelEdit.addEventListener('click', resetScheduleForm);

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

  btnCreateRoutine.addEventListener('click', () => {
    const name = prompt('새 루틴 이름을 입력하세요:');
    if (name && name.trim()) {
      store.addRoutine(name.trim());
      currentRoutineId = store.state.routines[store.state.routines.length - 1].id;
      updateRoutineSelect();
      renderList(store.state);
    }
  });

  btnRenameRoutine.addEventListener('click', () => {
    if (!currentRoutineId) return;
    const routine = store.state.routines.find(r => r.id === currentRoutineId);
    const newName = prompt('새로운 이름을 입력하세요:', routine.name);
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
    const targetReps = targetRepsInput.value || '10';
    const targetWeight = targetWeightInput.value || '';
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
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 2px;">목표: ${item.targetWeight ? item.targetWeight + 'kg / ' : ''}${item.targetReps}회 / ${ex.sets}세트</p>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 2px;">
              휴식: ${Math.floor(ex.basicRest/60)}분 ${ex.basicRest%60}초 (특수 ${Math.floor(ex.specialRest/60)}분 ${ex.specialRest%60}초 / 최대 ${Math.floor(ex.maxRest/60)}분 ${ex.maxRest%60}초)
            </p>
            <p style="font-size: 0.75rem; color: var(--primary-color);">
              ${ex.hasJCup ? `J-Cup: ${ex.jcupValue || '미지정'} ` : ''}${ex.hasSafebar ? `세이프바: ${ex.safebarValue || '미지정'}` : ''}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-edit" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">편집</button>
            <button class="btn btn-danger btn-delete" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">삭제</button>
          </div>
        </div>
      `;
      el.querySelector('.btn-edit').addEventListener('click', () => {
        editModeItemId = item.id;
        select.value = item.exerciseId;
        targetRepsInput.value = item.targetReps;
        targetWeightInput.value = item.targetWeight || '';
        
        btnAdd.textContent = '수정';
        btnAdd.classList.add('btn-accent');
        btnCancelEdit.style.display = 'block';
        
        container.scrollTo({ top: 0, behavior: 'smooth' });
      });

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
        <h3 style="margin-bottom: 12px;">수행할 루틴 선택</h3>
        <select id="workout-routine-select" style="width: 100%; padding: 12px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); margin-bottom: 16px;"></select>
        <button id="btn-start-workout" class="btn btn-accent">운동 시작</button>
      </div>
    </div>

    <div id="workout-active" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <span style="color: var(--text-secondary); font-size: 0.875rem;">전체 경과 시간</span>
          <div id="total-stopwatch" style="font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums;">00:00:00</div>
        </div>
        <button id="btn-finish-workout" class="btn btn-danger" style="width: auto;">운동 종료</button>
      </div>

      <div id="active-exercise-container"></div>
      
      <div class="card" id="mini-timer-card" style="display: none; background: var(--bg-color); border-color: var(--accent-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div id="mini-timer-label" style="font-size: 0.875rem; color: var(--accent-color); font-weight: 600;">휴식 중...</div>
            <div id="mini-timer-display" style="font-size: 1.25rem; font-weight: 700;">00:00</div>
          </div>
          <button id="btn-mini-add-rest" class="btn btn-secondary" style="width: auto; padding: 6px 12px;">+ 추가 휴식</button>
        </div>
      </div>
    </div>
  `;

  let stopwatchInterval = null;
  const setupView = container.querySelector('#workout-setup');
  const activeView = container.querySelector('#workout-active');
  const routineSelect = container.querySelector('#workout-routine-select');
  const btnStart = container.querySelector('#btn-start-workout');

  const updateRoutineOptions = () => {
    routineSelect.innerHTML = store.state.routines.length === 0
      ? '<option value="">등록된 루틴이 없습니다</option>'
      : store.state.routines.map(r => `<option value="${r.id}" ${r.id === store.state.workout.selectedRoutineId ? 'selected' : ''}>${r.name}</option>`).join('');
  };
  const btnFinish = container.querySelector('#btn-finish-workout');
  const stopwatchDisplay = container.querySelector('#total-stopwatch');
  const exerciseContainer = container.querySelector('#active-exercise-container');
  
  const miniTimerCard = container.querySelector('#mini-timer-card');
  const miniTimerDisplay = container.querySelector('#mini-timer-display');
  const miniTimerLabel = container.querySelector('#mini-timer-label');
  const btnMiniAddRest = container.querySelector('#btn-mini-add-rest');

  const updateStopwatch = () => {
    if (store.state.workout.isRecording) {
      const diff = Math.floor((Date.now() - store.state.workout.startTime) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      stopwatchDisplay.textContent = `${h}:${m}:${s}`;
    }
  };

  btnStart.addEventListener('click', () => {
    const routineId = routineSelect.value;
    const routine = store.state.routines.find(r => r.id === routineId);
    if (!routine || routine.items.length === 0) {
      alert('해당 루틴에 등록된 운동이 없습니다. [루틴 관리] 탭에서 먼저 추가해주세요.');
      return;
    }
    store.startWorkout(routineId);
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    updateStopwatch();
  });

  btnFinish.addEventListener('click', () => {
    if (confirm('운동을 종료하시겠습니까?')) {
      store.stopWorkout();
      store.stopTimer();
      clearInterval(stopwatchInterval);
    }
  });

  btnMiniAddRest.addEventListener('click', () => {
    const workout = store.state.workout;
    const routine = store.state.routines.find(r => r.id === workout.selectedRoutineId);
    if (!routine) return;
    const currentScheduleItem = routine.items[workout.currentExerciseIndex];
    let addedTime = 60;
    let nextType = 'special';

    if (currentScheduleItem) {
      const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
      if (exercise) {
        if (store.state.timer.type === 'basic') {
          addedTime = Math.max(0, exercise.specialRest - exercise.basicRest);
          nextType = 'special';
        } else if (store.state.timer.type === 'special') {
          addedTime = Math.max(0, exercise.maxRest - exercise.specialRest);
          nextType = 'max';
        }
      }
    }
    
    if (addedTime > 0) {
      store.addTimerTime(addedTime);
      store.state.timer.type = nextType; 
      store.notify();
    }
  });

  const renderActiveWorkout = (state) => {
    const { workout, routines, exercises, timer } = state;
    updateRoutineOptions();
    
    if (workout.isRecording) {
      setupView.style.display = 'none';
      activeView.style.display = 'block';

      const routine = routines.find(r => r.id === workout.selectedRoutineId);
      if (!routine) return;
      const currentScheduleItem = routine.items[workout.currentExerciseIndex];

      if (!currentScheduleItem) {
        exerciseContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 30px 10px;">
            <h2 style="color: var(--accent-color); margin-bottom: 10px;">🎉 모든 운동 완료!</h2>
            <p style="color: var(--text-secondary);">오늘 계획된 루틴을 모두 마쳤습니다.</p>
          </div>
        `;
        return;
      }

      const exercise = exercises.find(e => e.id === currentScheduleItem.exerciseId);
      if (!exercise) return;

      const isLastSet = workout.currentSetIndex >= exercise.sets - 1;

      exerciseContainer.innerHTML = `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
            <h2 style="font-size: 1.25rem;">${exercise.name}</h2>
            <span style="color: var(--primary-color); font-weight: 600;">${workout.currentSetIndex + 1} / ${exercise.sets} 세트</span>
          </div>
          
          <div style="background: var(--bg-color); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 4px;">목표: <strong style="color: var(--text-primary);">${currentScheduleItem.targetWeight ? currentScheduleItem.targetWeight + 'kg / ' : ''}${currentScheduleItem.targetReps}회</strong></p>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">휴식: 기본 ${Math.floor(exercise.basicRest/60)}분 ${exercise.basicRest%60}초 / 특수 ${Math.floor(exercise.specialRest/60)}분 ${exercise.specialRest%60}초 / 최대 ${Math.floor(exercise.maxRest/60)}분 ${exercise.maxRest%60}초</p>
          </div>

          <form id="record-set-form">
            <div style="display: flex; gap: 10px; margin-bottom: 16px;">
              <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>실행 횟수</label>
                <input type="number" id="record-reps" required placeholder="${currentScheduleItem.targetReps}">
              </div>
              <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>무게 (kg)</label>
                <input type="number" id="record-weight" step="0.5" value="${currentScheduleItem.targetWeight || ''}" placeholder="선택">
              </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 16px;">
              ${exercise.hasJCup ? `
                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                  <label>J-Cup 번호</label>
                  <input type="number" id="record-jcup" required value="${exercise.jcupValue || ''}" placeholder="입력">
                </div>
              ` : ''}
              ${exercise.hasSafebar ? `
                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                  <label>세이프바 번호</label>
                  <input type="number" id="record-safebar" required value="${exercise.safebarValue || ''}" placeholder="입력">
                </div>
              ` : ''}
            </div>

            <button type="submit" class="btn" style="height: 50px; font-size: 1.1rem;" ${timer.isRunning ? 'disabled' : ''}>
              ${timer.isRunning ? '휴식 중...' : (isLastSet ? '마지막 세트 완료' : '세트 완료 및 휴식 시작')}
            </button>
          </form>
        </div>
      `;

      const form = container.querySelector('#record-set-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          store.recordSet({
            exerciseId: exercise.id,
            setIndex: workout.currentSetIndex,
            reps: container.querySelector('#record-reps').value,
            weight: container.querySelector('#record-weight')?.value || null,
            jcup: container.querySelector('#record-jcup')?.value || null,
            safebar: container.querySelector('#record-safebar')?.value || null,
          });

          store.nextSet(isLastSet);

          const newScheduleItem = routine.items[store.state.workout.currentExerciseIndex];
          if (newScheduleItem) {
            store.startTimer(exercise.basicRest, 'basic');
          }
        });
      }

      if (timer.isRunning) {
        miniTimerCard.style.display = 'block';
        const m = Math.floor(timer.timeLeft / 60).toString().padStart(2, '0');
        const s = (timer.timeLeft % 60).toString().padStart(2, '0');
        miniTimerDisplay.textContent = `${m}:${s}`;
        
        btnMiniAddRest.style.display = timer.type === 'max' ? 'none' : 'block';
        if (timer.type === 'basic') btnMiniAddRest.textContent = '+ 특수 휴식 연장';
        else if (timer.type === 'special') btnMiniAddRest.textContent = '+ 최대 휴식 연장';

        if (timer.type === 'special') {
          miniTimerLabel.textContent = '특수 휴식 진행 중...';
          miniTimerLabel.style.color = 'var(--warning-color)';
          miniTimerCard.style.borderColor = 'var(--warning-color)';
        } else if (timer.type === 'max') {
          miniTimerLabel.textContent = '최대 휴식 진행 중...';
          miniTimerLabel.style.color = 'var(--danger-color)';
          miniTimerCard.style.borderColor = 'var(--danger-color)';
        } else {
          miniTimerLabel.textContent = '기본 휴식 진행 중...';
          miniTimerLabel.style.color = 'var(--accent-color)';
          miniTimerCard.style.borderColor = 'var(--accent-color)';
        }
      } else {
        miniTimerCard.style.display = 'none';
      }

    } else {
      setupView.style.display = 'block';
      activeView.style.display = 'none';
    }
  };

  store.subscribe(renderActiveWorkout);
  setTimeout(() => renderActiveWorkout(store.state), 0);

  return container;
}

// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const contentArea = document.getElementById('tab-content');
  const navButtons = document.querySelectorAll('.nav-btn');

  const tabs = {
    timer: renderTimerTab(),
    exercises: renderExercisesTab(),
    schedule: renderScheduleTab(),
    workout: renderWorkoutTab()
  };

  for (const key in tabs) {
    contentArea.appendChild(tabs[key]);
  }

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
      } else {
        tabs[key].classList.remove('active');
      }
    }
  };

  switchTab('timer');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
});
