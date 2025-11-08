// Script de inicialização do MongoDB para Shancrys
// Este script cria o banco de dados, coleções e índices necessários
// Executado automaticamente na primeira inicialização do container

// Obter variáveis de ambiente (se disponíveis)
const APP_USER = process.env.MONGODB_APP_USER || 'shancrys_app';
const APP_PASSWORD = process.env.MONGODB_APP_PASSWORD || 'shancrys_app_2024';
const DB_NAME = process.env.MONGODB_DATABASE || 'shancrys';

print('================================================');
print('?? Iniciando setup do MongoDB - Shancrys');
print('================================================\n');

// Conectar ao banco admin para criar usuário da aplicação
db = db.getSiblingDB('admin');

// Criar usuário da aplicação (se não existir)
try {
    const userExists = db.getUser(APP_USER);
    if (userExists) {
        print(`??  Usuário ${APP_USER} já existe, pulando criação...`);
    } else {
        db.createUser({
            user: APP_USER,
        pwd: APP_PASSWORD,
   roles: [
  {
    role: 'readWrite',
db: DB_NAME
            },
     {
      role: 'dbAdmin',
db: DB_NAME
                }
            ]
  });
      print(`? Usuário ${APP_USER} criado com sucesso`);
    }
} catch (e) {
    print(`??  Erro ao criar usuário: ${e.message}`);
}

// Conectar ao banco shancrys
db = db.getSiblingDB(DB_NAME);

print(`\n?? Criando coleções no banco "${DB_NAME}"...`);

// Criar coleções com validação de schema
const collections = {
    users: {
        validator: {
    $jsonSchema: {
          bsonType: 'object',
             required: ['email', 'tenantId', 'passwordHash', 'role'],
      properties: {
            email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
  tenantId: { bsonType: 'objectId' },
   passwordHash: { bsonType: 'string' },
          firstName: { bsonType: 'string' },
      lastName: { bsonType: 'string' },
   role: { enum: ['admin', 'manager', 'planner', 'field', 'financial', 'reader'] },
   active: { bsonType: 'bool' },
 emailConfirmed: { bsonType: 'bool' },
             createdAt: { bsonType: 'date' },
       updatedAt: { bsonType: 'date' }
         }
            }
      }
    },
    tenants: {
        validator: {
        $jsonSchema: {
     bsonType: 'object',
            required: ['name', 'slug', 'plan'],
properties: {
            name: { bsonType: 'string' },
   slug: { bsonType: 'string', pattern: '^[a-z0-9-]+$' },
       plan: { enum: ['free', 'trial', 'starter', 'professional', 'enterprise'] },
       active: { bsonType: 'bool' }
              }
            }
        }
    },
    projects: {},
    elements: {},
    activities: {},
    subscriptions: {},
    invoices: {},
    models: {}
};

Object.keys(collections).forEach(collectionName => {
    try {
        const existing = db.getCollectionNames().includes(collectionName);
        if (existing) {
       print(`  ??  Coleção ${collectionName} já existe`);
        } else {
            const opts = collections[collectionName];
            db.createCollection(collectionName, opts);
        print(`  ? Coleção ${collectionName} criada`);
        }
    } catch (e) {
      print(`  ? Erro na coleção ${collectionName}: ${e.message}`);
    }
});

print('\n?? Criando índices...');

// Criar índices para users
try {
    db.users.createIndex({ "email": 1 }, { unique: true, sparse: true });
    db.users.createIndex({ "tenantId": 1 });
    db.users.createIndex({ "tenantId": 1, "email": 1 }, { unique: true });
    db.users.createIndex({ "role": 1 });
    db.users.createIndex({ "active": 1 });
    db.users.createIndex({ "createdAt": -1 });
    print('  ? Índices criados para users (6)');
} catch (e) {
    print(`  ??  Índices users: ${e.message}`);
}

// Criar índices para tenants
try {
    db.tenants.createIndex({ "slug": 1 }, { unique: true });
    db.tenants.createIndex({ "ownerId": 1 });
    db.tenants.createIndex({ "plan": 1 });
    db.tenants.createIndex({ "active": 1 });
    print('  ? Índices criados para tenants (4)');
} catch (e) {
    print(`  ??  Índices tenants: ${e.message}`);
}

// Criar índices para projects
try {
    db.projects.createIndex({ "tenantId": 1 });
    db.projects.createIndex({ "tenantId": 1, "code": 1 }, { unique: true });
    db.projects.createIndex({ "status": 1 });
    db.projects.createIndex({ "createdAt": -1 });
    db.projects.createIndex({ "startDate": 1, "endDate": 1 });
    print('  ? Índices criados para projects (5)');
} catch (e) {
    print(`  ??  Índices projects: ${e.message}`);
}

