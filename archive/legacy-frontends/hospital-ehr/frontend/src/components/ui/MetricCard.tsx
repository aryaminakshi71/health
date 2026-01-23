'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan';
    subtitle?: string;
}

const colorMap = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-600 to-purple-700',
    red: 'from-red-600 to-red-700',
    cyan: 'from-cyan-600 to-cyan-700',
};

const iconBgMap = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/20 text-purple-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
};

export function MetricCard({ title, value, trend, trendUp, icon, color = 'blue', subtitle }: MetricCardProps) {
    return (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-3 text-sm ${
                            trendUp ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {trendUp ? (
                                <ArrowUpRight className="h-4 w-4" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4" />
                            )}
                            <span>{trend} vs yesterday</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} ${iconBgMap[color].split(' ')[0]}`}>
                        <div className={iconBgMap[color].split(' ')[1]}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Variant with gradient background
interface GradientMetricCardProps extends MetricCardProps {
    gradient?: boolean;
}

export function GradientMetricCard({ title, value, trend, trendUp, icon, color = 'blue' }: GradientMetricCardProps) {
    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-6 text-white`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-3 text-sm ${
                            trendUp ? 'text-green-300' : 'text-red-300'
                        }`}>
                            {trendUp ? (
                                <ArrowUpRight className="h-4 w-4" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4" />
                            )}
                            <span>{trend} vs yesterday</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 bg-white/20 rounded-xl">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
