import { createFileRoute } from "@tanstack/react-router";
import { AppWrapper } from "@/components/wellness/app-wrapper";
import { SleepTracker } from "@/components/wellness/sleep-tracker";

export const Route = createFileRoute("/wellness/sleep")({
  component: SleepRoute,
});

function SleepRoute() {
  return (
    <AppWrapper>
      <SleepTracker />
    </AppWrapper>
  );
}
