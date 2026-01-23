'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/layouts/Navigation';
import { Sidebar } from '@shared/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  Activity, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  UserPlus,
  FileText,
  Phone,
  Video,
  MessageSquare,
  Settings,
  Bell,
  Heart,
  Brain,
  Building,
  Shield,
  BarChart3,
  Stethoscope,
  Clipboard,
  Server,
  Zap,
  ShieldCheck,
  Calendar as CalendarIcon
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  activeAppointments: number
  revenue: number
  growthRate: number
  pendingTasks: number
  systemHealth: number
}

interface RecentActivity {
  id: string
  type: 'appointment' | 'patient' | 'payment' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

const moduleCards = [
  {
    title: 'Healthcare',
    description: 'Patient management, EHR, telemedicine',
    icon: Heart,
    href: '/modules/healthcare',
    color: 'bg-red-500',
    badge: 'Enhanced'
  },
  {
    title: 'Finance & Billing',
    description: 'Billing, invoicing, expense management',
    icon: DollarSign,
    href: '/modules/finance',
    color: 'bg-green-500'
  },
  {
    title: 'Analytics',
    description: 'Real-time dashboards and insights',
    icon: BarChart3,
    href: '/modules/analytics',
    color: 'bg-blue-500'
  },
  {
    title: 'Operations',
    description: 'Project management and operations',
    icon: Building,
    href: '/modules/operations',
    color: 'bg-purple-500'
  },
  {
    title: 'AI Assistant',
    description: 'Machine learning and AI tools',
    icon: Brain,
    href: '/modules/ai-assistant',
    color: 'bg-indigo-500'
  },
  {
    title: 'Autism Care',
    description: 'Specialized autism care management',
    icon: Brain,
    href: '/modules/autism',
    color: 'bg-pink-500'
  },
  {
    title: 'Administration',
    description: 'User management and system admin',
    icon: Settings,
    href: '/modules/administration',
    color: 'bg-gray-500'
  },
  {
    title: 'Healthcare',
    description: 'Electronic Health Records',
    icon: Stethoscope,
    href: '/modules/healthcare',
    color: 'bg-teal-500'
  },
  {
    title: 'Communication Hub',
    description: 'Messaging and communication tools',
    icon: MessageSquare,
    href: '/modules/communication-hub',
    color: 'bg-orange-500'
  },
  {
    title: 'Security',
    description: 'HIPAA compliance and security',
    icon: ShieldCheck,
    href: '/modules/security',
    color: 'bg-yellow-500'
  },
  {
    title: 'Infrastructure',
    description: 'Advanced enterprise capabilities',
    icon: Building,
    href: '/modules/infrastructure',
    color: 'bg-cyan-500'
  },
  {
    title: 'Workflow Automation',
    description: 'Automate business processes',
    icon: Zap,
    href: '/modules/workflow-automation',
    color: 'bg-emerald-500'
  }
]

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeAppointments: 0,
    revenue: 0,
    growthRate: 0,
    pendingTasks: 0,
    systemHealth: 100
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => { 
      // Simulate API calls with realistic data
      const mockStats: DashboardStats = {
        totalPatients: Math.floor(Math.random() * 1000) + 500,
        activeAppointments: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 50000) + 25000,
        growthRate: Math.random() * 20 - 5, // -5% to +15%
        pendingTasks: Math.floor(Math.random() * 20) + 5,
        systemHealth: Math.floor(Math.random() * 20) + 80 // 80-100%
      }

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'New appointment scheduled',
          description: 'Dr. Smith - Patient John Doe - Tomorrow 2:00 PM',
          timestamp: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: '2',
          type: 'patient',
          title: 'New patient registered',
          description: 'Sarah Johnson - Primary Care',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: '3',
          type: 'payment',
          title: 'Payment received',
          description: '$150.00 - Consultation fee',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed'
        },
        {
          id: '4',
          type: 'system',
          title: 'System backup completed',
          description: 'Daily backup successful',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          status: 'completed'
        }
      ]

      setStats(mockStats)
      setRecentActivity(mockActivity)

      // Check online status
      setIsOnline(navigator.onLine)
    
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-4 w-4" />
      case 'patient': return <Users className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ERP Platform Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Complete healthcare software foundation for modern medical practices
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 20) + 5} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 10) + 2} scheduled today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.systemHealth}%</div>
                <Progress value={stats.systemHealth} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Module Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {moduleCards.map((module) => (
                <Card 
                  key={module.title}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(module.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${module.color} text-white`}>
                        <module.icon className="h-5 w-5" />
                      </div>
                      {module.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {module.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Access Module</span>
                      <TrendingUp className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/modules/healthcare')}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span className="text-xs">Add Patient</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/modules/finance')}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Create Invoice</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/modules/analytics')}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">View Reports</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => router.push('/modules/administration')}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-xs">System Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )

}