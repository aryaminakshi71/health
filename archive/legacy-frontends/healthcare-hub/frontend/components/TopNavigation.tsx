'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Home, Users, Calendar, Clipboard, BarChart3, FileText, Settings } from 'lucide-react'

interface TopNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TopNavigation({ activeTab, onTabChange }: TopNavigationProps) {
  const tabs = [
    { id: 'tenant-dashboard', name: 'Dashboard', icon: Home },
    { id: 'patients', name: 'Patients', icon: Users },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'medical-records', name: 'Medical Records', icon: Clipboard },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'billing', name: 'Billing', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            <span>{tab.name}</span>
          </Button>
        )
      })}
    </div>
  )
}


