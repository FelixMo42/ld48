const game = new Phaser.Game({
    // make the game fill the window
    width  : window.innerWidth,
    height : window.innerHeight,

    // set up some simple phisics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },

    // register main game callbacks
    scene : {
        preload,
        create,
        update
    }
})

let player;

function preload() {
    // load in all my beatifull art
    this.load.image("dog", "assets/dog.png")
    this.load.image("ground", "assets/ground.png")
}

function create () {
    player = this.physics.add.sprite(500, 100, 'dog')
    player.displayWidth = 200
    player.scaleY = player.scaleX

    // create a group for the platforms and ground
    platforms = this.physics.add.staticGroup()

    // make the player collide with the platforms
    this.physics.add.collider(player, platforms)

    // make the ground
    platforms.create(0, window.innerHeight-50, 'ground').setScale(window.innerWidth).setOrigin(0).refreshBody()
}

function update() {   
}