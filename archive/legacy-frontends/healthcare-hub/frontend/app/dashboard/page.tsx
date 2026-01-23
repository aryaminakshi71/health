"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  Bell, 
  LogOut, 
  Home, 
  BarChart3, 
  Heart, 
  Settings, 
  UserPlus
} from 'lucide-react';
import TenantAdminPanel from '../../components/TenantAdminPanel';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<string>('viewer');
  const router = useRouter();
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') as string;
  const [patients, setPatients] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [autismDashboard, setAutismDashboard] = useState<any | null>(null);
  const [autismPatients, setAutismPatients] = useState<any[]>([]);
  const [autismSessions, setAutismSessions] = useState<any[]>([]);
  const [autismActivities, setAutismActivities] = useState<any[]>([]);
  const [autismTools, setAutismTools] = useState<any[]>([]);
  const [healthcareAnalytics, setHealthcareAnalytics] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<any | null>(null);
  const [compliance, setCompliance] = useState<any | null>(null);
  const [storage, setStorage] = useState<any | null>(null);
  const [education, setEducation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'autism-center', name: 'Autism Center', icon: Activity },
    { id: 'attendance', name: 'Attendance', icon: FileText },
    { id: 'employment', name: 'Employment', icon: FileText },
    { id: 'compliance', name: 'Compliance', icon: FileText },
    { id: 'storage', name: 'Storage', icon: FileText },
    { id: 'education', name: 'Education', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'telesitting', name: 'Telesitting', icon: Activity },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const stats = [
    { title: "Total Patients", value: String(dashboard?.data?.total_patients ?? '—'), change: '', icon: Users, color: "text-blue-600" },
    { title: "Active Patients", value: String(dashboard?.data?.active_patients ?? '—'), change: '', icon: Calendar, color: "text-green-600" },
    { title: "System Health", value: String(dashboard?.data?.system_health ?? '—'), change: '', icon: TrendingUp, color: "text-purple-600" },
    { title: "Last Update", value: (dashboard?.data?.last_update ? new Date(dashboard.data.last_update).toLocaleString() : '—'), change: '', icon: FileText, color: "text-orange-600" },
  ];

  // Login guard and load role/tenant from storage
  useEffect(() => {
    try {
      const jwt = typeof window !== 'undefined' ? localStorage.getItem('hh-jwt') : null;
      if (!jwt) {
        window.location.href = '/login';
        return;
      }
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        const r = (payload?.role || payload?.permissions || 'viewer').toLowerCase();
        setRole(r);
      } catch { setRole('viewer'); }
    } catch {}
  }, []);

  const loadTabData = async (tab: string) => {
    try {
      setLoading(true);
      setError(null);
      if (tab === 'patients') {
        const res = await fetch(`${backendUrl}/api/v1/healthcare/patients`);
        const json = await res.json();
        setPatients(json.data || []);
      } else if (tab === 'dashboard') {
        const res = await fetch(`${backendUrl}/api/v1/healthcare/dashboard`);
        const json = await res.json();
        setDashboard(json || null);
        const ap = await fetch(`${backendUrl}/api/v1/healthcare/appointments/recent`);
        const apJson = await ap.json();
        setRecentAppointments(apJson.data || []);
        const tr = await fetch(`${backendUrl}/api/v1/healthcare/test-results/recent`);
        const trJson = await tr.json();
        setRecentTests(trJson.data || []);
      } else if (tab === 'autism-center') {
        // Load Autism Care data from centralized backend
        const [db, pts, sess, acts, tools] = await Promise.all([
          fetch(`${backendUrl}/api/v1/autism-care/dashboard`).then(r => r.json()).catch(() => null),
          fetch(`${backendUrl}/api/v1/autism-care/patients`).then(r => r.json()).catch(() => ({ patients: [] })),
          fetch(`${backendUrl}/api/v1/autism-care/sessions`).then(r => r.json()).catch(() => ({ sessions: [] })),
          fetch(`${backendUrl}/api/v1/autism-care/sensory-activities`).then(r => r.json()).catch(() => ({ activities: [] })),
          fetch(`${backendUrl}/api/v1/autism-care/communication-tools`).then(r => r.json()).catch(() => ({ tools: [] })),
        ]);
        setAutismDashboard(db);
        setAutismPatients(pts?.patients || []);
        setAutismSessions(sess?.sessions || []);
        setAutismActivities(acts?.activities || []);
        setAutismTools(tools?.tools || []);
      } else if (tab === 'employment') {
        const res = await fetch(`${backendUrl}/api/v1/hr/employees`);
        const json = await res.json();
        setEmployees(json?.employees || json?.data || []);
      } else if (tab === 'attendance') {
        const res = await fetch(`${backendUrl}/api/v1/hr/leave-requests`).catch(() => null);
        const json = res ? await res.json() : { leave_requests: [] };
        setLeaveRequests(json?.leave_requests || json?.data || []);
      } else if (tab === 'education') {
        const res = await fetch(`${backendUrl}/api/v1/education/dashboard`).catch(() => null);
        setEducation(res ? await res.json() : null);
      } else if (tab === 'analytics') {
        const [ha, ai] = await Promise.all([
          fetch(`${backendUrl}/api/v1/healthcare/analytics`).then(r=>r.json()).catch(()=>null),
          fetch(`${backendUrl}/api/v1/ai-analytics/dashboard`).then(r=>r.json()).catch(()=>null)
        ]);
        setHealthcareAnalytics(ha?.data || ha || null);
        setAiAnalytics(ai || null);
      } else if (tab === 'compliance') {
        const res = await fetch(`${backendUrl}/api/v1/compliance/dashboard`).catch(() => null);
        setCompliance(res ? await res.json() : null);
      } else if (tab === 'storage') {
        const res = await fetch(`${backendUrl}/api/v1/cloud-storage/dashboard`).catch(() => null);
        setStorage(res ? await res.json() : null);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData('dashboard');
  }, []);

  useEffect(() => {
    if (activeTab && activeTab !== 'patients') {
      loadTabData(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
  return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
                        <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        {stat.change && <p className={`text-sm ${stat.color}`}>{stat.change}</p>}
        </div>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
        </div>
                  </CardContent>
                </Card>
              ))}
      </div>

            <Card className="bg-white text-sm">
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {patients.slice(0,5).map((p:any) => (
                    <li key={p.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-600">{p.status || 'active'}</p>
                      </div>
                      <Badge>{p.room || '—'}</Badge>
                    </li>
                  ))}
                  {patients.length === 0 && <li className="text-gray-500">No recent patients</li>}
                </ul>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Card className="bg-white text-sm">
                <CardHeader>
                  <CardTitle>Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {recentAppointments.slice(0,5).map((a:any, i:number) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{a.type || 'Appointment'} {a.date ? `• ${a.date}` : ''}</p>
                          <p className="text-xs text-gray-600">{a.status || 'scheduled'} {a.reason ? `• ${a.reason}` : ''}</p>
                        </div>
                        <Badge variant="secondary">{a.duration ? `${a.duration}m` : '—'}</Badge>
                      </li>
                    ))}
                    {recentAppointments.length === 0 && <li className="text-gray-500">No recent appointments</li>}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-white text-sm">
                <CardHeader>
                  <CardTitle>Recent Test Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {recentTests.slice(0,5).map((t:any, i:number) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{t.testName || 'Test'} {t.resultDate ? `• ${t.resultDate}` : ''}</p>
                          <p className="text-xs text-gray-600">{t.status || 'completed'} {t.category ? `• ${t.category}` : ''}</p>
                        </div>
                        <Badge variant="outline">{t.lab || '—'}</Badge>
                      </li>
                    ))}
                    {recentTests.length === 0 && <li className="text-gray-500">No recent test results</li>}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {loading ? (
                  <div>Loading…</div>
                ) : (
                  <ul className="space-y-2">
                    {patients.slice(0, 5).map((p) => (
                      <li key={p.id} className="p-2 border rounded">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">Room {p.room} • {p.status}</div>
                      </li>
                    ))}
                    {patients.length === 0 && <li className="text-gray-500">No patients</li>}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            {role === 'admin' ? (
              <TenantAdminPanel />
            ) : (
              <div className="text-gray-600">Admin settings are restricted.</div>
            )}
            {require('../../components/BillingPanel').default()}
          </div>
        );
      case 'patients':
        return (
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patients</CardTitle>
                <Link href="/patient-portal" className="inline-flex">
                  <Button size="sm" variant="outline">Open Patient Portal</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {loading ? (
                <div>Loading…</div>
              ) : (
                <ul className="space-y-2">
                  {patients.map((p) => (
                    <li key={p.id} className="p-3 border rounded">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-gray-600 text-sm">Age {p.age} • Room {p.room} • {p.status}</div>
                    </li>
                  ))}
                  {patients.length === 0 && <li className="text-gray-500">No patients</li>}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{navigationItems.find(item => item.id === activeTab)?.name}</h2>
            <Card className="bg-white">
              <CardContent className="p-6">
                {activeTab === 'autism-center' ? (
                  <div className="space-y-6">
                    {/* Autism Technology KPI cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Patients', value: autismDashboard?.totalPatients ?? '—' },
                        { label: 'Active Sessions', value: autismDashboard?.activeSessions ?? '—' },
                        { label: 'Avg Progress', value: `${Math.round(autismDashboard?.averageProgress ?? 0)}%` },
                        { label: 'System Health', value: `${Math.round(autismDashboard?.systemHealth ?? 0)}%` },
                      ].map((kpi, idx) => (
                        <Card key={idx} className="bg-white"><CardContent className="p-4">
                          <div className="text-xs text-gray-600">{kpi.label}</div>
                          <div className="text-xl font-semibold">{kpi.value}</div>
                        </CardContent></Card>
        ))}
      </div>

                    {/* Recent Autism Patients */}
                    <Card className="bg-white">
                      <CardHeader><CardTitle>Autism Patients</CardTitle></CardHeader>
                      <CardContent className="pt-0">
                        <ul className="space-y-2">
                          {autismPatients.slice(0,8).map((p:any, i:number) => (
                            <li key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div>
                                <p className="font-medium text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-600">{p.diagnosis} • {p.severity}</p>
                              </div>
                              <Badge>{p.status || 'active'}</Badge>
                            </li>
                          ))}
                          {autismPatients.length === 0 && <li className="text-gray-500">No patients</li>}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Sessions and Activities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-white">
                        <CardHeader><CardTitle>Therapy Sessions</CardTitle></CardHeader>
                        <CardContent className="pt-0">
                          <ul className="space-y-2">
                            {autismSessions.slice(0,6).map((s:any, i:number) => (
                              <li key={i} className="p-3 border rounded">
                                <div className="font-medium">{s.type} • {s.date}</div>
                                <div className="text-xs text-gray-600">{s.therapist} • {s.duration}m • {s.status}</div>
                              </li>
                            ))}
                            {autismSessions.length === 0 && <li className="text-gray-500">No sessions</li>}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="bg-white">
                        <CardHeader><CardTitle>Sensory Activities</CardTitle></CardHeader>
                        <CardContent className="pt-0">
                          <ul className="space-y-2">
                            {autismActivities.slice(0,6).map((a:any, i:number) => (
                              <li key={i} className="p-3 border rounded">
                                <div className="font-medium">{a.name} ({a.type})</div>
                                <div className="text-xs text-gray-600">{a.duration}m • {a.difficulty} • Success {a.successRate}%</div>
                              </li>
                            ))}
                            {autismActivities.length === 0 && <li className="text-gray-500">No activities</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Communication Tools */}
                    <Card className="bg-white">
                      <CardHeader><CardTitle>Communication Tools</CardTitle></CardHeader>
                      <CardContent className="pt-0">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {autismTools.slice(0,8).map((t:any, i:number) => (
                            <li key={i} className="p-3 border rounded">
                              <div className="font-medium">{t.name} ({t.type})</div>
                              <div className="text-xs text-gray-600">Effectiveness {t.effectiveness}% • Used {t.usageCount}x</div>
                            </li>
                          ))}
                          {autismTools.length === 0 && <li className="text-gray-500">No tools</li>}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ) : activeTab === 'employment' ? (
                  <div className="space-y-4">
                    {error && <div className="text-red-600 mb-2">{error}</div>}
                    {loading ? (
                      <div>Loading…</div>
                    ) : (
                      <ul className="space-y-2">
                        {employees.map((e:any, i:number) => (
                          <li key={i} className="p-3 border rounded">
                            <div className="font-medium">{e.name || e.full_name || e.employee_id || 'Employee'}</div>
                            <div className="text-sm text-gray-600">{e.department || ''} {e.position ? `• ${e.position}` : ''}</div>
                          </li>
                        ))}
                        {employees.length === 0 && <li className="text-gray-500">No employees</li>}
                      </ul>
                    )}
                  </div>
                ) : activeTab === 'attendance' ? (
                  <div className="space-y-4">
                    {error && <div className="text-red-600 mb-2">{error}</div>}
                    {loading ? (
                      <div>Loading…</div>
                    ) : (
                      <ul className="space-y-2">
                        {leaveRequests.map((lr:any, i:number) => (
                          <li key={i} className="p-3 border rounded">
                            <div className="font-medium">{lr.employee_name || lr.employeeId || 'Employee'}</div>
                            <div className="text-sm text-gray-600">{lr.type || 'Leave'} {lr.status ? `• ${lr.status}` : ''}</div>
                          </li>
                        ))}
                        {leaveRequests.length === 0 && <li className="text-gray-500">No leave requests</li>}
                      </ul>
                    )}
                  </div>
                ) : activeTab === 'education' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Courses</div><div className="text-2xl font-semibold">{education?.courses ?? '—'}</div></CardContent></Card>
                      <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Students</div><div className="text-2xl font-semibold">{education?.students ?? '—'}</div></CardContent></Card>
                      <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Sessions</div><div className="text-2xl font-semibold">{education?.sessions ?? '—'}</div></CardContent></Card>
                    </div>
                  </div>
                ) : activeTab === 'compliance' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card><CardContent className="p-4">
                        <div className="text-sm text-gray-600">Audits</div>
                        <div className="text-2xl font-semibold">{compliance?.audits ?? '—'}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4">
                        <div className="text-sm text-gray-600">Incidents</div>
                        <div className="text-2xl font-semibold">{compliance?.incidents ?? '—'}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4">
                        <div className="text-sm text-gray-600">Score</div>
                        <div className="text-2xl font-semibold">{compliance?.score ?? '—'}</div>
                      </CardContent></Card>
                    </div>
                  </div>
                ) : activeTab === 'storage' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card><CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Files</div>
                        <div className="text-2xl font-semibold">{storage?.total_files ?? '—'}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4">
                        <div className="text-sm text-gray-600">Used Storage</div>
                        <div className="text-2xl font-semibold">{storage?.used_storage ?? '—'}</div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4">
                        <div className="text-sm text-gray-600">Buckets</div>
                        <div className="text-2xl font-semibold">{storage?.buckets ?? '—'}</div>
                      </CardContent></Card>
                  </div>
                </div>
                ) : (
                  <div className="text-gray-600">No additional content for this tab yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Vertical Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-600" />
              <h1 className="text-lg font-bold text-gray-900">Healthcare Hub</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems
              .filter(item => {
                if (item.id === 'settings' && role !== 'admin') return false;
                return true;
              })
              .map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    if (item.id === 'patients') {
                      router.push('/patient-portal');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
                  <div>
              <h1 className="text-xl font-bold text-gray-900">Healthcare Hub Pro</h1>
              <p className="text-xs text-gray-600">Comprehensive healthcare management system</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2">3</Badge>
              </Button>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}