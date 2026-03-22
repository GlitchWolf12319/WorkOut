/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bolt, 
  History, 
  Calendar as CalendarIcon, 
  BarChart3, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  Lock, 
  Rocket,
  ChevronRight,
  Terminal,
  Settings,
  ChevronLeft,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';

interface WorkoutItem {
  id: string;
  name: string;
  target: string;
  weight: string;
  reps: number;
  sets: string;
  completed: boolean;
}

interface ScheduleDay {
  day: string;
  exercises: WorkoutItem[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_SCHEDULE: ScheduleDay[] = DAYS.map(day => ({
  day,
  exercises: []
}));

const INITIAL_WORKOUT: WorkoutItem[] = [];

interface ArchiveEntry {
  id: string;
  date: string;
  day: string;
  type: 'COMPLETED' | 'PUNISHMENT' | 'INCOMPLETE';
  details: string;
  exercises?: WorkoutItem[];
  progress?: number;
}

export default function App() {
  const [workout, setWorkout] = useState<WorkoutItem[]>(() => {
    const saved = localStorage.getItem('sovereign_workout');
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT;
  });
  const [schedule, setSchedule] = useState<ScheduleDay[]>(() => {
    const saved = localStorage.getItem('sovereign_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });
  const [archive, setArchive] = useState<ArchiveEntry[]>(() => {
    const saved = localStorage.getItem('sovereign_archive');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('Daily Quest');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newExercise, setNewExercise] = useState({ name: '', target: '', weight: '', reps: 0, sets: '' });
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeftInDay, setTimeLeftInDay] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedArchiveDate, setSelectedArchiveDate] = useState<Date | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [exp, setExp] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_exp');
    return saved ? parseInt(saved) : 0;
  });

  const RANKS = useMemo(() => [
    { name: 'E', min: 0, max: 1000, title: 'RECRUIT' },
    { name: 'D', min: 1001, max: 2500, title: 'SOLDIER' },
    { name: 'C', min: 2501, max: 5000, title: 'OPERATOR' },
    { name: 'B', min: 5001, max: 8000, title: 'ELITE' },
    { name: 'A', min: 8001, max: 12000, title: 'COMMANDER' },
    { name: 'S', min: 12001, max: 18000, title: 'MONARCH' },
    { name: 'S+', min: 18001, max: 25000, title: 'SHADOW LORD' },
    { name: 'S++', min: 25001, max: Infinity, title: 'SOVEREIGN' },
  ], []);

  const currentRank = useMemo(() => {
    return RANKS.find(r => exp >= r.min && exp <= r.max) || RANKS[0];
  }, [exp, RANKS]);

  const nextRank = useMemo(() => {
    const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);
    return RANKS[currentIndex + 1] || null;
  }, [currentRank, RANKS]);

  const rankProgress = useMemo(() => {
    if (!nextRank) return 100;
    const range = nextRank.min - currentRank.min;
    const progress = exp - currentRank.min;
    return Math.min(Math.max((progress / range) * 100, 0), 100);
  }, [exp, currentRank, nextRank]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeftInDay(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('sovereign_workout', JSON.stringify(workout));
  }, [workout]);

  useEffect(() => {
    localStorage.setItem('sovereign_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('sovereign_archive', JSON.stringify(archive));
  }, [archive]);

  useEffect(() => {
    localStorage.setItem('sovereign_exp', exp.toString());
  }, [exp]);

  // Auto-Violation Check & Daily Reset
  useEffect(() => {
    const checkViolations = () => {
      const lastChecked = localStorage.getItem('sovereign_last_check');
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentDayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];

      if (lastChecked && lastChecked !== todayStr) {
        const lastDate = new Date(lastChecked);
        const missedDays: ArchiveEntry[] = [];
        
        // Check each day between lastChecked and today
        let checkDate = new Date(lastDate);
        checkDate.setDate(checkDate.getDate() + 1);

        while (checkDate.toISOString().split('T')[0] < todayStr) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const dayName = DAYS[checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1];
          
          // Check if this day already has a completion or punishment
          const hasEntry = archive.some(entry => entry.date === dateStr);
          
          if (!hasEntry) {
            missedDays.push({
              id: Math.random().toString(36).substr(2, 9),
              date: dateStr,
              day: dayName,
              type: 'PUNISHMENT',
              details: `Protocol Violation: Missed ${dayName} Cycle (Auto-Logged)`,
            });
            setExp(prev => Math.max(0, prev - 1000)); // Missed day penalty
          }
          
          checkDate.setDate(checkDate.getDate() + 1);
        }

        if (missedDays.length > 0) {
          setArchive(prev => [...missedDays, ...prev]);
        }

        // Auto-fill Daily Quest with exercises from the current day's schedule
        const todaySchedule = schedule.find(s => s.day === currentDayName);
        if (todaySchedule) {
          setWorkout(todaySchedule.exercises.map(ex => ({ ...ex, completed: false })));
        } else {
          setWorkout([]);
        }
      } else if (!lastChecked) {
        // First time initialization
        const todaySchedule = schedule.find(s => s.day === currentDayName);
        if (todaySchedule && todaySchedule.exercises.length > 0) {
          setWorkout(todaySchedule.exercises.map(ex => ({ ...ex, completed: false })));
        }
      }
      
      localStorage.setItem('sovereign_last_check', todayStr);
    };

    checkViolations();
  }, [archive, schedule]);

