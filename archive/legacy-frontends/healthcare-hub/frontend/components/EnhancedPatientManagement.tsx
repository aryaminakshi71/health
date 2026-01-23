"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  User,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Video,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  Stethoscope,
  Pill,
  Thermometer,
  Droplets,
  Brain,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Mic,
  Camera,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  HardDrive,
  Network,
  Wifi,
  Bluetooth,
  Signal,
  Battery,
  Power,
  Zap as ZapIcon,
  Sparkles,
  Rocket,
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: 'active' | 'inactive' | 'critical';
  lastVisit: string;
  nextAppointment: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: {
    conditions: string[];
    surgeries: string[];
    medications: string[];
    allergies: string[];
    familyHistory: string[];
  };
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    weight: number;
    height: number;
    bmi: number;
  };
  labResults: {
    cholesterol: number;
    glucose: number;
    hemoglobin: number;
    lastUpdated: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    expirationDate: string;
  };
  notes: string[];
  documents: {
    id: string;
    name: string;
    type: 'lab_report' | 'imaging' | 'prescription' | 'consent_form';
    date: string;
    size: string;
  }[];
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'consultation' | 'emergency' | 'follow-up' | 'surgery' | 'telemedicine';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  duration: number;
  room: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  telemedicineLink?: string;
}

interface TelemedicineSession {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
  recordingUrl?: string;
  transcript?: string;
}

