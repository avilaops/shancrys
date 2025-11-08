import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    FileText,
    Calendar,
    Users,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Upload,
    Eye,
    Moon,
    Sun,
} from 'lucide-react';
import {
    StatCard,
    ChartCard,
    ActivityItem,
    ProgressBar,
    AlertCard,
    SimpleBarChart,
} from '@/components/DashboardWidgets';

export default function EnhancedDashboard() {
    const [darkMode, setDarkMode] = useState(false);

    // Mock data - replace with real data from API
    const stats = {
        totalProjects: 12,
        activeProjects: 5,
        completedTasks: 234,
        teamMembers: 8,
    };

    const projectProgress = [
        { label: 'Edifício Alpha', value: 75 },
        { label: 'Residencial Beta', value: 45 },
        { label: 'Shopping Gamma', value: 90 },
        { label: 'Torre Delta', value: 30 },
    ];

    const elementsByType = [
        { label: 'Paredes', value: 450 },
        { label: 'Lajes', value: 320 },
        { label: 'Vigas', value: 180 },
        { label: 'Pilares', value: 120 },
        { label: 'Esquadrias', value: 95 },
    ];

    const recentActivities = [
        {
            title: 'Modelo IFC atualizado',
            description: 'Edifício Alpha - Revisão 03',
            time: 'Há 2 horas',
            icon: Upload,
            color: 'blue' as const,
        },
        {
            title: 'Quantificação concluída',
            description: 'Residencial Beta - Fase 2',
            time: 'Há 4 horas',
            icon: CheckCircle,
            color: 'green' as const,
        },
        {
            title: 'Nova medição adicionada',
            description: 'Shopping Gamma - Piso Térreo',
            time: 'Há 6 horas',
            icon: Eye,
            color: 'purple' as const,
        },
        {
            title: 'Prazo próximo',
            description: 'Torre Delta - Entrega em 3 dias',
            time: 'Há 1 dia',
            icon: AlertCircle,
            color: 'orange' as const,
        },
    ];

    const alerts = [
        {
            title: 'Atenção: Prazo próximo',
            message: 'O projeto Torre Delta tem prazo de entrega em 3 dias.',
            severity: 'warning' as const,
        },
        {
            title: 'Conflito detectado',
            message: 'Foram encontradas 5 interferências no modelo Edifício Alpha.',
            severity: 'error' as const,
        },
    ];

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-xl font-bold text-primary-600">
                                Shancrys
                            </Link>
                            <nav className="hidden md:flex items-center gap-6">
                                <Link
                                    to="/dashboard"
                                    className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/viewer"
                                    className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Visualizador 3D
                                </Link>
                                <Link
                                    to="/projects"
                                    className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Projetos
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
                                    }`}
                                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                            Dashboard
                        </h1>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Visão geral dos seus projetos e atividades
                        </p>
                    </div>

                    {/* Alerts */}
                    {alerts.length > 0 && (
                        <div className="mb-8 space-y-4">
                            {alerts.map((alert, index) => (
                                <AlertCard key={index} {...alert} />
                            ))}
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total de Projetos"
                            value={stats.totalProjects}
                            icon={Home}
                            trend={{ value: 12, label: 'este mês' }}
                            color="blue"
                        />
                        <StatCard
                            title="Projetos Ativos"
                            value={stats.activeProjects}
                            icon={FileText}
                            trend={{ value: 8, label: 'esta semana' }}
                            color="green"
                        />
                        <StatCard
                            title="Tarefas Concluídas"
                            value={stats.completedTasks}
                            icon={CheckCircle}
                            trend={{ value: 15, label: 'este mês' }}
                            color="purple"
                        />
                        <StatCard
                            title="Membros da Equipe"
                            value={stats.teamMembers}
                            icon={Users}
                            color="orange"
                        />
                    </div>

                    {/* Charts and Progress */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Project Progress */}
                        <ChartCard
                            title="Progresso dos Projetos"
                            subtitle="Status de andamento por projeto"
                        >
                            <div className="space-y-4">
                                {projectProgress.map((project, index) => (
                                    <ProgressBar
                                        key={index}
                                        label={project.label}
                                        value={project.value}
                                        max={100}
                                        color="green"
                                    />
                                ))}
                            </div>
                        </ChartCard>

                        {/* Elements by Type */}
                        <ChartCard
                            title="Elementos por Tipo"
                            subtitle="Distribuição de elementos BIM"
                        >
                            <SimpleBarChart data={elementsByType} color="blue" />
                        </ChartCard>
                    </div>

                    {/* Recent Activities and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activities */}
                        <div className="lg:col-span-2">
                            <ChartCard title="Atividades Recentes" subtitle="Últimas ações no sistema">
                                <div className="space-y-2">
                                    {recentActivities.map((activity, index) => (
                                        <ActivityItem key={index} {...activity} />
                                    ))}
                                </div>
                            </ChartCard>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <ChartCard title="Ações Rápidas" subtitle="Acesso rápido às funcionalidades">
                                <div className="space-y-3">
                                    <Link
                                        to="/viewer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        <Eye className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-blue-900">Abrir Visualizador 3D</span>
                                    </Link>
                                    <Link
                                        to="/projects"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-900">Gerenciar Projetos</span>
                                    </Link>
                                    <Link
                                        to="/calendar"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                                    >
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                        <span className="font-medium text-purple-900">Ver Cronograma</span>
                                    </Link>
                                    <Link
                                        to="/reports"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                                    >
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                        <span className="font-medium text-orange-900">Relatórios</span>
                                    </Link>
                                </div>
                            </ChartCard>
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="mt-8">
                        <ChartCard title="Próximos Prazos" subtitle="Entregas programadas">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Torre Delta - Fase 1</p>
                                            <p className="text-sm text-gray-600">Entrega do modelo BIM</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-orange-600">Em 3 dias</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Shopping Gamma - Quantificação</p>
                                            <p className="text-sm text-gray-600">Relatório de quantidades</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-green-600">Em 7 dias</span>
                                </div>
                            </div>
                        </ChartCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
