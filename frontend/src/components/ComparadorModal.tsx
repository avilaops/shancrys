import { useEffect, useState, useCallback } from 'react';
import { X, TrendingDown, Clock, Leaf, AlertCircle, CheckCircle, Package, DollarSign } from 'lucide-react';
import { materiaisService, type ComparacaoMateriais } from '../services/materiaisService';

interface ComparadorModalProps {
    materiaisIds: string[];
    onFechar: () => void;
}

export default function ComparadorModal({ materiaisIds, onFechar }: ComparadorModalProps) {
    const [comparacao, setComparacao] = useState<ComparacaoMateriais | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregarComparacao = useCallback(async () => {
        try {
            setLoading(true);
            setErro(null);
            const dados = await materiaisService.comparar(materiaisIds);
            setComparacao(dados);
        } catch (error) {
            console.error('Erro ao comparar materiais:', error);
            setErro('Erro ao carregar comparação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [materiaisIds]);

    useEffect(() => {
        carregarComparacao();
    }, [carregarComparacao]);

    const formatarPreco = (preco: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const getDisponibilidadeTexto = (disponibilidade: string) => {
        const textos: Record<string, string> = {
            'Imediata': 'Disponível',
            'SobEncomenda': 'Sob Encomenda',
            'LongaEspera': 'Longa Espera',
            'Descontinuado': 'Descontinuado'
        };
        return textos[disponibilidade] || disponibilidade;
    };

    const isMelhor = (materialId: string, categoria: 'preco' | 'prazo' | 'sustentabilidade') => {
        if (!comparacao) return false;
        
        const melhor = categoria === 'preco' 
            ? comparacao.analise.maisBarato
            : categoria === 'prazo'
            ? comparacao.analise.maisRapido
            : comparacao.analise.maisSustentavel;

        return melhor?.id === materialId;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Comparação de Materiais
                        </h2>
                        <p className="text-primary-100 text-sm mt-1">
                            Compare especificações, preços e sustentabilidade
                        </p>
                    </div>
                    <button
                        onClick={onFechar}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : erro ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                            <p className="text-red-800">{erro}</p>
                            <button
                                onClick={carregarComparacao}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    ) : comparacao ? (
                        <>
                            {/* Análise Rápida */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <h3 className="font-semibold text-green-900">Mais Econômico</h3>
                                    </div>
                                    <p className="text-sm text-green-800 font-medium">
                                        {comparacao.analise.maisBarato.nome}
                                    </p>
                                    <p className="text-lg font-bold text-green-900 mt-1">
                                        {formatarPreco(comparacao.analise.maisBarato.precoUnitario)}
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-semibold text-blue-900">Entrega Mais Rápida</h3>
                                    </div>
                                    <p className="text-sm text-blue-800 font-medium">
                                        {comparacao.analise.maisRapido.nome}
                                    </p>
                                    <p className="text-lg font-bold text-blue-900 mt-1">
                                        {comparacao.analise.maisRapido.prazoEntregaDias} dias
                                    </p>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Leaf className="w-5 h-5 text-emerald-600" />
                                        <h3 className="font-semibold text-emerald-900">Mais Sustentável</h3>
                                    </div>
                                    <p className="text-sm text-emerald-800 font-medium">
                                        {comparacao.analise.maisSustentavel.nome}
                                    </p>
                                    <p className="text-lg font-bold text-emerald-900 mt-1">
                                        {comparacao.analise.maisSustentavel.pegadaCO2 
                                            ? `${comparacao.analise.maisSustentavel.pegadaCO2.toFixed(1)} kg CO₂`
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Tabela Comparativa */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-48">
                                                    Característica
                                                </th>
                                                {comparacao.materiais.map(material => (
                                                    <th key={material.id} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-base">{material.nome}</div>
                                                            <div className="text-xs text-gray-500 font-normal">
                                                                {material.codigo}
                                                            </div>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {/* Preço */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    💰 Preço Unitário
                                                </td>
                                                {comparacao.materiais.map(material => (
                                                    <td key={material.id} className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-gray-900">
                                                                {formatarPreco(material.precoUnitario)}
                                                            </span>
                                                            {isMelhor(material.id, 'preco') && (
                                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            por {material.unidade}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Prazo */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    ⏱️ Prazo de Entrega
                                                </td>
                                                {comparacao.materiais.map(material => (
                                                    <td key={material.id} className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {material.prazoEntregaDias} dias
                                                            </span>
                                                            {isMelhor(material.id, 'prazo') && (
                                                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Disponibilidade */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    📦 Disponibilidade
                                                </td>
                                                {comparacao.materiais.map(material => (
                                                    <td key={material.id} className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            material.disponibilidade === 'Imediata'
                                                                ? 'bg-green-100 text-green-800'
                                                                : material.disponibilidade === 'SobEncomenda'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {getDisponibilidadeTexto(material.disponibilidade)}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Sustentabilidade */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    🌱 Pegada de CO₂
                                                </td>
                                                {comparacao.materiais.map(material => (
                                                    <td key={material.id} className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {material.pegadaCO2 
                                                                    ? `${material.pegadaCO2.toFixed(1)} kg`
                                                                    : 'N/A'
                                                                }
                                                            </span>
                                                            {isMelhor(material.id, 'sustentabilidade') && (
                                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Reciclável */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    ♻️ Reciclável
                                                </td>
                                                {comparacao.materiais.map(material => (
                                                    <td key={material.id} className="px-4 py-3">
                                                        {material.reciclavel ? (
                                                            <span className="text-green-600 font-medium">Sim</span>
                                                        ) : (
                                                            <span className="text-gray-500">Não</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Fornecedores */}
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    🏪 Fornecedores
                                                </td>
                                                {comparacao.materiais.map(material => (
                                                    <td key={material.id} className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <Package className="w-4 h-4 text-gray-500" />
                                                            <span className="font-semibold text-gray-900">
                                                                {material.fornecedores}
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Especificações */}
                                            {comparacao.materiais.some(m => m.especificacoes.resistencia) && (
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        💪 Resistência
                                                    </td>
                                                    {comparacao.materiais.map(material => (
                                                        <td key={material.id} className="px-4 py-3 text-sm text-gray-700">
                                                            {material.especificacoes.resistencia || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )}

                                            {comparacao.materiais.some(m => m.especificacoes.dimensoes) && (
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        📏 Dimensões
                                                    </td>
                                                    {comparacao.materiais.map(material => (
                                                        <td key={material.id} className="px-4 py-3 text-sm text-gray-700">
                                                            {material.especificacoes.dimensoes || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Recomendação */}
                            <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-6">
                                <div className="flex items-start gap-3">
                                    <TrendingDown className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-primary-900 mb-2">
                                            Recomendação Inteligente
                                        </h3>
                                        <p className="text-sm text-primary-800">
                                            Para melhor custo-benefício, recomendamos <strong>{comparacao.analise.maisBarato.nome}</strong> 
                                            {' '}pelo menor preço. Se sustentabilidade é prioridade, considere{' '}
                                            <strong>{comparacao.analise.maisSustentavel.nome}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onFechar}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                        Fechar
                    </button>
                    <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                        Adicionar ao Orçamento
                    </button>
                </div>
            </div>
        </div>
    );
}
