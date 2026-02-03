/**
 * Subscription Billing Page
 *
 * Organization-level subscription management and billing information.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/subscription')({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (plan: 'pro' | 'enterprise') => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: window.location.href }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  // Mock plan data - replace with actual API call
  const currentPlan = 'free'; // Fetch from API
  const membersCount = 1; // Fetch from API
  const maxMembers = currentPlan === 'free' ? 10 : currentPlan === 'pro' ? 50 : 500;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription & Billing</h1>
        <p className="text-muted-foreground">
          Manage your organization subscription and billing information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the <span className="capitalize font-medium text-foreground">{currentPlan}</span> plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">
                {currentPlan === 'free' ? '$0' : currentPlan === 'pro' ? '$99' : '$299'}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Button
              className="mt-4"
              disabled={loading || currentPlan === 'enterprise'}
              onClick={() => {
                if (currentPlan === 'free') {
                  handleCheckout('pro');
                } else {
                  handlePortal();
                }
              }}
            >
              {currentPlan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Your current usage this billing period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Users</span>
                  <span>{membersCount} / {maxMembers}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min((membersCount / maxMembers) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patients</span>
                  <span>Unlimited</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
