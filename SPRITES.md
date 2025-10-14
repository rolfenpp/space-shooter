# How to Add Real Sprite Graphics

Your game is now set up to use sprite images! Currently it's using procedurally generated textures, but you can easily replace them with high-quality sprites.

## Quick Start: Using Kenney's Free Sprites (Recommended)

### Step 1: Download the Sprite Pack

1. Go to: https://kenney.nl/assets/space-shooter-redux
2. Click **"Download"** (it's free!)
3. Extract the ZIP file

### Step 2: Copy Sprites to Your Project

Copy these files from the downloaded pack to `game/public/assets/`:

**Player Ship:**
- Find a ship you like from `PNG/playerShip*.png`
- Rename it to `player-ship.png`
- Copy to `game/public/assets/player-ship.png`

**Enemies:**
- Find 3 different enemy ships from `PNG/Enemies/enemy*.png`
- Rename them to:
  - `enemy-basic.png` (use a basic red/simple one)
  - `enemy-fast.png` (use a sleeker orange one)
  - `enemy-tank.png` (use a bigger, bulkier one)
- Copy all to `game/public/assets/`

**Bullets:**
- Find a laser from `PNG/Lasers/laser*.png`
- Rename to `bullet.png`
- Copy to `game/public/assets/bullet.png`

**Power-ups:**
- Find or create 3 different power-up icons
- Rename them to:
  - `powerup-rapid.png` (yellow/fire themed)
  - `powerup-multi.png` (cyan/triple shot themed)
  - `powerup-shield.png` (blue/protection themed)
- Copy all to `game/public/assets/`

### Step 3: Restart Your Game

Refresh your browser - the game will automatically load the new sprites!

## File Structure

Your `public/assets/` folder should look like this:

```
game/public/assets/
├── player-ship.png
├── enemy-basic.png
├── enemy-fast.png
├── enemy-tank.png
├── bullet.png
├── powerup-rapid.png
├── powerup-multi.png
└── powerup-shield.png
```

## Recommended Sprite Packs

### Free Options:

1. **Kenney Space Shooter Redux** (Best for beginners)
   - https://kenney.nl/assets/space-shooter-redux
   - 400+ sprites, consistent style
   - CC0 License (completely free)

2. **OpenGameArt Space Shooter**
   - https://opengameart.org/content/space-shooter-art
   - Various styles available
   - Check individual licenses

3. **Pixelated Space Shooter**
   - https://opengameart.org/content/space-shooter-graphics
   - Retro pixel art style

### Paid Options (Higher Quality):

1. **Kenney Premium Packs** ($)
   - More detailed, animated sprites
   - https://kenney.itch.io/

2. **Craftpix Premium** ($$)
   - Professional game-ready assets
   - https://craftpix.net/categorys/space-shooter/

## Making Your Own Sprites

### Tools:

1. **Piskel** (Free, Browser-based)
   - https://www.piskelapp.com/
   - Perfect for pixel art

2. **Aseprite** ($20)
   - Best for pixel art animation
   - https://www.aseprite.org/

3. **GIMP** (Free)
   - For detailed, painted sprites
   - https://www.gimp.org/

### Sprite Guidelines:

- **Player Ship**: ~40x50 pixels
- **Enemies**: ~30x30 pixels
- **Bullets**: ~4x10 pixels
- **Power-ups**: ~24x24 pixels
- **Format**: PNG with transparency
- **Style**: Keep consistent across all sprites

## Customizing Sprite Sizes

If your sprites are different sizes, update `game/src/game/config/GameConfig.ts`:

```typescript
player: {
  width: 40,  // Change to match your sprite
  height: 50, // Change to match your sprite
  ...
},
enemy: {
  width: 30,  // Change to match your sprite
  height: 30, // Change to match your sprite
  ...
},
```

## Troubleshooting

**Sprites not loading?**
- Check file names match exactly (case-sensitive)
- Make sure files are in `public/assets/`
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

**Sprites too big/small?**
- Adjust with `.setScale()` in entity classes
- Or resize images to recommended dimensions

**Want animations?**
- Use sprite sheets
- Update PreloadScene to load sprite sheets
- Implement animation in entity classes

## Current Status

✅ Sprite system ready
✅ Fallback textures generated
⏳ Waiting for sprite images

Once you add sprite files to `public/assets/`, the game will automatically use them instead of the generated textures!


