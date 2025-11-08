# 📸 SCREENSHOT CAPTURE GUIDE

## 🎯 OBJETIVO

Criar screenshots profissionais que mostrem os principais recursos do app de forma atraente e informativa.

---

## 📱 SCREENSHOTS NECESSÁRIOS

### Para Apple App Store (5 screenshots)

#### Screenshot 1: Login/Welcome

**Scene**: Tela de login com branding
**Highlights**:

- Logo Shancrys BIM
- Campos de email/senha
- Botão de login azul
- Link para registro

**Caption**:

```
Acesso seguro e rápido
Entre com biometria ou senha
```

#### Screenshot 2: Dashboard/Projects List

**Scene**: Lista de projetos com cards
**Highlights**:

- 3-4 projetos visíveis
- Status badges coloridos
- Botão FAB para novo projeto
- Pull to refresh

**Caption**:

```
Gerencie todos seus projetos
Acompanhe status em tempo real
```

#### Screenshot 3: Project Details

**Scene**: Detalhes de um projeto específico
**Highlights**:

- Informações do projeto
- Progresso visual (%)
- Cards de budget/schedule
- Opções de ação

**Caption**:

```
Informações completas
Orçamento, cronograma e equipe
```

#### Screenshot 4: Materials Catalog

**Scene**: Lista de materiais com busca
**Highlights**:

- Barra de pesquisa ativa
- Materiais com preços
- Imagens dos itens
- Indicador de estoque

**Caption**:

```
+10.000 materiais catalogados
Preços atualizados diariamente
```

#### Screenshot 5: Profile/Settings

**Scene**: Perfil do usuário
**Highlights**:

- Avatar e nome
- Informações do usuário
- Botões de ação
- Logout option

**Caption**:

```
Seu perfil profissional
Sincronizado em todos dispositivos
```

---

## 🎨 DESIGN GUIDELINES

### Device Frames

Use device frames profissionais:

