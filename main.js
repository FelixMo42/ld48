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

const world_length = 5000;

let text;
let player;
let inputs;
let things;
let enemys;

let gameOver = false

let SPAWNING = 0
let COMBAT = 1

let mode = SPAWNING
let modeTimer = 1000

let totalKills = 0
let enemysLeft = 0

function getTime() {
    return (new Date()).getTime()
}

let startTime = getTime()

function preload() {
    // load in all my beatifull art
    this.load.image("dog", "assets/dog.png")
    this.load.image("ground", "assets/ground.png")
    this.load.image("blue", "assets/blue.png")
    this.load.image("rock", "assets/rock.png")
}

function spawnEnemy(x, y) {
    enemys.create(window.innerWidth + 100 + x, window.innerHeight / 2 - y, "blue").setScale(0.1)
}

function spawnWave() {
    for (let i = 0; i < 5; i++) {
        spawnEnemy(
            200 * i ,
            - i * 150 + 300
        )
    }

    enemysLeft += 5
}

function killEnemy(enemy) {
    // decremnet the amount of enemeys on screen at the moment
    enemysLeft -= 1

    // incrament the kill counter
    totalKills += 1

    // spawn a rock in the right place
    let rock = things.create( enemy.body.x , enemy.body.y , "rock" ).setOrigin(0)

    // scale the rock correctly
    rock.displayWidth = enemy.displayWidth
    rock.scaleY = rock.scaleX
    rock.body.immovable = true

    // destroy the enemy
    enemy.destroy()
}

function create () {
    // spawn the player
    player = this.physics.add.sprite(500, 100, 'dog')
    player.displayWidth = 200
    player.scaleY = player.scaleX
    player.setGravity(0, 2000)

    things = this.physics.add.group()
    enemys = this.physics.add.group()

    // a text object to display game info
    text = this.add.text(0, 0, 'There has been an ERROR!', { fill: '#00ff00' })

    // create a group for the platforms and ground
    platforms = this.physics.add.staticGroup()

    // make the four platforms
    let center = 450
    let width  = 300
    platforms.create(center, window.innerHeight / 2 + 200, 'ground').setScale(width, 12).setOrigin(0).refreshBody()
    platforms.create(center, window.innerHeight / 2 - 200, 'ground').setScale(width, 12).setOrigin(0).refreshBody()
    platforms.create(center + 300, window.innerHeight / 2, 'ground').setScale(width, 12).setOrigin(0).refreshBody()
    platforms.create(center - 300, window.innerHeight / 2, 'ground').setScale(width, 12).setOrigin(0).refreshBody()

    // make the player collide with the platforms, but only when falling
    this.physics.add.collider(player, platforms, null, (player, _platform) => {
        return player.body.velocity.y >= 0
    })

    // && player.body.y + player.body.height - 11 < platform.body.y

    this.physics.add.collider(player, enemys, (_player, enemy) => killEnemy(enemy))

    this.physics.add.collider(player, things)

    // add bindings for the keys in the game
    inputs = {
        jump : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),

        backup : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        foward : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
}

function update() {
    // get the current time (in ms)
    let time = getTime() - startTime

    if (mode == SPAWNING) {
        if ( time >= modeTimer ) {
            spawnWave()
            mode = COMBAT
        }
    }

    if (mode == COMBAT) {
        if ( enemysLeft == 0  ) {
            mode = SPAWNING
            modeTimer = time + 1000
        }
    }

    // update the velocity of the obsticles
    things.setVelocityX( -time / 100 - 200 )
    enemys.setVelocityX( -time / 100 - 300 )

    // make the player jump
    if (inputs.jump.isDown && player.body.touching.down) {
        player.setVelocityY(-1000)
    }

    // move forward and backwords
    if (inputs.foward.isDown) {
        player.setVelocityX( 400 )
    } else if (inputs.backup.isDown) {
        player.setVelocityX( -400 )
    } else {
        player.setVelocityX(0)
    }

    // see if anything needs to be looped
    for (let thing of things.getChildren()) {
        if (thing.body.x + thing.body.width < 0) {
            thing.setPosition(world_length + thing.body.x, thing.body.y)
        }
    }

    for (let enemy of enemys.getChildren()) {
        if (enemy.body.x + enemy.body.width < 0) {
            enemy.setPosition(world_length + enemy.body.x, enemy.body.y)
        }
    }

    // see if you are dead
    if ( !gameOver && (
        player.body.y > window.innerHeight || 
        player.body.x + player.body.width < 0
    ) ) {
        window.location.href = "./dead.html"
        gameOver = true
    }

    // update the text
    text.setText([
        'Kills: ' + totalKills,
        'Time: ' + time / 1000,
    ])
}