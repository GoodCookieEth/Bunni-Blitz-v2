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
let poopCounter = 0; // Track poop to manage carrot ratio
let survivalTimer = 0; // Timer for survival points
let victoryText; // Text for victory message
let lives = 0; // Track lives (cookies collected)

// Load game assets
function preload() {
    this.load.image('background', 'assets/matrix_background.png');
    this.load.image('rabbit', 'assets/rabbit.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('poop', 'assets/poop.png');
    this.load.image('cookie', 'assets/cookie.png'); // Load cookie image
    console.log('Images loaded.');
}

// Create game elements
function create() {
    // Add looping background
    background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // Create the player (rabbit) and scale it down
    player = this.physics.add.sprite(400, 550, 'rabbit').setScale(0.2);
    player.setCollideWorldBounds(true); // Rabbit can't leave the screen

    // Re-expand rabbit movement to the full screen width
    player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 800, 600));

    // Create group of carrots and poops, ensuring they are the same size
    carrots = this.physics.add.group({
        key: 'carrot',
        repeat: 5, // Start with a few carrots
        setXY: { x: Phaser.Math.Between(50, 750), y: -50, stepY: 0 },
        setScale: { x: 0.1, y: 0.1 } // Set carrot size equal to poop size
    });

    // Create group of poop emojis
    poopEmojis = this.physics.add.group({
        setScale: { x: 0.1, y: 0.1 } // Set poop size
    });

    // Create group of cookies
    cookies = this.physics.add.group();

    // Score and lives text, place them below the game area
    scoreText = this.add.text(16, 570, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    livesText = this.add.text(600, 570, 'Lives: 0', { fontSize: '32px', fill: '#FFF' });

    // Input
    cursors = this.input.keyboard.createCursorKeys();

    // Carrot collection
    this.physics.add.overlap(player, carrots, collectCarrot, null, this);

    // Cookie collection
    this.physics.add.overlap(player, cookies, collectCookie, null, this);

    // Poop collision
    this.physics.add.collider(player, poopEmojis, hitPoop, null, this);

    // Add survival score every 1/5th of a second
    this.time.addEvent({
        delay: 200, // 200ms = 1/5th of a second
        callback: addSurvivalPoints,
        callbackScope: this,
        loop: true
    });

    // Random cookie spawn every 15-25 seconds
    this.time.addEvent({
        delay: Phaser.Math.Between(15000, 25000), // Random delay between 15 and 25 seconds
        callback: spawnCookie,
        callbackScope: this,
        loop: true
    });
}

// Update game elements
function update() {
    if (gameOver) {
        return;
    }

    // Move the background for endless effect
    background.tilePositionY += 2;

    // Player movement (left and right, full screen width)
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    // Constantly spawn poop emojis from the top
    if (Math.random() < 0.036) { // Reduced poop frequency by 10%
        let poop = poopEmojis.create(Phaser.Math.Between(50, 750), -50, 'poop').setScale(0.1);
        poop.setVelocityY(200); // Poop falls down
        poopCounter++;

        // Spawn a carrot for every two poops
        if (poopCounter % 2 === 0) {
            let carrot = carrots.create(Phaser.Math.Between(50, 750), -50, 'carrot').setScale(0.1);
            carrot.setVelocityY(150); // Carrots fall down slower
        }
    }

    // Make sure carrots continue to fall
    carrots.children.iterate(function(carrot) {
        if (carrot.y > 600) {
            carrot.y = -50;
            carrot.x = Phaser.Math.Between(50, 750); // Respawn carrot at random position
        }
    });
}

// Spawn a random cookie
function spawnCookie() {
    let cookie = cookies.create(Phaser.Math.Between(50, 750), -50, 'cookie');
    cookie.setVelocityY(100); // Cookies fall slower
    cookie.setScale(0.01); // Make the cookie very small (1% of original size)
    console.log('Cookie spawned'); // Log to track when cookies are spawned
}

// Collecting carrots
function collectCarrot(player, carrot) {
    carrot.disableBody(true, true); // Remove the carrot
    score += 100; // Increase score by 100 for collecting a carrot
    scoreText.setText('Score: ' + score);
}

// Collecting cookie (extra life)
function collectCookie(player, cookie) {
    cookie.disableBody(true, true); // Remove the cookie
    lives++; // Increase lives (extra life)
    livesText.setText('Lives: ' + lives); // Update lives display
}

// Hitting poop emoji
function hitPoop(player, poop) {
    if (lives > 0) {
        lives--; // Lose a life (cookie)
        livesText.setText('Lives: ' + lives); // Update lives display
        poop.disableBody(true, true); // Remove the poop emoji
    } else {
        this.physics.pause(); // Stop the game
        player.setTint(0xff0000); // Rabbit turns red on collision
        gameOver = true;

        // Check if score is >= 1500 and show the victory message if true
        if (score >= 1500) {
            // Display the victory message on top of everything else
            victoryText = this.add.text(400, 250, 'TEST TEST TEST', { fontSize: '48px', fill: '#FFF' }).setOrigin(0.5).setDepth(1);
        }

        // Add Reset Button to restart game
        let resetButton = this.add.text(400, 300, 'Reset', { fontSize: '32px', fill: '#FFF', backgroundColor: '#000' }).setOrigin(0.5).setDepth(1);
        resetButton.setInteractive();
        resetButton.on('pointerdown', () => {
            console.log('Game Reset');
            this.scene.restart(); // Restart the game
            gameOver = false; // Reset game over flag
            score = 0; // Reset score
            poopCounter = 0; // Reset poop counter
            survivalTimer = 0; // Reset survival timer
            lives = 0; // Reset lives
            livesText.setText('Lives: ' + lives); // Reset lives display
            if (victoryText) { victoryText.destroy(); } // Remove the victory message on reset
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
