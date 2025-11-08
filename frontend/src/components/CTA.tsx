import { ArrowRight } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-bold mb-6">
                    Pronto para transformar sua construção?
                </h2>
                <p className="text-xl text-primary-100 mb-8">
                    Junte-se a centenas de empresas que já utilizam Shancrys para gerenciar seus projetos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="#pricing"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                        Começar Agora
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                    <a
                        href="mailto:contato@shancrys.com"
                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                        Agendar Demo
                    </a>
                </div>
            </div>
        </section>
    );
}
