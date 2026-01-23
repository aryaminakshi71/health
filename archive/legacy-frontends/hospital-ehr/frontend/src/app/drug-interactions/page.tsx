'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Pill, Search, Info, XCircle } from 'lucide-react';

// Drug interaction database (simplified)
const drugInteractions: Record<string, { drug: string; severity: 'MAJOR' | 'MODERATE' | 'MINOR'; description: string }[]> = {
    'Warfarin': [
        { drug: 'Aspirin', severity: 'MAJOR', description: 'Increased risk of bleeding. Avoid concomitant use.' },
        { drug: 'Ibuprofen', severity: 'MAJOR', description: 'NSAIDs increase bleeding risk with anticoagulants.' },
        { drug: 'Paracetamol', severity: 'MINOR', description: 'May slightly increase INR. Monitor.' },
    ],
    'Metformin': [
        { drug: 'Contrast Dye', severity: 'MAJOR', description: 'Risk of lactic acidosis. Hold metformin 48h before/after.' },
        { drug: 'Alcohol', severity: 'MODERATE', description: 'Increased risk of hypoglycemia and lactic acidosis.' },
    ],
    'Lisinopril': [
        { drug: 'Potassium', severity: 'MODERATE', description: 'Risk of hyperkalemia. Monitor potassium levels.' },
        { drug: 'Spironolactone', severity: 'MODERATE', description: 'Additive hyperkalemia risk.' },
        { drug: 'Ibuprofen', severity: 'MODERATE', description: 'NSAIDs may reduce antihypertensive effect.' },
    ],
    'Amoxicillin': [
        { drug: 'Warfarin', severity: 'MODERATE', description: 'May increase warfarin effect. Monitor INR.' },
        { drug: 'Methotrexate', severity: 'MAJOR', description: 'Reduced methotrexate clearance. Avoid.' },
    ],
    'Atorvastatin': [
        { drug: 'Clarithromycin', severity: 'MAJOR', description: 'Increased statin levels. Risk of myopathy.' },
        { drug: 'Grapefruit', severity: 'MODERATE', description: 'Increased statin absorption. Avoid large amounts.' },
    ],
    'Amlodipine': [
        { drug: 'Simvastatin', severity: 'MODERATE', description: 'Increased simvastatin levels. Max 20mg simvastatin.' },
    ],
    'Clopidogrel': [
        { drug: 'Omeprazole', severity: 'MAJOR', description: 'Omeprazole reduces clopidogrel efficacy. Use pantoprazole.' },
        { drug: 'Aspirin', severity: 'MODERATE', description: 'Increased bleeding risk but often used together.' },
    ],
};

const allDrugs = [
    'Warfarin', 'Aspirin', 'Ibuprofen', 'Paracetamol', 'Metformin', 'Lisinopril',
    'Amlodipine', 'Atorvastatin', 'Amoxicillin', 'Clopidogrel', 'Omeprazole',
    'Pantoprazole', 'Metoprolol', 'Losartan', 'Gabapentin', 'Clarithromycin',
    'Azithromycin', 'Ciprofloxacin', 'Prednisone', 'Insulin', 'Glimepiride'
];

const severityColors = {
    MAJOR: 'bg-red-100 text-red-800 border-red-300',
    MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    MINOR: 'bg-blue-100 text-blue-800 border-blue-300',
};

const severityIcons = {
    MAJOR: XCircle,
    MODERATE: AlertTriangle,
    MINOR: Info,
};

