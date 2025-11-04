# Shancrys - Script de Deploy Completo no Azure
# Execute: .\deploy-azure.ps1

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory = $false)]
    [string]$Location = "eastus2",
    
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "shancrys-rg"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     SHANCRYS - Deploy Azure Completo            " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Location: $Location" -ForegroundColor White
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host ""

# Verificar Azure CLI
Write-Host "🔍 Verificando Azure CLI..." -ForegroundColor Yellow
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI não encontrado. Instale: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Azure CLI instalado" -ForegroundColor Green

# Verificar GitHub CLI
Write-Host "🔍 Verificando GitHub CLI..." -ForegroundColor Yellow
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  GitHub CLI não encontrado. Instalando..." -ForegroundColor Yellow
    winget install GitHub.cli
}
else {
    Write-Host "  ✓ GitHub CLI instalado" -ForegroundColor Green
}

# Login Azure
Write-Host ""
Write-Host "🔐 Fazendo login no Azure..." -ForegroundColor Cyan
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    az login
    $account = az account show | ConvertFrom-Json
}
Write-Host "  ✓ Logado como: $($account.user.name)" -ForegroundColor Green
Write-Host "  ✓ Subscription: $($account.name)" -ForegroundColor Green

# Criar Resource Group
Write-Host ""
Write-Host "📦 Criando Resource Group..." -ForegroundColor Cyan
$rg = az group exists --name $ResourceGroup
if ($rg -eq "false") {
    az group create --name $ResourceGroup --location $Location | Out-Null
    Write-Host "  ✓ Resource Group criado: $ResourceGroup" -ForegroundColor Green
}
else {
    Write-Host "  ✓ Resource Group já existe: $ResourceGroup" -ForegroundColor Green
}

# Deploy Bicep (Preview primeiro)
Write-Host ""
Write-Host "🔍 Validando infraestrutura Bicep..." -ForegroundColor Yellow
Write-Host "  (Isso pode levar 1-2 minutos)" -ForegroundColor Gray
$whatif = az deployment group what-if `
    --resource-group $ResourceGroup `
    --template-file infra/main.bicep `
    --parameters infra/main.parameters.json `
    --parameters environment=$Environment location=$Location

Write-Host ""
Write-Host "📋 Preview do Deploy:" -ForegroundColor Yellow
Write-Host $whatif -ForegroundColor Gray

Write-Host ""
$confirm = Read-Host "Deseja prosseguir com o deploy? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Deploy cancelado pelo usuário" -ForegroundColor Yellow
    exit 0
}

# Deploy Real
Write-Host ""
Write-Host "🚀 Fazendo deploy da infraestrutura..." -ForegroundColor Cyan
Write-Host "  (Isso pode levar 5-10 minutos)" -ForegroundColor Gray
$deployment = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file infra/main.bicep `
    --parameters infra/main.parameters.json `
    --parameters environment=$Environment location=$Location `
    --output json | ConvertFrom-Json

Write-Host "  ✓ Infraestrutura criada com sucesso!" -ForegroundColor Green

# Extrair outputs
$outputs = $deployment.properties.outputs
$apiUrl = $outputs.apiUrl.value
$devtoolsUrl = $outputs.devtoolsUrl.value
$apiName = ($apiUrl -split "//")[1].Split('.')[0]
$staticWebAppName = ($devtoolsUrl -split "//")[1].Split('.')[0]

Write-Host ""
Write-Host "📊 Recursos criados:" -ForegroundColor Cyan
Write-Host "  • API URL: " -NoNewline; Write-Host $apiUrl -ForegroundColor White
Write-Host "  • DevTools URL: " -NoNewline; Write-Host $devtoolsUrl -ForegroundColor White
Write-Host "  • PostgreSQL: " -NoNewline; Write-Host $outputs.postgresHost.value -ForegroundColor White
Write-Host "  • Storage: " -NoNewline; Write-Host $outputs.storageAccountName.value -ForegroundColor White
Write-Host "  • Key Vault: " -NoNewline; Write-Host $outputs.keyVaultName.value -ForegroundColor White

# Obter credenciais
Write-Host ""
Write-Host "🔐 Obtendo credenciais de deploy..." -ForegroundColor Cyan

Write-Host "  📡 API Publish Profile..." -ForegroundColor Yellow
$publishProfile = az webapp deployment list-publishing-profiles `
    --name $apiName `
    --resource-group $ResourceGroup `
    --xml

