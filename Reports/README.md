# ?? Sistema de Relatórios Automáticos - Shancrys

Sistema automatizado para geração e envio de relatórios HTML quando módulos são finalizados, seguindo os padrões corporativos ÁvilaOps.

---

## ?? Objetivo

Notificar automaticamente a equipe executiva (Nicolas Ávila) sempre que um módulo for finalizado, incluindo:
- ? Métricas de desenvolvimento (arquivos, linhas, commits)
- ? Features implementadas
- ? Desafios enfrentados
- ? Próximos passos
- ? Stack tecnológico utilizado

---

## ??? Arquitetura

```
Shancrys/
??? shancrys_report.py          # Script principal de geração de relatórios
??? .env.reports                # Configurações SMTP e projeto (NÃO commitar!)
??? Reports/                    # Relatórios HTML gerados
?   ??? module_*_TIMESTAMP.html
??? .github/workflows/
    ??? module-report.yml       # Automação GitHub Actions
```

---

## ?? Configuração

### 1. Variáveis de Ambiente

O arquivo `.env.reports` já está configurado com:

```env
# SMTP Porkbun
AVILA_SMTP_SERVER=smtp.porkbun.com
AVILA_SMTP_PORT=587
AVILA_SMTP_USERNAME=dev@avila.inc
AVILA_SMTP_PASSWORD=********
AVILA_EMAIL_FROM=dev@avila.inc

# Destinatários
SHANCRYS_REPORT_TO=nicolas@avila.inc
SHANCRYS_REPORT_CC=

# Configurações
SHANCRYS_AUTO_EMAIL=true
SHANCRYS_ATTACH_HTML=true
SHANCRYS_DEV_MODE=false
```

### 2. GitHub Secrets

Configure os seguintes secrets no repositório GitHub:

```
Settings ? Secrets and variables ? Actions ? New repository secret
```

**Secrets necessários:**
- `AVILA_SMTP_SERVER` = `smtp.porkbun.com`
- `AVILA_SMTP_PORT` = `587`
- `AVILA_SMTP_USERNAME` = `dev@avila.inc`
- `AVILA_SMTP_PASSWORD` = `7Aciqgr7@3278579`
- `AVILA_EMAIL_FROM` = `dev@avila.inc`
- `SHANCRYS_REPORT_TO` = `nicolas@avila.inc`
- `SHANCRYS_REPORT_CC` = *(opcional)*

---

## ?? Uso

### Modo 1: Linha de Comando (Local)

```bash
# Relatório completo
python shancrys_report.py \
  --module "Frontend/Viewer3D" \
  --status completed \
  --description "Implementado visualizador 3D com Three.js e web-ifc" \
  --features "Carregamento de IFC" "Seleção de elementos" "Timeline 4D" \
  --challenges "Performance com modelos grandes" \
  --next-steps "Otimizar LOD" "Adicionar cache"

# Dry-run (não envia email)
python shancrys_report.py \
  --module "API/Auth" \
  --status completed \
  --dry-run

# Abrir no navegador
python shancrys_report.py \
  --module "Mobile/Sync" \
  --status in-progress \
  --open
```

### Modo 2: GitHub Actions (Manual)

1. Vá em **Actions** ? **Send Module Completion Report**
2. Clique em **Run workflow**
3. Preencha os campos:
   - **module**: `Frontend/Viewer3D`
   - **status**: `completed`
   - **description**: Descrição do trabalho
   - **features**: `Feature 1, Feature 2, Feature 3`
   - **challenges**: `Desafio 1, Desafio 2`
   - **next_steps**: `Próximo passo 1, Próximo passo 2`
4. Clique em **Run workflow**

### Modo 3: Automático (Push)

O workflow detecta automaticamente mudanças em:
- `services/**` ? Módulo: Services/API
- `frontend/**` ? Módulo: Frontend
- `mobile/**` ? Módulo: Mobile
- `engine/**` ? Módulo: Engine
- `devtools/**` ? Módulo: DevTools
- `infra/**` ? Módulo: Infrastructure

Quando você fizer push para `main`, um relatório é gerado e enviado automaticamente.

---

## ?? Estrutura do Relatório HTML

### Header
- Gradient azul/roxo corporativo
- Nome do módulo em destaque
- Status badge colorido
- Metadata (data, organização, branch)

### Seções
1. **?? Métricas do Módulo**
   - Cards com: arquivos modificados, linhas +/-, commits
   
2. **?? Stack Tecnológico**
   - Badges coloridos com tecnologias utilizadas

3. **?? Descrição**
   - Texto livre sobre o trabalho realizado

4. **? Features Implementadas**
   - Lista de funcionalidades entregues

5. **?? Desafios Enfrentados**
   - Problemas encontrados e soluções

6. **?? Próximos Passos**
   - Ações pendentes e roadmap

### Footer
- Nome do projeto
- Link para repositório
- Timestamp de geração

---

## ?? Cores e Branding

