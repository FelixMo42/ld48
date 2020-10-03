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

const world_length = 2500;

let text;
let say;
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
let lives = 8

function getTime() {
    return (new Date()).getTime()
}

let startTime = getTime()

function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max)
}

function preload() {
    // load in all my beatifull art
    this.load.image("dog", "assets/dog.png")
    this.load.image("ground", "assets/ground.png")
    this.load.image("blue", "assets/whale.png")
    this.load.image("rock", "assets/rock.png")
    this.load.image("boat", "assets/boat.png")
    this.load.image("ocean", "assets/ocean.png")
}

function spawnEnemy(x, y) {
    let enemy = enemys.create(window.innerWidth + 100 + x, window.innerHeight / 2 - y, "blue")

    enemy.displayWidth = 100
    enemy.scaleY = enemy.scaleX    

    enemy.getVel = (time) => {
        return Math.sin(time/1000+100) * 100
    }
}

function spawnWave() {
    let number = 1

    for (let i = 0; i < number; i++) {
        spawnEnemy(
            1000 - 300 * i ,
            (2 * Math.random() - 1) * 300 + 100
        )
    }

    enemysLeft += number
}

function killEnemy(enemy) {
    // decrament the amount of enemeys on screen at the moment
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

    if ( totalKills == 10 ) {
        window.location.href = "./win.html"
    }
}

function addBoat() {
    // create a group for the platforms and ground
    platforms = this.physics.add.staticGroup()

    // make the four platforms
    let center = 450
    let width  = 300
    platforms.create(center, window.innerHeight / 2 + 200, 'ground').setScale(width, 12).setOrigin(0).refreshBody()
    platforms.create(center, window.innerHeight / 2 - 200, 'ground').setScale(width, 12).setOrigin(0).refreshBody()
    platforms.create(center + 300, window.innerHeight / 2, 'ground').setScale(width, 12).setOrigin(0).refreshBody()
    platforms.create(center - 300, window.innerHeight / 2, 'ground').setScale(width, 12).setOrigin(0).refreshBody()

    // draw the boat
    this.add.image(center + 150, window.innerHeight / 2, 'boat')
}

function create () {
    this.cameras.main.backgroundColor.setTo(178,255,255)

    let offset = 2216

    // create the water behind the boat
    water1 = this.physics.add.group()
    water1.create(0, window.innerHeight / 2 - 80, 'ocean').setOrigin(0)
    water1.create(0 + offset, window.innerHeight / 2 - 80, 'ocean').setOrigin(0)
    
    // add the boat
    addBoat.call(this)

    // create the water in front of the boat
    water2 = this.physics.add.group()
    water2.create(-200, window.innerHeight / 2 + 80, 'ocean').setOrigin(0)
    water2.create(-200 + offset, window.innerHeight / 2 + 80, 'ocean').setOrigin(0)

    // spawn the player
    player = this.physics.add.sprite(500, 100, 'dog')
    player.displayWidth = 200
    player.scaleY = player.scaleX
    player.setGravity(0, 2000)

    // spawn some groups
    things = this.physics.add.group()
    enemys = this.physics.add.group()

    // a text object to display game info
    text = this.add.text(0, 0, 'There has been an ERROR!', { fill: '#000000' })
    say = this.add.text(20, window.innerHeight - 100, '', { fontFamily: "Arial", fill: '#000000', fontSize: 40, strokeThickness: 0 })

    // make the player collide with the platforms, but only when falling
    this.physics.add.collider(player, platforms, null, (player, _platform) => {
        return player.body.velocity.y >= 0
    })
    this.physics.add.collider(player, enemys, (_player, enemy) => killEnemy(enemy))
    this.physics.add.collider(player, things)

    // add bindings for the keys in the game
    inputs = {
        jump : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),

        backup : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        foward : this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    let t = 3000
    say.setText([
        "We got stuck in a whirlpool!"
    ])
    setTimeout(() => {
        say.setText([
            "We need more fuel to escape!"
        ])
        setTimeout(() => {
            say.setText([
                "About ten whales worth of bluber should be enoght."
            ])
            setTimeout(() => {
                say.setText([
                    ""
                ])
            }, t)
        }, t)
    }, t)
}

function loop(group, func=()=>{}) {
    for (let thing of group.getChildren()) {
        if (thing.body.x + thing.body.width < 0) {
            thing.setPosition(world_length + thing.body.x, thing.body.y)
            func()
        }
    }
}

function water_loop(w1, w2) {
    if (w1.body.x + 2216 < 0) {
        w1.setPosition(
            w2.body.x + 2216,
            w1.body.y
        )
    }
}

function waters_loop(waters) {
    [w1, w2] = waters.getChildren()

    water_loop(w1, w2)
    water_loop(w2, w1)
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


let crew = shuffle([
    "Addision",
    "Parker",
    "Malika",
    "Miles",
    "Ben",
    "Jonah",
    "Eli",
    "Felix"
])

function update() {
    game_update()
}

function game_update() {
    // get the current time (in ms)
    let time = 0 //getTime() - startTime

    if (mode == SPAWNING) {
        if ( getTime() - startTime >= modeTimer ) {
            spawnWave()
            mode = COMBAT
        }
    }

    if (mode == COMBAT) {
        if ( enemysLeft == 0  ) {
            mode = SPAWNING
            modeTimer = getTime() - startTime + 1000
        }
    }

    // update the velocity of the obsticles
    things.setVelocityX( -time / 100 - 250 )
    water1.setVelocityX( -time / 100 - 200 )
    water2.setVelocityX( -time / 100 - 250 )
    enemys.setVelocityX( -time / 100 - 350 )

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

    // loop anything needs to be
    loop(things)
    loop(enemys, () => {
        // we lost a crew member
        lives -= 1

        // tell the player who died
        say.setText([
            `They killed ${crew.pop()}.`
        ])

        
        // is we have no crew, then the game is over
        if (!gameOver && !lives) {
            window.location.href = "./dead.html"
            gameOver = true
        }

        // remove the text
        setTimeout(() => {
            say.setText([""])
        }, 3000)
    })
    waters_loop(water1)
    waters_loop(water2)


    for (let enemy of enemys.getChildren()) enemy.setVelocityY(enemy.getVel(getTime() - startTime))

    // see if you are dead
    if ( !gameOver && player.body.y > window.innerHeight ) {
        window.location.href = "./dead.html"
        gameOver = true
    }

    // update the text
    text.setText([
        'Lives: ' + lives,
        'Kills: ' + totalKills,
    ])
}