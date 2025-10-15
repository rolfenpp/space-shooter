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

    // Mobile-first: Stack cards vertically
    const cardWidth = Math.min(screenWidth - 40, 280); // 20px margin on each side
    const cardHeight = 140;
    const spacing = 15;
    
    // Calculate starting Y position to center all cards vertically
    const totalHeight = (cardHeight * 3) + (spacing * 2);
    const startY = centerY - (totalHeight / 2) + (cardHeight / 2) + 40;

    upgrades.forEach((upgrade, index) => {
      const x = centerX;
      const y = startY + index * (cardHeight + spacing);

      // Card background
      const card = this.scene.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a1a, 1);
      card.setStrokeStyle(3, 0x00ff00);

      // Layout elements horizontally within the card
      const iconX = x - cardWidth / 2 + 40; // Left side
      const textStartX = iconX + 50; // Text starts after icon
      const textWidth = cardWidth - 110; // Available width for text
      const buttonWidth = 80;

      // Icon (smaller for compact layout)
      const icon = this.scene.add.text(iconX, y, upgrade.icon, {
        fontSize: '32px',
      }).setOrigin(0.5);

      // Name
      const name = this.scene.add.text(textStartX, y - 20, upgrade.name, {
        ...FontConfig.styles.small,
        color: '#00ff00',
        wordWrap: { width: textWidth },
        align: 'left',
      }).setOrigin(0, 0.5);

      // Description
      const description = this.scene.add.text(textStartX, y + 10, upgrade.description, {
        ...FontConfig.styles.tiny,
        color: '#ffffff',
        wordWrap: { width: textWidth },
        align: 'left',
      }).setOrigin(0, 0.5);

      // Select button (on the right)
      const buttonX = x + cardWidth / 2 - buttonWidth / 2 - 10;
      const button = this.scene.add.rectangle(buttonX, y, buttonWidth, 50, 0x00aa00, 1);
      const buttonText = this.scene.add.text(buttonX, y, '✓', {
        fontSize: '28px',
        color: '#ffffff',
      }).setOrigin(0.5);

      // Make interactive
      button.setInteractive({ useHandCursor: true });
      
      button.on('pointerover', () => {
        button.setFillStyle(0x00ff00);
        card.setStrokeStyle(4, 0xffff00);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0x00aa00);
        card.setStrokeStyle(3, 0x00ff00);
      });

      button.on('pointerdown', () => {
        this.selectUpgrade(upgrade);
      });

      this.container.add([card, icon, name, description, button, buttonText]);
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

