        document.body.removeChild(overlay);
        resolve(val);
      }, 200);
    };

    box.querySelector('#edit-cancel').addEventListener('click', () => closeBox(null));
    box.querySelector('#edit-ok').addEventListener('click', () => {
      const res = setsArray.map((_, idx) => {
        return {
          weight: parseFloat(box.querySelector('#edit-w-' + idx).value) || 0,
          reps: parseInt(box.querySelector('#edit-r-' + idx).value, 10) || 0
        };
      });
      closeBox(res);
    });
  });
};

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
