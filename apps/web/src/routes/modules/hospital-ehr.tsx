import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  Flame,
  FlaskConical,
  HeartPulse,
  Hospital,
  Siren,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Patients Today",
    value: "248",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Bed Occupancy",
    value: "78%",
    change: "+5%",
    trend: "up",
    icon: Hospital,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Today Revenue",
    value: "INR 245k",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "bg-amber-50 text-amber-700",
  },
  {
    title: "OPD Queue",
    value: "24",
    change: "-8%",
    trend: "down",
    icon: Clock,
    color: "bg-purple-50 text-purple-700",
  },
];

const emergencyStats = [
  { label: "Emergency", value: "3" },
  { label: "ICU", value: "8" },
  { label: "NICU", value: "4" },
  { label: "Surgeries", value: "6" },
];

const quickActions = [
  { label: "Register Patient", to: "/modules/hospital-ehr/patients/register", icon: UserPlus },
  { label: "OPD Queue", to: "/modules/hospital-ehr/opd/queue", icon: Users },
  { label: "New Admission", to: "/modules/hospital-ehr/ipd/admissions", icon: Hospital },
  { label: "Book Appointment", to: "/modules/hospital-ehr/appointments/new", icon: Calendar },
  { label: "Lab Order", to: "/modules/hospital-ehr/lab/tests", icon: FlaskConical },
  { label: "Billing", to: "/modules/hospital-ehr/billing/invoices", icon: DollarSign },
  { label: "Pharmacy", to: "/modules/hospital-ehr/pharmacy", icon: Activity },
  { label: "Emergency", to: "/modules/hospital-ehr/emergency", icon: Siren },
];

const alerts = [
  { type: "critical", title: "3 Emergency Cases", message: "Requires immediate attention" },
  { type: "warning", title: "ICU Bed Alert", message: "Only 2 ICU beds available" },
  { type: "info", title: "Lab Reports Ready", message: "12 reports pending collection" },
  { type: "success", title: "Surgery Completed", message: "Patient P-2024-089" },
];

const revenueData = [
  { name: "Mon", opd: 45, ipd: 125, pharmacy: 28, lab: 35 },
  { name: "Tue", opd: 52, ipd: 138, pharmacy: 32, lab: 42 },
  { name: "Wed", opd: 48, ipd: 142, pharmacy: 29, lab: 38 },
  { name: "Thu", opd: 61, ipd: 156, pharmacy: 35, lab: 48 },
  { name: "Fri", opd: 55, ipd: 148, pharmacy: 31, lab: 44 },
  { name: "Sat", opd: 38, ipd: 98, pharmacy: 24, lab: 32 },
  { name: "Sun", opd: 25, ipd: 72, pharmacy: 18, lab: 22 },
];

const bedData = [
  { name: "Occupied", value: 68, color: "bg-red-500" },
  { name: "Available", value: 22, color: "bg-emerald-500" },
  { name: "Maintenance", value: 6, color: "bg-amber-500" },
  { name: "Reserved", value: 4, color: "bg-blue-500" },
];

const departmentData = [
  { name: "Emergency", patients: 45, color: "bg-red-500" },
  { name: "OPD", patients: 128, color: "bg-blue-500" },
  { name: "IPD", patients: 67, color: "bg-purple-500" },
  { name: "ICU/CCU", patients: 18, color: "bg-orange-500" },
  { name: "Surgery", patients: 12, color: "bg-cyan-500" },
];

const recentPatients = [
  { id: "P-2024-001", name: "Rahul Sharma", dept: "Cardiology", status: "Admitted" },
  { id: "P-2024-002", name: "Priya Gupta", dept: "Gynecology", status: "OPD" },
  { id: "P-2024-003", name: "Amit Kumar", dept: "Orthopedics", status: "Emergency" },
  { id: "P-2024-004", name: "Sneha Patel", dept: "Neurology", status: "Discharged" },
  { id: "P-2024-005", name: "Vikram Singh", dept: "General", status: "Lab" },
];

