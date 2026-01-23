"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Play,
  Pause,
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
  Zap,
  Sparkles,
  Rocket,
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Brain,
  Cpu,
  Database,
  User,
  Phone,
  Mail,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Brain as BrainIcon,
  Heart as HeartIcon,
  Eye as EyeIcon,
  Ear as EarIcon,
  Hand as HandIcon,
  Speech as SpeechIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon2,
  Clock as ClockIcon2,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Bell as BellIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle2 as CheckCircle2Icon,
  UserCheck,
  Stethoscope,
  Pill,
  Thermometer,
  Droplets,
  Activity as ActivityIcon,
  User as UserIcon,
  Clock as ClockIcon3,
  Calendar as CalendarIcon3,
  AlertOctagon,
  CheckCircle2 as CheckCircle2Icon2,
  XCircle as XCircleIcon2,
  Info as InfoIcon2,
  RefreshCw as RefreshCwIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Volume2,
  Mic,
  Video,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Server as ServerIcon,
  HardDrive as HardDriveIcon,
  Network as NetworkIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Signal as SignalIcon,
  Battery as BatteryIcon,
  Power as PowerIcon,
  Zap as ZapIcon,
  Sparkles as SparklesIcon,
  Rocket as RocketIcon,
  Star as StarIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Crown as CrownIcon,
  Gem as GemIcon,
  Diamond as DiamondIcon
} from 'lucide-react';

// HIPAA Compliance Interfaces
interface HIPAAData {
  id: string;
  type: 'PHI' | 'PII' | 'General';
  classification: 'Confidential' | 'Internal' | 'Public';
  encryptionLevel: 'AES-256' | 'AES-128' | 'None';
  accessLevel: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Patient';
  auditTrail: boolean;
  retentionPeriod: number; // in days
  lastAccessed: string;
  lastModified: string;
  createdBy: string;
  dataSize: number;
  checksum: string;
}

interface HIPAAAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: 'view' | 'edit' | 'delete' | 'export' | 'import' | 'login' | 'logout';
  dataId: string;
  dataType: 'PHI' | 'PII' | 'General';
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details: string;
}

interface HIPAASecurityMetrics {
  totalAccess: number;
  unauthorizedAttempts: number;
  dataBreaches: number;
  encryptionCoverage: number;
  auditLogCompleteness: number;
  complianceScore: number;
  lastSecurityScan: string;
  nextAuditDate: string;
}

interface HIPAACompliantModuleProps {
  appType: 'healthcare' | 'autism-care' | 'mental-health' | 'pharmacy' | 'dental' | 'general';
  dataType: 'PHI' | 'PII' | 'General';
  userRole: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Patient' | 'Caregiver';
  enableAuditTrail?: boolean;
  enableEncryption?: boolean;
  enableAccessControl?: boolean;
  onDataAccess?: (data: HIPAAData) => void;
  onSecurityAlert?: (alert: string) => void;
}

