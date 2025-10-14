import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Player {
  public sprite: Phaser.GameObjects.Graphics;
  public body: Phaser.Physics.Arcade.Body;
  private scene: Phaser.Scene;
  
  // Player stats (can be upgraded)
  public speed: number;
  public fireRate: number;
  public health: number;
  public maxHealth: number;
  public bulletDamage: number;
  
  // Power-up states
  public hasRapidFire: boolean = false;
  public hasMultiShot: boolean = false;
  public hasShield: boolean = false;
  
  private lastFired: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Initialize stats from config
    this.speed = GameConfig.player.speed;
    this.fireRate = GameConfig.player.fireRate;
    this.health = GameConfig.player.maxHealth;
    this.maxHealth = GameConfig.player.maxHealth;
    this.bulletDamage = GameConfig.bullet.damage;

    // Create player sprite
    this.sprite = scene.add.graphics();
    this.sprite.fillStyle(GameConfig.player.color, 1);
    this.sprite.fillTriangle(
      0, -GameConfig.player.height / 2,
      -GameConfig.player.width / 2, GameConfig.player.height / 2,
      GameConfig.player.width / 2, GameConfig.player.height / 2
    );
    this.sprite.setPosition(x, y);

    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setSize(GameConfig.player.width, GameConfig.player.height);
  }

  moveLeft() {
    this.sprite.x -= this.speed;
  }

  moveRight() {
    this.sprite.x += this.speed;
  }

  setX(x: number) {
    this.sprite.x = Phaser.Math.Clamp(
      x,
      GameConfig.player.width / 2,
      this.scene.cameras.main.width - GameConfig.player.width / 2
    );
  }

  canShoot(time: number): boolean {
    const currentFireRate = this.hasRapidFire 
      ? this.fireRate * GameConfig.powerups.types.rapidFire.fireRateMultiplier
      : this.fireRate;
    
    return time > this.lastFired + currentFireRate;
  }

  recordShot(time: number) {
    this.lastFired = time;
  }

  takeDamage() {
    if (this.hasShield) {
      this.hasShield = false;
      return false; // Shield absorbed damage
    }
    
    this.health--;
    
    // Flash red when hit
    this.sprite.clear();
    this.sprite.fillStyle(0xff0000, 1);
    this.sprite.fillTriangle(
      0, -GameConfig.player.height / 2,
      -GameConfig.player.width / 2, GameConfig.player.height / 2,
      GameConfig.player.width / 2, GameConfig.player.height / 2
    );
    
    // Return to normal after 200ms
    this.scene.time.delayedCall(200, () => {
      this.sprite.clear();
      const color = this.hasShield ? 0x0088ff : GameConfig.player.color;
      this.sprite.fillStyle(color, 1);
      this.sprite.fillTriangle(
        0, -GameConfig.player.height / 2,
        -GameConfig.player.width / 2, GameConfig.player.height / 2,
        GameConfig.player.width / 2, GameConfig.player.height / 2
      );
    });
    
    return this.health <= 0;
  }

  activatePowerUp(type: 'rapidFire' | 'multiShot' | 'shield') {
    const duration = GameConfig.powerups.duration;
    
    switch (type) {
      case 'rapidFire':
        this.hasRapidFire = true;
        this.scene.time.delayedCall(duration, () => {
          this.hasRapidFire = false;
        });
        break;
        
      case 'multiShot':
        this.hasMultiShot = true;
        this.scene.time.delayedCall(duration, () => {
          this.hasMultiShot = false;
        });
        break;
        
      case 'shield':
        this.hasShield = true;
        this.updateShieldVisual();
        break;
    }
  }

  updateShieldVisual() {
    this.sprite.clear();
    const color = this.hasShield ? 0x0088ff : GameConfig.player.color;
    this.sprite.fillStyle(color, 1);
    this.sprite.fillTriangle(
      0, -GameConfig.player.height / 2,
      -GameConfig.player.width / 2, GameConfig.player.height / 2,
      GameConfig.player.width / 2, GameConfig.player.height / 2
    );
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    this.sprite.destroy();
  }
}

