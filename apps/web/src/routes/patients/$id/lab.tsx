/**
 * Patient Lab Results Route
 */

import { createFileRoute } from '@tanstack/react-router';
import { LabResultViewer } from '../../../components/lab/lab-result-viewer';

export const Route = createFileRoute('/patients/$id/lab')({
  component: PatientLabResults,
});

function PatientLabResults() {
  const { id } = Route.useParams();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Lab Results</h2>
        <p className="mt-1 text-sm text-gray-500">
          View patient lab results and trends
        </p>
      </div>

      <LabResultViewer patientId={id} />
    </div>
  );
}
