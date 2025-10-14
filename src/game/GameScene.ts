import Phaser from 'phaser';
import { GameManager } from './managers/GameManager';

export class GameScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  
  // Touch controls
  private touchStartX: number = 0;
  private isTouching: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize game manager
    this.gameManager = new GameManager(this);
    this.gameManager.initialize();

    // Setup keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Setup touch controls
    this.setupTouchControls();
  }

  setupTouchControls() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.isTouching = true;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isTouching && !this.gameManager.gameOver) {
        const deltaX = pointer.x - this.touchStartX;
        const newX = this.gameManager.player.getPosition().x + deltaX;
        this.gameManager.player.setX(newX);
        this.touchStartX = pointer.x;
      }
    });

    this.input.on('pointerup', () => {
      this.isTouching = false;
      // Auto-shoot when releasing touch
      if (!this.gameManager.gameOver) {
        const time = this.time.now;
        if (this.gameManager.player.canShoot(time)) {
          this.gameManager.shootBullet();
          this.gameManager.player.recordShot(time);
        }
      }
    });
  }

  update(time: number) {
    if (this.gameManager.gameOver) {
      return;
    }

    // Keyboard movement
    if (this.cursors.left.isDown) {
      this.gameManager.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.gameManager.player.moveRight();
    }

    // Keep player in bounds
    const pos = this.gameManager.player.getPosition();
    this.gameManager.player.setX(pos.x);

    // Keyboard shooting
    if (this.cursors.space.isDown && this.gameManager.player.canShoot(time)) {
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
