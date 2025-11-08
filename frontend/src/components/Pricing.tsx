import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { billingApi, type Plan, type PlanFeatures } from '../services/api';

interface PricingProps {
    onCheckout?: (planId: string, interval: 'Monthly' | 'Yearly') => void;
}

export default function Pricing({ onCheckout }: PricingProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [interval, setInterval] = useState<'Monthly' | 'Yearly'>('Monthly');
    const plans: Plan[] = [
        {
            id: 'free',
            name: 'Free',
            description: 'Ideal para explorar a plataforma',
            priceMonthly: 0,
            priceYearly: 0,
            currency: 'BRL',
            sortOrder: 1,
            features: {
                maxProjects: 1,
                maxUsers: 3,
                maxStorageGB: 1,
                maxModelsPerProject: 1,
                hasAdvancedAnalytics: false,
                has4DSimulation: false,
                hasOfflineSync: false,
                hasAPIAccess: false,
                hasPrioritySupport: false,
                hasCustomBranding: false,
                hasSSOIntegration: false,
            },
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Para equipes profissionais de construção',
            priceMonthly: 299.9,
            priceYearly: 2999.0,
            currency: 'BRL',
            sortOrder: 2,
            features: {
                maxProjects: 10,
                maxUsers: 20,
                maxStorageGB: 50,
                maxModelsPerProject: 5,
                hasAdvancedAnalytics: true,
                has4DSimulation: true,
                hasOfflineSync: true,
                hasAPIAccess: true,
                hasPrioritySupport: false,
                hasCustomBranding: false,
                hasSSOIntegration: false,
            },
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Solução corporativa completa',
            priceMonthly: 999.9,
            priceYearly: 9999.0,
            currency: 'BRL',
            sortOrder: 3,
            features: {
                maxProjects: -1,
                maxUsers: -1,
                maxStorageGB: 500,
                maxModelsPerProject: -1,
                hasAdvancedAnalytics: true,
                has4DSimulation: true,
                hasOfflineSync: true,
                hasAPIAccess: true,
                hasPrioritySupport: true,
                hasCustomBranding: true,
                hasSSOIntegration: true,
            },
        },
    ];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getFeatureList = (features: PlanFeatures, _plan: Plan) => {
        const items: string[] = [];

        if (features.maxProjects === -1) {
            items.push('Projetos ilimitados');
        } else {
            items.push(`${features.maxProjects} ${features.maxProjects === 1 ? 'projeto' : 'projetos'}`);
        }

        if (features.maxUsers === -1) {
            items.push('Usuários ilimitados');
        } else {
            items.push(`Até ${features.maxUsers} usuários`);
        }

        items.push(`${features.maxStorageGB}GB de armazenamento`);

        if (features.maxModelsPerProject === -1) {
            items.push('Modelos ilimitados por projeto');
        } else {
            items.push(`${features.maxModelsPerProject} ${features.maxModelsPerProject === 1 ? 'modelo' : 'modelos'} por projeto`);
        }

        if (features.has4DSimulation) items.push('Simulação 4D');
        if (features.hasAdvancedAnalytics) items.push('Analytics avançado');
        if (features.hasOfflineSync) items.push('Sincronização offline');
        if (features.hasAPIAccess) items.push('Acesso API');
        if (features.hasPrioritySupport) items.push('Suporte prioritário');
        if (features.hasCustomBranding) items.push('Branding personalizado');
        if (features.hasSSOIntegration) items.push('Integração SSO');

        return items;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const handleCheckout = async (planId: string) => {
        if (onCheckout) {
            onCheckout(planId, interval);
            return;
        }

        setLoading(planId);
        try {
            const { url } = await billingApi.createCheckout(
                planId,
                interval,
                `${window.location.origin}/success`,
                `${window.location.origin}/#pricing`
            );
            window.location.href = url;
        } catch (error) {
            console.error('Error creating checkout:', error);
            alert('Erro ao iniciar checkout. Tente novamente.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Planos e Preços
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Escolha o plano ideal para sua equipe. Sem taxas de setup, cancele quando quiser.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-4 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setInterval('Monthly')}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${interval === 'Monthly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setInterval('Yearly')}
                            className={`px-6 py-2 rounded-md font-medium transition-colors ${interval === 'Yearly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Anual
                            <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                -17%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const features = getFeatureList(plan.features, plan);
                        const isPopular = plan.id === 'pro';

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${isPopular ? 'ring-2 ring-primary-500 transform scale-105' : ''
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-semibold">
                                        Mais Popular
                                    </div>
                                )}

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-600 mb-6">{plan.description}</p>

                                    <div className="mb-6">
                                        <span className="text-5xl font-bold text-gray-900">
                                            {formatPrice(interval === 'Monthly' ? plan.priceMonthly : plan.priceYearly / 12)}
                                        </span>
                                        <span className="text-gray-600">/mês</span>
                                        {interval === 'Yearly' && plan.priceYearly > 0 && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Cobrado {formatPrice(plan.priceYearly)} por ano
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={loading === plan.id}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isPopular
                                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                    >
                                        {loading === plan.id ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            plan.priceMonthly === 0 ? 'Começar Grátis' : 'Assinar Agora'
                                        )}
                                    </button>                                    <div className="mt-8 space-y-4">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-start">
                                                <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600">
                        Precisa de mais? Entre em contato para um plano customizado.{' '}
                        <a href="#contact" className="text-primary-600 font-semibold hover:underline">
                            Falar com vendas
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
