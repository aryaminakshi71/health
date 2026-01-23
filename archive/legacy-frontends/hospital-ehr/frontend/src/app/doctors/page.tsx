'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Mail, Phone, Calendar, Clock, User, Stethoscope, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';

const mockDoctors = [
    { id: 'DOC-001', name: 'Dr. Rajesh Patel', department: 'General Medicine', specialization: 'MD Medicine', qualification: 'MBBS, MD', experience: 15, phone: '9876543210', email: 'rajesh.patel@truvias.com', status: 'ACTIVE',OPD: 'Monday - Friday', ipd: 'On Call', patientsToday: 28, rating: 4.8 },
    { id: 'DOC-002', name: 'Dr. Sunita Mehta', department: 'Cardiology', specialization: 'DM Cardiology', qualification: 'MBBS, MD, DM', experience: 12, phone: '9876543211', email: 'sunita.mehta@truvias.com', status: 'ACTIVE',OPD: 'Mon, Wed, Fri', ipd: 'Yes', patientsToday: 15, rating: 4.9 },
    { id: 'DOC-003', name: 'Dr. Amit Singh', department: 'Orthopedics', specialization: 'MS Orthopedics', qualification: 'MBBS, MS', experience: 10, phone: '9876543212', email: 'amit.singh@truvias.com', status: 'ACTIVE',OPD: 'Tuesday - Saturday', ipd: 'Yes', patientsToday: 22, rating: 4.7 },
    { id: 'DOC-004', name: 'Dr. Priya Reddy', department: 'Neurology', specialization: 'DM Neurology', qualification: 'MBBS, MD, DM', experience: 8, phone: '9876543213', email: 'priya.reddy@truvias.com', status: 'ON_LEAVE',OPD: 'Mon, Thu', ipd: 'Yes', patientsToday: 0, rating: 4.9 },
    { id: 'DOC-005', name: 'Dr. Vikram Kumar', department: 'Pediatrics', specialization: 'MD Pediatrics', qualification: 'MBBS, MD', experience: 14, phone: '9876543214', email: 'vikram.kumar@truvias.com', status: 'ACTIVE',OPD: 'Monday - Saturday', ipd: 'Yes', patientsToday: 35, rating: 4.6 },
    { id: 'DOC-006', name: 'Dr. Anjali Sharma', department: 'Obstetrics & Gynecology', specialization: 'MS OBG', qualification: 'MBBS, MS', experience: 11, phone: '9876543215', email: 'anjali.sharma@truvias.com', status: 'ACTIVE',OPD: 'Tue, Thu, Sat', ipd: 'Yes', patientsToday: 18, rating: 4.8 },
    { id: 'DOC-007', name: 'Dr. Sanjay Gupta', department: 'Dermatology', specialization: 'MD Dermatology', qualification: 'MBBS, MD', experience: 9, phone: '9876543216', email: 'sanjay.gupta@truvias.com', status: 'ACTIVE',OPD: 'Wednesday - Sunday', ipd: 'No', patientsToday: 25, rating: 4.5 },
    { id: 'DOC-008', name: 'Dr. Meera Joshi', department: 'ENT', specialization: 'MS ENT', qualification: 'MBBS, MS', experience: 7, phone: '9876543217', email: 'meera.joshi@truvias.com', status: 'ACTIVE',OPD: 'Mon, Wed, Fri', ipd: 'Yes', patientsToday: 12, rating: 4.7 },
];

const departments = [
    'All Departments',
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Neurology',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Dermatology',
    'ENT',
    'Psychiatry',
    'Nephrology',
    'Urology',
    'Gastroenterology',
];

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    ON_LEAVE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    INACTIVE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DoctorsDashboard() {
    const [doctors] = useState(mockDoctors);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('All Departments');

    const activeDoctors = doctors.filter(d => d.status === 'ACTIVE').length;
    const onLeave = doctors.filter(d => d.status === 'ON_LEAVE').length;
    const totalPatients = doctors.reduce((sum, d) => sum + d.patientsToday, 0);

    const filteredDoctors = doctors.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             d.specialization.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = filterDepartment === 'All Departments' || d.department === filterDepartment;
        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Stethoscope className="h-6 w-6 text-blue-500" />
                        </div>
                        Doctors & Staff
                    </h1>
                    <p className="text-slate-400">Manage doctors, specialists, and medical staff</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">
                        <Calendar className="h-4 w-4 mr-2" /> Schedule
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Doctor
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                    <p className="text-slate-400 text-sm">Total Doctors</p>
                    <p className="text-3xl font-bold text-white mt-1">{doctors.length}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-green-500">
                    <p className="text-slate-400 text-sm">Active</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">{activeDoctors}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-amber-500">
                    <p className="text-slate-400 text-sm">On Leave</p>
                    <p className="text-3xl font-bold text-amber-400 mt-1">{onLeave}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 border-l-4 border-l-blue-500">
                    <p className="text-slate-400 text-sm">Patients Today</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">{totalPatients}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by name, department, or specialization..."
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {departments.slice(0, 6).map((dept) => (
                        <Button
                            key={dept}
                            variant={filterDepartment === dept ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterDepartment(dept)}
                            className={filterDepartment === dept ? 'bg-blue-600 whitespace-nowrap' : 'whitespace-nowrap'}
                        >
                            {dept === 'All Departments' ? 'All' : dept.split(' ')[0]}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                    {doctor.name.split(' ').slice(1).map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white truncate">{doctor.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[doctor.status]}`}>
                                            {doctor.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-blue-400">{doctor.specialization}</p>
                                    <p className="text-xs text-slate-400">{doctor.department}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">Qualification:</span>
                                    <span>{doctor.qualification}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">Experience:</span>
                                    <span>{doctor.experience} years</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">OPD:</span>
                                    <span>{doctor.OPD}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <span className="text-slate-500">IPD:</span>
                                    <span>{doctor.ipd}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{doctor.patientsToday}</p>
                                        <p className="text-xs text-slate-400">patients</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-amber-400">★ {doctor.rating}</p>
                                        <p className="text-xs text-slate-400">rating</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        <Calendar className="h-4 w-4 mr-1" /> Schedule
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
