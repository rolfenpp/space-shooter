import Phaser from 'phaser';
import { GameManager } from './managers/GameManager';

export class GameScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private background!: Phaser.GameObjects.TileSprite;
  private stars: Phaser.GameObjects.Graphics[] = [];
  
  // Touch controls
  private touchStartX: number = 0;
  private isTouching: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Add scrolling background
    this.background = this.add.tileSprite(
      0, 
      0, 
      this.cameras.main.width, 
      this.cameras.main.height, 
      'background'
    );
    this.background.setOrigin(0, 0);
    
    // Add twinkling stars
    this.createStars();

    // Initialize game manager
    this.gameManager = new GameManager(this);
    this.gameManager.initialize();

    // Setup keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Setup touch controls
    this.setupTouchControls();
  }

  createStars() {
    // Create 50 small stars scattered across the screen
    for (let i = 0; i < 50; i++) {
      const star = this.add.graphics();
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.Between(1, 3);
      
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
      star.fillCircle(x, y, size);
      
      this.stars.push(star);
      
      // Add twinkling effect
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 1),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  setupTouchControls() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameManager.isPaused) return;
      this.touchStartX = pointer.x;
      this.isTouching = true;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isTouching && !this.gameManager.gameOver && !this.gameManager.isPaused) {
        const deltaX = pointer.x - this.touchStartX;
        const newX = this.gameManager.player.getPosition().x + deltaX;
        this.gameManager.player.setX(newX);
        this.touchStartX = pointer.x;
      }
    });

    this.input.on('pointerup', () => {
      this.isTouching = false;
    });
  }

  update(time: number) {
    // Check if game is over or paused
    if (this.gameManager.gameOver || this.gameManager.isPaused) {
      return;
    }

    // Scroll background slowly
    this.background.tilePositionY -= 0.5;

    // Keyboard movement
    if (this.cursors.left.isDown) {
      this.gameManager.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.gameManager.player.moveRight();
    }

    // Keep player in bounds
    const pos = this.gameManager.player.getPosition();
    this.gameManager.player.setX(pos.x);

    // Auto-shoot continuously
    if (this.gameManager.player.canShoot(time)) {
      this.gameManager.shootBullet();
      this.gameManager.player.recordShot(time);
    }

    // Update game manager
    this.gameManager.update();
  }

  shutdown() {
    this.gameManager.cleanup();
  }
}