export default function EnhancedPatientManagement() {
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [telemedicineSessions, setTelemedicineSessions] = useState<TelemedicineSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: 'patient-1',
        name: 'John Smith',
        age: 45,
        gender: 'Male',
        status: 'active',
        lastVisit: '2024-01-15',
        nextAppointment: '2024-02-20',
        phone: '+1-555-0123',
        email: 'john.smith@email.com',
        address: '123 Main St, City, State 12345',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1-555-0124',
          relationship: 'Spouse'
        },
        medicalHistory: {
          conditions: ['Hypertension', 'Type 2 Diabetes'],
          surgeries: ['Appendectomy (2010)'],
          medications: ['Metformin', 'Lisinopril'],
          allergies: ['Penicillin', 'Sulfa drugs'],
          familyHistory: ['Heart disease', 'Diabetes']
        },
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: 72,
          temperature: 98.6,
          oxygenSaturation: 98,
          weight: 180,
          height: 70,
          bmi: 25.8
        },
        labResults: {
          cholesterol: 200,
          glucose: 120,
          hemoglobin: 14.2,
          lastUpdated: '2024-01-15'
        },
        insurance: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BCBS123456',
          groupNumber: 'GRP789',
          expirationDate: '2024-12-31'
        },
        notes: [
          'Patient shows good compliance with medication regimen',
          'Recommended lifestyle changes for diabetes management',
          'Follow-up in 3 months for blood pressure monitoring'
        ],
        documents: [
          {
            id: 'doc-1',
            name: 'Blood Test Results - Jan 2024',
            type: 'lab_report',
            date: '2024-01-15',
            size: '2.3 MB'
          },
          {
            id: 'doc-2',
            name: 'Chest X-Ray - Jan 2024',
            type: 'imaging',
            date: '2024-01-15',
            size: '15.7 MB'
          }
        ]
      }
    ];

    const mockAppointments: Appointment[] = [
      {
        id: 'apt-1',
        patientId: 'patient-1',
        patientName: 'John Smith',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Johnson',
        date: '2024-02-20',
        time: '10:00 AM',
        type: 'follow-up',
        status: 'scheduled',
        notes: 'Follow-up for diabetes management and blood pressure check',
        duration: 30,
        room: 'Exam Room 3',
        priority: 'medium'
      },
      {
        id: 'apt-2',
        patientId: 'patient-1',
        patientName: 'John Smith',
        doctorId: 'doc-2',
        doctorName: 'Dr. Michael Chen',
        date: '2024-02-25',
        time: '2:00 PM',
        type: 'telemedicine',
        status: 'scheduled',
        notes: 'Telemedicine consultation for medication review',
        duration: 20,
        room: 'Virtual',
        priority: 'low',
        telemedicineLink: 'https://meet.healthcare.com/apt-2'
      }
    ];

    const mockTelemedicineSessions: TelemedicineSession[] = [
      {
        id: 'tel-1',
        patientId: 'patient-1',
        patientName: 'John Smith',
        doctorId: 'doc-1',
        doctorName: 'Dr. Sarah Johnson',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        status: 'completed',
        notes: 'Initial consultation for diabetes management',
        recordingUrl: 'https://recordings.healthcare.com/session-1',
        transcript: 'Patient reported good medication compliance...'
      }
    ];

    setPatients(mockPatients);
    setAppointments(mockAppointments);
    setTelemedicineSessions(mockTelemedicineSessions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'critical': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Patient Management</h2>
          <p className="text-gray-600">Comprehensive EHR with telemedicine integration and advanced patient tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export EHR
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="ehr">EHR</TabsTrigger>
          <TabsTrigger value="telemedicine">Telemedicine</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Patient Directory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPatient === patient.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPatient(patient.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(patient.status)}`} />
                          <div className="flex-1">
                            <h4 className="font-medium">{patient.name}</h4>
                            <p className="text-sm text-gray-600">ID: {patient.id}</p>
                          </div>
                          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                            {patient.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Details */}
            <div className="lg:col-span-2">
              {selectedPatientData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-green-500" />
                      Patient Details - {selectedPatientData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Basic Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Age:</span>
                              <span>{selectedPatientData.age} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gender:</span>
                              <span>{selectedPatientData.gender}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span>{selectedPatientData.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span>{selectedPatientData.email}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Emergency Contact</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span>{selectedPatientData.emergencyContact.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span>{selectedPatientData.emergencyContact.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Relationship:</span>
                              <span>{selectedPatientData.emergencyContact.relationship}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vital Signs */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Vital Signs</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Blood Pressure:</span>
                              <span>{selectedPatientData.vitalSigns.bloodPressure}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Heart Rate:</span>
                              <span>{selectedPatientData.vitalSigns.heartRate} bpm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Temperature:</span>
                              <span>{selectedPatientData.vitalSigns.temperature}°F</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">O2 Saturation:</span>
                              <span>{selectedPatientData.vitalSigns.oxygenSaturation}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">BMI:</span>
                              <span>{selectedPatientData.vitalSigns.bmi}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Recent Lab Results</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cholesterol:</span>
                              <span>{selectedPatientData.labResults.cholesterol} mg/dL</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Glucose:</span>
                              <span>{selectedPatientData.labResults.glucose} mg/dL</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hemoglobin:</span>
                              <span>{selectedPatientData.labResults.hemoglobin} g/dL</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center space-x-2">
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Patient
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Full EHR
                      </Button>
                      <Button variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Start Telemedicine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a patient to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* EHR Tab */}
        <TabsContent value="ehr" className="space-y-6">
          {selectedPatientData ? (
            <div className="space-y-6">
              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Conditions</h4>
                      <div className="space-y-1">
                        {selectedPatientData.medicalHistory.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Allergies</h4>
                      <div className="space-y-1">
                        {selectedPatientData.medicalHistory.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="mr-1 mb-1">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Current Medications</h4>
                      <div className="space-y-1">
                        {selectedPatientData.medicalHistory.medications.map((medication, index) => (
                          <Badge key={index} variant="secondary" className="mr-1 mb-1">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Family History</h4>
                      <div className="space-y-1">
                        {selectedPatientData.medicalHistory.familyHistory.map((history, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {history}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Medical Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedPatientData.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">{document.name}</h4>
                            <p className="text-sm text-gray-600">{document.date} • {document.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{document.type}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Clinical Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPatientData.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a patient to view EHR</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Telemedicine Tab */}
        <TabsContent value="telemedicine" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-blue-500" />
                  Upcoming Telemedicine Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.filter(apt => apt.type === 'telemedicine').map((appointment) => (
                    <div key={appointment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{appointment.patientName}</h4>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Doctor: {appointment.doctorName}</p>
                        <p>Date: {appointment.date} at {appointment.time}</p>
                        <p>Duration: {appointment.duration} minutes</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-1" />
                          Join Session
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {telemedicineSessions.map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{session.patientName}</h4>
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Doctor: {session.doctorName}</p>
                        <p>Date: {new Date(session.startTime).toLocaleDateString()}</p>
                        <p>Duration: {session.endTime ? 
                          Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) : 
                          'Ongoing'} minutes</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Recording
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Transcript
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Patient Health Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blood Pressure Trend</span>
                    <span className="text-sm font-medium text-green-600">Improving</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Glucose Control</span>
                    <span className="text-sm font-medium text-yellow-600">Stable</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medication Adherence</span>
                    <span className="text-sm font-medium text-green-600">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-blue-500" />
                  Telemedicine Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Sessions</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Duration</span>
                    <span className="text-sm font-medium">28 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Patient Satisfaction</span>
                    <span className="text-sm font-medium text-green-600">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk Patients</span>
                    <span className="text-sm font-medium text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medication Conflicts</span>
                    <span className="text-sm font-medium text-orange-600">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-up Due</span>
                    <span className="text-sm font-medium text-yellow-600">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 