export default function DrugInteractionPage() {
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [interactions, setInteractions] = useState<Array<{ drug1: string; drug2: string; severity: 'MAJOR' | 'MODERATE' | 'MINOR'; description: string }>>([]);

    const filteredDrugs = allDrugs.filter(d =>
        d.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedDrugs.includes(d)
    );

    const addDrug = (drug: string) => {
        const newDrugs = [...selectedDrugs, drug];
        setSelectedDrugs(newDrugs);
        setSearchQuery('');
        checkInteractions(newDrugs);
    };

    const removeDrug = (drug: string) => {
        const newDrugs = selectedDrugs.filter(d => d !== drug);
        setSelectedDrugs(newDrugs);
        checkInteractions(newDrugs);
    };

    const checkInteractions = (drugs: string[]) => {
        const found: typeof interactions = [];

        for (let i = 0; i < drugs.length; i++) {
            for (let j = i + 1; j < drugs.length; j++) {
                const drug1 = drugs[i];
                const drug2 = drugs[j];

                // Check both directions
                const interactions1 = drugInteractions[drug1]?.filter(int => int.drug === drug2) || [];
                const interactions2 = drugInteractions[drug2]?.filter(int => int.drug === drug1) || [];

                [...interactions1, ...interactions2].forEach(int => {
                    found.push({
                        drug1,
                        drug2,
                        severity: int.severity,
                        description: int.description,
                    });
                });
            }
        }

        // Sort by severity
        found.sort((a, b) => {
            const order = { MAJOR: 0, MODERATE: 1, MINOR: 2 };
            return order[a.severity] - order[b.severity];
        });

        setInteractions(found);
    };

    const majorCount = interactions.filter(i => i.severity === 'MAJOR').length;
    const moderateCount = interactions.filter(i => i.severity === 'MODERATE').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    Drug Interaction Checker
                </h1>
                <p className="text-gray-500">Check for potential drug-drug interactions before prescribing</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drug Selection */}
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle>Select Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search and add drugs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Search Results */}
                        {searchQuery && filteredDrugs.length > 0 && (
                            <div className="border rounded-lg mb-4 max-h-48 overflow-y-auto">
                                {filteredDrugs.slice(0, 8).map((drug) => (
                                    <button
                                        key={drug}
                                        onClick={() => addDrug(drug)}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Pill className="h-4 w-4 text-gray-400" />
                                        {drug}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Drugs */}
                        <div className="flex flex-wrap gap-2">
                            {selectedDrugs.map((drug) => (
                                <span
                                    key={drug}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg"
                                >
                                    <Pill className="h-4 w-4" />
                                    {drug}
                                    <button
                                        onClick={() => removeDrug(drug)}
                                        className="hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            {selectedDrugs.length === 0 && (
                                <p className="text-gray-400 italic">No drugs selected. Search and add drugs above.</p>
                            )}
                        </div>

                        {/* Quick Add Common Combos */}
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-500 mb-2">Quick Test:</p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedDrugs(['Warfarin', 'Aspirin', 'Ibuprofen']);
                                        checkInteractions(['Warfarin', 'Aspirin', 'Ibuprofen']);
                                    }}
                                >
                                    Warfarin + NSAIDs
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedDrugs(['Clopidogrel', 'Omeprazole', 'Aspirin']);
                                        checkInteractions(['Clopidogrel', 'Omeprazole', 'Aspirin']);
                                    }}
                                >
                                    Cardiac Combo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Interaction Results */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Interaction Results</CardTitle>
                        {selectedDrugs.length >= 2 && (
                            <div className="flex gap-2">
                                {majorCount > 0 && (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                        {majorCount} Major
                                    </span>
                                )}
                                {moderateCount > 0 && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                        {moderateCount} Moderate
                                    </span>
                                )}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {selectedDrugs.length < 2 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Add at least 2 drugs to check for interactions</p>
                            </div>
                        ) : interactions.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                                <p className="text-xl font-semibold text-green-700">No Known Interactions</p>
                                <p className="text-gray-500 mt-2">These medications appear safe to use together</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {interactions.map((int, index) => {
                                    const Icon = severityIcons[int.severity];
                                    return (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border-2 ${severityColors[int.severity]}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold">{int.drug1}</span>
                                                        <span className="text-gray-400">↔</span>
                                                        <span className="font-bold">{int.drug2}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${int.severity === 'MAJOR' ? 'bg-red-200' :
                                                                int.severity === 'MODERATE' ? 'bg-yellow-200' : 'bg-blue-200'
                                                            }`}>
                                                            {int.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{int.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
