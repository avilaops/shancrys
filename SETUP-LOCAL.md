# Setup Local Sem Docker - Shancrys

Guia para rodar a plataforma Shancrys sem Docker, usando serviços nativos do Windows.

## Pré-requisitos

### 1. PostgreSQL 16

**Verificar se está instalado:**

```powershell
Get-Service -Name "postgresql-x64-16"
```

**Se não estiver instalado:**

- Download: <https://www.postgresql.org/download/windows/>
- Instalar com configurações padrão
- Porta: 5432
- Usuário: postgres
- Senha: definir sua senha

**Iniciar serviço (como Administrador):**

```powershell
Start-Service postgresql-x64-16
```

**Ou manualmente:**

- Abrir "Serviços" (services.msc)
- Encontrar "postgresql-x64-16"
- Clicar com botão direito → Iniciar

### 2. Criar Database

```powershell
# Conectar ao PostgreSQL (substitua a senha)
psql -U postgres -h localhost

# No prompt do psql:
CREATE DATABASE shancrys;
\q
```

**Alternativa via GUI:**

- Usar pgAdmin (instalado com PostgreSQL)
- Criar database "shancrys"

### 3. RabbitMQ (Opcional para MVP básico)

**Download:** <https://www.rabbitmq.com/install-windows.html>

**Ou usar Chocolatey:**

```powershell
choco install rabbitmq
```

**Iniciar:**

```powershell
# Serviço inicia automaticamente após instalação
# Ou manualmente:
rabbitmq-service start
```

**Management UI:** <http://localhost:15672> (guest/guest)

### 4. Redis (Opcional para MVP básico)

**Download:** <https://github.com/microsoftarchive/redis/releases>

**Ou usar Chocolatey:**

```powershell
choco install redis-64
```

**Iniciar:**

```powershell
redis-server
```

## Configuração da API

### 1. Atualizar Connection String

Editar `services/api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=shancrys;Username=postgres;Password=SUA_SENHA_AQUI"
  }
}
```

### 2. Aplicar Migrations

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api"

# Instalar ferramenta EF Core (se não tiver)
dotnet tool install --global dotnet-ef

# Criar migration
dotnet ef migrations add InitialCreate

# Aplicar no banco
dotnet ef database update
```

### 3. Executar API

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api"
dotnet run
```

**API disponível em:** <http://localhost:5000>  
**Swagger UI:** <http://localhost:5000/swagger>

## MVP Mínimo (Sem RabbitMQ e Redis)

Para testar rapidamente sem instalar todos os serviços:

### 1. Comentar serviços opcionais no `Program.cs`

Abrir `services/api/Program.cs` e comentar referências ao RabbitMQ (se houver).

### 2. Executar apenas PostgreSQL + API

```powershell
# Terminal 1: Garantir PostgreSQL rodando
Get-Service postgresql-x64-16

# Terminal 2: Executar API
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api"
dotnet run
```

## Testar Funcionamento

### 1. Health Check

```powershell
curl http://localhost:5000/api/v1/projects
```

Deve retornar 401 (Unauthorized - esperado, sem autenticação ainda).

### 2. Swagger UI

Abrir navegador: <http://localhost:5000/swagger>

- Explorar endpoints
- Testar criação de projeto (após implementar AuthController)

## Troubleshooting

### Erro: "Cannot open server"

PostgreSQL não está rodando. Iniciar como administrador:

```powershell
# PowerShell como Admin
Start-Service postgresql-x64-16
```

### Erro: "Password authentication failed"

Senha incorreta no `appsettings.json`. Verificar senha do PostgreSQL.

### Erro: "Database does not exist"

```powershell
psql -U postgres -h localhost
CREATE DATABASE shancrys;
\q
```

### Porta 5000 já em uso

```powershell
# Ver o que está usando a porta
netstat -ano | findstr :5000

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

## Próximos Passos

1. ✅ PostgreSQL rodando
2. ✅ Database criada
3. ✅ Migrations aplicadas
4. ✅ API rodando
5. ⏳ Implementar AuthController
6. ⏳ Testar CRUD de projetos

## Configuração de Desenvolvimento

### appsettings.Development.json

Criar arquivo para desenvolvimento (não commitado):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=shancrys;Username=postgres;Password=sua_senha"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug"
    }
  }
}
```

### Variáveis de Ambiente

Alternativa mais segura:

```powershell
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=shancrys;Username=postgres;Password=sua_senha"
dotnet run
```

## Checklist Final

- [ ] PostgreSQL instalado e rodando
- [ ] Database "shancrys" criada
- [ ] Connection string atualizada
- [ ] Migrations aplicadas
- [ ] API executando sem erros
- [ ] Swagger acessível
- [ ] (Opcional) RabbitMQ instalado
- [ ] (Opcional) Redis instalado

---

**Dica:** Para desenvolvimento, apenas PostgreSQL é essencial. RabbitMQ e Redis podem ser adicionados depois.
