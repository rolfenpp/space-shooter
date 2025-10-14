import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private lastFired: number = 0;
  private gameOver: boolean = false;
  private restartText!: Phaser.GameObjects.Text;
  
  // Touch controls
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isTouching: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Create player spaceship (triangle pointing up)
    const playerX = this.cameras.main.width / 2;
    const playerY = this.cameras.main.height - 80;
    
    // Create a graphics object to draw the spaceship
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(0, -20, -15, 20, 15, 20);
    graphics.generateTexture('spaceship', 30, 40);
    graphics.destroy();

    this.player = this.add.rectangle(playerX, playerY, 30, 40, 0x00ff00);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    // Create bullet group
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30,
    });

    // Create enemy group
    this.enemies = this.physics.add.group();

    // Score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#fff',
    });

    // Keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Touch controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.isTouching = true;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isTouching && !this.gameOver) {
        const deltaX = pointer.x - this.touchStartX;
        this.player.x += deltaX;
        
        // Keep player in bounds
        this.player.x = Phaser.Math.Clamp(
          this.player.x,
          15,
          this.cameras.main.width - 15
        );
        
        this.touchStartX = pointer.x;
      }
    });

    this.input.on('pointerup', () => {
      this.isTouching = false;
      // Auto-shoot when touching
      if (!this.gameOver) {
        this.shootBullet();
      }
    });

    // Collision detection
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Spawn enemies periodically
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    // Create graphics for bullet and enemy
    this.createGameGraphics();
  }

  createGameGraphics() {
    // Create bullet texture
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();

    // Create enemy texture
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(15, 0, 0, 30, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  update(time: number) {
    if (this.gameOver) {
      return;
    }

    // Keyboard controls
    if (this.cursors.left.isDown) {
      this.player.x -= 5;
    } else if (this.cursors.right.isDown) {
      this.player.x += 5;
    }

    // Keep player in bounds
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      15,
      this.cameras.main.width - 15
    );

    // Auto-shoot with space bar or on interval
    if (this.cursors.space.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // Remove bullets that go off screen
    this.bullets.children.entries.forEach((bullet) => {
      const b = bullet as Phaser.GameObjects.Rectangle;
      if (b.y < 0) {
        b.destroy();
      }
    });

    // Remove enemies that go off screen
    this.enemies.children.entries.forEach((enemy) => {
      const e = enemy as Phaser.GameObjects.Rectangle;
      if (e.y > this.cameras.main.height) {
        e.destroy();
      }
    });
  }

  shootBullet() {
    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y - 20,
      4,
      10,
      0xffff00
    );
    this.physics.add.existing(bullet);
    this.bullets.add(bullet);
    
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-400);
  }

  spawnEnemy() {
    if (this.gameOver) return;

    const x = Phaser.Math.Between(20, this.cameras.main.width - 20);
    const enemy = this.add.rectangle(x, -20, 30, 30, 0xff0000);
    
    this.physics.add.existing(enemy);
    this.enemies.add(enemy);
    
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const speed = Phaser.Math.Between(100, 250);
    body.setVelocityY(speed);
  }

  hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    bullet.destroy();
    enemy.destroy();
    
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  playerHit() {
    this.gameOver = true;
    
    // Stop all enemies
    this.enemies.children.entries.forEach((enemy) => {
      const body = (enemy as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    });

    // Game over text
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, centerY - 50, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
    }).setOrigin(0.5);

    this.add.text(centerX, centerY, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#fff',
    }).setOrigin(0.5);

    this.restartText = this.add.text(centerX, centerY + 60, 'Click to Restart', {
      fontSize: '24px',
      color: '#00ff00',
    }).setOrigin(0.5);

    // Make restart text clickable
    this.restartText.setInteractive();
    this.restartText.on('pointerdown', () => {
      this.scene.restart();
      this.score = 0;
      this.gameOver = false;
    });

    // Also allow clicking anywhere to restart
    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.score = 0;
      this.gameOver = false;
    });
  }
}

