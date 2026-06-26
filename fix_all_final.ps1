$ErrorActionPreference = 'Stop'
Copy-Item "github_app.js" -Destination ".\js\app.js" -Force
$code = Get-Content .\js\app.js -Encoding UTF8 -Raw

# Replace emojis
$code = $code.Replace('🗑️', '삭제')
$code = $code.Replace('✏️', '편집')

# Batch 1: Add interRest
$target1 = @'
        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
          <label style="margin: 0; white-space: nowrap;">세트 수</label>
          <input type="number" id="ex-sets" required min="1" value="5" style="width: 80px;">
        </div>
'@
$repl1 = @'
        <div class="form-group" style="display: flex; align-items: center; gap: 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="margin: 0; white-space: nowrap;">세트 수</label>
            <input type="number" id="ex-sets" required min="1" value="5" style="width: 80px;">
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <label style="margin: 0; white-space: nowrap;">종목간 휴식</label>
            <div style="display: flex; gap: 5px;">
              <input type="number" id="ex-inter-m" min="0" value="2" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">분</span>
              <input type="number" id="ex-inter-s" min="0" max="59" value="0" style="width: 100%;">
              <span style="align-self: center; white-space: nowrap;">초</span>
            </div>
          </div>
        </div>
'@
$code = $code.Replace($target1.Trim(), $repl1.Trim())

$target2 = "const setsInput = container.querySelector('#ex-sets');"
$repl2 = "const setsInput = container.querySelector('#ex-sets');`n  const interM = container.querySelector('#ex-inter-m');`n  const interS = container.querySelector('#ex-inter-s');"
$code = $code.Replace($target2, $repl2)

$target3 = @'
    maxM.value = "5"; maxS.value = "0";
    setsInput.value = "5";
'@
$repl3 = @'
    maxM.value = "5"; maxS.value = "0";
    setsInput.value = "5";
    interM.value = "2"; interS.value = "0";
'@
$code = $code.Replace($target3.Trim(), $repl3.Trim())

$target4 = @'
      specialRest: parseInt(specialM.value || 0)*60 + parseInt(specialS.value || 0),
      maxRest: parseInt(maxM.value || 0)*60 + parseInt(maxS.value || 0),
      sets: parseInt(setsInput.value, 10),
'@
$repl4 = @'
      specialRest: parseInt(specialM.value || 0)*60 + parseInt(specialS.value || 0),
      maxRest: parseInt(maxM.value || 0)*60 + parseInt(maxS.value || 0),
      sets: parseInt(setsInput.value, 10),
      interRest: parseInt(interM.value || 0)*60 + parseInt(interS.value || 0),
'@
$code = $code.Replace($target4.Trim(), $repl4.Trim())

$target5 = @'
    maxM.value = Math.floor(ex.maxRest / 60);
    maxS.value = ex.maxRest % 60;
    setsInput.value = ex.sets;
'@
$repl5 = @'
    maxM.value = Math.floor(ex.maxRest / 60);
    maxS.value = ex.maxRest % 60;
    setsInput.value = ex.sets;
    interM.value = Math.floor((ex.interRest ?? 120) / 60);
    interS.value = (ex.interRest ?? 120) % 60;
'@
$code = $code.Replace($target5.Trim(), $repl5.Trim())

$target6 = @'
              최대 휴식: ${Math.floor(ex.maxRest/60)}분 ${ex.maxRest%60}초
            </p>
'@
$repl6 = @'
              최대 휴식: ${Math.floor(ex.maxRest/60)}분 ${ex.maxRest%60}초<br>
              종목간 휴식: ${Math.floor((ex.interRest ?? 120)/60)}분 ${(ex.interRest ?? 120)%60}초
            </p>
'@
$code = $code.Replace($target6.Trim(), $repl6.Trim())

$target7 = @'
        ex.maxRest = ex.specialRest; 
        needsSave = true;
      }
      return ex;
'@
$repl7 = @'
        ex.maxRest = ex.specialRest; 
        needsSave = true;
      }
      if (typeof ex.interRest !== 'number') {
        ex.interRest = 120;
        needsSave = true;
      }
      return ex;
'@
$code = $code.Replace($target7.Trim(), $repl7.Trim())

# Batch 2: Remove Targets and Routine Edit functionality
$target8 = @'
    const targetRepsInput = container.querySelector('#schedule-target-reps');
    const targetWeightInput = container.querySelector('#schedule-target-weight');
    targetRepsInput.value = '';
    targetWeightInput.value = '';
'@
$repl8 = @'
'@
$code = $code.Replace($target8.Trim(), $repl8.Trim())

