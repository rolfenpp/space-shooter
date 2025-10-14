import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading text
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    this.add.text(centerX, centerY, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Silently handle missing sprites - we'll generate textures instead
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.log(`Sprite not found: ${file.key}, will generate texture`);
    });

    // Load background
    this.load.setPath('assets/kenney_space-shooter-redux/Backgrounds/');
    this.load.image('background', 'darkPurple.png');
    
    // Load sprites from Kenney's Space Shooter Redux pack
    this.load.setPath('assets/kenney_space-shooter-redux/PNG/');
    
    // Player ship
    this.load.image('player-ship', 'playerShip1_blue.png');
    
    // Enemies
    this.load.image('enemy-basic', 'Enemies/enemyRed1.png');
    this.load.image('enemy-fast', 'Enemies/enemyRed3.png');
    this.load.image('enemy-tank', 'Enemies/enemyBlack1.png');
    
    // Bullets
    this.load.image('bullet', 'Lasers/laserBlue01.png');
    
    // Power-ups
    this.load.image('powerup-rapid', 'Power-ups/pill_yellow.png');
    this.load.image('powerup-multi', 'Power-ups/pill_blue.png');
    this.load.image('powerup-shield', 'Power-ups/shield_gold.png');
    
    this.load.setPath('');
  }

  create() {
    // Generate procedural textures for anything that didn't load
    this.generatePlayerShipTexture();
    this.generateEnemyTextures();
    this.generateBulletTexture();
    this.generatePowerUpTextures();
    this.generateExplosionTexture();

    // Start the main game scene
    this.scene.start('GameScene');
  }

  generatePlayerShipTexture() {
    if (this.textures.exists('player-ship')) return;

    const graphics = this.add.graphics();
    const width = 40;
    const height = 50;

    // Main ship body (sleek design)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(width / 2, 5, 10, height - 5, width - 10, height - 5);
    
    // Cockpit
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(width / 2, 15, 5);
    
    // Wings
    graphics.fillStyle(0x00cc00, 1);
    graphics.fillTriangle(10, 20, 0, 35, 10, 40);
    graphics.fillTriangle(width - 10, 20, width, 35, width - 10, 40);
    
    // Engine glow
    graphics.fillStyle(0xff6600, 0.8);
    graphics.fillCircle(15, height - 8, 4);
    graphics.fillCircle(width - 15, height - 8, 4);
    
    // Weapon pods
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(12, height - 10, 3, 8);
    graphics.fillRect(width - 15, height - 10, 3, 8);

    graphics.generateTexture('player-ship', width, height);
    graphics.destroy();
  }

  generateEnemyTextures() {
    // Basic Enemy (Red)
    if (!this.textures.exists('enemy-basic')) {
      const graphics = this.add.graphics();
      const size = 30;
      
      graphics.fillStyle(0xff0000, 1);
      graphics.fillTriangle(size / 2, size - 5, 5, 5, size - 5, 5);
      
      // Eyes (menacing look)
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(size / 2 - 5, 12, 3);
      graphics.fillCircle(size / 2 + 5, 12, 3);
      
      graphics.generateTexture('enemy-basic', size, size);
      graphics.destroy();
    }

    // Fast Enemy (Orange)
    if (!this.textures.exists('enemy-fast')) {
      const graphics = this.add.graphics();
      const size = 28;
      
      graphics.fillStyle(0xff8800, 1);
      // Sleeker, more aerodynamic
      graphics.fillTriangle(size / 2, size - 3, 3, 3, size - 3, 3);
      
      // Speed lines
      graphics.lineStyle(2, 0xffaa00, 1);
      graphics.lineBetween(8, 10, 4, 10);
      graphics.lineBetween(size - 8, 10, size - 4, 10);
      
      graphics.generateTexture('enemy-fast', size, size);
      graphics.destroy();
    }

    // Tank Enemy (Purple)
    if (!this.textures.exists('enemy-tank')) {
      const graphics = this.add.graphics();
      const size = 35;
      
      graphics.fillStyle(0x8800ff, 1);
      // Bulky design
      graphics.fillRect(8, 5, size - 16, size - 10);
      graphics.fillTriangle(size / 2, size - 5, 8, 5, size - 8, 5);
      
      // Armor plates
      graphics.fillStyle(0x6600cc, 1);
      graphics.fillRect(10, 8, 4, 8);
      graphics.fillRect(size - 14, 8, 4, 8);
      
      graphics.generateTexture('enemy-tank', size, size);
      graphics.destroy();
    }
  }

  generateBulletTexture() {
    if (this.textures.exists('bullet')) return;

    const graphics = this.add.graphics();
    
    // Glowing bullet
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 4, 10);
    
    // Bright tip
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 3);
    
    graphics.generateTexture('bullet', 4, 10);
    graphics.destroy();
  }

  generatePowerUpTextures() {
    // Rapid Fire (Yellow star)
    if (!this.textures.exists('powerup-rapid')) {
      const graphics = this.add.graphics();
      const size = 24;
      
      graphics.fillStyle(0xffff00, 1);
      this.drawStar(graphics, size / 2, size / 2, 5, 10, 5);
      
      // Inner glow
      graphics.fillStyle(0xffffff, 0.6);
      this.drawStar(graphics, size / 2, size / 2, 5, 5, 2.5);
      
      graphics.generateTexture('powerup-rapid', size, size);
      graphics.destroy();
    }

    // Multi-Shot (Cyan star)
    if (!this.textures.exists('powerup-multi')) {
      const graphics = this.add.graphics();
      const size = 24;
      
      graphics.fillStyle(0x00ffff, 1);
      this.drawStar(graphics, size / 2, size / 2, 5, 10, 5);
      
      graphics.fillStyle(0xffffff, 0.6);
      this.drawStar(graphics, size / 2, size / 2, 5, 5, 2.5);
      
      graphics.generateTexture('powerup-multi', size, size);
      graphics.destroy();
    }

    // Shield (Blue star)
    if (!this.textures.exists('powerup-shield')) {
      const graphics = this.add.graphics();
      const size = 24;
      
      graphics.fillStyle(0x0088ff, 1);
      this.drawStar(graphics, size / 2, size / 2, 5, 10, 5);
      
      graphics.fillStyle(0xffffff, 0.6);
      this.drawStar(graphics, size / 2, size / 2, 5, 5, 2.5);
      
      graphics.generateTexture('powerup-shield', size, size);
      graphics.destroy();
    }
  }

  generateExplosionTexture() {
    if (this.textures.exists('explosion')) return;

    const graphics = this.add.graphics();
    
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(16, 16, 12);
    
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(16, 16, 8);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 4);
    
    graphics.generateTexture('explosion', 32, 32);
    graphics.destroy();
  }

  drawStar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, points: number, outerRadius: number, innerRadius: number) {
    const angle = Math.PI / points;
    
    graphics.beginPath();
    graphics.moveTo(x, y - outerRadius);
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? innerRadius : outerRadius;
      const currentAngle = angle * i - Math.PI / 2;
      graphics.lineTo(
        x + Math.cos(currentAngle) * radius,
        y + Math.sin(currentAngle) * radius
      );
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
}

