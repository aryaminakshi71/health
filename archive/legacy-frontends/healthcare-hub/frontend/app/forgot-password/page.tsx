"use client";

import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000') as string;
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: identifier, email: identifier, new_password: newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Reset failed');
      setSuccess('Password updated. You can now log in.');
    } catch (e: any) {
      setError(e.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={reset} className="w-full max-w-md bg-white p-6 rounded border space-y-3">
        <h1 className="text-xl font-semibold">Reset Password</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <input className="border rounded px-3 py-2 w-full" placeholder="Username or Email" value={identifier} onChange={(e)=> setIdentifier(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="password" placeholder="New Password" value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Updating…' : 'Update Password'}</button>
        <a href="/login" className="block text-center text-sm text-blue-600 hover:underline">Back to login</a>
      </form>
    </div>
  );
}


