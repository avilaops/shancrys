import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Cpu, HardDrive, Zap, Clock, Users } from 'lucide-react'

export default function MetricsPanel() {
    const [metrics, setMetrics] = useState({
        cpu: 0,
        memory: 0,
        requests: 0,
        errors: 0,
        latency: 0,
        activeUsers: 0
    })

    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            const newMetrics = {
                cpu: Math.random() * 100,
                memory: 50 + Math.random() * 30,
                requests: Math.floor(Math.random() * 100),
                errors: Math.floor(Math.random() * 5),
                latency: Math.floor(50 + Math.random() * 150),
                activeUsers: Math.floor(10 + Math.random() * 40)
            }
            setMetrics(newMetrics)

            setChartData(prev => {
                const newData = [...prev.slice(-19), {
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: newMetrics.cpu,
                    memory: newMetrics.memory,
                    requests: newMetrics.requests,
                    latency: newMetrics.latency
                }]
                return newData
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                    icon={Cpu}
                    title="CPU"
                    value={`${metrics.cpu.toFixed(1)}%`}
                    color="blue"
                    trend={metrics.cpu > 70 ? 'high' : 'normal'}
                />
                <MetricCard
                    icon={HardDrive}
                    title="Memória"
                    value={`${metrics.memory.toFixed(1)}%`}
                    color="purple"
                    trend={metrics.memory > 80 ? 'high' : 'normal'}
                />
                <MetricCard
                    icon={Zap}
                    title="Requests/s"
                    value={metrics.requests.toString()}
                    color="green"
                />
                <MetricCard
                    icon={Activity}
                    title="Erros/min"
                    value={metrics.errors.toString()}
                    color="red"
                    trend={metrics.errors > 3 ? 'high' : 'normal'}
                />
                <MetricCard
                    icon={Clock}
                    title="Latência"
                    value={`${metrics.latency}ms`}
                    color="yellow"
                    trend={metrics.latency > 150 ? 'high' : 'normal'}
                />
                <MetricCard
                    icon={Users}
                    title="Usuários Ativos"
                    value={metrics.activeUsers.toString()}
                    color="cyan"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="CPU & Memória">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#9ca3af' }}
                            />
                            <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpuGradient)" strokeWidth={2} />
                            <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="url(#memGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Requests & Latência">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#9ca3af' }}
                            />
                            <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}

function MetricCard({ icon: Icon, title, value, color, trend }: any) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-500',
        purple: 'bg-purple-500/10 text-purple-500',
        green: 'bg-green-500/10 text-green-500',
        red: 'bg-red-500/10 text-red-500',
        yellow: 'bg-yellow-500/10 text-yellow-500',
        cyan: 'bg-cyan-500/10 text-cyan-500'
    }

    return (
        <div className="metric-card bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend === 'high' && (
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded">
                        Alto
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
        </div>
    )
}

function ChartCard({ title, children }: any) {
    return (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            {children}
        </div>
    )
}
