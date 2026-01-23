"use client";

import React, { useState } from "react";

export default function SignUpPage() {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000') as string;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
      const data = await res.json();
      if (!res.ok || !data?.access_token) throw new Error(data?.detail || 'Sign up failed');
      localStorage.setItem('hh-jwt', data.access_token);
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={signUp} className="w-full max-w-md bg-white p-6 rounded border space-y-3">
        <h1 className="text-xl font-semibold">Create Account</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="border rounded px-3 py-2 w-full" placeholder="Username" value={username} onChange={(e)=> setUsername(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="email" placeholder="Email" value={email} onChange={(e)=> setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" value={password} onChange={(e)=> setPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Creating…' : 'Create Account'}</button>
        <a href="/login" className="block text-center text-sm text-blue-600 hover:underline">Have an account? Log in</a>
      </form>
    </div>
  );
}


