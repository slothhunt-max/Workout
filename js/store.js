// Simple global state management with LocalStorage persistence
class Store {
  constructor() {
    this.state = {
      exercises: JSON.parse(localStorage.getItem('exercises')) || [],
      schedule: JSON.parse(localStorage.getItem('schedule')) || {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] // Sun-Sat
      },
      timer: {
        isRunning: false,
        timeLeft: 0,
        totalTime: 0,
        type: 'basic', // 'basic' or 'special'
        endTime: null // For background calculation
      },
      workout: {
        isRecording: false,
        startTime: null,
        selectedDay: new Date().getDay(),
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        records: [], // { exerciseId, setIndex, reps, weight, jcup, safebar, restType }
      }
    };
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

  // --- Exercises ---
  addExercise(exercise) {
    const newExercise = { ...exercise, id: Date.now().toString() };
    this.state.exercises.push(newExercise);
    this.save('exercises');
    this.notify();
  }

  deleteExercise(id) {
    this.state.exercises = this.state.exercises.filter(e => e.id !== id);
    // Remove from schedule as well
    for (let day in this.state.schedule) {
      this.state.schedule[day] = this.state.schedule[day].filter(item => item.exerciseId !== id);
    }
    this.save('exercises');
    this.save('schedule');
    this.notify();
  }

  // --- Schedule ---
  addScheduleItem(day, exerciseId, targetReps) {
    this.state.schedule[day].push({
      id: Date.now().toString(),
      exerciseId,
      targetReps
    });
    this.save('schedule');
    this.notify();
  }
  
  deleteScheduleItem(day, id) {
    this.state.schedule[day] = this.state.schedule[day].filter(item => item.id !== id);
    this.save('schedule');
    this.notify();
  }

  // --- Timer ---
  startTimer(durationSeconds, type = 'basic') {
    this.state.timer = {
      isRunning: true,
      timeLeft: durationSeconds,
      totalTime: durationSeconds,
      type,
      endTime: Date.now() + durationSeconds * 1000
    };
    this.notify();
  }

  stopTimer() {
    this.state.timer.isRunning = false;
    this.state.timer.endTime = null;
    this.notify();
  }

  addTimerTime(seconds) {
    if (this.state.timer.isRunning) {
      this.state.timer.timeLeft += seconds;
      this.state.timer.totalTime += seconds;
      this.state.timer.endTime += seconds * 1000;
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
      }
      this.notify();
    }
  }

  // --- Workout ---
  startWorkout(day) {
    this.state.workout = {
      isRecording: true,
      startTime: Date.now(),
      selectedDay: day,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      records: []
    };
    this.notify();
  }

  stopWorkout() {
    this.state.workout.isRecording = false;
    // Here we could save the completed workout to a history list
    this.notify();
  }

  recordSet(record) {
    this.state.workout.records.push(record);
    this.notify();
  }

  nextSet(nextExercise = false) {
    if (nextExercise) {
      this.state.workout.currentExerciseIndex++;
      this.state.workout.currentSetIndex = 0;
    } else {
      this.state.workout.currentSetIndex++;
    }
    this.notify();
  }

  save(key) {
    localStorage.setItem(key, JSON.stringify(this.state[key]));
  }
}

export const store = new Store();

// Global timer tick loop
setInterval(() => {
  store.tickTimer();
}, 100);
