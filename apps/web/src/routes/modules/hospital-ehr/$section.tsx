import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

const sectionMap = {
  opd: {
    title: "OPD",
    subsections: ["register", "queue", "consultation", "referral", "prescription"],
  },
  ipd: {
    title: "IPD",
    subsections: ["admissions", "wards", "beds", "transfer", "discharge"],
  },
  appointments: {
    title: "Appointments",
    subsections: ["today", "calendar", "new"],
  },
  patients: {
    title: "Patients",
    subsections: ["search", "register", "history", "medical-records"],
  },
  lab: {
    title: "Lab",
    subsections: ["tests", "reports"],
  },
  radiology: {
    title: "Radiology",
    subsections: ["xray", "ct", "mri", "ultrasound"],
  },
  pharmacy: {
    title: "Pharmacy",
    subsections: ["inventory", "prescriptions", "drug-interactions"],
  },
  billing: {
    title: "Billing",
    subsections: ["invoices", "payments", "insurance"],
  },
  emergency: {
    title: "Emergency",
    subsections: [],
  },
  ot: {
    title: "Operating Theater",
    subsections: ["booking", "schedule"],
  },
  analytics: {
    title: "Analytics",
    subsections: [],
  },
};

export const Route = createFileRoute("/modules/hospital-ehr/$section")({
  component: HospitalEhrSection,
});

function HospitalEhrSection() {
  const { section } = Route.useParams();
  const info = sectionMap[section as keyof typeof sectionMap];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Hospital EHR</p>
        <h2 className="text-2xl font-bold text-gray-900">
          {info?.title ?? section}
        </h2>
        <p className="text-sm text-gray-600">
          Placeholder for the legacy screen. Use the links below to navigate to
          mapped subsections.
        </p>
      </div>

      {info?.subsections.length ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subsections</h3>
              <p className="text-sm text-gray-500">
                Routes mapped from the legacy EHR application.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {info.subsections.map((subsection) => (
              <Link
                key={subsection}
                to={`/modules/hospital-ehr/${section}/${subsection}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {subsection.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            No subsections are mapped for this area yet.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/modules/hospital-ehr"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Hospital EHR
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
