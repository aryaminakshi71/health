import { createFileRoute } from "@tanstack/react-router";
import { AppWrapper } from "@/components/wellness/app-wrapper";
import { MoodTracker } from "@/components/wellness/mood-tracker";

export const Route = createFileRoute("/wellness/mood")({
  component: MoodRoute,
});

function MoodRoute() {
  return (
    <AppWrapper>
      <MoodTracker />
    </AppWrapper>
  );
}
