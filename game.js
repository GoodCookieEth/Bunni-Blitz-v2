// Initialize Phaser Game Config
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container', // Center the game in the HTML container
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for the rabbit; objects will fall from the top
            debug: false
        }
    },
    scene: [IntroScene, MainGameScene] // Add two scenes: intro and main game
};

const game = new Phaser.Game(config);

// Intro Scene to show a message before the game starts
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        // Load the font and necessary images for intro if needed
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000'); // Black background

        // Add matrix-style green text
        const introText = this.add.text(400, 300, "You are the white rabbit.\nCollect carrots, avoid poop.\nCookies give extra lives.\nClick to start.", {
            fontFamily: 'monospace',
            fontSize: '24px',
            fill: '#00FF00', // Matrix green
            align: 'center'
        }).setOrigin(0.5);

        // Start game on mouse click
        this.input.once('pointerdown', () => {
            this.scene.start('MainGameScene');
        });
    }
}

// Main Game Scene
class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
    }

    preload() {
        this.load.image('background', 'assets/matrix_background.png');
        this.load.image('rabbit', 'assets/rabbit.png');
        this.load.image('carrot', 'assets/carrot.png');
        this.load.image('poop', 'assets/poop.png');
        this.load.image('cookie', 'assets/cookie.png'); // Load cookie image
    }

    create() {
        this.gameOver = false;
        this.score = 0;
        this.lives = 0;
        this.poopCounter = 0;

        // Add looping background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

        // Create the player (rabbit) and scale it down
        this.player = this.physics.add.sprite(400, 550, 'rabbit').setScale(0.2);
        this.player.setCollideWorldBounds(true); // Rabbit can't leave the screen

        // Re-expand rabbit movement to the full screen width
        this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 800, 600));

        // Create group of carrots, poop, and cookies
        this.carrots = this.physics.add.group({
            key: 'carrot',
            repeat: 5, // Start with a few carrots
            setXY: { x: Phaser.Math.Between(50, 750), y: -50, stepY: 0 },
            setScale: { x: 0.1, y: 0.1 }
        });

        this.poopEmojis = this.physics.add.group({
            setScale: { x: 0.1, y: 0.1 }
        });

        this.cookies = this.physics.add.group();

        // Score and lives text
        this.scoreText = this.add.text(16, 570, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
        this.livesText = this.add.text(600, 570, 'Lives: 0', { fontSize: '32px', fill: '#FFF' });

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Collisions
        this.physics.add.overlap(this.player, this.carrots, this.collectCarrot, null, this);
        this.physics.add.overlap(this.player, this.cookies, this.collectCookie, null, this);
        this.physics.add.collider(this.player, this.poopEmojis, this.hitPoop, null, this);

        // Add survival score every 1/5th of a second
        this.time.addEvent({
            delay: 200,
            callback: this.addSurvivalPoints,
            callbackScope: this,
            loop: true
        });

        // Random cookie spawn every 10-15 seconds
        this.time.addEvent({
            delay: Phaser.Math.Between(10000, 15000),
            callback: this.spawnCookie,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.gameOver) return;

        // Move the background for endless effect
        this.background.tilePositionY += 2;

        // Player movement (left and right, full screen width)
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        // Constantly spawn poop emojis from the top
        if (Math.random() < 0.04) {
            let poop = this.poopEmojis.create(Phaser.Math.Between(50, 750), -50, 'poop').setScale(0.1);
            poop.setVelocityY(200);
            this.poopCounter++;

            // Spawn a carrot for every two poops
            if (this.poopCounter % 2 === 0) {
                let carrot = this.carrots.create(Phaser.Math.Between(50, 750), -50, 'carrot').setScale(0.1);
                carrot.setVelocityY(150);
            }
        }

        // Make sure carrots continue to fall
        this.carrots.children.iterate(function(carrot) {
            if (carrot.y > 600) {
                carrot.y = -50;
                carrot.x = Phaser.Math.Between(50, 750);
            }
        });
    }

    spawnCookie() {
        let cookie = this.cookies.create(Phaser.Math.Between(50, 750), -50, 'cookie');
        cookie.setVelocityY(100); // Cookies fall slower
        cookie.setScale(0.5); // Set the cookie to 50% of the original size
        console.log('Cookie spawned');
    }

    collectCarrot(player, carrot) {
        carrot.disableBody(true, true);
        this.score += 100;
        this.scoreText.setText('Score: ' + this.score);
    }

    collectCookie(player, cookie) {
        cookie.disableBody(true, true);
        this.lives++;
        this.livesText.setText('Lives: ' + this.lives);
    }

    hitPoop(player, poop) {
        if (this.lives > 0) {
            this.lives--;
            this.livesText.setText('Lives: ' + this.lives);
            poop.disableBody(true, true);
        } else {
            this.physics.pause();
            player.setTint(0xff0000);
            this.gameOver = true;

            if (this.score >= 1500) {
                this.victoryText = this.add.text(400, 250, 'TEST TEST TEST', { fontSize: '48px', fill: '#FFF' }).setOrigin(0.5).setDepth(1);
            }

            let resetButton = this.add.text(400, 300, 'Reset', { fontSize: '32px', fill: '#FFF', backgroundColor: '#000' }).setOrigin(0.5).setDepth(1);
            resetButton.setInteractive();
            resetButton.on('pointerdown', () => {
                console.log('Game Reset');
                this.scene.restart();
                this.gameOver = false;
                this.score = 0;
                this.poopCounter = 0;
                this.survivalTimer = 0;
                this.lives = 0;
                this.livesText.setText('Lives: ' + this.lives);
                if (this.victoryText) this.victoryText.destroy();
            });
        }
    }

    addSurvivalPoints() {
        if (!this.gameOver) {
            this.score += 1;
            this.scoreText.setText('Score: ' + this.score);
        }
    }
}
