# Script para atualizar controllers para MongoDB

$controllers = @(
    "ActivitiesController.cs",
    "ElementsController.cs", 
    "MappingsController.cs",
    "ModelsController.cs",
    "ProgressController.cs",
    "SimulationController.cs"
)

$controllersPath = "d:\OneDrive - Avila DevOps\Dev Driver\Shancrys\services\api\Controllers"

foreach ($controller in $controllers) {
    $filePath = Join-Path $controllersPath $controller
    
    if (Test-Path $filePath) {
        Write-Host "Atualizando $controller..."
        
        $content = Get-Content $filePath -Raw
        
        # Substituir using EntityFrameworkCore por MongoDB.Driver
        $content = $content -replace 'using Microsoft\.EntityFrameworkCore;', 'using MongoDB.Driver;'
        
        # Substituir ShancrysDbContext por IMongoDbContext
        $content = $content -replace 'private readonly ShancrysDbContext _context;', 'private readonly IMongoDbContext _context;'
        $content = $content -replace 'ShancrysDbContext context,', 'IMongoDbContext context,'
        
        Set-Content $filePath $content -NoNewline
        
        Write-Host "  ✓ $controller atualizado"
    }
}

Write-Host ""
Write-Host "Todos os controllers foram atualizados!"
