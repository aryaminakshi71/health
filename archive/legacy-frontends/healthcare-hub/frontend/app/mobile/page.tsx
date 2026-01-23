"use client";

import React, { useState, useEffect } from 'react';
import {Button, Tabs, TabsContent, TabsList, TabsTrigger, Input, Card, CardContent, CardHeader, CardTitle} from './components/ui';
import {Plus, Search, Settings, Calendar, MessageSquare, Video, Bell, Phone, FileText, Clock, File, User, Menu, Home, Filter, MapPin, ChevronRight, X} from "lucide-react";
import { Badge } from './components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import BackLink from '@/components/layout/BackLink';

// Mobile-specific interfaces
interface MobileUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
}

interface MobileAppointment {
  id: number;
  patient_name: string;
  physician_name: string;
  date: string;
  time: string;
  type: 'in-person' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

interface MobileMessage {
  id: number;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  timestamp: string;
  unread: boolean;
}

interface MobileNotification {
  id: number;
  title: string;
  message: string;
  type: 'appointment' | 'message' | 'reminder' | 'alert';
  timestamp: string;
  read: boolean;
}

export default function MobileApp() {
  const [currentUser, setCurrentUser] = useState<MobileUser>({
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@healthcare.com',
    role: 'physician',
    status: 'online'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile-optimized data
  const [appointments, setAppointments] = useState<MobileAppointment[]>([
    {
      id: 1,
      patient_name: 'John Doe',
      physician_name: 'Dr. Sarah Johnson',
      date: '2024-06-01',
      time: '10:00 AM',
      type: 'in-person',
      status: 'confirmed',
      location: 'Main Clinic - Room 3',
      notes: 'Follow-up for hypertension'
    },
    {
      id: 2,
      patient_name: 'Emma Wilson',
      physician_name: 'Dr. Sarah Johnson',
      date: '2024-06-01',
      time: '2:30 PM',
      type: 'telemedicine',
      status: 'scheduled',
      notes: 'Initial consultation'
    }
  ]);

  const [messages, setMessages] = useState<MobileMessage[]>([
    {
      id: 1,
      sender_name: 'John Doe',
      content: 'Hi Dr. Johnson, I have a question about my medication.',
      timestamp: '2 min ago',
      unread: true
    },
    {
      id: 2,
      sender_name: 'Emma Wilson',
      content: 'Thank you for the appointment today.',
      timestamp: '1 hour ago',
      unread: false
    }
  ]);

  const [notifications, setNotifications] = useState<MobileNotification[]>([
    {
      id: 1,
      title: 'Appointment Reminder',
      message: 'You have an appointment with John Doe in 30 minutes',
      type: 'appointment',
      timestamp: '5 min ago',
      read: false
    },
    {
      id: 2,
      title: 'New Message',
      message: 'John Doe sent you a message',
      type: 'message',
      timestamp: '10 min ago',
      read: false
    }
  ]);

  // Mobile-specific functions
  const handleQuickAction = (action: string) => {
    // Handle different quick actions
  };

  const handleAppointmentAction = (appointmentId: number, action: string) => {
    // Handle appointment actions
  };

  const handleMessageAction = (messageId: number, action: string) => {
    // Handle message actions
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.physician_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter(msg =>
    msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Healthcare Mobile</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {currentUser.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Mobile Navigation and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="dashboard" className="text-xs">
              <Home className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs">
              <Calendar className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">
              <MessageSquare className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="patients" className="text-xs">
              <User className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="more" className="text-xs">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile Content */}
        <div className="p-4 space-y-4">
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold">{messages.filter(m => m.unread).length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleQuickAction('schedule')}
                  className="h-16 flex flex-col items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Schedule Appointment</span>
                </Button>
                <Button 
                  onClick={() => handleQuickAction('message')}
                  variant="outline"
                  className="h-16 flex flex-col items-center gap-2"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">Send Message</span>
                </Button>
                <Button 
                  onClick={() => handleQuickAction('call')}
                  variant="outline"
                  className="h-16 flex flex-col items-center gap-2"
                >
                  <Phone className="w-6 h-6" />
                  <span className="text-sm">Make Call</span>
                </Button>
                <Button 
                  onClick={() => handleQuickAction('video')}
                  variant="outline"
                  className="h-16 flex flex-col items-center gap-2"
                >
                  <Video className="w-6 h-6" />
                  <span className="text-sm">Video Call</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{appt.patient_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appt.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appt.date} at {appt.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={appt.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {filteredAppointments.map(appt => (
              <Card key={appt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{appt.patient_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appt.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{appt.physician_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {appt.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appt.time}
                        </div>
                        <div className="flex items-center gap-1">
                          {appt.type === 'telemedicine' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          {appt.type}
                        </div>
                      </div>
                      {appt.location && (
                        <p className="text-sm text-muted-foreground mt-1">
                          📍 {appt.location}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={appt.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appt.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleAppointmentAction(appt.id, 'call')}>
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAppointmentAction(appt.id, 'message')}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            {filteredMessages.map(msg => (
              <Card key={msg.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{msg.sender_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{msg.sender_name}</p>
                        <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {msg.content}
                      </p>
                      {msg.unread && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-500">New message</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleMessageAction(msg.id, 'reply')}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleMessageAction(msg.id, 'call')}>
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Patients List */}
          <div className="space-y-3">
            {appointments.map(appt => (
              <Card key={appt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{appt.patient_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appt.patient_name}</p>
                        <p className="text-sm text-muted-foreground">Last visit: {appt.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* More Tab */}
        <TabsContent value="more" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-3" />
                  Profile Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-3" />
                  App Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-3" />
                  Help & Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{appointments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{messages.length}</p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">95%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">4.8</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </div>
      </Tabs>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
        <div className="flex justify-around py-2">
          <Button
            variant={activeTab === 'dashboard' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center gap-1"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant={activeTab === 'appointments' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('appointments')}
            className="flex flex-col items-center gap-1"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Appointments</span>
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('messages')}
            className="flex flex-col items-center gap-1"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Messages</span>
          </Button>
          <Button
            variant={activeTab === 'patients' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('patients')}
            className="flex flex-col items-center gap-1"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Patients</span>
          </Button>
          <Button
            variant={activeTab === 'more' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('more')}
            className="flex flex-col items-center gap-1"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-3" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-3" />
                  Appointments
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Messages
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-3" />
                  Patients
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-3" />
                  Documents
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 