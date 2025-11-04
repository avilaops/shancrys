# 🚀 Shancrys - Status do Deploy Azure

## ✅ O QUE JÁ ESTÁ CRIADO

1. **Storage Account** - `shancrysstdevhp7owg`
2. **Container Registry (ACR)** - `shancrysacrdevhp7owg`
3. **Log Analytics** - `shancrys-logs-dev-hp7owgdw2zpma`
4. **Application Insights** - `shancrys-insights-dev-hp7owgdw2zpma`
5. **Static Web App** - `shancrys-devtools-dev-hp7owgdw2zpma`
6. **Resource Group** - `shancrys-rg`

## ⏳ FALTAM CRIAR

- **Container App** (API Backend)
- **PostgreSQL Database**
- **Key Vault**
- **Container App Environment**

## 🎯 PRÓXIMOS PASSOS

### Opção 1: Completar Deploy via CLI

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys"
az deployment group create `
  --resource-group shancrys-rg `
  --template-file infra/container-apps.bicep `
  --parameters infra/main.parameters.json
```

### Opção 2: Deploy via Portal Azure

1. Abra: <https://portal.azure.com>
2. Vá em Resource Groups → shancrys-rg
3. Clique em "Deploy" → "Deploy a custom template"
4. Upload `infra/container-apps.bicep`

### Opção 3: Simplificar - Apenas Criar Container App Manual

```powershell
# Criar Container App Environment
az containerapp env create `
  --name shancrys-env `
  --resource-group shancrys-rg `
  --location eastus2

# Criar Container App (usando imagem de exemplo)
az containerapp create `
  --name shancrys-api `
  --resource-group shancrys-rg `
  --environment shancrys-env `
  --image mcr.microsoft.com/dotnet/samples:aspnetapp `
  --target-port 8080 `
  --ingress external `
  --min-replicas 1 `
  --max-replicas 3
```

## 📊 URLs Atuais

- **DevTools:** <https://shancrys-devtools-dev-hp7owgdw2zpma.azurestaticapps.net>
- **Portal Azure:** <https://portal.azure.com/#@/resource/subscriptions/3b49f371-dd88-46c7-ba30-aeb54bd5c2f6/resourceGroups/shancrys-rg>
- **GitHub:** <https://github.com/avilaops/shancrys>

## 💡 RECOMENDAÇÃO

Execute a **Opção 3** - criar apenas o Container App manualmente agora e depois configurar CI/CD. Mais rápido e direto ao ponto!

```powershell
# EXECUTE ESTES 2 COMANDOS:
az containerapp env create --name shancrys-env --resource-group shancrys-rg --location eastus2

az containerapp create --name shancrys-api --resource-group shancrys-rg --environment shancrys-env --image mcr.microsoft.com/dotnet/samples:aspnetapp --target-port 8080 --ingress external --min-replicas 1
```

Depois disso, configuramos o CI/CD para fazer deploy automático da nossa API!
