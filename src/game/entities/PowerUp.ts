import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type PowerUpType = 'rapidFire' | 'multiShot' | 'shield';

export class PowerUp {
  public sprite: Phaser.GameObjects.Graphics;
  public body: Phaser.Physics.Arcade.Body;
  public type: PowerUpType;
  
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    this.scene = scene;
    this.type = type;

    const config = GameConfig.powerups.types[type];

    // Create power-up sprite (star shape)
    this.sprite = scene.add.graphics();
    this.sprite.fillStyle(config.color, 1);
    
    // Draw a star
    const points: number[] = [];
    const radius = 10;
    for (let i = 0; i < 5; i++) {
      // Outer point
      const angle1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      points.push(Math.cos(angle1) * radius, Math.sin(angle1) * radius);
      
      // Inner point
      const angle2 = ((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2;
      points.push(Math.cos(angle2) * radius * 0.5, Math.sin(angle2) * radius * 0.5);
    }
    
    this.sprite.fillPoints(
      points.map((val, idx) => ({
        x: idx % 2 === 0 ? val : points[idx],
        y: idx % 2 === 1 ? val : points[idx],
      })) as { x: number; y: number }[],
      true
    );

    this.sprite.setPosition(x, y);

    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setVelocityY(GameConfig.powerups.fallSpeed);
    this.body.setCircle(10);

    // Add pulsing animation
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
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

