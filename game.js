let player;
let cursors;
let isTouchActive = false; // Track if touch input is being used

function preload() {
    // Load assets for rabbit, carrots, poop, etc.
    this.load.image('rabbit', 'assets/rabbit.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('poop', 'assets/poop.png');
    this.load.image('background', 'assets/matrix_background.jpg'); // Ensure it's .jpg

    // Debug asset loading
    this.load.on('filecomplete', (key) => {
        console.log(`Asset loaded: ${key}`);
    });

    this.load.on('loaderror', (file) => {
        console.error(`Failed to load: ${file.src}`);
    });
}

function create() {
    // Add background
    this.add.image(400, 300, 'background');

    // Create player (rabbit)
    player = this.physics.add.sprite(400, 500, 'rabbit');
    player.setCollideWorldBounds(true);

    // Set up keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Set up touch controls for mobile
    this.input.on('pointerdown', (pointer) => {
        isTouchActive = true; // Touch is now active
        if (pointer.x < this.cameras.main.width / 2) {
            player.setVelocityX(-160); // Move left on touch
        } else {
            player.setVelocityX(160); // Move right on touch
        }
        // Resume audio context after user interaction
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume().then(() => {
                console.log("AudioContext resumed.");
            }).catch((error) => {
                console.error("AudioContext resume failed: ", error);
            });
        }
    });

    // Stop movement when the touch ends
    this.input.on('pointerup', () => {
        isTouchActive = false; // Touch input is no longer active
        player.setVelocityX(0);
    });

    // Resume AudioContext for keyboard input
    this.input.keyboard.on('keydown', () => {
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume().then(() => {
                console.log("AudioContext resumed.");
            }).catch((error) => {
                console.error("AudioContext resume failed: ", error);
            });
        }
    });
}

function update() {
    // Only process keyboard input if touch input is not active
    if (!isTouchActive) {
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
        } else {
            player.setVelocityX(0); // Stop movement when no key is pressed
        }
    }

    // Mobile touch input continues to move the player while touching
    if (this.input.activePointer.isDown) {
        isTouchActive = true; // Track active touch input
        if (this.input.activePointer.x < this.cameras.main.width / 2) {
            player.setVelocityX(-160); // Move left
        } else {
            player.setVelocityX(160); // Move right
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for side-to-side movement
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
