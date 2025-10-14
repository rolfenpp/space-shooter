# Space Shooter Game 🚀

An addictive 2D space shooter game built with React, TypeScript, and Phaser 3. Works on both desktop and mobile!

## Features

- 🎮 **Spaceship at the bottom** - Control your ship to dodge and destroy enemies
- 👾 **Incoming enemies** - Red enemies spawn from the top
- 💥 **Shooting mechanics** - Fire yellow bullets to destroy enemies
- 📱 **Mobile support** - Touch controls for mobile devices
- ⌨️ **Keyboard controls** - Arrow keys to move, space to shoot
- 🏆 **Score tracking** - Earn points for each enemy destroyed
- 🔄 **Game over & restart** - Click to restart after game over

## Controls

### Desktop
- **Arrow Left/Right**: Move spaceship
- **Space**: Shoot

### Mobile
- **Drag**: Move spaceship left/right
- **Tap**: Shoot

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18
- TypeScript
- Phaser 3
- Vite

## Game Mechanics

- Enemies spawn every second from random positions at the top
- Each enemy destroyed gives you 10 points
- Enemy speed increases randomly for difficulty
- Game ends when an enemy hits your spaceship
- Click anywhere to restart after game over

## Future Features (TODO)

- [ ] IP tracking with email notifications
- [ ] Power-ups
- [ ] Different enemy types
- [ ] Boss battles
- [ ] Sound effects and music
- [ ] High score leaderboard

## License

MIT
