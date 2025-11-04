# 🚀 Shancrys - Guia de Deploy Azure

Este guia explica como fazer deploy completo do Shancrys no Azure usando GitHub Actions.

## 📋 Pré-requisitos

1. **Conta Azure** com subscription ativa
2. **Conta GitHub** com repositório Shancrys
3. **Azure CLI** instalado localmente
4. **Git** configurado

## 🔧 Setup Inicial

### 1. Login no Azure

```powershell
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2. Criar Resource Group

```powershell
az group create --name shancrys-rg --location eastus2
```

### 3. Deploy da Infraestrutura com Bicep

```powershell
cd infra
az deployment group create `
  --resource-group shancrys-rg `
  --template-file main.bicep `
  --parameters main.parameters.json
```

**Ou use o preview antes:**

```powershell
az deployment group what-if `
  --resource-group shancrys-rg `
  --template-file main.bicep `
  --parameters main.parameters.json
```

### 4. Obter Credenciais de Deploy

#### App Service (API)

```powershell
az webapp deployment list-publishing-profiles `
  --name shancrys-api-dev-XXXXX `
  --resource-group shancrys-rg `
  --xml
```

Copie o conteúdo XML completo.

#### Static Web App (DevTools)

```powershell
az staticwebapp secrets list `
  --name shancrys-devtools-dev-XXXXX `
  --resource-group shancrys-rg `
  --query "properties.apiKey" -o tsv
```

## 🔐 Configurar Secrets no GitHub

Vá para seu repositório no GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

Crie os seguintes secrets:

| Secret Name | Valor |
|------------|-------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | XML do publish profile da API |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Token do Static Web App |
| `API_URL` | URL da API (ex: https://shancrys-api-dev-xxx.azurewebsites.net) |

## 🔗 Conectar GitHub ao Repositório

### 1. Criar Repositório no GitHub

```powershell
# Instale GitHub CLI se necessário
winget install GitHub.cli

# Login
gh auth login

# Criar repositório
gh repo create shancrys --public --source=. --remote=origin --push
```

**Ou manualmente:**

```powershell
git remote add origin https://github.com/SEU_USUARIO/shancrys.git
git branch -M main
git push -u origin main
```

## ⚡ Deploy Automático

Após configurar os secrets, **todo push na branch `main`** irá disparar:

### 🔄 Workflows Configurados

1. **`ci.yml`** - Roda em PRs e branch `develop`
   - Build da API (.NET)
   - Build do DevTools (React)
   - Build do Engine (C++)

2. **`api-deploy.yml`** - Deploy da API
   - Trigger: Push em `services/api/**` ou workflow manual
   - Build + Test + Deploy para Azure App Service

3. **`devtools-deploy.yml`** - Deploy do DevTools
   - Trigger: Push em `devtools/**` ou workflow manual
   - Build + Deploy para Azure Static Web Apps

## 🎯 Deploy Manual via GitHub Actions

1. Vá para **Actions** no seu repositório
2. Selecione o workflow desejado
3. Clique em **Run workflow**
4. Selecione a branch `main`
5. Clique em **Run workflow**

## 🧪 Testar Deploy

### API

```powershell
$apiUrl = "https://shancrys-api-dev-XXXXX.azurewebsites.net"
Invoke-RestMethod "$apiUrl/health" -Method Get
```

### DevTools

Abra no navegador:
```
https://shancrys-devtools-dev-XXXXX.azurestaticapps.net
```

## 📊 Recursos Criados no Azure

| Recurso | Tipo | Propósito |
|---------|------|-----------|
| **shancrys-api** | App Service | API Backend .NET 8 |
| **shancrys-devtools** | Static Web App | Dashboard de observabilidade |
| **shancrys-db** | PostgreSQL 16 | Banco de dados principal |
| **shancrys-kv** | Key Vault | Armazenamento seguro de secrets |
| **shancrysstdev** | Storage Account | Arquivos BIM (IFC/RVT) |
| **shancrys-logs** | Log Analytics | Logs centralizados |
| **shancrys-insights** | Application Insights | Métricas e telemetria |

## 🔄 Atualizar Aplicação

```powershell
# Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# GitHub Actions irá fazer deploy automaticamente
```

## 🛠️ Troubleshooting

### Deploy falha - API

1. Verifique os logs no Azure Portal
2. Verifique o secret `AZURE_WEBAPP_PUBLISH_PROFILE`
3. Veja logs no GitHub Actions

### Deploy falha - DevTools

1. Verifique o secret `AZURE_STATIC_WEB_APPS_API_TOKEN`
2. Certifique-se que `VITE_API_URL` está correto
3. Veja logs no GitHub Actions

### Erro de conexão com banco

1. Verifique firewall rules do PostgreSQL
2. Teste conexão:
```powershell
Test-NetConnection -ComputerName shancrys-db-dev-xxx.postgres.database.azure.com -Port 5432
```

## 📈 Monitoramento

### Application Insights

```
https://portal.azure.com → Application Insights → shancrys-insights
```

### Logs da API

```powershell
az webapp log tail --name shancrys-api-dev-XXXXX --resource-group shancrys-rg
```

## 💰 Custos Estimados (Dev Environment)

| Recurso | SKU | Custo Mensal (USD) |
|---------|-----|-------------------|
| App Service | B1 | ~$13 |
| PostgreSQL | Burstable B1ms | ~$12 |
| Static Web App | Free | $0 |
| Storage | LRS | ~$1 |
| Key Vault | Standard | ~$0.03 |
| **Total** | | **~$26/mês** |

## 🔐 Segurança

### Após Deploy Inicial

1. **Alterar senha do PostgreSQL** via Key Vault
2. **Gerar novo JWT Secret** e armazenar no Key Vault
3. **Configurar Custom Domain** com SSL
4. **Habilitar Managed Identity** para Storage/Key Vault
5. **Configurar CORS** adequadamente
6. **Revisar Firewall Rules**

## 🌐 URLs Importantes

Após deploy, anote suas URLs:

```
API Swagger:  https://SEU-API.azurewebsites.net/swagger
DevTools:     https://SEU-DEVTOOLS.azurestaticapps.net
Portal Azure: https://portal.azure.com
```

## 📞 Suporte

Problemas com deploy? Abra uma issue no GitHub!

---

**Shancrys** - Deploy simplificado com GitHub Actions + Azure 🚀
