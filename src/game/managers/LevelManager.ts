import Phaser from 'phaser';

export type UpgradeType = 
  | 'damage' 
  | 'fireRate' 
  | 'speed' 
  | 'health' 
  | 'multiShot' 
  | 'piercing'
  | 'lifeSteal';

export interface Upgrade {
  type: UpgradeType;
  name: string;
  description: string;
  icon: string;
  apply: (player: any) => void;
}

export class LevelManager {
  private currentLevel: number = 1;
  private currentXP: number = 0;
  private xpToNextLevel: number = 100;
  
  public onLevelUp?: (upgrades: Upgrade[]) => void;

  constructor(_scene: Phaser.Scene) {
    // Scene passed for future use if needed
  }

  addXP(amount: number): boolean {
    this.currentXP += amount;
    
    if (this.currentXP >= this.xpToNextLevel) {
      this.levelUp();
      return true;
    }
    return false;
  }

  levelUp() {
    this.currentLevel++;
    this.currentXP -= this.xpToNextLevel;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5); // 50% more XP needed each level
    
    // Generate 3 random upgrade options
    const upgrades = this.generateUpgradeOptions();
    
    if (this.onLevelUp) {
      this.onLevelUp(upgrades);
    }
  }

  generateUpgradeOptions(): Upgrade[] {
    const allUpgrades: Upgrade[] = [
      {
        type: 'damage',
        name: '🔥 Damage Boost',
        description: '+1 Bullet Damage',
        icon: '🔥',
        apply: (player) => {
          player.bulletDamage += 1;
        }
      },
      {
        type: 'fireRate',
        name: '⚡ Rapid Fire',
        description: '-20% Fire Rate (Faster)',
        icon: '⚡',
        apply: (player) => {
          player.fireRate *= 0.8;
        }
      },
      {
        type: 'speed',
        name: '💨 Speed Boost',
        description: '+2 Movement Speed',
        icon: '💨',
        apply: (player) => {
          player.speed += 2;
        }
      },
      {
        type: 'health',
        name: '❤️ Max Health',
        description: '+1 Max Health & Heal',
        icon: '❤️',
        apply: (player) => {
          player.maxHealth += 1;
          player.health = player.maxHealth;
        }
      },
      {
        type: 'multiShot',
        name: '🎯 Multi-Shot',
        description: 'Permanent 3-bullet spread',
        icon: '🎯',
        apply: (player) => {
          player.hasMultiShot = true;
        }
      },
      {
        type: 'piercing',
        name: '⚔️ Piercing Shots',
        description: 'Bullets pierce enemies',
        icon: '⚔️',
        apply: (player) => {
          player.hasPiercing = true;
        }
      },
      {
        type: 'lifeSteal',
        name: '🩸 Life Steal',
        description: '10% chance to heal on kill',
        icon: '🩸',
        apply: (player) => {
          player.hasLifeSteal = true;
        }
      },
    ];

    // Shuffle and pick 3
    const shuffled = Phaser.Utils.Array.Shuffle([...allUpgrades]);
    return shuffled.slice(0, 3);
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getCurrentXP(): number {
    return this.currentXP;
  }

  getXPToNextLevel(): number {
    return this.xpToNextLevel;
  }

  getXPProgress(): number {
    return this.currentXP / this.xpToNextLevel;
  }

  reset() {
    this.currentLevel = 1;
    this.currentXP = 0;
    this.xpToNextLevel = 100;
  }
}

