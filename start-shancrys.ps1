# Shancrys - Script de Inicialização Completa
# Execute: .\start-shancrys.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     SHANCRYS - Plataforma 4D BIM               " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Verificar se está no diretório correto
if (-not (Test-Path ".\services\api\Shancrys.Api.csproj")) {
    Write-Host "❌ Execute este script da raiz do projeto Shancrys" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Iniciando Shancrys..." -ForegroundColor Green
Write-Host ""

# Função para verificar se uma porta está em uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Matar processos nas portas
Write-Host "🧹 Limpando portas..." -ForegroundColor Yellow
$ports = @(5000, 5001, 5173)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($proc in $processes) {
            Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Porta $port liberada" -ForegroundColor Gray
        }
    }
}
Start-Sleep -Seconds 2

# 1. API Backend
Write-Host ""
Write-Host "📡 1. Iniciando API Backend (.NET 8)..." -ForegroundColor Cyan
$apiPath = ".\services\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$apiPath'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `
    Write-Host '🔧 API Backend' -ForegroundColor Green; `
    Write-Host 'Porta: 5000/5001' -ForegroundColor Gray; `
    Write-Host ''; `
    dotnet run" -WindowStyle Normal
Write-Host "  ✓ API iniciada em nova janela" -ForegroundColor Green
Start-Sleep -Seconds 3

# 2. DevTools
Write-Host ""
Write-Host "🔍 2. Iniciando DevTools (Observabilidade)..." -ForegroundColor Cyan
$devtoolsPath = ".\devtools"

# Verificar se node_modules existe
if (-not (Test-Path "$devtoolsPath\node_modules")) {
    Write-Host "  📦 Instalando dependências..." -ForegroundColor Yellow
    Push-Location $devtoolsPath
    npm install --silent
    Pop-Location
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$devtoolsPath'; `
    Write-Host '🔍 DevTools - Observabilidade' -ForegroundColor Magenta; `
    Write-Host 'Porta: 5173' -ForegroundColor Gray; `
    Write-Host 'URL: http://localhost:5173' -ForegroundColor Cyan; `
    Write-Host ''; `
    npm run dev" -WindowStyle Normal
Write-Host "  ✓ DevTools iniciado em nova janela" -ForegroundColor Green
Start-Sleep -Seconds 2

# Aguardar serviços subirem
Write-Host ""
Write-Host "⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
$timeout = 30
$elapsed = 0
while ($elapsed -lt $timeout) {
    $apiReady = Test-Port 5000
    $devtoolsReady = Test-Port 5173
    
    if ($apiReady -and $devtoolsReady) {
        Write-Host "  ✓ Todos os serviços online!" -ForegroundColor Green
        break
    }
    
    Write-Host "  ⏳ $elapsed/$timeout segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
    $elapsed += 2
}

# Status Final
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     ✅ SHANCRYS ESTÁ RODANDO!                  " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 API Backend:" -ForegroundColor White
Write-Host "   • Swagger UI: " -NoNewline; Write-Host "http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "   • API Base:   " -NoNewline; Write-Host "http://localhost:5000/api/v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 DevTools (Observabilidade):" -ForegroundColor White
Write-Host "   • Dashboard:  " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Yellow
Write-Host "   • Pressione Ctrl+C nas janelas para parar" -ForegroundColor Gray
Write-Host "   • Use o DevTools para monitorar logs/métricas" -ForegroundColor Gray
Write-Host "   • API usa banco in-memory (sem PostgreSQL)" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Próximos Passos:" -ForegroundColor Cyan
Write-Host "   1. Abra DevTools: http://localhost:5173" -ForegroundColor White
Write-Host "   2. Registre usuário no Swagger" -ForegroundColor White
Write-Host "   3. Teste os endpoints da API" -ForegroundColor White
Write-Host ""

# Abrir navegadores
Write-Host "🌐 Abrindo navegadores..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
Start-Sleep -Seconds 1
Start-Process "http://localhost:5000/swagger"

Write-Host ""
Write-Host "✨ Pronto para usar! Pressione qualquer tecla para sair..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
