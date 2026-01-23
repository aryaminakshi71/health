'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Home, Users, Calendar, FileText, BarChart3, Settings, Activity } from 'lucide-react'

interface RoleBasedNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole?: 'admin' | 'user'
  stats?: Record<string, unknown>
}

export default function RoleBasedNavigation({
  activeTab,
  onTabChange,
  userRole = 'admin',
  stats = {}
}: RoleBasedNavigationProps) {
  const tabs = [
    { id: 'tenant-dashboard', name: 'Dashboard', icon: Home },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'medical-records', name: 'Medical Records', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'telesitting', name: 'Telesitting', icon: Activity },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  return (
    <nav className="flex space-x-2 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            style={{ cursor: 'pointer' }}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            {tab.name}
            {tab.badge && (
              <Badge variant="destructive" className="ml-1">
                {tab.badge}
              </Badge>
            )}
          </Button>
        )
      })}
    </nav>
  )
}
