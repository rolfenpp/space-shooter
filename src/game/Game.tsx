import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './GameScene';

const Game = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parentRef.current) return;

    // Mobile-first portrait dimensions (9:16 aspect ratio)
    const baseWidth = 375;  // Standard mobile width
    const baseHeight = 667; // 9:16 aspect ratio
    
    // Calculate dimensions that fit the screen while maintaining aspect ratio
    const maxWidth = Math.min(window.innerWidth, 500); // Cap at 500px for larger screens
    const maxHeight = window.innerHeight;
    
    // Use portrait dimensions
    let gameWidth = baseWidth;
    let gameHeight = baseHeight;
    
    // If the screen is smaller than our base dimensions, scale down
    if (maxWidth < gameWidth || maxHeight < gameHeight) {
      const widthRatio = maxWidth / gameWidth;
      const heightRatio = maxHeight / gameHeight;
      const scale = Math.min(widthRatio, heightRatio);
      gameWidth = Math.floor(gameWidth * scale);
      gameHeight = Math.floor(gameHeight * scale);
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parentRef.current,
      width: gameWidth,
      height: gameHeight,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [PreloadScene, GameScene],
      backgroundColor: '#000000',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Cleanup on unmount
    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return <div ref={parentRef} />;
};

export default Game;

