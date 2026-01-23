'use client';

import React, { useState } from 'react';
import { Search, User, Phone, Mail, Calendar, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const searchResults = [
    { id: 'P001', mrn: 'MRN-2024-001', name: 'Rahul Sharma', age: 45, gender: 'M', phone: '9876543210', email: 'rahul@email.com', lastVisit: '2024-12-28', department: 'Cardiology' },
    { id: 'P002', mrn: 'MRN-2024-002', name: 'Priya Gupta', age: 32, gender: 'F', phone: '9876543211', email: 'priya@email.com', lastVisit: '2024-12-27', department: 'Gynecology' },
    { id: 'P003', mrn: 'MRN-2024-003', name: 'Rahul Kumar', age: 28, gender: 'M', phone: '9876543212', email: 'rahulk@email.com', lastVisit: '2024-12-25', department: 'Orthopedics' },
];

export default function PatientSearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [results, setResults] = useState<typeof searchResults>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setResults(searchResults.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.phone.includes(searchQuery)
            ));
            setSearched(true);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Search</h1>
                <p className="text-slate-500 dark:text-slate-400">Search for patients by name, MRN, phone, or Aadhaar</p>
            </div>

            {/* Search Box */}
            <div className="card p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm md:w-48"
                    >
                        <option value="name">Patient Name</option>
                        <option value="mrn">MRN Number</option>
                        <option value="phone">Phone Number</option>
                        <option value="aadhaar">Aadhaar Number</option>
                        <option value="email">Email Address</option>
                    </select>
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={`Search by ${searchType}...`}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Search
                    </button>
                </div>

                {/* Quick Search Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Quick search:</span>
                    {['Today\'s Patients', 'OPD Patients', 'IPD Patients', 'Emergency'].map((tag) => (
                        <button
                            key={tag}
                            className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Results */}
            {searched && (
                <div className="card">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Search Results ({results.length} found)
                        </h3>
                    </div>
                    {results.length > 0 ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {results.map((patient) => (
                                <Link
                                    key={patient.id}
                                    href={`/patients/${patient.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{patient.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {patient.mrn} | {patient.age} yrs, {patient.gender} | {patient.department}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {patient.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> Last visit: {patient.lastVisit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h4 className="font-medium text-slate-900 dark:text-white">No patients found</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Try a different search term</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
