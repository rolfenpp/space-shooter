# Space Shooter Game 🚀

An addictive 2D space shooter game built with React, TypeScript, and Phaser 3. Works on both desktop and mobile!

## Features

### Core Gameplay
- 🎮 **Spaceship Control** - Smooth player movement at the bottom of the screen
- 👾 **Wave-Based Enemies** - Progressive difficulty with enemy waves
- 💥 **Combat System** - Shoot bullets to destroy enemies
- 📱 **Mobile Support** - Touch controls for mobile devices
- ⌨️ **Keyboard Controls** - Arrow keys + space bar for desktop

### Enemy Types
- **Basic (Red)** - Standard enemy, 1 HP, 10 points
- **Fast (Orange)** - Moves 1.8x faster, 1 HP, 15 points
- **Tank (Purple)** - Slower but 3 HP with health bar, 30 points

### Power-Ups
- ⚡ **Rapid Fire** (Yellow) - Shoots twice as fast for 5 seconds
- 🔫 **Multi-Shot** (Cyan) - Shoots 3 bullets at once for 5 seconds
- 🛡️ **Shield** (Blue) - Absorbs one hit

### Difficulty Scaling
- Enemies spawn faster each wave
- Enemy speed increases each wave
- More enemies per wave
- Advanced enemy types appear in later waves

## Architecture

The game is built with a **modular, scalable architecture** that makes it easy to add new features:

```
src/game/
├── config/
│   └── GameConfig.ts        # Central config for easy balancing
├── entities/
│   ├── Player.ts             # Player class with upgradeable stats
│   ├── Enemy.ts              # Enemy class with different types
│   ├── Bullet.ts             # Bullet projectiles
│   └── PowerUp.ts            # Power-up collectibles
├── managers/
│   ├── GameManager.ts        # Main game coordinator
│   └── WaveManager.ts        # Wave progression & difficulty
├── GameScene.ts              # Phaser scene (input handling)
└── Game.tsx                  # React component wrapper
```

### Key Design Patterns

1. **Entity System** - Each game object (Player, Enemy, Bullet, PowerUp) is a separate class
2. **Manager Pattern** - GameManager coordinates all entities, WaveManager handles difficulty
3. **Configuration-Driven** - All values in `GameConfig.ts` for easy tuning
4. **Separation of Concerns** - Clear boundaries between rendering, logic, and state

## Controls

### Desktop
- **Arrow Left/Right**: Move spaceship
- **Space**: Shoot

### Mobile
- **Drag**: Move spaceship left/right
- **Tap/Release**: Shoot

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How to Extend

### Add a New Enemy Type

1. Add config in `GameConfig.ts`:
```typescript
enemy: {
  types: {
    yourType: {
      color: 0xff00ff,
      health: 2,
      speed: 1.2,
      scoreValue: 20,
    }
  }
}
```

2. Update `WaveManager.ts` to spawn your type at certain waves

### Add a New Power-Up

1. Add config in `GameConfig.ts`:
```typescript
powerups: {
  types: {
    yourPowerup: {
      color: 0x00ff00,
      // custom properties...
    }
  }
}
```

2. Add activation logic in `Player.ts`
3. Update `GameManager.ts` spawn logic

### Adjust Difficulty

Simply edit values in `GameConfig.ts`:
- `waves.speedIncrease` - How much faster enemies get per wave
- `waves.spawnRateDecrease` - How much faster enemies spawn
- `enemy.baseSpeed` - Base enemy speed
- `powerups.spawnChance` - How often power-ups drop

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Phaser 3** - Game engine
- **Vite** - Build tool

## Scoring System

- Enemy Kill: 10-30 points (based on type)
- Wave Complete: +100 points
- Power-ups increase survival and score potential

## Future Features (Planned)

- [ ] IP tracking with email notifications
- [ ] Boss battles
- [ ] Different weapon types
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] High score leaderboard
- [ ] Local storage for high scores
- [ ] Player ship upgrades between waves
- [ ] More enemy patterns and behaviors

## License

MIT
