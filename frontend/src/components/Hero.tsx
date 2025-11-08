import { ArrowRight, Building2, Zap, Globe, Shield } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full mb-6">
                            <Zap className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Plataforma BIM 4D</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Construção Digital{' '}
                            <span className="text-primary-300">em 4D</span>
                        </h1>

                        <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                            Integre modelo BIM (3D) + cronograma (tempo) para simular, planejar
                            e controlar a execução de obras com precisão.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="/viewer"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                            >
                                Abrir Visualizador 3D
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </a>
                            <a
                                href="#pricing"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                            >
                                Ver Planos
                            </a>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-6">
                            <div>
                                <div className="text-3xl font-bold mb-1">50k+</div>
                                <div className="text-primary-200 text-sm">Elementos BIM</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold mb-1">{"<10s"}</div>
                                <div className="text-primary-200 text-sm">Importação IFC</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold mb-1">30 FPS</div>
                                <div className="text-primary-200 text-sm">Simulação 4D</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-32 h-32 text-white/50" />
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-4 max-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-primary-600" />
                                    <span className="font-semibold text-gray-900 text-sm">
                                        Multi-tenant
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Isolamento total de dados por tenant
                                </p>
                            </div>

                            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-xl p-4 max-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="w-5 h-5 text-primary-600" />
                                    <span className="font-semibold text-gray-900 text-sm">
                                        Offline-first
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Trabalhe em campo sem internet
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
