import { store } from '../store.js';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function renderWorkoutTab() {
  const container = document.createElement('div');
  container.className = 'tab-pane';
  container.id = 'tab-workout';

  container.innerHTML = `
    <h1 class="page-title">운동 기록</h1>
    
    <div id="workout-setup">
      <div class="card">
        <h3 style="margin-bottom: 12px;">오늘의 운동 일정 선택</h3>
        <select id="workout-day-select" style="width: 100%; padding: 12px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); margin-bottom: 16px;">
          ${DAYS.map((d, i) => `<option value="${i}" ${i === new Date().getDay() ? 'selected' : ''}>${d}요일 루틴</option>`).join('')}
        </select>
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
  const daySelect = container.querySelector('#workout-day-select');
  const btnStart = container.querySelector('#btn-start-workout');
  const btnFinish = container.querySelector('#btn-finish-workout');
  const stopwatchDisplay = container.querySelector('#total-stopwatch');
  const exerciseContainer = container.querySelector('#active-exercise-container');
  
  // Mini Timer
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
    const day = parseInt(daySelect.value, 10);
    const schedule = store.state.schedule[day];
    if (!schedule || schedule.length === 0) {
      alert('해당 요일에 등록된 운동이 없습니다.');
      return;
    }
    store.startWorkout(day);
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
    const schedule = store.state.schedule[workout.selectedDay];
    const currentScheduleItem = schedule[workout.currentExerciseIndex];
    let addedTime = 60;
    if (currentScheduleItem) {
      const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
      if (exercise) {
        addedTime = Math.max(0, (exercise.specialRest - exercise.basicRest) * 60);
      }
    }
    store.addTimerTime(addedTime);
    store.state.timer.type = 'special'; // Update type visually
    store.notify();
  });

  const renderActiveWorkout = (state) => {
    const { workout, schedule: allSchedules, exercises, timer } = state;
    
    if (workout.isRecording) {
      setupView.style.display = 'none';
      activeView.style.display = 'block';

      const schedule = allSchedules[workout.selectedDay];
      const currentScheduleItem = schedule[workout.currentExerciseIndex];

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
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 4px;">목표 횟수: <strong style="color: var(--text-primary);">${currentScheduleItem.targetReps}회</strong></p>
            <p style="font-size: 0.875rem; color: var(--text-secondary);">휴식: 기본 ${exercise.basicRest}분 / 특수 ${exercise.specialRest}분</p>
          </div>

          <form id="record-set-form">
            <div style="display: flex; gap: 10px; margin-bottom: 16px;">
              <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>실행 횟수</label>
                <input type="text" id="record-reps" required placeholder="${currentScheduleItem.targetReps}">
              </div>
              <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label>무게 (kg)</label>
                <input type="number" id="record-weight" step="0.5" placeholder="선택">
              </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 16px;">
              ${exercise.hasJCup ? `
                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                  <label>J-Cup 번호</label>
                  <input type="number" id="record-jcup" required placeholder="입력">
                </div>
              ` : ''}
              ${exercise.hasSafebar ? `
                <div class="form-group" style="flex: 1; margin-bottom: 0;">
                  <label>세이프바 번호</label>
                  <input type="number" id="record-safebar" required placeholder="입력">
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

          // Start timer only if not finished all exercises
          const newScheduleItem = schedule[store.state.workout.currentExerciseIndex];
          if (newScheduleItem) {
            store.startTimer(exercise.basicRest * 60, 'basic');
          }
        });
      }

      // Update mini timer visibility and logic
      if (timer.isRunning) {
        miniTimerCard.style.display = 'block';
        const m = Math.floor(timer.timeLeft / 60).toString().padStart(2, '0');
        const s = (timer.timeLeft % 60).toString().padStart(2, '0');
        miniTimerDisplay.textContent = `${m}:${s}`;
        
        if (timer.type === 'special') {
          miniTimerLabel.textContent = '특수 휴식 진행 중...';
          miniTimerLabel.style.color = 'var(--warning-color)';
          miniTimerCard.style.borderColor = 'var(--warning-color)';
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
