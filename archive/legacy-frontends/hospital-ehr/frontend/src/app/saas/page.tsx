'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SaaSOnboarding() {
    const [formData, setFormData] = useState({
        hospitalName: '',
        adminName: '',
        adminEmail: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/saas/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                alert('Hospital Created Successfully! Domain: ' + data.hospital.domain);
                console.log(data);
                // Save token and redirect
                localStorage.setItem('token', data.token);
                window.location.href = '/?new_tenant=true';
            } else {
                alert('Error: ' + JSON.stringify(data));
            }

        } catch (err) {
            alert('Failed to register hospital');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-blue-900">Create Your Digital Hospital</CardTitle>
                    <CardDescription>Launch your own EHR system in under 30 seconds.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hospitalName">Hospital / Clinic Name</Label>
                            <Input id="hospitalName" name="hospitalName" placeholder="e.g. Apollo Clinic" required onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminName">Administrator Name</Label>
                            <Input id="adminName" name="adminName" placeholder="Dr. John Doe" required onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input id="adminEmail" name="adminEmail" type="email" placeholder="admin@hospital.com" required onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Create Password</Label>
                            <Input id="password" name="password" type="password" required onChange={handleChange} />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full h-12 text-lg bg-blue-700 hover:bg-blue-800">
                                🚀 Launch Hospital
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
