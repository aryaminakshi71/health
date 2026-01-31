import { createFileRoute } from "@tanstack/react-router";
import { AppWrapper } from "@/components/wellness/app-wrapper";
import { Meditation } from "@/components/wellness/meditation";

export const Route = createFileRoute("/wellness/meditate")({
  component: MeditationRoute,
});

function MeditationRoute() {
  return (
    <AppWrapper>
      <Meditation />
    </AppWrapper>
  );
}
