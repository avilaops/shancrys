import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Calendar, CreditCard } from 'lucide-react';

export default function Success() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = '/dashboard';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Pagamento Confirmado! 🎉
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    Sua assinatura foi ativada com sucesso. Bem-vindo ao Shancrys!
                </p>

                <div className="bg-primary-50 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Próximos Passos
                    </h2>

                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Acesse seu painel</p>
                                <p className="text-sm text-gray-600">
                                    Gerencie sua assinatura, faturas e uso
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Crie seu primeiro projeto</p>
                                <p className="text-sm text-gray-600">
                                    Importe modelos BIM e comece a visualizar em 4D
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Convide sua equipe</p>
                                <p className="text-sm text-gray-600">
                                    Colabore com outros membros do time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                    <a
                        href="/dashboard"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                        Ir para o Painel
                        <ArrowRight className="w-5 h-5" />
                    </a>

                    <a
                        href="/docs"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        Ver Documentação
                    </a>
                </div>

                <p className="text-sm text-gray-500">
                    Redirecionando automaticamente em {countdown} segundos...
                </p>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Informações da Assinatura
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Confirmação</p>
                                <p className="font-medium text-gray-900">
                                    Um email de confirmação foi enviado com todos os detalhes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Faturas</p>
                                <p className="font-medium text-gray-900">
                                    Acesse suas faturas no painel de gerenciamento
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Dica:</strong> Configure notificações para receber alertas sobre uso e renovação da assinatura
                    </p>
                </div>
            </div>
        </div>
    );
}
