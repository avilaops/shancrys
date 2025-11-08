/**
 * Reusable dashboard widget components
 */

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">{title}</span>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
}

interface ActivityItemProps {
    title: string;
    description: string;
    time: string;
    icon: LucideIcon;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function ActivityItem({ title, description, time, icon: Icon, color = 'blue' }: ActivityItemProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-lg ${colorClasses[color]} shrink-0`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                <p className="text-sm text-gray-600 truncate">{description}</p>
                <p className="text-xs text-gray-500 mt-1">{time}</p>
            </div>
        </div>
    );
}

interface ProgressBarProps {
    label: string;
    value: number;
    max: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function ProgressBar({ label, value, max, color = 'blue' }: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
    };

    return (
        <div className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm text-gray-600">{value} / {max}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface AlertCardProps {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    onDismiss?: () => void;
}

export function AlertCard({ title, message, severity, onDismiss }: AlertCardProps) {
    const severityClasses = {
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        success: 'bg-green-50 border-green-200 text-green-900',
    };

    return (
        <div className={`p-4 rounded-lg border ${severityClasses[severity]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <p className="text-sm opacity-90">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-current opacity-50 hover:opacity-100 transition-opacity"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

interface SimpleBarChartProps {
    data: Array<{ label: string; value: number }>;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function SimpleBarChart({ data, color = 'blue' }: SimpleBarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
    };

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-300`}
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
