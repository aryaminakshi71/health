import { useState } from "react";
import { useWellness } from "@/lib/wellness-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/wellness/ui/card";
import { Button } from "@/components/wellness/ui/button";
import { Textarea } from "@/components/wellness/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Heart,
  TrendingUp,
  Calendar,
  Frown,
  Meh,
  Smile,
  Laugh,
  CloudRain,
} from "lucide-react";

const moodOptions = [
  { value: 1, label: "Awful", icon: CloudRain, color: "text-red-500" },
  { value: 2, label: "Bad", icon: Frown, color: "text-orange-500" },
  { value: 3, label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: 4, label: "Good", icon: Smile, color: "text-lime-500" },
  { value: 5, label: "Great", icon: Laugh, color: "text-green-500" },
];

const energyLevels = [
  { value: 1, label: "Exhausted" },
  { value: 2, label: "Tired" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Energetic" },
  { value: 5, label: "Very Energetic" },
];

const commonFactors = [
  "Good sleep",
  "Exercise",
  "Work stress",
  "Social time",
  "Weather",
  "Diet",
  "Meditation",
  "Family",
  "Health",
  "Accomplishment",
];

export function MoodTracker() {
  const { moodEntries, addMoodEntry } = useWellness();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(3);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFactorToggle = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSubmit = () => {
    if (selectedMood === null) return;

    addMoodEntry({
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood,
      energy: selectedEnergy,
      notes,
      factors: selectedFactors,
    });

    setSelectedMood(null);
    setSelectedEnergy(3);
    setSelectedFactors([]);
    setNotes("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getMoodIcon = (mood: number) => {
    const option = moodOptions.find((o) => o.value === mood);
    return option ? option.icon : Meh;
  };

  const getMoodColor = (mood: number) => {
    const option = moodOptions.find((o) => o.value === mood);
    return option ? option.color : "text-muted-foreground";
  };

  const recentEntries = moodEntries.slice(0, 7);
  const averageMood =
    recentEntries.length > 0
      ? (
          recentEntries.reduce((acc, e) => acc + e.mood, 0) / recentEntries.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Mood Tracking</h1>
        <p className="text-muted-foreground text-lg">
          Understanding your emotions is the first step to better mental health.
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium animate-in fade-in slide-in-from-top-2">
          Mood entry saved successfully!
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-mood/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-wellness-mood" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {moodEntries.length}
              </p>
              <p className="text-sm text-muted-foreground">Total entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{averageMood}</p>
              <p className="text-sm text-muted-foreground">Avg mood (7d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-energy/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-wellness-energy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {recentEntries.length}
              </p>
              <p className="text-sm text-muted-foreground">This week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">How are you feeling?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Select your mood</p>
              <div className="flex justify-between gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedMood(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all flex-1",
                      selectedMood === option.value
                        ? "bg-wellness-mood/10 ring-2 ring-wellness-mood"
                        : "hover:bg-secondary"
                    )}
                    type="button"
                  >
                    <option.icon
                      className={cn(
                        "w-8 h-8",
                        selectedMood === option.value
                          ? option.color
                          : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        selectedMood === option.value
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Energy level</p>
              <div className="flex gap-2">
                {energyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedEnergy(level.value)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                      selectedEnergy === level.value
                        ? "bg-wellness-energy text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    type="button"
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                What&apos;s affecting your mood?
              </p>
              <div className="flex flex-wrap gap-2">
                {commonFactors.map((factor) => (
                  <button
                    key={factor}
                    onClick={() => handleFactorToggle(factor)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-all",
                      selectedFactors.includes(factor)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    type="button"
                  >
                    {factor}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Any additional notes?
              </p>
              <Textarea
                placeholder="How was your day? What's on your mind?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={selectedMood === null}
              className="w-full"
              size="lg"
            >
              Save Entry
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No entries yet. Start tracking your mood!
              </p>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => {
                  const MoodIcon = getMoodIcon(entry.mood);
                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-secondary/50 border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <MoodIcon
                            className={cn("w-6 h-6", getMoodColor(entry.mood))}
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {moodOptions.find((o) => o.value === entry.mood)?.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-wellness-energy/10 text-wellness-energy">
                          Energy: {entry.energy}/5
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {entry.notes}
                        </p>
                      )}
                      {entry.factors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.factors.map((factor) => (
                            <span
                              key={factor}
                              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
