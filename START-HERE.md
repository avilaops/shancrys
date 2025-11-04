# 🚀 Guia Rápido - Rodar Shancrys Local (Sem Docker)

## Opção 1: Script Automático (Recomendado)

### Executar como Administrador

```powershell
# 1. Abrir PowerShell como Administrador
# 2. Navegar até o projeto
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys"

# 3. Executar script de setup
.\scripts\setup-local.ps1
```

O script vai:

- ✅ Verificar e iniciar PostgreSQL
- ✅ Criar database "shancrys"
- ✅ Atualizar connection string
- ✅ Aplicar migrations
- ✅ Opção de executar API automaticamente

---

## Opção 2: Setup Manual (Passo a Passo)

### 1️⃣ Iniciar PostgreSQL

**PowerShell como Administrador:**

```powershell
Start-Service postgresql-x64-16
```

**Ou via Serviços:**

- Pressione `Win + R`
- Digite `services.msc`
- Encontre "postgresql-x64-16"
- Botão direito → Iniciar

### 2️⃣ Criar Database

```powershell
# Abrir prompt do PostgreSQL (substituir SENHA)
psql -U postgres -h localhost

# No prompt psql:
CREATE DATABASE shancrys;
\q
```

### 3️⃣ Configurar Connection String

Editar `services/api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=shancrys;Username=postgres;Password=SUA_SENHA"
  }
}
```

### 4️⃣ Aplicar Migrations

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api"

# Instalar ferramenta (primeira vez)
dotnet tool install --global dotnet-ef

# Criar e aplicar migration
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 5️⃣ Executar API

```powershell
dotnet run
```

**Acessar:**

- API: <http://localhost:5000>
- Swagger: <http://localhost:5000/swagger>

---

## 🔧 Troubleshooting

### Erro: "Serviço não pode ser iniciado"

Execute PowerShell como **Administrador**.

### Erro: "psql não é reconhecido"

Adicionar PostgreSQL ao PATH:

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

Ou usar pgAdmin para criar o database (GUI).

### Erro: "Password authentication failed"

Senha incorreta. Verificar senha do usuário `postgres`.

### Erro: "Database already exists"

Tudo certo! Apenas continue com os próximos passos.

### Porta 5000 em uso

```powershell
# Ver processos na porta 5000
netstat -ano | findstr :5000

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

---

## ✅ Checklist Rápido

- [ ] PostgreSQL instalado
- [ ] Serviço PostgreSQL rodando
- [ ] Database "shancrys" criada
- [ ] Connection string configurada
- [ ] Migrations aplicadas
- [ ] API rodando
- [ ] Swagger acessível

---

## 🎯 Próximos Passos

Após API rodando:

1. **Testar Swagger**
   - Abrir <http://localhost:5000/swagger>
   - Explorar endpoints disponíveis

2. **Implementar Autenticação**
   - Criar `AuthController`
   - Endpoint de login
   - Geração de JWT

3. **Testar CRUD de Projetos**
   - POST `/api/v1/projects`
   - GET `/api/v1/projects`

4. **Integrar Engine C++**
   - Compilar engine
   - Testar parse de modelo IFC

---

## 📞 Precisa de Ajuda?

- **Documentação completa**: `SETUP-LOCAL.md`
- **Issues conhecidos**: Verificar logs da API
- **Logs**: Console onde executou `dotnet run`
