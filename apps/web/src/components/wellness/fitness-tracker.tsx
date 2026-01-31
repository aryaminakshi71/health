import { useState, type ElementType } from "react";
import { useWellness } from "@/lib/wellness-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/wellness/ui/card";
import { Button } from "@/components/wellness/ui/button";
import { Input } from "@/components/wellness/ui/input";
import { cn } from "@/lib/utils";
import {
  Dumbbell,
  Flame,
  Clock,
  Plus,
  Trash2,
  Play,
  Check,
  Timer,
  Zap,
  Heart,
  Target,
} from "lucide-react";

type WorkoutType = {
  id: string;
  name: string;
  icon: ElementType;
  color: string;
  bgColor: string;
  exercises: { name: string; sets: number; reps: number }[];
  estimatedCalories: number;
  duration: number;
};

const presetWorkouts: WorkoutType[] = [
  {
    id: "strength",
    name: "Full Body Strength",
    icon: Dumbbell,
    color: "text-wellness-energy",
    bgColor: "bg-wellness-energy/10",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 12 },
      { name: "Squats", sets: 3, reps: 15 },
      { name: "Lunges", sets: 3, reps: 10 },
      { name: "Plank", sets: 3, reps: 30 },
    ],
    estimatedCalories: 250,
    duration: 30,
  },
  {
    id: "cardio",
    name: "Cardio Burn",
    icon: Flame,
    color: "text-wellness-mood",
    bgColor: "bg-wellness-mood/10",
    exercises: [
      { name: "Jumping Jacks", sets: 3, reps: 30 },
      { name: "High Knees", sets: 3, reps: 20 },
      { name: "Burpees", sets: 3, reps: 10 },
      { name: "Mountain Climbers", sets: 3, reps: 20 },
    ],
    estimatedCalories: 350,
    duration: 25,
  },
  {
    id: "yoga",
    name: "Gentle Yoga",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10",
    exercises: [
      { name: "Sun Salutation", sets: 3, reps: 1 },
      { name: "Warrior Pose", sets: 2, reps: 1 },
      { name: "Downward Dog", sets: 3, reps: 1 },
      { name: "Child's Pose", sets: 2, reps: 1 },
    ],
    estimatedCalories: 150,
    duration: 20,
  },
  {
    id: "hiit",
    name: "HIIT Session",
    icon: Zap,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    exercises: [
      { name: "Sprint Intervals", sets: 5, reps: 30 },
      { name: "Box Jumps", sets: 3, reps: 12 },
      { name: "Kettlebell Swings", sets: 3, reps: 15 },
      { name: "Battle Ropes", sets: 3, reps: 30 },
    ],
    estimatedCalories: 400,
    duration: 20,
  },
];

