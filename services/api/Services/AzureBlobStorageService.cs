using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;

namespace Shancrys.Api.Services;

public class AzureBlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;
    private readonly ILogger<AzureBlobStorageService> _logger;

    public AzureBlobStorageService(
        IConfiguration configuration,
        ILogger<AzureBlobStorageService> logger)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"] 
            ?? throw new InvalidOperationException("Azure Storage connection string not configured");
        
        _containerName = configuration["AzureStorage:ContainerName"] ?? "shancrys-models";
        _blobServiceClient = new BlobServiceClient(connectionString);
        _logger = logger;

        // Criar container se não existir
        EnsureContainerExistsAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureContainerExistsAsync()
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            _logger.LogInformation("Container {ContainerName} verificado/criado", _containerName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar container {ContainerName}", _containerName);
            throw;
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string blobName, string contentType)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            };

            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            });

            _logger.LogInformation("Arquivo {BlobName} enviado para Azure Blob Storage", blobName);

            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer upload do blob {BlobName}", blobName);
            throw;
        }
    }

    public async Task<string> GetDownloadUrlAsync(string blobUrl, TimeSpan expiryTime)
    {
        try
        {
            var blobUri = new Uri(blobUrl);
            var blobName = blobUri.Segments[^1]; // Último segmento da URL

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            // Verificar se o blob existe
            if (!await blobClient.ExistsAsync())
            {
                throw new FileNotFoundException($"Blob {blobName} não encontrado");
            }

            // Gerar SAS token
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = _containerName,
                BlobName = blobName,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
                ExpiresOn = DateTimeOffset.UtcNow.Add(expiryTime)
            };

            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasToken = blobClient.GenerateSasUri(sasBuilder);

            _logger.LogInformation("URL SAS gerada para blob {BlobName} válida por {ExpiryTime}", blobName, expiryTime);

            return sasToken.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar URL de download para {BlobUrl}", blobUrl);
            throw;
        }
    }

    public async Task DeleteFileAsync(string blobUrl)
    {
        try
        {
            var blobUri = new Uri(blobUrl);
            var blobName = blobUri.Segments[^1];

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            await blobClient.DeleteIfExistsAsync();

            _logger.LogInformation("Blob {BlobName} deletado", blobName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar blob {BlobUrl}", blobUrl);
            throw;
        }
    }

    public async Task<bool> FileExistsAsync(string blobName)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            return await blobClient.ExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar existência do blob {BlobName}", blobName);
            return false;
        }
    }
}
