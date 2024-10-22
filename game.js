let player;
let cursors;

function preload() {
    // Load assets like rabbit, carrots, poop, etc.
    this.load.image('rabbit', 'assets/rabbit.png');
    this.load.image('carrot', 'assets/carrot.png');
    this.load.image('poop', 'assets/poop.png');
    this.load.image('background', 'assets/matrix_background.png');
}

function create() {
    // Create background, rabbit (player), and other game objects
    this.add.image(400, 300, 'background');

    player = this.physics.add.sprite(400, 500, 'rabbit');
    player.setCollideWorldBounds(true);

    // Add carrots and poop falling logic...

    // Set up cursor keys for desktop users
    cursors = this.input.keyboard.createCursorKeys();

    // Handle touch input for mobile devices
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < this.cameras.main.width / 2) {
            // Touch on the left side, move left
            player.setVelocityX(-160);
        } else {
            // Touch on the right side, move right
            player.setVelocityX(160);
        }
    });

    // Stop the player when the touch is released
    this.input.on('pointerup', () => {
        player.setVelocityX(0);
    });
}

function update() {
    // Desktop controls for arrow keys or A/D keys
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);  // Stop the player if no key is pressed
    }

    // Ensure mobile touch works properly with velocity handling
    if (this.input.activePointer.isDown) {
        // This ensures touch input works continuously
        if (this.input.activePointer.x < this.cameras.main.width / 2) {
            player.setVelocityX(-160);
        } else {
            player.setVelocityX(160);
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
            gravity: { y: 300 },
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
