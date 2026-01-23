"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  Pill, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Truck, 
  Store, 
  AlertCircle,
  CheckCircle,
  X,
  Info,
  Calendar,
  CreditCard,
  User,
  Building
} from 'lucide-react';
import { Medication, PrescriptionRefill } from './interfaces/patient';

interface MedicationRefillRequestProps {
  patientId: string;
  medications: Medication[];
  onRequest: (refill: PrescriptionRefill) => void;
  onCancel: () => void;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  estimatedDeliveryTime: string;
}

export default function MedicationRefillRequest({ 
  patientId, 
  medications, 
  onRequest, 
  onCancel 
}: MedicationRefillRequestProps) {
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock pharmacies data
  const pharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'CVS Pharmacy',
      address: '123 Main St, Anytown, CA 90210',
      phone: '(555) 123-4567',
      email: 'cvs@pharmacy.com',
      deliveryAvailable: true,
      deliveryFee: 5.99,
      estimatedDeliveryTime: '2-3 hours'
    },
    {
      id: '2',
      name: 'Walgreens',
      address: '456 Oak Ave, Anytown, CA 90210',
      phone: '(555) 234-5678',
      email: 'walgreens@pharmacy.com',
      deliveryAvailable: true,
      deliveryFee: 4.99,
      estimatedDeliveryTime: '1-2 hours'
    },
    {
      id: '3',
      name: 'Rite Aid',
      address: '789 Pine St, Anytown, CA 90210',
      phone: '(555) 345-6789',
      email: 'riteaid@pharmacy.com',
      deliveryAvailable: false,
      deliveryFee: 0,
      estimatedDeliveryTime: 'N/A'
    }
  ];

  const activeMedications = medications.filter(med => med.status === 'active');

  const handleMedicationToggle = (medicationId: string) => {
    setSelectedMedications(prev => 
      prev.includes(medicationId)
        ? prev.filter(id => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  const handleRequest = async () => {
    if (selectedMedications.length === 0 || !selectedPharmacy) {
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const refills: PrescriptionRefill[] = selectedMedications.map(medicationId => ({
      id: `refill-${Date.now()}-${medicationId}`,
      prescriptionId: medicationId,
      patientId,
      requestedDate: new Date().toISOString(),
      status: 'pending',
      requestedBy: 'patient',
      notes: notes || undefined,
      estimatedReadyDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }));

    // For demo purposes, we'll just call onRequest with the first refill
    onRequest(refills[0]);
    setLoading(false);
  };

  const selectedPharmacyData = pharmacies.find(p => p.id === selectedPharmacy);
  const totalDeliveryFee = selectedPharmacyData?.deliveryAvailable && deliveryMethod === 'delivery' 
    ? selectedPharmacyData.deliveryFee 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Request Medication Refill</h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Medications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Medications</h3>
            {activeMedications.length > 0 ? (
              <div className="space-y-3">
                {activeMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMedications.includes(medication.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMedicationToggle(medication.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} - {medication.frequency}
                        </p>
                        <p className="text-sm text-gray-500">
                          Refills remaining: {medication.refillsRemaining}
                        </p>
                        <p className="text-sm text-gray-500">
                          Prescribed by: {medication.prescribedBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedMedications.includes(medication.id) && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                        <Badge className={medication.refillsRemaining > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {medication.refillsRemaining > 0 ? 'Available' : 'No Refills'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active medications found</p>
              </div>
            )}
          </div>

          {/* Step 2: Select Pharmacy */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Pharmacy</h3>
            <div className="space-y-3">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPharmacy === pharmacy.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{pharmacy.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {pharmacy.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4" />
                        {pharmacy.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="w-4 h-4" />
                        {pharmacy.email}
                      </div>
                      {pharmacy.deliveryAvailable && (
                        <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                          <Truck className="w-4 h-4" />
                          Delivery available - ${pharmacy.deliveryFee}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPharmacy === pharmacy.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                      <Badge className={pharmacy.deliveryAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {pharmacy.deliveryAvailable ? 'Delivery' : 'Pickup Only'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Delivery Method */}
          {selectedPharmacyData && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Delivery Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    deliveryMethod === 'pickup'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium">Pickup</h4>
                      <p className="text-sm text-gray-600">Pick up at pharmacy</p>
                      <p className="text-sm text-gray-500">Ready in 1-2 hours</p>
                    </div>
                  </div>
                </div>

                {selectedPharmacyData.deliveryAvailable && (
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      deliveryMethod === 'delivery'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-6 h-6 text-gray-600" />
                      <div>
                        <h4 className="font-medium">Delivery</h4>
                        <p className="text-sm text-gray-600">Delivered to your address</p>
                        <p className="text-sm text-gray-500">
                          ${selectedPharmacyData.deliveryFee} - {selectedPharmacyData.estimatedDeliveryTime}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <Textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Additional Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes for the pharmacy..."
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedMedications.length > 0 && selectedPharmacy && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Request Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Medications:</span>
                  <span>{selectedMedications.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmacy:</span>
                  <span>{selectedPharmacyData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="capitalize">{deliveryMethod}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>${totalDeliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Ready:</span>
                  <span>1-2 hours</span>
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="space-y-1">
                  <li>• Refill requests are typically processed within 1-2 hours</li>
                  <li>• You will receive a notification when your medication is ready</li>
                  <li>• Some medications may require prior authorization</li>
                  <li>• Insurance coverage will be verified at pickup/delivery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleRequest}
              disabled={selectedMedications.length === 0 || !selectedPharmacy || loading}
            >
              {loading ? 'Processing...' : 'Request Refill'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 