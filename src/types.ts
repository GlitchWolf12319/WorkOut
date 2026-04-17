export interface WorkoutSet {
  weight: string;
  reps: number;
}

export interface WorkoutItem {
  id: string;
  name: string;
  target: string;
  weight: string;
  reps: number;
  sets: string;
  setData?: WorkoutSet[];
  completed: boolean;
  notes?: string;
  videoUrl?: string;
}

export interface ScheduleDay {
  day: string;
  exercises: WorkoutItem[];
  phase?: 'BULK' | 'CUT' | 'MAINTAIN';
}

export interface WeeklySchedule {
  [week: number]: ScheduleDay[];
}

export interface ArchiveEntry {
  id: string;
  date: string;
  day: string;
  type: 'COMPLETED' | 'INCOMPLETE' | 'BREACH';
  details: string;
  exercises?: WorkoutItem[];
  progress?: number;
  duration?: number;
  cardioCompleted?: boolean;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}
