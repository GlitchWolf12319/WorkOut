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
  Trophy,
  ChevronRight,
  ChevronDown,
  LayoutList,
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
  Trash2,
  Scale,
  Utensils,
  TrendingDown,
  Edit2,
  Play,
  Youtube
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
  parseISO,
  differenceInDays
} from 'date-fns';
import { 
  WorkoutItem, 
  ScheduleDay, 
  WeeklySchedule,
  ArchiveEntry, 
  WeightEntry,
  WorkoutSet
} from './types';
import { PROGRAMS, Program } from './data/programs';
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
import { videoIds } from './videos';

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
          <div className="max-w-md w-full bg-[#1c1c1e] border border-error/30 p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
            <h2 className="font-sans font-semibold text-xl font-bold text-on-surface   mb-2">System Critical Error</h2>
            <p className="text-on-surface-variant text-xs   mb-6 leading-relaxed">
              The protocol has encountered a fatal exception. Please refresh or contact support.
            </p>
            <div className="bg-error/5 p-4 mb-6 text-left overflow-auto max-h-32">
              <code className="text-sm text-error font-mono break-all">{this.state.errorInfo}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-primary-container text-on-primary-container font-sans font-semibold text-sm font-bold   py-3 hover:brightness-110 transition-all"
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

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];

const INITIAL_SCHEDULE: ScheduleDay[] = DAYS.map(day => ({
  day,
  exercises: []
}));

