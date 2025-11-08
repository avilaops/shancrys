import { useState, useEffect } from 'react'
import { Database, Table, Search } from 'lucide-react'

export default function DatabaseMonitor() {
    const [queries, setQueries] = useState<any[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            const mockQuery = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                query: [
                    'SELECT * FROM projects WHERE tenant_id = $1',
                    'INSERT INTO elements (id, name, type) VALUES ($1, $2, $3)',
                    'UPDATE activities SET progress_percent = $1 WHERE id = $2',
                    'SELECT COUNT(*) FROM model_versions WHERE status = $1',
                    'DELETE FROM element_activity_mappings WHERE activity_id = $1'
                ][Math.floor(Math.random() * 5)],
                duration: Math.floor(Math.random() * 100),
                rows: Math.floor(Math.random() * 1000)
            }
            setQueries(prev => [mockQuery, ...prev.slice(0, 49)])
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    const stats = {
        totalQueries: queries.length,
        avgDuration: queries.length > 0
            ? (queries.reduce((acc, q) => acc + q.duration, 0) / queries.length).toFixed(1)
            : '0',
        slowQueries: queries.filter(q => q.duration > 50).length
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Database className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Queries</p>
                            <p className="text-2xl font-bold text-white">{stats.totalQueries}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <Database className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Tempo Médio</p>
                            <p className="text-2xl font-bold text-white">{stats.avgDuration}ms</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <Database className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Queries Lentas</p>
                            <p className="text-2xl font-bold text-white">{stats.slowQueries}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Query List */}
            <div className="bg-gray-900 rounded-lg border border-gray-800">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">Queries Recentes</h3>
                </div>
                <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                    {queries.map(query => (
                        <div key={query.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 font-mono text-sm">
                                    <code className="text-green-400">{query.query}</code>
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <span className={`${query.duration > 50 ? 'text-red-400' : 'text-gray-400'}`}>
                                        {query.duration}ms
                                    </span>
                                    <span className="text-gray-400">{query.rows} rows</span>
                                    <span className="text-gray-500">
                                        {new Date(query.timestamp).toLocaleTimeString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
