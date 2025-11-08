/**
 * IFC Cache Manager using IndexedDB
 * Stores processed IFC files to avoid reprocessing on subsequent loads
 */

const DB_NAME = 'ShancrysIFCCache';
const DB_VERSION = 1;
const STORE_NAME = 'ifcFiles';
const MAX_CACHE_SIZE_MB = 500; // Maximum cache size in MB
const CACHE_EXPIRY_DAYS = 30; // Cache expiry in days

export interface CachedIFCFile {
    id: string; // File hash or unique identifier
    fileName: string;
    fileSize: number;
    lastModified: number;
    cachedAt: number;
    data: {
        projectName: string;
        projectDescription: string;
        elements: Array<{
            expressID: number;
            type: string;
            ifcType: number;
            guid: string;
            name: string;
            description: string;
            properties: Record<string, string | number | boolean | null>;
            geometry?: {
                vertices: ArrayLike<number>;
                indices: ArrayLike<number>;
                normals?: ArrayLike<number>;
            };
        }>;
        spatialStructure: Array<{
            expressID: number;
            type: string;
            name: string;
            children: Array<{
                expressID: number;
                type: string;
                name: string;
                children: unknown[];
                elements: number[];
            }>;
            elements: number[];
        }>;
        materials: [number, string][];
        types: [number, string][];
    };
}

class IFCCacheManager {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize IndexedDB connection
     */
    async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('fileName', 'fileName', { unique: false });
                    store.createIndex('cachedAt', 'cachedAt', { unique: false });
                    store.createIndex('lastModified', 'lastModified', { unique: false });
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Generate a unique hash for a file based on name, size, and last modified date
     */
    private generateFileHash(file: File): string {
        return `${file.name}_${file.size}_${file.lastModified}`;
    }

    /**
     * Check if a file exists in cache and is still valid
     */
    async has(file: File): Promise<boolean> {
        await this.init();
        const hash = this.generateFileHash(file);

        try {
            const cached = await this.get(file);
            if (!cached) return false;

            // Check if cache is expired
            const expiryTime = cached.cachedAt + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
            if (Date.now() > expiryTime) {
                await this.remove(hash);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking cache:', error);
            return false;
        }
    }

    /**
     * Get cached IFC file data
     */
    async get(file: File): Promise<CachedIFCFile | null> {
        await this.init();
        if (!this.db) throw new Error('IndexedDB not initialized');

        const hash = this.generateFileHash(file);

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(hash);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Error getting cached file:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Store IFC file data in cache
     */
    async set(file: File, data: CachedIFCFile['data']): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('IndexedDB not initialized');

        const hash = this.generateFileHash(file);

        // Check cache size before adding
        await this.ensureCacheSize();

        const cachedFile: CachedIFCFile = {
            id: hash,
            fileName: file.name,
            fileSize: file.size,
            lastModified: file.lastModified,
            cachedAt: Date.now(),
            data,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(cachedFile);

            request.onsuccess = () => {
                console.log(`IFC file cached: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                resolve();
            };

            request.onerror = () => {
                console.error('Error caching file:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Remove a specific cached file
     */
    async remove(fileHash: string): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('IndexedDB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(fileHash);

            request.onsuccess = () => {
                console.log(`Removed cached file: ${fileHash}`);
                resolve();
            };

            request.onerror = () => {
                console.error('Error removing cached file:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all cached files
     */
    async getAll(): Promise<CachedIFCFile[]> {
        await this.init();
        if (!this.db) throw new Error('IndexedDB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('Error getting all cached files:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        count: number;
        totalSizeMB: number;
        files: Array<{ name: string; sizeMB: number; cachedAt: Date }>;
    }> {
        const cached = await this.getAll();
        const totalSize = cached.reduce((sum, file) => sum + file.fileSize, 0);

        return {
            count: cached.length,
            totalSizeMB: totalSize / 1024 / 1024,
            files: cached.map(file => ({
                name: file.fileName,
                sizeMB: file.fileSize / 1024 / 1024,
                cachedAt: new Date(file.cachedAt),
            })),
        };
    }

    /**
     * Ensure cache size doesn't exceed maximum
     * Remove oldest files if necessary
     */
    private async ensureCacheSize(): Promise<void> {
        const stats = await this.getStats();

        if (stats.totalSizeMB > MAX_CACHE_SIZE_MB) {
            console.warn(`Cache size (${stats.totalSizeMB.toFixed(2)} MB) exceeds limit (${MAX_CACHE_SIZE_MB} MB). Cleaning up...`);

            // Get all files sorted by cache date (oldest first)
            const cached = await this.getAll();
            cached.sort((a, b) => a.cachedAt - b.cachedAt);

            // Remove oldest files until we're under the limit
            let currentSize = stats.totalSizeMB;
            for (const file of cached) {
                if (currentSize <= MAX_CACHE_SIZE_MB * 0.8) break; // Leave 20% buffer

                await this.remove(file.id);
                currentSize -= file.fileSize / 1024 / 1024;
            }

            console.log(`Cache cleaned up. New size: ${currentSize.toFixed(2)} MB`);
        }
    }

    /**
     * Clear all cached files
     */
    async clear(): Promise<void> {
        await this.init();
        if (!this.db) throw new Error('IndexedDB not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('Cache cleared');
                resolve();
            };

            request.onerror = () => {
                console.error('Error clearing cache:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Remove expired cache entries
     */
    async cleanExpired(): Promise<number> {
        const cached = await this.getAll();
        const now = Date.now();
        const expiryDuration = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        let removed = 0;
        for (const file of cached) {
            if (now - file.cachedAt > expiryDuration) {
                await this.remove(file.id);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`Removed ${removed} expired cache entries`);
        }

        return removed;
    }
}

// Export singleton instance
export const ifcCache = new IFCCacheManager();

// Initialize on load
ifcCache.init().catch(console.error);

// Clean expired entries on load
ifcCache.cleanExpired().catch(console.error);
