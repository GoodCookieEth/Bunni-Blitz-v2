let player;
let cursors;

function preload() {
    // Load assets for rabbit, carrots, poop, etc.
    this.load.image('rabbit', 'assets/rabbit.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('poop', 'assets/poop.png');
    this.load.image('background', 'assets/matrix_background.png');
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
        if (pointer.x < this.cameras.main.width / 2) {
            player.setVelocityX(-160); // Move left on touch
        } else {
            player.setVelocityX(160); // Move right on touch
        }
    });

    // Stop movement when the touch ends
    this.input.on('pointerup', () => {
        player.setVelocityX(0);
    });
}

function update() {
    // Handle keyboard controls for desktop
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);  // Stop the player if no key is pressed
    }

    // Mobile touch input to keep the player moving while touching the screen
    if (this.input.activePointer.isDown) {
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
