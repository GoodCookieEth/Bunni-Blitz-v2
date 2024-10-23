let player;
let cursors;

function preload() {
    // Load assets for rabbit
    this.load.image('rabbit', 'assets/rabbit.png');

    // Debug asset loading
    this.load.on('filecomplete', (key) => {
        console.log(`Asset loaded: ${key}`);
    });

    this.load.on('loaderror', (file) => {
        console.error(`Failed to load: ${file.src}`);
    });
}

function create() {
    // Set background color for troubleshooting
    this.cameras.main.setBackgroundColor('#4488aa');

    // Create a simple test sprite
    player = this.physics.add.sprite(400, 300, 'rabbit');
    player.setCollideWorldBounds(true);

    console.log("Player created: ", player);
}

function update() {
    cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

console.log("Game canvas is being created...");
const game = new Phaser.Game(config);
