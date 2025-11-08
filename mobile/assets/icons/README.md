# 🎨 ICON & ASSET GENERATION

## 📦 Contents

This folder contains all icon and splash screen assets for Shancrys BIM mobile app.

### Source Files

- `icon-source.svg` - Master SVG icon (1024x1024)
- `favicon.svg` - Favicon source (32x32)
- `generate-icons.js` - Automated icon generator script

### Generated Folders

- `ios/` - All iOS app icon sizes (1024, 180, 167, 152, 120, 76, 60, 40, 29)
- `android/` - All Android icon sizes (512, 192, 144, 96, 72, 48)
- `web/` - Web icons and favicons (512, 192, 180, 32, 16)
- `splash/` - Splash screens for iOS, Android, Web

---

## 🚀 QUICK START

### 1. Install Dependencies

```bash
# From project root
npm install sharp --save-dev
```

### 2. Generate All Icons

```bash
# From project root
node assets/icons/generate-icons.js
```

This will:

- ✅ Generate all iOS icon sizes
- ✅ Generate all Android icon sizes
- ✅ Generate all Web/PWA icons
- ✅ Generate splash screens
- ✅ Generate favicon.ico
- ✅ Copy main assets to /assets folder

### 3. Verify Output

Check that files were created:

```bash
ls assets/icons/ios/
ls assets/icons/android/
ls assets/icons/web/
ls assets/icons/splash/
ls assets/
```

---

## 📐 MANUAL GENERATION

If you need to generate specific sizes manually:

### Using Sharp (Node.js)

```javascript
const sharp = require('sharp');

// Generate 1024x1024 icon
await sharp('icon-source.svg')
  .resize(1024, 1024)
  .png()
  .toFile('app-icon-1024.png');
```

### Using ImageMagick (CLI)

```bash
# Convert SVG to PNG
convert icon-source.svg -resize 1024x1024 app-icon-1024.png

# Generate multiple sizes
for size in 16 32 180 192 512; do
  convert icon-source.svg -resize ${size}x${size} icon-${size}.png
done
```

### Using Inkscape (CLI)

```bash
# Export SVG to PNG
inkscape icon-source.svg --export-png=app-icon-1024.png --export-width=1024 --export-height=1024
```

---

## 🎨 CUSTOMIZING THE ICON

### Edit SVG Source

1. Open `icon-source.svg` in:
   - Adobe Illustrator
   - Figma (import SVG)
   - Inkscape (free)
   - VS Code (with SVG extension)

2. Modify colors, shapes, text

3. Save and re-run generator:

   ```bash
   node assets/icons/generate-icons.js
   ```

### Design Guidelines

- **Keep it simple**: Icons should be recognizable at 29x29
- **Use safe area**: Leave 10% margin from edges
- **No transparency**: iOS icons should be opaque
- **Rounded corners**: iOS adds them automatically (20% radius)
- **Test at all sizes**: Verify readability from 16x16 to 1024x1024

---

## 📱 ICON REQUIREMENTS

### iOS App Store

| Size | Filename | Usage |
|------|----------|-------|
| 1024x1024 | app-icon-1024.png | App Store listing |
| 180x180 | app-icon-180.png | iPhone @3x |
| 167x167 | app-icon-167.png | iPad Pro |
| 152x152 | app-icon-152.png | iPad @2x |
| 120x120 | app-icon-120.png | iPhone @2x |
| 76x76 | app-icon-76.png | iPad |
| 60x60 | app-icon-60.png | Notifications |
| 40x40 | app-icon-40.png | Spotlight |
| 29x29 | app-icon-29.png | Settings |

### Android Play Store

| Size | Filename | Usage |
|------|----------|-------|
| 512x512 | android-icon-512.png | Play Store listing |
| 192x192 | android-icon-192.png | xxxhdpi |
| 144x144 | android-icon-144.png | xxhdpi |
| 96x96 | android-icon-96.png | xhdpi |
| 72x72 | android-icon-72.png | hdpi |
| 48x48 | android-icon-48.png | mdpi |

### Web / PWA

| Size | Filename | Usage |
|------|----------|-------|
| 512x512 | pwa-icon-512.png | PWA splash screen |
| 192x192 | pwa-icon-192.png | PWA icon |
| 180x180 | apple-touch-icon.png | iOS Web App |
| 32x32 | favicon-32x32.png | Browser favicon |
| 16x16 | favicon-16x16.png | Browser favicon |
| Multi | favicon.ico | Legacy favicon |

