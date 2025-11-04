# 🚀 COMANDOS PRONTOS - Cole e Execute

## DEPOIS DE CRIAR O REPO NO GITHUB, EXECUTE:

# 1. Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/shancrys.git

# 2. Push do código
git push -u origin main

# 3. Login Azure
az login

# 4. Criar Resource Group
az group create --name shancrys-rg --location eastus2

# 5. Preview do deploy (opcional - ver o que será criado)
az deployment group what-if --resource-group shancrys-rg --template-file infra/main.bicep --parameters infra/main.parameters.json

# 6. Deploy REAL (CRIA TUDO - 5-10 minutos)
az deployment group create --resource-group shancrys-rg --template-file infra/main.bicep --parameters infra/main.parameters.json --output json | Out-File -Encoding UTF8 deployment-output.json

# 7. Pegar URLs e nomes dos recursos
$deployment = Get-Content deployment-output.json | ConvertFrom-Json
$apiUrl = $deployment.properties.outputs.apiUrl.value
$devtoolsUrl = $deployment.properties.outputs.devtoolsUrl.value
$apiName = ($apiUrl -split "//")[1].Split('.')[0]
$swaName = ($devtoolsUrl -split "//")[1].Split('.')[0]

Write-Host "API: $apiUrl" -ForegroundColor Green
Write-Host "DevTools: $devtoolsUrl" -ForegroundColor Green
Write-Host "API Name: $apiName" -ForegroundColor Yellow
Write-Host "SWA Name: $swaName" -ForegroundColor Yellow

# 8. Pegar credenciais para GitHub Secrets
az webapp deployment list-publishing-profiles --name $apiName --resource-group shancrys-rg --xml | Out-File -Encoding UTF8 publish-profile.xml
az staticwebapp secrets list --name $swaName --resource-group shancrys-rg --query "properties.apiKey" -o tsv | Out-File -Encoding UTF8 swa-token.txt

Write-Host "`nARQUIVOS CRIADOS:" -ForegroundColor Cyan
Write-Host "  - publish-profile.xml (cole em AZURE_WEBAPP_PUBLISH_PROFILE)" -ForegroundColor White
Write-Host "  - swa-token.txt (cole em AZURE_STATIC_WEB_APPS_API_TOKEN)" -ForegroundColor White
Write-Host "  - API_URL = $apiUrl" -ForegroundColor White

Write-Host "`nPROXIMO PASSO:" -ForegroundColor Yellow
Write-Host "  Va em: https://github.com/SEU_USUARIO/shancrys/settings/secrets/actions" -ForegroundColor White
Write-Host "  Configure os 3 secrets acima" -ForegroundColor White
Write-Host "  Depois dispare os workflows!" -ForegroundColor White
