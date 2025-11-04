# ⚡ Deploy Rápido - Shancrys

## 🚀 Setup em 5 Minutos

### 1️⃣ Criar Repositório GitHub

```powershell
# Instalar GitHub CLI (se necessário)
winget install GitHub.cli

# Login
gh auth login

# Criar repo e push
gh repo create shancrys --public --source=. --remote=origin --push
```

### 2️⃣ Deploy Azure

```powershell
# Login no Azure
az login

# Criar infra completa (5-10 min)
az group create --name shancrys-rg --location eastus2
az deployment group create `
  --resource-group shancrys-rg `
  --template-file infra/main.bicep `
  --parameters infra/main.parameters.json
```

### 3️⃣ Configurar Secrets GitHub

```powershell
# Pegar publish profile da API
$profile = az webapp deployment list-publishing-profiles `
  --name shancrys-api-dev-* `
  --resource-group shancrys-rg `
  --xml

# Pegar token Static Web App
$token = az staticwebapp secrets list `
  --name shancrys-devtools-dev-* `
  --resource-group shancrys-rg `
  --query "properties.apiKey" -o tsv

# Adicionar secrets (copiar os valores acima)
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
gh secret set API_URL -b "https://shancrys-api-dev-XXX.azurewebsites.net"
```

### 4️⃣ Trigger Deploy

```powershell
# Push para disparar GitHub Actions
git push origin main

# Ou manualmente
gh workflow run "Deploy API to Azure"
gh workflow run "Deploy DevTools to Azure Static Web Apps"
```

### 5️⃣ Verificar

```powershell
# Ver workflows rodando
gh run list

# Ver logs
gh run view --log

# Testar API
curl https://SEU-API.azurewebsites.net/health
```

## 🎯 URLs Após Deploy

- **API:** <https://shancrys-api-dev-XXX.azurewebsites.net>
- **Swagger:** <https://shancrys-api-dev-XXX.azurewebsites.net/swagger>
- **DevTools:** <https://shancrys-devtools-dev-XXX.azurestaticapps.net>
- **Portal Azure:** <https://portal.azure.com>

## 📊 Recursos Criados

- ✅ App Service (API .NET 8)
- ✅ Static Web App (React DevTools)
- ✅ PostgreSQL 16
- ✅ Key Vault
- ✅ Storage Account
- ✅ Application Insights

## 💰 Custo: ~$26/mês (dev)

---

**Veja DEPLOY.md para guia completo**
