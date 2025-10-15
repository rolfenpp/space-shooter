import Phaser from 'phaser';
import type { Upgrade } from '../managers/LevelManager';
import { FontConfig } from '../config/FontConfig';

export class UpgradeUI {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private overlay!: Phaser.GameObjects.Rectangle;
  private onUpgradeSelected?: (upgrade: Upgrade) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(level: number, upgrades: Upgrade[], onSelect: (upgrade: Upgrade) => void) {
    this.onUpgradeSelected = onSelect;

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    const screenWidth = this.scene.cameras.main.width;

    // Dark overlay
    this.overlay = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.8
    );
    this.overlay.setOrigin(0, 0);
    this.overlay.setDepth(1000);

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1001);

    // Title - adjusted size for mobile
    const titleStyle = screenWidth < 400 ? FontConfig.styles.subtitle : FontConfig.styles.huge;
    const title = this.scene.add.text(centerX, 50, `🎉 LEVEL ${level}! 🎉`, {
      ...titleStyle,
      color: '#ffff00',
    }).setOrigin(0.5);

    const subtitle = this.scene.add.text(centerX, 90, 'Choose Your Upgrade', {
      ...FontConfig.styles.body,
      color: '#00ffff',
    }).setOrigin(0.5);

    this.container.add([title, subtitle]);

    // Mobile-first: Stack cards vertically - compact design
    const cardWidth = Math.min(screenWidth - 40, 300); // 20px margin on each side
    const cardHeight = 70; // Smaller height
    const spacing = 12;
    
    // Calculate starting Y position to center all cards vertically
    const totalHeight = (cardHeight * 3) + (spacing * 2);
    const startY = centerY - (totalHeight / 2) + (cardHeight / 2) + 40;

    upgrades.forEach((upgrade, index) => {
      const x = centerX;
      const y = startY + index * (cardHeight + spacing);

      // Card background
      const card = this.scene.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a1a, 1);
      card.setStrokeStyle(3, 0x00ff00);

      // Text content - centered vertically, with padding
      const textPadding = 20;
      const textWidth = cardWidth - (textPadding * 2);

      // Name
      const name = this.scene.add.text(x, y - 12, upgrade.name, {
        ...FontConfig.styles.small,
        color: '#00ff00',
        wordWrap: { width: textWidth },
        align: 'center',
      }).setOrigin(0.5);

      // Description
      const description = this.scene.add.text(x, y + 12, upgrade.description, {
        ...FontConfig.styles.tiny,
        color: '#ffffff',
        wordWrap: { width: textWidth },
        align: 'center',
      }).setOrigin(0.5);

      // Make entire card interactive
      card.setInteractive({ useHandCursor: true });
      
      card.on('pointerover', () => {
        card.setFillStyle(0x2a2a2a);
        card.setStrokeStyle(4, 0xffff00);
      });

      card.on('pointerout', () => {
        card.setFillStyle(0x1a1a1a);
        card.setStrokeStyle(3, 0x00ff00);
      });

      card.on('pointerdown', () => {
        this.selectUpgrade(upgrade);
      });

      this.container.add([card, name, description]);
    });

    // Add pulsing animation to title
    this.scene.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  selectUpgrade(upgrade: Upgrade) {
    // Play selection effect
    const flash = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xffffff,
      0.5
    );
    flash.setOrigin(0, 0);
    flash.setDepth(1002);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      },
    });

    // Notify selection
    if (this.onUpgradeSelected) {
      this.onUpgradeSelected(upgrade);
    }

    // Hide UI
    this.hide();
  }

  hide() {
    this.overlay?.destroy();
    this.container?.destroy();
  }
}