  // Sync today's workout with schedule changes
  useEffect(() => {
    const today = new Date();
    const currentDayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    const todaySchedule = schedule.find(s => s.day === currentDayName);
    
    if (todaySchedule) {
      // Only sync if the exercises are different (to avoid infinite loops or resetting progress)
      // We check if names match to see if it's the same list
      const scheduleNames = todaySchedule.exercises.map(e => e.name).join('|');
      const workoutNames = workout.map(e => e.name).join('|');
      
      if (scheduleNames !== workoutNames) {
        setWorkout(todaySchedule.exercises.map(ex => ({ ...ex, completed: false })));
      }
    }
  }, [schedule]);

  const logWorkout = useCallback(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    
    const completedCount = workout.filter(item => item.completed).length;
    const currentProgress = Math.round((completedCount / workout.length) * 100);

    const entry: ArchiveEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      day: dayName,
      type: currentProgress === 100 ? 'COMPLETED' : 'INCOMPLETE',
      details: currentProgress === 100 
        ? `Completed Protocol: ${dayName} Cycle` 
        : `Breached Protocol: ${dayName} Cycle (${currentProgress}%)`,
      exercises: [...workout],
      progress: currentProgress
    };

    setArchive(prev => [entry, ...prev]);
    setIsTimerActive(false);