- **Primary**: `#233b8a` (Azul Ávila)
- **Accent**: `#5a2f90` (Roxo)
- **Success**: `#10b981` (Verde)
- **Warning**: `#f59e0b` (Amarelo)
- **Danger**: `#ef4444` (Vermelho)

---

## ?? Email

### Formato
- **Assunto**: `[Shancrys] ?? Módulo Finalizado: {nome_modulo}`
- **De**: `dev@avila.inc`
- **Para**: `nicolas@avila.inc`
- **Anexo**: Arquivo HTML completo

### Conteúdo
- Versão HTML (rica, estilizada)
- Versão texto plano (fallback)
- Anexo HTML (opcional, configurável)

---

## ?? Verificação de Logs

### GitHub Actions

Após executar o workflow:

1. Vá em **Actions** ? Último workflow executado
2. Clique na execução
3. Expanda os logs:
   - `?? Checkout repository`
   - `?? Setup Python`
   - `?? Install dependencies`
   - `?? Create .env.reports`
   - `?? Generate report`
   - `?? Upload report artifact`
   - `?? Check logs for errors`

### Verificar Erros

No último step **Check logs for errors**, procure por:
- ? `Report generated successfully`
- ? `No errors detected`
- ? `No report file found` ? Erro na geração
- ? `Errors detected in workflow` ? Problema no pipeline

### Download do Relatório

Se o workflow rodou com sucesso:
1. Vá em **Actions** ? Execução específica
2. Role até **Artifacts**
3. Download: `module-report-{run_number}.zip`
4. Extraia e abra o HTML

---

## ?? Teste Local

```bash
# 1. Instalar dependências
pip install python-dotenv

# 2. Verificar configuração
cat .env.reports

# 3. Teste dry-run
python shancrys_report.py \
  --module "Test/Module" \
  --status completed \
  --description "Teste do sistema de relatórios" \
  --features "Geração de HTML" "Envio de email" \
  --dry-run \
  --open

# 4. Verificar relatório gerado
ls -lh Reports/

# 5. Abrir no navegador
# Windows: start Reports/module_*.html
# Linux/Mac: open Reports/module_*.html
```

---

## ?? Troubleshooting

### Email não enviado

**Verificar:**
1. ? `.env.reports` existe e tem credenciais corretas
2. ? `SHANCRYS_AUTO_EMAIL=true`
3. ? `SHANCRYS_DEV_MODE=false`
4. ? `AVILA_SMTP_PASSWORD` está preenchida
5. ? Firewall não bloqueia porta 587

**Logs esperados:**
```
?? Enviando email...
? Email enviado para: nicolas@avila.inc
```

### Relatório não gerado

**Verificar:**
1. ? Python 3.8+ instalado
2. ? `python-dotenv` instalado
3. ? Permissões de escrita em `Reports/`
4. ? Git disponível (para métricas)

### GitHub Actions falha

**Verificar:**
1. ? Todos os secrets configurados
2. ? Workflow file válido (YAML syntax)
3. ? `shancrys_report.py` commitado
4. ? Logs no step "Check logs for errors"

---

## ?? Exemplos de Uso

### Exemplo 1: Frontend Viewer 3D Finalizado

```bash
python shancrys_report.py \
  --module "Frontend/Viewer3D" \
  --status completed \
  --description "Implementado visualizador 3D completo com suporte a IFC, seleção de elementos, medições e timeline 4D" \
  --features \
    "Carregamento de arquivos IFC via web-ifc" \
    "Renderização 3D com Three.js" \
    "Seleção múltipla de elementos" \
    "Medições (distância, área, volume)" \
    "Timeline 4D com estados visuais" \
    "Cache de modelos" \
  --challenges \
    "Performance com modelos >100MB" \
    "Memory leaks no parser IFC" \
  --next-steps \
    "Implementar LOD simplificado" \
    "Adicionar Workers para parsing" \
    "Otimizar renderização com frustum culling"
```

### Exemplo 2: API Auth Módulo

```bash
python shancrys_report.py \
  --module "Services/API/Auth" \
  --status completed \
  --description "Sistema de autenticação JWT multi-tenant implementado" \
  --features \
    "Login com email/senha" \
    "JWT token generation" \
    "Refresh token" \
    "Multi-tenant isolation" \
    "Password hashing com BCrypt" \
  --challenges \
    "Configuração de CORS" \
  --next-steps \
    "Adicionar OAuth2" \
    "Implementar 2FA"
```

### Exemplo 3: Infraestrutura Azure

```bash
python shancrys_report.py \
  --module "Infrastructure/Azure" \
  --status completed \
  --description "Infraestrutura completa provisionada no Azure com Bicep" \
  --features \
    "Container Apps para API" \
    "Static Web Apps para Frontend" \
    "Cosmos DB (MongoDB API)" \
    "Storage Blobs" \
    "Application Insights" \
  --next-steps \
    "Configurar CDN" \
    "Adicionar Redis Cache"
```

---

## ?? Segurança

