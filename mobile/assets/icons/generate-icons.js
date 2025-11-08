const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Icon Generator for Shancrys BIM
 * Generates all required icon sizes for iOS, Android, and Web
 */

// Icon sizes to generate
const iconSizes = {
    // iOS App Icon
    ios: [
        { size: 1024, name: 'app-icon-1024.png', desc: 'App Store' },
        { size: 180, name: 'app-icon-180.png', desc: 'iPhone App Icon @3x' },
        { size: 167, name: 'app-icon-167.png', desc: 'iPad Pro' },
        { size: 152, name: 'app-icon-152.png', desc: 'iPad' },
        { size: 120, name: 'app-icon-120.png', desc: 'iPhone App Icon @2x' },
        { size: 76, name: 'app-icon-76.png', desc: 'iPad Mini' },
        { size: 60, name: 'app-icon-60.png', desc: 'iPhone Notification' },
        { size: 40, name: 'app-icon-40.png', desc: 'Spotlight' },
        { size: 29, name: 'app-icon-29.png', desc: 'Settings' },
    ],

    // Android Icon
    android: [
        { size: 512, name: 'android-icon-512.png', desc: 'Play Store' },
        { size: 192, name: 'android-icon-192.png', desc: 'xxxhdpi' },
        { size: 144, name: 'android-icon-144.png', desc: 'xxhdpi' },
        { size: 96, name: 'android-icon-96.png', desc: 'xhdpi' },
        { size: 72, name: 'android-icon-72.png', desc: 'hdpi' },
        { size: 48, name: 'android-icon-48.png', desc: 'mdpi' },
    ],

    // Web / PWA
    web: [
        { size: 512, name: 'pwa-icon-512.png', desc: 'PWA Splash' },
        { size: 192, name: 'pwa-icon-192.png', desc: 'PWA Icon' },
        { size: 180, name: 'apple-touch-icon.png', desc: 'Apple Touch Icon' },
        { size: 32, name: 'favicon-32x32.png', desc: 'Favicon 32' },
        { size: 16, name: 'favicon-16x16.png', desc: 'Favicon 16' },
    ],
};

// Splash screen sizes
const splashSizes = [
    { width: 1242, height: 2688, name: 'splash-ios-1242x2688.png', desc: 'iPhone 15 Pro Max' },
    { width: 1125, height: 2436, name: 'splash-ios-1125x2436.png', desc: 'iPhone 15 Pro' },
    { width: 1080, height: 1920, name: 'splash-android-1080x1920.png', desc: 'Android Portrait' },
    { width: 1920, height: 1080, name: 'splash-web-1920x1080.png', desc: 'Web Landscape' },
];

const sourceIcon = path.join(__dirname, 'icon-source.svg');
const outputDir = __dirname;

// Ensure sharp is installed
if (!fs.existsSync(path.join(__dirname, '../../node_modules/sharp'))) {
    console.log('⚠️  Sharp not installed. Installing...');
    console.log('Run: npm install sharp --save-dev');
    console.log('');
    process.exit(1);
}

/**
 * Generate icons for a specific platform
 */
async function generateIcons(platform) {
    console.log(`\n🎨 Generating ${platform.toUpperCase()} icons...`);

    const sizes = iconSizes[platform];
    const platformDir = path.join(outputDir, platform);

    // Create platform directory
    if (!fs.existsSync(platformDir)) {
        fs.mkdirSync(platformDir, { recursive: true });
    }

    for (const { size, name, desc } of sizes) {
        try {
            const outputPath = path.join(platformDir, name);

            await sharp(sourceIcon)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toFile(outputPath);

            const stats = fs.statSync(outputPath);
            const sizeKB = (stats.size / 1024).toFixed(2);

            console.log(`  ✅ ${name.padEnd(30)} ${size}x${size}  ${sizeKB}KB  (${desc})`);
        } catch (error) {
            console.error(`  ❌ Failed to generate ${name}: ${error.message}`);
        }
    }
}

/**
 * Generate splash screens
 */
