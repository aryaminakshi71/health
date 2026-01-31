import { createFileRoute } from "@tanstack/react-router";
import { AppWrapper } from "@/components/wellness/app-wrapper";
import { FitnessTracker } from "@/components/wellness/fitness-tracker";

export const Route = createFileRoute("/wellness/fitness")({
  component: FitnessRoute,
});

function FitnessRoute() {
  return (
    <AppWrapper>
      <FitnessTracker />
    </AppWrapper>
  );
}
