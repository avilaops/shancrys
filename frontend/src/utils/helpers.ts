/**
 * Utility functions for formatting and display
 */

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with thousands separator
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @param locale - Locale string (default: current i18n locale or 'pt-BR')
 */
export function formatNumber(num: number, decimals: number = 0, locale?: string): string {
    const currentLocale = locale || (typeof window !== 'undefined' && window.localStorage.getItem('i18nextLng')) || 'pt-BR';
    return new Intl.NumberFormat(currentLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Format date with locale support
 * @param date - Date to format
 * @param format - Format type ('short', 'long', 'time')
 * @param locale - Locale string (default: current i18n locale or 'pt-BR')
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short', locale?: string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const currentLocale = locale || (typeof window !== 'undefined' && window.localStorage.getItem('i18nextLng')) || 'pt-BR';

    switch (format) {
        case 'short':
            return d.toLocaleDateString(currentLocale);
        case 'long':
            return d.toLocaleDateString(currentLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        case 'time':
            return d.toLocaleTimeString(currentLocale, {
                hour: '2-digit',
                minute: '2-digit',
            });
        default:
            return d.toLocaleDateString(currentLocale);
    }
}

/**
 * Format currency with locale support
 * @param value - Amount to format
 * @param locale - Locale string (default: current i18n locale or 'pt-BR')
 * @param currency - Currency code (default: based on locale)
 */
export function formatCurrency(value: number, locale?: string, currency?: string): string {
    const currentLocale = locale || (typeof window !== 'undefined' && window.localStorage.getItem('i18nextLng')) || 'pt-BR';
    const currencyCode = currency || (currentLocale === 'pt-BR' ? 'BRL' : currentLocale === 'es-ES' ? 'EUR' : 'USD');

    return new Intl.NumberFormat(currentLocale, {
        style: 'currency',
        currency: currencyCode,
    }).format(value);
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}

/**
 * Generate random color in hex format
 */
export function randomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Check if arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
    return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Download file from blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if browser supports feature
 */
export function checkBrowserSupport(): {
    webgl: boolean;
    indexedDB: boolean;
    workers: boolean;
    webAssembly: boolean;
} {
    return {
        webgl: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(
                    canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
                );
            } catch {
                return false;
            }
        })(),
        indexedDB: 'indexedDB' in window,
        workers: 'Worker' in window,
        webAssembly: 'WebAssembly' in window,
    };
}
