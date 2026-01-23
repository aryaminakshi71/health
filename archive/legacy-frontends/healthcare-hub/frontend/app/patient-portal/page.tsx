"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import BackLink from './components/layout/BackLink';
import PaymentsList from './components/PaymentsList';
import PatientPortalLayout from './components/patient/PatientPortalLayout';
import AppointmentScheduler from './components/patient/AppointmentScheduler';
import MedicationRefillRequest from './components/patient/MedicationRefillRequest';
import SecureMessaging from './components/patient/SecureMessaging';
import PatientEducation from './components/patient/PatientEducation';
import { CommonLayout } from '../../layouts/CommonLayout';
import { 
  Calendar, 
  FileText, 
  Pill, 
  MessageSquare, 
  CreditCard, 
  User, 
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Edit,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Shield,
  Stethoscope,
  Clipboard,
  FileImage,
  Users,
  Baby,
  Car,
  Home,
  Wifi,
  Cloud,
  Zap,
  Star,
  Award,
  Target,
  PieChart,
  BarChart,
  LineChart,
  Gauge,
  Thermometer,
  Brain,
  Camera,
  Server,
  Lock,
  Unlock,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Save,
  Trash2,
  Copy,
  Share,
  Bookmark,
  Flag,
  HelpCircle,
  Info,
  AlertCircle,
  Check,
  X,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  File as FileIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Key,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Wifi as WifiIcon,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Languages,
  Accessibility,
  Headphones,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  StopCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Grid,
  List,
  Columns,
  Rows,
  Layers,
  Archive,
  Folder,
  FolderOpen,
  FilePlus,
  FileMinus,
  FileX,
  FileCheck,
  FileSearch,
  FileEdit,
  FileCode,
  FileImage as FileImageIcon,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileText as FileTextIcon,



} from 'lucide-react';
import { 
  Patient, 
  Appointment, 
  TestResult, 
  Medication, 
  Message, 
  Payment, 
  VisitSummary,
  PatientNotification,
  HealthMetric,
  PrescriptionRefill,
  Referral,
  Form,
  FormSubmission,
  Invoice
} from './interfaces/patient';

