# 🚀 Deploy Shancrys - Execução Manual Rápida

## Passo 1: Criar Repositório GitHub

**Opção A: Via Web (Recomendado)**

1. Abra: <https://github.com/new>
2. Nome: `shancrys`
3. Descrição: `Plataforma 4D BIM para Engenharia Civil`
4. Público
5. Clique em "Create repository"

**Opção B: Via CLI (se gh estiver configurado)**

```powershell
gh auth login
gh repo create shancrys --public --description "Plataforma 4D BIM" --source=. --remote=origin --push
```

## Passo 2: Push do Código

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys"

# Se criou via web, adicione o remote:
git remote add origin https://github.com/SEU_USUARIO/shancrys.git

# Push
git branch -M main
git push -u origin main
```

## Passo 3: Deploy Azure (Infraestrutura)

```powershell
# Login Azure
az login

# Criar Resource Group
az group create --name shancrys-rg --location eastus2

# Deploy Bicep (com preview primeiro)
az deployment group what-if `
  --resource-group shancrys-rg `
  --template-file infra/main.bicep `
  --parameters infra/main.parameters.json

# Deploy real
az deployment group create `
  --resource-group shancrys-rg `
  --template-file infra/main.bicep `
  --parameters infra/main.parameters.json `
  --output json > deployment-output.json
```

## Passo 4: Obter Credenciais

```powershell
# Pegar nome da API (será algo como shancrys-api-dev-xxxxx)
$apiName = (Get-Content deployment-output.json | ConvertFrom-Json).properties.outputs.apiUrl.value
$apiName = ($apiName -split "//")[1].Split('.')[0]

# Pegar publish profile da API
az webapp deployment list-publishing-profiles `
  --name $apiName `
  --resource-group shancrys-rg `
  --xml > publish-profile.xml

# Pegar nome do Static Web App
$swaName = (Get-Content deployment-output.json | ConvertFrom-Json).properties.outputs.devtoolsUrl.value
$swaName = ($swaName -split "//")[1].Split('.')[0]

# Pegar token do Static Web App
az staticwebapp secrets list `
  --name $swaName `
  --resource-group shancrys-rg `
  --query "properties.apiKey" -o tsv > swa-token.txt

# Pegar API URL
$apiUrl = (Get-Content deployment-output.json | ConvertFrom-Json).properties.outputs.apiUrl.value
```

## Passo 5: Configurar Secrets no GitHub

Vá para: `https://github.com/SEU_USUARIO/shancrys/settings/secrets/actions`

Crie 3 secrets:

1. **AZURE_WEBAPP_PUBLISH_PROFILE**
   - Cole o conteúdo de `publish-profile.xml`

2. **AZURE_STATIC_WEB_APPS_API_TOKEN**
   - Cole o conteúdo de `swa-token.txt`

3. **API_URL**
   - Cole a URL da API (ex: <https://shancrys-api-dev-xxx.azurewebsites.net>)

## Passo 6: Disparar Workflows

```powershell
# Via CLI
gh workflow run "Deploy API to Azure"
gh workflow run "Deploy DevTools to Azure Static Web Apps"

# Ou faça um push vazio:
git commit --allow-empty -m "trigger: Deploy inicial"
git push
```

## Passo 7: Acompanhar Deploy

```powershell
# Ver workflows
gh run list

# Assistir workflow rodando
gh run watch

# Ver logs
gh run view --log
```

## 🎯 URLs Após Deploy

- **API:** <https://shancrys-api-dev-XXX.azurewebsites.net>
- **Swagger:** <https://shancrys-api-dev-XXX.azurewebsites.net/swagger>
- **DevTools:** <https://shancrys-devtools-dev-XXX.azurestaticapps.net>
- **Portal Azure:** <https://portal.azure.com> (buscar por "shancrys-rg")

## ✅ Verificar Deploy

```powershell
# Testar API
$apiUrl = "https://SEU-API.azurewebsites.net"
Invoke-RestMethod "$apiUrl/health" -Method Get

# Ver logs da API
az webapp log tail --name shancrys-api-dev-XXX --resource-group shancrys-rg
```

---

**Pronto! Shancrys no ar!** 🚀
