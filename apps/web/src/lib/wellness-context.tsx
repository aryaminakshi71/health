import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  energy: number;
  notes: string;
  factors: string[];
};

export type MeditationSession = {
  id: string;
  date: string;
  duration: number;
  type: "breathing" | "guided" | "mindfulness" | "sleep";
  completed: boolean;
};

export type WorkoutEntry = {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  exercises: { name: string; sets: number; reps: number }[];
};

export type SleepEntry = {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  duration: number;
  notes: string;
};

export type UserProfile = {
  name: string;
  goals: string[];
  streak: number;
  totalMeditations: number;
  totalWorkouts: number;
};

type WellnessContextType = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: Omit<MoodEntry, "id">) => void;
  meditationSessions: MeditationSession[];
  addMeditationSession: (session: Omit<MeditationSession, "id">) => void;
  workoutEntries: WorkoutEntry[];
  addWorkoutEntry: (entry: Omit<WorkoutEntry, "id">) => void;
  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => void;
};

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

const defaultUser: UserProfile = {
  name: "Guest",
  goals: ["Reduce stress", "Better sleep", "Stay active"],
  streak: 7,
  totalMeditations: 24,
  totalWorkouts: 12,
};

const generateId = () => Math.random().toString(36).slice(2, 11);

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [meditationSessions, setMeditationSessions] = useState<
    MeditationSession[]
  >([]);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wellness-data");
    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user || defaultUser);
      setMoodEntries(data.moodEntries || []);
      setMeditationSessions(data.meditationSessions || []);
      setWorkoutEntries(data.workoutEntries || []);
      setSleepEntries(data.sleepEntries || []);
    } else {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      setMoodEntries([
        {
          id: generateId(),
          date: today,
          mood: 4,
          energy: 3,
          notes: "Feeling pretty good today!",
          factors: ["good sleep", "exercise"],
        },
        {
          id: generateId(),
          date: yesterday,
          mood: 3,
          energy: 4,
          notes: "Productive day",
          factors: ["work", "coffee"],
        },
      ]);

      setSleepEntries([
        {
          id: generateId(),
          date: today,
          bedtime: "22:30",
          wakeTime: "06:30",
          quality: 4,
          duration: 8,
          notes: "Slept well",
        },
        {
          id: generateId(),
          date: yesterday,
          bedtime: "23:00",
          wakeTime: "07:00",
          quality: 3,
          duration: 8,
          notes: "",
        },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "wellness-data",
        JSON.stringify({
          user,
          moodEntries,
          meditationSessions,
          workoutEntries,
          sleepEntries,
        })
      );
    }
  }, [
    user,
    moodEntries,
    meditationSessions,
    workoutEntries,
    sleepEntries,
    isLoaded,
  ]);

  const addMoodEntry = (entry: Omit<MoodEntry, "id">) => {
    setMoodEntries((prev) => [{ ...entry, id: generateId() }, ...prev]);
  };

  const addMeditationSession = (session: Omit<MeditationSession, "id">) => {
    setMeditationSessions((prev) => [
      { ...session, id: generateId() },
      ...prev,
    ]);
    setUser((prev) => ({
      ...prev,
      totalMeditations: prev.totalMeditations + 1,
    }));
  };

  const addWorkoutEntry = (entry: Omit<WorkoutEntry, "id">) => {
    setWorkoutEntries((prev) => [{ ...entry, id: generateId() }, ...prev]);
    setUser((prev) => ({ ...prev, totalWorkouts: prev.totalWorkouts + 1 }));
  };

  const addSleepEntry = (entry: Omit<SleepEntry, "id">) => {
    setSleepEntries((prev) => [{ ...entry, id: generateId() }, ...prev]);
  };

  return (
    <WellnessContext.Provider
      value={{
        user,
        setUser,
        moodEntries,
        addMoodEntry,
        meditationSessions,
        addMeditationSession,
        workoutEntries,
        addWorkoutEntry,
        sleepEntries,
        addSleepEntry,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return context;
}
