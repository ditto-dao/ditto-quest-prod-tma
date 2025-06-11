import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

export default function preloadImagesPlugin(): Plugin {
    return {
        name: 'vite:preload-images-generator',
        apply: 'build',
        generateBundle(options, bundle) {
            // Get the actual output directory from Vite's build options
            const outputDir = options.dir || 'dist';

            this.emitFile({
                type: 'asset',
                fileName: 'preload-manifest.json',
                source: JSON.stringify({ placeholder: 'for generating preloads' })
            });
        },
        writeBundle(options, bundle) {
            const preloadLinks: string[] = [];

            // Get current working directory (more reliable than __dirname in ES modules)
            const currentDir = process.cwd();
            const assetsDir = path.resolve(currentDir, 'src/assets/images');
            const outputDir = options.dir || 'dist';
            const indexPath = path.resolve(currentDir, outputDir, 'index.html');

            if (fs.existsSync(assetsDir)) {
                // Use the actual base path from Vite config
                const basePath = this.getModuleInfo ? '/ditto-quest-tma' : '';
                preloadLinks.push(...scanDir(assetsDir, `${basePath}/assets/images`));
            }

            if (preloadLinks.length === 0) {
                console.log('⚠️  No images found to preload');
                return;
            }

            const preloadBlock = preloadLinks.join('\n    '); // Add indentation

            // Inject preload block into final index.html
            if (fs.existsSync(indexPath)) {
                try {
                    let html = fs.readFileSync(indexPath, 'utf-8');

                    // More robust replacement - insert in <head> if placeholder not found
                    if (html.includes('<!-- AUTO_PRELOAD_IMAGES -->')) {
                        html = html.replace('<!-- AUTO_PRELOAD_IMAGES -->', preloadBlock);
                    } else {
                        // Fallback: insert before closing </head> tag
                        html = html.replace('</head>', `  ${preloadBlock}\n</head>`);
                        console.log('⚠️  AUTO_PRELOAD_IMAGES placeholder not found, inserted before </head>');
                    }

                    fs.writeFileSync(indexPath, html, 'utf-8');
                    console.log(`✅ ${preloadLinks.length} preload links injected into index.html`);
                } catch (error) {
                    console.error('❌ Error injecting preload links:', error);
                }
            } else {
                console.error(`❌ index.html not found at: ${indexPath}`);
            }
        }
    };
}

function scanDir(dir: string, urlPrefix: string): string[] {
    const result: string[] = [];

    try {
        const entries = fs.readdirSync(dir);

        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                result.push(...scanDir(fullPath, `${urlPrefix}/${entry}`));
            } else if (isImage(entry)) {
                // Add crossorigin attribute for better browser compatibility
                result.push(`<link rel="preload" href="${urlPrefix}/${entry}" as="image" crossorigin="anonymous">`);
            }
        }
    } catch (error) {
        console.error(`❌ Error scanning directory ${dir}:`, error);
    }

    return result;
}

function isImage(fileName: string): boolean {
    return IMAGE_EXTENSIONS.includes(path.extname(fileName).toLowerCase());
}

// Optional: Add support for filtering out large images or limiting preloads
function shouldPreloadImage(filePath: string, maxSizeKB: number = 500): boolean {
    try {
        const stats = fs.statSync(filePath);
        const fileSizeKB = stats.size / 1024;
        return fileSizeKB <= maxSizeKB;
    } catch {
        return true; // If we can't check size, preload anyway
    }
}