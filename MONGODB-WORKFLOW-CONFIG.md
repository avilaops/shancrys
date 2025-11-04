# Configuração dos Workflows para MongoDB

Este documento descreve as alterações feitas nos workflows do GitHub Actions para suportar MongoDB.

## 📋 Alterações Realizadas

### 1. **deploy-azure-containerapp.yml**

- ✅ Resolvido conflito de merge
- ✅ Adicionadas variáveis de ambiente para MongoDB no deploy:
  - `MongoDb__ConnectionString` (via secret reference)
  - `JwtSettings__SecretKey` (via secret reference)
  - `RabbitMQ__Password` (via secret reference)

### 2. **ci.yml**

- ✅ Adicionado serviço MongoDB no job de build da API
- ✅ Configurado health check para garantir que MongoDB está pronto
- ✅ Variáveis de ambiente para testes:
  - `MongoDb__ConnectionString`
  - `JwtSettings__SecretKey`

### 3. **api-deploy.yml**

- ✅ Adicionado serviço MongoDB no job de build
- ✅ Configurado health check
- ✅ Variáveis de ambiente para build e testes

## 🔐 Secrets Necessários no Azure Container Apps

Você precisa configurar os seguintes secrets no Azure Container Apps:

### Via Azure Portal

1. Acesse o Container App: `shancrys-api-dev`
2. Vá em **Settings** > **Secrets**
3. Adicione os seguintes secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `mongodb-connection-string` | String de conexão do MongoDB Atlas | `mongodb+srv://usuario:senha@cluster.mongodb.net/shancrys?retryWrites=true&w=majority` |
| `jwt-secret-key` | Chave secreta para JWT (mínimo 32 caracteres) | `your-super-secret-jwt-key-min-32-chars` |
| `rabbitmq-password` | Senha do RabbitMQ | `your-rabbitmq-password` |

### Via Azure CLI

```powershell
# 1. Adicionar secret do MongoDB
az containerapp secret set \
  --name shancrys-api-dev \
  --resource-group shancrys-rg \
  --secrets mongodb-connection-string="mongodb+srv://usuario:senha@cluster.mongodb.net/shancrys?retryWrites=true&w=majority"

# 2. Adicionar secret do JWT
az containerapp secret set \
  --name shancrys-api-dev \
  --resource-group shancrys-rg \
  --secrets jwt-secret-key="your-super-secret-jwt-key-min-32-chars"

# 3. Adicionar secret do RabbitMQ
az containerapp secret set \
  --name shancrys-api-dev \
  --resource-group shancrys-rg \
  --secrets rabbitmq-password="your-rabbitmq-password"
```

## 🔄 Workflow de CI/CD

### Fluxo de Integração Contínua (ci.yml)

```
1. Push/PR → main/develop
2. Inicia serviço MongoDB (container)
3. Aguarda health check
4. Restaura dependências .NET
5. Build com variáveis do MongoDB
6. Executa testes (se houver)
```

### Fluxo de Deploy (deploy-azure-containerapp.yml)

```
1. Push → main (em services/api/**)
2. Login no Azure (OIDC)
3. Build da imagem Docker
4. Push para ACR
5. Deploy no Container App com secrets configurados
6. Verifica URL do deployment
```

## 📝 Variáveis de Ambiente

### Formato das Variáveis MongoDB

```
MongoDb__ConnectionString=mongodb+srv://...
MongoDb__DatabaseName=shancrys
MongoDb__MaxConnectionPoolSize=100
MongoDb__MinConnectionPoolSize=10
```

### Formato das Variáveis JWT

```
JwtSettings__SecretKey=your-secret-key
JwtSettings__Issuer=shancrys-api
JwtSettings__Audience=shancrys-clients
JwtSettings__ExpirationMinutes=60
```

## ✅ Próximos Passos

1. **Configurar Secrets no Azure**:

   ```powershell
   # Execute os comandos acima para adicionar os secrets
   ```

2. **Testar o Workflow**:

   ```powershell
   git add .
   git commit -m "feat: configure workflows for mongodb"
   git push origin main
   ```

3. **Verificar Logs**:
   - Acesse GitHub Actions e verifique se o workflow executa com sucesso
   - Verifique os logs do Container App para garantir conexão com MongoDB

4. **Validar API**:

   ```powershell
   # Obter URL da API
   az containerapp show -n shancrys-api-dev -g shancrys-rg --query properties.configuration.ingress.fqdn -o tsv
   
   # Testar health check
   curl https://<url-da-api>/health
   ```

## 🐛 Troubleshooting

### MongoDB não conecta

- Verifique se a string de conexão está correta
- Confirme que o IP do Azure está liberado no MongoDB Atlas
- Verifique os logs: `az containerapp logs show -n shancrys-api-dev -g shancrys-rg --tail 50`

### JWT inválido

- Verifique se a chave tem no mínimo 32 caracteres
- Confirme que o secret está configurado corretamente

### Workflow falha no CI

- Verifique se o serviço MongoDB iniciou corretamente
- Veja os logs do GitHub Actions para detalhes do erro
- Confirme que as variáveis de ambiente estão corretas

## 📚 Referências

- [Azure Container Apps Secrets](https://learn.microsoft.com/azure/container-apps/manage-secrets)
- [GitHub Actions Services](https://docs.github.com/actions/using-containerized-services/about-service-containers)
- [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)