const appointments = [
  { time: "09:00 AM", patient: "Rajesh Kumar", doctor: "Dr. Sharma", status: "Completed" },
  { time: "09:30 AM", patient: "Meera Devi", doctor: "Dr. Gupta", status: "Completed" },
  { time: "10:00 AM", patient: "Suresh Yadav", doctor: "Dr. Singh", status: "In Progress" },
  { time: "10:30 AM", patient: "Anita Sharma", doctor: "Dr. Patel", status: "Waiting" },
  { time: "11:00 AM", patient: "Mohan Lal", doctor: "Dr. Verma", status: "Scheduled" },
];

export const Route = createFileRoute("/modules/hospital-ehr")({
  component: HospitalEhrModule,
});

function HospitalEhrModule() {
  const maxRevenue = Math.max(
    1,
    ...revenueData.map(
      (day) => day.opd + day.ipd + day.pharmacy + day.lab
    )
  );
  const maxDepartment = Math.max(...departmentData.map((d) => d.patients), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Hospital EHR
          </span>
          <span className="text-xs text-gray-400">Archive source: hospital-ehr</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Hospital EHR Dashboard</h2>
        <p className="text-sm text-gray-600">
          Core clinical operations mapped from the legacy EHR frontend.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <Siren className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Emergency Status</h3>
              <p className="text-sm text-white/80">
                Active cases and critical care capacity updates
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {emergencyStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-white/15 px-4 py-2 text-center"
              >
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-[11px] text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  stat.trend === "up" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <Link
            to="/modules/hospital-ehr/opd"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-center text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                <action.icon className="h-4 w-4" />
              </div>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.title}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                alert.type === "critical"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : alert.type === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : alert.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-xs opacity-80">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bed Occupancy</h3>
              <p className="text-sm text-gray-500">Current allocation</p>
            </div>
            <ClipboardList className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 space-y-3">
            {bedData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Weekly totals by department</p>
            </div>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-6 flex items-end gap-3">
            {revenueData.map((day) => {
              const total = day.opd + day.ipd + day.pharmacy + day.lab;
              const height = Math.round((total / maxRevenue) * 100);
              return (
                <div key={day.name} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end rounded-lg bg-gray-100">
                    <div
                      className="flex w-full flex-col justify-end rounded-lg"
                      style={{ height: `${height}%` }}
                    >
                      <div
                        className="bg-blue-500"
                        style={{ height: `${(day.opd / total) * 100}%` }}
                      />
                      <div
                        className="bg-purple-500"
                        style={{ height: `${(day.ipd / total) * 100}%` }}
                      />
                      <div
                        className="bg-emerald-500"
                        style={{ height: `${(day.pharmacy / total) * 100}%` }}
                      />
                      <div
                        className="bg-amber-500"
                        style={{ height: `${(day.lab / total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{day.name}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> OPD
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> IPD
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pharmacy
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Lab
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
              <p className="text-sm text-gray-500">Patient load</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 space-y-3">
            {departmentData.map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{dept.name}</span>
                  <span>{dept.patients}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${dept.color}`}
                    style={{ width: `${(dept.patients / maxDepartment) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <p className="text-sm text-gray-500">Latest check-ins</p>
            </div>
            <Link
              to="/modules/hospital-ehr/patients"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-semibold">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.dept}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {patient.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today Appointments</h3>
              <p className="text-sm text-gray-500">Schedule snapshot</p>
            </div>
            <Link
              to="/modules/hospital-ehr/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {appointments.map((appt) => (
              <div key={`${appt.time}-${appt.patient}`} className="flex items-center gap-4 p-4">
                <div className="w-16 text-xs font-semibold text-gray-600">
                  {appt.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{appt.patient}</p>
                  <p className="text-xs text-gray-500">{appt.doctor}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/modules"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Modules
        </Link>
        <Link
          to="/modules/hospital-ehr/opd"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open OPD Module
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          to="/modules/hospital-ehr/ipd"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Open IPD Module
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
