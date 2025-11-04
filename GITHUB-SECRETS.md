# 🔐 Configuração de Secrets GitHub - Shancrys

## Secrets Necessários

Para que o CI/CD funcione corretamente, você precisa configurar os seguintes secrets no GitHub:

### 1. AZURE_CREDENTIALS (OBRIGATÓRIO para Container Apps)

Este é o mais importante! Cria um Service Principal no Azure:

```powershell
# 1. Criar Service Principal
$sp = az ad sp create-for-rbac `
  --name "shancrys-github-actions" `
  --role contributor `
  --scopes /subscriptions/3b49f371-dd88-46c7-ba30-aeb54bd5c2f6/resourceGroups/shancrys-rg `
  --sdk-auth

# 2. Copiar o output JSON completo
$sp | Out-File -Encoding UTF8 azure-credentials.json
```

O output será algo assim:

```json
{
  "clientId": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
  "clientSecret": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
  "subscriptionId": "3b49f371-dd88-46c7-ba30-aeb54bd5c2f6",
  "tenantId": "0e53f641-197a-48b2-83a4-f8222f5d48c0",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**Cole TODO esse JSON no secret `AZURE_CREDENTIALS`**

### 2. AZURE_STATIC_WEB_APPS_API_TOKEN

Para deploy do DevTools:

```powershell
az staticwebapp secrets list `
  --name shancrys-devtools-dev-hp7owgdw2zpma `
  --resource-group shancrys-rg `
  --query "properties.apiKey" -o tsv
```

### 3. API_URL

URL da API após deploy (será algo como):

```
https://shancrys-api.XXXXXXX.eastus2.azurecontainerapps.io
```

## ✅ Como Adicionar Secrets no GitHub

### Via GitHub CLI

```powershell
# 1. AZURE_CREDENTIALS (cole o JSON)
gh secret set AZURE_CREDENTIALS < azure-credentials.json

# 2. Static Web App Token
$swaToken = az staticwebapp secrets list --name shancrys-devtools-dev-hp7owgdw2zpma --resource-group shancrys-rg --query "properties.apiKey" -o tsv
$swaToken | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN

# 3. API URL (depois que o Container App for criado)
gh secret set API_URL -b "https://sua-api-url.azurecontainerapps.io"
```

### Via Web

1. Vá em: <https://github.com/avilaops/shancrys/settings/secrets/actions>
2. Clique em **"New repository secret"**
3. Adicione cada secret

## 🔍 Verificar Secrets

```powershell
gh secret list
```

## ⚠️ IMPORTANTE

### Por que AZURE_CREDENTIALS é obrigatório?

- **SEM ele:** GitHub Actions não consegue fazer login no Azure
- **Erro comum:** "Error: Input required and not supplied: username"
- **Solução:** Sempre usar `azure/login@v2` com `creds: ${{ secrets.AZURE_CREDENTIALS }}`

### Diferença dos métodos de autenticação

| Método | Uso | Requer |
|--------|-----|--------|
| `azure/login@v2` + AZURE_CREDENTIALS | **Container Apps, ACR** | Service Principal |
| `azure/webapps-deploy@v3` + Publish Profile | App Service | Publish Profile XML |
| `Azure/docker-login@v1` + username/password | ACR manual | ACR admin user |

**Para Container Apps, SEMPRE use o primeiro método!**

## 🚀 Ordem de Execução

1. ✅ Criar Service Principal
2. ✅ Adicionar AZURE_CREDENTIALS no GitHub
3. ✅ Adicionar AZURE_STATIC_WEB_APPS_API_TOKEN
4. ✅ Deploy Container App no Azure (manual ou Bicep)
5. ✅ Pegar URL do Container App
6. ✅ Adicionar API_URL no GitHub
7. ✅ Push para main → Deploy automático! 🎉

## 📝 Exemplo Completo

```powershell
# Passo 1: Service Principal
$sp = az ad sp create-for-rbac --name "shancrys-github-actions" --role contributor --scopes /subscriptions/3b49f371-dd88-46c7-ba30-aeb54bd5c2f6/resourceGroups/shancrys-rg --sdk-auth
$sp | gh secret set AZURE_CREDENTIALS

# Passo 2: Static Web App Token
az staticwebapp secrets list --name shancrys-devtools-dev-hp7owgdw2zpma --resource-group shancrys-rg --query "properties.apiKey" -o tsv | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN

# Passo 3: Verificar
gh secret list

# Pronto! Agora é só fazer push
git push origin main
```

---

**Com esses secrets configurados, o deploy será 100% automático!** 🚀
