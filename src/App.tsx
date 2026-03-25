/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Target,
  LogOut,
  User as UserIcon,
  Loader2,
  LogIn,
  Cloud,
  CloudOff,
  RefreshCw,
  Clock,
  XCircle,
  Plus,
  Trash2
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
import { auth, db, googleProvider } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

// Error Handling Spec for Firestore Operations
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorInfo: null };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-surface-container-low border border-error/30 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
            <h2 className="font-headline text-xl font-black text-on-surface uppercase tracking-tighter mb-2">System Critical Error</h2>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-6 leading-relaxed">
              The protocol has encountered a fatal exception. Please refresh or contact support.
            </p>
            <div className="bg-error/5 p-4 mb-6 text-left overflow-auto max-h-32">
              <code className="text-[10px] text-error font-mono break-all">{this.state.errorInfo}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-primary-container text-on-primary-container font-headline text-[10px] font-black tracking-widest uppercase py-3 hover:brightness-110 transition-all"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}



interface WorkoutSet {
  weight: string;
  reps: number;
}

interface WorkoutItem {
  id: string;
  name: string;
  target: string;
  weight: string;
  reps: number;
  sets: string;
  setData?: WorkoutSet[];
  completed: boolean;
  isDeload?: boolean;
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
  type: 'COMPLETED' | 'INCOMPLETE' | 'BREACH';
  details: string;
  exercises?: WorkoutItem[];
  progress?: number;
  duration?: number;
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [workout, setWorkout] = useState<WorkoutItem[]>(() => {
    try {
      const saved = localStorage.getItem('sovereign_workout');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT;
    } catch (e) {
      console.error("Failed to parse workout from localStorage", e);
      return INITIAL_WORKOUT;
    }
  });
  const [schedule, setSchedule] = useState<ScheduleDay[]>(() => {
    try {
      const saved = localStorage.getItem('sovereign_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    } catch (e) {
      console.error("Failed to parse schedule from localStorage", e);
      return INITIAL_SCHEDULE;
    }
  });
  const [archive, setArchive] = useState<ArchiveEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sovereign_archive');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse archive from localStorage", e);
      return [];
    }
  });
  const [exp, setExp] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_exp');
    return saved ? parseInt(saved) : 0;
  });
  const [programDuration, setProgramDuration] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_program_duration');
    return saved ? parseInt(saved) : 4;
  });
  const [programStartDate, setProgramStartDate] = useState<string>(() => {
    const saved = localStorage.getItem('sovereign_program_start_date');
    return saved ? saved : format(new Date(), 'yyyy-MM-dd');
  });
  const [isDeloadEnabled, setIsDeloadEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sovereign_deload_enabled');
    return saved === 'true';
  });

  const getDeloadStatus = useCallback((date: Date = new Date()) => {
    if (!isDeloadEnabled) return { isDeloadWeek: false, currentWeek: 0, weekInCycle: 0, isActiveProgram: false };
    
    const start = new Date(programStartDate);
    start.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const diffTime = checkDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7) + 1;
    
    if (currentWeek < 1) return { isDeloadWeek: false, currentWeek, weekInCycle: 0, isActiveProgram: false };

    const cycleLength = programDuration + 1;
    const weekInCycle = ((currentWeek - 1) % cycleLength) + 1;
    const isDeloadWeek = weekInCycle === cycleLength;
    
    return { isDeloadWeek, currentWeek, weekInCycle, isActiveProgram: true };
  }, [isDeloadEnabled, programStartDate, programDuration]);

  const applyDeloadIfNecessary = useCallback((exercises: WorkoutItem[], date: Date = new Date()) => {
    const { isDeloadWeek } = getDeloadStatus(date);
    if (!isDeloadWeek) return exercises.map(ex => ({ ...ex, isDeload: false }));

    return exercises.map(ex => {
      const numSets = parseInt(ex.sets) || 1;
      const deloadSets = Math.max(1, numSets - 1);
      const deloadReps = Math.max(1, Math.floor(ex.reps * 0.6));
      
      let deloadWeight = ex.weight;
      const numericWeight = parseFloat(ex.weight.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericWeight)) {
        const unit = ex.weight.replace(/[0-9.]/g, '') || 'kg';
        deloadWeight = `${Math.round(numericWeight * 0.6)}${unit}`;
      }

      const currentSetData = ex.setData || Array.from({ length: numSets }, () => ({ weight: ex.weight, reps: ex.reps }));
      const deloadSetData = currentSetData
        .slice(0, deloadSets)
        .map(s => {
          const sWeight = parseFloat(s.weight.replace(/[^0-9.]/g, ''));
          const sUnit = s.weight.replace(/[0-9.]/g, '') || 'kg';
          return {
            weight: isNaN(sWeight) ? s.weight : `${Math.round(sWeight * 0.6)}${sUnit}`,
            reps: Math.max(1, Math.floor(s.reps * 0.6))
          };
        });

      return {
        ...ex,
        weight: deloadWeight,
        reps: deloadReps,
        sets: deloadSets.toString(),
        setData: deloadSetData,
        isDeload: true
      };
    });
  }, [getDeloadStatus]);
  const [lastChecked, setLastChecked] = useState<string | null>(() => {
    return localStorage.getItem('sovereign_last_checked');
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Connection Test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
          setSyncError("Cloud connection offline. Check network.");
        }
      }
    }
    testConnection();
  }, []);

  // Firestore Sync - Load Data
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const userDocRef = doc(db, 'users', user.uid);
    setIsSyncing(true);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      // If the snapshot has pending writes, it means it's a local echo of a change we just made.
      // We already have this data in our React state, so we skip to avoid "flickering" or reverts.
      if (docSnap.metadata.hasPendingWrites) return;

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Only update if the data is actually different to prevent unnecessary re-renders
        // and potential race conditions with local state updates.
        setWorkout(prev => JSON.stringify(prev) !== JSON.stringify(data.workout) ? data.workout : prev);
        setSchedule(prev => JSON.stringify(prev) !== JSON.stringify(data.schedule) ? data.schedule : prev);
        setArchive(prev => JSON.stringify(prev) !== JSON.stringify(data.archive) ? data.archive : prev);
        setExp(prev => prev !== data.exp ? data.exp : prev);
        setProgramDuration(prev => prev !== data.programDuration ? data.programDuration : prev);
        setProgramStartDate(prev => prev !== data.programStartDate ? data.programStartDate : prev);
        setIsDeloadEnabled(prev => prev !== data.isDeloadEnabled ? data.isDeloadEnabled : prev);
        setLastChecked(prev => prev !== data.lastChecked ? data.lastChecked : prev);
      } else {
        // First time user - initialize Firestore with local data or defaults
        const initialData = {
          uid: user.uid,
          workout,
          schedule,
          archive,
          exp,
          programDuration,
          programStartDate,
          isDeloadEnabled,
          lastChecked,
          level: 1,
          updatedAt: new Date().toISOString()
        };
        setDoc(userDocRef, initialData).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
      }
      setIsSyncing(false);
      setSyncError(null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setIsSyncing(false);
      setSyncError("Sync failed. Permissions or network error.");
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Firestore Sync - Save Data (Debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isAuthReady || !user || isSyncing) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, {
          uid: user.uid,
          workout,
          schedule,
          archive,
          exp,
          programDuration,
          programStartDate,
          isDeloadEnabled,
          lastChecked,
          level: Math.floor(exp / 1000) + 1,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        localStorage.setItem('sovereign_workout', JSON.stringify(workout));
        localStorage.setItem('sovereign_schedule', JSON.stringify(schedule));
        localStorage.setItem('sovereign_archive', JSON.stringify(archive));
        localStorage.setItem('sovereign_exp', exp.toString());
        localStorage.setItem('sovereign_program_duration', programDuration.toString());
        localStorage.setItem('sovereign_program_start_date', programStartDate);
        localStorage.setItem('sovereign_deload_enabled', isDeloadEnabled.toString());
        if (lastChecked) localStorage.setItem('sovereign_last_checked', lastChecked);
      } catch (err) {
        console.error("Failed to save to Firestore", err);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [workout, schedule, archive, exp, lastChecked, user, isAuthReady, programDuration, programStartDate, isDeloadEnabled]);

  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      let message = "Login failed. Please try again.";
      if (error.code === 'auth/popup-blocked') {
        message = "Popup blocked! Please allow popups for this site.";
      } else if (error.code === 'auth/unauthorized-domain') {
        message = "Domain not authorized in Firebase Console.";
      } else if (error.message) {
        message = error.message;
      }
      setAuthError(message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
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
  const [isRestDayModalOpen, setIsRestDayModalOpen] = useState(false);
  const [isWorkoutInitModalOpen, setIsWorkoutInitModalOpen] = useState(false);
  const [comparisonModal, setComparisonModal] = useState<{ isOpen: boolean; weight: number; label: string } | null>(null);

  const getWeightComparison = (weight: number) => {
    if (weight <= 0) return "A feather (0 KG)";
    if (weight < 5) return "A bag of sugar (approx. 1-2 KG)";
    if (weight < 20) return "A medium-sized dog (approx. 10-15 KG)";
    if (weight < 50) return "A large suitcase (approx. 23-30 KG)";
    if (weight < 100) return "A baby elephant (approx. 90 KG)";
    if (weight < 200) return "A giant panda (approx. 100-150 KG)";
    if (weight < 500) return "A grand piano (approx. 300-400 KG)";
    if (weight < 1000) return "A grizzly bear (approx. 600-800 KG)";
    if (weight < 2000) return "A small car (approx. 1,000-1,500 KG)";
    if (weight < 5000) return "A large SUV or a hippo (approx. 2,000-3,000 KG)";
    if (weight < 10000) return "An African elephant (approx. 6,000 KG)";
    if (weight < 20000) return "A school bus (approx. 12,000 KG)";
    if (weight < 50000) return "A humpback whale (approx. 30,000 KG)";
    if (weight < 100000) return "A Space Shuttle (approx. 75,000 KG)";
    return "A Blue Whale (approx. 150,000+ KG)";
  };
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [editingArchiveEntry, setEditingArchiveEntry] = useState<ArchiveEntry | null>(null);

  const handleEditArchive = (entry: ArchiveEntry) => {
    setEditingArchiveEntry(entry);
  };

  const createManualArchiveEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
    
    const newEntry: ArchiveEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      day: dayName,
      type: 'COMPLETED',
      details: `Manual Entry: ${dayName} Cycle`,
      exercises: [],
      progress: 100,
      duration: 0
    };
    
    setEditingArchiveEntry(newEntry);
  };

  const saveArchiveEdit = (updatedEntry: ArchiveEntry) => {
    setArchive(prev => {
      const exists = prev.some(e => e.id === updatedEntry.id);
      if (exists) {
        return prev.map(e => e.id === updatedEntry.id ? updatedEntry : e);
      } else {
        return [updatedEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });
    setEditingArchiveEntry(null);
  };

  const deleteArchiveEntry = (id: string) => {
    setArchive(prev => prev.filter(e => e.id !== id));
    setEditingArchiveEntry(null);
  };

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

  useEffect(() => {
    if (lastChecked) {
      localStorage.setItem('sovereign_last_checked', lastChecked);
    }
  }, [lastChecked]);

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
  // Data is automatically saved to localStorage whenever state changes.

  const syncWorkoutWithSchedule = useCallback(() => {
    const today = new Date();
    const currentDayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    const todaySchedule = schedule.find(s => s.day === currentDayName);
    if (todaySchedule) {
      setWorkout(applyDeloadIfNecessary(todaySchedule.exercises.map(ex => ({ ...ex, completed: false }))));
    } else {
      setWorkout([]);
    }
  }, [schedule, applyDeloadIfNecessary]);

  // Daily Reset & Violation Check
  useEffect(() => {
    const checkViolations = () => {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const currentDayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];

      if (lastChecked && lastChecked !== todayStr) {
        const lastDate = parseISO(lastChecked);
        let newEntries: ArchiveEntry[] = [];
        
        let checkDate = new Date(lastDate);
        checkDate.setDate(checkDate.getDate() + 1);
        let iterations = 0;

        while (format(checkDate, 'yyyy-MM-dd') < todayStr && iterations < 31) {
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          const dayName = DAYS[checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1];
          
          const hasEntry = archive.some(entry => entry.date === dateStr);
          const daySchedule = schedule.find(s => s.day === dayName);
          const isRestDay = !daySchedule || daySchedule.exercises.length === 0;
          
          if (!hasEntry && !isRestDay) {
            const entryId = Math.random().toString(36).substr(2, 9);
            newEntries.push({
              id: entryId,
              date: dateStr,
              day: dayName,
              type: 'INCOMPLETE',
              details: `Protocol Violation: Missed ${dayName} Cycle (Auto-Logged)`,
            });
          } else if (!hasEntry && isRestDay) {
            // Log a rest day entry so we don't keep checking it
            const entryId = Math.random().toString(36).substr(2, 9);
            newEntries.push({
              id: entryId,
              date: dateStr,
              day: dayName,
              type: 'COMPLETED',
              details: `Rest Day: ${dayName} Recovery Protocol`,
            });
          }
          
          checkDate.setDate(checkDate.getDate() + 1);
          iterations++;
        }

        if (newEntries.length > 0) {
          setArchive(prev => [...newEntries, ...prev]);
        }

        // Auto-fill Daily Quest
        syncWorkoutWithSchedule();

        setIsWorkoutActive(false);
        setLastChecked(todayStr);
      } else if (!lastChecked) {
        syncWorkoutWithSchedule();
        setLastChecked(todayStr);
      }
    };

    checkViolations();
  }, [lastChecked, archive, schedule, syncWorkoutWithSchedule]);

  // Sync today's workout with schedule changes
  useEffect(() => {
    if (schedule.length === 0) return;
    const today = new Date();
    const currentDayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    const todaySchedule = schedule.find(s => s.day === currentDayName);
    
    if (todaySchedule) {
      setWorkout(prev => {
        const scheduleIds = todaySchedule.exercises.map(e => e.id);
        const workoutIds = prev.map(e => e.id);
        
        // Find exercises to remove
        const toRemove = prev.filter(ex => !scheduleIds.includes(ex.id));
        
        // Check if anything actually changed (IDs, order, or properties)
        const hasIdChanges = toRemove.length > 0 || todaySchedule.exercises.some(ex => !workoutIds.includes(ex.id));
        const hasPropertyChanges = todaySchedule.exercises.some(schedEx => {
          const existing = prev.find(p => p.id === schedEx.id);
          return existing && (
            existing.name !== schedEx.name ||
            existing.weight !== schedEx.weight ||
            existing.reps !== schedEx.reps ||
            existing.sets !== schedEx.sets
          );
        });
        const hasOrderChanges = prev.length === todaySchedule.exercises.length && 
                               prev.some((ex, i) => ex.id !== todaySchedule.exercises[i].id);

        if (!hasIdChanges && !hasPropertyChanges && !hasOrderChanges) return prev;

        // Subtract XP for removed or changed completed exercises
        const removedCompleted = toRemove.filter(ex => ex.completed);
        const changedCompleted = todaySchedule.exercises.filter(schedEx => {
          const existing = prev.find(p => p.id === schedEx.id);
          return existing && existing.completed && (
            existing.name !== schedEx.name ||
            existing.weight !== schedEx.weight ||
            existing.reps !== schedEx.reps ||
            existing.sets !== schedEx.sets
          );
        });
        
        const totalRemovedExp = (removedCompleted.length + changedCompleted.length) * 100;
        if (totalRemovedExp > 0) {
          setExp(prevExp => Math.max(0, prevExp - totalRemovedExp));
        }

        // Reconstruct workout based on schedule order and updated properties
        return todaySchedule.exercises.map(schedEx => {
          const existingEx = prev.find(p => p.id === schedEx.id);
          if (existingEx) {
            const isChanged = (
              existingEx.name !== schedEx.name ||
              existingEx.weight !== schedEx.weight ||
              existingEx.reps !== schedEx.reps ||
              existingEx.sets !== schedEx.sets
            );
            return {
              ...existingEx,
              completed: isChanged ? false : existingEx.completed,
              name: schedEx.name,
              target: schedEx.target,
              weight: schedEx.weight,
              reps: schedEx.reps,
              sets: schedEx.sets,
              // Keep setData if sets count matches and not changed
              setData: !isChanged && existingEx.setData && existingEx.setData.length === parseInt(schedEx.sets)
                ? existingEx.setData
                : undefined
            };
          }
          // New exercise
          return applyDeloadIfNecessary([{ ...schedEx, completed: false }])[0];
        });
      });
    } else {
      setWorkout(prev => {
        if (prev.length === 0) return prev;
        // Subtract XP for all completed exercises being removed
        const removedExp = prev.filter(ex => ex.completed).length * 100;
        if (removedExp > 0) {
          setExp(prevExp => Math.max(0, prevExp - removedExp));
        }
        
        // Remove today's archive entry if it exists
        // The archive sync useEffect will handle reverting the bonus/penalty XP
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayEntry = archive.find(e => e.date === todayStr);
        if (todayEntry) {
          setArchive(prevArchive => prevArchive.filter(e => e.date !== todayStr));
        }
        
        return [];
      });
    }
  }, [schedule, applyDeloadIfNecessary, archive]);

  // Keep archive in sync with today's workout state
  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = archive.find(e => e.date === todayStr);
    if (!todayEntry) return;

    // Sync Archive with Workout State
    const entryIds = todayEntry.exercises?.map(ex => ex.id).sort().join(',') || '';
    const workoutIds = workout.map(ex => ex.id).sort().join(',');
    const currentProgress = workout.length > 0 ? Math.round((workout.filter(ex => ex.completed).length / workout.length) * 100) : 100;

    if (entryIds !== workoutIds || todayEntry.progress !== currentProgress) {
      setArchive(prev => {
        const filtered = prev.filter(e => e.date !== todayStr);
        const updatedEntry: ArchiveEntry = {
          ...todayEntry,
          exercises: [...workout],
          progress: currentProgress,
          type: currentProgress === 100 ? 'COMPLETED' : 'INCOMPLETE',
          details: currentProgress === 100 
            ? `Protocol Secured: ${todayEntry.day} Cycle` 
            : `Protocol Partial: ${todayEntry.day} Cycle (${currentProgress}%)`
        };
        return [updatedEntry, ...filtered];
      });
    }
  }, [workout, archive]);

  const logWorkout = useCallback(() => {
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    const dayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
    
    const completedCount = workout.filter(item => item.completed).length;
    const currentProgress = Math.round((completedCount / workout.length) * 100);

    const entry: ArchiveEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      day: dayName,
      type: currentProgress === 100 ? 'COMPLETED' : 'INCOMPLETE',
      details: currentProgress === 100 
        ? `Protocol Secured: ${dayName} Cycle` 
        : `Protocol Partial: ${dayName} Cycle (${currentProgress}%)`,
      exercises: [...workout],
      progress: currentProgress,
      duration: timer
    };

    setArchive(prev => {
      const filtered = prev.filter(e => e.date !== dateStr);
      return [entry, ...filtered];
    });

    setIsTimerActive(false);
    setIsWorkoutActive(false);
  }, [workout, timer]);

  const completedCount = workout.filter(item => item.completed).length;
  const progress = workout.length > 0 ? Math.round((completedCount / workout.length) * 100) : 100;
  const isRestDay = workout.length === 0;
  
  // Handle rest day state
  useEffect(() => {
    if (isRestDay) {
      setIsTimerActive(false);
      setTimer(0);
    }
  }, [isRestDay]);

  // Auto-Complete when 100%
  useEffect(() => {
    if (progress === 100 && workout.length > 0 && isTimerActive) {
      setIsTimerActive(false);
      setIsWorkoutActive(false);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const alreadyLogged = archive.some(entry => entry.date === todayStr && entry.type === 'COMPLETED');
      if (!alreadyLogged) {
        logWorkout();
      }
    }
  }, [progress, workout.length, archive, isTimerActive, logWorkout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && !isRestDay) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isRestDay]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = (isReset = false) => {
    setActiveTab('Daily Quest');
    if (isRestDay) {
      setIsRestDayModalOpen(true);
      setIsWorkoutActive(true);
      return;
    }
    
    // If re-initializing or reset requested, reset completion status and revert XP/Archive
    if (isReset || (progress === 100 && workout.length > 0)) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      // Subtract XP for each exercise that was completed
      let exerciseExpToSubtract = 0;
      workout.forEach(ex => {
        if (ex.completed) {
          exerciseExpToSubtract += 100;
        }
      });
      
      if (exerciseExpToSubtract > 0) {
        setExp(prev => Math.max(0, prev - exerciseExpToSubtract));
      }

      // Remove all entries for today from archive
      setArchive(prev => prev.filter(entry => entry.date !== todayStr));
      setWorkout(prev => prev.map(ex => ({ ...ex, completed: false })));
    }

    setIsWorkoutActive(true);
    setIsWorkoutInitModalOpen(true);
    setIsTimerActive(true);
    setTimer(0);
  };

  const toggleComplete = (id: string) => {
    if (!isTimerActive) {
      setIsTimerActive(true);
    }
    const item = workout.find(i => i.id === id);
    if (!item) return;

    const newCompleted = !item.completed;
    const expChange = newCompleted ? 100 : -100;

    setWorkout(prev => prev.map(i => i.id === id ? { ...i, completed: newCompleted } : i));
    setExp(prev => prev + expChange);
  };

  const updateWorkoutItem = (id: string, field: keyof WorkoutItem, value: any) => {
    setWorkout(prev => prev.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value };
        if (field === 'sets') {
          const numSets = parseInt(value as string) || 1;
          const currentSetData = i.setData || [{ weight: i.weight, reps: i.reps }];
          if (numSets > currentSetData.length) {
            const lastSet = currentSetData[currentSetData.length - 1] || { weight: i.weight, reps: i.reps };
            const newSets = Array.from({ length: numSets - currentSetData.length }, () => ({ ...lastSet }));
            updated.setData = [...currentSetData, ...newSets];
          } else if (numSets < currentSetData.length) {
            updated.setData = currentSetData.slice(0, numSets);
          } else {
            updated.setData = currentSetData;
          }
        }
        return updated;
      }
      return i;
    }));
  };

  const updateWorkoutSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: string | number) => {
    setWorkout(prev => prev.map(i => {
      if (i.id === exerciseId) {
        const currentSetData = i.setData || Array.from({ length: parseInt(i.sets) || 1 }, () => ({ weight: i.weight, reps: i.reps }));
        const newSetData = [...currentSetData];
        newSetData[setIndex] = { ...newSetData[setIndex], [field]: value };
        return { ...i, setData: newSetData };
      }
      return i;
    }));
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
    
    const numSets = parseInt(newExercise.sets) || 1;
    const setData: WorkoutSet[] = Array.from({ length: numSets }, () => ({
      weight: newExercise.weight,
      reps: newExercise.reps
    }));

    const exercise: WorkoutItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExercise,
      setData,
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
    setArchive([]);
    setWorkout([]);
    setSchedule(INITIAL_SCHEDULE);
    setExp(0);
    setLastChecked(null);
    localStorage.clear();
    setShowPurgeModal(false);
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
    const selectedDateStr = selectedArchiveDate ? format(selectedArchiveDate, 'yyyy-MM-dd') : null;
    const filteredArchive = selectedDateStr 
      ? archive.filter(e => e.date === selectedDateStr)
      : archive;

    if (filteredArchive.length === 0) {
      return [
        { label: selectedDateStr ? 'Daily Completion' : 'Protocol Completion', value: '0%', icon: Activity, color: 'text-primary-container' },
        { label: selectedDateStr ? 'Daily Volume' : 'Total Volume', value: '0 KG', icon: Zap, color: 'text-primary-container' },
        { label: 'Active Streak', value: `${calculateStreak()} DAYS`, icon: Shield, color: 'text-primary-container' },
        { label: 'Rank Status', value: currentRank.name, icon: Target, color: 'text-primary-container' },
      ];
    }

    // Completion Rate
    const totalProgress = filteredArchive.reduce((acc, entry) => {
      if (entry.type === 'COMPLETED') return acc + 100;
      if (entry.type === 'INCOMPLETE') return acc + (entry.progress || 0);
      return acc;
    }, 0);
    const avgCompletion = Math.round(totalProgress / filteredArchive.length);

    // Total Volume
    const totalVolume = filteredArchive.reduce((acc, entry) => {
      if (!entry.exercises) return acc;
      return acc + entry.exercises.reduce((exAcc, ex) => {
        if (!ex.completed) return exAcc;
        const weight = parseFloat(ex.weight.replace(/[^0-9.]/g, '')) || 0;
        const sets = parseInt(ex.sets) || 0;
        return exAcc + (weight * ex.reps * sets);
      }, 0);
    }, 0);

    // Rank Status from EXP
    const rankStatus = currentRank.name;

    return [
      { label: selectedDateStr ? 'Daily Completion' : 'Protocol Completion', value: `${avgCompletion}%`, icon: Activity, color: 'text-primary-container' },
      { label: selectedDateStr ? 'Daily Volume' : 'Total Volume', value: `${totalVolume.toLocaleString()} KG`, icon: Zap, color: 'text-primary-container', numericValue: totalVolume },
      { label: 'Active Streak', value: `${calculateStreak()} DAYS`, icon: Shield, color: 'text-primary-container' },
      { label: 'Rank Status', value: rankStatus, icon: Target, color: 'text-primary-container' },
    ];
  }, [archive, currentRank, selectedArchiveDate]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-primary-container/15 bg-background/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 py-4">
        <div className="text-sm md:text-2xl font-black tracking-widest text-primary-container glow-text-primary font-headline uppercase">
          THE SOVEREIGN PROTOCOL
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex space-x-8 font-headline uppercase text-[10px] tracking-[0.2em]">
            {['Daily Quest', 'Workout Archive', 'Schedule', 'User Stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-all hover:text-primary-container ${activeTab === tab ? 'text-primary-container font-black' : 'text-on-surface-variant'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 border-l border-outline-variant/20 pl-4">
            {authError && (
              <div className="hidden md:flex items-center gap-2 bg-error/10 border border-error/30 px-3 py-1.5 mr-2">
                <AlertTriangle className="w-3 h-3 text-error" />
                <span className="text-[8px] font-black text-error uppercase tracking-widest">{authError}</span>
                <button onClick={() => setAuthError(null)} className="text-error hover:text-white ml-2">×</button>
              </div>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="text-[8px] font-black text-primary-container uppercase tracking-widest leading-none mb-1">Operator</div>
                  <div className="text-[10px] font-headline text-on-surface uppercase tracking-tight">{user.displayName || 'OPERATOR_01'}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-8 h-8 border border-primary-container/30 flex items-center justify-center bg-primary-container/10 hover:bg-primary-container/20 transition-all group"
                  title="Logout"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <LogOut className="w-4 h-4 text-primary-container group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 px-3 py-1.5 hover:bg-primary-container/20 transition-all"
              >
                <LogIn className="w-4 h-4 text-primary-container" />
                <span className="font-headline text-[10px] font-black text-primary-container uppercase tracking-widest">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isSyncing ? (
                    <RefreshCw className="w-3 h-3 text-primary-container animate-spin" />
                  ) : user ? (
                    <Cloud className="w-3 h-3 text-primary-container" />
                  ) : (
                    <CloudOff className="w-3 h-3 text-on-surface-variant/30" />
                  )}
                  <span className="font-label text-[7px] text-on-surface-variant uppercase tracking-widest">
                    {isSyncing ? 'Syncing...' : user ? 'Cloud Active' : 'Offline Mode'}
                  </span>
                </div>
                {syncError && (
                  <div className="flex items-center gap-1 text-error">
                    <AlertTriangle className="w-2 h-2" />
                    <span className="text-[6px] uppercase">{syncError}</span>
                  </div>
                )}
              </div>
              {/* Support and Logs removed per user request */}
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:ml-64 pt-20 md:pt-24 pb-32 md:pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-12">
          {activeTab === 'Daily Quest' && (
            <>
              {/* Alert Banner */}
              <motion.section 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative p-4 md:p-6 overflow-hidden border-l-4 ${
                  isRestDay
                    ? 'bg-primary-container/5 border-primary-container/30'
                    : progress === 100 
                    ? 'bg-primary-container/10 border-primary-container' 
                    : 'bg-error-container/20 border-error'
                }`}
              >
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  {isRestDay ? (
                    <Shield className="w-24 h-24 md:w-32 md:h-32 text-primary-container" />
                  ) : progress === 100 ? (
                    <CheckCircle2 className="w-24 h-24 md:w-32 md:h-32 text-primary-container" />
                  ) : (
                    <AlertTriangle className="w-24 h-24 md:w-32 md:h-32 text-error" />
                  )}
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                  <div>
                    <h2 className={`font-headline font-black text-lg md:text-xl tracking-tighter uppercase flex items-center gap-2 ${
                      isRestDay ? 'text-primary-container/60' : progress === 100 ? 'text-primary-container' : 'text-error'
                    }`}>
                      {isRestDay ? (
                        <>
                          <Shield className="w-4 h-4 md:w-5 md:h-5" />
                          RECOVERY PROTOCOL
                        </>
                      ) : progress === 100 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                          PROTOCOL COMPLETED
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                          PROTOCOL BREACH
                        </>
                      )}
                      {getDeloadStatus().isDeloadWeek && !isRestDay && (
                        <span className="bg-emerald-500/20 text-emerald-500 text-[8px] px-2 py-0.5 border border-emerald-500/30 tracking-[0.2em] ml-2">
                          DELOAD ACTIVE
                        </span>
                      )}
                    </h2>
                    <p className={`mt-1 text-xs md:text-sm ${isRestDay ? 'text-on-surface-variant' : progress === 100 ? 'text-on-surface' : 'text-on-error-container'}`}>
                      {isRestDay ? (
                        <>No active objectives. System in standby mode. Rank: {currentRank.name}.</>
                      ) : progress === 100 ? (
                        <>Objectives secured. Rank: {currentRank.name}.</>
                      ) : (
                        <>Incomplete. Breach in <span className="font-mono font-bold">{timeLeftInDay}</span>. Rank: {currentRank.name}.</>
                      )}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 pb-4 md:pb-6 gap-4 md:gap-6">
                  <div>
                    <span className="font-label text-primary-container text-[8px] md:text-[10px] tracking-[0.4em] uppercase">Current Operation</span>
                    <h1 className="font-headline text-2xl md:text-5xl font-black text-on-surface tracking-tighter uppercase mt-1 md:mt-2">The Daily Quest</h1>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                    <div className="w-full md:w-auto text-left md:text-right">
                      <div className="font-label text-on-surface-variant text-[8px] md:text-[10px] tracking-[0.2em] uppercase mb-1 md:mb-2">Completion Status</div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="font-headline text-xl md:text-3xl font-bold text-primary-container">{progress}%</span>
                        <div className="flex-grow md:w-64 h-2 md:h-3 bg-surface-container-highest relative overflow-hidden">
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
                </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Rank Progress Card (Mobile First) */}
                <div className="lg:hidden">
                  <div className="bg-gradient-to-br from-surface-container-low to-surface-container-low/10 border border-primary-container/10 p-4 relative group overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                      <BarChart3 className="w-32 h-32 text-primary-container" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-[0.2em]">Rank Standing</div>
                          <div className="font-headline text-2xl font-black text-primary-container glow-text-primary">{currentRank.name}</div>
                        </div>
                        <div className="bg-primary-container/10 px-2 py-1 border border-primary-container/20">
                          <span className="font-mono text-[8px] text-primary-container">{currentRank.title}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between font-label text-[7px] text-on-surface-variant uppercase">
                          <span>{nextRank ? `XP to Rank ${nextRank.name}` : 'MAX RANK'}</span>
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
                </div>

                {/* Workout Checklist */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  {!isWorkoutActive ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-outline-variant/20 bg-surface-container-low/20">
                      {progress === 100 && workout.length > 0 ? (
                        <>
                          <CheckCircle2 className="w-16 h-16 text-emerald-500/40 mb-4" />
                          <h3 className="font-headline text-lg font-black text-emerald-400 uppercase tracking-widest">Protocol Secured</h3>
                          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-2 text-center px-8">
                            All objectives for this cycle have been met. System in post-mission standby.
                          </p>
                          <button 
                            onClick={() => startWorkout(true)}
                            className="mt-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-8 py-3 font-headline text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500/20 transition-all"
                          >
                            Re-Initialize Protocol
                          </button>
                        </>
                      ) : progress > 0 ? (
                        <>
                          <TrendingUp className="w-16 h-16 text-primary-container/40 mb-4" />
                          <h3 className="font-headline text-lg font-black text-primary-container uppercase tracking-widest">Protocol In Progress</h3>
                          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-2 text-center px-8">
                            Partial objectives met. System awaiting completion or re-initialization.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button 
                              onClick={() => startWorkout(false)}
                              className="bg-primary-container text-on-primary-container px-8 py-3 font-headline text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all"
                            >
                              Resume Protocol
                            </button>
                            <button 
                              onClick={() => startWorkout(true)}
                              className="bg-surface-container-high text-on-surface-variant border border-outline-variant/20 px-8 py-3 font-headline text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-container-highest transition-all"
                            >
                              Reset Protocol
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Lock className="w-16 h-16 text-primary-container/20 mb-4" />
                          <h3 className="font-headline text-lg font-black text-on-surface-variant uppercase tracking-widest">Protocol Locked</h3>
                          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-2 text-center px-8">
                            {isRestDay ? 'System in standby mode. No objectives assigned.' : 'Initialize workout to unlock today\'s objectives.'}
                          </p>
                          <button 
                            onClick={() => startWorkout(false)}
                            className="mt-6 bg-primary-container text-on-primary-container px-8 py-3 font-headline text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all"
                          >
                            Initialize Workout
                          </button>
                        </>
                      )}
                    </div>
                  ) : isRestDay ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-emerald-500/20 bg-surface-container-low/20">
                      <Shield className="w-16 h-16 text-emerald-500/20 mb-4" />
                      <h3 className="font-headline text-lg font-black text-emerald-400 uppercase tracking-widest">Rest Day Active</h3>
                      <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-2">No objectives assigned for this cycle.</p>
                      <button 
                        onClick={() => setActiveTab('Schedule')}
                        className="mt-6 text-emerald-400 font-headline text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
                      >
                        Modify Schedule
                      </button>
                    </div>
                  ) : (
                    <>
                      {workout.some(item => !item.completed && getOverloadSuggestion(item.name)) && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-primary-container/5 border border-primary-container/30 p-4 flex items-start gap-4"
                        >
                          <div className="p-2 bg-primary-container/10">
                            <TrendingUp className="w-5 h-5 text-primary-container" />
                          </div>
                          <div>
                            <div className="font-headline text-[10px] font-black uppercase tracking-[0.2em] text-primary-container mb-1">System Recommendation: Progressive Overload</div>
                            <p className="text-[10px] text-on-surface-variant uppercase leading-relaxed">
                              Previous data detected. To maintain Rank progression, consider increasing intensity on highlighted exercises.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline text-base md:text-lg font-bold uppercase tracking-widest text-primary-container flex items-center gap-2 md:gap-3">
                          <Bolt className="w-4 h-4 md:w-5 md:h-5" />
                          Today's Workout
                        </h3>
                        <div className="font-label text-[8px] md:text-[10px] text-on-surface-variant uppercase tracking-widest bg-surface-container-high px-2 md:px-3 py-1">
                          Phase: Hypertrophy
                        </div>
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        <AnimatePresence mode="popLayout">
                          {workout.map((item) => (
                            <motion.div 
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`group p-3 md:p-5 flex flex-col md:flex-row items-center gap-3 md:gap-6 transition-all border-l-2 ${
                                item.completed 
                                  ? 'bg-surface-container-low/50 opacity-60 border-primary-container' 
                                  : 'bg-surface-container-low hover:bg-surface-container-high border-transparent hover:border-primary-container'
                              }`}
                            >
                              <div className="flex-grow w-full md:w-auto">
                                <div className={`font-headline font-bold uppercase tracking-tight text-sm md:text-lg flex flex-col gap-1 ${item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                                  <div className="flex items-center gap-2">
                                    {item.name}
                                    {!item.completed && getOverloadSuggestion(item.name) && (
                                      <TrendingUp className="w-3 h-3 text-primary-container animate-pulse" />
                                    )}
                                  </div>
                                  {!item.completed && getOverloadSuggestion(item.name) && (
                                    <div className="bg-primary-container/10 border border-primary-container/20 p-2 mt-1">
                                      <div className="text-[8px] text-primary-container font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <Zap className="w-2 h-2" />
                                        Progressive Overload Intel
                                      </div>
                                      <div className="text-[10px] text-on-surface uppercase leading-tight">
                                        Target: <span className="text-primary-container font-bold">{getOverloadSuggestion(item.name)?.suggestion}</span>
                                        <span className="text-on-surface-variant ml-2">(Previous: {getOverloadSuggestion(item.name)?.original})</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="font-label text-[8px] md:text-[10px] text-on-surface-variant tracking-[0.1em] uppercase">Target: {item.target}</div>
                              </div>

                              <div className="flex flex-col md:flex-row items-center justify-between md:justify-start gap-4 md:gap-6 w-full md:w-auto">
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                  {(item.setData || Array.from({ length: parseInt(item.sets) || 1 }, () => ({ weight: item.weight, reps: item.reps }))).map((set, idx) => (
                                    <div key={idx} className="flex items-center gap-3 md:gap-4">
                                      <span className="font-mono text-[8px] text-on-surface-variant w-4">#{idx + 1}</span>
                                      <div className="flex flex-col items-center">
                                        {idx === 0 && <span className="font-label text-[7px] md:text-[8px] text-on-surface-variant uppercase mb-1">Weight</span>}
                                        <input 
                                          type="text"
                                          value={set.weight}
                                          onChange={(e) => updateWorkoutSet(item.id, idx, 'weight', e.target.value)}
                                          className="w-12 md:w-16 bg-surface-container-highest/30 border-b border-primary-container/20 font-mono text-primary-container text-xs md:text-sm text-center focus:outline-none focus:border-primary-container transition-colors"
                                        />
                                      </div>
                                      <div className="flex flex-col items-center">
                                        {idx === 0 && <span className="font-label text-[7px] md:text-[8px] text-on-surface-variant uppercase mb-1">Reps</span>}
                                        <input 
                                          type="number"
                                          value={set.reps}
                                          onChange={(e) => updateWorkoutSet(item.id, idx, 'reps', parseInt(e.target.value) || 0)}
                                          className="w-10 md:w-12 bg-surface-container-highest/30 border-b border-primary-container/20 font-mono text-primary-container text-xs md:text-sm text-center focus:outline-none focus:border-primary-container transition-colors"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-center gap-4 md:gap-6">
                                  <div className="flex flex-col items-center">
                                    <span className="font-label text-[7px] md:text-[8px] text-on-surface-variant uppercase mb-1">Sets</span>
                                    <input 
                                      type="text"
                                      value={item.sets}
                                      onChange={(e) => updateWorkoutItem(item.id, 'sets', e.target.value)}
                                      className="w-8 md:w-10 bg-surface-container-highest/30 border-b border-primary-container/20 font-mono text-on-surface-variant text-xs md:text-sm text-center focus:outline-none focus:border-primary-container transition-colors"
                                    />
                                  </div>
                                  <button 
                                    onClick={() => toggleComplete(item.id)}
                                    className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 transition-all ${
                                      item.completed 
                                        ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                                        : 'border border-primary-container/30 bg-primary-container/5 hover:bg-primary-container/20'
                                    }`}
                                  >
                                    {item.completed ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-container" />}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>

                {/* Sidebar Modules */}
                <div className="space-y-4 md:space-y-8">
                  {/* Status HUD */}
                  <div className="hidden md:block bg-surface-container-low/30 border border-outline-variant/10 p-4 md:p-6 space-y-3 md:space-y-4">
                    {[
                      { label: 'Protocol Duration', value: isRestDay ? 'RECOVERY' : formatTime(timer), color: isRestDay ? 'text-emerald-400' : 'text-primary-container', icon: isRestDay ? Shield : Terminal },
                      { label: 'System Latency', value: '12ms', color: 'text-primary-container' },
                      { label: 'Deload Status', value: getDeloadStatus().isDeloadWeek ? 'ACTIVE' : `W${getDeloadStatus().weekInCycle}/${programDuration}`, color: getDeloadStatus().isDeloadWeek ? 'text-emerald-500' : 'text-on-surface-variant' },
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
                      <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">LONE WOLF</div>
                      <div className="font-headline text-[10px] font-bold text-on-surface uppercase leading-relaxed">
                        CURRENT OBJECTIVE: SURVIVE
                      </div>
                    </div>
                  </div>

                  {/* Rank Progress Card (Desktop) */}
                  <div className="hidden lg:block bg-gradient-to-br from-surface-container-low to-surface-container-low/10 border border-primary-container/10 p-4 md:p-6 relative group overflow-hidden">
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
                  <div className="hidden md:block space-y-3 md:space-y-4">
                    <h4 className="font-headline text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant px-2">Pending Intel</h4>
                    <div className="bg-surface-container-low p-3 md:p-4 flex gap-3 md:gap-4 items-center border border-outline-variant/10">
                      <div className="p-2 bg-surface-container-high border border-outline-variant/20">
                        <Lock className="w-3 h-3 md:w-4 md:h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <div className="font-headline text-[9px] md:text-[10px] font-bold uppercase tracking-tight">MOUNTAIN DEW PROTOCOL</div>
                        <div className="text-[7px] md:text-[8px] text-on-surface-variant uppercase tracking-wider">
                          {exp < 10000 
                            ? `GET ${10000 - exp} MORE EXP TO UNLOCK` 
                            : 'PROTOCOL UNLOCKED'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col md:flex-row gap-4 mt-8">
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Protocol Planning</span>
                  <h1 className="font-headline text-3xl md:text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">Training Schedule</h1>
                </div>
              </div>

              {/* Deload Configuration */}
              <div className="bg-surface-container-low p-6 border border-outline-variant/10">
                <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-primary-container mb-6 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  Deload Cycle Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Program Duration (Weeks)</label>
                    <select 
                      value={programDuration}
                      onChange={(e) => setProgramDuration(parseInt(e.target.value))}
                      className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                    >
                      {[4, 5, 6, 7, 8].map(w => <option key={w} value={w}>{w} Weeks</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Program Start Date</label>
                    <input 
                      type="date"
                      value={programStartDate}
                      onChange={(e) => setProgramStartDate(e.target.value)}
                      className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-headline text-[10px] p-3 uppercase tracking-widest"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => setIsDeloadEnabled(!isDeloadEnabled)}
                      className={`w-full py-3 font-headline text-[10px] font-black tracking-widest uppercase transition-all ${
                        isDeloadEnabled 
                          ? 'bg-primary-container text-on-primary-container' 
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {isDeloadEnabled ? 'Deload Protocol: Active' : 'Deload Protocol: Disabled'}
                    </button>
                  </div>
                </div>
                {isDeloadEnabled && (
                  <div className="mt-4 p-3 bg-primary-container/5 border border-primary-container/20">
                    <div className="flex justify-between items-center">
                      <div className="font-label text-[8px] text-primary-container uppercase tracking-widest">Current Status</div>
                      <div className="font-mono text-[10px] text-on-surface">
                        Week {getDeloadStatus().currentWeek} of Program | {getDeloadStatus().isDeloadWeek ? 'DELOAD ACTIVE' : `Week ${getDeloadStatus().weekInCycle} of ${programDuration}`}
                      </div>
                    </div>
                  </div>
                )}
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
                            <div className="flex-grow">
                              <div className="font-headline font-bold uppercase tracking-tight text-sm">{ex.name}</div>
                              <div className="font-label text-[8px] text-on-surface-variant uppercase mb-2">{ex.target} | {ex.sets} sets</div>
                              {ex.setData && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {ex.setData.map((s, idx) => (
                                    <div key={idx} className="bg-surface-container-highest/30 p-1 px-2 text-[7px] text-on-surface-variant uppercase flex justify-between">
                                      <span>S{idx + 1}</span>
                                      <span className="text-primary-container">{s.weight} x {s.reps}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!ex.setData && (
                                <div className="font-label text-[8px] text-on-surface-variant uppercase opacity-60">{ex.weight} | {ex.reps} reps</div>
                              )}
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Historical Data</span>
                  <h1 className="font-headline text-3xl md:text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">Protocol Archive</h1>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  {archive.length > 0 && (
                    <button 
                      onClick={() => setShowPurgeModal(true)}
                      className="w-full md:w-auto font-headline text-[10px] font-black uppercase tracking-[0.2em] text-error hover:text-error/80 transition-colors border border-error/20 px-4 py-2 bg-error/5 hover:bg-error/10"
                    >
                      Purge Archive Data
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-surface-container-low p-4 md:p-6 border border-outline-variant/10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-4">
                    <h3 className="font-headline text-sm md:text-lg font-bold uppercase tracking-widest text-primary-container flex items-center gap-2 md:gap-3">
                      <History className="w-4 h-4 md:w-5 md:h-5" />
                      Daily Quest History
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full md:w-auto justify-between">
                      <div className="font-label text-[8px] md:text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {format(currentMonth, 'MMMM yyyy')}
                      </div>
                      <div className="flex gap-1 md:gap-2">
                        <button 
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-1.5 md:p-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/10"
                        >
                          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-1.5 md:p-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/10"
                        >
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-outline-variant/10 border border-outline-variant/10">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                      <div key={idx} className="bg-surface-container-low p-1 md:p-2 text-center font-label text-[8px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">
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
                        const { isDeloadWeek, weekInCycle, isActiveProgram } = getDeloadStatus(day);
                        const isSelected = selectedArchiveDate && isSameDay(day, selectedArchiveDate);
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedArchiveDate(day)}
                            className={`relative h-14 md:h-24 p-1 md:p-2 transition-all hover:z-10 ${
                              isCurrentMonth ? 'bg-surface-container-low' : 'bg-surface-container-low/30 opacity-30'
                            } ${isSelected ? 'ring-2 ring-primary-container ring-inset z-10' : ''} ${
                              isDeloadWeek ? 'bg-emerald-500/5' : ''
                            } border-r border-b border-outline-variant/10 overflow-hidden`}
                          >
                            {/* Program/Deload Line */}
                            {isActiveProgram && isCurrentMonth && (
                              <div className={`absolute bottom-0 left-0 right-0 h-1 md:h-1.5 ${isDeloadWeek ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-primary-container shadow-[0_0_8px_rgba(0,229,255,0.4)]'}`} />
                            )}

                            <div className="flex justify-between items-start">
                              <span className={`font-mono text-[8px] md:text-[10px] ${isSameDay(day, new Date()) ? 'text-primary-container font-bold' : 'text-on-surface-variant'}`}>
                                {format(day, 'd')}
                              </span>
                              {isDeloadEnabled && isCurrentMonth && (
                                <span className={`text-[6px] uppercase tracking-tighter ${isDeloadWeek ? 'text-emerald-500 font-bold' : 'text-on-surface-variant/40'}`}>
                                  {isDeloadWeek ? 'DELOAD' : `W${weekInCycle}`}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-1 md:mt-2 flex flex-wrap gap-0.5 md:gap-1 justify-center">
                              {dayEntries.map(entry => (
                                <div key={entry.id} className="flex items-center justify-center">
                                  {entry.type === 'COMPLETED' ? (
                                    <CheckCircle2 className="w-2 h-2 md:w-4 md:h-4 text-primary-container" />
                                  ) : entry.type === 'INCOMPLETE' ? (
                                    <AlertTriangle className="w-2 h-2 md:w-4 md:h-4 text-amber-500" />
                                  ) : entry.type === 'BREACH' ? (
                                    <XCircle className="w-2 h-2 md:w-4 md:h-4 text-error shadow-[0_0_10px_rgba(255,68,68,0.4)]" />
                                  ) : (
                                    <XCircle className="w-2 h-2 md:w-4 md:h-4 text-error" />
                                  )}
                                </div>
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
                  <div className="bg-surface-container-low p-4 md:p-6 border border-outline-variant/10 h-full">
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
                          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-outline-variant/20 space-y-4">
                            <div className="text-on-surface-variant/30 font-headline text-[10px] uppercase tracking-widest text-center">
                              No protocol data for this cycle
                            </div>
                            <button 
                              onClick={() => createManualArchiveEntry(selectedArchiveDate)}
                              className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 px-4 py-2 text-[8px] font-black text-primary-container uppercase tracking-widest hover:bg-primary-container/20 transition-all"
                            >
                              <Rocket className="w-3 h-3" />
                              Initialize Manual Entry
                            </button>
                          </div>
                        ) : (
                          <>
                            {archive.filter(e => e.date === format(selectedArchiveDate, 'yyyy-MM-dd')).map(entry => (
                            <div key={entry.id} className="space-y-4">
                              <div className={`p-4 border-l-2 ${
                                entry.type === 'COMPLETED' ? 'bg-primary-container/5 border-primary-container' : 
                                entry.type === 'INCOMPLETE' ? 'bg-amber-500/5 border-amber-500' : 
                                entry.type === 'BREACH' ? 'bg-error/10 border-error shadow-[inset_0_0_20px_rgba(255,68,68,0.1)]' : 'bg-error/5 border-error'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    {entry.type === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-primary-container" /> : 
                                     entry.type === 'INCOMPLETE' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                                     entry.type === 'BREACH' ? <XCircle className="w-4 h-4 text-error animate-pulse" /> :
                                     <XCircle className="w-4 h-4 text-error" />}
                                    <span className={`font-headline text-sm font-bold uppercase tracking-tight ${entry.type === 'BREACH' ? 'text-error' : ''}`}>{entry.details}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleEditArchive(entry)}
                                    className="p-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/10 transition-all"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest flex items-center gap-3">
                                  <span>Status: {entry.type} {entry.progress !== undefined && `(${entry.progress}%)`}</span>
                                  {entry.duration !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-2 h-2" />
                                      {formatTime(entry.duration)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {entry.exercises && (
                                <div className="space-y-2">
                                  <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 pb-1">Exercise Intel</div>
                                  {entry.exercises.map(ex => (
                                    <div key={ex.id} className="bg-surface-container-high p-3 space-y-2 border border-outline-variant/10">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="font-headline font-bold uppercase tracking-tight text-[10px]">{ex.name}</div>
                                          <div className="font-label text-[8px] text-on-surface-variant uppercase">{ex.target}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-label text-[8px] text-on-surface-variant uppercase">{ex.sets} Sets</div>
                                        </div>
                                      </div>
                                      {ex.setData ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-outline-variant/5">
                                          {ex.setData.map((s, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-surface-container-highest/20 border border-outline-variant/10 rounded">
                                              <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                                                  <span className="font-headline text-[8px] font-bold text-primary-container">{idx + 1}</span>
                                                </div>
                                                <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Set</span>
                                              </div>
                                              <div className="flex gap-3">
                                                <div className="text-right">
                                                  <div className="text-[6px] text-on-surface-variant/50 uppercase leading-none mb-0.5">Weight</div>
                                                  <div className="font-mono text-[10px] text-on-surface leading-none">{s.weight}</div>
                                                </div>
                                                <div className="text-right">
                                                  <div className="text-[6px] text-on-surface-variant/50 uppercase leading-none mb-0.5">Reps</div>
                                                  <div className="font-mono text-[10px] text-on-surface leading-none">{s.reps}</div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-center p-2 bg-surface-container-highest/20 border border-outline-variant/10 rounded pt-2 mt-2">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                                              <span className="font-headline text-[8px] font-bold text-primary-container">1</span>
                                            </div>
                                            <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">Standard Protocol</span>
                                          </div>
                                          <div className="flex gap-3">
                                            <div className="text-right">
                                              <div className="text-[6px] text-on-surface-variant/50 uppercase leading-none mb-0.5">Weight</div>
                                              <div className="font-mono text-[10px] text-on-surface leading-none">{ex.weight}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-[6px] text-on-surface-variant/50 uppercase leading-none mb-0.5">Reps</div>
                                              <div className="font-mono text-[10px] text-on-surface leading-none">{ex.reps}</div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                            <button 
                              onClick={() => createManualArchiveEntry(selectedArchiveDate)}
                              className="w-full py-3 border border-dashed border-outline-variant/20 text-[8px] uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest/20 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3 h-3" />
                              Add Another Session
                            </button>
                          </>
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-[10px] tracking-[0.4em] uppercase">Biometric Analysis</span>
                  <h1 className="font-headline text-3xl md:text-5xl font-black text-on-surface tracking-tighter uppercase mt-2">Operator Stats</h1>
                </div>
                {selectedArchiveDate && (
                  <button 
                    onClick={() => setSelectedArchiveDate(null)}
                    className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 px-4 py-2 text-[10px] font-black text-primary-container uppercase tracking-widest hover:bg-primary-container/20 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset to Global Stats
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div 
                    key={stat.label} 
                    className={`bg-surface-container-low p-6 border border-outline-variant/10 transition-all ${stat.label.includes('Volume') ? 'cursor-pointer hover:bg-surface-container-high hover:border-primary-container/30 group' : ''}`}
                    onClick={() => {
                      if (stat.label.includes('Volume') && stat.numericValue !== undefined) {
                        setComparisonModal({ isOpen: true, weight: stat.numericValue, label: stat.label });
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <stat.icon className={`w-6 h-6 ${stat.color} ${stat.label.includes('Volume') ? 'group-hover:scale-110 transition-transform' : ''}`} />
                      <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{stat.label}</div>
                    </div>
                    <div className="font-headline text-3xl font-black text-on-surface uppercase tracking-tighter flex items-baseline gap-2">
                      {stat.value}
                      {stat.label.includes('Volume') && (
                        <span className="text-[8px] text-primary-container opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Compare</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-low p-6 md:p-8 border border-outline-variant/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-primary-container">Performance Matrix</h3>
                  <div className="flex gap-4">
                    {[
                      { label: 'Completed', color: 'bg-primary-container' },
                      { label: 'Incomplete', color: 'bg-amber-500' },
                      { label: 'Breach', color: 'bg-error' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${item.color}`} />
                        <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative h-64 flex gap-4">
                  {/* Y-Axis */}
                  <div className="flex flex-col justify-between text-[8px] font-mono text-on-surface-variant/40 uppercase py-1 h-full border-r border-outline-variant/10 pr-2">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>

                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 left-10 right-0 pointer-events-none">
                    {[0, 25, 50, 75, 100].map(tick => (
                      <div 
                        key={tick} 
                        className="absolute w-full border-t border-outline-variant/5" 
                        style={{ bottom: `${tick}%` }}
                      />
                    ))}
                  </div>

                  {/* Bars Container */}
                  <div className="flex-grow flex items-end justify-between gap-2 md:gap-4 h-full relative z-10">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const dayEntry = archive.find(e => e.date === dateStr);
                      const height = dayEntry ? (
                        dayEntry.type === 'COMPLETED' ? 100 : 
                        dayEntry.type === 'INCOMPLETE' ? (dayEntry.progress || 50) : 10
                      ) : 0;
                      const dayLabel = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
                      const formattedDate = format(date, 'MMM dd');
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full">
                          <div 
                            className={`w-full bg-surface-container-high/30 relative group h-full flex items-end cursor-pointer transition-all ${
                              selectedArchiveDate && isSameDay(date, selectedArchiveDate) ? 'ring-1 ring-primary-container bg-primary-container/5' : ''
                            }`}
                            onClick={() => {
                              if (selectedArchiveDate && isSameDay(date, selectedArchiveDate)) {
                                setSelectedArchiveDate(null);
                              } else {
                                setSelectedArchiveDate(date);
                              }
                            }}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 p-2 bg-surface-container-highest border border-primary-container/30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                              <div className="text-[8px] text-primary-container font-black uppercase tracking-widest mb-1">{formattedDate}</div>
                              <div className="text-[10px] text-on-surface uppercase font-bold">
                                {dayEntry ? `${height}%` : 'NO INTEL'}
                              </div>
                              <div className="text-[7px] text-on-surface-variant uppercase mt-1">
                                {dayEntry?.type || 'IDLE'}
                              </div>
                            </div>

                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              className={`w-full border-t-2 transition-all relative ${
                                dayEntry?.type === 'COMPLETED' 
                                  ? 'bg-primary-container/20 border-primary-container group-hover:bg-primary-container/40' 
                                  : dayEntry?.type === 'INCOMPLETE'
                                  ? 'bg-amber-500/20 border-amber-500 group-hover:bg-amber-500/40'
                                  : 'bg-on-surface-variant/5 border-on-surface-variant/20'
                              }`}
                            >
                              {height > 0 && (
                                <div className="absolute inset-0 scanline-overlay opacity-20"></div>
                              )}
                            </motion.div>
                          </div>
                          <span className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
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

      {/* Rest Day Alert Modal */}
      <AnimatePresence>
        {isRestDayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRestDayModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface-container-low border border-emerald-500/30 p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
            >
              <div className="flex items-center gap-4 text-emerald-400 mb-6">
                <Shield className="w-8 h-8" />
                <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">RECOVERY ACTIVE</h3>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 uppercase tracking-wide">
                CURRENTLY REST DAY ACTIVE. SYSTEM IS IN STANDBY MODE. NO OBJECTIVES ASSIGNED FOR THIS CYCLE.
              </p>

              <button 
                onClick={() => setIsRestDayModalOpen(false)}
                className="w-full bg-emerald-500 text-on-emerald py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:brightness-110 transition-all"
              >
                ACKNOWLEDGE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workout Initialized Modal */}
      <AnimatePresence>
        {isWorkoutInitModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWorkoutInitModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface-container-low border border-primary-container/30 p-8 shadow-[0_0_50px_rgba(0,229,255,0.2)]"
            >
              <div className="flex items-center gap-4 text-primary-container mb-6">
                <Rocket className="w-8 h-8" />
                <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">PROTOCOL ENGAGED</h3>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 uppercase tracking-wide">
                DAILY QUEST INITIALIZED. ALL OBJECTIVES ARE NOW UNLOCKED. SYSTEM IS TRACKING PERFORMANCE.
              </p>

              <button 
                onClick={() => setIsWorkoutInitModalOpen(false)}
                className="w-full bg-primary-container text-on-primary-container py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:brightness-110 transition-all"
              >
                BEGIN MISSION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Volume Comparison Modal */}
      <AnimatePresence>
        {comparisonModal?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setComparisonModal(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-low border border-primary-container/30 p-8 shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -right-12 -top-12 opacity-5">
                <Zap className="w-48 h-48 text-primary-container" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 text-primary-container mb-6">
                  <Activity className="w-8 h-8" />
                  <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">Volume Comparison</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{comparisonModal.label}</div>
                    <div className="font-headline text-4xl font-black text-primary-container">{comparisonModal.weight.toLocaleString()} KG</div>
                  </div>

                  <div className="bg-primary-container/5 border border-primary-container/20 p-6 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
                    <div className="font-label text-[8px] text-primary-container uppercase tracking-[0.3em] mb-3">Equivalent Mass</div>
                    <div className="font-headline text-xl font-black text-on-surface uppercase tracking-tight leading-tight italic">
                      "You've lifted the equivalent of {getWeightComparison(comparisonModal.weight)}."
                    </div>
                  </div>

                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest leading-relaxed">
                    This represents the total gravitational force overcome during your training cycle. Your physical output is reaching critical levels.
                  </p>

                  <button 
                    onClick={() => setComparisonModal(null)}
                    className="w-full bg-primary-container text-on-primary-container py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:brightness-110 transition-all mt-4"
                  >
                    Acknowledge Intel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Archive Edit Modal */}
      <AnimatePresence>
        {editingArchiveEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingArchiveEntry(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-low border border-primary-container/30 p-6 md:p-8 shadow-[0_0_50px_rgba(0,229,255,0.15)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4 text-primary-container">
                  <History className="w-8 h-8" />
                  <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">Edit Protocol Data</h3>
                </div>
                <button 
                  onClick={() => setEditingArchiveEntry(null)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest block mb-2">Protocol Details</label>
                    <input 
                      type="text" 
                      value={editingArchiveEntry.details}
                      onChange={(e) => setEditingArchiveEntry({...editingArchiveEntry, details: e.target.value})}
                      className="w-full bg-surface-container-high border border-outline-variant/20 p-3 font-headline text-xs uppercase tracking-tight text-on-surface focus:border-primary-container outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest block mb-2">Duration (sec)</label>
                    <input 
                      type="number" 
                      value={editingArchiveEntry.duration || 0}
                      onChange={(e) => setEditingArchiveEntry({...editingArchiveEntry, duration: parseInt(e.target.value) || 0})}
                      className="w-full bg-surface-container-high border border-outline-variant/20 p-3 font-headline text-xs uppercase tracking-tight text-on-surface focus:border-primary-container outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest block mb-2">Status</label>
                    <select 
                      value={editingArchiveEntry.type}
                      onChange={(e) => setEditingArchiveEntry({...editingArchiveEntry, type: e.target.value as 'COMPLETED' | 'INCOMPLETE' | 'BREACH'})}
                      className={`w-full bg-surface-container-high border p-3 font-headline text-xs uppercase tracking-tight text-on-surface focus:border-primary-container outline-none transition-all ${
                        editingArchiveEntry.type === 'BREACH' ? 'border-error/50 text-error' : 'border-outline-variant/20'
                      }`}
                    >
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="INCOMPLETE">INCOMPLETE</option>
                      <option value="BREACH">BREACH</option>
                    </select>
                  </div>
                </div>

                {editingArchiveEntry.exercises && (
                  <div className="space-y-4">
                    <div className="font-label text-[8px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 pb-1">Exercise Intel Modification</div>
                    {editingArchiveEntry.exercises.map((ex, exIdx) => (
                      <div key={ex.id} className="bg-surface-container-high p-4 border border-outline-variant/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <input 
                            type="text" 
                            value={ex.name}
                            onChange={(e) => {
                              const newExercises = [...(editingArchiveEntry.exercises || [])];
                              newExercises[exIdx] = { ...ex, name: e.target.value };
                              setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                            }}
                            className="bg-transparent border-b border-outline-variant/20 font-headline font-bold uppercase tracking-tight text-[10px] w-1/2 focus:border-primary-container outline-none"
                          />
                          <button 
                            onClick={() => {
                              const newExercises = (editingArchiveEntry.exercises || []).filter((_, i) => i !== exIdx);
                              setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                            }}
                            className="text-error/40 hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {ex.setData ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ex.setData.map((s, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-3 p-2 bg-surface-container-highest/20 border border-outline-variant/10 rounded">
                                <span className="font-headline text-[8px] font-bold text-primary-container">{sIdx + 1}</span>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[6px] text-on-surface-variant/50 uppercase tracking-widest">Weight</label>
                                  <input 
                                    type="text" 
                                    value={s.weight}
                                    onChange={(e) => {
                                      const newExercises = [...(editingArchiveEntry.exercises || [])];
                                      const newSetData = [...(ex.setData || [])];
                                      newSetData[sIdx] = { ...s, weight: e.target.value };
                                      newExercises[exIdx] = { ...ex, setData: newSetData };
                                      setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                    }}
                                    className="w-20 bg-surface-container-highest border border-outline-variant/20 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                    placeholder="Weight"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[6px] text-on-surface-variant/50 uppercase tracking-widest">Reps</label>
                                  <input 
                                    type="text"
                                    inputMode="numeric"
                                    value={s.reps || ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                      const newExercises = [...(editingArchiveEntry.exercises || [])];
                                      const newSetData = [...(ex.setData || [])];
                                      newSetData[sIdx] = { ...s, reps: val };
                                      newExercises[exIdx] = { ...ex, setData: newSetData };
                                      setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                    }}
                                    className="w-16 bg-surface-container-highest border border-outline-variant/20 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                    placeholder="Reps"
                                  />
                                </div>
                                <button 
                                  onClick={() => {
                                    const newExercises = [...(editingArchiveEntry.exercises || [])];
                                    const newSetData = (ex.setData || []).filter((_, i) => i !== sIdx);
                                    newExercises[exIdx] = { ...ex, setData: newSetData, sets: newSetData.length.toString() };
                                    setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                  }}
                                  className="mt-4 text-error/40 hover:text-error transition-colors"
                                >
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newExercises = [...(editingArchiveEntry.exercises || [])];
                                const newSetData = [...(ex.setData || []), { weight: ex.weight || '0', reps: ex.reps || 0 }];
                                newExercises[exIdx] = { ...ex, setData: newSetData, sets: newSetData.length.toString() };
                                setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                              }}
                              className="col-span-full py-2 border border-dashed border-outline-variant/20 text-[8px] uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest/20 transition-all"
                            >
                              + Add Set
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[6px] text-on-surface-variant/50 uppercase tracking-widest">Sets</label>
                              <input 
                                type="text" 
                                value={ex.sets}
                                onChange={(e) => {
                                  const newExercises = [...(editingArchiveEntry.exercises || [])];
                                  newExercises[exIdx] = { ...ex, sets: e.target.value };
                                  setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                }}
                                className="w-16 bg-surface-container-highest border border-outline-variant/20 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                placeholder="Sets"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[6px] text-on-surface-variant/50 uppercase tracking-widest">Weight</label>
                              <input 
                                type="text" 
                                value={ex.weight}
                                onChange={(e) => {
                                  const newExercises = [...(editingArchiveEntry.exercises || [])];
                                  newExercises[exIdx] = { ...ex, weight: e.target.value };
                                  setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                }}
                                className="w-24 bg-surface-container-highest border border-outline-variant/20 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                placeholder="Weight"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[6px] text-on-surface-variant/50 uppercase tracking-widest">Reps</label>
                              <input 
                                type="text"
                                inputMode="numeric"
                                value={ex.reps || ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                  const newExercises = [...(editingArchiveEntry.exercises || [])];
                                  newExercises[exIdx] = { ...ex, reps: val };
                                  setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                }}
                                className="w-16 bg-surface-container-highest border border-outline-variant/20 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                placeholder="Reps"
                              />
                            </div>
                            <button 
                              onClick={() => {
                                const newExercises = [...(editingArchiveEntry.exercises || [])];
                                const numSets = parseInt(ex.sets) || 1;
                                const newSetData = Array.from({ length: numSets }, () => ({ weight: ex.weight, reps: ex.reps }));
                                newExercises[exIdx] = { ...ex, setData: newSetData };
                                setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                              }}
                              className="mt-auto mb-1 text-[8px] uppercase tracking-widest text-primary-container/60 hover:text-primary-container transition-colors"
                            >
                              Convert to Per-Set
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newExercises = [...(editingArchiveEntry.exercises || [])];
                        newExercises.push({
                          id: Math.random().toString(36).substr(2, 9),
                          name: 'New Exercise',
                          sets: '1',
                          reps: 0,
                          weight: '0',
                          completed: true
                        });
                        setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                      }}
                      className="w-full py-4 border border-dashed border-outline-variant/20 text-[10px] uppercase tracking-widest text-primary-container hover:bg-primary-container/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Exercise to Entry
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => saveArchiveEdit(editingArchiveEntry)}
                    className="flex-grow bg-primary-container text-on-primary-container py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:brightness-110 transition-all"
                  >
                    Commit Changes
                  </button>
                  <button 
                    onClick={() => deleteArchiveEntry(editingArchiveEntry.id)}
                    className="px-6 bg-error/10 text-error border border-error/20 py-4 font-headline text-[10px] font-black tracking-[0.3em] uppercase hover:bg-error/20 transition-all"
                  >
                    Purge Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low/90 backdrop-blur-lg border-t border-primary-container/10 flex justify-around p-4 z-50">
        {[
          { icon: Bolt, label: 'Quest', tab: 'Daily Quest' },
          { icon: History, label: 'Archive', tab: 'Workout Archive' },
          { icon: CalendarIcon, label: 'Schedule', tab: 'Schedule' },
          { icon: BarChart3, label: 'Stats', tab: 'User Stats' },
        ].map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center transition-all ${activeTab === item.tab ? 'text-primary-container scale-110' : 'text-on-surface-variant/50'}`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.tab ? 'glow-primary' : ''}`} />
            <span className="text-[7px] uppercase tracking-[0.2em] mt-1 font-headline font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  </div>
  );
}
