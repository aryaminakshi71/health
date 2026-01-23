"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";

type Txn = {
  id: string;
  description: string;
  amount: number;
  date: string;
  method?: string;
  status?: string;
};

export default function PaymentsList({ backendUrl }: { backendUrl: string }) {
  const [items, setItems] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${backendUrl}/api/v1/financial/transactions`);
        const data = await res.json();
        const txns = data.transactions || data.data || [];
        // Filter to patient-relevant if needed; for now show all
        setItems(txns);
      } catch (e: any) {
        setError(e.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [backendUrl]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {items.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between p-6 border rounded-lg">
          <div>
            <h3 className="text-lg font-semibold">{payment.description}</h3>
            <p className="text-sm text-gray-600">Amount: ${Number(payment.amount).toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              Date: {new Date(payment.date).toLocaleDateString()} {payment.method ? `| Method: ${payment.method}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {payment.status && (
              <Badge className="bg-gray-100 text-gray-800">{payment.status}</Badge>
            )}
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="text-gray-500">No payments</div>}
    </div>
  );
}


