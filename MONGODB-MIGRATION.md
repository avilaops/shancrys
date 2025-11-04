# Migração MongoDB - Resumo

## ✅ Alterações Realizadas

1. **Removido PostgreSQL**, ad adicionado MongoDB Driver
2. **Atualizado `appsettings.json`** com a connection string do MongoDB
3. **Criado `MongoDbContext`** para gerenciar as collections
4. **Atualizado `Program.cs`** para usar MongoDB
5. **Atualizado modelos** com atributos do MongoDB (BsonId, BsonElement, etc.)
6. **Atualizado AuthService** para usar MongoDB
7. **Atualizado ProjectsController** para usar MongoDB

## ⚠️ Controllers Pendentes

Os seguintes controllers precisam ser reescritos para MongoDB (têm muitas queries complexas do EF Core):

- ActivitiesController
- ElementsController
- MappingsController
- ModelsController
- ProgressController
- SimulationController

## 🚀 Para Deploy Rápido

**Opção 1 - API Mínima (Recomendado para deploy rápido)**:
Comentar os controllers problemáticos e fazer deploy apenas com Auth e Projects funcionando.

**Opção 2 - Manter PostgreSQL por enquanto**:
Reverter as alterações e manter PostgreSQL até ter tempo para migrar todos os controllers.

## 📝 Connection String MongoDB

```
mongodb+srv://nicolasrosaab_db_user:Gio4EAQhbEdQMISl@cluster0.npuhras.mongodb.net/?retryWrites=true&w=majority
```

Database: `shancrys`

## 🔧 Próximos Passos

Se quiser continuar com MongoDB:

1. Reescrever os controllers restantes usando `IMongoDbContext`
2. Substituir `.Where()`, `.Include()`, `.FirstOrDefaultAsync()` por equivalentes do MongoDB
3. Usar `InsertOneAsync()` ao invés de `.Add()` e `.SaveChangesAsync()`
4. Usar filtros do MongoDB: `Builders<T>.Filter`
