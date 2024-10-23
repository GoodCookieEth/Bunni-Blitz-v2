function resumeAudioContext() {
    if (this.sound.context.state === 'suspended') {
        this.sound.context.resume().then(() => {
            console.log('AudioContext resumed');
        }).catch((error) => {
            console.error('Failed to resume AudioContext', error);
        });
    }
}

function create() {
    // Add background
    this.add.image(400, 300, 'background');

    // Create player (rabbit)
    player = this.physics.add.sprite(400, 500, 'rabbit');
    player.setCollideWorldBounds(true);

    // Set up keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Handle keyboard input and resume AudioContext on interaction
    this.input.keyboard.on('keydown', resumeAudioContext, this);

    // Set up touch controls for mobile and resume AudioContext
    this.input.on('pointerdown', (pointer) => {
        resumeAudioContext.call(this);  // Ensure audio context is resumed
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
