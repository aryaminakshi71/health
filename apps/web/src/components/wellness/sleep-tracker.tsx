import { useState } from "react";
import { useWellness } from "@/lib/wellness-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/wellness/ui/card";
import { Button } from "@/components/wellness/ui/button";
import { Input } from "@/components/wellness/ui/input";
import { Textarea } from "@/components/wellness/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Moon,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Bed,
  AlarmClock,
  Sparkles,
} from "lucide-react";

const qualityOptions = [
  { value: 1, label: "Very Poor", description: "Barely slept" },
  { value: 2, label: "Poor", description: "Restless night" },
  { value: 3, label: "Fair", description: "Okay sleep" },
  { value: 4, label: "Good", description: "Rested well" },
  { value: 5, label: "Excellent", description: "Best sleep" },
];

const sleepTips = [
  {
    title: "Consistent Schedule",
    description: "Go to bed and wake up at the same time every day.",
    icon: Clock,
  },
  {
    title: "Limit Screen Time",
    description: "Avoid screens 1 hour before bed to improve sleep quality.",
    icon: Moon,
  },
  {
    title: "Cool Environment",
    description: "Keep your bedroom temperature between 65-68°F (18-20°C).",
    icon: Sparkles,
  },
  {
    title: "Relaxation Routine",
    description: "Try meditation or reading before bed to wind down.",
    icon: Star,
  },
];

export function SleepTracker() {
  const { sleepEntries, addSleepEntry } = useWellness();
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const calculateDuration = (bed: string, wake: string) => {
    const [bedHour, bedMin] = bed.split(":").map(Number);
    const [wakeHour, wakeMin] = wake.split(":").map(Number);

    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;

    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return (wakeMinutes - bedMinutes) / 60;
  };

  const handleSubmit = () => {
    const duration = calculateDuration(bedtime, wakeTime);

    addSleepEntry({
      date: new Date().toISOString().split("T")[0],
      bedtime,
      wakeTime,
      quality,
      duration: Math.round(duration * 10) / 10,
      notes,
    });

    setNotes("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const recentEntries = sleepEntries.slice(0, 7);
  const averageQuality =
    recentEntries.length > 0
      ? (
          recentEntries.reduce((acc, e) => acc + e.quality, 0) /
          recentEntries.length
        ).toFixed(1)
      : "N/A";
  const averageDuration =
    recentEntries.length > 0
      ? (
          recentEntries.reduce((acc, e) => acc + e.duration, 0) /
          recentEntries.length
        ).toFixed(1)
      : "N/A";

  const currentDuration = calculateDuration(bedtime, wakeTime);
  const durationStatus =
    currentDuration >= 7 && currentDuration <= 9
      ? "Optimal"
      : currentDuration < 7
        ? "Too short"
        : "Consider less";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Sleep Tracking</h1>
        <p className="text-muted-foreground text-lg">
          Quality sleep is the foundation of good health. Track your rest and
          build better habits.
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium animate-in fade-in slide-in-from-top-2">
          Sleep entry saved successfully!
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-sleep/10 flex items-center justify-center">
              <Moon className="w-5 h-5 text-wellness-sleep" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {sleepEntries.length}
              </p>
              <p className="text-sm text-muted-foreground">Nights tracked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{averageDuration}h</p>
              <p className="text-sm text-muted-foreground">Avg duration</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-energy/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-wellness-energy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{averageQuality}</p>
              <p className="text-sm text-muted-foreground">Avg quality</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Log Last Night&apos;s Sleep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-wellness-sleep" />
                  Bedtime
                </label>
                <Input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <AlarmClock className="w-4 h-4 text-wellness-energy" />
                  Wake time
                </label>
                <Input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-wellness-sleep/5 border border-wellness-sleep/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total sleep</p>
                  <p className="text-2xl font-bold text-foreground">
                    {currentDuration.toFixed(1)} hours
                  </p>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    durationStatus === "Optimal"
                      ? "bg-primary/10 text-primary"
                      : "bg-wellness-energy/10 text-wellness-energy"
                  )}
                >
                  {durationStatus}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                How was your sleep quality?
              </p>
              <div className="grid grid-cols-5 gap-2">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuality(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                      quality === option.value
                        ? "bg-wellness-sleep/10 ring-2 ring-wellness-sleep"
                        : "hover:bg-secondary"
                    )}
                    type="button"
                  >
                    <div className="flex">
                      {[...Array(option.value)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            quality === option.value
                              ? "text-wellness-sleep fill-wellness-sleep"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium text-center",
                        quality === option.value
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
              <p className="text-sm font-medium text-foreground mb-3">
                Any notes about your sleep?
              </p>
              <Textarea
                placeholder="Dreams, interruptions, how you feel..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Save Sleep Entry
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Recent Nights</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEntries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sleep entries yet. Start tracking!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentEntries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-secondary/50 border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              {entry.duration}h sleep
                            </p>
                            <div className="flex">
                              {[...Array(entry.quality)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 text-wellness-sleep fill-wellness-sleep"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>
                            {entry.bedtime} - {entry.wakeTime}
                          </p>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                Sleep Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sleepTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-wellness-sleep/10 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-4 h-4 text-wellness-sleep" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            This Week&apos;s Sleep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {[...Array(7)].map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const dateStr = date.toISOString().split("T")[0];
              const entry = sleepEntries.find((e) => e.date === dateStr);
              const height = entry ? (entry.duration / 10) * 100 : 0;
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-24 bg-secondary rounded-lg relative overflow-hidden">
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500",
                        entry ? "bg-wellness-sleep" : "bg-muted"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{dayName}</span>
                  {entry && (
                    <span className="text-xs font-medium text-foreground">
                      {entry.duration}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Goal: 7-9 hours of sleep per night for optimal health
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
