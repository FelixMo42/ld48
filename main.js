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
    this.load.image("dog", "assets/dog.png")
}

function create () {
    player = this.physics.add.sprite(100, 100, 'dog')
    player.displayWidth = 200
    player.scaleY = player.scaleX

    
}

function update() {   
}