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

    // Set up touch controls for mobile
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < this.cameras.main.width / 2) {
            // Touch on the left side, move left
            player.setVelocityX(-160);
        } else {
            // Touch on the right side, move right
            player.setVelocityX(160);
        }
    });

    // Stop moving the rabbit when touch is released
    this.input.on('pointerup', () => {
        player.setVelocityX(0);
    });

    // For mobile, prevent touch scrolling while playing the game
    this.input.addPointer(1); // Allows multi-touch support
    this.input.on('pointerdown', (pointer) => {
        if (pointer.isDown) {
            pointer.event.preventDefault(); // Prevent page scrolling on touch
        }
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

    // Update game state, falling carrots, poop, etc.
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
