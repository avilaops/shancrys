# Guia de Início Rápido - Shancrys 4D

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org/) (para web frontend)
- [CMake 3.20+](https://cmake.org/) (para engine C++)
- [Visual Studio Code](https://code.visualstudio.com/) (recomendado)

## 1. Clonar e Configurar

```powershell
cd "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys"
```

## 2. Subir Infraestrutura (PostgreSQL, RabbitMQ, Redis)

```powershell
cd infrastructure
docker-compose up -d
```

Aguarde ~30s para serviços iniciarem completamente.

Verificar:

- PostgreSQL: `localhost:5432`
- RabbitMQ Management: <http://localhost:15672> (guest/guest)
- Redis: `localhost:6379`

## 3. Configurar e Executar API

```powershell
cd ..\services\api

# Restaurar dependências
dotnet restore

# Aplicar migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Executar API
dotnet run
```

API disponível em: <http://localhost:5000>  
Swagger UI: <http://localhost:5000/swagger>

### Testar API

```powershell
# Health check
curl http://localhost:5000/api/v1/health

# Criar projeto (requer autenticação - implementar AuthController primeiro)
```

## 4. Build Engine C++ (Opcional)

```powershell
cd ..\..\engine
mkdir build
cd build

# Windows (Visual Studio)
cmake .. -G "Visual Studio 17 2022"
cmake --build . --config Release

# Testar CLI
.\Release\shancrys_cli.exe help
```

## 5. Frontend Web (Futuro)

```powershell
cd ..\..\web

# Instalar dependências
npm install

# Dev server
npm run dev
```

Disponível em: <http://localhost:5173>

## 6. Mobile App (Futuro)

```powershell
cd ..\mobile

flutter pub get
flutter run
```

## Estrutura do Projeto

```
Shancrys/
├── engine/                 # C++ parser BIM
├── services/
│   ├── api/               # .NET 8 REST API
│   └── analytics/         # Python analytics (futuro)
├── web/                   # React + Three.js
├── mobile/                # Flutter app
├── infrastructure/        # Docker Compose
├── docs/                  # Documentação + ADRs
└── specs/                 # OpenAPI, modelos de dados
```

## Desenvolvimento

### Comandos úteis

```powershell
# Parar todos os containers
cd infrastructure
docker-compose down

# Ver logs da API
docker-compose logs -f api

# Reset completo (apaga dados)
docker-compose down -v

# Rebuild containers após mudanças
docker-compose up -d --build
```

### Extensões VS Code Recomendadas

- C# Dev Kit
- Docker
- REST Client
- PostgreSQL Explorer
- CMake Tools

## Próximos Passos

1. ✅ Infraestrutura local rodando
2. ✅ API básica funcionando
3. ⏳ Implementar AuthController (login JWT)
4. ⏳ Implementar upload e parse de modelo IFC
5. ⏳ Frontend para visualização 3D
6. ⏳ App mobile para campo

## Problemas Comuns

### Porta 5432 já em uso

```powershell
# Parar PostgreSQL local se estiver rodando
Stop-Service postgresql-x64-16
```

### Erro de conexão com banco

```powershell
# Verificar se container está rodando
docker ps

# Verificar logs
docker logs shancrys-postgres
```

### Build .NET falha

```powershell
# Limpar e rebuild
dotnet clean
dotnet restore --force
dotnet build
```

## Recursos

- [Documentação Completa](./docs/README.md)
- [Especificação API](./specs/api-openapi.yaml)
- [ADRs (Decisões Arquiteturais)](./docs/)
- [Issues & Roadmap](https://github.com/your-org/shancrys/issues)
