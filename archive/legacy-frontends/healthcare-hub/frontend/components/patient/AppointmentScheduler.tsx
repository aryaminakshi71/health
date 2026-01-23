"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { AppointmentRequest, Provider } from './interfaces/patient';

interface AppointmentSchedulerProps {
  patientId: string;
  onSchedule: (appointment: AppointmentRequest) => void;
  onCancel: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  providerId?: string;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

export default function AppointmentScheduler({ patientId, onSchedule, onCancel }: AppointmentSchedulerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [notes, setNotes] = useState<string>('');
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirm'>('date');
  const [loading, setLoading] = useState(false);

  // Mock providers data
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      specialty: 'Primary Care',
      phone: '(555) 111-2222',
      email: 'dr.smith@healthcare.com',
      office: {
        street: '456 Medical Center Dr',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      isPrimary: true
    },
    {
      id: '2',
      name: 'Dr. Michael Johnson',
      specialty: 'Cardiology',
      phone: '(555) 333-4444',
      email: 'dr.johnson@healthcare.com',
      office: {
        street: '789 Heart Center Blvd',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      isPrimary: false
    },
    {
      id: '3',
      name: 'Dr. Emily Davis',
      specialty: 'Dermatology',
      phone: '(555) 555-6666',
      email: 'dr.davis@healthcare.com',
      office: {
        street: '321 Skin Care Ave',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      isPrimary: false
    }
  ];

  const appointmentTypes = [
    { value: 'checkup', label: 'Annual Checkup' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'emergency', label: 'Emergency Visit' }
  ];

  const urgencyLevels = [
    { value: 'routine', label: 'Routine', color: 'bg-green-100 text-green-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
  ];

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Generate time slots for a day
  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = Math.random() > 0.3; // 70% availability for demo
        slots.push({
          time,
          available,
          providerId: available ? providers[Math.floor(Math.random() * providers.length)].id : undefined
        });
      }
    }

    return slots;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('details');
  };

  const handleNext = () => {
    if (step === 'date' && selectedDate) {
      setStep('time');
    } else if (step === 'time' && selectedTime) {
      setStep('details');
    } else if (step === 'details' && appointmentType && selectedProvider) {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'time') {
      setStep('date');
    } else if (step === 'details') {
      setStep('time');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  const handleSchedule = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const appointment: AppointmentRequest = {
      patientId,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      type: appointmentType,
      reason,
      urgency,
      preferredProvider: selectedProvider,
      notes
    };

    onSchedule(appointment);
    setLoading(false);
  };

  const getProviderName = (providerId: string) => {
    return providers.find(p => p.id === providerId)?.name || 'Unknown';
  };

  const days = getDaysInMonth(currentMonth);
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Schedule Appointment</h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {['date', 'time', 'details', 'confirm'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-blue-600 text-white' 
                    : index < ['date', 'time', 'details', 'confirm'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['date', 'time', 'details', 'confirm'].indexOf(step) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < ['date', 'time', 'details', 'confirm'].indexOf(step)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Date</h3>
              
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="sm" onClick={() => {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
                }}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h4 className="text-lg font-medium">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <Button variant="outline" size="sm" onClick={() => {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
                }}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => (
                  <div key={index} className="p-2">
                    {day ? (
                      <button
                        onClick={() => handleDateSelect(day)}
                        className={`w-full h-10 rounded-lg text-sm font-medium transition-colors ${
                          selectedDate === day.toISOString().split('T')[0]
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    ) : (
                      <div className="w-full h-10" />
                    )}
                  </div>
                ))}
              </div>

              {selectedDate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected: {formatDate(new Date(selectedDate))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 'time' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Time</h3>
              <p className="text-gray-600 mb-6">
                Available times for {formatDate(new Date(selectedDate))}
              </p>

              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === slot.time
                        ? 'bg-blue-600 text-white'
                        : slot.available
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div>{formatTime(slot.time)}</div>
                    {slot.available && (
                      <div className="text-xs mt-1 opacity-75">
                        {getProviderName(slot.providerId!)}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedTime && (
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    Selected: {formatTime(selectedTime)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Appointment Details */}
          {step === 'details' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-gray-500">{provider.specialty}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe the reason for your visit..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <div className="flex gap-2">
                    {urgencyLevels.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setUrgency(level.value as any)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          urgency === level.value
                            ? level.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirm Appointment</h3>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(selectedDate))} at {formatTime(selectedTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Provider</p>
                    <p className="text-sm text-gray-600">
                      {getProviderName(selectedProvider)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Appointment Type</p>
                    <p className="text-sm text-gray-600">
                      {appointmentTypes.find(t => t.value === appointmentType)?.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Urgency</p>
                    <p className="text-sm text-gray-600">
                      {urgencyLevels.find(l => l.value === urgency)?.label}
                    </p>
                  </div>
                </div>

                {reason && (
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Reason</p>
                      <p className="text-sm text-gray-600">{reason}</p>
                    </div>
                  </div>
                )}

                {notes && (
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Notes</p>
                      <p className="text-sm text-gray-600">{notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-blue-800">
                  <Info className="w-4 h-4 inline mr-2" />
                  You will receive a confirmation email and reminder notifications for this appointment.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 'date'}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              
              {step === 'confirm' ? (
                <Button onClick={handleSchedule} disabled={loading}>
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={
                  (step === 'date' && !selectedDate) ||
                  (step === 'time' && !selectedTime) ||
                  (step === 'details' && (!appointmentType || !selectedProvider))
                }>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 