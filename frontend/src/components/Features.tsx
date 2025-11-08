import { Box, Calendar, LineChart, Users, Smartphone, Zap } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: Box,
            title: 'Importação BIM',
            description: 'Suporte completo para IFC 4.0 e DGN (Bentley). Parse otimizado processa 50k+ elementos em menos de 10 segundos.',
        },
        {
            icon: Calendar,
            title: 'Timeline 4D',
            description: 'Vincule elementos BIM às atividades do cronograma. Simule a construção em tempo real com 30+ FPS.',
        },
        {
            icon: LineChart,
            title: 'Analytics Avançado',
            description: 'Métricas de custo, produtividade e desvios. Forecasting inteligente com ML para antecipar problemas.',
        },
        {
            icon: Users,
            title: 'Colaboração',
            description: 'Multi-tenant com RBAC. Controle granular de acesso por disciplina, projeto e fase.',
        },
        {
            icon: Smartphone,
            title: 'Mobile Offline',
            description: 'App Flutter offline-first. Registre progresso, fotos e inspeções em campo, mesmo sem conexão.',
        },
        {
            icon: Zap,
            title: 'API Completa',
            description: 'RESTful API com OpenAPI 3.1. Integre com ERPs, sistemas de gestão e ferramentas de terceiros.',
        },
    ];

    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Funcionalidades Completas
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tudo o que você precisa para gerenciar construção digital em uma única plataforma.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