    // Apply EXP changes
    if (currentProgress === 100) {
      setExp(prev => prev + 500); // Completion bonus
    } else {
      setExp(prev => Math.max(0, prev - 300)); // Breach penalty
    }
  }, [workout, archive]);

  const completedCount = workout.filter(item => item.completed).length;
  const progress = Math.round((completedCount / workout.length) * 100);

  // Auto-Complete when 100%
  useEffect(() => {
    if (progress === 100 && workout.length > 0 && isTimerActive) {
      setIsTimerActive(false);
      const todayStr = new Date().toISOString().split('T')[0];
      const alreadyLogged = archive.some(entry => entry.date === todayStr && entry.type === 'COMPLETED');
      if (!alreadyLogged) {
        logWorkout();
      }
    }
  }, [progress, workout.length, archive, isTimerActive, logWorkout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setActiveTab('Daily Quest');
    setIsTimerActive(true);
    setTimer(0);
  };

  const toggleComplete = (id: string) => {
    setWorkout(prev => prev.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed;
        setExp(prevExp => newCompleted ? prevExp + 100 : Math.max(0, prevExp - 100));
        return { ...item, completed: newCompleted };
      }
      return item;
    }));
  };

  const updateWorkoutItem = (id: string, field: keyof WorkoutItem, value: string | number) => {
    setWorkout(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getOverloadSuggestion = (exerciseName: string) => {
    const history = archive
      .filter(e => e.exercises)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (history.length === 0) return null;

    const lastCompletedEntry = history.find(e => e.type === 'COMPLETED');
    if (!lastCompletedEntry) return null;

    const pastEx = lastCompletedEntry.exercises?.find(ex => ex.name.toUpperCase() === exerciseName.toUpperCase());
    if (!pastEx) return null;

    // Check if they've breached this exercise recently
    const recentBreach = history.slice(0, 3).some(e => 
      e.type === 'INCOMPLETE' && e.exercises?.some(ex => ex.name.toUpperCase() === exerciseName.toUpperCase() && !ex.completed)
    );

    if (recentBreach) return null;

    // Simple heuristic: if weight is numeric, suggest +2.5. If not, suggest +2 reps.
    const numericWeight = parseFloat(pastEx.weight.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericWeight)) {
      const unit = pastEx.weight.replace(/[0-9.]/g, '') || 'kg';
      return {
        type: 'WEIGHT',
        suggestion: `${numericWeight + 2.5}${unit}`,
        original: pastEx.weight
      };
    }
    return {
      type: 'REPS',
      suggestion: pastEx.reps + 2,
      original: pastEx.reps
    };
  };

  const addExerciseToSchedule = () => {
    if (!newExercise.name) return;
    
    const exercise: WorkoutItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExercise,
      completed: false
    };

    setSchedule(prev => prev.map(d => 
      d.day === selectedDay ? { ...d, exercises: [...d.exercises, exercise] } : d
    ));
    setNewExercise({ name: '', target: '', weight: '', reps: 0, sets: '' });
  };

  const removeExerciseFromSchedule = (day: string, id: string) => {
    setSchedule(prev => prev.map(d => 
      d.day === day ? { ...d, exercises: d.exercises.filter(e => e.id !== id) } : d
    ));
  };

  const clearArchive = () => {
    // Clear localStorage first to ensure it's gone before reload
    localStorage.clear();
    
    // Update state for immediate feedback
    setArchive([]);
    setWorkout([]);
    setSchedule(DAYS.map(day => ({ day, exercises: [] })));
    setExp(0);
    setShowPurgeModal(false);
    
    // Force a reload to ensure all states are clean from initializers
    window.location.reload();
  };

  const calculateStreak = () => {
    if (archive.length === 0) return 0;
    
    // Get unique dates with COMPLETED status, sorted descending
    const completedDates = Array.from(new Set<string>(
      archive
        .filter(e => e.type === 'COMPLETED')
        .map(e => e.date)
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (completedDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if the most recent completion is today or yesterday
    const latestCompletion = new Date(completedDates[0] as string);
    latestCompletion.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - latestCompletion.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0; // Streak broken if more than 1 day since last completion

    for (let i = 0; i < completedDates.length; i++) {
      if (i === 0) {
        streak = 1;
        continue;
      }

      const prev = new Date(completedDates[i-1] as string);
      const curr = new Date(completedDates[i] as string);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);

      const diff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const stats = useMemo(() => {
    if (archive.length === 0) {
      return [
        { label: 'Protocol Completion', value: '0%', icon: Activity, color: 'text-primary-container' },
        { label: 'Total Volume', value: '0 KG', icon: Zap, color: 'text-primary-container' },
        { label: 'Active Streak', value: '0 DAYS', icon: Shield, color: 'text-primary-container' },
        { label: 'Rank Status', value: 'RECRUIT', icon: Target, color: 'text-primary-container' },
      ];
    }

    // Completion Rate
    const totalProgress = archive.reduce((acc, entry) => {
      if (entry.type === 'COMPLETED') return acc + 100;
      if (entry.type === 'INCOMPLETE') return acc + (entry.progress || 0);
      return acc;
    }, 0);
    const avgCompletion = Math.round(totalProgress / archive.length);

    // Total Volume
    const totalVolume = archive.reduce((acc, entry) => {
      if (!entry.exercises) return acc;
      return acc + entry.exercises.reduce((exAcc, ex) => {
        const weight = parseFloat(ex.weight.replace(/[^0-9.]/g, '')) || 0;
        return exAcc + (weight * ex.reps * ex.sets);
      }, 0);
    }, 0);

    // Rank Status from EXP
    const rankStatus = currentRank.name;

    return [
      { label: 'Protocol Completion', value: `${avgCompletion}%`, icon: Activity, color: 'text-primary-container' },
      { label: 'Total Volume', value: `${totalVolume.toLocaleString()} KG`, icon: Zap, color: 'text-primary-container' },
      { label: 'Active Streak', value: `${calculateStreak()} DAYS`, icon: Shield, color: 'text-primary-container' },
      { label: 'Rank Status', value: rankStatus, icon: Target, color: 'text-primary-container' },
    ];
  }, [archive, currentRank]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-primary-container/15 bg-background/80 backdrop-blur-xl flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-black tracking-widest text-primary-container glow-text-primary font-headline uppercase">
          THE SOVEREIGN PROTOCOL
        </div>
        <div className="hidden md:flex space-x-8 font-headline uppercase text-[10px] tracking-[0.2em]">
          {['Daily Quest', 'Workout Archive', 'Schedule', 'User Stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition-colors hover:text-primary ${
                activeTab === tab ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-on-surface-variant'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Protocol Time</span>
            <span className={`font-mono text-sm ${isTimerActive ? 'text-primary-container glow-text-primary' : 'text-on-surface-variant'}`}>
              {formatTime(timer)}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            {/* Icons removed per user request */}
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-full w-64 z-40 border-r border-primary-container/10 bg-[#0e0e0e] flex-col py-20 px-4 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 px-4">
          <div className="text-primary-container font-black font-headline text-[10px] uppercase tracking-[0.2em]">RANK: {currentRank.name}</div>
          <div className="text-on-surface-variant font-headline text-[8px] tracking-[0.2em]">{currentRank.title} ACTIVE</div>
        </div>
        
        <div className="space-y-2 flex-grow">
          {[
            { name: 'Daily Quest', icon: Bolt },
            { name: 'Workout Archive', icon: History },
            { name: 'Schedule', icon: CalendarIcon },
            { name: 'User Stats', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 p-3 font-headline text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:translate-x-1 ${
                activeTab === item.name
                  ? 'text-primary-container bg-surface-container-low border-l-4 border-primary-container' 
                  : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={startWorkout}
          className="mt-8 bg-primary-container text-on-primary-container py-4 font-headline text-[10px] font-black tracking-widest uppercase hover:brightness-125 transition-all active:scale-95"
        >
          INITIALIZE WORKOUT
        </button>

        <div className="mt-auto px-4 pt-8 border-t border-outline-variant/10">
          {/* Support and Logs removed per user request */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 pb-12 px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {activeTab === 'Daily Quest' && (
            <>
              {/* Alert Banner */}
              <motion.section 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative p-6 overflow-hidden border-l-4 ${
                  progress === 100 
                    ? 'bg-primary-container/10 border-primary-container' 
                    : 'bg-error-container/20 border-error'
                }`}
              >
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  {progress === 100 ? (
                    <CheckCircle2 className="w-32 h-32 text-primary-container" />
                  ) : (
                    <AlertTriangle className="w-32 h-32 text-error" />
                  )}
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className={`font-headline font-black text-xl tracking-tighter uppercase flex items-center gap-2 ${
                      progress === 100 ? 'text-primary-container' : 'text-error'
                    }`}>
                      {progress === 100 ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          PROTOCOL COMPLETED
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5" />
                          PROTOCOL BREACH DETECTED
                        </>
                      )}
                    </h2>
                    <p className={`mt-1 text-sm ${progress === 100 ? 'text-on-surface' : 'text-on-error-container'}`}>
                      {progress === 100 ? (
                        <>All objectives secured. Daily Quest sequence finalized. Rank: {currentRank.name} status maintained.</>
                      ) : (
                        <>Daily Quest sequence incomplete. System degradation imminent in <span className="font-mono font-bold">{timeLeftInDay}</span>. Initialize workout to maintain Rank: {currentRank.name}.</>
                      )}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row justify-between items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Current Operation</span>
                  <h1 className="font-headline text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">The Daily Quest</h1>
                </div>
                <div className="text-right">
                  <div className="font-label text-on-surface-variant text-[10px] tracking-[0.2em] uppercase mb-2">Completion Status</div>
                  <div className="flex items-center gap-4">
                    <span className="font-headline text-3xl font-bold text-primary-container">{progress}%</span>
                    <div className="w-64 h-3 bg-surface-container-highest relative overflow-hidden">
                      <div className="absolute inset-0 scanline-overlay z-10"></div>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-primary to-primary-container shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workout Checklist */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-primary-container flex items-center gap-3">
                      <Bolt className="w-5 h-5" />
                      Today's Workout
                    </h3>
                    <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest bg-surface-container-high px-3 py-1">
                      Phase: Hypertrophy
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {workout.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`group p-5 flex flex-col md:flex-row items-center gap-6 transition-all border-l-2 ${
                            item.completed 
                              ? 'bg-surface-container-low/50 opacity-60 border-primary-container' 
                              : 'bg-surface-container-low hover:bg-surface-container-high border-transparent hover:border-primary-container'
                          }`}
                        >
                          <div className="flex-grow w-full md:w-auto">
                            <div className={`font-headline font-bold uppercase tracking-tight text-lg flex items-center gap-2 ${item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                              {item.name}
                              {!item.completed && getOverloadSuggestion(item.name) && (
                                <div className="group/overload relative">
                                  <TrendingUp className="w-3 h-3 text-primary-container animate-pulse cursor-help" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface-container-highest border border-primary-container/30 shadow-xl opacity-0 group-hover/overload:opacity-100 transition-opacity pointer-events-none z-50">
                                    <div className="text-[8px] text-primary-container font-black uppercase tracking-widest mb-1">Progressive Overload</div>
                                    <div className="text-[10px] text-on-surface uppercase">
                                      Suggest {getOverloadSuggestion(item.name)?.suggestion} 
                                      <span className="text-on-surface-variant ml-1">(Prev: {getOverloadSuggestion(item.name)?.original})</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="font-label text-[10px] text-on-surface-variant tracking-[0.1em] uppercase">Target: {item.target}</div>
                          </div>

                          <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="flex flex-col items-center">
                              <span className="font-label text-[8px] text-on-surface-variant uppercase mb-1">Weight</span>
                              <input 
                                type="text"
                                value={item.weight}
                                onChange={(e) => updateWorkoutItem(item.id, 'weight', e.target.value)}
                                className="w-16 bg-surface-container-highest/30 border-b border-primary-container/20 font-mono text-primary-container text-sm text-center focus:outline-none focus:border-primary-container transition-colors"
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="font-label text-[8px] text-on-surface-variant uppercase mb-1">Reps</span>
                              <input 
                                type="number"
                                value={item.reps}
                                onChange={(e) => updateWorkoutItem(item.id, 'reps', parseInt(e.target.value) || 0)}
                                className="w-12 bg-surface-container-highest/30 border-b border-primary-container/20 font-mono text-primary-container text-sm text-center focus:outline-none focus:border-primary-container transition-colors"
                              />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="font-label text-[8px] text-on-surface-variant uppercase mb-1">Sets</span>
                              <input 
                                type="text"
                                value={item.sets}
                                onChange={(e) => updateWorkoutItem(item.id, 'sets', e.target.value)}
                                className="w-12 bg-surface-container-highest/30 border-b border-primary-container/20 font-mono text-on-surface-variant text-sm text-center focus:outline-none focus:border-primary-container transition-colors"
                              />
                            </div>
                          </div>

                          <button 
                            onClick={() => toggleComplete(item.id)}
                            className={`flex items-center justify-center w-12 h-12 transition-all ${
                              item.completed 
                                ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                                : 'border border-primary-container/30 bg-primary-container/5 hover:bg-primary-container/20'
                            }`}
                          >
                            {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Check className="w-6 h-6 text-primary-container" />}
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sidebar Modules */}
                <div className="space-y-8">
                  {/* Status HUD */}
                  <div className="bg-surface-container-low/30 border border-outline-variant/10 p-6 space-y-4">
                    {[
                      { label: 'Protocol Duration', value: formatTime(timer), color: 'text-primary-container', icon: Terminal },
                      { label: 'System Latency', value: '12ms', color: 'text-primary-container' },
                      { label: 'Active Buff', value: 'PRE-WORKOUT ADRENALINE', color: 'text-primary' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                        <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
                        <span className={`font-mono text-[10px] ${stat.color} flex items-center gap-1`}>
                          {stat.icon && <stat.icon className="w-3 h-3" />}
                          {stat.value}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Primary Objective</div>
                      <div className="font-headline text-[10px] font-bold text-on-surface uppercase leading-relaxed">
                        COMPLETE 100 REPS TOTAL TO UNLOCK ARCHIVE DATA
                      </div>
                    </div>
                  </div>

                  {/* Rank Progress Card */}
                  <div className="bg-gradient-to-br from-surface-container-low to-surface-container-low/10 border border-primary-container/10 p-6 relative group overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                      <BarChart3 className="w-32 h-32 text-primary-container" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Rank Standing</div>
                          <div className="font-headline text-4xl font-black text-primary-container glow-text-primary">{currentRank.name}</div>
                        </div>
                        <div className="bg-primary-container/10 px-2 py-1 border border-primary-container/20">
                          <span className="font-mono text-[8px] text-primary-container">{currentRank.title}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between font-label text-[8px] text-on-surface-variant uppercase">
                          <span>{nextRank ? `XP to Rank ${nextRank.name}` : 'MAX RANK REACHED'}</span>
                          <span>{exp.toLocaleString()} / {nextRank ? nextRank.min.toLocaleString() : 'MAX'}</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container-highest">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${rankProgress}%` }}
                            className="h-full bg-primary-container shadow-[0_0_8px_rgba(0,229,255,0.6)]" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Intel */}
                  <div className="space-y-4">
                    <h4 className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant px-2">Pending Intel</h4>
                    <div className="bg-surface-container-low p-4 flex gap-4 items-center border border-outline-variant/10">
                      <div className="p-2 bg-surface-container-high border border-outline-variant/20">
                        <Lock className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <div className="font-headline text-[10px] font-bold uppercase tracking-tight">Legionnaire Protocol</div>
                        <div className="text-[8px] text-on-surface-variant uppercase tracking-wider">Unlocks after 5 consecutive Quests.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <button 
                      onClick={logWorkout}
                      disabled={progress === 0 || progress === 100}
                      className={`flex-1 font-headline text-[10px] font-black tracking-[0.3em] uppercase py-5 transition-all flex items-center justify-center gap-3 ${
                        progress === 100 
                          ? 'bg-primary-container/10 text-primary-container/40 border border-primary-container/20 cursor-not-allowed' 
                          : 'bg-error-container/20 text-error border border-error/20 hover:bg-error-container/30'
                      }`}
                    >
                      {progress === 100 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Protocol Secured
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Breach Protocol
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Schedule' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Protocol Planning</span>
                  <h1 className="font-headline text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">Training Schedule</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Days Selector */}
                <div className="lg:col-span-1 space-y-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full p-4 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-left transition-all ${
                        selectedDay === day 
                          ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {day}
                      <div className="text-[8px] opacity-60 mt-1">
                        {schedule.find(d => d.day === day)?.exercises.length || 0} Exercises
                      </div>
                    </button>
                  ))}
                </div>

                {/* Exercises for Selected Day */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-surface-container-low p-6 border border-outline-variant/10">
                    <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-primary-container mb-6 flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5" />
                      {selectedDay} Routine
                    </h3>

                    <div className="space-y-4 mb-8">
                      {schedule.find(d => d.day === selectedDay)?.exercises.length === 0 ? (
                        <div className="text-on-surface-variant/30 font-headline text-[10px] uppercase tracking-widest text-center py-12 border border-dashed border-outline-variant/20">
                          No exercises assigned to this cycle
                        </div>
                      ) : (
                        schedule.find(d => d.day === selectedDay)?.exercises.map(ex => (
                          <div key={ex.id} className="bg-surface-container-high p-4 flex justify-between items-center group">
                            <div>
                              <div className="font-headline font-bold uppercase tracking-tight text-sm">{ex.name}</div>
                              <div className="font-label text-[8px] text-on-surface-variant uppercase">{ex.target} | {ex.weight} | {ex.reps} reps | {ex.sets} sets</div>
                            </div>
                            <button 
                              onClick={() => removeExerciseFromSchedule(selectedDay, ex.id)}
                              className="text-error/50 hover:text-error transition-colors"
                            >
                              <Terminal className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Exercise Form */}
                    <div className="border-t border-outline-variant/10 pt-6">
                      <h4 className="font-headline text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4">Add New Exercise</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          placeholder="EXERCISE NAME"
                          value={newExercise.name}
                          onChange={e => setNewExercise({...newExercise, name: e.target.value.toUpperCase()})}
                          className="bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                        />
                        <input 
                          placeholder="TARGET MUSCLE"
                          value={newExercise.target}
                          onChange={e => setNewExercise({...newExercise, target: e.target.value.toUpperCase()})}
                          className="bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            placeholder="WEIGHT"
                            value={newExercise.weight}
                            onChange={e => setNewExercise({...newExercise, weight: e.target.value})}
                            className="bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                          />
                          <input 
                            placeholder="REPS"
                            type="number"
                            value={newExercise.reps || ''}
                            onChange={e => setNewExercise({...newExercise, reps: parseInt(e.target.value) || 0})}
                            className="bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                          />
                          <input 
                            placeholder="SETS"
                            value={newExercise.sets}
                            onChange={e => setNewExercise({...newExercise, sets: e.target.value})}
                            className="bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                          />
                        </div>
                        <button 
                          onClick={addExerciseToSchedule}
                          className="bg-primary-container text-on-primary-container font-headline text-[10px] font-black tracking-widest uppercase py-3 hover:brightness-110 transition-all"
                        >
                          ASSIGN TO CYCLE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'Workout Archive' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Historical Data</span>
                  <h1 className="font-headline text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">Protocol Archive</h1>
                </div>
                <div className="flex gap-4">
                  {archive.length > 0 && (
                    <button 
                      onClick={() => setShowPurgeModal(true)}
                      className="font-headline text-[10px] font-black uppercase tracking-[0.2em] text-error hover:text-error/80 transition-colors border border-error/20 px-4 py-2 bg-error/5 hover:bg-error/10"
                    >
                      Purge Archive Data
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-surface-container-low p-6 border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-primary-container flex items-center gap-3">
                      <History className="w-5 h-5" />
                      Daily Quest History
                    </h3>
                    <div className="flex gap-4 items-center">
                      <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mr-4">
                        {format(currentMonth, 'MMMM yyyy')}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-2 hover:bg-surface-container-high text-on-surface-variant"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-2 hover:bg-surface-container-high text-on-surface-variant"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-outline-variant/10 border border-outline-variant/10">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="bg-surface-container-low p-2 text-center font-label text-[8px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
                        {d}
                      </div>
                    ))}
                    {(() => {
                      const monthStart = startOfMonth(currentMonth);
                      const monthEnd = endOfMonth(monthStart);
                      const startDate = startOfWeek(monthStart);
                      const endDate = endOfWeek(monthEnd);
                      const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                      return calendarDays.map((day, i) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayEntries = archive.filter(e => e.date === dateStr);
                        const isSelected = selectedArchiveDate && isSameDay(day, selectedArchiveDate);
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedArchiveDate(day)}
                            className={`relative h-24 p-2 transition-all hover:z-10 ${
                              isCurrentMonth ? 'bg-surface-container-low' : 'bg-surface-container-low/30 opacity-30'
                            } ${isSelected ? 'ring-2 ring-primary-container ring-inset z-10' : ''} border-r border-b border-outline-variant/10`}
                          >
                            <span className={`font-mono text-[10px] ${isSameDay(day, new Date()) ? 'text-primary-container font-bold' : 'text-on-surface-variant'}`}>
                              {format(day, 'd')}
                            </span>
                            
                            <div className="mt-2 space-y-1">
                              {dayEntries.map(entry => (
                                <div 
                                  key={entry.id}
                                  className={`h-1.5 w-full ${
                                    entry.type === 'COMPLETED' ? 'bg-primary-container' : 
                                    entry.type === 'INCOMPLETE' ? 'bg-warning' : 'bg-error'
                                  } opacity-80`}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Day Details */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-surface-container-low p-6 border border-outline-variant/10 h-full">
                    <h4 className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6">
                      {selectedArchiveDate ? format(selectedArchiveDate, 'EEEE, MMMM do') : 'Select a date to view intel'}
                    </h4>

                    {!selectedArchiveDate ? (
                      <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant/20">
                        <Terminal className="w-12 h-12 mb-4" />
                        <div className="font-headline text-[8px] uppercase tracking-widest">Awaiting Selection</div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {archive.filter(e => e.date === format(selectedArchiveDate, 'yyyy-MM-dd')).length === 0 ? (
                          <div className="text-on-surface-variant/30 font-headline text-[10px] uppercase tracking-widest text-center py-12 border border-dashed border-outline-variant/20">
                            No protocol data for this cycle
                          </div>
                        ) : (
                          archive.filter(e => e.date === format(selectedArchiveDate, 'yyyy-MM-dd')).map(entry => (
                            <div key={entry.id} className="space-y-4">
                              <div className={`p-4 border-l-2 ${
                                entry.type === 'COMPLETED' ? 'bg-primary-container/5 border-primary-container' : 
                                entry.type === 'INCOMPLETE' ? 'bg-amber-500/5 border-amber-500' : 'bg-error/5 border-error'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                  {entry.type === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-primary-container" /> : 
                                   entry.type === 'INCOMPLETE' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                                   <AlertTriangle className="w-4 h-4 text-error" />}
                                  <span className="font-headline text-sm font-bold uppercase tracking-tight">{entry.details}</span>
                                </div>
                                <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">
                                  Status: {entry.type} {entry.progress !== undefined && `(${entry.progress}%)`}
                                </div>
                              </div>

                              {entry.exercises && (
                                <div className="space-y-2">
                                  <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 pb-1">Exercise Intel</div>
                                  {entry.exercises.map(ex => (
                                    <div key={ex.id} className="bg-surface-container-high p-3 flex justify-between items-center">
                                      <div>
                                        <div className="font-headline font-bold uppercase tracking-tight text-[10px]">{ex.name}</div>
                                        <div className="font-label text-[8px] text-on-surface-variant uppercase">{ex.target}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-mono text-[10px] text-primary-container">{ex.weight}</div>
                                        <div className="font-label text-[8px] text-on-surface-variant uppercase">{ex.reps}R | {ex.sets}S</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'User Stats' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Biometric Analysis</span>
                  <h1 className="font-headline text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">Operator Stats</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-surface-container-low p-6 border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-4">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{stat.label}</div>
                    </div>
                    <div className="font-headline text-3xl font-black text-on-surface uppercase tracking-tighter">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-low p-8 border border-outline-variant/10">
                <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-primary-container mb-8">Performance Matrix</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const dayEntry = archive.find(e => e.date === dateStr);
                    const height = dayEntry ? (
                      dayEntry.type === 'COMPLETED' ? 100 : 
                      dayEntry.type === 'INCOMPLETE' ? (dayEntry.progress || 50) : 10
                    ) : 0;
                    const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4">
                        <div className="w-full bg-surface-container-high relative group h-full flex items-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            className={`w-full border-t-2 transition-all ${
                              dayEntry?.type === 'COMPLETED' 
                                ? 'bg-primary-container/20 border-primary-container group-hover:bg-primary-container/40' 
                                : dayEntry?.type === 'INCOMPLETE'
                                ? 'bg-amber-500/20 border-amber-500 group-hover:bg-amber-500/40'
                                : dayEntry?.type === 'PUNISHMENT'
                                ? 'bg-error/20 border-error group-hover:bg-error/40'
                                : 'bg-on-surface-variant/5 border-on-surface-variant/20'
                            }`}
                          />
                        </div>
                        <span className="font-label text-[8px] text-on-surface-variant uppercase">{dayLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Purge Confirmation Modal */}
      <AnimatePresence>
        {showPurgeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPurgeModal(false)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-low border border-error/30 p-8 shadow-[0_0_50px_rgba(255,82,82,0.15)]"
            >
              <div className="flex items-center gap-4 text-error mb-6">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">CRITICAL PURGE</h3>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 uppercase tracking-wide">
                THIS ACTION WILL PERMANENTLY ERASE ALL ARCHIVED DATA, CURRENT PROGRESS, AND TRAINING SCHEDULES. THIS IS A FACTORY RESET OF THE SOVEREIGN PROTOCOL.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={clearArchive}
                  className="w-full bg-error text-on-error py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:brightness-110 transition-all"
                >
                  CONFIRM FACTORY RESET
                </button>
                <button 
                  onClick={() => setShowPurgeModal(false)}
                  className="w-full bg-surface-container-high text-on-surface py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:bg-surface-container-highest transition-all"
                >
                  ABORT SEQUENCE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low border-t border-outline-variant/20 flex justify-around p-4 z-50">
        {[
          { icon: Bolt, label: 'Quest', active: true },
          { icon: History, label: 'Archive' },
          { icon: BarChart3, label: 'Stats' },
          { icon: Settings, label: 'Config' },
        ].map((item) => (
          <div key={item.label} className={`flex flex-col items-center ${item.active ? 'text-primary-container' : 'text-on-surface-variant'}`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[8px] uppercase tracking-widest mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
