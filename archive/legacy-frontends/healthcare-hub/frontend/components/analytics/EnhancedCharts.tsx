"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

// Enhanced Line Chart Component
export function EnhancedLineChart({
  data,
  title,
  description,
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
  realTime = false,
  onDataPointClick,
  className = ''
}: {
  data: any[];
  title?: string;
  description?: string;
  xKey?: string;
  yKey?: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  realTime?: boolean;
  onDataPointClick?: (data: any) => void;
  className?: string;
}) {
  const [chartData, setChartData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  useEffect(() => {
    if (realTime) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setChartData(prev => [...prev.slice(1), {
          [xKey]: new Date().toLocaleTimeString(),
          [yKey]: Math.random() * 100
        }]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realTime, xKey, yKey]);

  const handleExport = () => {
    const csvContent = [
      [xKey, yKey],
      ...chartData.map(item => [item[xKey], item[yKey]])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <div className="flex items-center space-x-2">
              {realTime && (
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span>Live</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <LineChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Chart visualization would be rendered here</p>
            <p className="text-xs text-gray-500 mt-1">Data points: {chartData.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Bar Chart Component
export function EnhancedBarChart({
  data,
  title,
  description,
  xKey = 'name',
  yKey = 'value',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
  stacked = false,
  horizontal = false,
  onBarClick,
  className = ''
}: {
  data: any[];
  title?: string;
  description?: string;
  xKey?: string;
  yKey?: string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  onBarClick?: (data: any) => void;
  className?: string;
}) {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const handleExport = () => {
    const csvContent = [
      [xKey, yKey],
      ...chartData.map(item => [item[xKey], item[yKey]])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Bar chart visualization would be rendered here</p>
            <p className="text-xs text-gray-500 mt-1">Data points: {chartData.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Pie Chart Component
export function EnhancedPieChart({
  data,
  title,
  description,
  nameKey = 'name',
  valueKey = 'value',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316'],
  showLegend = true,
  showTooltip = true,
  animate = true,
  onSliceClick,
  className = ''
}: {
  data: any[];
  title?: string;
  description?: string;
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  onSliceClick?: (data: any) => void;
  className?: string;
}) {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const handleExport = () => {
    const csvContent = [
      [nameKey, valueKey, 'Percentage'],
      ...chartData.map(item => [
        item[nameKey],
        item[valueKey],
        `${((item[valueKey] / chartData.reduce((sum, d) => sum + d[valueKey], 0)) * 100).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <PieChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Pie chart visualization would be rendered here</p>
            <p className="text-xs text-gray-500 mt-1">Data points: {chartData.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Area Chart Component
export function EnhancedAreaChart({
  data,
  title,
  description,
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
  gradient = true,
  onDataPointClick,
  className = ''
}: {
  data: any[];
  title?: string;
  description?: string;
  xKey?: string;
  yKey?: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  gradient?: boolean;
  onDataPointClick?: (data: any) => void;
  className?: string;
}) {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const handleExport = () => {
    const csvContent = [
      [xKey, yKey],
      ...chartData.map(item => [item[xKey], item[yKey]])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <LineChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Area chart visualization would be rendered here</p>
            <p className="text-xs text-gray-500 mt-1">Data points: {chartData.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Chart Grid Component
export function ChartGrid({
  charts,
  columns = 2,
  className = ''
}: {
  charts: {
    type: 'line' | 'bar' | 'pie' | 'area';
    data: any[];
    title?: string;
    description?: string;
    config?: any;
  }[];
  columns?: number;
  className?: string;
}) {
  const renderChart = (chart: any, index: number) => {
    const commonProps = {
      data: chart.data,
      title: chart.title,
      description: chart.description,
      className: 'h-full',
      ...chart.config
    };

    switch (chart.type) {
      case 'line':
        return <EnhancedLineChart key={index} {...commonProps} />;
      case 'bar':
        return <EnhancedBarChart key={index} {...commonProps} />;
      case 'pie':
        return <EnhancedPieChart key={index} {...commonProps} />;
      case 'area':
        return <EnhancedAreaChart key={index} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6 ${className}`}>
      {charts.map((chart, index) => renderChart(chart, index))}
    </div>
  );
}

// Real-time Chart Component
export function RealTimeChart({
  data,
  title,
  maxDataPoints = 50,
  updateInterval = 2000,
  ...props
}: {
  data: any[];
  title?: string;
  maxDataPoints?: number;
  updateInterval?: number;
  [key: string]: any;
}) {
  const [realTimeData, setRealTimeData] = useState(data);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          value: Math.random() * 100
        };
        
        const updatedData = [...prev, newDataPoint];
        return updatedData.slice(-maxDataPoints);
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [maxDataPoints, updateInterval]);

  return (
    <EnhancedLineChart
      data={realTimeData}
      title={title}
      realTime={true}
      xKey="time"
      yKey="value"
      {...props}
    />
  );
} 