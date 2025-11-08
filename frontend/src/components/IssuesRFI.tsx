import { useState, useCallback } from 'react';
import {
    MessageSquare,
    Plus,
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Calendar,
    Paperclip,
    Send,
    X,
    Eye
} from 'lucide-react';

export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    author: string;
    assignee?: string;
    createdAt: Date;
    updatedAt: Date;
    elementId?: number;
    position?: [number, number, number];
    attachments?: string[];
    comments: IssueComment[];
    tags?: string[];
}

export interface IssueComment {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    attachments?: string[];
}

interface IssuesRFIProps {
    issues: Issue[];
    onCreateIssue?: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
    onUpdateIssue?: (id: string, updates: Partial<Issue>) => void;
    onDeleteIssue?: (id: string) => void;
    onAddComment?: (issueId: string, comment: Omit<IssueComment, 'id' | 'createdAt'>) => void;
    onElementSelect?: (elementId: number) => void;
    className?: string;
}

export function IssuesRFI({
    issues,
    onCreateIssue,
    onUpdateIssue,
    onDeleteIssue,
    onAddComment,
    onElementSelect,
    className = ''
}: IssuesRFIProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
    const [selectedPriority, setSelectedPriority] = useState<IssuePriority | 'all'>('all');
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newIssueData, setNewIssueData] = useState({
        title: '',
        description: '',
        priority: 'medium' as IssuePriority,
        assignee: ''
    });
    const [newComment, setNewComment] = useState('');

    // Filter issues
    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
        const matchesPriority = selectedPriority === 'all' || issue.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const handleCreateIssue = useCallback(() => {
        if (!newIssueData.title.trim() || !newIssueData.description.trim()) {
            return;
        }

        onCreateIssue?.({
            title: newIssueData.title,
            description: newIssueData.description,
            status: 'open',
            priority: newIssueData.priority,
            author: 'Current User', // Should come from auth context
            assignee: newIssueData.assignee || undefined
        });

        setNewIssueData({
            title: '',
            description: '',
            priority: 'medium',
            assignee: ''
        });
        setShowCreateForm(false);
    }, [newIssueData, onCreateIssue]);

    const handleAddComment = useCallback(() => {
        if (!selectedIssue || !newComment.trim()) return;

        onAddComment?.(selectedIssue.id, {
            author: 'Current User', // Should come from auth context
            content: newComment
        });

        setNewComment('');
    }, [selectedIssue, newComment, onAddComment]);

    const handleStatusChange = useCallback((issueId: string, status: IssueStatus) => {
        onUpdateIssue?.(issueId, { status });
    }, [onUpdateIssue]);

    const getStatusIcon = (status: IssueStatus) => {
        switch (status) {
            case 'open':
                return <AlertCircle className="w-4 h-4 text-blue-600" />;
            case 'in-progress':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'resolved':
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'closed':
                return <CheckCircle2 className="w-4 h-4 text-gray-600" />;
        }
    };

    const getPriorityColor = (priority: IssuePriority) => {
        switch (priority) {
            case 'low':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'medium':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'high':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'critical':
                return 'bg-red-100 text-red-700 border-red-300';
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Issues & RFI</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {issues.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Nova Issue"
                    >
                        <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        {isExpanded ? (
                            <X className="w-4 h-4 text-gray-600" />
                        ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="p-3 border-b bg-gray-50">
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Título da Issue"
                            value={newIssueData.title}
                            onChange={(e) => setNewIssueData({ ...newIssueData, title: e.target.value })}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <textarea
                            placeholder="Descrição detalhada"
                            value={newIssueData.description}
                            onChange={(e) => setNewIssueData({ ...newIssueData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                        <div className="flex gap-2">
                            <select
                                value={newIssueData.priority}
                                onChange={(e) => setNewIssueData({ ...newIssueData, priority: e.target.value as IssuePriority })}
                                className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                                <option value="critical">Crítica</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Atribuir a"
                                value={newIssueData.assignee}
                                onChange={(e) => setNewIssueData({ ...newIssueData, assignee: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateIssue}
                                className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Criar Issue
                            </button>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isExpanded && (
                <>
                    {/* Filters */}
                    <div className="p-3 border-b space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar issues..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as IssueStatus | 'all')}
                                className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">Todos Status</option>
                                <option value="open">Aberto</option>
                                <option value="in-progress">Em Progresso</option>
                                <option value="resolved">Resolvido</option>
                                <option value="closed">Fechado</option>
                            </select>
                            <select
                                value={selectedPriority}
                                onChange={(e) => setSelectedPriority(e.target.value as IssuePriority | 'all')}
                                className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">Todas Prioridades</option>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                                <option value="critical">Crítica</option>
                            </select>
                        </div>
                    </div>

                    {/* Issues List */}
                    <div className="max-h-96 overflow-y-auto">
                        {selectedIssue ? (
                            /* Issue Detail View */
                            <div className="p-3">
                                <button
                                    onClick={() => setSelectedIssue(null)}
                                    className="mb-3 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    ← Voltar
                                </button>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{selectedIssue.title}</h4>
                                            <button
                                                onClick={() => onDeleteIssue?.(selectedIssue.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600">{selectedIssue.description}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className={`px-2 py-1 rounded border ${getPriorityColor(selectedIssue.priority)}`}>
                                            {selectedIssue.priority}
                                        </span>
                                        <select
                                            value={selectedIssue.status}
                                            onChange={(e) => handleStatusChange(selectedIssue.id, e.target.value as IssueStatus)}
                                            className="px-2 py-1 border rounded text-xs"
                                        >
                                            <option value="open">Aberto</option>
                                            <option value="in-progress">Em Progresso</option>
                                            <option value="resolved">Resolvido</option>
                                            <option value="closed">Fechado</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {selectedIssue.author}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {selectedIssue.createdAt.toLocaleDateString()}
                                        </div>
                                    </div>

                                    {selectedIssue.elementId && (
                                        <button
                                            onClick={() => onElementSelect?.(selectedIssue.elementId!)}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Ver elemento vinculado
                                        </button>
                                    )}

                                    {/* Comments */}
                                    <div className="border-t pt-3">
                                        <h5 className="font-medium text-sm mb-2">Comentários ({selectedIssue.comments.length})</h5>
                                        <div className="space-y-2 mb-3">
                                            {selectedIssue.comments.map(comment => (
                                                <div key={comment.id} className="bg-gray-50 rounded p-2">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                        <User className="w-3 h-3" />
                                                        <span className="font-medium">{comment.author}</span>
                                                        <span>•</span>
                                                        <span>{comment.createdAt.toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Comment */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Adicionar comentário..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                                className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Issues List View */
                            <div className="p-3 space-y-2">
                                {filteredIssues.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Nenhuma issue encontrada</p>
                                    </div>
                                ) : (
                                    filteredIssues.map(issue => (
                                        <button
                                            key={issue.id}
                                            onClick={() => setSelectedIssue(issue)}
                                            className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(issue.status)}
                                                    <span className="font-medium text-sm">{issue.title}</span>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(issue.priority)}`}>
                                                    {issue.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2">{issue.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {issue.author}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {issue.comments.length}
                                                </div>
                                                {issue.attachments && issue.attachments.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Paperclip className="w-3 h-3" />
                                                        {issue.attachments.length}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
