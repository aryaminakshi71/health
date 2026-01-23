'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Video, VideoOff, Mic, MicOff, Phone, PhoneOff,
    MessageSquare, Monitor, Users, Clock, Calendar,
    Settings, Maximize, Volume2
} from 'lucide-react';

// Mock appointment for telemedicine
const mockAppointment = {
    id: 'TELE-001',
    patient: 'Rahul Sharma',
    patientId: 'P001',
    age: 32,
    doctor: 'Dr. Patel',
    specialty: 'General Medicine',
    scheduledTime: '10:00 AM',
    status: 'WAITING',
    chiefComplaint: 'Follow-up for fever and headache',
    previousVisit: '2024-12-25',
};

const mockWaitingPatients = [
    { id: '1', name: 'Rahul Sharma', time: '10:00 AM', status: 'WAITING', waitTime: '5 mins' },
    { id: '2', name: 'Priya Gupta', time: '10:30 AM', status: 'SCHEDULED', waitTime: '-' },
    { id: '3', name: 'Amit Kumar', time: '11:00 AM', status: 'SCHEDULED', waitTime: '-' },
];

export default function TelemedicinePage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(mockWaitingPatients[0]);
    const [callDuration, setCallDuration] = useState(0);
    const [chatMessages, setChatMessages] = useState<Array<{ from: string; text: string; time: string }>>([]);
    const [newMessage, setNewMessage] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);

    // Simulated call timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallActive) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCallActive]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startCall = async () => {
        setIsCallActive(true);
        setCallDuration(0);

        // Try to get user media for local video preview
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.log('Camera/mic not available, using placeholder');
        }
    };

    const endCall = () => {
        setIsCallActive(false);
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const sendMessage = () => {
        if (newMessage.trim()) {
            setChatMessages([...chatMessages, {
                from: 'Doctor',
                text: newMessage,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            }]);
            setNewMessage('');

            // Simulate patient response
            setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    from: 'Patient',
                    text: 'Yes doctor, I understand. Thank you.',
                    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                }]);
            }, 2000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Video className="h-8 w-8 text-blue-600" />
                        Telemedicine
                    </h1>
                    <p className="text-gray-500">Virtual Consultations • Video Calls</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" /> Today's Schedule
                    </Button>
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Video Area */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="shadow-lg border-0 overflow-hidden">
                        <div className="relative bg-gray-900 aspect-video">
                            {isCallActive ? (
                                <>
                                    {/* Remote video (patient) - placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl font-bold mx-auto mb-4">
                                                {selectedPatient.name.charAt(0)}
                                            </div>
                                            <p className="text-xl mb-2">{selectedPatient.name}</p>
                                            <p className="text-gray-400">Connected</p>
                                        </div>
                                    </div>

                                    {/* Local video (doctor) - small overlay */}
                                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        {!isVideoOn && (
                                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                                <VideoOff className="h-8 w-8 text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Call duration */}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        {formatDuration(callDuration)}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <Video className="h-20 w-20 mx-auto mb-4 text-gray-600" />
                                        <p className="text-xl text-gray-400">No active call</p>
                                        <p className="text-gray-500 mt-2">Select a patient and start the consultation</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="bg-gray-800 p-4">
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className={`rounded-full h-14 w-14 ${!isAudioOn ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-700 border-gray-600 text-white'}`}
                                    onClick={() => setIsAudioOn(!isAudioOn)}
                                    disabled={!isCallActive}
                                >
                                    {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                                </Button>

                                {isCallActive ? (
                                    <Button
                                        size="lg"
                                        className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700"
                                        onClick={endCall}
                                    >
                                        <PhoneOff className="h-7 w-7" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700"
                                        onClick={startCall}
                                    >
                                        <Phone className="h-7 w-7" />
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className={`rounded-full h-14 w-14 ${!isVideoOn ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-700 border-gray-600 text-white'}`}
                                    onClick={() => setIsVideoOn(!isVideoOn)}
                                    disabled={!isCallActive}
                                >
                                    {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full h-14 w-14 bg-gray-700 border-gray-600 text-white"
                                    disabled={!isCallActive}
                                >
                                    <Monitor className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Chat */}
                    {isCallActive && (
                        <Card className="shadow-lg border-0">
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Chat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-32 overflow-y-auto p-4 space-y-2">
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.from === 'Doctor' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.from === 'Doctor'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100'
                                                }`}>
                                                <p className="text-sm">{msg.text}</p>
                                                <p className={`text-xs mt-1 ${msg.from === 'Doctor' ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button size="sm" onClick={sendMessage}>Send</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Waiting Patients */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Waiting Room
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockWaitingPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPatient.id === patient.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${patient.status === 'WAITING' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}>
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{patient.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {patient.time}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${patient.status === 'WAITING'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {patient.status === 'WAITING' ? `${patient.waitTime}` : 'Later'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patient Details */}
                    <Card className="shadow-lg border-0">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm">Patient Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs">Name</p>
                                <p className="font-medium">{mockAppointment.patient}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Chief Complaint</p>
                                <p className="font-medium">{mockAppointment.chiefComplaint}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs">Previous Visit</p>
                                <p className="font-medium">{mockAppointment.previousVisit}</p>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                                Open Patient Record
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