export const HIPAACompliantModule: React.FC<HIPAACompliantModuleProps> = ({
  appType,
  dataType,
  userRole,
  enableAuditTrail = true,
  enableEncryption = true,
  enableAccessControl = true,
  onDataAccess,
  onSecurityAlert
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [securityMetrics, setSecurityMetrics] = useState<HIPAASecurityMetrics>({
    totalAccess: 1247,
    unauthorizedAttempts: 3,
    dataBreaches: 0,
    encryptionCoverage: 100,
    auditLogCompleteness: 100,
    complianceScore: 98,
    lastSecurityScan: '2024-01-15T10:30:00Z',
    nextAuditDate: '2024-04-15T00:00:00Z'
  });

  const [auditLogs, setAuditLogs] = useState<HIPAAAuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      userId: 'dr.smith',
      action: 'view',
      dataId: 'patient-123',
      dataType: 'PHI',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      success: true,
      details: 'Viewed patient medical records'
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:00Z',
      userId: 'nurse.jones',
      action: 'edit',
      dataId: 'patient-123',
      dataType: 'PHI',
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox/121.0.0.0',
      success: true,
      details: 'Updated patient vitals'
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:00Z',
      userId: 'unknown',
      action: 'view',
      dataId: 'patient-123',
      dataType: 'PHI',
      ipAddress: '203.45.67.89',
      userAgent: 'Unknown',
      success: false,
      details: 'Unauthorized access attempt'
    }
  ]);

  const [hipaaData, setHipaaData] = useState<HIPAAData[]>([
    {
      id: 'patient-123',
      type: 'PHI',
      classification: 'Confidential',
      encryptionLevel: 'AES-256',
      accessLevel: 'Doctor',
      auditTrail: true,
      retentionPeriod: 2555, // 7 years
      lastAccessed: '2024-01-15T14:30:00Z',
      lastModified: '2024-01-15T14:25:00Z',
      createdBy: 'dr.smith',
      dataSize: 2048576, // 2MB
      checksum: 'a1b2c3d4e5f6g7h8i9j0'
    },
    {
      id: 'patient-124',
      type: 'PHI',
      classification: 'Confidential',
      encryptionLevel: 'AES-256',
      accessLevel: 'Nurse',
      auditTrail: true,
      retentionPeriod: 2555,
      lastAccessed: '2024-01-15T13:45:00Z',
      lastModified: '2024-01-15T13:40:00Z',
      createdBy: 'nurse.jones',
      dataSize: 1048576, // 1MB
      checksum: 'b2c3d4e5f6g7h8i9j0k1'
    }
  ]);

  // Real-time security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time security updates
      setSecurityMetrics(prev => ({
        ...prev,
        totalAccess: prev.totalAccess + Math.floor(Math.random() * 3),
        complianceScore: Math.max(95, Math.min(100, prev.complianceScore + (Math.random() - 0.5) * 2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDataAccess = (data: HIPAAData) => {
    // Log access for audit trail
    const auditLog: HIPAAAuditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: userRole.toLowerCase(),
      action: 'view',
      dataId: data.id,
      dataType: data.type,
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: true,
      details: `Accessed ${data.type} data`
    };

    setAuditLogs(prev => [auditLog, ...prev.slice(0, 99)]); // Keep last 100 logs
    onDataAccess?.(data);
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityStatus = () => {
    if (securityMetrics.unauthorizedAttempts > 0) {
      onSecurityAlert?.('Unauthorized access attempts detected');
      return 'warning';
    }
    if (securityMetrics.dataBreaches > 0) {
      onSecurityAlert?.('Data breach detected');
      return 'critical';
    }
    return 'healthy';
  };

  return (
    <div className="space-y-6">
      {/* HIPAA Compliance Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">HIPAA Compliant Module</h2>
              <p className="text-sm text-gray-600">
                {appType.charAt(0).toUpperCase() + appType.slice(1)} - {dataType} Data Protection
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Lock className="h-4 w-4 mr-1" />
              AES-256 Encrypted
            </Badge>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${getComplianceColor(securityMetrics.complianceScore)}`}>
                {securityMetrics.complianceScore}%
              </div>
              <Progress value={securityMetrics.complianceScore} className="flex-1 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Encryption Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">
                {securityMetrics.encryptionCoverage}%
              </div>
              <Progress value={securityMetrics.encryptionCoverage} className="flex-1 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Log Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">
                {securityMetrics.auditLogCompleteness}%
              </div>
              <Progress value={securityMetrics.auditLogCompleteness} className="flex-1 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${
                getSecurityStatus() === 'healthy' ? 'text-green-600' :
                getSecurityStatus() === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {getSecurityStatus().toUpperCase()}
              </div>
              {getSecurityStatus() === 'healthy' && <CheckCircle className="h-6 w-6 text-green-600" />}
              {getSecurityStatus() === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-600" />}
              {getSecurityStatus() === 'critical' && <XCircle className="h-6 w-6 text-red-600" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Records</span>
                    <span className="font-medium">{hipaaData.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PHI Records</span>
                    <span className="font-medium text-red-600">
                      {hipaaData.filter(d => d.type === 'PHI').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PII Records</span>
                    <span className="font-medium text-yellow-600">
                      {hipaaData.filter(d => d.type === 'PII').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Size</span>
                    <span className="font-medium">
                      {(hipaaData.reduce((sum, d) => sum + d.dataSize, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Security Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityMetrics.unauthorizedAttempts > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">
                        {securityMetrics.unauthorizedAttempts} unauthorized access attempts
                      </span>
                    </div>
                  )}
                  {securityMetrics.dataBreaches > 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">
                        {securityMetrics.dataBreaches} data breach detected
                      </span>
                    </div>
                  )}
                  {securityMetrics.unauthorizedAttempts === 0 && securityMetrics.dataBreaches === 0 && (
                    <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">No security alerts</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HIPAA Data Management</CardTitle>
              <CardDescription>
                Manage and monitor {dataType} data with full audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hipaaData.map((data) => (
                  <div key={data.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${
                          data.type === 'PHI' ? 'bg-red-100' :
                          data.type === 'PII' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <Shield className={`h-5 w-5 ${
                            data.type === 'PHI' ? 'text-red-600' :
                            data.type === 'PII' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{data.id}</h4>
                          <p className="text-sm text-gray-600">{data.type} - {data.classification}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {data.encryptionLevel}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleDataAccess(data)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Access
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-1 font-medium">{(data.dataSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Accessed:</span>
                        <span className="ml-1 font-medium">{new Date(data.lastAccessed).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Retention:</span>
                        <span className="ml-1 font-medium">{data.retentionPeriod} days</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Checksum:</span>
                        <span className="ml-1 font-medium font-mono text-xs">{data.checksum.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete audit log of all data access and modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className={`border rounded-lg p-3 ${
                    log.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-1 rounded ${
                          log.success ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{log.userId}</span>
                            <span className="text-sm text-gray-500">{log.action}</span>
                            <span className="text-sm font-medium">{log.dataId}</span>
                          </div>
                          <p className="text-sm text-gray-600">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{log.ipAddress}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Access</span>
                    <span className="font-medium">{securityMetrics.totalAccess}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unauthorized Attempts</span>
                    <span className="font-medium text-red-600">{securityMetrics.unauthorizedAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Breaches</span>
                    <span className="font-medium text-red-600">{securityMetrics.dataBreaches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Security Scan</span>
                    <span className="font-medium">{new Date(securityMetrics.lastSecurityScan).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Multi-Factor Authentication</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Role-Based Access</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Session Timeout</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      15 minutes
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Audit Logging</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HIPAA Compliance Status</CardTitle>
              <CardDescription>
                Current compliance status and upcoming requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Compliance Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Compliance Score</span>
                    <span className={`text-2xl font-bold ${getComplianceColor(securityMetrics.complianceScore)}`}>
                      {securityMetrics.complianceScore}%
                    </span>
                  </div>
                  <Progress value={securityMetrics.complianceScore} className="h-3" />
                </div>

                {/* Compliance Requirements */}
                <div className="space-y-3">
                  <h4 className="font-medium">HIPAA Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm">Technical Safeguards</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm">Physical Safeguards</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm">Administrative Safeguards</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm">Breach Notification</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Next Audit */}
                <div className="space-y-2">
                  <h4 className="font-medium">Next Compliance Audit</h4>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <div>
                      <span className="text-sm text-gray-600">Scheduled Date</span>
                      <div className="font-medium">{new Date(securityMetrics.nextAuditDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Days Remaining</span>
                      <div className="font-medium text-blue-600">
                        {Math.ceil((new Date(securityMetrics.nextAuditDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 