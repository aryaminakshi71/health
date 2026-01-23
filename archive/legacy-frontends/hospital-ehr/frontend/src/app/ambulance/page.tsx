'use client';

import React from 'react';
import { Truck, MapPin, Clock, Phone, User, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

const ambulances = [
    { id: 'AMB-001', driver: 'Ramesh Kumar', phone: '9876543210', status: 'Available', location: 'Hospital Base', lastTrip: '30 min ago' },
    { id: 'AMB-002', driver: 'Suresh Singh', phone: '9876543211', status: 'On Call', location: 'Sector 15, Gurugram', eta: '12 min', patient: 'Cardiac Emergency' },
    { id: 'AMB-003', driver: 'Mohan Lal', phone: '9876543212', status: 'Returning', location: 'MG Road', eta: '8 min', lastTrip: 'Patient Dropped' },
    { id: 'AMB-004', driver: 'Vijay Kumar', phone: '9876543213', status: 'Maintenance', location: 'Service Center', note: 'Engine Check' },
    { id: 'AMB-005', driver: 'Anil Sharma', phone: '9876543214', status: 'On Call', location: 'DLF Phase 3', eta: '18 min', patient: 'Accident Case' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'On Call': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Returning': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        default: return 'bg-slate-100 text-slate-700';
    }
};

export default function AmbulancePage() {
    const stats = {
        total: ambulances.length,
        available: ambulances.filter(a => a.status === 'Available').length,
        onCall: ambulances.filter(a => a.status === 'On Call').length,
        maintenance: ambulances.filter(a => a.status === 'Maintenance').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Truck className="w-7 h-7 text-red-500" />
                        Ambulance Services
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Fleet management and dispatch</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <Phone className="w-4 h-4" />
                    Dispatch Ambulance
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-slate-500">Total Fleet</p>
                </div>
                <div className="card p-4 border-l-4 border-l-green-500">
                    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                    <p className="text-sm text-slate-500">Available</p>
                </div>
                <div className="card p-4 border-l-4 border-l-red-500">
                    <p className="text-2xl font-bold text-red-600">{stats.onCall}</p>
                    <p className="text-sm text-slate-500">On Call</p>
                </div>
                <div className="card p-4 border-l-4 border-l-amber-500">
                    <p className="text-2xl font-bold text-amber-600">{stats.maintenance}</p>
                    <p className="text-sm text-slate-500">Maintenance</p>
                </div>
            </div>

            {/* Ambulance List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ambulances.map((amb) => (
                    <div key={amb.id} className={`card p-4 border-l-4 ${
                        amb.status === 'Available' ? 'border-l-green-500' : 
                        amb.status === 'On Call' ? 'border-l-red-500' : 
                        amb.status === 'Returning' ? 'border-l-blue-500' : 'border-l-amber-500'
                    }`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    amb.status === 'On Call' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'
                                }`}>
                                    <Truck className={`w-5 h-5 ${amb.status === 'On Call' ? 'text-red-600' : 'text-slate-600'}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{amb.id}</h3>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(amb.status)}`}>
                                        {amb.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <User className="w-4 h-4" />
                                <span>{amb.driver}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Phone className="w-4 h-4" />
                                <span>{amb.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <MapPin className="w-4 h-4" />
                                <span>{amb.location}</span>
                            </div>
                            {amb.eta && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Clock className="w-4 h-4" />
                                    <span>ETA: {amb.eta}</span>
                                </div>
                            )}
                            {amb.patient && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-400 text-xs">
                                    <AlertCircle className="w-3 h-3 inline mr-1" />
                                    {amb.patient}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                                Track Location
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