const INITIAL_WORKOUT: WorkoutItem[] = [];

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
  const [hasInitialSyncCompleted, setHasInitialSyncCompleted] = useState(false);
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
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    try {
      const saved = localStorage.getItem('sovereign_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return { 1: parsed };
        }
        return parsed;
      }
      return { 1: INITIAL_SCHEDULE };
    } catch (e) {
      console.error("Failed to parse schedule from localStorage", e);
      return { 1: INITIAL_SCHEDULE };
    }
  });
  const [currentWeekTab, setCurrentWeekTab] = useState<number>(1);
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
  const [currentWeight, setCurrentWeight] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_current_weight');
    return saved ? parseFloat(saved) : 75;
  });
  const [targetWeight, setTargetWeight] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_target_weight');
    return saved ? parseFloat(saved) : 80;
  });
  const [nutritionGoal, setNutritionGoal] = useState<'CUT' | 'BULK' | 'MAINTAIN'>(() => {
    const saved = localStorage.getItem('sovereign_nutrition_goal');
    return (saved as any) || 'MAINTAIN';
  });
  const [proteinPerKg, setProteinPerKg] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_protein_per_kg');
    return saved ? parseFloat(saved) : 2.0;
  });
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(() => {
    return localStorage.getItem('sovereign_selected_program_id');
  });
  const [weakpointFocus, setWeakpointFocus] = useState<string | null>(() => {
    return localStorage.getItem('sovereign_weakpoint_focus');
  });
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isWeakpointModalOpen, setIsWeakpointModalOpen] = useState(false);
  const [isScheduleConfigModalOpen, setIsScheduleConfigModalOpen] = useState(false);
  const [dayMapping, setDayMapping] = useState<{[key: string]: string}>(() => {
    const saved = localStorage.getItem('sovereign_day_mapping');
    return saved ? JSON.parse(saved) : {
      'Day 1': 'Day 1',
      'Day 2': 'Day 2',
      'Day 3': 'Day 3',
      'Day 4': 'Day 4',
      'Day 5': 'Day 5',
      'Day 6': 'Day 6',
      'Day 7': 'Day 7',
      'Day 8': 'Day 8',
      'Day 9': 'Day 9',
      'Day 10': 'Day 10'
    };
  });
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null);
  const [isRepeatSchedule, setIsRepeatSchedule] = useState(true);
  const [customScheduleStartDate, setCustomScheduleStartDate] = useState<string>(() => {
    return localStorage.getItem('sovereign_custom_schedule_start_date') || format(new Date(), 'yyyy-MM-dd');
  });
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isProtocolDropdownOpen, setIsProtocolDropdownOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [nutritionStartDate, setNutritionStartDate] = useState<string>(() => {
    const saved = localStorage.getItem('sovereign_nutrition_start_date');
    return saved ? saved : format(new Date(), 'yyyy-MM-dd');
  });
  const [nutritionDurationWeeks, setNutritionDurationWeeks] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_nutrition_duration_weeks');
    return saved ? parseInt(saved) : 12;
  });
  const [calories, setCalories] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_calories');
    return saved ? parseInt(saved) : 2500;
  });
  const [isAutoCalories, setIsAutoCalories] = useState<boolean>(() => {
    const saved = localStorage.getItem('sovereign_auto_calories');
    return saved === null ? true : saved === 'true';
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [weightInput, setWeightInput] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<number>(() => {
    const saved = localStorage.getItem('sovereign_body_fat');
    return saved ? parseFloat(saved) : 15;
  });
  const [bodyFatInput, setBodyFatInput] = useState<string>('');
  const [cardioCompleted, setCardioCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem('sovereign_cardio_completed');
    return saved === 'true';
  });
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sovereign_weight_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Adaptive Caloric Engine
  useEffect(() => {
    if (isAutoCalories && weightHistory.length >= 7) {
      const sortedHistory = [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const recentWeights = sortedHistory.slice(0, 7);
      
      if (recentWeights.length === 7) {
        const avgRecent = recentWeights.reduce((acc, curr) => acc + curr.weight, 0) / 7;
        const olderWeights = sortedHistory.slice(7, 14);
        
        if (olderWeights.length === 7) {
          const avgOlder = olderWeights.reduce((acc, curr) => acc + curr.weight, 0) / 7;
          const weeklyChange = avgRecent - avgOlder;
          
          let adjustment = 0;
          if (nutritionGoal === 'CUT') {
            // Target: -0.5kg to -1kg per week
            if (weeklyChange > -0.3) adjustment = -100; // Not losing fast enough
            else if (weeklyChange < -1.2) adjustment = 100; // Losing too fast
          } else if (nutritionGoal === 'BULK') {
            // Target: +0.25kg to +0.5kg per week
            if (weeklyChange < 0.1) adjustment = 100; // Not gaining enough
            else if (weeklyChange > 0.6) adjustment = -100; // Gaining too much fat
          }
          
          if (adjustment !== 0) {
            setCalories(prev => prev + adjustment);
          }
        }
      }
    }
  }, [weightHistory, nutritionGoal, isAutoCalories]);

  // Keep schedule phase in sync with nutrition goal
  useEffect(() => {
    if (!hasInitialSyncCompleted) return;
    setSchedule(prev => {
      const newSchedule: WeeklySchedule = {};
      for (const week in prev) {
        newSchedule[week] = prev[week].map(day => ({ ...day, phase: nutritionGoal }));
      }
      return newSchedule;
    });
  }, [nutritionGoal, hasInitialSyncCompleted]);

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
        setWorkout(prev => (data.workout && JSON.stringify(prev) !== JSON.stringify(data.workout)) ? data.workout : prev);
        setSchedule(prev => {
          if (!data.schedule) return prev;
          let newSchedule = data.schedule;
          if (Array.isArray(newSchedule)) {
            newSchedule = { 1: newSchedule };
          }
          return JSON.stringify(prev) !== JSON.stringify(newSchedule) ? newSchedule : prev;
        });
        setArchive(prev => (data.archive && JSON.stringify(prev) !== JSON.stringify(data.archive)) ? data.archive : prev);
        setExp(prev => (data.exp !== undefined && prev !== data.exp) ? data.exp : prev);
        setProgramDuration(prev => (data.programDuration !== undefined && prev !== data.programDuration) ? data.programDuration : prev);
        setProgramStartDate(prev => (data.programStartDate !== undefined && prev !== data.programStartDate) ? data.programStartDate : prev);
        setIsDeloadEnabled(prev => (data.isDeloadEnabled !== undefined && prev !== data.isDeloadEnabled) ? data.isDeloadEnabled : prev);
        setLastChecked(prev => (data.lastChecked !== undefined && prev !== data.lastChecked) ? data.lastChecked : prev);
        setCurrentWeight(prev => (data.currentWeight !== undefined && prev !== data.currentWeight) ? data.currentWeight : prev);
        setTargetWeight(prev => (data.targetWeight !== undefined && prev !== data.targetWeight) ? data.targetWeight : prev);
        setNutritionGoal(prev => (data.nutritionGoal !== undefined && prev !== data.nutritionGoal) ? data.nutritionGoal : prev);
        setProteinPerKg(prev => (data.proteinPerKg !== undefined && prev !== data.proteinPerKg) ? data.proteinPerKg : prev);
        setNutritionStartDate(prev => (data.nutritionStartDate !== undefined && prev !== data.nutritionStartDate) ? data.nutritionStartDate : prev);
        setNutritionDurationWeeks(prev => (data.nutritionDurationWeeks !== undefined && prev !== data.nutritionDurationWeeks) ? data.nutritionDurationWeeks : prev);
        setCalories(prev => (data.calories !== undefined && prev !== data.calories) ? data.calories : prev);
        setIsAutoCalories(prev => (data.isAutoCalories !== undefined && prev !== data.isAutoCalories) ? data.isAutoCalories : prev);
        setWeightHistory(prev => (data.weightHistory && JSON.stringify(prev) !== JSON.stringify(data.weightHistory)) ? data.weightHistory : prev);
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
          currentWeight,
          targetWeight,
          nutritionGoal,
          proteinPerKg,
          nutritionStartDate,
          nutritionDurationWeeks,
          calories,
          isAutoCalories,
          weightHistory,
          level: 1,
          updatedAt: new Date().toISOString()
        };
        setDoc(userDocRef, initialData).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
      }
      setIsSyncing(false);
      setHasInitialSyncCompleted(true);
      setSyncError(null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setIsSyncing(false);
      setHasInitialSyncCompleted(true);
      setSyncError("Sync failed. Permissions or network error.");
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Firestore Sync - Save Data (Debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isAuthReady || !user || isSyncing || !hasInitialSyncCompleted) return;

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
          currentWeight,
          targetWeight,
          nutritionGoal,
          proteinPerKg,
          nutritionStartDate,
          nutritionDurationWeeks,
          calories,
          isAutoCalories,
          weightHistory,
          level: Math.floor(exp / 1000) + 1,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        localStorage.setItem('sovereign_workout', JSON.stringify(workout));
        localStorage.setItem('sovereign_schedule', JSON.stringify(schedule));
        localStorage.setItem('sovereign_archive', JSON.stringify(archive));
        localStorage.setItem('sovereign_exp', (exp ?? 0).toString());
        localStorage.setItem('sovereign_program_duration', (programDuration ?? 0).toString());
        localStorage.setItem('sovereign_program_start_date', programStartDate ?? '');
        localStorage.setItem('sovereign_deload_enabled', (isDeloadEnabled ?? false).toString());
        localStorage.setItem('sovereign_current_weight', (currentWeight ?? 0).toString());
        localStorage.setItem('sovereign_target_weight', (targetWeight ?? 0).toString());
        localStorage.setItem('sovereign_nutrition_goal', nutritionGoal ?? 'MAINTAIN');
        localStorage.setItem('sovereign_protein_per_kg', (proteinPerKg ?? 2.0).toString());
        localStorage.setItem('sovereign_nutrition_start_date', nutritionStartDate ?? '');
        localStorage.setItem('sovereign_nutrition_duration_weeks', (nutritionDurationWeeks ?? 12).toString());
        localStorage.setItem('sovereign_calories', (calories ?? 2500).toString());
        localStorage.setItem('sovereign_auto_calories', (isAutoCalories ?? true).toString());
        localStorage.setItem('sovereign_body_fat', (bodyFat ?? 15).toString());
        localStorage.setItem('sovereign_cardio_completed', (cardioCompleted ?? false).toString());
        localStorage.setItem('sovereign_weight_history', JSON.stringify(weightHistory ?? []));
        if (lastChecked) localStorage.setItem('sovereign_last_checked', lastChecked);
      } catch (err) {
        console.error("Failed to save to Firestore", err);
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [workout, schedule, archive, exp, lastChecked, user, isAuthReady, programDuration, programStartDate, isDeloadEnabled, currentWeight, targetWeight, nutritionGoal, proteinPerKg, nutritionStartDate, nutritionDurationWeeks, calories, isAutoCalories, weightHistory, hasInitialSyncCompleted]);

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
  const [selectedDay, setSelectedDay] = useState('Day 1');
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
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [expandedScheduleExercises, setExpandedScheduleExercises] = useState<string[]>([]);
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

  const handleGoalChange = (goal: 'CUT' | 'BULK' | 'MAINTAIN') => {
    setNutritionGoal(goal);
    setNutritionStartDate(format(new Date(), 'yyyy-MM-dd'));
    let newTarget = currentWeight;
    if (goal === 'BULK') {
      newTarget = currentWeight + 5;
    } else if (goal === 'CUT') {
      newTarget = currentWeight - 5;
    }
    setTargetWeight(newTarget);
    
    // Update schedule with the new phase
    setSchedule(prev => {
      const newSchedule: WeeklySchedule = {};
      for (const week in prev) {
        newSchedule[week] = prev[week].map(day => ({ ...day, phase: goal }));
      }
      return newSchedule;
    });
  };

  const logWeight = (weight: number) => {
    const newEntry: WeightEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(new Date(), 'yyyy-MM-dd'),
      weight
    };
    setWeightHistory(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setCurrentWeight(weight);
  };

  const deleteWeightEntry = (id: string) => {
    setWeightHistory(prev => prev.filter(e => e.id !== id));
  };

  const proteinRequirement = Math.round(currentWeight * proteinPerKg);

  const getNutritionPhaseStatus = () => {
    const start = new Date(nutritionStartDate);
    const durationDays = nutritionDurationWeeks * 7;
    const end = new Date(start.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const elapsedDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, durationDays - elapsedDays);
    const progress = Math.min(100, Math.max(0, (elapsedDays / durationDays) * 100));
    
    return {
      startDate: format(start, 'MMM dd, yyyy'),
      endDate: format(end, 'MMM dd, yyyy'),
      remainingWeeks: Math.floor(remainingDays / 7),
      remainingDays: remainingDays % 7,
      elapsedDays,
      progress,
      isCompleted: remainingDays === 0
    };
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
    localStorage.setItem('sovereign_exp', (exp ?? 0).toString());
  }, [exp]);

  useEffect(() => {
    localStorage.setItem('sovereign_current_weight', (currentWeight ?? 0).toString());
  }, [currentWeight]);

  useEffect(() => {
    localStorage.setItem('sovereign_target_weight', (targetWeight ?? 0).toString());
  }, [targetWeight]);

  useEffect(() => {
    localStorage.setItem('sovereign_nutrition_goal', nutritionGoal ?? 'MAINTAIN');
  }, [nutritionGoal]);

  useEffect(() => {
    localStorage.setItem('sovereign_protein_per_kg', (proteinPerKg ?? 2.0).toString());
  }, [proteinPerKg]);

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

  // Auto-update program schedule when week changes
  useEffect(() => {
    if (selectedProgramId && programStartDate) {
      const currentWeek = getProgramCurrentCycle();
      const program = PROGRAMS.find(p => p.id === selectedProgramId);
      if (program) {
        // Check if we need to update based on current week
        // We re-apply the program to ensure the schedule matches the current week's data
        applyProgram(selectedProgramId, weakpointFocus, programStartDate);
      }
    }
  }, [selectedProgramId, programStartDate, weakpointFocus]);

  const syncWorkoutWithSchedule = useCallback(() => {
    const currentDayName = getProgramCurrentDay();
    const currentWeekNum = getProgramCurrentCycle();
    
    const weekSchedule = schedule[currentWeekNum] || schedule[1] || [];
    const todaySchedule = weekSchedule.find(s => s.day === currentDayName);

    if (todaySchedule) {
      if (!selectedProgramId && !isRepeatSchedule) {
        try {
          const today = new Date();
          const start = parseISO(customScheduleStartDate);
          const diffDays = differenceInDays(today, start);
          if (diffDays >= 10) {
            setWorkout([]);
            return;
          }
        } catch (e) {
          // Fallback
        }
      }
      setWorkout(applyDeloadIfNecessary(todaySchedule.exercises.map(ex => ({ ...ex, completed: false }))));
    } else {
      setWorkout([]);
    }
  }, [schedule, applyDeloadIfNecessary, selectedProgramId, programStartDate, weakpointFocus, isRepeatSchedule, customScheduleStartDate]);

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
          
          // Calculate which week this date falls into
          let weekNum = 1;
          if (selectedProgramId && programStartDate) {
            try {
              const start = parseISO(programStartDate);
              const diffDays = differenceInDays(checkDate, start);
              if (diffDays >= 0) {
                weekNum = Math.floor(diffDays / 7) + 1;
              }
            } catch (e) {
              // fallback
            }
          }
          const weekSchedule = schedule[weekNum] || schedule[1] || [];
          const daySchedule = weekSchedule.find(s => s.day === dayName);
          const isRestDay = !daySchedule || daySchedule.exercises.length === 0;
          
          if (!hasEntry && !isRestDay) {
            const entryId = Math.random().toString(36).substr(2, 9);
            newEntries.push({
              id: entryId,
              date: dateStr,
              day: dayName,
              type: 'BREACH',
              details: `Protocol Breach: Missed ${dayName} Cycle (Auto-Logged)`,
              cardioCompleted: false
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
              cardioCompleted: true // Rest days assume cardio is optional or done
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
    if (Object.keys(schedule).length === 0) return;
    const currentDayName = getProgramCurrentDay();
    const currentWeekNum = getProgramCurrentCycle();
    const weekSchedule = schedule[currentWeekNum] || schedule[1] || [];
    const todaySchedule = weekSchedule.find(s => s.day === currentDayName);
    
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

    if (entryIds !== workoutIds || todayEntry.progress !== currentProgress || todayEntry.cardioCompleted !== cardioCompleted) {
      setArchive(prev => {
        const filtered = prev.filter(e => e.date !== todayStr);
        const updatedEntry: ArchiveEntry = {
          ...todayEntry,
          exercises: [...workout],
          progress: currentProgress,
          cardioCompleted: cardioCompleted,
          type: (currentProgress === 100 && cardioCompleted) ? 'COMPLETED' : 'BREACH',
          details: (currentProgress === 100 && cardioCompleted)
            ? `Protocol Secured: ${todayEntry.day} Cycle` 
            : `Protocol Breach: ${todayEntry.day} Cycle (${currentProgress}% Progress, Cardio: ${cardioCompleted ? 'OK' : 'MISSING'})`
        };
        return [updatedEntry, ...filtered];
      });
    }
  }, [workout, archive, cardioCompleted]);

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
  const workoutProgress = workout.length > 0 ? (workout.filter(ex => ex.completed).length / workout.length) * 100 : 100;
  const progress = Math.round((workoutProgress * 0.8) + (cardioCompleted ? 20 : 0));
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

  const toggleExpandedExercise = (id: string) => {
    setExpandedExercises(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleExpandedScheduleExercise = (id: string) => {
    setExpandedScheduleExercises(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
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

  const getExerciseVideoUrl = (exName: string) => {
    if (!selectedProgramId) return null;
    const program = PROGRAMS.find(p => p.id === selectedProgramId);
    if (!program) return null;
    for (const range in program.weeks) {
      for (const day in program.weeks[range].days) {
        const exercise = program.weeks[range].days[day].find(e => e.name === exName);
        if (exercise && exercise.videoUrl) return exercise.videoUrl;
      }
    }
    return null;
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

  const getProgramCurrentCycle = () => {
    if (!programStartDate) return 1;
    try {
      const start = parseISO(programStartDate);
      const now = new Date();
      const diffDays = differenceInDays(now, start);
      return Math.max(1, Math.floor(diffDays / 10) + 1);
    } catch (e) {
      return 1;
    }
  };

  const getProgramCurrentDay = () => {
    if (!programStartDate) return 'Day 1';
    try {
      const start = parseISO(programStartDate);
      const now = new Date();
      const diffDays = differenceInDays(now, start);
      const dayIndex = diffDays % 10;
      return DAYS[dayIndex];
    } catch (e) {
      return 'Day 1';
    }
  };

  const applyProgram = (programId: string, weakpoint: string | null, startDate: string = format(new Date(), 'yyyy-MM-dd')) => {
    const program = PROGRAMS.find(p => p.id === programId);
    if (!program) return;

    // Set basic program state
    setSelectedProgramId(programId);
    setWeakpointFocus(weakpoint);
    setProgramStartDate(startDate);
    
    localStorage.setItem('sovereign_selected_program_id', programId);
    localStorage.setItem('sovereign_program_start_date', startDate);
    if (weakpoint) localStorage.setItem('sovereign_weakpoint_focus', weakpoint);
    else localStorage.removeItem('sovereign_weakpoint_focus');

    const newWeeklySchedule: WeeklySchedule = {};
    
    // Generate all weeks for the program
    for (let w = 1; w <= program.totalWeeks; w++) {
      let weekData = null;
      for (const range in program.weeks) {
        const [start, end] = range.split('-').map(Number);
        if (end) {
          if (w >= start && w <= end) {
            weekData = program.weeks[range];
            break;
          }
        } else if (w === start) {
          weekData = program.weeks[range];
          break;
        }
      }
      
      if (!weekData) {
        const firstRange = Object.keys(program.weeks)[0];
        weekData = program.weeks[firstRange];
      }

      newWeeklySchedule[w] = DAYS.map(day => {
        const mappedDay = dayMapping[day] || day;
        const baseExercises = weekData.days[mappedDay] || [];
        const weakpointExercises = weakpoint && program.weakpointAdditions?.[weakpoint]?.[mappedDay] || [];
        
        let combinedExercises: WorkoutItem[] = [];
        if (weakpointExercises.length > 0) {
          let wpIndex = 0;
          for (const ex of baseExercises) {
            if (ex.name.startsWith('Weak Point Exercise')) {
              if (wpIndex < weakpointExercises.length) {
                combinedExercises.push({
                  ...weakpointExercises[wpIndex],
                  id: Math.random().toString(36).substr(2, 9),
                  completed: false
                });
                wpIndex++;
              }
            } else {
              combinedExercises.push({
                ...ex,
                id: Math.random().toString(36).substr(2, 9),
                completed: false
              });
            }
          }
          // Append any remaining weakpoint exercises
          while (wpIndex < weakpointExercises.length) {
            combinedExercises.push({
              ...weakpointExercises[wpIndex],
              id: Math.random().toString(36).substr(2, 9),
              completed: false
            });
            wpIndex++;
          }
        } else {
          combinedExercises = baseExercises.map(ex => ({
            ...ex,
            id: Math.random().toString(36).substr(2, 9),
            completed: false
          }));
        }

        return {
          day,
          exercises: combinedExercises
        };
      });
    }

    setSchedule(newWeeklySchedule);
    localStorage.setItem('sovereign_schedule', JSON.stringify(newWeeklySchedule));
    setCurrentWeekTab(getProgramCurrentCycle());
    syncWorkoutWithSchedule();
  };

  const applyCustomSchedule = () => {
    if (confirm('Are you sure you want to reset your schedule? This will remove the current program.')) {
      setSelectedProgramId(null);
      setWeakpointFocus(null);
      
      const newSchedule: WeeklySchedule = {};
      for (let i = 1; i <= programDuration; i++) {
        newSchedule[i] = JSON.parse(JSON.stringify(INITIAL_SCHEDULE));
      }
      
      setSchedule(newSchedule);
      localStorage.removeItem('sovereign_selected_program_id');
      localStorage.removeItem('sovereign_weakpoint_focus');
      localStorage.setItem('sovereign_schedule', JSON.stringify(newSchedule));
      setIsProtocolDropdownOpen(false);
    }
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

    setSchedule(prev => {
      const currentWeekSchedule = prev[currentWeekTab] || INITIAL_SCHEDULE;
      const updatedWeekSchedule = currentWeekSchedule.map(d => 
        d.day === selectedDay ? { ...d, exercises: [...d.exercises, exercise] } : d
      );
      return {
        ...prev,
        [currentWeekTab]: updatedWeekSchedule
      };
    });
    setNewExercise({ name: '', target: '', weight: '', reps: 0, sets: '' });
  };

  const removeExerciseFromSchedule = (day: string, id: string) => {
    setSchedule(prev => {
      const currentWeekSchedule = prev[currentWeekTab] || INITIAL_SCHEDULE;
      const updatedWeekSchedule = currentWeekSchedule.map(d => 
        d.day === day ? { ...d, exercises: d.exercises.filter(e => e.id !== id) } : d
      );
      return {
        ...prev,
        [currentWeekTab]: updatedWeekSchedule
      };
    });
  };

  const clearArchive = () => {
    setArchive([]);
    setWorkout([]);
    
    const newSchedule: WeeklySchedule = {};
    for (let i = 1; i <= programDuration; i++) {
      newSchedule[i] = JSON.parse(JSON.stringify(INITIAL_SCHEDULE));
    }
    
    setSchedule(newSchedule);
    setExp(0);
    setLastChecked(null);
    localStorage.clear();
    setShowPurgeModal(false);
  };

  // Update schedule when week changes
  useEffect(() => {
    if (selectedProgramId) {
      const currentWeek = getProgramCurrentCycle();
      const lastWeek = parseInt(localStorage.getItem('sovereign_last_week') || '0');
      
      if (currentWeek !== lastWeek) {
        applyProgram(selectedProgramId, weakpointFocus, programStartDate);
        localStorage.setItem('sovereign_last_week', currentWeek.toString());
      }
    }
  }, [selectedProgramId, programStartDate, weakpointFocus]);
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
      if (entry.type === 'BREACH' || entry.type === 'INCOMPLETE') return acc + (entry.progress || 0);
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
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">
      {/* Global HUD Overlays */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute inset-0  opacity-[0.03]"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-primary-container/10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-container/10 animate-pulse"></div>
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-primary-container/15 bg-background/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 py-4">
        <div className="text-sm md:text-2xl font-bold  text-primary-container glow-text-primary font-sans font-semibold ">
          THE SOVEREIGN PROTOCOL
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex space-x-8 font-sans font-semibold  text-sm ">
            {['Daily Quest', 'Workout Archive', 'Schedule', 'User Stats', 'Nutrition'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-all hover:text-primary-container ${activeTab === tab ? 'text-primary-container font-bold' : 'text-on-surface-variant'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 border-l border-white/5 pl-4">
            {authError && (
              <div className="hidden md:flex items-center gap-2 bg-error/10 border border-error/30 px-3 py-1.5 mr-2">
                <AlertTriangle className="w-3 h-3 text-error" />
                <span className="text-xs font-bold text-error  ">{authError}</span>
                <button onClick={() => setAuthError(null)} className="text-error hover:text-white ml-2">×</button>
              </div>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-primary-container   leading-none mb-1">Operator</div>
                  <div className="text-sm font-sans font-semibold text-on-surface  ">{user.displayName || 'OPERATOR_01'}</div>
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
                <span className="font-sans font-semibold text-sm font-bold text-primary-container  ">Login</span>
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
              <div className="text-primary-container font-bold font-sans font-semibold text-sm  ">RANK: {currentRank.name}</div>
              <div className="text-on-surface-variant font-sans font-semibold text-xs ">{currentRank.title} ACTIVE</div>
            </div>
            
            <div className="space-y-2 flex-grow">
              {[
                { name: 'Daily Quest', icon: Bolt },
                { name: 'Workout Archive', icon: History },
                { name: 'Schedule', icon: CalendarIcon },
                { name: 'User Stats', icon: BarChart3 },
                { name: 'Nutrition', icon: Utensils },
                { name: 'Video Library', icon: Youtube },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center space-x-3 p-3 font-sans font-semibold text-sm font-bold   transition-all hover:translate-x-1 ${
                    activeTab === item.name
                      ? 'text-primary-container bg-[#1c1c1e] border-l-4 border-primary-container' 
                      : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-[#2c2c2e]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={startWorkout}
              className="mt-8 bg-primary-container text-on-primary-container py-4 font-sans font-semibold text-sm font-bold   hover:brightness-125 transition-all active:scale-95"
            >
              INITIALIZE WORKOUT
            </button>

            <div className="mt-auto px-4 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isSyncing ? (
                    <RefreshCw className="w-3 h-3 text-primary-container animate-spin" />
                  ) : user ? (
                    <Cloud className="w-3 h-3 text-primary-container" />
                  ) : (
                    <CloudOff className="w-3 h-3 text-on-surface-variant/30" />
                  )}
                  <span className="font-label text-[7px] text-on-surface-variant  ">
                    {isSyncing ? 'Syncing...' : user ? 'Cloud Active' : 'Offline Mode'}
                  </span>
                </div>
                {syncError && (
                  <div className="flex items-center gap-1 text-error">
                    <AlertTriangle className="w-2 h-2" />
                    <span className="text-[6px] ">{syncError}</span>
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
            <div className="space-y-6">
              {isRestDay ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-emerald-500/20 bg-[#1c1c1e]/20 rounded-3xl">
                  <Shield className="w-16 h-16 text-emerald-500/20 mb-4" />
                  <h3 className="font-sans font-semibold text-lg font-bold text-emerald-400">Rest Day Active</h3>
                  <p className="text-sm text-on-surface-variant/60 mt-2">No objectives assigned for this cycle.</p>
                  <button 
                    onClick={() => setActiveTab('Schedule')}
                    className="mt-6 text-emerald-400 font-sans font-semibold text-sm font-bold hover:underline"
                  >
                    Modify Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Cardio Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans font-semibold text-base md:text-lg font-bold text-primary-container flex items-center gap-2 md:gap-3">
                        <Activity className="w-4 h-4 md:w-5 md:h-5" />
                        Cardio Protocol
                      </h3>
                    </div>

                      <div 
                        className={`group flex flex-col transition-all rounded-2xl mb-4 ${
                          cardioCompleted 
                            ? 'bg-primary-container/10 border border-primary-container shadow-[0_0_15px_rgba(0,229,255,0.1)]' 
                            : 'bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-white/5'
                        }`}
                      >
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedExercises(prev => prev.includes('cardio') ? prev.filter(e => e !== 'cardio') : [...prev, 'cardio'])}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 md:p-3 rounded-full transition-colors ${cardioCompleted ? 'bg-primary-container text-on-primary-container' : 'bg-[#2c2c2e]est text-on-surface-variant'}`}>
                              <Activity className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className={`font-sans font-semibold font-bold text-sm md:text-base ${cardioCompleted ? 'text-primary-container line-through' : 'text-on-surface'}`}>
                                Treadmill Protocol
                              </div>
                              <div className="font-label text-xs text-on-surface-variant tracking-[0.1em]">
                                30-45 Min LISS / HIIT
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setCardioCompleted(!cardioCompleted); }}
                              className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all ${
                                cardioCompleted 
                                  ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                                  : 'border border-primary-container/30 bg-primary-container/5 hover:bg-primary-container/20'
                              }`}
                            >
                              {cardioCompleted ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <Check className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />}
                            </button>
                            <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${expandedExercises.includes('cardio') ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedExercises.includes('cardio') && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t border-white/5 mt-2">
                                <div className="mb-3 p-2 bg-primary-container/10 border-l-2 border-primary-container text-xs text-on-surface leading-relaxed">
                                  <span className="text-primary-container font-bold mr-1">NOTES:</span> Keep heart rate in Zone 2 for LISS, or alternate 1 min sprint / 1 min walk for HIIT.
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                  </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="font-sans font-semibold text-base md:text-lg font-bold   text-primary-container flex items-center gap-2 md:gap-3">
                              <Bolt className="w-4 h-4 md:w-5 md:h-5" />
                              Today's Workout
                            </h3>
                            {selectedProgramId && PROGRAMS.find(p => p.id === selectedProgramId)?.dayLabels?.[getProgramCurrentDay()] && (
                              <div className="mt-1 font-label text-sm text-primary-container/80 font-bold  ">
                                {PROGRAMS.find(p => p.id === selectedProgramId)?.dayLabels?.[getProgramCurrentDay()]}
                              </div>
                            )}
                            <div className="mt-3 text-xs text-on-surface-variant bg-[#1c1c1e] p-3 rounded-xl border border-white/5 max-w-md">
                              <span className="font-bold text-primary-container">RPE (Rate of Perceived Exertion):</span> 10 = Absolute failure (0 reps left), 9 = 1 rep left in tank, 8 = 2 reps left.
                            </div>
                          </div>
                          <div className="font-label text-xs md:text-sm text-on-surface-variant bg-[#2c2c2e] px-3 py-1.5 rounded-lg">
                            Phase: Hypertrophy
                          </div>
                        </div>

                        {workout.length > 0 && (
                          <div className="w-full bg-[#2c2c2e] h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-container transition-all duration-500 ease-out"
                              style={{ width: `${(workout.filter(item => item.completed).length / workout.length) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        <AnimatePresence mode="popLayout">
                          {workout.map((item) => (
                            <motion.div 
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`group flex flex-col transition-all rounded-2xl mb-3 ${
                                item.completed 
                                  ? 'bg-[#1c1c1e]/50 opacity-60 border border-primary-container/30' 
                                  : 'bg-[#1c1c1e] border border-white/5 hover:border-primary-container/30'
                              }`}
                            >
                              {/* Header / Summary (Always visible) */}
                              <div 
                                className="p-3 md:p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpandedExercise(item.id)}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className={`font-sans font-semibold font-bold text-sm md:text-base flex items-center gap-2 ${item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                                    {item.name}
                                    {!item.completed && getOverloadSuggestion(item.name) && (
                                      <TrendingUp className="w-3 h-3 text-primary-container animate-pulse" />
                                    )}
                                  </div>
                                  <div className="font-label text-xs text-on-surface-variant tracking-[0.1em]">
                                    {item.target} | {item.sets} Sets
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }}
                                    className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all ${
                                      item.completed 
                                        ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,229,255,0.4)]' 
                                        : 'border border-primary-container/30 bg-primary-container/5 hover:bg-primary-container/20'
                                    }`}
                                  >
                                    {item.completed ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <Check className="w-4 h-4 md:w-5 md:h-5 text-primary-container" />}
                                  </button>
                                  <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${expandedExercises.includes(item.id) ? 'rotate-180' : ''}`} />
                                </div>
                              </div>

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {expandedExercises.includes(item.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-3 md:p-4 pt-0 border-t border-white/5 mt-2">
                                      {/* Action row: Video */}
                                      {(item.videoUrl || getExerciseVideoUrl(item.name)) && (
                                        <button 
                                          onClick={() => setActiveVideoUrl((item.videoUrl || getExerciseVideoUrl(item.name))!)}
                                          className="text-primary-container text-xs flex items-center gap-1 mb-3 hover:underline"
                                        >
                                          <Youtube className="w-3 h-3" /> Watch Tutorial
                                        </button>
                                      )}

                                      {/* Overload Suggestion */}
                                      {!item.completed && getOverloadSuggestion(item.name) && (
                                        <div className="bg-primary-container/10 border border-primary-container/20 p-3 rounded-xl mb-3">
                                          <div className="text-xs text-primary-container font-bold mb-1 flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> Progressive Overload Intel
                                          </div>
                                          <div className="text-xs text-on-surface">
                                            Target: <span className="text-primary-container font-bold">{getOverloadSuggestion(item.name)?.suggestion}</span>
                                            <span className="text-on-surface-variant ml-2">(Prev: {getOverloadSuggestion(item.name)?.original})</span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Notes */}
                                      {item.notes && !item.completed && (
                                        <div className="mb-3 p-3 bg-primary-container/10 border border-primary-container/20 rounded-xl text-xs text-on-surface leading-relaxed">
                                          <span className="text-primary-container font-bold mr-1">NOTES:</span> {item.notes}
                                        </div>
                                      )}

                                      {/* Sets Inputs */}
                                      <div className="flex flex-col gap-2 mb-3">
                                        {(item.setData || Array.from({ length: parseInt(item.sets) || 1 }, () => ({ weight: item.weight, reps: item.reps }))).map((set, idx) => (
                                          <div key={idx} className="flex items-center gap-3 bg-[#2c2c2e]/50 p-3 rounded-xl">
                                            <span className="font-mono text-xs text-on-surface-variant w-6">#{idx + 1}</span>
                                            <div className="flex flex-col flex-1">
                                              {idx === 0 && <span className="font-label text-[10px] text-on-surface-variant mb-1">Weight</span>}
                                              <input 
                                                type="text"
                                                value={set.weight}
                                                onChange={(e) => updateWorkoutSet(item.id, idx, 'weight', e.target.value)}
                                                className="w-full bg-transparent border-b border-primary-container/20 font-mono text-primary-container text-sm focus:outline-none focus:border-primary-container transition-colors"
                                              />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                              {idx === 0 && <span className="font-label text-[10px] text-on-surface-variant mb-1">Reps</span>}
                                              <input 
                                                type="number"
                                                value={set.reps}
                                                onChange={(e) => updateWorkoutSet(item.id, idx, 'reps', parseInt(e.target.value) || 0)}
                                                className="w-full bg-transparent border-b border-primary-container/20 font-mono text-primary-container text-sm focus:outline-none focus:border-primary-container transition-colors"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Sets count update */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="font-label text-xs text-on-surface-variant">Total Sets:</span>
                                        <input 
                                          type="text"
                                          value={item.sets}
                                          onChange={(e) => updateWorkoutItem(item.id, 'sets', e.target.value)}
                                          className="w-12 bg-[#2c2c2e]/30 border-b border-primary-container/20 font-mono text-on-surface-variant text-xs text-center focus:outline-none focus:border-primary-container transition-colors"
                                        />
                                      </div>

                                      {/* Substitutions */}
                                      {item.substitutions && item.substitutions.length > 0 && !item.completed && (
                                        <div className="flex flex-wrap gap-2">
                                          <div className="text-[10px] text-on-surface-variant w-full mb-1">Substitutions:</div>
                                          {item.substitutions.map((sub, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => {
                                                const updatedWorkout = workout.map(ex => 
                                                  ex.id === item.id ? { ...ex, name: sub, substitutions: [item.name, ...item.substitutions.filter(s => s !== sub)] } : ex
                                                );
                                                setWorkout(updatedWorkout);
                                              }}
                                              className="text-[10px] bg-[#2c2c2e]/50 hover:bg-primary-container/20 text-on-surface-variant hover:text-primary-container px-3 py-1.5 rounded-lg border border-white/10 transition-all"
                                            >
                                              Swap: {sub}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Schedule' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-sm tracking-[0.4em] ">Protocol Planning</span>
                  <h1 className="font-sans font-semibold text-3xl md:text-5xl font-bold text-on-surface   mt-2">Training Schedule</h1>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2 bg-[#2c2c2e] p-1 border border-white/5 overflow-x-auto max-w-full custom-scrollbar no-scrollbar">
                    {Array.from({ length: selectedProgramId ? (PROGRAMS.find(p => p.id === selectedProgramId)?.totalWeeks || 1) : programDuration }, (_, i) => i + 1).map(w => (
                      <button
                        key={w}
                        onClick={() => setCurrentWeekTab(w)}
                        className={`px-4 py-2 font-sans font-semibold text-sm font-bold   transition-all whitespace-nowrap ${
                          currentWeekTab === w 
                            ? 'bg-primary-container text-on-primary-container' 
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Week {w}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 relative">
                    {selectedProgramId && (
                      <button 
                        onClick={() => setIsRoadmapOpen(true)}
                        className="bg-[#2c2c2e] rounded-2xlest text-on-surface border border-white/5 px-6 py-3 font-sans font-semibold text-sm font-bold   hover:bg-primary-container/10 transition-all flex items-center gap-2"
                      >
                        <LayoutList className="w-4 h-4" />
                        View Roadmap
                      </button>
                    )}
                    <div className="relative">
                      <button 
                        onClick={() => setIsProtocolDropdownOpen(!isProtocolDropdownOpen)}
                        className="bg-primary-container/10 text-primary-container border border-primary-container/30 px-6 py-3 font-sans font-semibold text-sm font-bold   hover:bg-primary-container/20 transition-all flex items-center gap-2"
                      >
                        <Rocket className="w-4 h-4" />
                        {selectedProgramId ? PROGRAMS.find(p => p.id === selectedProgramId)?.name : 'Custom Protocol'}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isProtocolDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isProtocolDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full right-0 mt-2 w-64 bg-[#2c2c2e] border border-outline-variant shadow-2xl z-50 overflow-hidden"
                          >
                            <button 
                              onClick={applyCustomSchedule}
                              className="w-full text-left px-4 py-3 font-sans font-semibold text-sm font-bold   hover:bg-primary-container/10 transition-all border-b border-outline-variant/50"
                            >
                              Custom Schedule
                            </button>
                            {PROGRAMS.map(program => (
                              <button 
                                key={program.id}
                                onClick={() => {
                                  setIsProgramModalOpen(true);
                                  setIsProtocolDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 font-sans font-semibold text-sm font-bold   hover:bg-primary-container/10 transition-all border-b border-outline-variant/50 flex justify-between items-center"
                              >
                                {program.name}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {selectedProgramId && (
                <div className="bg-primary-container/5 border border-primary-container/20 p-6 relative overflow-hidden group flame-purple">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Rocket className="w-16 h-16 text-primary-container" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="font-label text-xs text-primary-container  tracking-[0.3em] mb-1">Active Program</div>
                      <h3 className="font-sans font-semibold text-2xl font-bold text-on-surface  ">
                        {PROGRAMS.find(p => p.id === selectedProgramId)?.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant   mt-1 opacity-70">
                        Author: {PROGRAMS.find(p => p.id === selectedProgramId)?.author}
                        {weakpointFocus && <span className="ml-4 text-primary-container">Weakpoint: {weakpointFocus}</span>}
                        <span className="ml-4 text-primary-container">Cycle: {getProgramCurrentCycle()} / {PROGRAMS.find(p => p.id === selectedProgramId)?.totalWeeks}</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsRoadmapOpen(true)}
                        className="bg-primary-container text-on-primary-container border border-primary-container/30 px-4 py-2 font-sans font-semibold text-xs font-bold   hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                      >
                        View Roadmap
                      </button>
                      {PROGRAMS.find(p => p.id === selectedProgramId)?.weakpointOptions && (
                        <button 
                          onClick={() => setIsWeakpointModalOpen(true)}
                          className="bg-[#2c2c2e] rounded-2xlest text-on-surface border border-white/5 px-4 py-2 font-sans font-semibold text-xs font-bold   hover:bg-primary-container/10 transition-all"
                        >
                          Adjust Weakpoint
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Deload Configuration */}
              <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/5">
                <h3 className="font-sans font-semibold text-lg font-bold   text-primary-container mb-6 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  Deload Cycle Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-sm text-on-surface-variant  ">Program Duration (Weeks)</label>
                    <select 
                      value={programDuration}
                      onChange={(e) => setProgramDuration(parseInt(e.target.value))}
                      className="w-full bg-[#2c2c2e]est border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                    >
                      {[4, 5, 6, 7, 8].map(w => <option key={w} value={w}>{w} Weeks</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-sm text-on-surface-variant  ">Program Start Date</label>
                    <input 
                      type="date"
                      value={programStartDate}
                      onChange={(e) => setProgramStartDate(e.target.value)}
                      className="w-full bg-[#2c2c2e]est border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => setIsDeloadEnabled(!isDeloadEnabled)}
                      className={`w-full py-3 font-sans font-semibold text-sm font-bold   transition-all ${
                        isDeloadEnabled 
                          ? 'bg-primary-container text-on-primary-container' 
                          : 'bg-[#2c2c2e]est text-on-surface-variant'
                      }`}
                    >
                      {isDeloadEnabled ? 'Deload Protocol: Active' : 'Deload Protocol: Disabled'}
                    </button>
                  </div>
                </div>
                {isDeloadEnabled && (
                  <div className="mt-4 p-3 bg-primary-container/5 border border-primary-container/20">
                    <div className="flex justify-between items-center">
                      <div className="font-label text-xs text-primary-container  ">Current Status</div>
                      <div className="font-mono text-sm text-on-surface">
                        Week {getDeloadStatus().currentWeek} of Program | {getDeloadStatus().isDeloadWeek ? 'DELOAD ACTIVE' : `Week ${getDeloadStatus().weekInCycle} of ${programDuration}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Days Selector */}
                <div className="lg:col-span-1 space-y-4">
                  {!selectedProgramId && (
                    <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-label text-xs text-on-surface-variant  ">Schedule Mode</span>
                          <div className={`w-2 h-2 rounded-full ${isRepeatSchedule ? 'bg-primary-container' : 'bg-on-surface-variant/30'}`} />
                        </div>
                        <button 
                          onClick={() => setIsRepeatSchedule(!isRepeatSchedule)}
                          className={`w-full py-2 font-sans font-semibold text-xs font-bold   border transition-all ${
                            isRepeatSchedule 
                              ? 'bg-primary-container/10 border-primary-container/30 text-primary-container' 
                              : 'bg-[#2c2c2e]est border-white/5 text-on-surface-variant'
                          }`}
                        >
                          {isRepeatSchedule ? 'Repeat Weekly: ON' : 'Repeat Weekly: OFF'}
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="font-label text-xs text-on-surface-variant  ">Schedule Start Date</label>
                        <input 
                          type="date"
                          value={customScheduleStartDate}
                          onChange={(e) => {
                            setCustomScheduleStartDate(e.target.value);
                            localStorage.setItem('sovereign_custom_schedule_start_date', e.target.value);
                          }}
                          className="w-full bg-[#2c2c2e]est border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-2  "
                        />
                      </div>

                      <p className="text-[7px] text-on-surface-variant   mt-2 opacity-60 leading-tight">
                        {isRepeatSchedule 
                          ? 'Protocol will loop this 7-day cycle indefinitely.' 
                          : 'Protocol will execute this cycle once starting from the date above and then standby.'}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full p-4 font-sans font-semibold text-sm font-bold   text-left transition-all ${
                        selectedDay === day 
                          ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                          : 'bg-[#1c1c1e] text-on-surface-variant hover:bg-[#2c2c2e]'
                      }`}
                    >
                      {day}
                      <div className="text-xs opacity-60 mt-1">
                        {schedule[currentWeekTab]?.find(d => d.day === day)?.exercises.length || 0} Exercises
                      </div>
                    </button>
                  ))}
                  </div>
                </div>

                {/* Exercises for Selected Day */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/5">
                    <h3 className="font-sans font-semibold text-lg font-bold   text-primary-container mb-6 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-5 h-5" />
                          {selectedDay} Routine
                          {selectedProgramId && (
                            <span className="text-sm text-on-surface-variant font-normal tracking-normal ml-2">
                              (Week {currentWeekTab})
                            </span>
                          )}
                        </div>
                        {selectedProgramId && PROGRAMS.find(p => p.id === selectedProgramId)?.dayLabels?.[selectedDay] && (
                          <div className="mt-1 font-label text-sm text-primary-container/80 font-bold">
                            {PROGRAMS.find(p => p.id === selectedProgramId)?.dayLabels?.[selectedDay]}
                          </div>
                        )}
                      </div>
                      {schedule[currentWeekTab]?.find(d => d.day === selectedDay)?.phase && (
                        <div className={`text-sm px-3 py-1 border ${
                          schedule[currentWeekTab]?.find(d => d.day === selectedDay)?.phase === 'BULK' 
                            ? 'bg-primary-container/10 border-primary-container/30 text-primary-container' 
                            : schedule[currentWeekTab]?.find(d => d.day === selectedDay)?.phase === 'CUT'
                            ? 'bg-error/10 border-error/30 text-error'
                            : 'bg-[#2c2c2e] border-white/5 text-on-surface-variant'
                        }`}>
                          PHASE: {schedule[currentWeekTab]?.find(d => d.day === selectedDay)?.phase}
                        </div>
                      )}
                    </h3>

                    <div className="space-y-4 mb-8">
                      {schedule[currentWeekTab]?.find(d => d.day === selectedDay)?.exercises.length === 0 ? (
                        <div className="text-on-surface-variant/30 font-sans font-semibold text-sm   text-center py-12 border border-dashed border-white/5">
                          No exercises assigned to this cycle
                        </div>
                      ) : (
                        schedule[currentWeekTab]?.find(d => d.day === selectedDay)?.exercises.map(ex => (
                          <div key={ex.id} className="bg-[#2c2c2e] rounded-2xl flex flex-col group overflow-hidden">
                            <div 
                              className="p-4 flex justify-between items-center cursor-pointer"
                              onClick={() => toggleExpandedScheduleExercise(ex.id)}
                            >
                              <div className="flex-grow">
                                <div className="flex items-center gap-3">
                                  <div className="font-sans font-semibold font-bold text-sm">{ex.name}</div>
                                </div>
                                <div className="font-label text-xs text-on-surface-variant">{ex.target} | {ex.sets} sets</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeExerciseFromSchedule(selectedDay, ex.id); }}
                                  className="text-error/50 hover:text-error transition-colors p-2"
                                >
                                  <Terminal className="w-4 h-4" />
                                </button>
                                <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${expandedScheduleExercises.includes(ex.id) ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedScheduleExercises.includes(ex.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                >
                                  <div className="p-4 pt-0 border-t border-white/5 mt-2">
                                    {(ex.videoUrl || getExerciseVideoUrl(ex.name)) && (
                                      <button 
                                        onClick={() => setActiveVideoUrl((ex.videoUrl || getExerciseVideoUrl(ex.name))!)}
                                        className="text-primary-container text-xs flex items-center gap-1 mb-3 hover:underline"
                                      >
                                        <Youtube className="w-3 h-3" /> Watch Tutorial
                                      </button>
                                    )}
                                    
                                    {ex.notes && (
                                      <div className="mb-3 p-2 bg-primary-container/5 border-l-2 border-primary-container/30 text-xs text-on-surface-variant leading-relaxed">
                                        <span className="text-primary-container font-bold mr-1">Notes:</span> {ex.notes}
                                      </div>
                                    )}

                                    {ex.setData && (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {ex.setData.map((s, idx) => (
                                          <div key={idx} className="bg-[#1c1c1e] rounded-2xlest/30 p-1 px-2 text-[10px] text-on-surface-variant flex justify-between">
                                            <span>S{idx + 1}</span>
                                            <span className="text-primary-container">{s.weight} x {s.reps}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {!ex.setData && (
                                      <div className="font-label text-xs text-on-surface-variant opacity-60">{ex.weight} | {ex.reps} reps</div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Exercise Form */}
                    <div className="border-t border-white/5 pt-6">
                      <h4 className="font-sans font-semibold text-sm font-bold   text-on-surface-variant mb-4">Add New Exercise</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          placeholder="EXERCISE NAME"
                          value={newExercise.name}
                          onChange={e => setNewExercise({...newExercise, name: e.target.value.toUpperCase()})}
                          className="bg-[#2c2c2e] rounded-2xlest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                        />
                        <input 
                          placeholder="TARGET MUSCLE"
                          value={newExercise.target}
                          onChange={e => setNewExercise({...newExercise, target: e.target.value.toUpperCase()})}
                          className="bg-[#2c2c2e] rounded-2xlest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            placeholder="WEIGHT"
                            value={newExercise.weight}
                            onChange={e => setNewExercise({...newExercise, weight: e.target.value})}
                            className="bg-[#2c2c2e] rounded-2xlest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                          />
                          <input 
                            placeholder="REPS"
                            type="number"
                            value={newExercise.reps || ''}
                            onChange={e => setNewExercise({...newExercise, reps: parseInt(e.target.value) || 0})}
                            className="bg-[#2c2c2e] rounded-2xlest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                          />
                          <input 
                            placeholder="SETS"
                            value={newExercise.sets}
                            onChange={e => setNewExercise({...newExercise, sets: e.target.value})}
                            className="bg-[#2c2c2e] rounded-2xlest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary-container text-on-surface font-sans font-semibold text-sm p-3  "
                          />
                        </div>
                        <button 
                          onClick={addExerciseToSchedule}
                          className="bg-primary-container text-on-primary-container font-sans font-semibold text-sm font-bold   py-3 hover:brightness-110 transition-all"
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-sm tracking-[0.4em] ">Historical Data</span>
                  <h1 className="font-sans font-semibold text-3xl md:text-5xl font-bold text-on-surface   mt-2">Protocol Archive</h1>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  {archive.length > 0 && (
                    <button 
                      onClick={() => setShowPurgeModal(true)}
                      className="w-full md:w-auto font-sans font-semibold text-sm font-bold   text-error hover:text-error/80 transition-colors border border-error/20 px-4 py-2 bg-error/5 hover:bg-error/10"
                    >
                      Purge Archive Data
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-[#1c1c1e] p-4 md:p-6 border border-white/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-4">
                    <h3 className="font-sans font-semibold text-sm md:text-lg font-bold   text-primary-container flex items-center gap-2 md:gap-3">
                      <History className="w-4 h-4 md:w-5 md:h-5" />
                      Daily Quest History
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full md:w-auto justify-between">
                      <div className="font-label text-xs md:text-sm text-on-surface-variant  ">
                        {format(currentMonth, 'MMMM yyyy')}
                      </div>
                      <div className="flex gap-1 md:gap-2">
                        <button 
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="p-1.5 md:p-2 bg-[#2c2c2e] hover:bg-[#2c2c2e]est text-on-surface-variant border border-white/5"
                        >
                          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="p-1.5 md:p-2 bg-[#2c2c2e] hover:bg-[#2c2c2e]est text-on-surface-variant border border-white/5"
                        >
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-outline-variant/10 border border-white/5">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                      <div key={idx} className="bg-[#1c1c1e] rounded-2xl p-1 md:p-2 text-center font-label text-xs text-on-surface-variant   border-b border-white/5">
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
                              isCurrentMonth ? 'bg-[#1c1c1e]' : 'bg-[#1c1c1e]/30 opacity-30'
                            } ${isSelected ? 'ring-2 ring-primary-container ring-inset z-10' : ''} ${
                              isDeloadWeek ? 'bg-emerald-500/5' : ''
                            } border-r border-b border-white/5 overflow-hidden`}
                          >
                            {/* Program/Deload Line */}
                            {isActiveProgram && isCurrentMonth && (
                              <div className={`absolute bottom-0 left-0 right-0 h-1 md:h-1.5 ${isDeloadWeek ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-primary-container shadow-[0_0_8px_rgba(0,229,255,0.4)]'}`} />
                            )}

                            <div className="flex justify-between items-start">
                              <span className={`font-mono text-xs md:text-sm ${isSameDay(day, new Date()) ? 'text-primary-container font-bold' : 'text-on-surface-variant'}`}>
                                {format(day, 'd')}
                              </span>
                              {isDeloadEnabled && isCurrentMonth && (
                                <span className={`text-[6px]   ${isDeloadWeek ? 'text-emerald-500 font-bold' : 'text-on-surface-variant/40'}`}>
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
                  <div className="bg-[#1c1c1e] rounded-2xl p-4 md:p-6 border border-white/5 h-full">
                    <h4 className="font-sans font-semibold text-sm font-bold  tracking-[0.3em] text-on-surface-variant mb-6">
                      {selectedArchiveDate ? format(selectedArchiveDate, 'EEEE, MMMM do') : 'Select a date to view intel'}
                    </h4>

                    {!selectedArchiveDate ? (
                      <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant/20">
                        <Terminal className="w-12 h-12 mb-4" />
                        <div className="font-sans font-semibold text-xs  ">Awaiting Selection</div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {archive.filter(e => e.date === format(selectedArchiveDate, 'yyyy-MM-dd')).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 space-y-4">
                            <div className="text-on-surface-variant/30 font-sans font-semibold text-sm   text-center">
                              No protocol data for this cycle
                            </div>
                            <button 
                              onClick={() => createManualArchiveEntry(selectedArchiveDate)}
                              className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 px-4 py-2 text-xs font-bold text-primary-container   hover:bg-primary-container/20 transition-all"
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
                                    <span className={`font-sans font-semibold text-sm font-bold   ${entry.type === 'BREACH' ? 'text-error' : ''}`}>{entry.details}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleEditArchive(entry)}
                                    className="p-1.5 bg-[#2c2c2e] hover:bg-[#2c2c2e]est text-on-surface-variant border border-white/5 transition-all"
                                  >
                                    <Settings className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="font-label text-xs text-on-surface-variant   flex items-center gap-3">
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
                                  <div className="font-label text-xs text-on-surface-variant   border-b border-white/5 pb-1">Exercise Intel</div>
                                  {entry.exercises.map(ex => (
                                    <div key={ex.id} className="bg-[#2c2c2e] rounded-2xl p-3 space-y-2 border border-white/5">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="font-sans font-semibold font-bold   text-sm">{ex.name}</div>
                                          <div className="font-label text-xs text-on-surface-variant ">{ex.target}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-label text-xs text-on-surface-variant ">{ex.sets} Sets</div>
                                        </div>
                                      </div>
                                      {ex.setData ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-outline-variant/5">
                                          {ex.setData.map((s, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-[#2c2c2e]est/20 border border-white/5 rounded">
                                              <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                                                  <span className="font-sans font-semibold text-xs font-bold text-primary-container">{idx + 1}</span>
                                                </div>
                                                <span className="font-label text-xs text-on-surface-variant  ">Set</span>
                                              </div>
                                              <div className="flex gap-3">
                                                <div className="text-right">
                                                  <div className="text-[6px] text-on-surface-variant/50  leading-none mb-0.5">Weight</div>
                                                  <div className="font-mono text-sm text-on-surface leading-none">{s.weight}</div>
                                                </div>
                                                <div className="text-right">
                                                  <div className="text-[6px] text-on-surface-variant/50  leading-none mb-0.5">Reps</div>
                                                  <div className="font-mono text-sm text-on-surface leading-none">{s.reps}</div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-center p-2 bg-[#2c2c2e]est/20 border border-white/5 rounded pt-2 mt-2">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                                              <span className="font-sans font-semibold text-xs font-bold text-primary-container">1</span>
                                            </div>
                                            <span className="font-label text-xs text-on-surface-variant  ">Standard Protocol</span>
                                          </div>
                                          <div className="flex gap-3">
                                            <div className="text-right">
                                              <div className="text-[6px] text-on-surface-variant/50  leading-none mb-0.5">Weight</div>
                                              <div className="font-mono text-sm text-on-surface leading-none">{ex.weight}</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-[6px] text-on-surface-variant/50  leading-none mb-0.5">Reps</div>
                                              <div className="font-mono text-sm text-on-surface leading-none">{ex.reps}</div>
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
                              className="w-full py-3 border border-dashed border-white/5 text-xs   text-on-surface-variant hover:bg-[#2c2c2e]est/20 transition-all flex items-center justify-center gap-2"
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
          {activeTab === 'Nutrition' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-sm tracking-[0.4em] ">Metabolic Optimization</span>
                  <h1 className="font-sans font-semibold text-3xl md:text-5xl font-bold text-on-surface   mt-2">Nutrition Protocol</h1>
                </div>
                <div className="flex items-center gap-6 bg-[#1c1c1e] p-4 border border-white/5">
                  <div className="text-right">
                    <div className="font-label text-xs text-on-surface-variant   mb-1">Current Weight</div>
                    <div className="font-sans font-semibold text-2xl font-bold text-primary-container   leading-none">
                      {currentWeight} <span className="text-xs">KG</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/20"></div>
                  <div className="text-right">
                    <div className="font-label text-xs text-on-surface-variant   mb-1">Body Fat</div>
                    <div className="font-sans font-semibold text-2xl font-bold text-primary-container   leading-none">
                      {bodyFat} <span className="text-xs">%</span>
                    </div>
                  </div>
                  <Scale className="w-8 h-8 text-primary-container/20" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Active Protocol & Logging */}
                <div className="space-y-8">
                  {/* Quick Weight Log */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Scale className="w-16 h-16" />
                    </div>
                    <h3 className="font-sans font-semibold text-xs font-bold   mb-6 flex items-center gap-2 text-primary-container">
                      <Plus className="w-3 h-3" />
                      Log New Weight
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="font-label text-xs text-on-surface-variant  ">Log Weight (KG)</div>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            step="0.1"
                            placeholder="00.0"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="flex-grow bg-[#2c2c2e] border border-white/10 p-4 font-mono text-xl text-on-surface focus:border-primary-container outline-none transition-all placeholder:opacity-20"
                          />
                          <button 
                            onClick={() => {
                              const w = parseFloat(weightInput);
                              if (w > 0) {
                                logWeight(w);
                                setWeightInput('');
                              }
                            }}
                            className="bg-primary-container text-on-primary-container px-6 font-sans font-semibold text-sm font-bold   hover:brightness-110 transition-all active:scale-95"
                          >
                            Log
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-label text-xs text-on-surface-variant  ">Log Body Fat (%)</div>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            step="0.1"
                            placeholder="00.0"
                            value={bodyFatInput}
                            onChange={(e) => setBodyFatInput(e.target.value)}
                            className="flex-grow bg-[#2c2c2e] border border-white/10 p-4 font-mono text-xl text-on-surface focus:border-primary-container outline-none transition-all placeholder:opacity-20"
                          />
                          <button 
                            onClick={() => {
                              const bf = parseFloat(bodyFatInput);
                              if (bf > 0) {
                                setBodyFat(bf);
                                setBodyFatInput('');
                              }
                            }}
                            className="bg-primary-container text-on-primary-container px-6 font-sans font-semibold text-sm font-bold   hover:brightness-110 transition-all active:scale-95"
                          >
                            Set
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[7px] text-on-surface-variant   mt-4 opacity-50">
                      Operator biometrics are synced across all protocol modules.
                    </p>
                  </div>

                  {/* Caloric Engine */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Zap className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className="font-label text-primary-container text-xs tracking-[0.3em] ">Caloric Engine</span>
                        <h3 className="font-sans font-semibold text-xl font-bold text-on-surface   mt-1">Daily Target</h3>
                      </div>
                      <button 
                        onClick={() => setIsAutoCalories(!isAutoCalories)}
                        className={`flex items-center gap-2 px-3 py-1 text-xs font-bold   transition-all border ${
                          isAutoCalories 
                            ? 'bg-primary-container/10 text-primary-container border-primary-container/30' 
                            : 'bg-[#2c2c2e] text-on-surface-variant border-white/10'
                        }`}
                      >
                        {isAutoCalories ? <Zap className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                        {isAutoCalories ? 'Auto-Sync' : 'Manual'}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-12 gap-y-8 mb-8">
                      <div className="flex items-baseline gap-2">
                        {isAutoCalories ? (
                          <div className="font-sans font-semibold text-5xl sm:text-6xl font-bold text-primary-container ">
                            {calories}
                          </div>
                        ) : (
                          <input 
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                            className="bg-transparent border-b-2 border-primary-container/30 font-sans font-semibold text-5xl sm:text-6xl text-primary-container focus:border-primary-container outline-none w-32 sm:w-48 "
                          />
                        )}
                        <span className="font-sans font-semibold text-lg sm:text-xl text-on-surface-variant  font-bold">KCAL</span>
                      </div>

                      <div className="flex items-baseline gap-2 sm:border-l sm:border-white/5 sm:pl-8">
                        <div className="font-sans font-semibold text-4xl sm:text-5xl font-bold text-on-surface ">
                          {proteinRequirement}
                        </div>
                        <span className="font-sans font-semibold text-sm sm:text-lg text-on-surface-variant  font-bold">PRO (G)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                      <div className="text-center">
                        <div className="font-label text-[7px] text-on-surface-variant   mb-1">Fats</div>
                        <div className="font-sans font-semibold text-sm font-bold text-on-surface">{Math.round((calories * 0.25) / 9)}G</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <div className="font-label text-[7px] text-on-surface-variant   mb-1">Carbs</div>
                        <div className="font-sans font-semibold text-sm font-bold text-on-surface">{Math.round((calories - (proteinRequirement * 4) - (calories * 0.25)) / 4)}G</div>
                      </div>
                    </div>
                  </div>

                  {/* Phase Timeline */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-8 border border-white/5">
                    <h3 className="font-sans font-semibold text-xs font-bold   mb-8 flex items-center gap-2 text-on-surface-variant">
                      <Clock className="w-4 h-4" />
                      Phase Timeline
                    </h3>
                    
                    {(() => {
                      const status = getNutritionPhaseStatus();
                      return (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="font-sans font-semibold text-2xl font-bold text-on-surface  ">
                                  {status.isCompleted ? 'PHASE COMPLETE' : `WEEK ${Math.floor(status.elapsedDays / 7) + 1} OF ${nutritionDurationWeeks}`}
                                </div>
                              </div>
                              <div className="font-mono text-xs text-primary-container font-bold">{Math.round(status.progress)}%</div>
                            </div>
                            <div className="h-2 bg-[#2c2c2e]est/30 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${status.progress}%` }}
                                className="h-full bg-primary-container shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                              />
                            </div>
                            <div className="flex justify-between font-mono text-xs text-on-surface-variant/50  ">
                              <span>{status.startDate}</span>
                              <span>{status.endDate}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#2c2c2e]/50 border border-white/5">
                              <div className="font-label text-[7px] text-on-surface-variant   mb-2">Time Remaining</div>
                              <div className="font-sans font-semibold text-sm text-on-surface  font-bold">
                                {status.remainingWeeks}W {status.remainingDays}D
                              </div>
                            </div>
                            <div className="p-4 bg-[#2c2c2e]/50 border border-white/5">
                              <div className="font-label text-[7px] text-on-surface-variant   mb-2">Phase Duration</div>
                              <div className="flex items-center gap-2">
                                {isEditingGoal ? (
                                  <input 
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={nutritionDurationWeeks}
                                    onChange={(e) => setNutritionDurationWeeks(parseInt(e.target.value) || 1)}
                                    className="w-10 bg-transparent border-b border-primary-container/30 font-sans font-semibold text-sm text-primary-container focus:border-primary-container outline-none font-bold"
                                  />
                                ) : (
                                  <span className="font-sans font-semibold text-sm text-on-surface font-bold">{nutritionDurationWeeks}</span>
                                )}
                                <span className="font-sans font-semibold text-sm text-on-surface  font-bold">Weeks</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Column: Configuration & History */}
                <div className="space-y-8">
                  {/* Fuel Area */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Utensils className="w-16 h-16" />
                    </div>
                    <h3 className="font-sans font-semibold text-xs font-bold   mb-6 flex items-center gap-2 text-primary-container">
                      <Zap className="w-3 h-3" />
                      Fuel Protocol
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#2c2c2e]/50 border border-white/5 ">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-label text-xs text-on-surface-variant  ">Pre-Workout Fuel</span>
                          <span className="font-mono text-sm text-primary-container">300 KCAL</span>
                        </div>
                        <p className="text-sm text-on-surface  leading-tight">High glycemic carbs + 20g Protein. 45 min prior to engagement.</p>
                      </div>
                      <div className="p-4 bg-[#2c2c2e]/50 border border-white/5 ">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-label text-xs text-on-surface-variant  ">Post-Workout Recovery</span>
                          <span className="font-mono text-sm text-primary-container">500 KCAL</span>
                        </div>
                        <p className="text-sm text-on-surface  leading-tight">Fast-acting protein + complex carbs. Immediate post-mission intake.</p>
                      </div>
                      <div className="p-4 bg-[#2c2c2e]/50 border border-white/5 ">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-label text-xs text-on-surface-variant  ">Hydration Protocol</span>
                          <span className="font-mono text-sm text-primary-container">3.5L / DAY</span>
                        </div>
                        <p className="text-sm text-on-surface  leading-tight">Maintain electrolyte balance. 500ml upon wake-up.</p>
                      </div>
                    </div>
                  </div>
                  {/* Target & Goal */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-sans font-semibold text-xs font-bold   text-on-surface-variant">Phase Configuration</h3>
                      <button 
                        onClick={() => setIsEditingGoal(!isEditingGoal)}
                        className="flex items-center gap-2 px-3 py-1 text-xs font-bold   transition-all border bg-primary-container/10 text-primary-container border-primary-container/30 hover:bg-primary-container/20"
                      >
                        {isEditingGoal ? <Lock className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                        {isEditingGoal ? 'Lock' : 'Edit'}
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <h3 className="font-sans font-semibold text-xs font-bold   text-on-surface-variant">Phase Goal</h3>
                      {isEditingGoal ? (
                        <div className="flex gap-1">
                          {(['CUT', 'BULK', 'MAINTAIN'] as const).map((goal) => (
                            <button
                              key={goal}
                              onClick={() => handleGoalChange(goal)}
                              className={`px-3 py-1 text-xs font-bold   transition-all border ${
                                nutritionGoal === goal 
                                  ? 'bg-primary-container text-on-primary-container border-primary-container' 
                                  : 'bg-transparent text-on-surface-variant/50 border-white/5 hover:border-primary-container/30'
                              }`}
                            >
                              {goal}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-1 bg-primary-container/10 text-primary-container border border-primary-container/20 font-sans font-semibold text-sm font-bold  ">
                          {nutritionGoal}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#2c2c2e]/50 border border-white/5">
                        <div className="font-label text-[7px] text-on-surface-variant   mb-2">Target Weight</div>
                        <div className="flex items-center gap-2">
                          {isEditingGoal ? (
                            <input 
                              type="number"
                              value={targetWeight}
                              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                              className="w-16 bg-transparent border-b border-primary-container/30 font-sans font-semibold text-lg text-primary-container focus:border-primary-container outline-none"
                            />
                          ) : (
                            <span className="font-sans font-semibold text-lg text-on-surface font-bold">{targetWeight}</span>
                          )}
                          <span className="font-sans font-semibold text-xs text-on-surface  font-bold">KG</span>
                        </div>
                      </div>
                      <div className="p-4 bg-[#2c2c2e]/50 border border-white/5">
                        <div className="font-label text-[7px] text-on-surface-variant   mb-2">Protein Intensity</div>
                        <div className="flex flex-col gap-2">
                          <div className="font-sans font-semibold text-lg text-primary-container font-bold">{proteinPerKg} <span className="text-sm opacity-50">G/KG</span></div>
                          {isEditingGoal && (
                            <input 
                              type="range"
                              min="1.2"
                              max="3.5"
                              step="0.1"
                              value={proteinPerKg}
                              onChange={(e) => setProteinPerKg(parseFloat(e.target.value) || 0)}
                              className="w-full h-1 bg-[#2c2c2e]est rounded-lg appearance-none cursor-pointer accent-primary-container"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weight History List */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/5">
                    <h3 className="font-sans font-semibold text-xs font-bold   mb-4 flex justify-between items-center">
                      <span>Weight History</span>
                      {weightHistory.length > 1 && (
                        <div className="flex items-center gap-1">
                          {(() => {
                            const latest = weightHistory[0].weight;
                            const initial = weightHistory[weightHistory.length - 1].weight;
                            const diff = latest - initial;
                            const isGain = diff > 0;
                            return (
                              <span className={`font-mono text-[9px] ${isGain ? 'text-primary-container' : 'text-error'}`}>
                                {isGain ? '+' : ''}{diff.toFixed(1)} KG
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {weightHistory.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/5">
                          <p className="text-xs text-on-surface-variant   opacity-30">Awaiting biometric data...</p>
                        </div>
                      ) : (
                        weightHistory.map((entry) => (
                          <div key={entry.id} className="flex justify-between items-center p-3 bg-[#2c2c2e]/30 border border-outline-variant/5 group hover:bg-[#2c2c2e] transition-colors">
                            <div>
                              <div className="font-mono text-[11px] text-on-surface font-bold">{entry.weight} KG</div>
                              <div className="font-label text-[7px] text-on-surface-variant  ">{format(parseISO(entry.date), 'MMM dd, yyyy')}</div>
                            </div>
                            <button 
                              onClick={() => deleteWeightEntry(entry.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-error hover:bg-error/10 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Insight & Strategy */}
                  <div className="bg-primary-container/5 border border-primary-container/20 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Target className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-3 text-primary-container mb-4">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-sans font-semibold text-sm font-bold  ">Strategic Protocol Insight</h3>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed  max-w-2xl">
                      {nutritionGoal === 'BULK' && "Current objective: Mass Accumulation. Focus on a slight caloric surplus (250-500 kcal). Prioritize consistent protein intake to maximize muscle protein synthesis. Progressive overload in the 8-12 rep range is critical."}
                      {nutritionGoal === 'CUT' && "Current objective: Adipose Reduction. Maintain a caloric deficit while keeping protein high (2.2g/kg+) to preserve lean tissue. Monitor strength levels closely; any significant drop indicates excessive deficit."}
                      {nutritionGoal === 'MAINTAIN' && "Current objective: Body Recomposition. Maintain current caloric intake while optimizing training intensity. Focus on nutrient timing around training windows to improve performance and recovery."}
                    </p>
                    <div className="mt-8 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
                        <span className="font-label text-xs text-primary-container  ">System Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-on-surface-variant/20"></div>
                        <span className="font-label text-xs text-on-surface-variant/50  ">Auto-Sync Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Video Library' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <Youtube className="w-6 h-6 text-primary glow-primary" />
                  <h2 className="font-sans font-semibold text-xl font-bold text-on-surface  ">Video Archive</h2>
                </div>
                <div className="text-xs font-mono text-primary/70  px-3 py-1 bg-primary/5">
                  DATA.COUNT: {videoIds.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videoIds.map((id) => (
                  <motion.div
                    key={id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative aspect-video bg-[#2c2c2e] rounded-2xl overflow-hidden cursor-pointer  transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                    onClick={() => setActiveVideoUrl(`https://www.youtube.com/watch?v=${id}`)}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 grayscale-[0.5] group-hover:grayscale-0"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors duration-300">
                      <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 duration-300 glow-primary">
                        <Play className="w-4 h-4 text-primary ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-mono text-primary/80 truncate">ID: {id}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'User Stats' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 gap-6">
                <div>
                  <span className="font-label text-primary-container text-sm tracking-[0.4em] ">Biometric Analysis</span>
                  <h1 className="font-sans font-semibold text-3xl md:text-5xl font-bold text-on-surface   mt-2">Operator Stats</h1>
                </div>
                {selectedArchiveDate && (
                  <button 
                    onClick={() => setSelectedArchiveDate(null)}
                    className="flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 px-4 py-2 text-sm font-bold text-primary-container   hover:bg-primary-container/20 transition-all"
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
                    className={`bg-[#1c1c1e] p-6 border border-white/5 transition-all ${stat.label.includes('Volume') ? 'cursor-pointer hover:bg-[#2c2c2e] hover:border-primary-container/30 group' : ''}`}
                    onClick={() => {
                      if (stat.label.includes('Volume') && stat.numericValue !== undefined) {
                        setComparisonModal({ isOpen: true, weight: stat.numericValue, label: stat.label });
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <stat.icon className={`w-6 h-6 ${stat.color} ${stat.label.includes('Volume') ? 'group-hover:scale-110 transition-transform' : ''}`} />
                      <div className="font-label text-xs text-on-surface-variant  ">{stat.label}</div>
                    </div>
                    <div className="font-sans font-semibold text-3xl font-bold text-on-surface   flex items-baseline gap-2">
                      {stat.value}
                      {stat.label.includes('Volume') && (
                        <span className="text-xs text-primary-container opacity-0 group-hover:opacity-100 transition-opacity  ">Compare</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#1c1c1e] rounded-2xl p-6 md:p-8 border border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <h3 className="font-sans font-semibold text-lg font-bold   text-primary-container">Performance Matrix</h3>
                  <div className="flex gap-4">
                    {[
                      { label: 'Completed', color: 'bg-primary-container' },
                      { label: 'Incomplete', color: 'bg-amber-500' },
                      { label: 'Breach', color: 'bg-error' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${item.color}`} />
                        <span className="font-label text-xs text-on-surface-variant  ">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative h-64 flex gap-4">
                  {/* Y-Axis */}
                  <div className="flex flex-col justify-between text-xs font-mono text-on-surface-variant/40  py-1 h-full border-r border-white/5 pr-2">
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
                            className={`w-full bg-[#2c2c2e]/30 relative group h-full flex items-end cursor-pointer transition-all ${
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
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 p-2 bg-[#2c2c2e]est border border-primary-container/30 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                              <div className="text-xs text-primary-container font-bold   mb-1">{formattedDate}</div>
                              <div className="text-sm text-on-surface  font-bold">
                                {dayEntry ? `${height}%` : 'NO INTEL'}
                              </div>
                              <div className="text-[7px] text-on-surface-variant  mt-1">
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
                                <div className="absolute inset-0  opacity-20"></div>
                              )}
                            </motion.div>
                          </div>
                          <span className="font-label text-xs text-on-surface-variant  ">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Muscle Rankings Section */}
              <div className="bg-[#1c1c1e] rounded-2xl p-6 md:p-8 border border-white/5">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <span className="font-label text-primary-container text-xs tracking-[0.4em] ">Sector Analysis</span>
                    <h3 className="font-sans font-semibold text-lg font-bold   text-on-surface">Muscle Rankings</h3>
                  </div>
                  <div className="flex gap-2">
                    {['Platinum', 'Diamond', 'Master', 'Legend'].map(rank => (
                      <div key={rank} className="flex items-center gap-1">
                        <Shield className="w-2 h-2 text-primary-container/40" />
                        <span className="text-[6px] text-on-surface-variant  ">{rank}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { muscle: 'Chest', xp: 1240, rank: 'Silver I', focus: weakpointFocus === 'Chest' },
                    { muscle: 'Biceps', xp: 720, rank: 'Bronze III', focus: weakpointFocus === 'Arms' },
                    { muscle: 'Lats', xp: 0, rank: 'Untrained', focus: weakpointFocus === 'Back' },
                    { muscle: 'Quadriceps', xp: 1100, rank: 'Silver I', focus: weakpointFocus === 'Legs' },
                    { muscle: 'Shoulders', xp: 880, rank: 'Silver I', focus: weakpointFocus === 'Shoulders' },
                    { muscle: 'Hamstrings', xp: 740, rank: 'Bronze III', focus: false },
                  ].map((item) => (
                    <div 
                      key={item.muscle}
                      className={`p-4 border border-white/5 transition-all relative overflow-hidden group ${item.focus ? 'bg-primary-container/5 border-primary-container/20' : 'bg-[#2c2c2e]/30'}`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 border ${item.focus ? 'border-primary-container/30 bg-primary-container/10' : 'border-white/5 bg-[#2c2c2e]est/30'}`}>
                            <Activity className={`w-4 h-4 ${item.focus ? 'text-primary-container' : 'text-on-surface-variant'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-semibold text-sm font-bold text-on-surface  ">{item.muscle}</span>
                              {item.focus && (
                                <span className="bg-primary-container/10 text-primary-container text-[6px] px-1.5 py-0.5 border border-primary-container/30  font-bold ">
                                  Focus
                                </span>
                              )}
                            </div>
                            <div className="h-1 w-32 bg-[#2c2c2e]est mt-2 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (item.xp / 2000) * 100)}%` }}
                                className={`h-full ${item.focus ? 'bg-primary-container' : 'bg-on-surface-variant/40'}`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-label text-xs text-on-surface-variant   mb-1">{item.rank}</div>
                          <div className="font-mono text-sm text-primary-container font-bold">{item.xp} XP</div>
                        </div>
                      </div>
                      {item.focus && (
                        <div className="absolute inset-0  opacity-5 pointer-events-none" />
                      )}
                    </div>
                  ))}
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
              className="relative w-full max-w-md bg-[#1c1c1e] border border-error/30 p-8 shadow-[0_0_50px_rgba(255,82,82,0.15)]"
            >
              <div className="flex items-center gap-4 text-error mb-6">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="font-sans font-semibold text-2xl font-bold  ">CRITICAL PURGE</h3>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8  tracking-wide">
                THIS ACTION WILL PERMANENTLY ERASE ALL ARCHIVED DATA, CURRENT PROGRESS, AND TRAINING SCHEDULES. THIS IS A FACTORY RESET OF THE SOVEREIGN PROTOCOL.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={clearArchive}
                  className="w-full bg-error text-on-error py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:brightness-110 transition-all"
                >
                  CONFIRM FACTORY RESET
                </button>
                <button 
                  onClick={() => setShowPurgeModal(false)}
                  className="w-full bg-[#2c2c2e] text-on-surface py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:bg-[#2c2c2e]est transition-all"
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
              className="relative w-full max-w-sm bg-[#1c1c1e] border border-emerald-500/30 p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
            >
              <div className="flex items-center gap-4 text-emerald-400 mb-6">
                <Shield className="w-8 h-8" />
                <h3 className="font-sans font-semibold text-2xl font-bold  ">RECOVERY ACTIVE</h3>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8  tracking-wide">
                CURRENTLY REST DAY ACTIVE. SYSTEM IS IN STANDBY MODE. NO OBJECTIVES ASSIGNED FOR THIS CYCLE.
              </p>

              <button 
                onClick={() => setIsRestDayModalOpen(false)}
                className="w-full bg-emerald-500 text-on-emerald py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:brightness-110 transition-all"
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
              className="relative w-full max-w-sm bg-[#1c1c1e] border border-primary-container/30 p-8 shadow-[0_0_50px_rgba(0,229,255,0.2)]"
            >
              <div className="flex items-center gap-4 text-primary-container mb-6">
                <Rocket className="w-8 h-8" />
                <h3 className="font-sans font-semibold text-2xl font-bold  ">PROTOCOL ENGAGED</h3>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8  tracking-wide">
                DAILY QUEST INITIALIZED. ALL OBJECTIVES ARE NOW UNLOCKED. SYSTEM IS TRACKING PERFORMANCE.
              </p>

              <button 
                onClick={() => setIsWorkoutInitModalOpen(false)}
                className="w-full bg-primary-container text-on-primary-container py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:brightness-110 transition-all"
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
              className="relative w-full max-w-md bg-[#1c1c1e] border border-primary-container/30 p-8 shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -right-12 -top-12 opacity-5">
                <Zap className="w-48 h-48 text-primary-container" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 text-primary-container mb-6">
                  <Activity className="w-8 h-8" />
                  <h3 className="font-sans font-semibold text-2xl font-bold  ">Volume Comparison</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="font-label text-sm text-on-surface-variant   mb-1">{comparisonModal.label}</div>
                    <div className="font-sans font-semibold text-4xl font-bold text-primary-container">{comparisonModal.weight.toLocaleString()} KG</div>
                  </div>

                  <div className="bg-primary-container/5 border border-primary-container/20 p-6 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
                    <div className="font-label text-xs text-primary-container  tracking-[0.3em] mb-3">Equivalent Mass</div>
                    <div className="font-sans font-semibold text-xl font-bold text-on-surface   leading-tight italic">
                      "You've lifted the equivalent of {getWeightComparison(comparisonModal.weight)}."
                    </div>
                  </div>

                  <p className="text-on-surface-variant text-sm   leading-relaxed">
                    This represents the total gravitational force overcome during your training cycle. Your physical output is reaching critical levels.
                  </p>

                  <button 
                    onClick={() => setComparisonModal(null)}
                    className="w-full bg-primary-container text-on-primary-container py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:brightness-110 transition-all mt-4"
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
              className="relative w-full max-w-2xl bg-[#1c1c1e] border border-primary-container/30 p-6 md:p-8 shadow-[0_0_50px_rgba(0,229,255,0.15)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4 text-primary-container">
                  <History className="w-8 h-8" />
                  <h3 className="font-sans font-semibold text-2xl font-bold  ">Edit Protocol Data</h3>
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
                    <label className="font-label text-xs text-on-surface-variant   block mb-2">Protocol Details</label>
                    <input 
                      type="text" 
                      value={editingArchiveEntry.details}
                      onChange={(e) => setEditingArchiveEntry({...editingArchiveEntry, details: e.target.value})}
                      className="w-full bg-[#2c2c2e] border border-white/5 p-3 font-sans font-semibold text-xs   text-on-surface focus:border-primary-container outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-label text-xs text-on-surface-variant   block mb-2">Duration (sec)</label>
                    <input 
                      type="number" 
                      value={editingArchiveEntry.duration || 0}
                      onChange={(e) => setEditingArchiveEntry({...editingArchiveEntry, duration: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#2c2c2e] border border-white/5 p-3 font-sans font-semibold text-xs   text-on-surface focus:border-primary-container outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-label text-xs text-on-surface-variant   block mb-2">Status</label>
                    <select 
                      value={editingArchiveEntry.type}
                      onChange={(e) => setEditingArchiveEntry({...editingArchiveEntry, type: e.target.value as 'COMPLETED' | 'INCOMPLETE' | 'BREACH'})}
                      className={`w-full bg-[#2c2c2e] border p-3 font-sans font-semibold text-xs   text-on-surface focus:border-primary-container outline-none transition-all ${
                        editingArchiveEntry.type === 'BREACH' ? 'border-error/50 text-error' : 'border-white/5'
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
                    <div className="font-label text-xs text-on-surface-variant   border-b border-white/5 pb-1">Exercise Intel Modification</div>
                    {editingArchiveEntry.exercises.map((ex, exIdx) => (
                      <div key={ex.id} className="bg-[#2c2c2e] rounded-2xl p-4 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <input 
                            type="text" 
                            value={ex.name}
                            onChange={(e) => {
                              const newExercises = [...(editingArchiveEntry.exercises || [])];
                              newExercises[exIdx] = { ...ex, name: e.target.value };
                              setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                            }}
                            className="bg-transparent border-b border-white/5 font-sans font-semibold font-bold   text-sm w-1/2 focus:border-primary-container outline-none"
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
                              <div key={sIdx} className="flex items-center gap-3 p-2 bg-[#2c2c2e]est/20 border border-white/5 rounded">
                                <span className="font-sans font-semibold text-xs font-bold text-primary-container">{sIdx + 1}</span>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[6px] text-on-surface-variant/50  ">Weight</label>
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
                                    className="w-20 bg-[#2c2c2e]est border border-white/5 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                    placeholder="Weight"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[6px] text-on-surface-variant/50  ">Reps</label>
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
                                    className="w-16 bg-[#2c2c2e]est border border-white/5 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
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
                              className="col-span-full py-2 border border-dashed border-white/5 text-xs   text-on-surface-variant hover:bg-[#2c2c2e]est/20 transition-all"
                            >
                              + Add Set
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[6px] text-on-surface-variant/50  ">Sets</label>
                              <input 
                                type="text" 
                                value={ex.sets}
                                onChange={(e) => {
                                  const newExercises = [...(editingArchiveEntry.exercises || [])];
                                  newExercises[exIdx] = { ...ex, sets: e.target.value };
                                  setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                }}
                                className="w-16 bg-[#2c2c2e]est border border-white/5 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                placeholder="Sets"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[6px] text-on-surface-variant/50  ">Weight</label>
                              <input 
                                type="text" 
                                value={ex.weight}
                                onChange={(e) => {
                                  const newExercises = [...(editingArchiveEntry.exercises || [])];
                                  newExercises[exIdx] = { ...ex, weight: e.target.value };
                                  setEditingArchiveEntry({ ...editingArchiveEntry, exercises: newExercises });
                                }}
                                className="w-24 bg-[#2c2c2e]est border border-white/5 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
                                placeholder="Weight"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[6px] text-on-surface-variant/50  ">Reps</label>
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
                                className="w-16 bg-[#2c2c2e]est border border-white/5 p-2 font-mono text-xs text-on-surface focus:border-primary-container outline-none text-center"
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
                              className="mt-auto mb-1 text-xs   text-primary-container/60 hover:text-primary-container transition-colors"
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
                      className="w-full py-4 border border-dashed border-white/5 text-sm   text-primary-container hover:bg-primary-container/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Exercise to Entry
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => saveArchiveEdit(editingArchiveEntry)}
                    className="flex-grow bg-primary-container text-on-primary-container py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:brightness-110 transition-all"
                  >
                    Commit Changes
                  </button>
                  <button 
                    onClick={() => deleteArchiveEntry(editingArchiveEntry.id)}
                    className="px-6 bg-error/10 text-error border border-error/20 py-4 font-sans font-semibold text-sm font-bold tracking-[0.3em]  hover:bg-error/20 transition-all"
                  >
                    Purge Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

          {/* Roadmap Modal */}
          <AnimatePresence>
            {isRoadmapOpen && selectedProgramId && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/95 backdrop-blur-xl"
                  onClick={() => setIsRoadmapOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-5xl max-h-[90vh] bg-[#121212] border border-outline-variant overflow-hidden flex flex-col shadow-2xl"
                >
                  <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-[#2c2c2e]">
                    <div>
                      <span className="font-label text-primary-container text-sm tracking-[0.4em] ">Protocol Roadmap</span>
                      <h2 className="font-sans font-semibold text-2xl font-bold text-on-surface   mt-1">
                        {PROGRAMS.find(p => p.id === selectedProgramId)?.name}
                      </h2>
                    </div>
                    <button onClick={() => setIsRoadmapOpen(false)} className="p-2 hover:bg-[#2c2c2e]est transition-all">
                      <XCircle className="w-6 h-6 text-on-surface-variant" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {Array.from({ length: PROGRAMS.find(p => p.id === selectedProgramId)?.totalWeeks || 0 }).map((_, i) => {
                        const weekNum = i + 1;
                        const program = PROGRAMS.find(p => p.id === selectedProgramId);
                        let weekData = null;
                        for (const range in program?.weeks) {
                          const [start, end] = range.split('-').map(Number);
                          if (end ? (weekNum >= start && weekNum <= end) : (weekNum === start)) {
                            weekData = program?.weeks[range];
                            break;
                          }
                        }
                        
                        return (
                          <div key={weekNum} className={`relative p-6 border transition-all duration-300 ${
                            weekNum === getProgramCurrentCycle() 
                              ? 'border-primary-container bg-primary-container/5 shadow-[0_0_30px_rgba(0,229,255,0.05)]' 
                              : 'border-white/10 bg-[#1c1c1e] hover:border-white/20'
                          }`}>
                            <div className="flex justify-between items-center mb-6">
                              <div className="flex flex-col">
                                <span className="font-sans font-semibold text-2xl font-bold text-on-surface ">CYCLE {weekNum}</span>
                                <div className="h-1 w-12 bg-primary-container mt-1" />
                              </div>
                              {weekNum === getProgramCurrentCycle() && (
                                <div className="flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1">
                                  <Zap className="w-3 h-3 animate-pulse" />
                                  <span className="text-sm font-bold  ">Active</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-6">
                              {DAYS.map(day => {
                                const exercises = weekData?.days[day] || [];
                                if (exercises.length === 0) return null;
                                const dayLabel = program?.dayLabels?.[day];
                                
                                return (
                                  <div key={day} className="group/day">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-sans font-semibold text-sm text-on-surface-variant font-bold   group-hover/day:text-primary-container transition-colors">
                                        {day}
                                      </div>
                                      {dayLabel && (
                                        <div className="font-label text-xs text-primary-container/60 font-bold   border border-primary-container/20 px-2 py-0.5">
                                          {dayLabel}
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-1.5 pl-3 border-l border-white/10 group-hover/day:border-primary-container/30 transition-colors">
                                      {exercises.map((ex, exIdx) => (
                                        <div key={exIdx} className="flex items-start gap-2">
                                          <div className="w-1 h-1 rounded-full bg-primary-container/40 mt-1.5" />
                                          <div className="flex flex-col">
                                            <span className="text-[11px] text-on-surface font-bold  tracking-wide leading-tight">
                                              {ex.name}
                                            </span>
                                            <span className="text-[9px] text-on-surface-variant/70  ">
                                              {ex.sets}x{ex.reps} • {ex.target}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

      {/* Program Selection Modal */}
      <AnimatePresence>
        {isProgramModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProgramModalOpen(false)}
              className="absolute inset-0 bg-[#1c1c1e]est/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1c1c1e] border border-primary-container/20 shadow-[0_0_50px_rgba(0,229,255,0.1)] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <span className="font-label text-primary-container text-xs tracking-[0.4em] ">Selection Matrix</span>
                  <h2 className="font-sans font-semibold text-2xl font-bold text-on-surface   mt-1">Available Programs</h2>
                </div>
                <button onClick={() => setIsProgramModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {PROGRAMS.map(program => (
                  <div 
                    key={program.id}
                    className="bg-[#2c2c2e] rounded-2xl p-6 border border-white/5 hover:border-primary-container/30 transition-all group cursor-pointer"
                    onClick={() => {
                      setPendingProgramId(program.id);
                      setIsProgramModalOpen(false);
                      setIsScheduleConfigModalOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-sans font-semibold text-xl font-bold text-on-surface  group-hover:text-primary-container transition-colors">{program.name}</h3>
                      <span className="font-label text-xs text-primary-container border border-primary-container/30 px-2 py-1  ">{program.author}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant   leading-relaxed opacity-70 mb-6">
                      {program.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary-container font-sans font-semibold text-xs font-bold  ">
                      Initialize Protocol <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideoUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoUrl(null)}
              className="absolute inset-0 bg-[#1c1c1e]est/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl aspect-video bg-black border border-primary-container/20 shadow-[0_0_100px_rgba(0,229,255,0.2)]"
            >
              <button 
                onClick={() => setActiveVideoUrl(null)}
                className="absolute -top-12 right-0 text-on-surface-variant hover:text-on-surface flex items-center gap-2 font-sans font-semibold text-sm  "
              >
                Close Protocol <XCircle className="w-5 h-5" />
              </button>
              <iframe 
                src={activeVideoUrl.replace('watch?v=', 'embed/')} 
                className="w-full h-full"
                allowFullScreen
                title="Exercise Demonstration"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Configuration Modal */}
      <AnimatePresence>
        {isScheduleConfigModalOpen && pendingProgramId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleConfigModalOpen(false)}
              className="absolute inset-0 bg-[#1c1c1e]est/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1c1c1e] border border-primary-container/20 shadow-[0_0_50px_rgba(0,229,255,0.1)] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <span className="font-label text-primary-container text-xs tracking-[0.4em] ">Configuration Matrix</span>
                  <h2 className="font-sans font-semibold text-2xl font-bold text-on-surface   mt-1">Configure Split</h2>
                  <p className="text-sm text-on-surface-variant   mt-2 opacity-60">Map your weekly schedule to the program protocols.</p>
                </div>
                <button onClick={() => setIsScheduleConfigModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {DAYS.map(day => {
                  const program = PROGRAMS.find(p => p.id === pendingProgramId);
                  const availableDays = program?.dayLabels ? Object.keys(program.dayLabels) : DAYS;
                  
                  return (
                    <div key={day} className="flex items-center justify-between p-4 bg-[#2c2c2e] border border-white/5">
                      <span className="font-sans font-semibold text-sm font-bold text-on-surface ">{day}</span>
                      <select 
                        value={dayMapping[day]}
                        onChange={(e) => {
                          const newMapping = { ...dayMapping, [day]: e.target.value };
                          setDayMapping(newMapping);
                          localStorage.setItem('sovereign_day_mapping', JSON.stringify(newMapping));
                        }}
                        className="bg-[#1c1c1e] rounded-2xl border border-white/5 text-on-surface font-sans font-semibold text-sm   px-4 py-2 focus:outline-none focus:border-primary-container/50"
                      >
                        {availableDays.map(labelKey => (
                          <option key={labelKey} value={labelKey}>
                            {program?.dayLabels?.[labelKey] || labelKey}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              <div className="p-8 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => {
                    const program = PROGRAMS.find(p => p.id === pendingProgramId);
                    if (program?.weakpointOptions) {
                      setIsScheduleConfigModalOpen(false);
                      setIsWeakpointModalOpen(true);
                      setSelectedProgramId(pendingProgramId);
                    } else {
                      applyProgram(pendingProgramId!, null);
                      setIsScheduleConfigModalOpen(false);
                    }
                  }}
                  className="px-8 py-4 bg-primary-container text-on-primary-container font-sans font-semibold text-xs font-bold   hover:bg-primary-container/90 transition-all flex items-center gap-2"
                >
                  Confirm Configuration <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weakpoint Selection Modal */}
      <AnimatePresence>
        {isWeakpointModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWeakpointModalOpen(false)}
              className="absolute inset-0 bg-[#1c1c1e]est/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1c1c1e] border border-primary-container/20 shadow-[0_0_50px_rgba(0,229,255,0.1)] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5">
                <span className="font-label text-primary-container text-xs tracking-[0.4em] ">Optimization Protocol</span>
                <h2 className="font-sans font-semibold text-2xl font-bold text-on-surface   mt-1">Select Weakpoint Focus</h2>
                <p className="text-sm text-on-surface-variant   mt-2 opacity-60">The protocol will adjust volume to prioritize this sector.</p>
              </div>
              <div className="p-8 grid grid-cols-1 gap-4">
                {PROGRAMS.find(p => p.id === selectedProgramId)?.weakpointOptions?.map(option => (
                  <button 
                    key={option}
                    onClick={() => {
                      if (selectedProgramId) {
                        applyProgram(selectedProgramId, option);
                        setIsWeakpointModalOpen(false);
                      }
                    }}
                    className="w-full p-4 bg-[#2c2c2e] border border-white/5 hover:border-primary-container/30 text-left group transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-sans font-semibold text-sm font-bold text-on-surface  group-hover:text-primary-container transition-colors">{option} Focus</span>
                      <div className="w-2 h-2 rounded-full border border-primary-container/30 group-hover:bg-primary-container transition-all" />
                    </div>
                  </button>
                ))}
                <button 
                  onClick={() => {
                    if (selectedProgramId) {
                      applyProgram(selectedProgramId, null);
                      setIsWeakpointModalOpen(false);
                    }
                  }}
                  className="w-full p-4 border border-dashed border-white/5 text-center font-sans font-semibold text-sm   text-on-surface-variant hover:bg-[#2c2c2e] transition-all"
                >
                  No Specific Focus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#1c1c1e]/90 backdrop-blur-lg border-t border-primary-container/10 flex justify-around p-4 z-50">
        {[
          { icon: Bolt, label: 'Quest', tab: 'Daily Quest' },
          { icon: History, label: 'Archive', tab: 'Workout Archive' },
          { icon: CalendarIcon, label: 'Schedule', tab: 'Schedule' },
          { icon: Utensils, label: 'Fuel', tab: 'Nutrition' },
          { icon: BarChart3, label: 'Stats', tab: 'User Stats' },
          { icon: Youtube, label: 'Videos', tab: 'Video Library' },
        ].map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center transition-all ${activeTab === item.tab ? 'text-primary-container scale-110' : 'text-on-surface-variant/50'}`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.tab ? 'glow-primary' : ''}`} />
            <span className="text-[7px]   mt-1 font-sans font-semibold font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  </div>
  );
}
