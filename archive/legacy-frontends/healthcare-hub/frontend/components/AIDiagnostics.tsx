"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { LoadingSkeleton, ErrorBoundary, StatusIndicator, Notification } from '@/components/ui/EnhancedUI';
import { 
  Camera, 
  Brain, 
  Eye, 
  FileText, 
  Settings, 
  Download, 
  Share,
  Play,
  Pause,
  Save,
  RefreshCw,
  AlertTriangle,
  Target,
  CheckCircle,
  Activity,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface DiagnosticResult {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string[];
  aiDiagnosis: string;
  confidence: number;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  reviewed: boolean;
  reviewedBy?: string;
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
    whiteBloodCells: number;
    platelets: number;
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
  };
}

interface SymptomAnalysis {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  frequency: string;
  associatedSymptoms: string[];
  possibleConditions: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface TreatmentRecommendation {
  id: string;
  condition: string;
  treatment: string;
  dosage?: string;
  duration: string;
  sideEffects: string[];
  effectiveness: number;
  cost: number;
  insuranceCoverage: boolean;
}

export function AIDiagnostics() {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticResult | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Mock data
  const diagnostics: DiagnosticResult[] = [
    {
      id: '1',
      patientId: 'P001',
      patientName: 'John Smith',
      symptoms: ['fever', 'cough', 'fatigue'],
      aiDiagnosis: 'Upper Respiratory Infection',
      confidence: 87.5,
      recommendations: ['Rest', 'Hydration', 'Over-the-counter medication'],
      riskLevel: 'low',
      timestamp: '2024-01-15T10:30:00Z',
      reviewed: false,
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        oxygenSaturation: 98,
        weight: 70,
        height: 175,
        bmi: 22.9
      },
      labResults: {
        cholesterol: 180,
        glucose: 95,
        hemoglobin: 14.2,
        whiteBloodCells: 7.5,
        platelets: 250
      },
      medicalHistory: {
        conditions: ['Hypertension'],
        medications: ['Lisinopril'],
        allergies: ['Penicillin'],
        surgeries: ['Appendectomy']
      }
    },
    {
      id: '2',
      patientId: 'P002',
      patientName: 'Sarah Johnson',
      symptoms: ['chest pain', 'shortness of breath', 'dizziness'],
      aiDiagnosis: 'Possible Cardiac Event',
      confidence: 92.3,
      recommendations: ['Immediate ECG', 'Cardiac enzymes', 'Cardiology consult'],
      riskLevel: 'critical',
      timestamp: '2024-01-15T11:15:00Z',
      reviewed: true,
      reviewedBy: 'Dr. Wilson',
      vitalSigns: {
        bloodPressure: '140/90',
        heartRate: 95,
        temperature: 99.2,
        oxygenSaturation: 94,
        weight: 65,
        height: 165,
        bmi: 23.9
      },
      labResults: {
        cholesterol: 220,
        glucose: 110,
        hemoglobin: 13.8,
        whiteBloodCells: 8.2,
        platelets: 280
      },
      medicalHistory: {
        conditions: ['Diabetes', 'Hypertension'],
        medications: ['Metformin', 'Amlodipine'],
        allergies: ['Sulfa drugs'],
        surgeries: ['C-section']
      }
    }
  ];

  const symptomAnalysis: SymptomAnalysis[] = [
    {
      symptom: 'Fever',
      severity: 'moderate',
      duration: '3 days',
      frequency: 'Continuous',
      associatedSymptoms: ['chills', 'sweating', 'headache'],
      possibleConditions: ['Viral infection', 'Bacterial infection', 'Inflammatory condition'],
      urgency: 'medium'
    },
    {
      symptom: 'Chest Pain',
      severity: 'severe',
      duration: '2 hours',
      frequency: 'Intermittent',
      associatedSymptoms: ['shortness of breath', 'nausea', 'sweating'],
      possibleConditions: ['Angina', 'Myocardial infarction', 'Pulmonary embolism'],
      urgency: 'critical'
    }
  ];

  const treatments: TreatmentRecommendation[] = [
    {
      id: '1',
      condition: 'Upper Respiratory Infection',
      treatment: 'Supportive care',
      duration: '7-10 days',
      sideEffects: ['None'],
      effectiveness: 85,
      cost: 50,
      insuranceCoverage: true
    },
    {
      id: '2',
      condition: 'Hypertension',
      treatment: 'Lisinopril 10mg daily',
      dosage: '10mg once daily',
      duration: 'Lifetime',
      sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia'],
      effectiveness: 75,
      cost: 25,
      insuranceCoverage: true
    }
  ];

