# Shancrys - Script de Parada
# Execute: .\stop-shancrys.ps1

Write-Host "🛑 Parando Shancrys..." -ForegroundColor Yellow
Write-Host ""

# Matar processos nas portas
$ports = @(5000, 5001, 5173)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($proc in $processes) {
            $processInfo = Get-Process -Id $proc -ErrorAction SilentlyContinue
            Write-Host "  ✓ Parando processo na porta $port ($($processInfo.ProcessName))" -ForegroundColor Gray
            Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
        }
    }
    else {
        Write-Host "  • Porta $port já livre" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "✅ Shancrys parado com sucesso!" -ForegroundColor Green
