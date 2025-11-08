// Materiais API Service

const API_BASE_URL = 'http://localhost:5000/api';

export interface Material {
    id: string;
    tenantId: string;
    codigo: string;
    nome: string;
    descricao?: string;
    categoria: MaterialCategoria;
    unidade: string;
    especificacoes: MaterialEspecificacoes;
    precoUnitario: number;
    moeda: string;
    dataReferencia: string;
    regiao?: string;
    fontePreco?: string;
    fornecedores: Fornecedor[];
    alternativasEquivalentes: string[];
    pegadaCO2?: number;
    reciclavel: boolean;
    certificacoesAmbientais?: string;
    disponibilidade: DisponibilidadeMaterial;
    prazoEntregaDias: number;
    ativo: boolean;
    criadoEm: string;
    atualizadoEm: string;
}

export interface MaterialEspecificacoes {
    resistencia?: string;
    dimensoes?: string;
    marca?: string;
    modelo?: string;
    cor?: string;
    acabamento?: string;
    normaTecnica?: string;
    outrasEspecificacoes?: Record<string, string>;
}

export interface Fornecedor {
    nome: string;
    cnpj?: string;
    contato?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    precoNegociado?: number;
    prazoEntregaDias: number;
    condicoesPagamento?: string;
    avaliacaoQualidade?: number;
}

export type MaterialCategoria =
    | 'Estrutura'
    | 'Alvenaria'
    | 'Revestimento'
    | 'Instalacoes'
    | 'Acabamento'
    | 'Impermeabilizacao'
    | 'Esquadrias'
    | 'Metais'
    | 'Loucas'
    | 'Diversos';

export type DisponibilidadeMaterial =
    | 'Imediata'
    | 'SobEncomenda'
    | 'LongaEspera'
    | 'Descontinuado';

export interface CreateMaterialDto {
    codigo: string;
    nome: string;
    descricao?: string;
    categoria: MaterialCategoria;
    unidade: string;
    especificacoes?: MaterialEspecificacoes;
    precoUnitario: number;
    moeda?: string;
    dataReferencia?: string;
    regiao?: string;
    fontePreco?: string;
    fornecedores?: Fornecedor[];
    alternativasEquivalentes?: string[];
    pegadaCO2?: number;
    reciclavel: boolean;
    certificacoesAmbientais?: string;
    disponibilidade: DisponibilidadeMaterial;
    prazoEntregaDias: number;
}

export interface MaterialComparacao {
    id: string;
    codigo: string;
    nome: string;
    precoUnitario: number;
    unidade: string;
    prazoEntregaDias: number;
    disponibilidade: DisponibilidadeMaterial;
    pegadaCO2?: number;
    reciclavel: boolean;
    fornecedores: number;
    especificacoes: MaterialEspecificacoes;
}

export interface ComparacaoMateriais {
    materiais: MaterialComparacao[];
    analise: {
        maisBarato: MaterialComparacao;
        maisRapido: MaterialComparacao;
        maisSustentavel: MaterialComparacao;
    };
}class MateriaisService {
    private async getAuthToken(): Promise<string> {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error('Token de autenticação não encontrado');
        return token;
    }

    async buscarTodos(
        categoria?: MaterialCategoria,
        busca?: string,
        apenasAtivos: boolean = true
    ): Promise<Material[]> {
        const token = await this.getAuthToken();

        const params = new URLSearchParams();
        if (categoria) params.append('categoria', categoria);
        if (busca) params.append('busca', busca);
        params.append('apenasAtivos', apenasAtivos.toString());

        const response = await fetch(`${API_BASE_URL}/materiais?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar materiais: ${response.statusText}`);
        }

        return response.json();
    }

    async buscarPorId(id: string): Promise<Material> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar material: ${response.statusText}`);
        }

        return response.json();
    }

    async buscarPorCodigo(codigo: string): Promise<Material> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/codigo/${codigo}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar material: ${response.statusText}`);
        }

        return response.json();
    }

    async obterCategorias(): Promise<Array<{ valor: string; nome: string }>> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/categorias`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
        }

        return response.json();
    }

    async criar(dto: CreateMaterialDto): Promise<Material> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Erro ao criar material: ${response.statusText}`);
        }

        return response.json();
    }

    async atualizar(id: string, dto: Partial<CreateMaterialDto>): Promise<Material> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Erro ao atualizar material: ${response.statusText}`);
        }

        return response.json();
    }

    async deletar(id: string, permanente: boolean = false): Promise<void> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/${id}?permanente=${permanente}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao deletar material: ${response.statusText}`);
        }
    }

    async buscarAlternativas(id: string): Promise<Material[]> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/${id}/alternativas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar alternativas: ${response.statusText}`);
        }

        return response.json();
    }

    async comparar(materiaisIds: string[]): Promise<ComparacaoMateriais> {
        const token = await this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/materiais/comparar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(materiaisIds)
        });

        if (!response.ok) {
            throw new Error(`Erro ao comparar materiais: ${response.statusText}`);
        }

        return response.json();
    }
}

export const materiaisService = new MateriaisService();
