import { useState, useEffect } from 'react'
import { Zap, Upload, Download, Users, FileText } from 'lucide-react'

export default function EventStream() {
    const [events, setEvents] = useState<any[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            const eventTypes = [
                { type: 'model.uploaded', icon: Upload, color: 'blue', message: 'Modelo IFC carregado' },
                { type: 'model.processed', icon: Zap, color: 'green', message: 'Processamento de modelo concluído' },
                { type: 'elements.extracted', icon: FileText, color: 'purple', message: 'Elementos extraídos do modelo' },
                { type: 'user.login', icon: Users, color: 'cyan', message: 'Usuário autenticado' },
                { type: 'mapping.created', icon: Zap, color: 'yellow', message: 'Mapeamento 4D criado' }
            ]

            const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
            const mockEvent = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...event,
                data: {
                    projectId: `proj-${Math.floor(Math.random() * 100)}`,
                    userId: `user-${Math.floor(Math.random() * 50)}`
                }
            }

            setEvents(prev => [mockEvent, ...prev.slice(0, 49)])
        }, 1500)

        return () => clearInterval(interval)
    }, [])

    const getColorClasses = (color: string) => {
        const colors: any = {
            blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            green: 'bg-green-500/10 text-green-500 border-green-500/20',
            purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
            yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        }
        return colors[color] || colors.blue
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-white">Event Stream (Real-time)</h3>
                </div>
                <p className="text-gray-400 text-sm">
                    Monitoramento de eventos do sistema em tempo real via WebSocket
                </p>
            </div>

            <div className="space-y-3">
                {events.map(event => {
                    const Icon = event.icon
                    return (
                        <div
                            key={event.id}
                            className={`bg-gray-900 rounded-lg p-4 border ${getColorClasses(event.color)} log-entry`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${getColorClasses(event.color)}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-white">{event.message}</p>
                                            <code className="text-xs text-gray-400 mt-1 block">{event.type}</code>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                                        </span>
                                    </div>
                                    {event.data && (
                                        <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs font-mono">
                                            <pre className="text-gray-400">{JSON.stringify(event.data, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
