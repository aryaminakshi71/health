import { createFileRoute } from "@tanstack/react-router";
import { AppWrapper } from "@/components/wellness/app-wrapper";
import { Profile } from "@/components/wellness/profile";

export const Route = createFileRoute("/wellness/profile")({
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <AppWrapper>
      <Profile />
    </AppWrapper>
  );
}