export default function PatientPortalPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [visits, setVisits] = useState<VisitSummary[]>([]);
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [refills, setRefills] = useState<PrescriptionRefill[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load from backend
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setError('');
        const [pRes, aRes, tRes, mRes, msgRes] = await Promise.all([
          fetch(`${backendUrl}/api/v1/healthcare/patient`),
          fetch(`${backendUrl}/api/v1/healthcare/appointments`),
          fetch(`${backendUrl}/api/v1/healthcare/test-results`),
          fetch(`${backendUrl}/api/v1/healthcare/medications`),
          fetch(`${backendUrl}/api/v1/healthcare/messages`)
        ]);
        const [p, a, t, m, msg] = await Promise.all([
          pRes.json(), aRes.json(), tRes.json(), mRes.json(), msgRes.json()
        ]);
        setPatient(p.data || null);
        setAppointments(a.data || []);
        setTestResults(t.data || []);
        setMedications(m.data || []);
        setMessages(msg.data || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load patient portal');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
      case 'completed':
      case 'active':
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'no-show':
      case 'critical':
      case 'abnormal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your patient portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Portal</h2>
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const portalModules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, href: '#', isActive: activeTab==='dashboard' },
    { id: 'appointments', name: 'Appointments', icon: Calendar, href: '#', isActive: activeTab==='appointments' },
    { id: 'test-results', name: 'Test Results', icon: FileText, href: '#', isActive: activeTab==='test-results' },
    { id: 'medications', name: 'Medications', icon: Pill, href: '#', isActive: activeTab==='medications' },
    { id: 'messages', name: 'Messages', icon: MessageSquare, href: '#', isActive: activeTab==='messages' },
    { id: 'payments', name: 'Payments', icon: CreditCard, href: '#', isActive: activeTab==='payments' },
    { id: 'forms', name: 'Forms', icon: Clipboard, href: '#', isActive: activeTab==='forms' },
    { id: 'medical-records', name: 'Medical Records', icon: Stethoscope, href: '#', isActive: activeTab==='medical-records' },
    { id: 'profile', name: 'Profile', icon: User, href: '#', isActive: activeTab==='profile' },
  ];

  const handleSidebarClick = (mod: any) => setActiveTab(mod.id);

  return (
    <CommonLayout
      appName="Patient Portal"
      appDescription="Secure access to your health information"
      sidebarAppType="healthcare"
      sidebarModules={portalModules}
      onSidebarModuleClick={handleSidebarClick}
      showNavigation={false}
    >
      <div className="container mx-auto px-6 py-8">
        <BackLink href="/dashboard">Back to Dashboard</BackLink>
        
        {/* Header (lightweight, since app header already shows app name) */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-600">
              Welcome back, {patient?.firstName} {patient?.lastName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Next Appointment</p>
              <p className="font-semibold text-blue-600">
                {patient?.nextAppointment ? formatDate(patient.nextAppointment) : 'None scheduled'}
              </p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.status === 'scheduled').length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Medications</p>
                  <p className="text-2xl font-bold text-gray-900">{medications.filter(m => m.status === 'active').length}</p>
                </div>
                <Pill className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{messages.filter(m => m.status === 'unread').length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'pending').length}</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content (tabs driven by sidebar) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Appointments */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.filter(a => a.status === 'scheduled').length > 0 ? (
                    <div className="space-y-4">
                      {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{appointment.reason}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(appointment.date)} at {formatTime(appointment.time)}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.location}</p>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                  )}
                  <Button className="w-full mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Test Results */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.length > 0 ? (
                    <div className="space-y-4">
                      {testResults.slice(0, 3).map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{result.testName}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(result.testDate)}
                            </p>
                            <p className="text-sm text-gray-500">{result.lab}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(result.status)}>
                              {result.status}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent test results</p>
                  )}
                  <Button className="w-full mt-4" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View All Results
                  </Button>
                </CardContent>
              </Card>

              {/* Health Metrics */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthMetrics.length > 0 ? (
                    <div className="space-y-4">
                      {healthMetrics.map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{metric.name}</p>
                            <p className="text-sm text-gray-600">
                              {metric.value} {metric.unit}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(metric.date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {metric.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {metric.trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {metric.trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                            <Badge className={getStatusColor(metric.status)}>
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No health metrics available</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.slice(0, 3).map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.priority === 'urgent' ? 'bg-red-500' : 
                            notification.priority === 'high' ? 'bg-orange-500' : 
                            notification.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              {formatDate(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent notifications</p>
                  )}
                  <Button className="w-full mt-4" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Appointments
                  </CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-6 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold">{formatDate(appointment.date)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-semibold">{formatTime(appointment.time)}</p>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.reason}</p>
                          <p className="text-sm text-gray-600">{appointment.location}</p>
                          <p className="text-sm text-gray-500">Duration: {appointment.duration} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="test-results">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{result.testName}</h3>
                          <p className="text-sm text-gray-600">
                            Test Date: {formatDate(result.testDate)} | 
                            Result Date: {formatDate(result.resultDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ordered by: {result.orderedBy} | Lab: {result.lab}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {result.results && result.results.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Results:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.results.map((testValue, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{testValue.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {testValue.value} {testValue.unit}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Reference: {testValue.referenceRange}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(testValue.status)}>
                                  {testValue.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Records Tab (consolidated view) */}
          <TabsContent value="medical-records">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Medical Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card><CardContent className="p-4">
                      <div className="text-sm text-gray-600">Appointments</div>
                      <div className="text-2xl font-semibold">{appointments.length}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <div className="text-sm text-gray-600">Test Results</div>
                      <div className="text-2xl font-semibold">{testResults.length}</div>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <div className="text-sm text-gray-600">Active Medications</div>
                      <div className="text-2xl font-semibold">{medications.filter(m=>m.status==='active').length}</div>
                    </CardContent></Card>
                  </div>

                  {/* Combined timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Timeline</h3>
                    <div className="space-y-3">
                      {[...
                        appointments.map(a => ({
                          date: a.date, kind: 'Appointment', title: a.reason, extra: `${a.time} • ${a.location}`
                        })),
                        testResults.map(t => ({
                          date: t.resultDate || t.testDate, kind: 'Test', title: t.testName, extra: t.lab
                        })),
                        medications.map(m => ({
                          date: m.startDate, kind: 'Medication', title: m.name, extra: `${m.dosage} • ${m.frequency}`
                        })),
                      ]
                        .flat()
                        .filter(i => i.date)
                        .sort((a,b)=> new Date(b.date as any).getTime() - new Date(a.date as any).getTime())
                        .slice(0,12)
                        .map((e, idx) => (
                          <div key={idx} className="p-4 border rounded">
                            <div className="text-sm text-gray-500">{formatDate(e.date as any)} • {e.kind}</div>
                            <div className="font-medium">{e.title}</div>
                            <div className="text-sm text-gray-600">{e.extra}</div>
                          </div>
                        ))
                      }
                      {appointments.length + testResults.length + medications.length === 0 && (
                        <div className="text-gray-500">No records</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Medications
                  </CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Request Refill
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-6 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold">{medication.name}</h3>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} - {medication.frequency}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prescribed by: {medication.prescribedBy} | 
                          Pharmacy: {medication.pharmacy}
                        </p>
                        <p className="text-sm text-gray-500">
                          Start Date: {formatDate(medication.startDate)} | 
                          Refills: {medication.refillsRemaining}
                        </p>
                        {medication.notes && (
                          <p className="text-sm text-gray-500 mt-1">Notes: {medication.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(medication.status)}>
                          {medication.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Secure Messages
                  </CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-6 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold">{message.subject}</h3>
                        <p className="text-sm text-gray-600">{message.content.substring(0, 100)}...</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payments & Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentsList backendUrl={backendUrl} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5" />
                  Forms & Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forms.map((form) => (
                    <div key={form.id} className="flex items-center justify-between p-6 border rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold">{form.name}</h3>
                        <p className="text-sm text-gray-600">{form.description}</p>
                        <p className="text-sm text-gray-500">
                          Category: {form.category} | 
                          Version: {form.version}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(form.status)}>
                          {form.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Patient Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient && (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <Input value={patient.firstName} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <Input value={patient.lastName} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                          <Input value={formatDate(patient.dateOfBirth)} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gender</label>
                          <Input value={patient.gender} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <Input value={patient.email} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <Input value={patient.phone} disabled />
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Street Address</label>
                          <Input value={patient.address.street} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <Input value={patient.address.city} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <Input value={patient.address.state} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                          <Input value={patient.address.zipCode} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <Input value={patient.address.country} disabled />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <Input value={patient.emergencyContact.name} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Relationship</label>
                          <Input value={patient.emergencyContact.relationship} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <Input value={patient.emergencyContact.phone} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <Input value={patient.emergencyContact.email || 'N/A'} disabled />
                        </div>
                      </div>
                    </div>

                    {/* Insurance Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Provider</label>
                          <Input value={patient.insurance.provider} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                          <Input value={patient.insurance.policyNumber} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Group Number</label>
                          <Input value={patient.insurance.groupNumber || 'N/A'} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subscriber</label>
                          <Input value={patient.insurance.subscriberName} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Relationship</label>
                          <Input value={patient.insurance.relationship} disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Coverage Type</label>
                          <Input value={patient.insurance.coverageType} disabled />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Profile
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CommonLayout>
  );
} 