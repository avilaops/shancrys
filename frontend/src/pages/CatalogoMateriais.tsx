import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, ShoppingCart, TrendingUp, Leaf, Clock, Package } from 'lucide-react';
import { materiaisService, type Material, type MaterialCategoria } from '../services/materiaisService';
import MaterialCard from '../components/MaterialCard';
import ComparadorModal from '../components/ComparadorModal';

export default function CatalogoMateriais() {
    const [materiais, setMateriais] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState<MaterialCategoria | ''>('');
    const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([]);
    const [mostrarComparador, setMostrarComparador] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const categorias: Array<{ valor: MaterialCategoria | ''; nome: string }> = [
        { valor: '', nome: 'Todas as Categorias' },
        { valor: 'Estrutura', nome: '🏗️ Estrutura' },
        { valor: 'Alvenaria', nome: '🧱 Alvenaria' },
        { valor: 'Revestimento', nome: '🎨 Revestimento' },
        { valor: 'Instalacoes', nome: '🔧 Instalações' },
        { valor: 'Acabamento', nome: '✨ Acabamento' },
        { valor: 'Impermeabilizacao', nome: '💧 Impermeabilização' },
        { valor: 'Esquadrias', nome: '🪟 Esquadrias' },
        { valor: 'Metais', nome: '🚰 Metais' },
        { valor: 'Loucas', nome: '🚽 Louças' },
        { valor: 'Diversos', nome: '📦 Diversos' }
    ];

    const carregarMateriais = useCallback(async () => {
        try {
            setLoading(true);
            setErro(null);
            const dados = await materiaisService.buscarTodos(
                categoriaFiltro || undefined,
                busca || undefined,
                true
            );
            setMateriais(dados);
        } catch (error) {
            console.error('Erro ao carregar materiais:', error);
            setErro('Erro ao carregar materiais. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    }, [categoriaFiltro, busca]);

    useEffect(() => {
        carregarMateriais();
    }, [carregarMateriais]);

    const toggleSelecao = (id: string) => {
        setMateriaisSelecionados(prev =>
            prev.includes(id)
                ? prev.filter(materialId => materialId !== id)
                : [...prev, id]
        );
    };

    const limparSelecao = () => {
        setMateriaisSelecionados([]);
    };

    const materiaisFiltrados = materiais;

    const estatisticas = {
        total: materiais.length,
        estrutura: materiais.filter(m => m.categoria === 'Estrutura').length,
        alvenaria: materiais.filter(m => m.categoria === 'Alvenaria').length,
        revestimento: materiais.filter(m => m.categoria === 'Revestimento').length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Materiais</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Baseado em SINAPI e SICRO - Preços atualizados mensalmente
                            </p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Material
                        </button>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Total de Materiais</p>
                                    <p className="text-2xl font-bold text-blue-900">{estatisticas.total}</p>
                                </div>
                                <Package className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Estrutura</p>
                                    <p className="text-2xl font-bold text-orange-900">{estatisticas.estrutura}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Sustentáveis</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {materiais.filter(m => m.reciclavel).length}
                                    </p>
                                </div>
                                <Leaf className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Disponíveis</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {materiais.filter(m => m.disponibilidade === 'Imediata').length}
                                    </p>
                                </div>
                                <Clock className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Busca */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, código ou descrição..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtro de Categoria */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={categoriaFiltro}
                                onChange={(e) => setCategoriaFiltro(e.target.value as MaterialCategoria | '')}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                            >
                                {categorias.map(cat => (
                                    <option key={cat.valor} value={cat.valor}>
                                        {cat.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botão Comparar */}
                        {materiaisSelecionados.length >= 2 && (
                            <button
                                onClick={() => setMostrarComparador(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Comparar ({materiaisSelecionados.length})
                            </button>
                        )}

                        {materiaisSelecionados.length > 0 && (
                            <button
                                onClick={limparSelecao}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de Materiais */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : erro ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800">{erro}</p>
                        <button
                            onClick={carregarMateriais}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                ) : materiaisFiltrados.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum material encontrado
                        </h3>
                        <p className="text-gray-500">
                            Tente ajustar os filtros ou buscar por outro termo.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materiaisFiltrados.map(material => (
                            <MaterialCard
                                key={material.id}
                                material={material}
                                selecionado={materiaisSelecionados.includes(material.id)}
                                onToggleSelecao={toggleSelecao}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Comparador */}
            {mostrarComparador && (
                <ComparadorModal
                    materiaisIds={materiaisSelecionados}
                    onFechar={() => setMostrarComparador(false)}
                />
            )}
        </div>
    );
}
