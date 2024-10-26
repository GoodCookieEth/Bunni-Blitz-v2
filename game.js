// Initialize Phaser Game Config
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let carrots;
let poopEmojis;
let cookies;
let score = 0;
let scoreText;
let livesText;
let gameOver = false;
let background;
let poopCounter = 0;
let survivalTimer = 0;
let victoryText;
let lives = 0;

function preload() {
    try {
        this.load.image('background', 'assets/matrix_background.png');
        this.load.image('rabbit', 'assets/rabbit.png');
        this.load.image('carrot', 'assets/carrot.png');
        this.load.image('poop', 'assets/poop.png');
        this.load.image('cookie', 'assets/cookie.png');
        console.log('Images loaded.');
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function create() {
    try {
        background = this.add.tileSprite(400, 300, 800, 600, 'background');
        
        player = this.physics.add.sprite(400, 550, 'rabbit').setScale(0.2);
        player.setCollideWorldBounds(true);
        player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 800, 600));

        carrots = this.physics.add.group({
            key: 'carrot',
            repeat: 5,
            setXY: { x: 50, y: -50, stepX: 150 },
            setScale: { x: 0.1, y: 0.1 }
        });

        poopEmojis = this.physics.add.group({
            setScale: { x: 0.1, y: 0.1 }
        });

        cookies = this.physics.add.group({
            key: 'cookie',
            setScale: { x: 0.1, y: 0.1 }
        });

        scoreText = this.add.text(16, 570, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
        livesText = this.add.text(600, 570, 'Lives: 0', { fontSize: '32px', fill: '#FFF' });

        cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.overlap(player, carrots, collectCarrot, null, this);
        this.physics.add.overlap(player, cookies, collectCookie, null, this);
        this.physics.add.collider(player, poopEmojis, hitPoop, null, this);

        this.time.addEvent({ delay: 200, callback: addSurvivalPoints, callbackScope: this, loop: true });
    } catch (error) {
        console.error('Error in create function:', error);
        alert('An error occurred while initializing the game.');
    }
}

function update() {
    if (gameOver) return;

    background.tilePositionY += 2;

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if (Math.random() < 0.036) {
        if (poopEmojis.countActive(true) < 20) {  // Limit to 20 poops on screen at once
            let poop = poopEmojis.create(Phaser.Math.Between(50, 750), -50, 'poop').setScale(0.1);
            poop.setVelocityY(200);
            poopCounter++;
            if (poopCounter % 2 === 0 && carrots.countActive(true) < 10) {
                carrots.create(Phaser.Math.Between(50, 750), -50, 'carrot').setScale(0.1).setVelocityY(150);
            }
        }
    }

    // Move carrots back to the top if they fall off screen
    carrots.children.iterate((carrot) => {
        if (carrot.y > 600) {
            carrot.y = -50;
            carrot.x = Phaser.Math.Between(50, 750);
        }
    });

    // Spawn cookies, limit to 5 on screen
    if (Math.random() < 0.002 && cookies.countActive(true) < 5) {
        cookies.create(Phaser.Math.Between(50, 750), -50, 'cookie').setScale(0.1).setVelocityY(100);
    }

    // Destroy cookies that have fallen off screen
    cookies.children.iterate((cookie) => {
        if (cookie.y > 600) {
            cookie.destroy();
        }
    });
}

// Collecting carrots
function collectCarrot(player, carrot) {
    carrot.disableBody(true, true);
    score += 100;
    scoreText.setText('Score: ' + score);
}

// Collecting cookie
function collectCookie(player, cookie) {
    cookie.disableBody(true, true);
    lives++;
    livesText.setText('Lives: ' + lives);
}

// Hitting poop emoji
function hitPoop(player, poop) {
    if (lives > 0) {
        lives--;
        livesText.setText('Lives: ' + lives);
        poop.disableBody(true, true);
    } else {
        this.physics.pause();
        player.setTint(0xff0000);
        gameOver = true;
        if (score >= 1500) {
            victoryText = this.add.text(400, 250, 'You won!', { fontSize: '48px', fill: '#FFF' }).setOrigin(0.5).setDepth(1);
        }
        let resetButton = this.add.text(400, 300, 'Restart', { fontSize: '32px', fill: '#FFF', backgroundColor: '#000' }).setOrigin(0.5).setDepth(1);
        resetButton.setInteractive();
        resetButton.on('pointerdown', () => {
            console.log('Game Reset');
            this.scene.restart();
            gameOver = false;
            score = 0;
            poopCounter = 0;
            survivalTimer = 0;
            lives = 0;
            livesText.setText('Lives: ' + lives);
            if (victoryText) victoryText.destroy();
        });
    }
}

// Add 1 point every 1/5th of a second for staying alive
function addSurvivalPoints() {
    if (!gameOver) {
        score += 1;
        scoreText.setText('Score: ' + score);
    }
}
