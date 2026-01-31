import { useEffect, useRef, useState } from "react";
import { useWellness } from "@/lib/wellness-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/wellness/ui/card";
import { Button } from "@/components/wellness/ui/button";
import { cn } from "@/lib/utils";
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Check,
  Clock,
  Sparkles,
  Moon,
  Heart,
  ChevronRight,
} from "lucide-react";

type MeditationType = "breathing" | "guided" | "mindfulness" | "sleep";

const meditationTypes = [
  {
    type: "breathing" as const,
    title: "Breathing Exercise",
    description: "Simple breathing techniques to calm your mind",
    duration: 5,
    icon: Wind,
    color: "text-primary",
    bgColor: "bg-primary/10",
    pattern: ["Breathe in... 4s", "Hold... 4s", "Breathe out... 4s", "Hold... 4s"],
  },
  {
    type: "guided" as const,
    title: "Guided Meditation",
    description: "Follow along with calming guidance",
    duration: 10,
    icon: Sparkles,
    color: "text-wellness-energy",
    bgColor: "bg-wellness-energy/10",
    pattern: [
      "Find a comfortable position...",
      "Close your eyes gently...",
      "Notice your breath...",
      "Let go of tension...",
      "You are safe and calm...",
    ],
  },
  {
    type: "mindfulness" as const,
    title: "Mindfulness",
    description: "Present moment awareness practice",
    duration: 15,
    icon: Heart,
    color: "text-wellness-mood",
    bgColor: "bg-wellness-mood/10",
    pattern: [
      "Notice the sounds around you...",
      "Feel your body in space...",
      "Observe your thoughts passing...",
      "Return to the present...",
    ],
  },
  {
    type: "sleep" as const,
    title: "Sleep Meditation",
    description: "Gentle relaxation for better sleep",
    duration: 20,
    icon: Moon,
    color: "text-wellness-sleep",
    bgColor: "bg-wellness-sleep/10",
    pattern: [
      "Relax your face muscles...",
      "Release shoulder tension...",
      "Let your arms grow heavy...",
      "Your body is sinking into softness...",
      "Drift into peaceful rest...",
    ],
  },
];

const durations = [3, 5, 10, 15, 20, 30];

export function Meditation() {
  const { meditationSessions, addMeditationSession, user } = useWellness();
  const [selectedType, setSelectedType] = useState<MeditationType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMeditation = meditationTypes.find((m) => m.type === selectedType);

  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const promptInterval = setInterval(() => {
        if (currentMeditation) {
          setCurrentPromptIndex((prev) =>
            prev >= currentMeditation.pattern.length - 1 ? 0 : prev + 1
          );
        }
      }, 15000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearInterval(promptInterval);
      };
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, timeRemaining, currentMeditation]);

  const startMeditation = () => {
    if (!selectedType) return;
    setTimeRemaining(selectedDuration * 60);
    setIsActive(true);
    setIsPaused(false);
    setCurrentPromptIndex(0);
  };

  const handleComplete = () => {
    setIsActive(false);
    setShowComplete(true);
    if (selectedType) {
      addMeditationSession({
        date: new Date().toISOString().split("T")[0],
        duration: selectedDuration,
        type: selectedType,
        completed: true,
      });
    }
  };

  const resetMeditation = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setShowComplete(false);
    setSelectedType(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const todaysSessions = meditationSessions.filter(
    (s) => s.date === new Date().toISOString().split("T")[0]
  );

  const totalMinutesToday = todaysSessions.reduce((acc, s) => acc + s.duration, 0);

  if (isActive || showComplete) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          {showComplete ? (
            <>
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Session Complete
                </h2>
                <p className="text-muted-foreground">
                  Great job! You completed a {selectedDuration} minute{" "}
                  {currentMeditation?.title.toLowerCase()}.
                </p>
              </div>
              <Button onClick={resetMeditation} size="lg" className="w-full">
                Done
              </Button>
            </>
          ) : (
            <>
              <div className="relative">
                <div
                  className={cn(
                    "w-48 h-48 rounded-full mx-auto flex items-center justify-center transition-all duration-1000",
                    currentMeditation?.bgColor,
                    !isPaused && "animate-pulse"
                  )}
                  style={{
                    animationDuration: "4s",
                  }}
                >
                  <div
                    className={cn(
                      "w-32 h-32 rounded-full flex items-center justify-center",
                      "bg-card shadow-lg"
                    )}
                  >
                    <span className="text-4xl font-light text-foreground">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              <p
                className={cn(
                  "text-xl font-medium animate-in fade-in duration-500",
                  currentMeditation?.color
                )}
              >
                {currentMeditation?.pattern[currentPromptIndex]}
              </p>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full bg-transparent"
                  onClick={resetMeditation}
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  className="w-20 h-20 rounded-full"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? (
                    <Play className="w-8 h-8 ml-1" />
                  ) : (
                    <Pause className="w-8 h-8" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full bg-transparent"
                  onClick={handleComplete}
                >
                  <Check className="w-6 h-6" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Meditation</h1>
        <p className="text-muted-foreground text-lg">
          Take a moment to breathe, relax, and find your inner calm.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wind className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {user.totalMeditations}
              </p>
              <p className="text-sm text-muted-foreground">Total sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-energy/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-wellness-energy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalMinutesToday}
              </p>
              <p className="text-sm text-muted-foreground">Minutes today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellness-mood/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-wellness-mood" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {todaysSessions.length}
              </p>
              <p className="text-sm text-muted-foreground">Today&apos;s sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Choose your practice
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {meditationTypes.map((meditation) => (
            <Card
              key={meditation.type}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                selectedType === meditation.type
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:border-primary/40"
              )}
              onClick={() => setSelectedType(meditation.type)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      meditation.bgColor
                    )}
                  >
                    <meditation.icon className={cn("w-6 h-6", meditation.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {meditation.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {meditation.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommended: {meditation.duration} min
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 transition-colors",
                      selectedType === meditation.type
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedType && (
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardHeader>
            <CardTitle className="text-foreground">Select duration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium transition-all",
                    selectedDuration === duration
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  type="button"
                >
                  {duration} min
                </button>
              ))}
            </div>
            <Button onClick={startMeditation} size="lg" className="w-full">
              <Play className="w-5 h-5 mr-2" />
              Start {currentMeditation?.title}
            </Button>
          </CardContent>
        </Card>
      )}

      {meditationSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meditationSessions.slice(0, 5).map((session) => {
                const sessionType = meditationTypes.find(
                  (m) => m.type === session.type
                );
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          sessionType?.bgColor
                        )}
                      >
                        {sessionType && (
                          <sessionType.icon
                            className={cn("w-5 h-5", sessionType.color)}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {sessionType?.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {session.duration} min
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
