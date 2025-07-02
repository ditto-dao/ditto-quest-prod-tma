// Static assets cache (preloaded at app startup)
const staticImageCache = new Map<string, HTMLImageElement>();

// Dynamic backend URIs cache (cached on first load)
const dynamicImageCache = new Map<string, HTMLImageElement>();

// Track if static images are preloaded
let staticImagesLoaded = false;

/**
 * Preload static images at app startup
 * Call this once in your App.tsx or main component
 */
export async function preloadStaticImages(): Promise<void> {
    if (staticImagesLoaded) return;

    // Import all static images from your assets folder
    const imageModules = import.meta.glob('/src/assets/**/*.{png,webp,jpg,jpeg,gif,svg}', { eager: true });

    const preloadPromises = Object.entries(imageModules).map(([path, module]) => {
        return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
                staticImageCache.set((module as any).default, img);
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to preload static image: ${path}`);
                resolve(); // Still resolve to not block
            };
            img.src = (module as any).default;
        });
    });

    await Promise.all(preloadPromises);
    staticImagesLoaded = true;
    console.log(`✅ Preloaded ${staticImageCache.size} static images`);
}

/**
 * Enhanced preload function with caching (replaces your current preloadImage)
 * Works for both static assets and backend URIs
 */
export function preloadImageCached(src: string): Promise<HTMLImageElement> {
    // Check static cache first
    if (staticImageCache.has(src)) {
        return Promise.resolve(staticImageCache.get(src)!);
    }

    // Check dynamic cache
    if (dynamicImageCache.has(src)) {
        return Promise.resolve(dynamicImageCache.get(src)!);
    }

    // Not cached, load and cache it
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Cache in dynamic cache (for backend URIs)
            dynamicImageCache.set(src, img);
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            reject(new Error(`Failed to load: ${src}`));
        };
        img.src = src;
    });
}

/**
 * Batch preload multiple images (for your offline progress notifications)
 */
export async function preloadImagesBatch(sources: string[]): Promise<HTMLImageElement[]> {
    const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
    return Promise.all(uniqueSources.map(preloadImageCached));
}

/**
 * Get cached image directly (for FastImage component)
 */
export function getCachedImage(src: string): HTMLImageElement | null {
    return staticImageCache.get(src) || dynamicImageCache.get(src) || null;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return {
        staticCacheSize: staticImageCache.size,
        dynamicCacheSize: dynamicImageCache.size,
        staticLoaded: staticImagesLoaded,
        totalCached: staticImageCache.size + dynamicImageCache.size
    };
}

/**
 * Clear dynamic cache (useful for memory management)
 */
export function clearDynamicCache(): void {
    dynamicImageCache.clear();
    console.log('🗑️ Dynamic image cache cleared');
}

/**
 * Check if an image is cached
 */
export function isImageCached(src: string): boolean {
    return staticImageCache.has(src) || dynamicImageCache.has(src);
}