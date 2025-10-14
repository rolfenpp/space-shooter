import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { WaveManager } from './WaveManager';
import { GameConfig } from '../config/GameConfig';

export class GameManager {
  private scene: Phaser.Scene;
  
  // Entities
  public player!: Player;
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public powerups: PowerUp[] = [];
  
  // Managers
  public waveManager: WaveManager;
  
  // Game state
  public score: number = 0;
  public gameOver: boolean = false;
  
  // UI Text
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private powerUpText!: Phaser.GameObjects.Text;
  
  // Spawn timer
  private spawnTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.waveManager = new WaveManager(scene);
  }

  initialize() {
    const centerX = this.scene.cameras.main.width * GameConfig.player.startX;
    const bottomY = this.scene.cameras.main.height * GameConfig.player.startY;
    
    this.player = new Player(this.scene, centerX, bottomY);
    
    // Setup UI
    this.createUI();
    
    // Setup wave callbacks
    this.waveManager.onWaveStart = (wave) => {
      this.updateWaveText();
      this.showWaveNotification(wave);
      this.startEnemySpawning();
    };
    
    this.waveManager.onWaveComplete = () => {
      this.stopEnemySpawning();
      this.addScore(GameConfig.scoring.waveComplete);
      this.showWaveCompleteNotification();
    };
    
    // Start first wave
    this.waveManager.startWave();
  }

  createUI() {
    const padding = 16;
    
    this.scoreText = this.scene.add.text(padding, padding, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    });
    
    this.waveText = this.scene.add.text(
      this.scene.cameras.main.width - padding,
      padding,
      'Wave: 1',
      {
        fontSize: '24px',
        color: '#fff',
      }
    ).setOrigin(1, 0);
    
    this.healthText = this.scene.add.text(
      padding,
      padding + 35,
      'Health: ♥♥♥',
      {
        fontSize: '20px',
        color: '#ff0000',
      }
    );
    
    this.powerUpText = this.scene.add.text(
      padding,
      padding + 65,
      '',
      {
        fontSize: '16px',
        color: '#ffff00',
      }
    );
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.waveText.setText(`Wave: ${this.waveManager.getCurrentWave()}`);
    this.healthText.setText(`Health: ${'♥'.repeat(this.player.health)}`);
    
    // Update power-up text
    const activePowerUps: string[] = [];
    if (this.player.hasRapidFire) activePowerUps.push('🔥 Rapid Fire');
    if (this.player.hasMultiShot) activePowerUps.push('⚡ Multi-Shot');
    if (this.player.hasShield) activePowerUps.push('🛡️ Shield');
    
    this.powerUpText.setText(activePowerUps.join(' | '));
  }

  updateWaveText() {
    const progress = this.waveManager.getWaveProgress();
    this.waveText.setText(`Wave ${this.waveManager.getCurrentWave()} (${progress.killed}/${progress.total})`);
  }

  showWaveNotification(wave: number) {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    const text = this.scene.add.text(centerX, centerY, `Wave ${wave}`, {
      fontSize: '48px',
      color: '#00ff00',
    }).setOrigin(0.5).setAlpha(0);
    
    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      y: centerY - 50,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.scene.tweens.add({
          targets: text,
          alpha: 0,
          duration: 500,
          delay: 1000,
          onComplete: () => text.destroy(),
        });
      },
    });
  }

  showWaveCompleteNotification() {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    const text = this.scene.add.text(centerX, centerY, 'Wave Complete!', {
      fontSize: '36px',
      color: '#ffff00',
    }).setOrigin(0.5).setAlpha(0);
    
    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.scene.tweens.add({
          targets: text,
          alpha: 0,
          duration: 300,
          delay: 1000,
          onComplete: () => text.destroy(),
        });
      },
    });
  }

  startEnemySpawning() {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.waveManager.getSpawnRate(),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  stopEnemySpawning() {
    this.spawnTimer?.remove();
  }

  spawnEnemy() {
    if (this.gameOver) return;
    
    const progress = this.waveManager.getWaveProgress();
    if (progress.killed >= progress.total) {
      return;
    }
    
    const x = Phaser.Math.Between(30, this.scene.cameras.main.width - 30);
    const enemy = this.waveManager.createEnemy(x, -30);
    this.enemies.push(enemy);
  }

  shootBullet() {
    const pos = this.player.getPosition();
    
    if (this.player.hasMultiShot) {
      // Shoot 3 bullets
      const spread = 20;
      this.bullets.push(new Bullet(this.scene, pos.x - spread, pos.y - 20, this.player.bulletDamage));
      this.bullets.push(new Bullet(this.scene, pos.x, pos.y - 20, this.player.bulletDamage));
      this.bullets.push(new Bullet(this.scene, pos.x + spread, pos.y - 20, this.player.bulletDamage));
    } else {
      // Shoot single bullet
      this.bullets.push(new Bullet(this.scene, pos.x, pos.y - 20, this.player.bulletDamage));
    }
  }

  spawnPowerUp(x: number, y: number) {
    const roll = Math.random();
    let type: PowerUpType;
    
    if (roll < 0.33) {
      type = 'rapidFire';
    } else if (roll < 0.66) {
      type = 'multiShot';
    } else {
      type = 'shield';
    }
    
    this.powerups.push(new PowerUp(this.scene, x, y, type));
  }

  addScore(points: number) {
    this.score += points;
    this.updateUI();
  }

  handleBulletEnemyCollision(bullet: Bullet, enemy: Enemy) {
    const isDead = enemy.takeDamage(bullet.damage);
    bullet.destroy();
    
    const bulletIndex = this.bullets.indexOf(bullet);
    if (bulletIndex > -1) {
      this.bullets.splice(bulletIndex, 1);
    }
    
    if (isDead) {
      this.addScore(enemy.scoreValue);
      this.waveManager.recordEnemyKill();
      this.updateWaveText();
      
      const pos = enemy.getPosition();
      enemy.destroy();
      
      const enemyIndex = this.enemies.indexOf(enemy);
      if (enemyIndex > -1) {
        this.enemies.splice(enemyIndex, 1);
      }
      
      // Chance to spawn power-up
      if (Math.random() < GameConfig.powerups.spawnChance) {
        this.spawnPowerUp(pos.x, pos.y);
      }
    }
  }

  handlePlayerEnemyCollision(enemy: Enemy) {
    const isDead = this.player.takeDamage();
    this.updateUI();
    
    enemy.destroy();
    const enemyIndex = this.enemies.indexOf(enemy);
    if (enemyIndex > -1) {
      this.enemies.splice(enemyIndex, 1);
    }
    
    if (isDead) {
      this.triggerGameOver();
    }
  }

  handlePlayerPowerUpCollision(powerup: PowerUp) {
    this.player.activatePowerUp(powerup.type);
    this.updateUI();
    
    powerup.destroy();
    const powerupIndex = this.powerups.indexOf(powerup);
    if (powerupIndex > -1) {
      this.powerups.splice(powerupIndex, 1);
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.stopEnemySpawning();
    
    // Stop all enemies
    this.enemies.forEach(enemy => {
      enemy.body.setVelocity(0, 0);
    });
    
    // Show game over UI
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    this.scene.add.text(centerX, centerY - 50, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
    }).setOrigin(0.5);
    
    this.scene.add.text(centerX, centerY + 20, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#fff',
    }).setOrigin(0.5);
    
    this.scene.add.text(centerX, centerY + 70, `Waves Completed: ${this.waveManager.getCurrentWave() - 1}`, {
      fontSize: '24px',
      color: '#fff',
    }).setOrigin(0.5);
    
    const restartText = this.scene.add.text(centerX, centerY + 120, 'Click to Restart', {
      fontSize: '24px',
      color: '#00ff00',
    }).setOrigin(0.5);
    
    restartText.setInteractive();
    restartText.on('pointerdown', () => {
      this.scene.scene.restart();
    });
  }

  update() {
    if (this.gameOver) return;
    
    // Update enemies
    this.enemies.forEach((enemy, index) => {
      enemy.update();
      
      if (enemy.isOffScreen()) {
        enemy.destroy();
        this.enemies.splice(index, 1);
      }
    });
    
    // Update bullets
    this.bullets.forEach((bullet, index) => {
      if (bullet.isOffScreen()) {
        bullet.destroy();
        this.bullets.splice(index, 1);
      }
    });
    
    // Update powerups
    this.powerups.forEach((powerup, index) => {
      if (powerup.isOffScreen()) {
        powerup.destroy();
        this.powerups.splice(index, 1);
      }
    });
    
    // Check collisions
    this.checkCollisions();
  }

  checkCollisions() {
    // Bullet-Enemy collisions
    for (const bullet of this.bullets) {
      for (const enemy of this.enemies) {
        if (this.scene.physics.overlap(bullet.sprite, enemy.sprite)) {
          this.handleBulletEnemyCollision(bullet, enemy);
          break;
        }
      }
    }
    
    // Player-Enemy collisions
    for (const enemy of this.enemies) {
      if (this.scene.physics.overlap(this.player.sprite, enemy.sprite)) {
        this.handlePlayerEnemyCollision(enemy);
        break;
      }
    }
    
    // Player-PowerUp collisions
    for (const powerup of this.powerups) {
      if (this.scene.physics.overlap(this.player.sprite, powerup.sprite)) {
        this.handlePlayerPowerUpCollision(powerup);
        break;
      }
    }
  }

  cleanup() {
    this.enemies.forEach(e => e.destroy());
    this.bullets.forEach(b => b.destroy());
    this.powerups.forEach(p => p.destroy());
    this.player.destroy();
  }
}

