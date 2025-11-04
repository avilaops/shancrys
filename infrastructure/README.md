# Shancrys Infrastructure

Configuração de infraestrutura para desenvolvimento e produção.

## Local Development

### Subir todos os serviços

```powershell
cd infrastructure
docker-compose up -d
```

### Serviços disponíveis

- **PostgreSQL**: `localhost:5432`
  - Database: `shancrys`
  - User: `postgres` / Password: `postgres`
  
- **RabbitMQ**: `localhost:5672` (AMQP)
  - Management UI: `http://localhost:15672`
  - User: `guest` / Password: `guest`
  
- **Redis**: `localhost:6379`

- **API**: `http://localhost:5000`
  - Swagger: `http://localhost:5000/swagger`

### Parar serviços

```powershell
docker-compose down
```

### Limpar volumes (reset completo)

```powershell
docker-compose down -v
```

## Scripts de Inicialização

Scripts SQL em `init-scripts/` são executados automaticamente no primeiro start do PostgreSQL.

## Produção (Azure/AWS)

TODO: Configuração Terraform/Bicep para provisionamento cloud.

## Observabilidade

- Logs: agregados via Serilog → futuro Grafana Loki
- Métricas: Prometheus endpoint em `/metrics`
- Traces: OpenTelemetry → Jaeger