// Criar índices para elements
try {
    db.elements.createIndex({ "projectId": 1 });
    db.elements.createIndex({ "tenantId": 1 });
    db.elements.createIndex({ "ifcGuid": 1 });
    db.elements.createIndex({ "projectId": 1, "ifcGuid": 1 }, { unique: true, sparse: true });
    db.elements.createIndex({ "type": 1 });
    db.elements.createIndex({ "level": 1 });
    print('  ? Índices criados para elements (6)');
} catch (e) {
    print(`  ??  Índices elements: ${e.message}`);
}

// Criar índices para activities
try {
    db.activities.createIndex({ "projectId": 1 });
    db.activities.createIndex({ "tenantId": 1 });
 db.activities.createIndex({ "projectId": 1, "code": 1 }, { unique: true });
    db.activities.createIndex({ "startDate": 1 });
    db.activities.createIndex({ "endDate": 1 });
    db.activities.createIndex({ "status": 1 });
    db.activities.createIndex({ "parentId": 1 });
    print('  ? Índices criados para activities (7)');
} catch (e) {
    print(`  ??  Índices activities: ${e.message}`);
}

// Criar índices para subscriptions
try {
 db.subscriptions.createIndex({ "tenantId": 1 }, { unique: true });
    db.subscriptions.createIndex({ "stripeSubscriptionId": 1 }, { unique: true, sparse: true });
    db.subscriptions.createIndex({ "status": 1 });
    db.subscriptions.createIndex({ "currentPeriodEnd": 1 });
    print('  ? Índices criados para subscriptions (4)');
} catch (e) {
    print(`  ??  Índices subscriptions: ${e.message}`);
}

// Criar índices para models
try {
    db.models.createIndex({ "projectId": 1 });
    db.models.createIndex({ "tenantId": 1 });
    db.models.createIndex({ "version": 1 });
    db.models.createIndex({ "uploadedAt": -1 });
    db.models.createIndex({ "projectId": 1, "version": 1 }, { unique: true });
    print('  ? Índices criados para models (5)');
} catch (e) {
  print(`  ??  Índices models: ${e.message}`);
}

// NÃO inserir dados de exemplo em produção
if (process.env.ASPNETCORE_ENVIRONMENT !== 'Production') {
    print('\n?? Inserindo dados de exemplo (ambiente DEV)...');
    
    if (db.tenants.countDocuments() === 0) {
        // Tenant de exemplo
   const tenantId = new ObjectId();
   db.tenants.insertOne({
  _id: tenantId,
    name: 'Empresa Demo',
            slug: 'empresa-demo',
            ownerId: null,
    plan: 'trial',
 maxProjects: 5,
            maxUsers: 10,
     features: ['4d-pro', 'control'],
       active: true,
            createdAt: new Date(),
      updatedAt: new Date()
        });
      
        print('  ? Tenant de exemplo criado');
      
    // Usuário admin de exemplo
        db.users.insertOne({
   _id: new ObjectId(),
            tenantId: tenantId,
            email: 'admin@demo.com',
  // Senha: Admin@123 (TROCAR em produção!)
   passwordHash: '$2a$11$example.hash.replace.with.real',
            firstName: 'Admin',
        lastName: 'Demo',
      role: 'admin',
        active: true,
         emailConfirmed: true,
            createdAt: new Date(),
            updatedAt: new Date()
  });
        
        print('  ? Usuário admin de exemplo criado (admin@demo.com)');
    } else {
        print('  ??  Dados já existem, pulando inserção de exemplos');
    }
} else {
    print('\n??  Ambiente de PRODUÇÃO - dados de exemplo NÃO inseridos');
}

print('\n?? Estatísticas finais:');
print('================================================');
const stats = {
    database: DB_NAME,
    collections: db.getCollectionNames().length,
    totalDocuments: 0,
    totalIndexes: 0
};

db.getCollectionNames().forEach(name => {
    const count = db.getCollection(name).countDocuments();
    const indexes = db.getCollection(name).getIndexes().length;
    stats.totalDocuments += count;
    stats.totalIndexes += indexes;
    print(`  ${name.padEnd(20)} ? ${count} docs, ${indexes} índices`);
});

print('================================================');
print(`Total: ${stats.collections} collections, ${stats.totalDocuments} documentos, ${stats.totalIndexes} índices`);
print('\n?? Inicialização do MongoDB concluída com sucesso!\n');
