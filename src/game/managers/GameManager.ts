import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { PowerUp, type PowerUpType } from '../entities/PowerUp';
import { WaveManager } from './WaveManager';
import { LevelManager } from './LevelManager';
import { UpgradeUI } from '../ui/UpgradeUI';
import { GameConfig } from '../config/GameConfig';
import { FontConfig } from '../config/FontConfig';

export class GameManager {
  private scene: Phaser.Scene;
  
  // Entities
  public player!: Player;
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public powerups: PowerUp[] = [];
  
  // Managers
  public waveManager: WaveManager;
  public levelManager: LevelManager;
  private upgradeUI: UpgradeUI;
  
  // Game state
  public score: number = 0;
  public gameOver: boolean = false;
  public isPaused: boolean = false;
  
  // UI Text
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private powerUpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private xpBar!: Phaser.GameObjects.Graphics;
  private pauseButton!: Phaser.GameObjects.Text;
  private pauseMenu?: Phaser.GameObjects.Container;
  private pauseOverlay?: Phaser.GameObjects.Rectangle;
  
  // Spawn timer
  private spawnTimer?: Phaser.Time.TimerEvent;
  
  // Store velocities during pause
  private pausedEnemyVelocities: Map<Enemy, { x: number; y: number }> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.waveManager = new WaveManager(scene);
    this.levelManager = new LevelManager(scene);
    this.upgradeUI = new UpgradeUI(scene);
    
