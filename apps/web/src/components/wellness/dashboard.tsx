import { Link, useNavigate } from "@tanstack/react-router";
import { useWellness } from "@/lib/wellness-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/wellness/ui/card";
import { Button } from "@/components/wellness/ui/button";
import {
  Heart,
  Wind,
  Dumbbell,
  Moon,
  TrendingUp,
  Flame,
  Target,
  Sparkles,
} from "lucide-react";

const moodEmojis = ["Awful", "Bad", "Okay", "Good", "Great"];

export function Dashboard() {
  const { user, moodEntries, meditationSessions, workoutEntries, sleepEntries } =
    useWellness();
  const navigate = useNavigate();

  const latestMood = moodEntries[0];
  const latestSleep = sleepEntries[0];
  const todaysMeditations = meditationSessions.filter(
    (s) => s.date === new Date().toISOString().split("T")[0]
  ).length;
  const todaysWorkouts = workoutEntries.filter(
    (w) => w.date === new Date().toISOString().split("T")[0]
  ).length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">
          {greeting()}, {user.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          How are you feeling today? Let&apos;s check in on your wellness journey.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-wellness-mood/10 border-wellness-mood/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wellness-mood/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-wellness-mood" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{user.streak}</p>
                <p className="text-sm text-muted-foreground">Day streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wind className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {user.totalMeditations}
                </p>
                <p className="text-sm text-muted-foreground">Meditations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wellness-energy/10 border-wellness-energy/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wellness-energy/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-wellness-energy" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {user.totalWorkouts}
                </p>
                <p className="text-sm text-muted-foreground">Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wellness-sleep/10 border-wellness-sleep/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wellness-sleep/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-wellness-sleep" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {user.goals.length}
                </p>
                <p className="text-sm text-muted-foreground">Active goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/wellness/mood" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-wellness-mood/40 hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-wellness-mood/10 flex items-center justify-center group-hover:bg-wellness-mood/20 transition-colors">
                <Heart className="w-7 h-7 text-wellness-mood" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Log Mood</h3>
                <p className="text-sm text-muted-foreground">
                  Track how you&apos;re feeling
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/wellness/meditate" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Wind className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Meditate</h3>
                <p className="text-sm text-muted-foreground">Find your calm</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/wellness/fitness" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-wellness-energy/40 hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-wellness-energy/10 flex items-center justify-center group-hover:bg-wellness-energy/20 transition-colors">
                <Dumbbell className="w-7 h-7 text-wellness-energy" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Workout</h3>
                <p className="text-sm text-muted-foreground">Get moving today</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/wellness/sleep" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-wellness-sleep/40 hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-wellness-sleep/10 flex items-center justify-center group-hover:bg-wellness-sleep/20 transition-colors">
                <Moon className="w-7 h-7 text-wellness-sleep" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Sleep</h3>
                <p className="text-sm text-muted-foreground">Log your rest</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Today&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-wellness-mood" />
                <span className="text-foreground">Mood</span>
              </div>
              <span className="font-medium text-foreground">
                {latestMood ? moodEmojis[latestMood.mood - 1] : "Not logged"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Wind className="w-5 h-5 text-primary" />
                <span className="text-foreground">Meditations</span>
              </div>
              <span className="font-medium text-foreground">
                {todaysMeditations} session{todaysMeditations !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-wellness-energy" />
                <span className="text-foreground">Workouts</span>
              </div>
              <span className="font-medium text-foreground">
                {todaysWorkouts} workout{todaysWorkouts !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-wellness-sleep" />
                <span className="text-foreground">Sleep</span>
              </div>
              <span className="font-medium text-foreground">
                {latestSleep ? `${latestSleep.duration}h` : "Not logged"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary mb-1">Great progress!</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ve maintained a {user.streak}-day streak. Keep up the
                momentum!
              </p>
            </div>
            <div className="p-4 rounded-xl bg-wellness-energy/5 border border-wellness-energy/10">
              <p className="text-sm font-medium text-wellness-energy mb-1">
                Fitness goal
              </p>
              <p className="text-sm text-muted-foreground">
                You&apos;re {3 - todaysWorkouts > 0 ? 3 - todaysWorkouts : 0} workouts
                away from your weekly target.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-wellness-sleep/5 border border-wellness-sleep/10">
              <p className="text-sm font-medium text-wellness-sleep mb-1">
                Sleep quality
              </p>
              <p className="text-sm text-muted-foreground">
                Your average sleep quality this week is looking good. Try to
                maintain consistent bedtimes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Your Goals</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/wellness/profile" })}
          >
            Edit Goals
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
