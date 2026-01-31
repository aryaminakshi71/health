import type { ReactNode } from "react";
import { WellnessProvider } from "@/lib/wellness-context";
import { Navigation } from "./navigation";

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <WellnessProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="lg:ml-64 pt-20 lg:pt-8 pb-24 lg:pb-8 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </WellnessProvider>
  );
}
