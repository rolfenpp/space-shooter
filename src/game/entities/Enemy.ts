import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type EnemyType = 'basic' | 'fast' | 'tank';

export class Enemy {
  public sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public type: EnemyType;
  public health: number;
  public maxHealth: number;
  public scoreValue: number;
  
  private scene: Phaser.Scene;
  private healthBar?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'basic', speedMultiplier: number = 1) {
    this.scene = scene;
    this.type = type;
    
    const enemyConfig = GameConfig.enemy.types[type];
    
    this.health = enemyConfig.health;
    this.maxHealth = enemyConfig.health;
    this.scoreValue = enemyConfig.scoreValue;

    // Create enemy sprite based on type
    const spriteKey = `enemy-${type}`;
    this.sprite = scene.add.sprite(x, y, spriteKey);
    this.sprite.setScale(.5); // Scale down Kenney sprites
    this.sprite.setAngle(180); // Rotate enemies to face downward

    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Set hitbox to match sprite size (80% for better gameplay feel)
    const hitboxWidth = this.sprite.displayWidth * 0.8;
    const hitboxHeight = this.sprite.displayHeight * 0.8;
    this.body.setSize(hitboxWidth, hitboxHeight);
    this.body.setOffset(
      (this.sprite.width - hitboxWidth) / 2,
      (this.sprite.height - hitboxHeight) / 2
    );

    // Set velocity based on type and difficulty
    const speed = (GameConfig.enemy.baseSpeed + 
      Phaser.Math.Between(-GameConfig.enemy.speedVariation, GameConfig.enemy.speedVariation)) * 
      enemyConfig.speed * 
      speedMultiplier;
    
    this.body.setVelocityY(speed);

    // Create health bar for tanks
    if (type === 'tank') {
      this.createHealthBar();
    }
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    if (!this.healthBar) return;

    this.healthBar.clear();
    
    // Background (red)
    this.healthBar.fillStyle(0xff0000, 0.5);
    this.healthBar.fillRect(
      this.sprite.x - GameConfig.enemy.width / 2,
      this.sprite.y - 15,
      GameConfig.enemy.width,
      3
    );
    
    // Health (green)
    const healthPercent = this.health / this.maxHealth;
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(
      this.sprite.x - GameConfig.enemy.width / 2,
      this.sprite.y - 15,
      GameConfig.enemy.width * healthPercent,
      3
    );
  }

  takeDamage(damage: number): boolean {
    this.health -= damage;
    
    // Create bright white flash overlay
    const flash = this.scene.add.rectangle(
      this.sprite.x,
      this.sprite.y,
      this.sprite.displayWidth,
      this.sprite.displayHeight,
      0xffffff,
      0.8
    );
    flash.setDepth(this.sprite.depth + 1);
    
    // Fade out flash quickly
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        flash.destroy();
      }
    });

    this.updateHealthBar();
    
    return this.health <= 0;
  }

  update() {
    // Update health bar position
    if (this.healthBar) {
      this.updateHealthBar();
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  isOffScreen(): boolean {
    return this.sprite.y > this.scene.cameras.main.height + 50;
  }

  destroy() {
    this.sprite.destroy();
    this.healthBar?.destroy();
  }
}
