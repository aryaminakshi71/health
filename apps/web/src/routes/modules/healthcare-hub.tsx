import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  Building2,
  Calendar,
  DollarSign,
  HeartPulse,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";

const stats = [
  { label: "Active Clinics", value: "42", delta: "+12%" },
  { label: "Open Tickets", value: "18", delta: "-4%" },
  { label: "Monthly Revenue", value: "INR 4.2M", delta: "+9%" },
  { label: "System Health", value: "99.1%", delta: "+0.3%" },
];

const moduleCards = [
  {
    title: "Healthcare",
    description: "Patient management, EHR, telemedicine",
    icon: HeartPulse,
    to: "/patients",
    color: "bg-red-50 text-red-700",
  },
  {
    title: "Finance and Billing",
    description: "Invoicing, payments, insurance",
    icon: DollarSign,
    to: "/billing",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Analytics",
    description: "Realtime dashboards and insights",
    icon: BarChart3,
    to: "/analytics",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Operations",
    description: "Staff, scheduling, facility operations",
    icon: Building2,
    to: "/appointments",
    color: "bg-purple-50 text-purple-700",
  },
  {
    title: "AI Assistant",
    description: "Automation and clinical copilots",
    icon: Brain,
    to: "/modules/healthcare-hub",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    title: "Communication Hub",
    description: "Messaging, outreach, notifications",
    icon: MessageSquare,
    to: "/modules/healthcare-hub",
    color: "bg-orange-50 text-orange-700",
  },
  {
    title: "Security",
    description: "Compliance, audit logs, policies",
    icon: ShieldCheck,
    to: "/compliance",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    title: "Workflow Automation",
    description: "Custom workflows and triggers",
    icon: Zap,
    to: "/modules/healthcare-hub",
    color: "bg-cyan-50 text-cyan-700",
  },
];

const recentActivity = [
  {
    title: "New appointment scheduled",
    description: "Dr. Sharma with patient P-2392",
    time: "5 minutes ago",
  },
  {
    title: "Payment received",
    description: "Invoice INV-4821 paid",
    time: "32 minutes ago",
  },
  {
    title: "Lab report ready",
    description: "Blood panel for patient P-3181",
    time: "1 hour ago",
  },
  {
    title: "User role updated",
    description: "Nurse admin permissions changed",
    time: "2 hours ago",
  },
];

const quickActions = [
  { label: "Add Patient", to: "/patients", icon: Users },
  { label: "Create Invoice", to: "/billing", icon: DollarSign },
  { label: "View Reports", to: "/analytics", icon: Activity },
  { label: "System Settings", to: "/compliance", icon: Stethoscope },
];

export const Route = createFileRoute("/modules/healthcare-hub")({
  component: HealthcareHubModule,
});

function HealthcareHubModule() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Integrated
          </span>
          <span className="text-xs text-gray-400">Archive source: healthcare-hub</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Healthcare Hub Module</h2>
        <p className="text-sm text-gray-600">
          Unified module catalog and operational dashboards from the legacy hub.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-emerald-600">{stat.delta} this month</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Module Catalog</h3>
            <p className="text-sm text-gray-500">
              Areas ported from the legacy Healthcare Hub dashboard.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {moduleCards.map((module) => (
            <Link
              key={module.title}
              to={module.to}
              className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 transition hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${module.color}`}
                  >
                    <module.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {module.title}
                    </h4>
                    <p className="text-xs text-gray-500">{module.description}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest updates across modules</p>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 space-y-4">
            {recentActivity.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-500">Shortcuts to common workflows</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <action.icon className="h-4 w-4 text-blue-600" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/healthcare-hub-dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open Healthcare Hub Dashboard
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          to="/modules"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Modules
        </Link>
      </div>
    </div>
  );
}