- **iPhone 15 Pro Max** (tela 6.7")
- Cor: Space Black ou Silver
- Orientação: Portrait (vertical)

### Background

- **Cor**: Gradient suave (branco → cinza claro)
- **Ou**: Contexto de canteiro de obra (desfocado)
- **Evitar**: Backgrounds muito chamativos

### Captions

- **Posição**: Topo ou fundo do screenshot
- **Fonte**: Sans-serif bold (SF Pro, Inter, Roboto)
- **Tamanho**: 48-60pt
- **Cor**: Azul principal (#0066CC) ou branco (se fundo escuro)
- **Alinhamento**: Centro

### Elements Overlay

Adicione elementos visuais:

- **Badges**: "NOVO", "GRÁTIS", "PREMIUM"
- **Icons**: Check marks para features
- **Highlights**: Círculos ou setas apontando features
- **Shadows**: Drop shadow suave nos devices

---

## 📐 TECHNICAL SPECS

### Resolution

```
iPhone 6.7" Display (iPhone 15 Pro Max)
Width: 1290px
Height: 2796px
Format: PNG (24-bit)
Color Space: sRGB
DPI: 72
```

### File Naming

```
screenshot-01-login.png
screenshot-02-projects.png
screenshot-03-project-detail.png
screenshot-04-materials.png
screenshot-05-profile.png
```

### File Size

- **Max**: 8MB per screenshot
- **Recommended**: 500KB - 2MB
- **Compression**: Use TinyPNG or ImageOptim

---

## 🛠️ HOW TO CAPTURE

### Method 1: From Real App (Best Quality)

#### Step 1: Prepare Device

```bash
# Start app on iOS Simulator
npm run ios

# Or on physical device
npm start
# Scan QR code with Expo Go
```

#### Step 2: Set Up Demo Data

- Login with demo account
- Ensure sample projects exist
- Add materials to catalog
- Fill profile information

#### Step 3: Capture Screenshots

**On iOS Simulator:**

```
Cmd + S = Save screenshot
File → Screenshot
```

**On Physical iPhone:**

```
Side Button + Volume Up = Screenshot
Screenshots saved to Photos app
```

#### Step 4: Transfer Files

```bash
# From simulator
~/Library/Developer/CoreSimulator/Devices/[DEVICE-ID]/data/Media/DCIM/100APPLE/

# From iPhone
AirDrop or Photos → Export
```

### Method 2: Using Screenshot Tool

#### Recommended Tool: Screely

1. Go to <https://screely.com/>
2. Upload app screenshot
3. Select device frame (iPhone 15 Pro)
4. Choose background
5. Download PNG

#### Alternative: Mockuphone

1. Go to <https://mockuphone.com/>
2. Select "iPhone 15 Pro Max"
3. Upload screenshot
4. Customize (add shadow, background)
5. Download

---

## 🎨 POST-PROCESSING

### Tool: Figma (Free)

#### Template Setup

1. Create new file (1290 x 2796px)
2. Import device mockup
3. Place screenshot inside device
4. Add background layer
5. Add caption text
6. Export as PNG

#### Figma Layers Structure

```
📁 Screenshot 1 - Login
  ├── 📝 Caption Text
  ├── 📱 Device Frame (iPhone 15 Pro)
  │   └── 🖼️ App Screenshot
  ├── 🎨 Background Gradient
  └── ✨ Decorative Elements (optional)
```

### Add Captions in Figma

```
1. Create text box (top or bottom)
2. Font: SF Pro Display Bold
3. Size: 54pt
4. Color: #0066CC
5. Align: Center
6. Add line below caption (2px, #0066CC, 100px width)
```

---

## 🌟 PRO TIPS

### Content Tips

1. **Use Real Data**: Not "Lorem Ipsum" or fake content
2. **Show Value**: Highlight key features in each screen
3. **Tell a Story**: Flow from login → project → details
4. **Include Numbers**: "$1.234.567", "15 projetos", "95% completo"
5. **Professional Photos**: Use high-quality material images

### Visual Tips

1. **Consistent Branding**: Same colors throughout
2. **Readable Text**: Ensure all text is legible
3. **Clean UI**: Hide debug info, remove lorem ipsum
4. **Status Bar**: Show clean status bar (full battery, 5G, etc.)
5. **Time**: Set device time to 9:41 AM (Apple standard)

### Technical Tips

1. **High Resolution**: Always capture @3x resolution
2. **No Compression**: Use PNG for best quality
3. **Color Space**: sRGB for universal compatibility
4. **File Names**: Use descriptive, numbered names
5. **Backup Originals**: Keep unedited versions

---

## ✅ QUALITY CHECKLIST

Before submitting screenshots:

- [ ] Correct resolution (1290 x 2796)
- [ ] PNG format, 24-bit
- [ ] File size under 8MB
- [ ] Device frame included
- [ ] Caption text readable
- [ ] No lorem ipsum or fake data
- [ ] Status bar clean (9:41, full battery)
- [ ] UI elements clear and crisp
- [ ] Background professional
- [ ] Brand colors consistent
- [ ] No typos in captions
- [ ] All 5 screenshots captured
- [ ] Files properly named
- [ ] Optimized for file size

---

## 📦 DELIVERY

### Folder Structure

```
screenshots/
├── ios/
│   ├── 01-login.png
│   ├── 02-projects.png
│   ├── 03-project-detail.png
│   ├── 04-materials.png
│   └── 05-profile.png
├── android/
│   ├── 01-login.png
│   ├── 02-projects.png
│   ├── 03-project-detail.png
│   ├── 04-materials.png
│   └── 05-profile.png
└── sources/
    ├── figma-templates.fig
    └── original-captures/
```

---

## 🎬 EXAMPLE WORKFLOW

### Complete Process (60 minutes)

**1. Prepare (10 min)**

- Set up demo data
- Clean UI
- Test on simulator

**2. Capture (15 min)**

- Take 5 base screenshots
- Verify quality
- Transfer to computer

**3. Edit (25 min)**

- Open in Figma
- Add device frames
- Add backgrounds
- Add captions
- Add highlights

**4. Export (10 min)**

- Export all as PNG
- Optimize file sizes
- Rename properly
- Create backups

**5. Review (10 min)**

- Check quality
- Verify dimensions
- Test on different displays
- Get approval

---

**📸 Ready to capture stunning screenshots! 📸**