---

## 🌅 SPLASH SCREENS

### Sizes Generated

- **1242x2688** - iPhone 15 Pro Max
- **1125x2436** - iPhone 15 Pro
- **1080x1920** - Android Portrait
- **1920x1080** - Web Landscape

### Customization

To change splash screen design, edit `generate-icons.js`:

```javascript
// Change background color
background: { r: 0, g: 102, b: 204, alpha: 1 } // #0066CC

// Change logo size (% of screen width)
.resize(Math.floor(width * 0.3), Math.floor(width * 0.3))
```

---

## 🔧 TROUBLESHOOTING

### Error: Cannot find module 'sharp'

**Solution:**

```bash
npm install sharp --save-dev
```

### Error: ENOENT: no such file or directory 'icon-source.svg'

**Solution:**
Make sure you're running from project root:

```bash
cd /path/to/project
node assets/icons/generate-icons.js
```

### Icons look blurry on iOS

**Solution:**

- Ensure source SVG is high quality (1024x1024)
- Check that PNG files are not being compressed
- Verify color space is sRGB

### Wrong icon appears on device

**Solution:**

```bash
# Clear build cache
rm -rf ios/build android/app/build

# Clear Expo cache
npx expo start --clear

# Rebuild app
npx expo run:ios
```

---

## 📦 EXPO INTEGRATION

The generator automatically copies these files to `/assets`:

```
assets/
├── icon.png (1024x1024 - from ios/app-icon-1024.png)
├── adaptive-icon.png (512x512 - from android/android-icon-512.png)
└── splash.png (1242x2688 - from splash/splash-ios-1242x2688.png)
```

These are referenced in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      }
    }
  }
}
```

---

## 🎨 ONLINE TOOLS

If you prefer not to use the generator:

### Icon Generators

- **App Icon Generator**: <https://appicon.co/>
- **Icon Kitchen**: <https://icon.kitchen/>
- **MakeAppIcon**: <https://makeappicon.com/>

### Favicon Generators

- **Favicon.io**: <https://favicon.io/>
- **RealFaviconGenerator**: <https://realfavicongenerator.net/>

### Splash Screen Generators

- **Apetools**: <https://apetools.webprofusion.com/app/#/tools/imagegorilla>
- **AppLaunchpad**: <https://www.applaunchpad.com/>

---

## 📊 FILE SIZE GUIDELINES

### Optimal Sizes

- **App Store icon (1024)**: < 1MB
- **Android icons**: < 500KB each
- **Splash screens**: < 2MB
- **Favicons**: < 50KB

### Compression Tools

- **TinyPNG**: <https://tinypng.com/>
- **ImageOptim** (Mac): <https://imageoptim.com/>
- **Squoosh**: <https://squoosh.app/>

### Compress Icons

```bash
# Using ImageMagick
convert icon.png -quality 90 -strip icon-compressed.png

# Using pngquant
pngquant --quality=80-90 icon.png
```

---

## ✅ VERIFICATION CHECKLIST

Before submitting to stores:

- [ ] All iOS icons generated (9 sizes)
- [ ] All Android icons generated (6 sizes)
- [ ] Favicon files created (16, 32, .ico)
- [ ] Splash screens created (4 sizes)
- [ ] Files copied to /assets folder
- [ ] Icons tested at small sizes (readable)
- [ ] Icons tested on different backgrounds
- [ ] No transparency in iOS icons
- [ ] All files under size limits
- [ ] Files optimized/compressed
- [ ] app.json references correct paths
- [ ] Test build completed successfully

---

## 🔄 UPDATING ICONS

When you need to update the icon:

1. Edit `icon-source.svg`
2. Run generator:

   ```bash
   node assets/icons/generate-icons.js
   ```

3. Clear cache:

   ```bash
   npx expo start --clear
   ```

4. Rebuild:

   ```bash
   eas build --platform all --profile preview
   ```

---

## 📝 NOTES

- Icon source is SVG for infinite scalability
- Generator creates PNG files (required by iOS/Android)
- Splash screens use simple gradient + centered logo
- All assets follow Apple and Google guidelines
- Files are optimized for size automatically

---

**Need help? Check the main DESIGN_SPECS.md for detailed design guidelines.**