  const addNotification = (notification: any) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
  };

  const analyzeSymptoms = async (symptoms: string[]) => {
    setIsAnalyzing(true);
    addNotification({
      type: 'info',
      title: 'AI Analysis Started',
      message: 'Analyzing symptoms with AI...',
      autoClose: true,
      duration: 2000
    });

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: 'AI analysis completed successfully',
        autoClose: true,
        duration: 3000
      });
    }, 3000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Diagnostics</h1>
          <p className="text-gray-600">Advanced AI-powered medical diagnostics and analysis</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              HIPAA Compliant
            </Badge>
            <StatusIndicator status="online" size="sm" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => addNotification({
                type: 'info',
                title: 'Image Analysis',
                message: 'Medical image analysis tool opened',
                autoClose: true,
                duration: 2000
              })}
            >
              <Camera className="h-4 w-4" />
              Image Analysis
            </Button>
            <Button
              onClick={() => analyzeSymptoms(['fever', 'cough'])}
            >
              <Brain className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="symptoms">Symptom Analysis</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnostics.map((diagnostic) => (
              <Card key={diagnostic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{diagnostic.patientName}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(diagnostic.riskLevel)}`} />
                  </div>
                  <CardDescription>
                    {diagnostic.aiDiagnosis}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence</span>
                      <span className="font-medium">{diagnostic.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={diagnostic.confidence} className="w-full" />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Symptoms</h4>
                      <div className="flex flex-wrap gap-1">
                        {diagnostic.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Vital Signs</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">BP</span>
                          <p className="font-medium">{diagnostic.vitalSigns.bloodPressure}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">HR</span>
                          <p className="font-medium">{diagnostic.vitalSigns.heartRate} bpm</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Temp</span>
                          <p className="font-medium">{diagnostic.vitalSigns.temperature}°F</p>
                        </div>
                        <div>
                          <span className="text-gray-600">O2</span>
                          <p className="font-medium">{diagnostic.vitalSigns.oxygenSaturation}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedDiagnostic(diagnostic)}
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNotification({
                          type: 'success',
                          title: 'Report Generated',
                          message: `Diagnostic report for ${diagnostic.patientName} generated`,
                          autoClose: true,
                          duration: 3000
                        })}
                      >
                        <FileText className="h-4 w-4" />
                        Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Symptom Analysis Tab */}
        <TabsContent value="symptoms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {symptomAnalysis.map((analysis, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{analysis.symptom}</CardTitle>
                    <Badge className={getUrgencyColor(analysis.urgency)}>
                      {analysis.urgency}
                    </Badge>
                  </div>
                  <CardDescription>
                    Severity: {analysis.severity} | Duration: {analysis.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Associated Symptoms</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.associatedSymptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Possible Conditions</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.possibleConditions.map((condition, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => analyzeSymptoms([analysis.symptom])}
                      >
                        <Brain className="h-4 w-4" />
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNotification({
                          type: 'info',
                          title: 'Symptom Tracking',
                          message: `Tracking ${analysis.symptom} symptoms`,
                          autoClose: true,
                          duration: 2000
                        })}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Track
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {treatments.map((treatment) => (
              <Card key={treatment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{treatment.condition}</CardTitle>
                    <Badge variant={treatment.insuranceCoverage ? 'outline' : 'destructive'}>
                      {treatment.insuranceCoverage ? 'Covered' : 'Not Covered'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {treatment.treatment}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Effectiveness</span>
                      <span className="font-medium">{treatment.effectiveness}%</span>
                    </div>
                    <Progress value={treatment.effectiveness} className="w-full" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration</span>
                        <p className="font-medium">{treatment.duration}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Cost</span>
                        <p className="font-medium">${treatment.cost}</p>
                      </div>
                    </div>
                    
                    {treatment.dosage && (
                      <div>
                        <span className="text-gray-600 text-sm">Dosage</span>
                        <p className="font-medium text-sm">{treatment.dosage}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Side Effects</h4>
                      <div className="flex flex-wrap gap-1">
                        {treatment.sideEffects.map((effect, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => addNotification({
                          type: 'success',
                          title: 'Treatment Prescribed',
                          message: `${treatment.treatment} prescribed`,
                          autoClose: true,
                          duration: 3000
                        })}
                      >
                        <Brain className="h-4 w-4" />
                        Prescribe
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNotification({
                          type: 'warning',
                          title: 'Side Effects',
                          message: `Reviewing side effects for ${treatment.treatment}`,
                          autoClose: true,
                          duration: 2000
                        })}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Diagnoses</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">567</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89.7%</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis Trends</CardTitle>
                <CardDescription>
                  Monthly diagnosis volume and accuracy trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  Chart placeholder - Diagnosis trends over time
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Distribution of patient risk levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  Chart placeholder - Risk level distribution
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notifications */}
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
  );
} 