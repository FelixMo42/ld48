const game = new Phaser.Game({
    // make the game fill the window
    width  : window.innerWidth,
    height : window.innerHeight,

    // set up some simple phisics
    physics: {
        default: 'arcade'
    },

    // register main game callbacks
    scene : {
        preload,
        create,
        update
    }
})

const world_length = 2000;

let player;
let inputs;
let things;

function preload() {
    // load in all my beatifull art
    this.load.image("dog", "assets/dog.png")
    this.load.image("ground", "assets/ground.png")
    this.load.image("blue", "assets/blue.png")
}

function create () {
    player = this.physics.add.sprite(500, 100, 'dog')
    player.displayWidth = 200
    player.scaleY = player.scaleX
    player.setGravity(0, 2000)


    things = this.physics.add.group()

    let enemy = things.create(1000, 300, "blue").setScale(0.1)
    enemy.setVelocityX(-200)


    // create a group for the platforms and ground
    platforms = this.physics.add.staticGroup()

    // make the ground
    platforms.create(0, window.innerHeight-50, 'ground').setScale(window.innerWidth).setOrigin(0).refreshBody()

    platforms.create(350, window.innerHeight / 2 + 100, 'ground').setScale(300, 12).setOrigin(0).refreshBody()


    // make the player collide with the platforms
    this.physics.add.collider(player, platforms, null, (player, platform) => {
        return player.body.velocity.y > 0
    })

    this.physics.add.collider(player, things, (player, thing) => {
        thing.destroy()
    })


    // add bindings for the keys in the game
    inputs = {
        jump : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),

        backup : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        foward : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
}

function update() {   
    if (inputs.jump.isDown && player.body.touching.down) {
        player.setVelocityY(-1500)
    }

    if (inputs.foward.isDown) {
        player.setVelocityX(210)
    } else if (inputs.backup.isDown) {
        player.setVelocityX(-210)
    } else {
        player.setVelocityX(0)
    }

    for (let thing of things.getChildren()) {
        if (thing.body.x + thing.body.width < 0) {
            thing.setPosition(world_length + thing.body.x, thing.body.y)
        }
    }
}