"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Activity,
  Settings,
  Download,
  Upload,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Database,
  Key,
  LockKeyhole,
  Brain,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity as ActivityIcon,
  UserCheck,
  Stethoscope,
  Pill,
  Phone,
  Mail,
  MapPin,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Mic,
  Video,
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

import { 
  LoadingSkeleton, 
  ErrorBoundary, 
  StatusIndicator, 
  EnhancedDataTable,
  MetricsCard,
  ActionButton,
  Notification,
  EnhancedSearch
} from '@/components/EnhancedUI';

import {
  EnhancedLineChart,
  EnhancedBarChart,
  EnhancedPieChart,
  ChartGrid,
  RealTimeChart
} from '@/components/EnhancedCharts';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'access' | 'data_breach' | 'policy_violation' | 'system_alert' | 'authentication' | 'authorization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user: string;
  ipAddress: string;
  action: string;
  status: 'pending' | 'investigating' | 'resolved';
  location: string;
  device: string;
  browser: string;
  sessionId: string;
  affectedData: string[];
  remediation: string;
}

interface ComplianceStatus {
  hipaa: {
    status: 'compliant' | 'non_compliant' | 'warning';
    score: number;
    lastAudit: string;
    nextAudit: string;
    violations: number;
    requirements: {
      id: string;
      name: string;
      status: 'compliant' | 'non_compliant' | 'warning';
      description: string;
      lastChecked: string;
    }[];
  };
  gdpr: {
    status: 'compliant' | 'non_compliant' | 'warning';
    score: number;
    lastAudit: string;
    nextAudit: string;
    violations: number;
    requirements: {
      id: string;
      name: string;
      status: 'compliant' | 'non_compliant' | 'warning';
      description: string;
      lastChecked: string;
    }[];
  };
  sox: {
    status: 'compliant' | 'non_compliant' | 'warning';
    score: number;
    lastAudit: string;
    nextAudit: string;
    violations: number;
    requirements: {
      id: string;
      name: string;
      status: 'compliant' | 'non_compliant' | 'warning';
      description: string;
      lastChecked: string;
    }[];
  };
}

