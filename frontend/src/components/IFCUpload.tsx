import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { parseIFCFile, type IFCProject } from '../services/ifcParser';

interface IFCUploadProps {
    onProjectLoaded: (project: IFCProject) => void;
    maxSizeMB?: number;
}

export function IFCUpload({ onProjectLoaded, maxSizeMB = 100 }: IFCUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const processFile = useCallback(async (file: File) => {
        // Inline validation to avoid dependency issues
        if (!file.name.toLowerCase().endsWith('.ifc')) {
            setError('Por favor, selecione um arquivo IFC válido (.ifc)');
            return;
        }

        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB (arquivo atual: ${sizeMB.toFixed(1)}MB)`);
            return;
        }

        setError(null);
        setSuccess(null);
        setIsProcessing(true);

        try {
            // Simulate progress (web-ifc doesn't provide progress callbacks)
            setProgress({ current: 0, total: 100 });

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (!prev) return { current: 30, total: 100 };
                    if (prev.current >= 90) return prev;
                    return { current: prev.current + 10, total: 100 };
                });
            }, 200);

            // Parse IFC file
            const project = await parseIFCFile(file);

            clearInterval(progressInterval);
            setProgress({ current: 100, total: 100 });

            setSuccess(`Arquivo carregado com sucesso! ${project.elements.length} elementos encontrados.`);

            // Call parent callback
            setTimeout(() => {
                onProjectLoaded(project);
                setProgress(null);
            }, 1000);

        } catch (err) {
            setError(`Erro ao processar arquivo IFC: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            setProgress(null);
        } finally {
            setIsProcessing(false);
        }
    }, [onProjectLoaded, maxSizeMB]); const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative border-2 border-dashed rounded-lg p-12
          transition-all duration-200 ease-in-out
          ${isDragging
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <input
                    type="file"
                    accept=".ifc"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="ifc-upload"
                />

                <div className="flex flex-col items-center justify-center text-center">
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                Processando arquivo IFC...
                            </p>
                            {progress && (
                                <div className="w-full max-w-xs mt-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {progress.current}%
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Upload className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                Arraste um arquivo IFC aqui
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                ou clique para selecionar
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FileText className="w-4 h-4" />
                                <span>Formatos aceitos: .ifc (máximo {maxSizeMB}MB)</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                    <button
                        onClick={clearMessages}
                        className="text-green-600 hover:text-green-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <button
                        onClick={clearMessages}
                        className="text-red-600 hover:text-red-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                    📋 Informações sobre arquivos IFC
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                    <li>• IFC (Industry Foundation Classes) é o formato padrão para modelos BIM</li>
                    <li>• O parser extrai geometria, propriedades e estrutura espacial</li>
                    <li>• Elementos suportados: Paredes, Lajes, Portas, Janelas, Vigas, Colunas, etc.</li>
                    <li>• Após o carregamento, você poderá visualizar o modelo em 3D/4D</li>
                </ul>
            </div>
        </div>
    );
}
