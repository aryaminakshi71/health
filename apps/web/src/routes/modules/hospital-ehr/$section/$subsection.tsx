import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute(
  "/modules/hospital-ehr/$section/$subsection"
)({
  component: HospitalEhrSubsection,
});

function HospitalEhrSubsection() {
  const { section, subsection } = Route.useParams();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Hospital EHR</p>
        <h2 className="text-2xl font-bold text-gray-900">
          {section} / {subsection}
        </h2>
        <p className="text-sm text-gray-600">
          Placeholder for the archived screen at
          `archive/legacy-frontends/hospital-ehr/frontend/src/app/{section}/{subsection}`.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Screen Mapping</h3>
            <p className="text-sm text-gray-500">
              This route is reserved for a full migration of the legacy EHR UI.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/modules/hospital-ehr/${section}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to {section}
        </Link>
        <Link
          to="/modules/hospital-ehr"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Hospital EHR
        </Link>
      </div>
    </div>
  );
}
