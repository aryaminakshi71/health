"use client";

import React, { useState } from "react";

export default function AuthLogin({ appKey = 'hh' }: { appKey?: string }) {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000') as string;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Tenant/role removed from UI; backend derives role from JWT
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok || !data?.access_token) throw new Error(data?.detail || 'Login failed');
      localStorage.setItem(`${appKey}-jwt`, data.access_token);
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={login} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <input className="border rounded px-3 py-2 w-full" placeholder="Username" value={username} onChange={(e)=> setUsername(e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" value={password} onChange={(e)=> setPassword(e.target.value)} />
      {/* Tenant/role removed */}
      <div className="flex items-center justify-between text-sm pt-1">
        <a href="/signup" className="text-blue-600 hover:underline">Create account</a>
        <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</a>
      </div>
      <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Signing in…' : 'Sign In'}</button>
    </form>
  );
}