    // Setup level up callback
    this.levelManager.onLevelUp = (upgrades) => {
      this.pauseForUpgrade(upgrades);
    };
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
      ...FontConfig.styles.body,
      color: '#00ffff',
    });
    
    this.waveText = this.scene.add.text(
      this.scene.cameras.main.width - padding,
      padding,
      'Wave: 1',
      {
        ...FontConfig.styles.body,
        color: '#00ffff',
      }
    ).setOrigin(1, 0);
    
    this.healthText = this.scene.add.text(
      padding,
      padding + 35,
      'Health: ♥♥♥',
      {
        ...FontConfig.styles.small,
        color: '#ff0055',
      }
    );
    
    this.powerUpText = this.scene.add.text(
      padding,
      padding + 65,
      '',
      {
        ...FontConfig.styles.tiny,
        color: '#ffff00',
      }
    );
    
    // Level display
    this.levelText = this.scene.add.text(
      padding,
      padding + 95,
      'Level: 1',
      {
        ...FontConfig.styles.smallBold,
        color: '#00ff00',
      }
    );
    
    // XP Bar
    this.xpBar = this.scene.add.graphics();
    this.updateXPBar();
    
    // Pause button (top right)
    this.pauseButton = this.scene.add.text(
      this.scene.cameras.main.width - padding,
      padding + 35,
      '⏸️ PAUSE',
      {
        ...FontConfig.styles.smallBold,
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 },
      }
    ).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(100);
    
    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });
    
    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setStyle({ backgroundColor: '#555555' });
    });
    
    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setStyle({ backgroundColor: '#333333' });
    });
  }
  
  updateXPBar() {
    this.xpBar.clear();
    
    const padding = 16;
    const barWidth = 200;
    const barHeight = 10;
    const x = padding;
    const y = padding + 125;
    
    // Background
    this.xpBar.fillStyle(0x333333, 1);
    this.xpBar.fillRect(x, y, barWidth, barHeight);
    
    // Progress
    const progress = this.levelManager.getXPProgress();
    this.xpBar.fillStyle(0x00ff00, 1);
    this.xpBar.fillRect(x, y, barWidth * progress, barHeight);
    
    // Border
    this.xpBar.lineStyle(2, 0xffffff, 1);
    this.xpBar.strokeRect(x, y, barWidth, barHeight);
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.waveText.setText(`Wave: ${this.waveManager.getCurrentWave()}`);
    this.healthText.setText(`Health: ${'♥'.repeat(this.player.health)}`);
    this.levelText.setText(`Level: ${this.levelManager.getCurrentLevel()}`);
    
    // Update power-up text
    const activePowerUps: string[] = [];
    if (this.player.hasRapidFire) activePowerUps.push('🔥 Rapid Fire');
    if (this.player.hasMultiShot) activePowerUps.push('⚡ Multi-Shot');
    if (this.player.hasShield) activePowerUps.push('🛡️ Shield');
    
    this.powerUpText.setText(activePowerUps.join(' | '));
    
    // Update XP bar
    this.updateXPBar();
  }

  updateWaveText() {
    const progress = this.waveManager.getWaveProgress();
    this.waveText.setText(`Wave ${this.waveManager.getCurrentWave()} (${progress.killed}/${progress.total})`);
  }

  showWaveNotification(wave: number) {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    
    const text = this.scene.add.text(centerX, centerY, `Wave ${wave}`, {
      ...FontConfig.styles.huge,
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
      ...FontConfig.styles.subtitle,
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
    
    // Only destroy bullet if not piercing
    if (!this.player.hasPiercing) {
      bullet.destroy();
      
      const bulletIndex = this.bullets.indexOf(bullet);
      if (bulletIndex > -1) {
        this.bullets.splice(bulletIndex, 1);
      }
    }
    
    if (isDead) {
      this.addScore(enemy.scoreValue);
      this.waveManager.recordEnemyKill();
      this.updateWaveText();
      
      // Award XP (10 XP per enemy)
      const leveledUp = this.levelManager.addXP(10);
      if (leveledUp) {
        this.updateUI();
      }
      
      // Life steal chance
      if (this.player.hasLifeSteal && Math.random() < 0.1) {
        if (this.player.health < this.player.maxHealth) {
          this.player.health++;
          this.updateUI();
          
          // Show heal effect
          const healText = this.scene.add.text(
            this.player.getPosition().x,
            this.player.getPosition().y - 30,
            '+1',
            { fontSize: '20px', color: '#00ff00', fontStyle: 'bold' }
          ).setOrigin(0.5);
          
          this.scene.tweens.add({
            targets: healText,
            y: healText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => healText.destroy(),
          });
        }
      }
      
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

  togglePause() {
    if (this.gameOver) return;
    
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;
    
    // Stop all enemies and store their velocities
    this.pausedEnemyVelocities.clear();
    this.enemies.forEach(enemy => {
      const vx = enemy.body.velocity.x;
      const vy = enemy.body.velocity.y;
      this.pausedEnemyVelocities.set(enemy, { x: vx, y: vy });
      enemy.body.setVelocity(0, 0);
    });
    
    // Stop all bullets
    this.bullets.forEach(bullet => {
      bullet.body.setVelocity(0, 0);
    });
    
    // Stop all powerups
    this.powerups.forEach(powerup => {
      powerup.body.setVelocity(0, 0);
    });
    
    // Update pause button
    this.pauseButton.setText('▶️ RESUME');
    
    // Show pause menu
    this.showPauseMenu();
  }

  resumeGame() {
    // Restore enemy velocities
    this.enemies.forEach(enemy => {
      const velocity = this.pausedEnemyVelocities.get(enemy);
      if (velocity) {
        enemy.body.setVelocity(velocity.x, velocity.y);
      }
    });
    
    // Restore bullet velocities
    this.bullets.forEach(bullet => {
      bullet.body.setVelocityY(-GameConfig.bullet.speed);
    });
    
    // Restore powerup velocities
    this.powerups.forEach(powerup => {
      powerup.body.setVelocityY(GameConfig.powerups.fallSpeed);
    });
    
    this.isPaused = false;
    
    // Update pause button
    this.pauseButton.setText('⏸️ PAUSE');
    
    // Hide pause menu
    this.hidePauseMenu();
  }

  showPauseMenu() {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Dark overlay
    this.pauseOverlay = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.7
    );
    this.pauseOverlay.setOrigin(0, 0);
    this.pauseOverlay.setDepth(1000);

    this.pauseMenu = this.scene.add.container(0, 0);
    this.pauseMenu.setDepth(1001);

    // Pause title
    const title = this.scene.add.text(centerX, centerY - 80, 'PAUSED', {
      ...FontConfig.styles.title,
      color: '#00ffff',
    }).setOrigin(0.5);

    // Resume button
    const resumeButton = this.scene.add.rectangle(centerX, centerY + 20, 250, 60, 0x00aa00, 1);
    const resumeText = this.scene.add.text(centerX, centerY + 20, '▶️ RESUME', {
      ...FontConfig.styles.subtitle,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    resumeButton.setInteractive({ useHandCursor: true });
    
    resumeButton.on('pointerover', () => {
      resumeButton.setFillStyle(0x00ff00);
    });

    resumeButton.on('pointerout', () => {
      resumeButton.setFillStyle(0x00aa00);
    });

    resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });

    // Restart button
    const restartButton = this.scene.add.rectangle(centerX, centerY + 100, 250, 60, 0xaa0000, 1);
    const restartText = this.scene.add.text(centerX, centerY + 100, '🔄 RESTART', {
      ...FontConfig.styles.subtitle,
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    restartButton.setInteractive({ useHandCursor: true });
    
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0xff0000);
    });

    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0xaa0000);
    });

    restartButton.on('pointerdown', () => {
      this.scene.scene.restart();
    });

    this.pauseMenu.add([title, resumeButton, resumeText, restartButton, restartText]);

    // Pulsing animation for title
    this.scene.tweens.add({
      targets: title,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  hidePauseMenu() {
    this.pauseOverlay?.destroy();
    this.pauseMenu?.destroy();
  }

  pauseForUpgrade(upgrades: any[]) {
    this.isPaused = true;
    
    // Stop all enemies and store their velocities
    this.pausedEnemyVelocities.clear();
    this.enemies.forEach(enemy => {
      const vx = enemy.body.velocity.x;
      const vy = enemy.body.velocity.y;
      this.pausedEnemyVelocities.set(enemy, { x: vx, y: vy });
      enemy.body.setVelocity(0, 0);
    });
    
    // Stop all bullets
    this.bullets.forEach(bullet => {
      bullet.body.setVelocity(0, 0);
    });
    
    // Stop all powerups
    this.powerups.forEach(powerup => {
      powerup.body.setVelocity(0, 0);
    });
    
    // Show upgrade UI
    this.upgradeUI.show(this.levelManager.getCurrentLevel(), upgrades, (upgrade) => {
      // Apply upgrade to player
      upgrade.apply(this.player);
      
      // Resume game - restore enemy velocities
      this.enemies.forEach(enemy => {
        const velocity = this.pausedEnemyVelocities.get(enemy);
        if (velocity) {
          enemy.body.setVelocity(velocity.x, velocity.y);
        }
      });
      
      // Restore bullet velocities
      this.bullets.forEach(bullet => {
        bullet.body.setVelocityY(-GameConfig.bullet.speed);
      });
      
      // Restore powerup velocities
      this.powerups.forEach(powerup => {
        powerup.body.setVelocityY(GameConfig.powerups.fallSpeed);
      });
      
      this.isPaused = false;
      this.updateUI();
      
      // Show upgrade notification
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;
      
      const upgradeNotif = this.scene.add.text(
        centerX,
        centerY - 100,
        `${upgrade.icon} ${upgrade.name}`,
        { ...FontConfig.styles.subtitle, color: '#00ff00' }
      ).setOrigin(0.5).setDepth(999);
      
      this.scene.tweens.add({
        targets: upgradeNotif,
        y: centerY - 150,
        alpha: 0,
        duration: 1500,
        onComplete: () => upgradeNotif.destroy(),
      });
    });
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
      ...FontConfig.styles.title,
      color: '#ff0055',
    }).setOrigin(0.5);
    
    this.scene.add.text(centerX, centerY + 20, `Final Score: ${this.score}`, {
      ...FontConfig.styles.subtitle,
      color: '#00ffff',
    }).setOrigin(0.5);
    
    this.scene.add.text(centerX, centerY + 70, `Waves Completed: ${this.waveManager.getCurrentWave() - 1}`, {
      ...FontConfig.styles.body,
      color: '#ffffff',
    }).setOrigin(0.5);
    
    const restartText = this.scene.add.text(centerX, centerY + 120, 'Click to Restart', {
      ...FontConfig.styles.body,
      color: '#00ff00',
    }).setOrigin(0.5);
    
    restartText.setInteractive();
    restartText.on('pointerdown', () => {
      this.scene.scene.restart();
    });
  }

  update() {
    if (this.gameOver || this.isPaused) return;
    
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