export function FitnessTracker() {
  const { workoutEntries, addWorkoutEntry, user } = useWellness();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [customExercises, setCustomExercises] = useState<
    { name: string; sets: number; reps: number }[]
  >([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: 3,
    reps: 10,
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleExercise = (index: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);
  };

  const startWorkout = (workout: WorkoutType) => {
    setSelectedWorkout(workout);
    setIsTracking(true);
    setCompletedExercises(new Set());
  };

  const completeWorkout = () => {
    if (!selectedWorkout) return;

    addWorkoutEntry({
      date: new Date().toISOString().split("T")[0],
      type: selectedWorkout.name,
      duration: selectedWorkout.duration,
      calories: selectedWorkout.estimatedCalories,
      exercises: selectedWorkout.exercises,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsTracking(false);
      setSelectedWorkout(null);
      setCompletedExercises(new Set());
    }, 2000);
  };

  const addCustomExercise = () => {
    if (!newExercise.name.trim()) return;
    setCustomExercises([...customExercises, { ...newExercise }]);
    setNewExercise({ name: "", sets: 3, reps: 10 });
  };

  const removeCustomExercise = (index: number) => {
    setCustomExercises(customExercises.filter((_, i) => i !== index));
  };

  const saveCustomWorkout = () => {
    if (customExercises.length === 0) return;

    addWorkoutEntry({
      date: new Date().toISOString().split("T")[0],
      type: "Custom Workout",
      duration: customExercises.length * 5,
      calories: customExercises.length * 50,
      exercises: customExercises,
    });

    setCustomExercises([]);
    setShowCustomForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const todaysWorkouts = workoutEntries.filter(
    (w) => w.date === new Date().toISOString().split("T")[0]
  );
  const totalCaloriesToday = todaysWorkouts.reduce((acc, w) => acc + w.calories, 0);
  const totalMinutesToday = todaysWorkouts.reduce((acc, w) => acc + w.duration, 0);

  if (isTracking && selectedWorkout) {
    const progress =
      (completedExercises.size / selectedWorkout.exercises.length) * 100;
    const allComplete =
      completedExercises.size === selectedWorkout.exercises.length;

    return (
      <div className="space-y-8">
        {showSuccess ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Check className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Workout Complete!
            </h2>
            <p className="text-muted-foreground">
              You burned approximately {selectedWorkout.estimatedCalories} calories
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedWorkout.name}
                </h1>
                <p className="text-muted-foreground">
                  {completedExercises.size} of {selectedWorkout.exercises.length} exercises
                  completed
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTracking(false);
                  setSelectedWorkout(null);
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {selectedWorkout.exercises.map((exercise, index) => (
                <Card
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all",
                    completedExercises.has(index)
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-secondary/50"
                  )}
                  onClick={() => toggleExercise(index)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          completedExercises.has(index)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        )}
                      >
                        {completedExercises.has(index) ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="font-semibold text-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            completedExercises.has(index)
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {exercise.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets x {exercise.reps}{" "}
                          {exercise.reps > 10 ? "seconds" : "reps"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={completeWorkout}
              disabled={!allComplete}
              size="lg"
              className="w-full"
            >
              {allComplete ? "Complete Workout" : "Complete all exercises"}
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Fitness</h1>
        <p className="text-muted-foreground text-lg">
          Build strength, endurance, and healthy habits with guided workouts.
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium animate-in fade-in slide-in-from-top-2">
          Workout saved successfully!
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-energy/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-wellness-energy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{user.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Total workouts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-mood/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-wellness-mood" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCaloriesToday}</p>
              <p className="text-sm text-muted-foreground">Calories today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalMinutesToday}</p>
              <p className="text-sm text-muted-foreground">Minutes today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Start Workouts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {presetWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="hover:shadow-lg transition-all duration-300 hover:border-primary/40"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        workout.bgColor
                      )}
                    >
                      <workout.icon className={cn("w-6 h-6", workout.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{workout.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {workout.exercises.length} exercises
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {workout.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {workout.estimatedCalories} cal
                  </span>
                </div>
                <Button
                  onClick={() => startWorkout(workout)}
                  className="w-full"
                  variant="outline"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Custom Workout</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            {showCustomForm ? "Cancel" : "Create Custom"}
          </Button>
        </CardHeader>
        {showCustomForm && (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Exercise name"
                value={newExercise.name}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, name: e.target.value })
                }
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Sets"
                value={newExercise.sets}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    sets: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Reps"
                value={newExercise.reps}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    reps: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-20"
              />
              <Button onClick={addCustomExercise} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {customExercises.length > 0 && (
              <div className="space-y-2">
                {customExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets x {exercise.reps} reps
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomExercise(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={saveCustomWorkout}
                  className="w-full"
                  disabled={customExercises.length === 0}
                >
                  Save Custom Workout
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {workoutEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workoutEntries.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-wellness-energy/10 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-wellness-energy" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{workout.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {workout.duration} min
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {workout.calories} cal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="w-5 h-5 text-primary" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {todaysWorkouts.length} of 3 workouts this week
              </span>
              <span className="font-medium text-foreground">
                {Math.round((todaysWorkouts.length / 3) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-wellness-energy transition-all duration-500"
                style={{
                  width: `${Math.min((todaysWorkouts.length / 3) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {3 - todaysWorkouts.length > 0
                ? `${3 - todaysWorkouts.length} more workout${
                    3 - todaysWorkouts.length !== 1 ? "s" : ""
                  } to reach your goal!`
                : "You've reached your weekly goal!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
