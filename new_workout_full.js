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
      store.finishWorkout();
      stopAlarm();
    }
  });

  const renderActiveWorkout = (state) => {
    const { workout, routines, exercises, timer } = state;
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

      if (timer.isRunning || (lastWasRunning && timer.timeLeft === 0) || (timer.timeLeft > 0 && timer.type !== 'basic')) {
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
      } else {
        timerSection.style.display = 'none';
        lastWasRunning = false;
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
          store.finishWorkout();
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
            
            store.addRecord(
              exercise.id,
              workout.currentExerciseIndex,
              workout.currentSetIndex,
              reps,
              weight
            );

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
          btn.addEventListener('click', (e) => {
            const setIdx = parseInt(e.target.dataset.setIndex, 10);
            const weight = prompt('수정할 무게를 입력하세요 (맨몸일 경우 비워둠)');
            const reps = prompt('수정할 횟수를 입력하세요', '10');
            
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
    if (!routineId) {
      alert('[루틴 관리] 탭에서 먼저 추가해주세요.');
      return;
    }
    
    const routine = store.state.routines.find(r => r.id === routineId);
    if (!routine) return;
    
    routine.items.forEach(item => {
      const ex = store.state.exercises.find(e => e.id === item.exerciseId);
      store.state.workout.todayTargets[item.id] = {
        weight: '',
        reps: '10',
        totalSets: ex ? ex.sets : 5
      };
    });
    
    store.startWorkout(routineId);
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
      store.stopTimer();
      stopAlarm();
    } else if (e.target.id === 'btn-workout-timer-extend') {
      const { addedTime, nextType } = getNextTimerTypeAndAddedTime(store.state.timer.type);
      store.startTimer(addedTime, nextType);
      container.querySelector('#workout-timer-finished').style.display = 'none';
      stopAlarm();
    } else if (e.target.id === 'btn-workout-timer-close') {
      store.stopTimer();
      container.querySelector('#workout-timer-finished').style.display = 'none';
      stopAlarm();
    }
  });

  store.subscribe(renderActiveWorkout);
  setInterval(() => {
    if (store.state.timer.isRunning || store.state.timer.timeLeft > 0) {
      renderActiveWorkout(store.state);
    }
  }, 1000);
  setTimeout(() => renderActiveWorkout(store.state), 0);

  return container;
}
