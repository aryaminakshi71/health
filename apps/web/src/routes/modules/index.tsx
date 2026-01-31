import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Activity,
  Hospital,
  HeartPulse,
  Shield,
  Users,
} from "lucide-react";

const modules = [
  {
    title: "Wellness",
    description: "Mental health, meditation, fitness, mood, sleep",
    to: "/wellness",
    status: "Live",
    icon: HeartPulse,
    color: "bg-emerald-50 text-emerald-700",
    highlights: [
      "Personalized dashboard",
      "Mood, meditation, fitness, sleep tracking",
      "Local data storage and profile goals",
    ],
  },
  {
    title: "Healthcare Hub",
    description: "Unified platform modules from legacy healthcare hub",
    to: "/modules/healthcare-hub",
    status: "Integrated",
    icon: Hospital,
    color: "bg-blue-50 text-blue-700",
    highlights: [
      "ERP-style module catalog",
      "Operational dashboards",
      "Finance, analytics, security, automation",
    ],
  },
  {
    title: "Hospital EHR",
    description: "Clinical operations from legacy hospital EHR",
    to: "/modules/hospital-ehr",
    status: "Mapped",
    icon: Activity,
    color: "bg-indigo-50 text-indigo-700",
    highlights: [
      "OPD/IPD, lab, radiology, pharmacy",
      "Appointments, billing, reports",
      "Critical care and emergency flows",
    ],
  },
  {
    title: "Suraksha ASHA App",
    description: "Community health worker workflows (archive)",
    to: "/modules/suraksha-asha",
    status: "Archive empty",
    icon: Users,
    color: "bg-amber-50 text-amber-700",
    highlights: [
      "Directory exists but has no source files",
      "Ready for migration once code is added",
      "Reserved module route and shell",
    ],
  },
  {
    title: "Suraksha Patient App",
    description: "Patient-facing app (archive)",
    to: "/modules/suraksha-patient",
    status: "Archive empty",
    icon: HeartPulse,
    color: "bg-rose-50 text-rose-700",
    highlights: [
      "Directory exists but has no source files",
      "Ready for migration once code is added",
      "Reserved module route and shell",
    ],
  },
  {
    title: "Suraksha Web Portal",
    description: "Admin web portal (archive)",
    to: "/modules/suraksha-web-portal",
    status: "Archive empty",
    icon: Shield,
    color: "bg-purple-50 text-purple-700",
    highlights: [
      "Directory exists but has no source files",
      "Ready for migration once code is added",
      "Reserved module route and shell",
    ],
  },
];

export const Route = createFileRoute("/modules/")({
  component: ModulesIndex,
});

function ModulesIndex() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
        <p className="text-sm text-gray-600">
          All active and archived modules connected to the health platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <div
            key={module.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${module.color}`}
                >
                  <module.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500">{module.description}</p>
                </div>
              </div>
              <span className="text-xs font-medium rounded-full bg-gray-100 text-gray-700 px-2.5 py-1">
                {module.status}
              </span>
            </div>

            <ul className="text-sm text-gray-600 space-y-1">
              {module.highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>

            <div>
              <Link
                to={module.to}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Open module
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
