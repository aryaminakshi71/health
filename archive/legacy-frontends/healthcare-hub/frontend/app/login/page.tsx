"use client";

import React, { useState } from 'react';
import AuthLogin from './auth-login';
import {Button, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle} from './components/ui';
import {Eye, AlertTriangle, Lock, Building2, Crown, Gift, Building, EyeOff, ArrowRight} from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from './components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {};

  const demoCredentials = {
    admin: { email: 'admin@erpsurveivoip.com', password: 'admin123' },
    client: { email: 'client@healthcareplus.com', password: 'client123' },
    trial: { email: 'trial@example.com', password: 'trial123' }
  };

  const fillDemoCredentials = () => {
    const credentials = demoCredentials[activeTab as keyof typeof demoCredentials];
    setFormData({
      email: credentials.email,
      password: credentials.password,
      company: activeTab === 'client' ? 'HealthCare Plus' : ''
    });
  };

  const portalInfo = {
    admin: {
      title: "Admin Portal",
      description: "Complete system administration and client management",
      features: ["Manage 50+ clients", "Track $410K/month revenue", "All 22 modules access", "System administration"],
      icon: Crown,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-900",
      badge: "Full Access"
    },
    client: {
      title: "Client Portal", 
      description: "Access to purchased business modules and team management",
      features: ["5 purchased modules", "45 team users", "Business analytics", "Team management"],
      icon: Building2,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
      badge: "Purchased Modules"
    },
    trial: {
      title: "Trial Portal",
      description: "Free trial access to evaluate business modules",
      features: ["16 trial modules", "5 trial users", "Limited functionality", "Upgrade prompts"],
      icon: Gift,
      color: "bg-green-50 border-green-200", 
      textColor: "text-green-900",
      badge: "Free Trial"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ERPSurveiVoip</h1>
          <p className="text-gray-600">Choose your portal access level</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(portalInfo).map(([key, info]) => (
            <Card key={key} className={`border-2 ${info.color} hover:shadow-lg transition-shadow`}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${info.color.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                    <info.icon className={`w-8 h-8 ${info.textColor}`} />
                  </div>
                </div>
                <CardTitle className={info.textColor}>{info.title}</CardTitle>
                <CardDescription className="text-gray-600">{info.description}</CardDescription>
                <Badge variant="secondary" className="mt-2">{info.badge}</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Portal Login</CardTitle>
            <CardDescription className="text-center">
              Select your portal type and enter your credentials
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Client
                </TabsTrigger>
                <TabsTrigger value="trial" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Trial
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="admin" className="space-y-4">
                  <div>
                    <AuthLogin appKey='hh' />
                  </div>
                  <Button onClick={fillDemoCredentials} variant="outline" className="w-full">Use Demo Credentials</Button>
                </TabsContent>

                 <TabsContent value="client" className="space-y-4"><AuthLogin appKey='hh' /></TabsContent>

                 <TabsContent value="trial" className="space-y-4"><AuthLogin appKey='hh' /></TabsContent>

                </div>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact support at{' '}
            <Link href="mailto:support@erpsurveivoip.com" className="text-blue-600 hover:underline">
              support@erpsurveivoip.com
            </Link>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-900">Admin Portal</h3>
            <p className="text-sm text-purple-700">Full system access</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">Client Portal</h3>
            <p className="text-sm text-blue-700">Purchased modules</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Trial Portal</h3>
            <p className="text-sm text-green-700">Free trial access</p>
          </div>
        </div>
      </div>
    </div>
  );
} 