# Features de Engenharia Civil - Shancrys

## 🏗️ 1. Gestão de Materiais

### 1.1 Banco de Dados de Materiais

```typescript
interface Material {
  id: string;
  codigo: string; // Ex: SINAPI 88316, SICRO 72957
  nome: string;
  categoria: 'Estrutura' | 'Alvenaria' | 'Revestimento' | 'Instalações' | 'Acabamento';
  unidade: 'm³' | 'm²' | 'm' | 'un' | 'kg';
  
  // Especificações técnicas
  especificacoes: {
    resistencia?: string; // Ex: fck 25 MPa (concreto)
    dimensoes?: string; // Ex: 14x19x39cm (bloco)
    marca?: string;
    fornecedor?: string;
  };
  
  // Custos
  precoUnitario: number;
  dataReferencia: Date;
  regiao: string; // Ex: "SP-Capital", "RJ-Interior"
  
  // Alternativas
  alternativasEquivalentes: string[]; // IDs de materiais similares
  
  // Sustentabilidade
  pegadaCO2?: number; // kg CO2 por unidade
  reciclavel: boolean;
}
```

### 1.2 Composições de Custos

```typescript
interface ComposicaoCusto {
  id: string;
  codigo: string; // Ex: SINAPI 92707 (Alvenaria bloco cerâmico)
  descricao: string;
  unidade: string;
  
  // Insumos (materiais + mão de obra + equipamentos)
  insumos: Array<{
    tipo: 'Material' | 'MaoDeObra' | 'Equipamento';
    itemId: string; // Referência ao material/profissional/equipamento
    coeficiente: number; // Quantidade por unidade da composição
    custoUnitario: number;
    custoTotal: number;
  }>;
  
  custoTotalUnitario: number;
  bdi: number; // % de BDI aplicado
  custoComBDI: number;
  
  produtividade: {
    unidadeTempo: 'hora' | 'dia';
    quantidade: number; // Ex: 10 m²/dia
  };
}
```

### 1.3 Comparador de Cenários

```typescript
interface CenarioMaterial {
  id: string;
  nome: string; // Ex: "Alvenaria Bloco Cerâmico vs Concreto"
  
  opcoes: Array<{
    materialId: string;
    custoTotal: number;
    prazo: number; // dias
    impactoAmbiental: number; // pontuação
    disponibilidade: 'Imediata' | 'Sob Encomenda' | 'Longa Espera';
  }>;
  
  recomendacao: string; // ID da melhor opção baseado em critérios
  criterios: {
    pesoPreco: number;
    pesoPrazo: number;
    pesoSustentabilidade: number;
  };
}
```

## ⏱️ 2. Cronograma de Obra Realista

### 2.1 Atividades com Durações Baseadas em Produtividade

```typescript
interface AtividadeConstrucao extends Atividade {
  // Dados técnicos
  servicoId: string; // Referência à composição de custo
  quantitativo: {
    valor: number;
    unidade: string;
    fonte: 'IFC_Automatico' | 'Manual' | 'Medição';
  };
  
  // Produtividade
  produtividade: {
    equipeCfg: {
      oficial: number; // Quantidade de oficiais
      servente: number;
    };
    rendimento: number; // Unidades por dia (baseado na composição)
  };
  
  // Duração calculada
  duracaoCalculada: number; // dias = quantitativo / (rendimento * equipe)
  duracaoReal?: number; // dias realmente gastos
  
  // Recursos
  materiais: Array<{
    materialId: string;
    quantidadeNecessaria: number;
    dataEntregaPrevista: Date;
    status: 'Pendente' | 'Pedido' | 'Entregue';
  }>;
  
  equipamentos: Array<{
    tipo: string;
    quantidade: number;
    periodoUso: { inicio: Date; fim: Date };
  }>;
}
```

### 2.2 Fases de Obra Padrão

```typescript
const FASES_OBRA = {
  '1_Fundacoes': {
    nome: 'Fundações',
    atividades: [
      'Escavação',
      'Lastro de Concreto',
      'Armação de Sapatas',
      'Concretagem de Sapatas',
      'Impermeabilização',
      'Reaterro'
    ],
    duracaoMediaDias: 30,
    percentualOrcamento: 8
  },
  '2_Estrutura': {
    nome: 'Estrutura',
    atividades: [
      'Armação de Pilares',
      'Formas de Pilares',
      'Concretagem de Pilares',
      'Armação de Vigas',
      'Formas de Vigas',
      'Armação de Laje',
      'Formas de Laje',
      'Concretagem de Laje',
      'Cura do Concreto',
      'Desforma'
    ],
    duracaoMediaPorPavimento: 15,
    percentualOrcamento: 25
  },
  '3_Alvenaria': {
    nome: 'Alvenaria',
    atividades: [
      'Marcação de Alvenaria',
      'Elevação de Paredes',
      'Vergas e Contravergas',
      'Encunhamento'
    ],
    duracaoMediaPorPavimento: 10,
    percentualOrcamento: 10
  },
  '4_Instalacoes': {
    nome: 'Instalações',
    atividades: [
      'Instalações Hidráulicas',
      'Instalações Elétricas',
      'Instalações de Esgoto',
      'Instalações de Gás'
    ],
    duracaoMediaDias: 45,
    percentualOrcamento: 12
  },
  '5_Revestimentos': {
    nome: 'Revestimentos',
    atividades: [
      'Chapisco',
      'Emboço Interno',
      'Emboço Externo',
      'Reboco',
      'Contrapiso'
    ],
    duracaoMediaDias: 40,
    percentualOrcamento: 15
  },
  '6_Acabamentos': {
    nome: 'Acabamentos',
    atividades: [
      'Revestimento Cerâmico Piso',
      'Revestimento Cerâmico Parede',
      'Pintura Interna',
      'Pintura Externa',
      'Instalação de Louças',
      'Instalação de Metais',
      'Esquadrias',
      'Portas'
    ],
    duracaoMediaDias: 60,
    percentualOrcamento: 20
  },
  '7_Limpeza': {
    nome: 'Limpeza e Entrega',
    atividades: [
      'Limpeza Final',
      'Vistoria',
      'Correções Finais'
    ],
    duracaoMediaDias: 10,
    percentualOrcamento: 2
  }
};
```

