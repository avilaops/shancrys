# Health Check API

A API Shancrys inclui endpoints de health check para verificar a conectividade com todos os serviços de backend.

## Endpoints Disponíveis

### 1. Health Check Geral

**GET** `/api/v1/health`

Verifica o status de todos os serviços configurados (MongoDB, RabbitMQ, Redis).

**Resposta de Sucesso (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T06:54:57.3251404Z",
  "services": {
    "mongodb": {
      "name": "MongoDB",
      "healthy": true,
      "responseTime": "45ms",
      "error": null,
      "details": {
        "database": "shancrys",
        "status": "connected"
      }
    },
    "rabbitmq": {
      "name": "RabbitMQ",
      "healthy": true,
      "responseTime": "35ms",
      "error": null,
      "details": {
        "host": "localhost",
        "port": "5672",
        "status": "connected"
      }
    }
  }
}
```

**Resposta de Erro (503 Service Unavailable):**
```json
{
  "status": "degraded",
  "timestamp": "2025-11-05T06:54:57.3251404Z",
  "services": {
    "mongodb": {
      "name": "MongoDB",
      "healthy": false,
      "responseTime": "5000ms",
      "error": "Connection failed: Unable to connect to server",
      "details": null
    }
  }
}
```

### 2. Health Check do MongoDB

**GET** `/api/v1/health/mongodb`

Verifica apenas a conectividade com o MongoDB.

**Resposta (200 OK):**
```json
{
  "name": "MongoDB",
  "healthy": true,
  "responseTime": "5ms",
  "error": null,
  "details": {
    "database": "shancrys",
    "status": "connected"
  }
}
```

### 3. Health Check do RabbitMQ

**GET** `/api/v1/health/rabbitmq`

Verifica apenas a conectividade com o RabbitMQ.

**Resposta (200 OK):**
```json
{
  "name": "RabbitMQ",
  "healthy": true,
  "responseTime": "10ms",
  "error": null,
  "details": {
    "host": "localhost",
    "port": "5672",
    "status": "connected"
  }
}
```

### 4. Health Check do Redis

**GET** `/api/v1/health/redis`

Verifica a conectividade com o Redis (opcional).

**Resposta (404 Not Found)** - quando Redis não está configurado:
```json
{
  "message": "Redis is not configured"
}
```

## Como Usar

### Via cURL

```bash
# Verificar todos os serviços
curl http://localhost:5001/api/v1/health

# Verificar apenas MongoDB
curl http://localhost:5001/api/v1/health/mongodb

# Verificar apenas RabbitMQ
curl http://localhost:5001/api/v1/health/rabbitmq

# Verificar apenas Redis
curl http://localhost:5001/api/v1/health/redis
```

### Via PowerShell

```powershell
# Verificar todos os serviços
Invoke-RestMethod -Uri "http://localhost:5001/api/v1/health" -Method Get

# Verificar apenas MongoDB
Invoke-RestMethod -Uri "http://localhost:5001/api/v1/health/mongodb" -Method Get
```

### Em Scripts de Monitoramento

```bash
#!/bin/bash
# health-check.sh

API_URL="http://localhost:5001/api/v1/health"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health.json "$API_URL")

if [ "$RESPONSE" -eq 200 ]; then
    echo "✓ API está saudável"
    exit 0
else
    echo "✗ API está com problemas"
    cat /tmp/health.json
    exit 1
fi
```

## Integração com Docker Compose

O health check pode ser usado como verificação de saúde no Docker:

```yaml
api:
  image: shancrys-api
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/api/v1/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Configuração dos Serviços

### MongoDB

Configure no `appsettings.json`:

```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "shancrys"
  }
}
```

### RabbitMQ

Configure no `appsettings.json`:

```json
{
  "RabbitMQ": {
    "HostName": "localhost",
    "Port": 5672,
    "UserName": "guest",
    "Password": "guest"
  }
}
```

### Redis (Opcional)

Configure no `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Redis": "localhost:6379"
  }
}
```

## Status Codes

| Código | Descrição |
|--------|-----------|
| 200 | Todos os serviços estão saudáveis |
| 404 | Serviço não configurado (apenas para endpoints individuais) |
| 503 | Um ou mais serviços estão indisponíveis |

## Troubleshooting

### MongoDB não conecta

1. Verifique se o serviço está rodando:
   ```bash
   docker compose ps mongodb
   ```

2. Teste a conexão diretamente:
   ```bash
   mongosh mongodb://localhost:27017
   ```

3. Verifique os logs:
   ```bash
   docker compose logs mongodb
   ```

### RabbitMQ não conecta

1. Verifique se o serviço está rodando:
   ```bash
   docker compose ps rabbitmq
   ```

2. Acesse o Management UI:
   ```
   http://localhost:15672
   (usuário: guest, senha: guest)
   ```

3. Verifique os logs:
   ```bash
   docker compose logs rabbitmq
   ```

### Erro de autenticação

Certifique-se de que as credenciais no `appsettings.json` correspondem às configuradas no `docker-compose.yml`.

## Métricas

Os health checks retornam o tempo de resposta de cada serviço, útil para monitoramento de performance:

- **< 50ms**: Excelente
- **50-100ms**: Bom
- **100-500ms**: Aceitável
- **> 500ms**: Lento, investigar

## Uso em Produção

Para produção, considere:

1. **Autenticação**: Adicionar autenticação aos endpoints de health check ou expô-los apenas internamente
2. **Rate Limiting**: Limitar a frequência de chamadas para evitar sobrecarga
3. **Logs**: Configurar alertas quando serviços ficam indisponíveis
4. **Circuit Breaker**: Implementar padrão circuit breaker para serviços externos

## Referências

- [ASP.NET Core Health Checks](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [MongoDB Health Check](https://www.mongodb.com/docs/manual/reference/command/ping/)
- [RabbitMQ Management](https://www.rabbitmq.com/management.html)
