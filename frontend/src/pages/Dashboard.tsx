import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, TrendingUp, AlertCircle, ExternalLink, Loader2, LogOut, User, Home } from 'lucide-react';
import { billingApi, type Subscription, type Invoice, type UsageStats } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sub, inv, use] = await Promise.all([
                billingApi.getSubscription().catch(() => null),
                billingApi.getInvoices().catch(() => []),
                billingApi.getUsage().catch(() => null),
            ]);
            setSubscription(sub);
            setInvoices(inv);
            setUsage(use);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;

        setActionLoading(true);
        try {
            await billingApi.cancelSubscription(false);
            await loadData();
            alert('Assinatura cancelada com sucesso. Você terá acesso até o fim do período atual.');
        } catch (error) {
            console.error('Error canceling subscription:', error);
            alert('Erro ao cancelar assinatura. Tente novamente.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setActionLoading(true);
        try {
            await billingApi.reactivateSubscription();
            await loadData();
            alert('Assinatura reativada com sucesso!');
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            alert('Erro ao reativar assinatura. Tente novamente.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleManageBilling = async () => {
        setActionLoading(true);
        try {
            const { url } = await billingApi.createPortal(window.location.href);
            window.location.href = url;
        } catch (error) {
            console.error('Error opening portal:', error);
            alert('Erro ao abrir portal de gerenciamento. Tente novamente.');
            setActionLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Nenhuma assinatura ativa
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Escolha um plano para começar a usar o Shancrys.
                    </p>
                    <a
                        href="/#pricing"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                    >
                        Ver Planos
                    </a>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-xl font-bold text-primary-600">
                                Shancrys
                            </Link>
                            <nav className="hidden md:flex items-center gap-6">
                                <Link to="/dashboard" className="text-gray-900 font-medium">
                                    Dashboard
                                </Link>
                                <Link to="/viewer" className="text-gray-600 hover:text-gray-900">
                                    Visualizador 3D
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <User className="w-4 h-4" />
                                <span>{user?.name}</span>
                            </div>
                            <Link
                                to="/"
                                className="p-2 text-gray-600 hover:text-gray-900 transition"
                                title="Início"
                            >
                                <Home className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden md:inline">Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciar Assinatura</h1>

                    {/* Subscription Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Plano {subscription.plan?.name}
                                </h2>
                                <p className="text-gray-600">
                                    {subscription.plan?.description}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : subscription.status === 'Trialing'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {subscription.status}
                            </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Período atual</p>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-primary-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Cobrança</p>
                                    <p className="font-medium text-gray-900">
                                        {subscription.billingInterval === 'Monthly' ? 'Mensal' : 'Anual'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Renovação</p>
                                    <p className="font-medium text-gray-900">
                                        {subscription.cancelAtPeriodEnd ? 'Cancelada' : 'Automática'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleManageBilling}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4" />
                                        Gerenciar Pagamento
                                    </>
                                )}
                            </button>

                            {subscription.cancelAtPeriodEnd ? (
                                <button
                                    onClick={handleReactivateSubscription}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    Reativar Assinatura
                                </button>
                            ) : (
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={actionLoading}
                                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
                                >
                                    Cancelar Assinatura
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Usage Stats */}
                    {usage && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Uso Atual</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <UsageBar
                                    label="Projetos"
                                    current={usage.projectCount}
                                    limit={usage.limits.maxProjects}
                                />
                                <UsageBar
                                    label="Usuários"
                                    current={usage.userCount}
                                    limit={usage.limits.maxUsers}
                                />
                                <UsageBar
                                    label="Armazenamento"
                                    current={usage.storageUsedGB}
                                    limit={usage.limits.maxStorageGB}
                                    unit="GB"
                                />
                                <UsageBar
                                    label="Modelos"
                                    current={usage.modelCount}
                                    limit={usage.limits.maxModelsPerProject}
                                />
                            </div>
                        </div>
                    )}

                    {/* Invoices */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Faturas Recentes</h2>

                        {invoices.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">Nenhuma fatura ainda.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                                Número
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                                Data
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                                Valor
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                                Status
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {formatDate(invoice.paidAt || invoice.dueDate)}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                    {formatPrice(invoice.total)}
                                                </td>
                                                <td className="py-3 px-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">
                                                    {invoice.invoicePdfUrl && (
                                                        <a
                                                            href={invoice.invoicePdfUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:underline"
                                                        >
                                                            Download PDF
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface UsageBarProps {
    label: string;
    current: number;
    limit: number;
    unit?: string;
}

function UsageBar({ label, current, limit, unit = '' }: UsageBarProps) {
    const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100);
    const isUnlimited = limit === -1;

    return (
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm text-gray-600">
                    {current}
                    {unit} {!isUnlimited && `/ ${limit}${unit}`}
                    {isUnlimited && ' (Ilimitado)'}
                </span>
            </div>
            {!isUnlimited && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${percentage > 80 ? 'bg-red-600' : percentage > 60 ? 'bg-yellow-600' : 'bg-primary-600'
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}