### 2.3 Calculadora de Cronograma

```typescript
interface CalculadoraCronograma {
  calcularDuracaoObra(parametros: {
    areaTotal: number; // m²
    numeroPavimentos: number;
    padraoAcabamento: 'Economico' | 'Normal' | 'Alto';
    turnosTrabalho: 1 | 2 | 3;
    diasUteisSemana: 5 | 6;
  }): {
    duracaoTotalDias: number;
    duracaoTotalMeses: number;
    dataPrevisaoInicio: Date;
    dataPrevisaoTermino: Date;
    fases: Array<{
      fase: string;
      dataInicio: Date;
      dataFim: Date;
      duracaoDias: number;
    }>;
  };
}
```

## 💰 3. Orçamento Detalhado

### 3.1 Quantitativos Automáticos do IFC

```typescript
interface QuantitativoIFC {
  // Extrair automaticamente do modelo BIM
  calcularQuantitativos(elementosIFC: Element[]): {
    concreto: {
      volumeTotal: number; // m³
      porPavimento: Record<string, number>;
      porElemento: Record<string, number>; // pilares, vigas, lajes
    };
    
    formas: {
      areaTotal: number; // m²
      porElemento: Record<string, number>;
    };
    
    aco: {
      pesoTotal: number; // kg
      porDiametro: Record<string, number>;
      porPavimento: Record<string, number>;
    };
    
    alvenaria: {
      areaTotal: number; // m²
      porTipoBloco: Record<string, number>;
      porPavimento: Record<string, number>;
    };
    
    revestimentos: {
      pisos: number; // m²
      paredesInternas: number; // m²
      paredesExternas: number; // m²
      tetos: number; // m²
    };
    
    esquadrias: {
      janelas: { tipo: string; quantidade: number; area: number }[];
      portas: { tipo: string; quantidade: number; area: number }[];
    };
  };
}
```

### 3.2 Orçamento Paramétrico

```typescript
interface OrcamentoParametrico {
  id: string;
  projetoId: string;
  
  // Dados de entrada
  parametros: {
    areaTotal: number; // m²
    numeroPavimentos: number;
    padraoAcabamento: 'Economico' | 'Normal' | 'Alto' | 'Luxo';
    regiao: string;
  };
  
  // CUB (Custo Unitário Básico) de referência
  cub: {
    valor: number; // R$/m²
    estado: string;
    mes: string;
    tipo: string; // Ex: R8-N (Residencial, 8 pavimentos, Normal)
  };
  
  // Estimativa por fase
  custosPorFase: Array<{
    fase: string;
    percentual: number;
    custoEstimado: number;
    composicoes: Array<{
      item: string;
      quantidade: number;
      unidade: string;
      custoUnitario: number;
      custoTotal: number;
    }>;
  }>;
  
  // Totais
  custoTotal: number;
  custoTotalComBDI: number;
  bdi: number;
  
  // Ajustes
  margemContingencia: number; // % para imprevistos (5-10%)
  custoTotalFinal: number;
}
```

### 3.3 Comparativo Previsto vs Realizado

```typescript
interface ComparativoOrcamento {
  projetoId: string;
  dataReferencia: Date;
  
  analise: Array<{
    fase: string;
    orcamentoPrevisto: number;
    custoRealizado: number;
    variacao: number; // %
    variacao_valor: number; // R$
    status: 'Dentro' | 'Atencao' | 'Critico';
    
    detalhamento: Array<{
      item: string;
      previsto: number;
      realizado: number;
      variacao: number;
    }>;
  }>;
  
  totais: {
    orcamentoTotal: number;
    custoRealizadoAcumulado: number;
    saldoRestante: number;
    percentualExecutado: number;
    projecaoFinal: number; // Baseado na tendência atual
  };
  
  alertas: Array<{
    tipo: 'Sobrecusto' | 'MaterialIndisponivel' | 'ReajustePreco';
    severidade: 'Baixa' | 'Media' | 'Alta';
    descricao: string;
    acaoRecomendada: string;
  }>;
}
```

