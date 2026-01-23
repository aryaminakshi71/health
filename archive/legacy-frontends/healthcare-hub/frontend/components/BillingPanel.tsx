"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BillingPanel() {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") as string;
  const [priceId, setPriceId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    try {
      setBusy(true);
      const res = await fetch(`${backendUrl}/api/v1/billing/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price_id: priceId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || 'Checkout failed');
      if (json.url) window.location.href = json.url;
    } catch (e: any) {
      alert(e.message || 'Checkout failed');
    } finally { setBusy(false); }
  };

  const portal = async () => {
    try {
      setBusy(true);
      const res = await fetch(`${backendUrl}/api/v1/billing/portal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: customerId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || 'Portal failed');
      if (json.url) window.location.href = json.url;
    } catch (e: any) {
      alert(e.message || 'Portal failed');
    } finally { setBusy(false); }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Stripe Price ID" value={priceId} onChange={(e)=> setPriceId(e.target.value)} />
          <Button size="sm" onClick={checkout} disabled={!priceId || busy}>Subscribe</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Stripe Customer ID" value={customerId} onChange={(e)=> setCustomerId(e.target.value)} />
          <Button size="sm" variant="outline" onClick={portal} disabled={!customerId || busy}>Manage Billing</Button>
        </div>
      </CardContent>
    </Card>
  );
}


