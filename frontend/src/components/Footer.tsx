import { Github, Linkedin, Mail, Building2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-8 h-8 text-primary-500" />
                            <span className="text-xl font-bold text-white">Shancrys</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Plataforma de Construção Digital 4D para gerenciamento inteligente de obras.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Produto</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-primary-400">Funcionalidades</a></li>
                            <li><a href="#pricing" className="hover:text-primary-400">Preços</a></li>
                            <li><a href="/docs" className="hover:text-primary-400">Documentação</a></li>
                            <li><a href="/api" className="hover:text-primary-400">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Empresa</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/about" className="hover:text-primary-400">Sobre</a></li>
                            <li><a href="/blog" className="hover:text-primary-400">Blog</a></li>
                            <li><a href="/careers" className="hover:text-primary-400">Carreiras</a></li>
                            <li><a href="/contact" className="hover:text-primary-400">Contato</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/privacy" className="hover:text-primary-400">Privacidade</a></li>
                            <li><a href="/terms" className="hover:text-primary-400">Termos de Uso</a></li>
                            <li><a href="/security" className="hover:text-primary-400">Segurança</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">
                        © 2025 Shancrys. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="https://github.com/avilaops/shancrys" className="hover:text-primary-400">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://linkedin.com/company/shancrys" className="hover:text-primary-400">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="mailto:contato@shancrys.com" className="hover:text-primary-400">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
