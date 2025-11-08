namespace Shancrys.Api.Services;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string blobName, string contentType);
    Task<string> GetDownloadUrlAsync(string blobUrl, TimeSpan expiryTime);
    Task DeleteFileAsync(string blobUrl);
    Task<bool> FileExistsAsync(string blobName);
}
