"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui';

interface AnalyticsData {
  revenue: number;
  users: number;
  conversions: number;
  growth: number;
  topProducts: Array<{ name: string; sales: number }>;
  trends: Array<{ date: string; value: number }>;
}

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setData({
        revenue: 1250000,
        users: 15420,
        conversions: 12.5,
        growth: 23.4,
        topProducts: [
          { name: 'Product A', sales: 45000 },
          { name: 'Product B', sales: 38000 },
          { name: 'Product C', sales: 32000 },
        ],
        trends: [
          { date: '2024-01', value: 100000 },
          { date: '2024-02', value: 120000 },
          { date: '2024-03', value: 140000 },
          { date: '2024-04', value: 125000 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(data.revenue / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-green-600">
            +{data.growth}% from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.users.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600">
            +15% from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.conversions}%
          </div>
          <div className="text-sm text-green-600">
            +2.1% from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.growth}%
          </div>
          <div className="text-sm text-green-600">
            +5.2% from last month
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
