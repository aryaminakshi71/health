import { createFileRoute } from "@tanstack/react-router";
import { AppWrapper } from "@/components/wellness/app-wrapper";
import { Dashboard } from "@/components/wellness/dashboard";

export const Route = createFileRoute("/wellness/")({
  component: WellnessDashboard,
});

function WellnessDashboard() {
  return (
    <AppWrapper>
      <Dashboard />
    </AppWrapper>
  );
}
