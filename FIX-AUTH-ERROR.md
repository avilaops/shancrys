# ⚡ SETUP RÁPIDO - Evitando Erro "username required"

## 🔴 PROBLEMA QUE VOCÊ MENCIONOU

```
Error: Input required and not supplied: username
```

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Usamos `azure/login@v2` em vez de `azure/docker-login@v1`

```yaml
- name: Log in to Azure
  uses: azure/login@v2
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}  # ← ESTE É O SEGREDO CHAVE!
```

### 2. Depois fazemos login no ACR via Azure CLI

```yaml
- name: Log in to Azure Container Registry
  run: az acr login --name ${{ env.REGISTRY_NAME }}
```

## 🚀 PARA FUNCIONAR, EXECUTE

```powershell
# 1. Criar Service Principal (OBRIGATÓRIO!)
$sp = az ad sp create-for-rbac `
  --name "shancrys-github-actions" `
  --role contributor `
  --scopes /subscriptions/3b49f371-dd88-46c7-ba30-aeb54bd5c2f6/resourceGroups/shancrys-rg `
  --sdk-auth

# 2. Salvar output em arquivo
$sp | Out-File -Encoding UTF8 azure-credentials.json

# 3. Adicionar como secret no GitHub
gh secret set AZURE_CREDENTIALS < azure-credentials.json

# 4. Verificar
gh secret list
```

## ✅ PRONTO

Agora quando você fizer push, o GitHub Actions vai:

1. ✅ Fazer login no Azure com Service Principal
2. ✅ Fazer login no ACR automaticamente
3. ✅ Construir imagem Docker
4. ✅ Push para ACR
5. ✅ Deploy no Container App

**SEM ERRO "username required"!** 🎉

## 📝 Diferença dos Métodos

| ❌ Método Antigo (dá erro) | ✅ Método Novo (funciona) |
|----------------------------|---------------------------|
| `azure/docker-login@v1` | `azure/login@v2` |
| Precisa username/password separados | Usa AZURE_CREDENTIALS completo |
| Dá erro de autenticação | Funciona perfeitamente |

---

**Executou o comando acima?** Depois é só fazer push e ver a mágica acontecer! 🚀
