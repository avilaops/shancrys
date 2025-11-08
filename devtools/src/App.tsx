import { useState, useEffect } from 'react'
import { Activity, Database, Zap, Clock, Users, FileCode } from 'lucide-react'
import LogViewer from './components/LogViewer'
import MetricsPanel from './components/MetricsPanel'
import ApiMonitor from './components/ApiMonitor'
import DatabaseMonitor from './components/DatabaseMonitor'
import EventStream from './components/EventStream'

function App() {
    const [activeTab, setActiveTab] = useState('logs')

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-8 h-8 text-yellow-500" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">Shancrys DevTools</h1>
                                <p className="text-sm text-gray-400">Observabilidade em tempo real</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-green-500 font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-6 flex gap-1 border-t border-gray-800">
                    <TabButton
                        icon={FileCode}
                        label="Logs"
                        active={activeTab === 'logs'}
                        onClick={() => setActiveTab('logs')}
                    />
                    <TabButton
                        icon={Activity}
                        label="Métricas"
                        active={activeTab === 'metrics'}
                        onClick={() => setActiveTab('metrics')}
                    />
                    <TabButton
                        icon={Database}
                        label="Database"
                        active={activeTab === 'database'}
                        onClick={() => setActiveTab('database')}
                    />
                    <TabButton
                        icon={Zap}
                        label="API Monitor"
                        active={activeTab === 'api'}
                        onClick={() => setActiveTab('api')}
                    />
                    <TabButton
                        icon={Clock}
                        label="Eventos"
                        active={activeTab === 'events'}
                        onClick={() => setActiveTab('events')}
                    />
                </nav>
            </header>

            {/* Content */}
            <main className="p-6">
                {activeTab === 'logs' && <LogViewer />}
                {activeTab === 'metrics' && <MetricsPanel />}
                {activeTab === 'database' && <DatabaseMonitor />}
                {activeTab === 'api' && <ApiMonitor />}
                {activeTab === 'events' && <EventStream />}
            </main>
        </div>
    )
}

function TabButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
        ${active
                    ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }
      `}
        >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
        </button>
    )
}

export default App
