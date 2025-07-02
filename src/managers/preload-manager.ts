import {
    preloadStaticImages,
    preloadImagesBatch,
    getCacheStats,
    isImageCached
} from '../utils/image-cache';

interface PreloadProgress {
    staticImages: boolean;
    dynamicUserData: boolean;
    gameAssets: boolean;
    complete: boolean;
}

type ProgressCallback = (progress: PreloadProgress) => void;

class PreloadManager {
    private static instance: PreloadManager;
    private progress: PreloadProgress = {
        staticImages: false,
        dynamicUserData: false,
        gameAssets: false,
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
            this.progress.gameAssets;

        this.progressCallbacks.forEach(callback => callback({ ...this.progress }));
    }

    async preloadEverything(userData?: any) {
        console.log('🚀 Starting comprehensive preload...');
        console.log('📊 Cache stats before:', getCacheStats());

        // Run all preloads in parallel
        await Promise.allSettled([
            this.preloadAllStaticImages(),
            this.preloadDynamicUserData(userData),
            this.preloadGameAssets()
        ]);

        console.log('✅ Comprehensive preload complete!');
        console.log('📊 Cache stats after:', getCacheStats());
    }

    private async preloadAllStaticImages() {
        try {
            // Use your existing preloadStaticImages function - it uses glob to get ALL assets automatically!
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
            // Preload crafting recipes, monsters, etc. from JSON files
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

            // Import monsters (if you have a monsters.json)
            try {
                const monsters = await import('../assets/json/monsters.json');
                monsters.default.forEach((monster: any) => {
                    if (monster.imgsrc) gameAssetImages.push(monster.imgsrc);
                });
            } catch (e) {
                console.log('No monsters.json found');
            }

            // Import items (if you have an items.json)
            try {
                const items = await import('../assets/json/items.json');
                items.default.forEach((item: any) => {
                    if (item.imgsrc) gameAssetImages.push(item.imgsrc);
                });
            } catch (e) {
                console.log('No items.json found');
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

    // New method to integrate with your login system
    async preloadBasedOnLoginProgress(loginProgress: number, userData?: any) {
        // Start static preload immediately (0-50% login progress)
        if (loginProgress >= 0 && !this.progress.staticImages) {
            this.preloadAllStaticImages();
        }

        // Start user data preload when user data is available (50-85% login progress)
        if (loginProgress >= 50 && userData && !this.progress.dynamicUserData) {
            this.preloadDynamicUserData(userData);
        }

        // Start game assets preload in parallel (70-100% login progress)
        if (loginProgress >= 70 && !this.progress.gameAssets) {
            this.preloadGameAssets();
        }
    }
}

export default PreloadManager;