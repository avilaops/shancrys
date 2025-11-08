/**
 * Project Detail page with versioning, comparison, sharing and permissions
 */

import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    Download,
    Share2,
    Users,
    Clock,
    FileText,
    Eye,
    GitBranch,
    AlertCircle,
    X,
    Settings,
    Trash2,
} from 'lucide-react';

interface ProjectVersion {
    id: string;
    version: string;
    date: string;
    author: string;
    description: string;
    fileSize: string;
    changes: number;
    status: 'current' | 'previous' | 'draft';
}

interface ProjectMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    avatar?: string;
    lastActive: string;
}

export default function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Mock data - replace with real API data
    const [project] = useState({
        id: projectId || '1',
        name: 'Edifício Alpha',
        description: 'Projeto de construção de edifício comercial de 15 andares',
        createdAt: '2025-01-15',
        updatedAt: '2025-11-05',
        status: 'active',
        owner: 'João Silva',
    });

    const [versions, setVersions] = useState<ProjectVersion[]>([
        {
            id: 'v1',
            version: '1.3.0',
            date: '2025-11-05',
            author: 'João Silva',
            description: 'Atualização dos pilares do 3º ao 7º andar',
            fileSize: '125 MB',
            changes: 47,
            status: 'current',
        },
        {
            id: 'v2',
            version: '1.2.0',
            date: '2025-10-28',
            author: 'Maria Santos',
            description: 'Revisão das lajes e vigas',
            fileSize: '118 MB',
            changes: 32,
            status: 'previous',
        },
        {
            id: 'v3',
            version: '1.1.0',
            date: '2025-10-15',
            author: 'Pedro Costa',
            description: 'Ajustes nas fundações',
            fileSize: '115 MB',
            changes: 18,
            status: 'previous',
        },
    ]);

    const [members, setMembers] = useState<ProjectMember[]>([
        {
            id: '1',
            name: 'João Silva',
            email: 'joao@example.com',
            role: 'owner',
            lastActive: '2025-11-06',
        },
        {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@example.com',
            role: 'admin',
            lastActive: '2025-11-05',
        },
        {
            id: '3',
            name: 'Pedro Costa',
            email: 'pedro@example.com',
            role: 'editor',
            lastActive: '2025-11-04',
        },
        {
            id: '4',
            name: 'Ana Oliveira',
            email: 'ana@example.com',
            role: 'viewer',
            lastActive: '2025-11-03',
        },
    ]);

    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleVersionSelect = useCallback((versionId: string) => {
        setSelectedVersions(prev => {
            if (prev.includes(versionId)) {
                return prev.filter(id => id !== versionId);
            }
            if (prev.length >= 2) {
                return [prev[1], versionId];
            }
            return [...prev, versionId];
        });
    }, []);

    const handleCompareVersions = useCallback(() => {
        if (selectedVersions.length === 2) {
            navigate(`/viewer?compare=${selectedVersions[0]},${selectedVersions[1]}`);
        }
    }, [selectedVersions, navigate]);

    const handleViewVersion = useCallback((versionId: string) => {
        navigate(`/viewer?version=${versionId}`);
    }, [navigate]);

    const handleDownloadVersion = useCallback((versionId: string) => {
        console.log('Downloading version:', versionId);
        // Implement download logic
    }, []);

    const handleDeleteVersion = useCallback((versionId: string) => {
        if (confirm('Tem certeza que deseja excluir esta versão?')) {
            setVersions(prev => prev.filter(v => v.id !== versionId));
        }
    }, []);

    const handleChangeMemberRole = useCallback((memberId: string, newRole: ProjectMember['role']) => {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    }, []);

    const handleRemoveMember = useCallback((memberId: string) => {
        if (confirm('Tem certeza que deseja remover este membro?')) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
        }
    }, []);

    const getRoleBadge = (role: ProjectMember['role']) => {
        const roleColors = {
            owner: 'bg-purple-100 text-purple-700',
            admin: 'bg-blue-100 text-blue-700',
            editor: 'bg-green-100 text-green-700',
            viewer: 'bg-gray-100 text-gray-700',
        };
        const roleLabels = {
            owner: 'Proprietário',
            admin: 'Administrador',
            editor: 'Editor',
            viewer: 'Visualizador',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role]}`}>
                {roleLabels[role]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                                <p className="text-sm text-gray-600">{project.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => console.log('Upload new version')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                Nova Versão
                            </button>
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => navigate(`/viewer?project=${project.id}`)}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                    >
                        <Eye className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Visualizar 3D</p>
                            <p className="text-xs text-gray-600">Abrir no viewer</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                        <FileText className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Quantificação</p>
                            <p className="text-xs text-gray-600">Ver quantidades</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                        <Clock className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Timeline 4D</p>
                            <p className="text-xs text-gray-600">Ver cronograma</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                        <Download className="w-6 h-6 text-orange-600" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Exportar</p>
                            <p className="text-xs text-gray-600">Baixar arquivos</p>
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Versions Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow border">
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="w-5 h-5 text-gray-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Versões do Modelo</h2>
                                    </div>
                                    {selectedVersions.length === 2 && (
                                        <button
                                            onClick={handleCompareVersions}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                            Comparar Selecionadas
                                        </button>
                                    )}
                                </div>
                                {selectedVersions.length > 0 && selectedVersions.length < 2 && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selecione mais uma versão para comparar
                                    </p>
                                )}
                            </div>

                            <div className="divide-y">
                                {versions.map((version) => (
                                    <div
                                        key={version.id}
                                        className={`p-6 hover:bg-gray-50 transition-colors ${selectedVersions.includes(version.id) ? 'bg-purple-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedVersions.includes(version.id)}
                                                onChange={() => handleVersionSelect(version.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        Versão {version.version}
                                                    </h3>
                                                    {version.status === 'current' && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            Atual
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {version.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {version.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        {version.fileSize}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {version.changes} alterações
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewVersion(version.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Visualizar"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadVersion(version.id)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Baixar"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {version.status !== 'current' && (
                                                    <button
                                                        onClick={() => handleDeleteVersion(version.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Team Panel */}
                    <div>
                        <div className="bg-white rounded-lg shadow border">
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gray-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Equipe</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y">
                                {members.map((member) => (
                                    <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.name}</p>
                                                    <p className="text-xs text-gray-600">{member.email}</p>
                                                </div>
                                            </div>
                                            {member.role !== 'owner' && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {member.role === 'owner' ? (
                                                getRoleBadge(member.role)
                                            ) : (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleChangeMemberRole(member.id, e.target.value as ProjectMember['role'])}
                                                    className="px-2 py-1 text-xs border rounded"
                                                >
                                                    <option value="admin">Administrador</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="viewer">Visualizador</option>
                                                </select>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                Ativo em {member.lastActive}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project Info */}
                        <div className="bg-white rounded-lg shadow border mt-6 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Informações do Projeto</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="font-medium text-green-600">Ativo</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Criado em:</span>
                                    <span className="font-medium text-gray-900">{project.createdAt}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Última atualização:</span>
                                    <span className="font-medium text-gray-900">{project.updatedAt}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Versões:</span>
                                    <span className="font-medium text-gray-900">{versions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Membros:</span>
                                    <span className="font-medium text-gray-900">{members.length}</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                <Settings className="w-4 h-4 inline mr-2" />
                                Configurações do Projeto
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compartilhar Projeto</h3>
                        <input
                            type="email"
                            placeholder="Digite o email do usuário"
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                        />
                        <select className="w-full px-4 py-2 border rounded-lg mb-4">
                            <option value="viewer">Visualizador</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
