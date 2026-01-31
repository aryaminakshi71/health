import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/modules/suraksha-web-portal")({
  component: SurakshaWebPortalModule,
});

function SurakshaWebPortalModule() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Suraksha Web Portal Module</h2>
        <p className="text-sm text-gray-600">
          Archive path: `archive/suraksha-platform/web-portal`.
        </p>
      </div>

      <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 text-purple-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/70 text-purple-700 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Archive folder is empty</p>
            <p className="text-sm opacity-80">
              No source files found to migrate. Add the web portal code here and
              I can wire it in.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reserved Module Shell</h3>
            <p className="text-sm text-gray-500">
              Routing and module entry are created and ready.
            </p>
          </div>
        </div>
      </div>

      <Link
        to="/modules"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Back to Modules
      </Link>
    </div>
  );
}
