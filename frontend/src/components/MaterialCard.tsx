import { CheckCircle, Circle, Package, TrendingUp, Clock, Leaf, MapPin } from 'lucide-react';
import type { Material } from '../services/materiaisService';

interface MaterialCardProps {
    material: Material;
    selecionado: boolean;
    onToggleSelecao: (id: string) => void;
}

export default function MaterialCard({ material, selecionado, onToggleSelecao }: MaterialCardProps) {
    const formatarPreco = (preco: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const getCategoriaColor = (categoria: string) => {
        const cores: Record<string, string> = {
            'Estrutura': 'bg-orange-100 text-orange-800',
            'Alvenaria': 'bg-red-100 text-red-800',
            'Revestimento': 'bg-blue-100 text-blue-800',
            'Instalacoes': 'bg-purple-100 text-purple-800',
            'Acabamento': 'bg-pink-100 text-pink-800',
            'Impermeabilizacao': 'bg-cyan-100 text-cyan-800',
            'Esquadrias': 'bg-indigo-100 text-indigo-800',
            'Metais': 'bg-gray-100 text-gray-800',
            'Loucas': 'bg-teal-100 text-teal-800',
            'Diversos': 'bg-yellow-100 text-yellow-800'
        };
        return cores[categoria] || 'bg-gray-100 text-gray-800';
    };

    const getDisponibilidadeColor = (disponibilidade: string) => {
        const cores: Record<string, string> = {
            'Imediata': 'text-green-600',
            'SobEncomenda': 'text-yellow-600',
            'LongaEspera': 'text-orange-600',
            'Descontinuado': 'text-red-600'
        };
        return cores[disponibilidade] || 'text-gray-600';
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

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                selecionado ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}
            onClick={() => onToggleSelecao(material.id)}
        >
            <div className="p-6">
                {/* Header com Seleção e Categoria */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoriaColor(material.categoria)}`}>
                                {material.categoria}
                            </span>
                            {material.reciclavel && (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                    <Leaf className="w-3 h-3" />
                                    Reciclável
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {material.nome}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Código: {material.codigo}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelecao(material.id);
                        }}
                        className="flex-shrink-0"
                    >
                        {selecionado ? (
                            <CheckCircle className="w-6 h-6 text-primary-600" />
                        ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                        )}
                    </button>
                </div>

                {/* Descrição */}
                {material.descricao && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {material.descricao}
                    </p>
                )}

                {/* Especificações Principais */}
                {material.especificacoes && (
                    <div className="mb-4 space-y-1">
                        {material.especificacoes.resistencia && (
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Resistência:</span> {material.especificacoes.resistencia}
                            </p>
                        )}
                        {material.especificacoes.dimensoes && (
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Dimensões:</span> {material.especificacoes.dimensoes}
                            </p>
                        )}
                        {material.especificacoes.normaTecnica && (
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Norma:</span> {material.especificacoes.normaTecnica}
                            </p>
                        )}
                    </div>
                )}

                {/* Preço e Unidade */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                        {formatarPreco(material.precoUnitario)}
                    </span>
                    <span className="text-sm text-gray-500">
                        / {material.unidade}
                    </span>
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className={`w-4 h-4 ${getDisponibilidadeColor(material.disponibilidade)}`} />
                        <span className={getDisponibilidadeColor(material.disponibilidade)}>
                            {getDisponibilidadeTexto(material.disponibilidade)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{material.prazoEntregaDias} dias</span>
                    </div>
                    {material.regiao && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                            <MapPin className="w-4 h-4" />
                            <span>{material.regiao}</span>
                        </div>
                    )}
                </div>

                {/* Sustentabilidade */}
                {material.pegadaCO2 !== undefined && (
                    <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                                <Leaf className="w-4 h-4 text-green-600" />
                                Pegada de CO₂
                            </span>
                            <span className="font-medium text-gray-900">
                                {material.pegadaCO2.toFixed(1)} kg
                            </span>
                        </div>
                    </div>
                )}

                {/* Fornecedores */}
                {material.fornecedores.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{material.fornecedores.length} fornecedor(es) disponível(eis)</span>
                        </div>
                    </div>
                )}

                {/* Fonte do Preço */}
                {material.fontePreco && (
                    <div className="mt-2 text-xs text-gray-500">
                        Fonte: {material.fontePreco}
                    </div>
                )}
            </div>
        </div>
    );
}