async function generateSplashScreens() {
    console.log('\n🌅 Generating splash screens...');

    const splashDir = path.join(outputDir, 'splash');

    if (!fs.existsSync(splashDir)) {
        fs.mkdirSync(splashDir, { recursive: true });
    }

    for (const { width, height, name, desc } of splashSizes) {
        try {
            const outputPath = path.join(splashDir, name);

            // Create splash with gradient background and centered logo
            await sharp({
                create: {
                    width,
                    height,
                    channels: 4,
                    background: { r: 0, g: 102, b: 204, alpha: 1 } // #0066CC
                }
            })
                .composite([
                    {
                        input: await sharp(sourceIcon)
                            .resize(Math.floor(width * 0.3), Math.floor(width * 0.3), {
                                fit: 'contain'
                            })
                            .toBuffer(),
                        gravity: 'center'
                    }
                ])
                .png()
                .toFile(outputPath);

            const stats = fs.statSync(outputPath);
            const sizeKB = (stats.size / 1024).toFixed(2);

            console.log(`  ✅ ${name.padEnd(30)} ${width}x${height}  ${sizeKB}KB  (${desc})`);
        } catch (error) {
            console.error(`  ❌ Failed to generate ${name}: ${error.message}`);
        }
    }
}

/**
 * Generate favicon.ico
 */
async function generateFavicon() {
    console.log('\n🔖 Generating favicon.ico...');

    try {
        const faviconPath = path.join(outputDir, 'web', 'favicon.ico');

        // Generate ICO file with multiple sizes
        await sharp(sourceIcon)
            .resize(32, 32)
            .toFile(faviconPath);

        console.log(`  ✅ favicon.ico created`);
    } catch (error) {
        console.error(`  ❌ Failed to generate favicon.ico: ${error.message}`);
    }
}

/**
 * Copy to Expo assets folder
 */
function copyToAssets() {
    console.log('\n📦 Copying to Expo assets folder...');

    const assetsDir = path.join(__dirname, '..');

    try {
        // Copy app icon (1024)
        const icon1024 = path.join(outputDir, 'ios', 'app-icon-1024.png');
        const iconDest = path.join(assetsDir, 'icon.png');

        if (fs.existsSync(icon1024)) {
            fs.copyFileSync(icon1024, iconDest);
            console.log('  ✅ Copied icon.png');
        }

        // Copy adaptive icon (512)
        const adaptiveIcon = path.join(outputDir, 'android', 'android-icon-512.png');
        const adaptiveDest = path.join(assetsDir, 'adaptive-icon.png');

        if (fs.existsSync(adaptiveIcon)) {
            fs.copyFileSync(adaptiveIcon, adaptiveDest);
            console.log('  ✅ Copied adaptive-icon.png');
        }

        // Copy splash (1242x2688)
        const splash = path.join(outputDir, 'splash', 'splash-ios-1242x2688.png');
        const splashDest = path.join(assetsDir, 'splash.png');

        if (fs.existsSync(splash)) {
            fs.copyFileSync(splash, splashDest);
            console.log('  ✅ Copied splash.png');
        }

    } catch (error) {
        console.error(`  ❌ Failed to copy assets: ${error.message}`);
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Shancrys BIM Icon Generator');
    console.log('================================\n');

    // Check if source file exists
    if (!fs.existsSync(sourceIcon)) {
        console.error('❌ Source icon not found: icon-source.svg');
        console.error('Please create icon-source.svg first.');
        process.exit(1);
    }

    try {
        // Generate all icon sizes
        await generateIcons('ios');
        await generateIcons('android');
        await generateIcons('web');

        // Generate splash screens
        await generateSplashScreens();

        // Generate favicon
        await generateFavicon();

        // Copy to Expo assets
        copyToAssets();

        console.log('\n✨ All icons generated successfully!');
        console.log('\n📊 Summary:');
        console.log(`  iOS icons: ${iconSizes.ios.length}`);
        console.log(`  Android icons: ${iconSizes.android.length}`);
        console.log(`  Web icons: ${iconSizes.web.length}`);
        console.log(`  Splash screens: ${splashSizes.length}`);
        console.log('\n📁 Output locations:');
        const assetsDir = path.join(__dirname, '..');
        console.log(`  ${path.relative(process.cwd(), path.join(outputDir, 'ios'))}`);
        console.log(`  ${path.relative(process.cwd(), path.join(outputDir, 'android'))}`);
        console.log(`  ${path.relative(process.cwd(), path.join(outputDir, 'web'))}`);
        console.log(`  ${path.relative(process.cwd(), path.join(outputDir, 'splash'))}`);
        console.log(`  ${path.relative(process.cwd(), assetsDir)}`);

    } catch (error) {
        console.error('\n❌ Error generating icons:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, generateIcons, generateSplashScreens };
