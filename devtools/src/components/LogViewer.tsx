import { useState, useEffect, useRef } from 'react'
import { Search, Download, Trash2, Filter, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'

interface LogEntry {
    timestamp: string
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
    source: string
    message: string
    context?: any
}

export default function LogViewer() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [filter, setFilter] = useState('')
    const [levelFilter, setLevelFilter] = useState<string[]>(['INFO', 'WARN', 'ERROR', 'DEBUG'])
    const [autoScroll, setAutoScroll] = useState(true)
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Simular recebimento de logs via WebSocket
        const interval = setInterval(() => {
            const mockLog: LogEntry = {
                timestamp: new Date().toISOString(),
                level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 4)] as any,
                source: ['API', 'Database', 'Engine', 'Auth', 'Upload'][Math.floor(Math.random() * 5)],
                message: [
                    'Request received: GET /api/v1/projects',
                    'Database query executed: SELECT * FROM elements',
                    'Model processing started: model-123.ifc',
                    'User authenticated: admin@shancrys.com',
                    'File uploaded: 25.3 MB',
                    'Cache hit: project-456',
                    'Background job completed: extract-elements',
                    'Warning: High memory usage detected'
                ][Math.floor(Math.random() * 8)]
            }
            setLogs(prev => [...prev.slice(-999), mockLog])
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (autoScroll) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs, autoScroll])

    const filteredLogs = logs.filter(log =>
        levelFilter.includes(log.level) &&
        (log.message.toLowerCase().includes(filter.toLowerCase()) ||
            log.source.toLowerCase().includes(filter.toLowerCase()))
    )

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'INFO': return <Info className="w-4 h-4 text-blue-500" />
            case 'WARN': return <AlertCircle className="w-4 h-4 text-yellow-500" />
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />
            case 'DEBUG': return <CheckCircle className="w-4 h-4 text-gray-500" />
            default: return null
        }
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-blue-400 bg-blue-500/10'
            case 'WARN': return 'text-yellow-400 bg-yellow-500/10'
            case 'ERROR': return 'text-red-400 bg-red-500/10'
            case 'DEBUG': return 'text-gray-400 bg-gray-500/10'
            default: return 'text-gray-400'
        }
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex gap-3 items-center flex-wrap">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filtrar logs..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {(['INFO', 'WARN', 'ERROR', 'DEBUG'] as const).map(level => (
                            <button
                                key={level}
                                onClick={() => setLevelFilter(prev =>
                                    prev.includes(level)
                                        ? prev.filter(l => l !== level)
                                        : [...prev, level]
                                )}
                                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${levelFilter.includes(level)
                                        ? getLevelColor(level)
                                        : 'text-gray-500 bg-gray-800 hover:bg-gray-700'
                                    }
                `}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${autoScroll ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-800 text-gray-400'
                            }`}
                    >
                        Auto-scroll
                    </button>

                    <button
                        onClick={() => setLogs([])}
                        className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpar
                    </button>

                    <button className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-gray-400">Total: <span className="text-white font-medium">{logs.length}</span></span>
                    <span className="text-gray-400">Filtrados: <span className="text-white font-medium">{filteredLogs.length}</span></span>
                </div>
            </div>

            {/* Logs */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 h-[calc(100vh-320px)] overflow-y-auto">
                <div className="p-4 space-y-1 font-mono text-sm">
                    {filteredLogs.map((log, i) => (
                        <div key={i} className="log-entry flex gap-3 p-2 hover:bg-gray-800/50 rounded">
                            <div className="flex items-center gap-2 min-w-[140px]">
                                <span className="text-gray-500 text-xs">
                                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-[80px]">
                                {getLevelIcon(log.level)}
                                <span className={`text-xs font-bold ${getLevelColor(log.level)}`}>
                                    {log.level}
                                </span>
                            </div>
                            <div className="min-w-[100px]">
                                <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                                    {log.source}
                                </span>
                            </div>
                            <div className="flex-1 text-gray-300">
                                {log.message}
                            </div>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    )
}
