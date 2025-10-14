// Game Configuration - Easy to tune and balance
export const GameConfig = {
  // Player settings
  player: {
    speed: 5,
    startX: 0.5, // percentage of screen width
    startY: 0.85, // percentage of screen height
    width: 30,
    height: 40,
    color: 0x00ff00,
    fireRate: 200, // milliseconds between shots
    maxHealth: 3,
  },

  // Bullet settings
  bullet: {
    speed: 400,
    width: 4,
    height: 10,
    color: 0xffff00,
    damage: 1,
  },

  // Enemy settings
  enemy: {
    baseSpeed: 100,
    speedVariation: 50,
    spawnRate: 1000, // milliseconds
    width: 30,
    height: 30,
    scoreValue: 10,
    types: {
      basic: {
        color: 0xff0000,
        health: 1,
        speed: 1,
        scoreValue: 10,
      },
      fast: {
        color: 0xff8800,
        health: 1,
        speed: 1.8,
        scoreValue: 15,
      },
      tank: {
        color: 0x8800ff,
        health: 3,
        speed: 0.6,
        scoreValue: 30,
      },
    },
  },

  // Power-up settings
  powerups: {
    spawnChance: 0.15, // 15% chance on enemy kill
    duration: 5000, // milliseconds
    fallSpeed: 150,
    types: {
      rapidFire: {
        color: 0xffff00,
        fireRateMultiplier: 0.5, // Shoots twice as fast
      },
      multiShot: {
        color: 0x00ffff,
        bulletCount: 3, // Shoots 3 bullets
      },
      shield: {
        color: 0x0088ff,
        extraLives: 1,
      },
    },
  },

  // Wave/Difficulty settings
  waves: {
    startWave: 1,
    enemiesPerWave: 10,
    waveIncrease: 5, // enemies added per wave
    speedIncrease: 0.1, // 10% speed increase per wave
    spawnRateDecrease: 50, // spawn 50ms faster each wave
    minSpawnRate: 300, // fastest spawn rate
  },

  // Score settings
  scoring: {
    enemyKill: 10,
    waveComplete: 100,
    perfectWave: 200, // bonus for no damage taken
  },
};

