"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Recipient = {
  id: number;
  tenant_id?: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  push_token?: string;
  preferences?: Record<string, boolean>;
};

export default function RecipientsPanel() {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") as string;
  const [items, setItems] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Recipient>>({ name: "", email: "", phone: "", preferences: { email: true, push: true } });
  const [sendingTest, setSendingTest] = useState<number | null>(null);

  const fetchRecipients = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${backendUrl}/api/v1/notifications/recipients`);
      const json = await res.json();
      setItems(json.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load recipients");
    } finally {
      setLoading(false);
    }
  };

  const createRecipient = async () => {
    try {
      const payload = { ...form, preferences: form.preferences || { email: true } } as any;
      const res = await fetch(`${backendUrl}/api/v1/notifications/recipients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Create failed');
      setForm({ name: "", email: "", phone: "", preferences: { email: true, push: true } });
      fetchRecipients();
    } catch (e: any) {
      alert(e.message || 'Create failed');
    }
  };

  const deleteRecipient = async (id: number) => {
    if (!confirm('Delete recipient?')) return;
    try {
      const res = await fetch(`${backendUrl}/api/v1/notifications/recipients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  const sendTest = async (r: Recipient) => {
    try {
      setSendingTest(r.id);
      const payload = {
        id: String(r.id), name: r.name,
        email: r.email, phone: r.phone, whatsapp: r.whatsapp, push_token: r.push_token,
        type: 'user', preferences: r.preferences || { email: true }
      };
      const res = await fetch(`${backendUrl}/api/v1/notifications/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Test send failed');
      alert('Test sent');
    } catch (e: any) {
      alert(e.message || 'Test send failed');
    } finally {
      setSendingTest(null);
    }
  };

  useEffect(() => { fetchRecipients(); }, []);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Recipients</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 text-sm">
          <input className="border rounded px-2 py-1" placeholder="Name" value={form.name || ''} onChange={(e)=> setForm(f=> ({...f, name: e.target.value}))} />
          <input className="border rounded px-2 py-1" placeholder="Email" value={form.email || ''} onChange={(e)=> setForm(f=> ({...f, email: e.target.value}))} />
          <input className="border rounded px-2 py-1" placeholder="Phone" value={form.phone || ''} onChange={(e)=> setForm(f=> ({...f, phone: e.target.value}))} />
          <div className="flex items-center gap-2">
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!form.preferences?.email} onChange={(e)=> setForm(f=> ({...f, preferences: {...(f.preferences||{}), email: e.target.checked}}))} /> Email</label>
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!form.preferences?.push} onChange={(e)=> setForm(f=> ({...f, preferences: {...(f.preferences||{}), push: e.target.checked}}))} /> Push</label>
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!form.preferences?.sms} onChange={(e)=> setForm(f=> ({...f, preferences: {...(f.preferences||{}), sms: e.target.checked}}))} /> SMS</label>
          </div>
          <div className="col-span-1 lg:col-span-3">
            <Button size="sm" onClick={createRecipient}>Add Recipient</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {items.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 border rounded">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-xs text-gray-600 truncate">{r.email || '—'} {r.phone ? `• ${r.phone}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex gap-1">
                    {Object.entries(r.preferences || {}).filter(([,v])=>v).map(([k])=> (
                      <Badge key={k} className="bg-gray-100 text-gray-800">{k}</Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={()=> sendTest(r)} disabled={sendingTest===r.id}>{sendingTest===r.id? 'Sending…' : 'Send Test'}</Button>
                  <Button size="sm" variant="destructive" onClick={()=> deleteRecipient(r.id)}>Delete</Button>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-gray-600">No recipients</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


