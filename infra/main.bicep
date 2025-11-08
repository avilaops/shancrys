// Shancrys 4D BIM Platform - Azure Infrastructure
// Deploys: Container App (API), Static Web App (DevTools), Azure Storage, Container Registry, Observability stack

targetScope = 'resourceGroup'

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('Azure region for all resources deployed by this template.')
param location string = resourceGroup().location

@description('Suffix used to guarantee global resource name uniqueness.')
param uniqueSuffix string = uniqueString(resourceGroup().id)

@description('Connection string used by the API to connect to MongoDB.')
@secure()
param mongoConnectionString string

@description('MongoDB database name used by the API.')
param mongoDatabaseName string = 'shancrys'

@description('Secret key used to sign JWT tokens (minimum 32 characters).')
@secure()
param jwtSecret string

@description('RabbitMQ host name accessed by the API.')
param rabbitMqHost string = 'rabbitmq'

@description('RabbitMQ username used by the API.')
param rabbitMqUser string = 'guest'

@description('RabbitMQ password used by the API.')
@secure()
param rabbitMqPassword string = ''

@description('RabbitMQ port used by the API.')
param rabbitMqPort int = 5672

@description('Stripe secret key (leave empty if Stripe is not configured).')
@secure()
param stripeSecretKey string = ''

@description('Stripe publishable key (leave empty if Stripe is not configured).')
@secure()
param stripePublishableKey string = ''

@description('Stripe webhook signing secret (leave empty if Stripe is not configured).')
@secure()
param stripeWebhookSecret string = ''

@description('Default currency code used with Stripe.')
param stripeCurrency string = 'brl'

@description('Indicates whether Stripe test mode is enabled.')
param stripeEnableTestMode bool = true

@description('Container image tag to deploy for the API.')
param apiImageTag string = 'latest'

@description('CPU cores reserved per replica for the API container.')
param apiCpu string = environment == 'prod' ? '1.0' : '0.5'

@description('Memory allocated per replica for the API container.')
param apiMemory string = environment == 'prod' ? '2Gi' : '1Gi'

@description('Minimum number of API replicas.')
param apiMinReplicas int = environment == 'prod' ? 2 : 1

@description('Maximum number of API replicas.')
param apiMaxReplicas int = environment == 'prod' ? 10 : 3

var appName = 'shancrys'
var suffix = '${environment}-${uniqueSuffix}'
var containerRegistryName = toLower('${appName}cr${environment}${take(uniqueSuffix, 6)}')
var containerAppName = '${appName}-api-${suffix}'
var containerAppEnvName = '${appName}-env-${suffix}'
var staticWebAppName = '${appName}-devtools-${suffix}'
var storageAccountName = toLower('${appName}st${environment}${take(uniqueSuffix, 6)}')
var storageContainerName = 'models'
var logAnalyticsName = '${appName}-logs-${suffix}'
var appInsightsName = '${appName}-insights-${suffix}'

var tags = {
  Environment: environment
  Application: 'Shancrys'
  ManagedBy: 'Bicep'
  CostCenter: 'Engineering'
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: containerRegistryName
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'Standard' : 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'Standard_ZRS' : 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
  }
}

resource storageBlobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {}
}

resource storageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: storageBlobService
  name: storageContainerName
  properties: {
    publicAccess: 'None'
  }
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 5000
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: concat(
        [
          {
            name: 'registry-password'
            value: containerRegistry.listCredentials().passwords[0].value
          }
          {
            name: 'mongodb-connection'
            value: mongoConnectionString
          }
          {
            name: 'jwt-secret'
            value: jwtSecret
          }
          {
            name: 'storage-connection'
            value: format('DefaultEndpointsProtocol=https;AccountName={0};AccountKey={1};EndpointSuffix={2}', storageAccount.name, storageAccount.listKeys().keys[0].value, az.environment().suffixes.storage)
          }
        ],
        !empty(rabbitMqPassword) ? [
          {
            name: 'rabbitmq-password'
            value: rabbitMqPassword
          }
        ] : [],
        !empty(stripeSecretKey) ? [
          {
            name: 'stripe-secret'
            value: stripeSecretKey
          }
          {
            name: 'stripe-publishable'
            value: stripePublishableKey
          }
          {
            name: 'stripe-webhook'
            value: stripeWebhookSecret
          }
        ] : []
      )
    }
    template: {
      containers: [
        {
          name: 'shancrys-api'
          image: '${containerRegistry.properties.loginServer}/shancrys-api:${apiImageTag}'
          resources: {
            cpu: json(apiCpu)
            memory: apiMemory
          }
          env: concat(
            [
              {
                name: 'ASPNETCORE_ENVIRONMENT'
                value: environment == 'prod' ? 'Production' : 'Development'
              }
              {
                name: 'MongoDb__ConnectionString'
                secretRef: 'mongodb-connection'
              }
              {
                name: 'MongoDb__DatabaseName'
                value: mongoDatabaseName
              }
              {
                name: 'JwtSettings__SecretKey'
                secretRef: 'jwt-secret'
              }
              {
                name: 'JwtSettings__Issuer'
                value: 'shancrys-api'
              }
              {
                name: 'JwtSettings__Audience'
                value: 'shancrys-clients'
              }
              {
                name: 'AzureStorage__ConnectionString'
                secretRef: 'storage-connection'
              }
              {
                name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
                value: appInsights.properties.ConnectionString
              }
            ],
            !empty(rabbitMqPassword) ? [
              {
                name: 'RabbitMQ__HostName'
                value: rabbitMqHost
              }
              {
                name: 'RabbitMQ__Port'
                value: string(rabbitMqPort)
              }
              {
                name: 'RabbitMQ__UserName'
                value: rabbitMqUser
              }
              {
                name: 'RabbitMQ__Password'
                secretRef: 'rabbitmq-password'
              }
            ] : [],
            !empty(stripeSecretKey) ? [
              {
                name: 'Stripe__SecretKey'
                secretRef: 'stripe-secret'
              }
              {
                name: 'Stripe__PublishableKey'
                secretRef: 'stripe-publishable'
              }
              {
                name: 'Stripe__WebhookSecret'
                secretRef: 'stripe-webhook'
              }
              {
                name: 'Stripe__Currency'
                value: stripeCurrency
              }
              {
                name: 'Stripe__EnableTestMode'
                value: string(stripeEnableTestMode)
              }
            ] : []
          )
        }
      ]
      scale: {
        minReplicas: apiMinReplicas
        maxReplicas: apiMaxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    repositoryUrl: 'https://github.com/avilaops/shancrys'
    branch: 'main'
    buildProperties: {
      appLocation: '/devtools'
      apiLocation: ''
      outputLocation: 'dist'
    }
  }
}

output apiUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output containerAppName string = containerApp.name
output devtoolsUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output storageAccountName string = storageAccount.name
output storageContainerName string = storageContainer.name
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output resourceGroupName string = resourceGroup().name