### Credenciais
- ? **NUNCA** commitar `.env.reports` com credenciais reais
- ? Usar `.gitignore` para excluir arquivos sensíveis
- ? GitHub Secrets para CI/CD
- ? Variáveis de ambiente em produção

### .gitignore

Certifique-se de que `.gitignore` contém:

```gitignore
# Environment files
.env
.env.*
!.env.example
.env.reports

# Reports (opcional - pode querer versionar)
Reports/*.html
```

---

## ?? Métricas Coletadas

### Automáticas (via Git)
- Commits nos últimos 7 dias
- Linhas adicionadas/removidas (diff HEAD~10..HEAD)
- Arquivos modificados

### Manuais (via argumentos)
- Features implementadas
- Desafios enfrentados
- Próximos passos
- Descrição do trabalho

### Detectadas (via caminho)
- Stack tecnológico baseado no módulo:
  - **Frontend**: React, TypeScript, Vite, Three.js
  - **API**: .NET 8, MongoDB, C#, JWT
  - **Mobile**: React Native, Expo, TypeScript
  - **Engine**: C++20, CMake, IFC Parser
  - **Infra**: Azure Bicep, Container Apps, IaC

---

## ?? Personalização

### Layout HTML

Edite o método `generate_html()` em `shancrys_report.py` para customizar:
- Cores
- Seções
- Métricas exibidas
- Estilos CSS

### Email

Customize em `.env.reports`:
- `SHANCRYS_REPORT_SUBJECT_PREFIX` - Prefixo do assunto
- `SHANCRYS_REPORT_TO` - Destinatário principal
- `SHANCRYS_REPORT_CC` - CC (separado por vírgula)

---

## ?? Workflow Completo

### 1. Desenvolvimento Local
```bash
# Trabalhar no módulo
git checkout -b feature/viewer-3d
# ... desenvolver ...
git add .
git commit -m "feat: implement 3D viewer"
git push origin feature/viewer-3d
```

### 2. Finalização do Módulo
```bash
# Gerar relatório local
python shancrys_report.py \
  --module "Frontend/Viewer3D" \
  --status completed \
  --description "..." \
  --features "..." \
  --dry-run \
  --open

# Revisar relatório HTML
# Ajustar se necessário
```

### 3. Envio Oficial
```bash
# Enviar relatório por email
python shancrys_report.py \
  --module "Frontend/Viewer3D" \
  --status completed \
  --description "..." \
  --features "..."

# OU via GitHub Actions (após merge)
# ? Push para main
# ? Workflow detecta mudanças
# ? Gera e envia relatório automaticamente
```

### 4. Verificação
- ? Checar email em `nicolas@avila.inc`
- ? Verificar GitHub Actions logs
- ? Download artifact se necessário
- ? Arquivar relatório em `Reports/`

---

## ?? Frequência Recomendada

- **Sprint/Feature completa**: Relatório completo
- **Push para main**: Relatório automático (status: in-progress)
- **Milestones**: Relatório consolidado com múltiplos módulos
- **Releases**: Relatório especial de versão

---

## ?? Status Disponíveis

| Status | Cor | Uso |
|--------|-----|-----|
| `completed` | ?? Verde | Módulo 100% finalizado |
| `in-progress` | ?? Amarelo | Desenvolvimento ativo |
| `review` | ?? Azul | Aguardando code review |
| `blocked` | ?? Vermelho | Bloqueado por dependência |

---

## ?? Boas Práticas

### Features
? Seja específico: "Carregamento de IFC via web-ifc"
? Genérico: "Melhorias no frontend"

### Descrição
? Explique o valor: "Implementado cache que reduz tempo de carregamento em 70%"
? Apenas técnica: "Adicionado cache"

### Challenges
? Inclua solução: "Performance com modelos grandes ? Implementado LOD"
? Apenas problema: "Performance ruim"

### Next Steps
? Acionável: "Adicionar testes unitários para AuthService"
? Vago: "Melhorar qualidade"

---

## ?? Integração com CI/CD

### Trigger Automático

O workflow `module-report.yml` roda automaticamente em:
- **Push para main** em pastas: `services/`, `frontend/`, `mobile/`, `engine/`, `devtools/`, `infra/`
- **Workflow manual** via GitHub UI

### Artifacts

Relatórios são salvos como artifacts por **90 dias**:
- Nome: `module-report-{run_number}`
- Localização: Actions ? Workflow ? Artifacts

---

## ?? Suporte

**Problemas com:**
- **SMTP**: Verificar credenciais em `.env.reports`
- **GitHub Actions**: Checar secrets e logs
- **Geração HTML**: Verificar dependências Python
- **Métricas Git**: Verificar repositório Git válido

**Contato**: nicolas@avila.inc

---

## ?? Atualizações

### v1.0.0 - 2025-01-13
- ? Sistema inicial implementado
- ? GitHub Actions configurado
- ? Template HTML corporativo
- ? Análise automática de métricas
- ? Envio SMTP via Porkbun

---

**Shancrys Platform 4D BIM** | **ÁvilaOps** | **Padrão Corporativo Ávila**
