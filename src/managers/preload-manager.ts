import {
    preloadStaticImages,
    preloadImagesBatch,
    getCacheStats,
    isImageCached
} from '../utils/image-cache';
import PixelOperatorFont from '../assets/fonts/PixelOperatorMono8-Bold.ttf';

interface PreloadProgress {
    staticImages: boolean;
    dynamicUserData: boolean;
    gameAssets: boolean;
    fonts: boolean;
    complete: boolean;
}

type ProgressCallback = (progress: PreloadProgress) => void;

class PreloadManager {
    private static instance: PreloadManager;
    private progress: PreloadProgress = {
        staticImages: false,
        dynamicUserData: false,
        gameAssets: false,
        fonts: false,
        complete: false
    };

    private progressCallbacks: ProgressCallback[] = [];

    static getInstance(): PreloadManager {
        if (!PreloadManager.instance) {
            PreloadManager.instance = new PreloadManager();
        }
        return PreloadManager.instance;
    }

    addProgressCallback(callback: ProgressCallback) {
        this.progressCallbacks.push(callback);
    }

    removeProgressCallback(callback: ProgressCallback) {
        this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    }

    private updateProgress() {
        this.progress.complete =
            this.progress.staticImages &&
            this.progress.dynamicUserData &&
            this.progress.gameAssets &&
            this.progress.fonts;

        this.progressCallbacks.forEach(callback => callback({ ...this.progress }));
    }

    async preloadEverything(userData?: any) {
        console.log('🚀 Starting comprehensive preload...');
        console.log('📊 Cache stats before:', getCacheStats());

        // Run all preloads in parallel
        await Promise.allSettled([
            this.preloadAllStaticImages(),
            this.preloadDynamicUserData(userData),
            this.preloadGameAssets(),
            this.preloadFonts()
        ]);

        console.log('✅ Comprehensive preload complete!');
        console.log('📊 Cache stats after:', getCacheStats());
    }

    private async preloadAllStaticImages() {
        try {
            await preloadStaticImages();
            this.progress.staticImages = true;
            this.updateProgress();
            console.log('✅ All static images preloaded via glob');
        } catch (error) {
            console.error('❌ Static images preload failed:', error);
            this.progress.staticImages = true; // Mark as done to not block
            this.updateProgress();
        }
    }

    private async preloadFonts() {
        try {
            // Preload the font using FontFace API
            const fontFace = new FontFace('PixelOperatorMono8', `url(${PixelOperatorFont})`);
            await fontFace.load();
            document.fonts.add(fontFace);

            this.progress.fonts = true;
            this.updateProgress();
            console.log('✅ Fonts preloaded');
        } catch (error) {
            console.error('❌ Font preload failed:', error);
            this.progress.fonts = true; // Mark as done to not block
            this.updateProgress();
        }
    }

    private async preloadDynamicUserData(userData?: any) {
        try {
            if (!userData) {
                this.progress.dynamicUserData = true;
                this.updateProgress();
                return;
            }

            const dynamicImages: string[] = [];

            // Avatar/Equipment images
            if (userData.equippedSlime?.imageUri) {
                dynamicImages.push(userData.equippedSlime.imageUri);
            }

            if (userData.hat?.equipment?.imgsrc) dynamicImages.push(userData.hat.equipment.imgsrc);
            if (userData.cape?.equipment?.imgsrc) dynamicImages.push(userData.cape.equipment.imgsrc);
            if (userData.necklace?.equipment?.imgsrc) dynamicImages.push(userData.necklace.equipment.imgsrc);
            if (userData.shield?.equipment?.imgsrc) dynamicImages.push(userData.shield.equipment.imgsrc);
            if (userData.armour?.equipment?.imgsrc) dynamicImages.push(userData.armour.equipment.imgsrc);
            if (userData.weapon?.equipment?.imgsrc) dynamicImages.push(userData.weapon.equipment.imgsrc);

            // Inventory images
            if (userData.inventory) {
                userData.inventory.forEach((item: any) => {
                    if (item.equipment?.imgsrc) dynamicImages.push(item.equipment.imgsrc);
                    if (item.item?.imgsrc) dynamicImages.push(item.item.imgsrc);
                });
            }

            // Slime collection images
            if (userData.slimes) {
                userData.slimes.forEach((slime: any) => {
                    if (slime.imageUri) dynamicImages.push(slime.imageUri);
                });
            }

            // Filter out already cached images for efficiency
            const uncachedImages = dynamicImages.filter(src => !isImageCached(src));

            if (uncachedImages.length > 0) {
                console.log(`🔄 Preloading ${uncachedImages.length} dynamic user images...`);
                await preloadImagesBatch(uncachedImages);
            } else {
                console.log('✅ All dynamic user images already cached');
            }

            this.progress.dynamicUserData = true;
            this.updateProgress();
            console.log('✅ Dynamic user data preloaded');
        } catch (error) {
            console.error('❌ Dynamic user data preload failed:', error);
            this.progress.dynamicUserData = true; // Mark as done to not block
            this.updateProgress();
        }
    }

    private async preloadGameAssets() {
        try {
            const gameAssetImages: string[] = [];

            // Import crafting recipes
            try {
                const craftingRecipes = await import('../assets/json/crafting-recipes.json');
                craftingRecipes.default.forEach((recipe: any) => {
                    if (recipe.imgsrc) gameAssetImages.push(recipe.imgsrc);
                });
            } catch (e) {
                console.log('No crafting-recipes.json found');
            }

            // Import items
            try {
                const items = await import('../assets/json/items.json');
                items.default.forEach((item: any) => {
                    if (item.imgsrc) gameAssetImages.push(item.imgsrc);
                });
            } catch (e) {
                console.log('No items.json found');
            }

            // Import domains
            try {
                const domains = await import('../assets/json/domains.json');
                domains.default.forEach((domain: any) => {
                    if (domain.imgsrc) gameAssetImages.push(domain.imgsrc);

                    // Also check for monster images within domains
                    if (domain.monsters) {
                        domain.monsters.forEach((monster: any) => {
                            if (monster.imgsrc) gameAssetImages.push(monster.imgsrc);
                        });
                    }
                });
            } catch (e) {
                console.log('No domains.json found');
            }

            // Import dungeons
            try {
                const dungeons = await import('../assets/json/dungeons.json');
                dungeons.default.forEach((dungeon: any) => {
                    if (dungeon.imgsrc) gameAssetImages.push(dungeon.imgsrc);

                    // Also check for monster images within dungeons
                    if (dungeon.monsters) {
                        dungeon.monsters.forEach((monster: any) => {
                            if (monster.imgsrc) gameAssetImages.push(monster.imgsrc);
                        });
                    }
                });
            } catch (e) {
                console.log('No dungeons.json found');
            }

            // Filter out already cached images
            const uncachedGameAssets = gameAssetImages.filter(src => !isImageCached(src));

            if (uncachedGameAssets.length > 0) {
                console.log(`🔄 Preloading ${uncachedGameAssets.length} game asset images...`);
                await preloadImagesBatch(uncachedGameAssets);
            } else {
                console.log('✅ All game asset images already cached');
            }

            this.progress.gameAssets = true;
            this.updateProgress();
            console.log('✅ Game assets preloaded');
        } catch (error) {
            console.error('❌ Game assets preload failed:', error);
            this.progress.gameAssets = true; // Mark as done to not block
            this.updateProgress();
        }
    }

    isComplete(): boolean {
        return this.progress.complete;
    }

    getProgress(): PreloadProgress {
        return { ...this.progress };
    }
}

export default PreloadManager;