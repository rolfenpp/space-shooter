import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type PowerUpType = 'rapidFire' | 'multiShot' | 'shield';

export class PowerUp {
  public sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public type: PowerUpType;
  
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    this.scene = scene;
    this.type = type;

    // Create power-up sprite
    const spriteKey = `powerup-${type === 'rapidFire' ? 'rapid' : type === 'multiShot' ? 'multi' : 'shield'}`;
    this.sprite = scene.add.sprite(x, y, spriteKey);
    this.sprite.setScale(.5); // Scale down Kenney sprites

    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setVelocityY(GameConfig.powerups.fallSpeed);
    this.body.setCircle(10);

    // Add pulsing animation
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Add rotation
    scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });
  }

  isOffScreen(): boolean {
    return this.sprite.y > this.scene.cameras.main.height + 50;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    this.sprite.destroy();
  }
}
