import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Bullet {
  public sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number = GameConfig.bullet.damage) {
    this.damage = damage;

    // Create bullet sprite
    this.sprite = scene.add.sprite(x, y, 'bullet');
    this.sprite.setScale(.5); // Scale down Kenney sprites

    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setVelocityY(-GameConfig.bullet.speed);
  }

  isOffScreen(): boolean {
    return this.sprite.y < -10;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    this.sprite.destroy();
  }
}