interface ThreatIntelligence {
  id: string;
  threatType: 'malware' | 'phishing' | 'ddos' | 'insider_threat' | 'data_exfiltration';
  source: string;
  target: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'mitigated' | 'resolved';
  timestamp: string;
  description: string;
  indicators: string[];
  mitigation: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  averageResponseTime: number;
  systemHealth: number;
  encryptionStatus: boolean;
  auditTrailStatus: boolean;
  accessControlStatus: boolean;
  complianceStatus: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function SecurityMonitoring() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    hipaa: { status: 'compliant', score: 98, lastAudit: '2024-01-15', nextAudit: '2024-04-15', violations: 0, requirements: [] },
    gdpr: { status: 'compliant', score: 95, lastAudit: '2024-01-20', nextAudit: '2024-04-20', violations: 0, requirements: [] },
    sox: { status: 'compliant', score: 92, lastAudit: '2024-01-10', nextAudit: '2024-04-10', violations: 0, requirements: [] }
  });
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    resolvedEvents: 0,
    averageResponseTime: 0,
    systemHealth: 99.8,
    encryptionStatus: true,
    auditTrailStatus: true,
    accessControlStatus: true,
    complianceStatus: 'compliant',
    threatLevel: 'low'
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('events');

  // Mock data initialization
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'access',
        severity: 'medium',
        description: 'Multiple failed login attempts detected',
        user: 'user@example.com',
        ipAddress: '192.168.1.100',
        action: 'investigate',
        status: 'investigating',
        location: 'New York, NY',
        device: 'Windows 10',
        browser: 'Chrome 120.0',
        sessionId: 'sess_123456',
        affectedData: ['user_profile'],
        remediation: 'Account temporarily locked'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'policy_violation',
        severity: 'high',
        description: 'Unauthorized access to sensitive data',
        user: 'admin@example.com',
        ipAddress: '10.0.0.50',
        action: 'block',
        status: 'resolved',
        location: 'San Francisco, CA',
        device: 'MacOS 14.0',
        browser: 'Safari 17.0',
        sessionId: 'sess_789012',
        affectedData: ['patient_records', 'financial_data'],
        remediation: 'Access revoked, investigation completed'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'system_alert',
        severity: 'critical',
        description: 'Suspicious network activity detected',
        user: 'system',
        ipAddress: '203.0.113.0',
        action: 'block',
        status: 'pending',
        location: 'Unknown',
        device: 'Unknown',
        browser: 'Unknown',
        sessionId: 'sess_345678',
        affectedData: ['network_infrastructure'],
        remediation: 'Network traffic analysis in progress'
      }
    ];

    setEvents(mockEvents);
    setMetrics(prev => ({
      ...prev,
      totalEvents: mockEvents.length,
      criticalEvents: mockEvents.filter(e => e.severity === 'critical').length,
      resolvedEvents: mockEvents.filter(e => e.status === 'resolved').length
    }));
  }, []);

  // Real-time threat monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new security events
      const newEvent: SecurityEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: ['access', 'policy_violation', 'system_alert'][Math.floor(Math.random() * 3)] as any,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        description: 'Security event detected',
        user: 'user@example.com',
        ipAddress: '192.168.1.100',
        action: 'investigate',
        status: 'pending',
        location: 'New York, NY',
        device: 'Windows 10',
        browser: 'Chrome 120.0',
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
        affectedData: ['user_data'],
        remediation: 'Under investigation'
      };
      
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        criticalEvents: prev.criticalEvents + (newEvent.severity === 'critical' ? 1 : 0),
        threatLevel: newEvent.severity === 'critical' ? 'high' : prev.threatLevel
      }));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: any) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    if (notification.autoClose) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <UserCheck className="h-4 w-4" />;
      case 'data_breach': return <Database className="h-4 w-4" />;
      case 'policy_violation': return <AlertTriangle className="h-4 w-4" />;
      case 'system_alert': return <Activity className="h-4 w-4" />;
      case 'authentication': return <Key className="h-4 w-4" />;
      case 'authorization': return <LockKeyhole className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const eventColumns = [
    { key: 'timestamp', label: 'Time', sortable: true, render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleTimeString()}</span>
    )},
    { key: 'type', label: 'Type', sortable: true, render: (value: string) => (
      <div className="flex items-center space-x-2">
        {getTypeIcon(value)}
        <span className="capitalize">{value.replace('_', ' ')}</span>
      </div>
    )},
    { key: 'severity', label: 'Severity', sortable: true, render: (value: string) => (
      <Badge variant="outline" className={getSeverityColor(value)}>
        {value}
      </Badge>
    )},
    { key: 'user', label: 'User', sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => (
      <Badge variant={value === 'resolved' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )}
  ];

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            {metrics.threatLevel === 'low' ? 'Secure' : 'Alert'}
          </Badge>
          <StatusIndicator status={metrics.threatLevel === 'low' ? 'success' : 'warning'} size="small" />
        </div>
        
        <div className="flex items-center space-x-2">
          <ActionButton
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() => addNotification({
              type: 'success',
              title: 'Security Report',
              message: 'Security report export initiated',
              autoClose: true,
              duration: 3000
            })}
          >
            Export Report
          </ActionButton>
          <ActionButton
            icon={<Settings className="h-4 w-4" />}
            onClick={() => addNotification({
              type: 'info',
              title: 'Security Settings',
              message: 'Security configuration panel opened',
              autoClose: true,
              duration: 2000
            })}
          >
            Configure
          </ActionButton>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Total Events"
              value={metrics.totalEvents.toString()}
              change="Last 24 hours"
              trend="neutral"
              icon={<Activity className="h-4 w-4" />}
            />
            <MetricsCard
              title="Critical Events"
              value={metrics.criticalEvents.toString()}
              change="Require immediate attention"
              trend="up"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <MetricsCard
              title="Resolved Events"
              value={metrics.resolvedEvents.toString()}
              change="Successfully handled"
              trend="up"
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <MetricsCard
              title="System Health"
              value={`${metrics.systemHealth.toFixed(1)}%`}
              change="All systems operational"
              trend="up"
              icon={<Shield className="h-4 w-4" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                data={events}
                columns={eventColumns}
                searchable={true}
                filterable={true}
                sortable={true}
                pagination={true}
                onRowClick={(event: SecurityEvent) => {
                  addNotification({
                    type: 'info',
                    title: 'Event Details',
                    message: `Viewing details for ${event.type} event`,
                    autoClose: true,
                    duration: 2000
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(complianceStatus).map(([regulation, status]) => (
              <Card key={regulation}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    {regulation.toUpperCase()} Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant={status.status === 'compliant' ? 'default' : 'destructive'}>
                        {status.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Score</span>
                      <span className="font-medium">{status.score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Violations</span>
                      <span className="font-medium">{status.violations}</span>
                    </div>
                    <Progress value={status.score} className="w-full" />
                    <div className="text-xs text-gray-500">
                      <p>Last Audit: {status.lastAudit}</p>
                      <p>Next Audit: {status.nextAudit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Threat Intelligence Tab */}
        <TabsContent value="threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Threat Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelligence.map((threat) => (
                  <Alert key={threat.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{threat.threatType}</h4>
                          <p className="text-sm text-gray-600">{threat.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getSeverityColor(threat.impact)}>
                            {threat.impact} impact
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{threat.confidence}% confidence</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <ChartGrid
            charts={[
              {
                type: 'line',
                title: 'Security Events Over Time',
                description: 'Real-time security event monitoring',
                data: events.map(event => ({
                  name: new Date(event.timestamp).toLocaleTimeString(),
                  value: event.severity === 'critical' ? 4 : event.severity === 'high' ? 3 : event.severity === 'medium' ? 2 : 1
                }))
              },
              {
                type: 'bar',
                title: 'Event Types Distribution',
                description: 'Breakdown by event type',
                data: [
                  { name: 'Access', value: events.filter(e => e.type === 'access').length },
                  { name: 'Policy Violation', value: events.filter(e => e.type === 'policy_violation').length },
                  { name: 'System Alert', value: events.filter(e => e.type === 'system_alert').length },
                  { name: 'Data Breach', value: events.filter(e => e.type === 'data_breach').length }
                ]
              },
              {
                type: 'pie',
                title: 'Severity Distribution',
                description: 'Event severity breakdown',
                data: [
                  { name: 'Critical', value: events.filter(e => e.severity === 'critical').length },
                  { name: 'High', value: events.filter(e => e.severity === 'high').length },
                  { name: 'Medium', value: events.filter(e => e.severity === 'medium').length },
                  { name: 'Low', value: events.filter(e => e.severity === 'low').length }
                ]
              },
              {
                type: 'area',
                title: 'System Health Monitoring',
                description: 'Real-time system health tracking',
                data: Array.from({ length: 24 }, (_, i) => ({
                  name: `${i}:00`,
                  value: 95 + Math.random() * 5
                }))
              }
            ]}
            columns={2}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 