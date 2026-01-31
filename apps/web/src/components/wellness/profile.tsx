import { useState } from "react";
import { useWellness } from "@/lib/wellness-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/wellness/ui/card";
import { Button } from "@/components/wellness/ui/button";
import { Input } from "@/components/wellness/ui/input";
import { cn } from "@/lib/utils";
import {
  User,
  Target,
  Trophy,
  Flame,
  Wind,
  Dumbbell,
  Plus,
  X,
  Check,
} from "lucide-react";

const goalSuggestions = [
  "Reduce stress",
  "Better sleep",
  "Stay active",
  "Build strength",
  "Practice mindfulness",
  "Improve mood",
  "Lose weight",
  "Gain muscle",
  "More energy",
  "Mental clarity",
];

export function Profile() {
  const { user, setUser } = useWellness();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user.goals);
  const [customGoal, setCustomGoal] = useState("");

  const handleSave = () => {
    setUser({
      ...user,
      name,
      goals: selectedGoals,
    });
    setIsEditing(false);
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals([...selectedGoals, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-lg">
          Manage your wellness journey and track your achievements.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Your Profile</CardTitle>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                  setSelectedGoals(user.goals);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-xl font-semibold"
                />
              ) : (
                <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
              )}
              <p className="text-muted-foreground">Wellness Explorer</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-wellness-mood/10 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-wellness-mood" />
              </div>
              <p className="text-2xl font-bold text-foreground">{user.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Wind className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {user.totalMeditations}
              </p>
              <p className="text-sm text-muted-foreground">Meditations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-wellness-energy/10 flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="w-6 h-6 text-wellness-energy" />
              </div>
              <p className="text-2xl font-bold text-foreground">{user.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Workouts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="w-5 h-5 text-primary" />
            Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex flex-wrap gap-2">
                {goalSuggestions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      selectedGoals.includes(goal)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    type="button"
                  >
                    {goal}
                    {selectedGoals.includes(goal) && (
                      <X className="w-3 h-3 ml-2 inline" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom goal..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomGoal()}
                />
                <Button onClick={addCustomGoal} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {selectedGoals.filter((g) => !goalSuggestions.includes(g)).length >
                0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Custom goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGoals
                      .filter((g) => !goalSuggestions.includes(g))
                      .map((goal) => (
                        <button
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                          type="button"
                        >
                          {goal}
                          <X className="w-3 h-3 ml-2 inline" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-wrap gap-3">
              {user.goals.map((goal, index) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  {goal}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="w-5 h-5 text-wellness-energy" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={cn(
                "p-4 rounded-xl text-center transition-all",
                user.streak >= 7
                  ? "bg-wellness-mood/10 border-2 border-wellness-mood"
                  : "bg-secondary/50 opacity-50"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-wellness-mood/20 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-wellness-mood" />
              </div>
              <p className="font-medium text-foreground text-sm">Week Warrior</p>
              <p className="text-xs text-muted-foreground">7-day streak</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl text-center transition-all",
                user.totalMeditations >= 10
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-secondary/50 opacity-50"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                <Wind className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-foreground text-sm">Zen Master</p>
              <p className="text-xs text-muted-foreground">10 meditations</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl text-center transition-all",
                user.totalWorkouts >= 5
                  ? "bg-wellness-energy/10 border-2 border-wellness-energy"
                  : "bg-secondary/50 opacity-50"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-wellness-energy/20 flex items-center justify-center mx-auto mb-2">
                <Dumbbell className="w-6 h-6 text-wellness-energy" />
              </div>
              <p className="font-medium text-foreground text-sm">Fitness Fan</p>
              <p className="text-xs text-muted-foreground">5 workouts</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl text-center transition-all",
                user.totalMeditations >= 20 && user.totalWorkouts >= 10
                  ? "bg-wellness-sleep/10 border-2 border-wellness-sleep"
                  : "bg-secondary/50 opacity-50"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-wellness-sleep/20 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-wellness-sleep" />
              </div>
              <p className="font-medium text-foreground text-sm">Wellness Pro</p>
              <p className="text-xs text-muted-foreground">20 med + 10 workouts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your wellness data is stored locally on this device. Connect a
            database for cloud sync and backup.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const data = localStorage.getItem("wellness-data");
                if (data) {
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "serenity-backup.json";
                  a.click();
                }
              }}
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive bg-transparent"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to clear all data? This cannot be undone."
                  )
                ) {
                  localStorage.removeItem("wellness-data");
                  window.location.reload();
                }
              }}
            >
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