## 📊 4. Dashboards de Engenharia

### 4.1 Dashboard de Produtividade

```typescript
interface DashboardProdutividade {
  // Indicadores de produtividade por serviço
  servicos: Array<{
    nome: string;
    unidade: string;
    produtividadePlanejada: number;
    produtividadeReal: number;
    eficiencia: number; // % (real/planejado)
    
    historico: Array<{
      data: Date;
      quantidadeExecutada: number;
      horasHomem: number;
      produtividade: number;
    }>;
  }>;
  
  // Análise de equipes
  equipes: Array<{
    id: string;
    nome: string;
    oficiais: number;
    serventes: number;
    servicoAtual: string;
    eficienciaMedia: number;
  }>;
}
```

### 4.2 Dashboard de Suprimentos

```typescript
interface DashboardSuprimentos {
  // Materiais em estoque
  estoque: Array<{
    materialId: string;
    nome: string;
    quantidadeAtual: number;
    quantidadeMinima: number;
    quantidadeIdeal: number;
    status: 'OK' | 'Baixo' | 'Critico';
    dataUltimoPedido?: Date;
    fornecedor: string;
  }>;
  
  // Programação de entregas
  entregasProgramadas: Array<{
    data: Date;
    materiais: Array<{
      nome: string;
      quantidade: number;
      fornecedor: string;
    }>;
    atividadesVinculadas: string[];
  }>;
  
  // Alertas de suprimentos
  alertas: Array<{
    tipo: 'EstoqueBaixo' | 'AtrasoEntrega' | 'MaterialNaoConforme';
    descricao: string;
    impactoObra: 'Nenhum' | 'Pequeno' | 'Medio' | 'Alto';
  }>;
}
```

## 🎯 5. Funcionalidades Práticas

### 5.1 Gerador de Cronograma Automatizado

- Input: Arquivo IFC + Parâmetros da obra
- Output: Cronograma 4D completo com:
  - Atividades sequenciadas logicamente
  - Durações baseadas em produtividade real
  - Alocação de recursos (equipes, materiais, equipamentos)
  - Curva ABC de custos

### 5.2 Otimizador de Materiais

- Sugere substituições de materiais com base em:
  - Custo total
  - Disponibilidade regional
  - Prazo de entrega
  - Impacto ambiental
  - Equivalência técnica

### 5.3 Calculadora de Quantitativos Instantânea

- Seleciona elementos no modelo 3D
- Calcula automaticamente:
  - Volume de concreto
  - Área de formas
  - Peso de aço
  - Área de alvenaria
  - Área de revestimentos

### 5.4 Simulador de Cenários

- "E se...?"
  - Trocar material X por Y → Impacto no custo e prazo
  - Aumentar equipe → Redução de prazo
  - Trabalhar em 2 turnos → Análise de viabilidade
  - Atrasar fornecimento de material → Caminho crítico afetado

### 5.5 Relatórios Gerenciais

- **Relatório de Avanço Físico**: % executado por fase
- **Relatório de Medição**: Quantitativos executados vs planejados
- **Relatório de Custos**: Gastos acumulados por categoria
- **Relatório de Produtividade**: Rendimentos por serviço
- **Relatório de Desvios**: Análise de variações de custo e prazo

## 🔧 6. Integrações Necessárias

### 6.1 Bases de Dados de Referência

- SINAPI (Caixa Econômica Federal)
- SICRO (DNIT)
- Tabelas de preços regionais
- Índices de reajuste (INCC, IPCA)

### 6.2 Fornecedores e Distribuidoras

- Consulta de preços em tempo real
- Disponibilidade de estoque
- Prazos de entrega

### 6.3 ERP de Construção

- Exportação de dados para sistemas como:
  - Sienge
  - Construct
  - SAP Business One

## 📝 Próximos Passos de Implementação

### Sprint 1: Banco de Materiais (1 semana)

- [ ] Modelo de dados de Material
- [ ] CRUD de materiais
- [ ] Importação de base SINAPI (top 100 itens)
- [ ] Interface de busca e seleção

### Sprint 2: Composições e Quantitativos (2 semanas)

- [ ] Modelo de ComposicaoCusto
- [ ] Parser de quantitativos do IFC
- [ ] Cálculo automático de volumes e áreas
- [ ] Vinculação material → quantitativo

### Sprint 3: Cronograma Inteligente (2 semanas)

- [ ] Calculadora de durações por produtividade
- [ ] Gerador de atividades por fase
- [ ] Sequenciamento lógico automático
- [ ] Alocação de recursos

### Sprint 4: Orçamento Paramétrico (1 semana)

- [ ] Cálculo baseado em CUB
- [ ] Distribuição por fases
- [ ] Comparativo previsto vs realizado
- [ ] Relatório de variações

### Sprint 5: Dashboards (1 semana)

- [ ] Dashboard de produtividade
- [ ] Dashboard de suprimentos
- [ ] Dashboard financeiro
- [ ] Alertas automáticos
