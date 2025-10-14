import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Enemy, EnemyType } from '../entities/Enemy';

export class WaveManager {
  private scene: Phaser.Scene;
  private currentWave: number = 1;
  private enemiesInWave: number = 0;
  private enemiesKilled: number = 0;
  private waveActive: boolean = false;
  
  public onWaveComplete?: () => void;
  public onWaveStart?: (wave: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  startWave() {
    this.enemiesInWave = this.getEnemiesForWave();
    this.enemiesKilled = 0;
    this.waveActive = true;
    
    if (this.onWaveStart) {
      this.onWaveStart(this.currentWave);
    }
  }

  getEnemiesForWave(): number {
    return GameConfig.waves.enemiesPerWave + 
           (this.currentWave - 1) * GameConfig.waves.waveIncrease;
  }

  getSpawnRate(): number {
    const rate = GameConfig.enemy.spawnRate - 
                 (this.currentWave - 1) * GameConfig.waves.spawnRateDecrease;
    return Math.max(rate, GameConfig.waves.minSpawnRate);
  }

  getSpeedMultiplier(): number {
    return 1 + (this.currentWave - 1) * GameConfig.waves.speedIncrease;
  }

  getEnemyType(): EnemyType {
    // Wave 1-2: Only basic enemies
    if (this.currentWave <= 2) {
      return 'basic';
    }
    
    // Wave 3-5: Basic and fast
    if (this.currentWave <= 5) {
      return Phaser.Math.Between(0, 100) < 70 ? 'basic' : 'fast';
    }
    
    // Wave 6+: All types with increasing tank chance
    const roll = Phaser.Math.Between(0, 100);
    const tankChance = Math.min(20 + (this.currentWave - 6) * 3, 40);
    
    if (roll < tankChance) {
      return 'tank';
    } else if (roll < tankChance + 30) {
      return 'fast';
    } else {
      return 'basic';
    }
  }

  createEnemy(x: number, y: number): Enemy {
    const type = this.getEnemyType();
    const speedMultiplier = this.getSpeedMultiplier();
    return new Enemy(this.scene, x, y, type, speedMultiplier);
  }

  recordEnemyKill() {
    this.enemiesKilled++;
    
    if (this.enemiesKilled >= this.enemiesInWave) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveActive = false;
    
    if (this.onWaveComplete) {
      this.onWaveComplete();
    }
    
    // Start next wave after delay
    this.scene.time.delayedCall(2000, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getWaveProgress(): { killed: number; total: number } {
    return {
      killed: this.enemiesKilled,
      total: this.enemiesInWave,
    };
  }

  isWaveActive(): boolean {
    return this.waveActive;
  }

  reset() {
    this.currentWave = 1;
    this.enemiesInWave = 0;
    this.enemiesKilled = 0;
    this.waveActive = false;
  }
}

