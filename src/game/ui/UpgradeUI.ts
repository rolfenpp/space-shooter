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

    // Title
    const title = this.scene.add.text(centerX, centerY - 150, `🎉 LEVEL ${level}! 🎉`, {
      ...FontConfig.styles.huge,
      color: '#ffff00',
    }).setOrigin(0.5);

    const subtitle = this.scene.add.text(centerX, centerY - 100, 'Choose Your Upgrade', {
      ...FontConfig.styles.body,
      color: '#00ffff',
    }).setOrigin(0.5);

    this.container.add([title, subtitle]);

    // Create 3 upgrade cards
    const cardWidth = 200;
    const cardHeight = 250;
    const spacing = 30;
    
    // Calculate total width and center properly
    const totalWidth = (cardWidth * 3) + (spacing * 2);
    const startX = centerX - (totalWidth / 2) + (cardWidth / 2);

    upgrades.forEach((upgrade, index) => {
      const x = startX + index * (cardWidth + spacing);
      const y = centerY;

      // Card background
      const card = this.scene.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a1a, 1);
      card.setStrokeStyle(3, 0x00ff00);

      // Icon
      const icon = this.scene.add.text(x, y - 70, upgrade.icon, {
        fontSize: '48px',
      }).setOrigin(0.5);

      // Name
      const name = this.scene.add.text(x, y - 10, upgrade.name, {
        ...FontConfig.styles.smallBold,
        color: '#00ff00',
        wordWrap: { width: cardWidth - 20 },
        align: 'center',
      }).setOrigin(0.5);

      // Description
      const description = this.scene.add.text(x, y + 40, upgrade.description, {
        ...FontConfig.styles.tiny,
        color: '#ffffff',
        wordWrap: { width: cardWidth - 20 },
        align: 'center',
      }).setOrigin(0.5);

      // Select button
      const button = this.scene.add.rectangle(x, y + 95, cardWidth - 40, 40, 0x00aa00, 1);
      const buttonText = this.scene.add.text(x, y + 95, 'SELECT', {
        ...FontConfig.styles.smallBold,
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

