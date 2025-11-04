# Script de Setup Automático - Shancrys Local
# Executa configuração inicial sem Docker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shancrys 4D - Setup Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Este script precisa ser executado como Administrador" -ForegroundColor Yellow
    Write-Host "   Clique com botão direito no PowerShell e escolha 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 1. Verificar PostgreSQL
Write-Host "1️⃣  Verificando PostgreSQL..." -ForegroundColor Yellow

$pgService = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue

if ($null -eq $pgService) {
    Write-Host "   ❌ PostgreSQL não encontrado" -ForegroundColor Red
    Write-Host "   📥 Instale de: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "   ▶️  Iniciando PostgreSQL..." -ForegroundColor Green
    try {
        Start-Service postgresql-x64-16
        Start-Sleep -Seconds 3
        Write-Host "   ✅ PostgreSQL iniciado" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Erro ao iniciar PostgreSQL: $_" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}
else {
    Write-Host "   ✅ PostgreSQL já está rodando" -ForegroundColor Green
}

Write-Host ""

# 2. Criar Database
Write-Host "2️⃣  Configurando database..." -ForegroundColor Yellow

$dbPassword = Read-Host "   Digite a senha do usuário 'postgres'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$env:PGPASSWORD = $plainPassword

# Testar conexão
$testConnection = psql -U postgres -h localhost -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Senha incorreta ou PostgreSQL não acessível" -ForegroundColor Red
    $env:PGPASSWORD = $null
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se database existe
$dbExists = psql -U postgres -h localhost -lqt 2>&1 | Select-String -Pattern "shancrys"

if ($null -eq $dbExists) {
    Write-Host "   📦 Criando database 'shancrys'..." -ForegroundColor Green
    psql -U postgres -h localhost -c "CREATE DATABASE shancrys;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database criada com sucesso" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Erro ao criar database" -ForegroundColor Red
        $env:PGPASSWORD = $null
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}
else {
    Write-Host "   ✅ Database 'shancrys' já existe" -ForegroundColor Green
}

$env:PGPASSWORD = $null
Write-Host ""

# 3. Atualizar appsettings.json
Write-Host "3️⃣  Atualizando configuração da API..." -ForegroundColor Yellow

$appsettingsPath = "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api\appsettings.json"

if (Test-Path $appsettingsPath) {
    $appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
    $appsettings.ConnectionStrings.DefaultConnection = "Host=localhost;Port=5432;Database=shancrys;Username=postgres;Password=$plainPassword"
    
    $appsettings | ConvertTo-Json -Depth 10 | Set-Content $appsettingsPath
    Write-Host "   ✅ Connection string atualizada" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Arquivo appsettings.json não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# 4. Aplicar Migrations
Write-Host "4️⃣  Aplicando migrations..." -ForegroundColor Yellow

Set-Location "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api"

# Verificar se dotnet-ef está instalado
$efInstalled = dotnet tool list --global | Select-String "dotnet-ef"

if ($null -eq $efInstalled) {
    Write-Host "   📦 Instalando dotnet-ef..." -ForegroundColor Green
    dotnet tool install --global dotnet-ef
}

Write-Host "   🔄 Criando migration inicial..." -ForegroundColor Green
dotnet ef migrations add InitialCreate --force 2>&1 | Out-Null

Write-Host "   🔄 Aplicando migration no banco..." -ForegroundColor Green
$migrationResult = dotnet ef database update 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migrations aplicadas com sucesso" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Aviso: $migrationResult" -ForegroundColor Yellow
}

Write-Host ""

# 5. Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Setup Concluído!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para executar a API:" -ForegroundColor White
Write-Host "  cd 'd:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api'" -ForegroundColor Yellow
Write-Host "  dotnet run" -ForegroundColor Yellow
Write-Host ""
Write-Host "API estará disponível em:" -ForegroundColor White
Write-Host "  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host ""

$runNow = Read-Host "Deseja executar a API agora? (s/n)"

if ($runNow -eq "s" -or $runNow -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando API..." -ForegroundColor Green
    Write-Host "   Pressione Ctrl+C para parar" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 2
    dotnet run
}
else {
    Write-Host ""
    Write-Host "👍 Tudo pronto! Execute 'dotnet run' quando quiser iniciar." -ForegroundColor Green
}