Write-Host "  🌐 Static Web App Token..." -ForegroundColor Yellow
$swaToken = az staticwebapp secrets list `
    --name $staticWebAppName `
    --resource-group $ResourceGroup `
    --query "properties.apiKey" -o tsv

Write-Host "  ✓ Credenciais obtidas" -ForegroundColor Green

# Configurar GitHub
Write-Host ""
Write-Host "🐙 Configurando GitHub..." -ForegroundColor Cyan

# Login GitHub
$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  🔐 Fazendo login no GitHub..." -ForegroundColor Yellow
    gh auth login
}
Write-Host "  ✓ Logado no GitHub" -ForegroundColor Green

# Criar repositório (se não existir)
$repoExists = gh repo view 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  📦 Criando repositório..." -ForegroundColor Yellow
    $repoName = Read-Host "  Nome do repositório (default: shancrys)"
    if ([string]::IsNullOrWhiteSpace($repoName)) { $repoName = "shancrys" }
    
    $visibility = Read-Host "  Visibilidade (public/private, default: public)"
    if ([string]::IsNullOrWhiteSpace($visibility)) { $visibility = "public" }
    
    gh repo create $repoName --$visibility --source=. --remote=origin --push
    Write-Host "  ✓ Repositório criado" -ForegroundColor Green
}
else {
    Write-Host "  ✓ Repositório já existe" -ForegroundColor Green
}

# Configurar Secrets
Write-Host "  🔑 Configurando secrets..." -ForegroundColor Yellow

$publishProfile | gh secret set AZURE_WEBAPP_PUBLISH_PROFILE
Write-Host "    ✓ AZURE_WEBAPP_PUBLISH_PROFILE" -ForegroundColor Gray

$swaToken | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
Write-Host "    ✓ AZURE_STATIC_WEB_APPS_API_TOKEN" -ForegroundColor Gray

$apiUrl | gh secret set API_URL
Write-Host "    ✓ API_URL" -ForegroundColor Gray

Write-Host "  ✓ Secrets configurados" -ForegroundColor Green

# Push para disparar workflows
Write-Host ""
Write-Host "🚀 Fazendo push para disparar CI/CD..." -ForegroundColor Cyan
git push origin main 2>&1 | Out-Null
Write-Host "  ✓ Push realizado" -ForegroundColor Green

# Acompanhar workflows
Write-Host ""
Write-Host "⏳ Aguardando workflows iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📊 Status dos workflows:" -ForegroundColor Cyan
gh run list --limit 3

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     ✅ DEPLOY COMPLETO!                         " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URLs da Aplicação:" -ForegroundColor White
Write-Host "   • API Swagger: " -NoNewline; Write-Host "$apiUrl/swagger" -ForegroundColor Cyan
Write-Host "   • API Base:    " -NoNewline; Write-Host "$apiUrl/api/v1" -ForegroundColor Cyan
Write-Host "   • DevTools:    " -NoNewline; Write-Host $devtoolsUrl -ForegroundColor Magenta
Write-Host ""
Write-Host "📊 Portal Azure:" -ForegroundColor White
Write-Host "   • Resource Group: " -NoNewline
Write-Host "https://portal.azure.com/#@/resource/subscriptions/$($account.id)/resourceGroups/$ResourceGroup" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Acompanhar Workflows:" -ForegroundColor White
Write-Host "   gh run list" -ForegroundColor Gray
Write-Host "   gh run watch" -ForegroundColor Gray
Write-Host "   gh run view --log" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Proximos Passos:" -ForegroundColor Yellow
Write-Host "   1. Aguarde workflows finalizarem (5-10 min)" -ForegroundColor White
Write-Host "   2. Acesse o Swagger e teste a API" -ForegroundColor White
Write-Host "   3. Abra o DevTools para monitoramento" -ForegroundColor White
Write-Host "   4. Configure dominio customizado (opcional)" -ForegroundColor White
Write-Host ""
Write-Host "Shancrys esta no ar!" -ForegroundColor Green
Write-Host ""

# Abrir URLs
Write-Host "Abrindo navegadores..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "https://portal.azure.com/#@/resource/subscriptions/$($account.id)/resourceGroups/$ResourceGroup"
Start-Process "https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
