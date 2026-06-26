import { store } from '../store.js';

export function renderTimerTab() {
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

    <!-- 시간이 끝났을 때 모달/옵션 -->
    <div id="timer-finished-options" style="display: none; margin-top: 20px;">
      <p style="text-align: center; margin-bottom: 10px; color: var(--warning-color); font-weight: bold;">시간이 종료되었습니다!</p>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-accent" id="btn-extend-rest">추가 휴식</button>
        <button class="btn btn-secondary" id="btn-close-timer">끄기</button>
      </div>
    </div>
  `;

  // UI elements
  const display = container.querySelector('#timer-display');
  const typeLabel = container.querySelector('#timer-type');
  const progressCircle = container.querySelector('.timer-circle-progress');
  const btnAddRest = container.querySelector('#btn-add-rest');
  const btnStop = container.querySelector('#btn-stop-timer');
  const finishedOptions = container.querySelector('#timer-finished-options');
  const btnExtend = container.querySelector('#btn-extend-rest');
  const btnClose = container.querySelector('#btn-close-timer');
  
  const circumference = 2 * Math.PI * 45; // 282.74

  // Logic
  let lastWasRunning = false;
  let alarmPlayed = false;

  const updateUI = (state) => {
    const { isRunning, timeLeft, totalTime, type } = state.timer;
    
    // Format time
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;

    // Update Circle
    if (totalTime > 0) {
      const offset = circumference - (timeLeft / totalTime) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    } else {
      progressCircle.style.strokeDashoffset = 0;
    }

    // Colors and labels
    if (type === 'basic') {
      progressCircle.style.stroke = 'var(--primary-color)';
      typeLabel.textContent = '기본 휴식';
    } else if (type === 'special') {
      progressCircle.style.stroke = 'var(--warning-color)';
      typeLabel.textContent = '특수 휴식';
    } else {
      typeLabel.textContent = '대기 중';
      progressCircle.style.stroke = 'var(--accent-color)';
    }

    // Visibility
    if (isRunning) {
      btnAddRest.style.display = 'block';
      btnStop.style.display = 'block';
      finishedOptions.style.display = 'none';
      lastWasRunning = true;
      alarmPlayed = false;
    } else {
      btnAddRest.style.display = 'none';
      btnStop.style.display = 'none';
      
      // Timer just finished
      if (lastWasRunning && timeLeft === 0) {
        finishedOptions.style.display = 'block';
        if (!alarmPlayed) {
          const alarm = document.getElementById('alarm-sound');
          if (alarm) {
            alarm.currentTime = 0;
            alarm.play().catch(e => console.log("Audio play blocked by browser", e));
          }
          alarmPlayed = true;
        }
      } else if (timeLeft === 0) {
        finishedOptions.style.display = 'none';
      }
    }
  };

  store.subscribe(updateUI);

  // Initial update
  setTimeout(() => updateUI(store.state), 0);

  // Events
  btnAddRest.addEventListener('click', () => {
    // If currently basic rest, change to special rest. We need context of current exercise.
    // For Tab 1 standalone, we'll just add 60 seconds as a fallback if no workout is active.
    const workout = store.state.workout;
    let addedTime = 60; // default 1 min
    
    if (workout.isRecording) {
      const schedule = store.state.schedule[workout.selectedDay];
      const currentScheduleItem = schedule[workout.currentExerciseIndex];
      if (currentScheduleItem) {
        const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
        if (exercise) {
          // Special rest - basic rest (convert minutes to seconds)
          addedTime = Math.max(0, (exercise.specialRest - exercise.basicRest) * 60);
        }
      }
    }
    
    store.addTimerTime(addedTime);
    store.state.timer.type = 'special'; // Force update type
    store.notify();
  });

  btnStop.addEventListener('click', () => {
    store.stopTimer();
    const alarm = document.getElementById('alarm-sound');
    if (alarm) { alarm.pause(); alarm.currentTime = 0; }
  });

  btnExtend.addEventListener('click', () => {
    // Same logic as add rest
    const workout = store.state.workout;
    let addedTime = 60;
    if (workout.isRecording) {
      const schedule = store.state.schedule[workout.selectedDay];
      const currentScheduleItem = schedule[workout.currentExerciseIndex];
      if (currentScheduleItem) {
        const exercise = store.state.exercises.find(e => e.id === currentScheduleItem.exerciseId);
        if (exercise) {
          addedTime = Math.max(0, (exercise.specialRest - exercise.basicRest) * 60);
        }
      }
    }
    store.startTimer(addedTime, 'special');
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
