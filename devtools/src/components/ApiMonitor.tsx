import { useState, useEffect } from 'react'
import { Globe, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function ApiMonitor() {
    const [requests, setRequests] = useState<any[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            const methods = ['GET', 'POST', 'PUT', 'DELETE']
            const endpoints = [
                '/api/v1/projects',
                '/api/v1/models',
                '/api/v1/elements',
                '/api/v1/activities',
                '/api/v1/mappings',
                '/api/v1/auth/login'
            ]
            const statuses = [200, 201, 400, 404, 500]

            const mockRequest = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                method: methods[Math.floor(Math.random() * methods.length)],
                endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                duration: Math.floor(Math.random() * 500),
                size: Math.floor(Math.random() * 100000)
            }

            setRequests(prev => [mockRequest, ...prev.slice(0, 99)])
        }, 800)

        return () => clearInterval(interval)
    }, [])

    const stats = {
        total: requests.length,
        success: requests.filter(r => r.status < 400).length,
        errors: requests.filter(r => r.status >= 400).length,
        avgDuration: requests.length > 0
            ? (requests.reduce((acc, r) => acc + r.duration, 0) / requests.length).toFixed(0)
            : '0'
    }

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'text-blue-400 bg-blue-500/10'
            case 'POST': return 'text-green-400 bg-green-500/10'
            case 'PUT': return 'text-yellow-400 bg-yellow-500/10'
            case 'DELETE': return 'text-red-400 bg-red-500/10'
            default: return 'text-gray-400 bg-gray-500/10'
        }
    }

    const getStatusColor = (status: number) => {
        if (status < 300) return 'text-green-400'
        if (status < 400) return 'text-yellow-400'
        return 'text-red-400'
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-blue-500" />
                        <div>
                            <p className="text-gray-400 text-sm">Total Requests</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div>
                            <p className="text-gray-400 text-sm">Sucesso</p>
                            <p className="text-2xl font-bold text-white">{stats.success}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-500" />
                        <div>
                            <p className="text-gray-400 text-sm">Erros</p>
                            <p className="text-2xl font-bold text-white">{stats.errors}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-500" />
                        <div>
                            <p className="text-gray-400 text-sm">Tempo Médio</p>
                            <p className="text-2xl font-bold text-white">{stats.avgDuration}ms</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request List */}
            <div className="bg-gray-900 rounded-lg border border-gray-800">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">Requisições em Tempo Real</h3>
                </div>
                <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                    {requests.map(req => (
                        <div key={req.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(req.method)}`}>
                                    {req.method}
                                </span>
                                <code className="text-gray-300 flex-1 text-sm">{req.endpoint}</code>
                                <span className={`font-bold ${getStatusColor(req.status)}`}>
                                    {req.status}
                                </span>
                                <span className="text-gray-400 text-sm">{req.duration}ms</span>
                                <span className="text-gray-500 text-xs">
                                    {(req.size / 1024).toFixed(1)}KB
                                </span>
                                <span className="text-gray-500 text-xs">
                                    {new Date(req.timestamp).toLocaleTimeString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