$target9 = @'
        <input type="number" id="schedule-target-weight" placeholder="중량(kg)" style="width: 80px; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">
        <input type="text" id="schedule-target-reps" placeholder="횟수" style="width: 70px; padding: 10px; border-radius: 8px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color);">
        <div style="display: flex; gap: 5px;">
          <button id="btn-add-schedule" class="btn" style="width: auto;">추가</button>
          <button id="btn-cancel-schedule-edit" class="btn btn-secondary" style="width: auto; display: none;">취소</button>
        </div>
'@
$repl9 = @'
        <div style="display: flex; gap: 5px;">
          <button id="btn-add-schedule" class="btn" style="width: auto;">추가</button>
        </div>
'@
$code = $code.Replace($target9.Trim(), $repl9.Trim())

$target10 = @'
  btnAdd.addEventListener('click', () => {
    if (!currentRoutineId) return alert('루틴을 선택하거나 새로 만들어주세요.');
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
'@
$repl10 = @'
  btnAdd.addEventListener('click', () => {
    if (!currentRoutineId) return alert('루틴을 선택하거나 새로 만들어주세요.');
    const exerciseId = select.value;
    if (exerciseId) {
      store.addRoutineItem(currentRoutineId, exerciseId, '10', '');
      resetScheduleForm();
    }
  });
'@
$code = $code.Replace($target10.Trim(), $repl10.Trim())

$target11 = @'
  const resetScheduleForm = () => {
    editModeItemId = null;
    targetRepsInput.value = '';
    targetWeightInput.value = '';
    btnAdd.textContent = '추가';
    btnAdd.classList.remove('btn-accent');
    btnCancelEdit.style.display = 'none';
  };
'@
$repl11 = @'
  const resetScheduleForm = () => {
    editModeItemId = null;
    btnAdd.textContent = '추가';
    btnAdd.classList.remove('btn-accent');
  };
'@
$code = $code.Replace($target11.Trim(), $repl11.Trim())

$target11_1 = "btnCancelEdit.addEventListener('click', resetScheduleForm);"
$repl11_1 = ""
$code = $code.Replace($target11_1, $repl11_1)
$target11_2 = "const btnCancelEdit = container.querySelector('#btn-cancel-schedule-edit');"
$repl11_2 = ""
$code = $code.Replace($target11_2, $repl11_2)

$target12 = @'
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 2px;">목표: ${item.targetWeight ? item.targetWeight + 'kg / ' : ''}${item.targetReps}회 / ${ex.sets}세트</p>
'@
$repl12 = @'
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 2px;">${ex.sets}세트</p>
'@
$code = $code.Replace($target12.Trim(), $repl12.Trim())

$target13 = @'
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-secondary btn-edit" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">편집</button>
            <button class="btn btn-danger btn-delete" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">삭제</button>
          </div>
'@
$repl13 = @'
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-danger btn-delete" style="width: auto; padding: 6px 10px; font-size: 0.8rem;" data-id="${item.id}">삭제</button>
          </div>
'@
$code = $code.Replace($target13.Trim(), $repl13.Trim())

$target14 = @'
      el.querySelector('.btn-edit').addEventListener('click', () => {
        editModeItemId = item.id;
        select.value = item.exerciseId;
        targetRepsInput.value = item.targetReps;
        targetWeightInput.value = item.targetWeight || '';
        
        btnAdd.textContent = '수정';
        btnAdd.classList.add('btn-accent');
        btnCancelEdit.style.display = 'block';
      });
'@
$code = $code.Replace($target14.Trim(), "")


# Batch 3: Completely rewrite renderWorkoutTab
$startIndex = $code.IndexOf('// --- Workout Tab ---')
$endIndex = $code.IndexOf('// --- Main App Logic ---')
if ($startIndex -eq -1 -or $endIndex -eq -1) { Write-Output "Not found workout tab"; exit }

$before = $code.Substring(0, $startIndex)
$after = $code.Substring($endIndex)
$after = $after.Replace("switchTab('timer');", "switchTab('workout');")
$after = $after.Replace("timer: renderTimerTab(),", "")

$newWorkoutTab = Get-Content .\new_workout_full.js -Encoding UTF8 -Raw
$finalCode = $before + "// --- Workout Tab ---`n" + $newWorkoutTab + "`n" + $after
Set-Content .\js\app.js $finalCode -Encoding UTF8

# Remove Timer tab entirely
$code = Get-Content .\js\app.js -Encoding UTF8 -Raw
$tStartIndex = $code.IndexOf('// --- Timer Tab ---')
$tEndIndex = $code.IndexOf('// --- Exercises Tab ---')
if ($tStartIndex -ne -1 -and $tEndIndex -ne -1) {
    $beforeT = $code.Substring(0, $tStartIndex)
    $afterT = $code.Substring($tEndIndex)
    Set-Content .\js\app.js ($beforeT + $afterT) -Encoding UTF8
}

Write-Output "All fixes applied seamlessly!"
