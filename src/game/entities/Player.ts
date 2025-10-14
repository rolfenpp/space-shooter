import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Player {
  public sprite: Phaser.GameObjects.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  private scene: Phaser.Scene;
  private shieldCircle?: Phaser.GameObjects.Graphics;
  
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
  
  // Upgrade states
  public hasPiercing: boolean = false;
  public hasLifeSteal: boolean = false;
  
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
    this.sprite = scene.add.sprite(x, y, 'player-ship');
    this.sprite.setScale(.5); // Scale down Kenney sprites

    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    
    // Set hitbox to match sprite size (80% of sprite for better gameplay)
    const hitboxWidth = this.sprite.displayWidth * 0.8;
    const hitboxHeight = this.sprite.displayHeight * 0.8;
    this.body.setSize(hitboxWidth, hitboxHeight);
    this.body.setOffset(
      (this.sprite.width - hitboxWidth) / 2,
      (this.sprite.height - hitboxHeight) / 2
    );

    // Create shield graphics
    this.shieldCircle = scene.add.graphics();
    this.updateShieldVisual();
  }

  moveLeft() {
    this.sprite.x -= this.speed;
    this.updateShieldPosition();
  }

  moveRight() {
    this.sprite.x += this.speed;
    this.updateShieldPosition();
  }

  setX(x: number) {
    this.sprite.x = Phaser.Math.Clamp(
      x,
      GameConfig.player.width / 2,
      this.scene.cameras.main.width - GameConfig.player.width / 2
    );
    this.updateShieldPosition();
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
      this.updateShieldVisual();
      
      // Flash effect for shield break
      const flash = this.scene.add.rectangle(
        this.sprite.x,
        this.sprite.y,
        this.sprite.displayWidth,
        this.sprite.displayHeight,
        0x00ffff,
        0.8
      );
      flash.setDepth(this.sprite.depth + 1);
      
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        onComplete: () => flash.destroy()
      });
      
      return false; // Shield absorbed damage
    }
    
    this.health--;
    
    // Create red flash overlay
    const flash = this.scene.add.rectangle(
      this.sprite.x,
      this.sprite.y,
      this.sprite.displayWidth,
      this.sprite.displayHeight,
      0xff0000,
      0.8
    );
    flash.setDepth(this.sprite.depth + 1);
    
    // Fade out flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        flash.destroy();
      }
    });
    
    return this.health <= 0;
  }

  activatePowerUp(type: 'rapidFire' | 'multiShot' | 'shield') {
    const duration = GameConfig.powerups.duration;
    
    switch (type) {
      case 'rapidFire':
        this.hasRapidFire = true;
        this.sprite.setTint(0xffff00);
        this.scene.time.delayedCall(duration, () => {
          this.hasRapidFire = false;
          if (!this.hasMultiShot) {
            this.sprite.clearTint();
          }
        });
        break;
        
      case 'multiShot':
        this.hasMultiShot = true;
        this.sprite.setTint(0x00ffff);
        this.scene.time.delayedCall(duration, () => {
          this.hasMultiShot = false;
          if (!this.hasRapidFire) {
            this.sprite.clearTint();
          }
        });
        break;
        
      case 'shield':
        this.hasShield = true;
        this.updateShieldVisual();
        break;
    }
  }

  updateShieldVisual() {
    if (!this.shieldCircle) return;
    
    this.shieldCircle.clear();
    
    if (this.hasShield) {
      this.shieldCircle.lineStyle(3, 0x00ffff, 0.6);
      this.shieldCircle.strokeCircle(this.sprite.x, this.sprite.y, 25);
      
      // Add pulsing effect
      this.scene.tweens.add({
        targets: this.shieldCircle,
        alpha: { from: 0.6, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  updateShieldPosition() {
    if (this.hasShield && this.shieldCircle) {
      this.shieldCircle.clear();
      this.shieldCircle.lineStyle(3, 0x00ffff, 0.6);
      this.shieldCircle.strokeCircle(this.sprite.x, this.sprite.y, 25);
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    this.sprite.destroy();
    this.shieldCircle?.destroy();
  }
}
