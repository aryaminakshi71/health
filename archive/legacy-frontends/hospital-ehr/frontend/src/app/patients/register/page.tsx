import PatientRegistrationForm from '@/components/PatientRegistrationForm';

export default function RegisterPatientPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
                <p className="text-gray-600">Enter new patient details into the EHR system.</p>
            </div>
            <PatientRegistrationForm />
        </div>
    );
}
