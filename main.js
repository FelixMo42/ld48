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


function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


let crew = shuffle([
    "Addison",
    "Parker",
    "Mallika",
    "Miles",
    "Ben",
    "Jonah",
    "Eli",
    "Felix"
])


let face;
let diag_box;
let say;
let diag_scene;
let diag_size = 140

function talk(person, text) {
    face = diag_scene.add.image(0, window.innerHeight - diag_size, person).setOrigin(0)
    face.displayWidth = diag_size
    face.displayHeight = diag_size
    diag_box.setVisible(true)
    say.setText(text)
}

function talk_hide() {
    face.destroy()
    diag_box.setVisible(false)
    say.setText("")
}


function setUpDialogeBox() {
    diag_scene = this
    diag_box = this.add.image(diag_size, window.innerHeight - diag_size, 'white').setOrigin(0).setScale(window.innerWidth - diag_size, diag_size).setVisible(false)
    say = this.add.text(diag_size + 20, window.innerHeight - 90, '', { fontFamily: "Arial", fill: '#000000', fontSize: 40, strokeThickness: 0 })
}












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
    this.load.image("white", "assets/white.png")

    // load in friends
    for (let person of crew) {
        this.load.image(person, `assets/${person.toLowerCase()}.png`)
    }
}

function spawnEnemy(x, y) {
    let enemy = enemys.create(window.innerWidth + 100 + x, window.innerHeight / 2 - y, "blue").setVelocityX( -250 )

    enemy.displayWidth = 100
    enemy.scaleY = enemy.scaleX
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
    let rock = things.create( enemy.body.x , enemy.body.y , "rock" ).setOrigin(0).setVelocityX( -250 )

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

    setUpDialogeBox.call(this)

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
    talk("Miles", "We got stuck in a whirlepool!")
    setTimeout(() => {
        talk("Eli", "We need more fuel to escape!")
        setTimeout(() => {
            talk("Eli", "About ten whales worth of bluber should be enoght.")
        }, t)
    }, t)


    // set the velocity of the obsticles
    water1.setVelocityX( -200 )
    water2.setVelocityX( -250 )
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

function update() {
    game_update()
}

function random_crew_mate() {
    return crew[Math.floor(Math.random() * crew.length)]
}

function game_update() {
    // get the current time (in ms)
    let time = getTime() - startTime

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
        let dead = crew.pop()
        talk(random_crew_mate(), `They killed ${dead}!`)

        
        // is we have no crew, then the game is over
        if (!gameOver && !lives) {
            window.location.href = "./dead.html"
            gameOver = true
        }
    })
    waters_loop(water1)
    waters_loop(water2)


    for (let enemy of enemys.getChildren()) enemy.setVelocityY(Math.sin(time/1000+100) * 100)

    // see if you are dead
    if ( !gameOver && player.body.y > window.innerHeight ) {
        window.location.href = "./dead.html"
        gameOver = true
    }

    // update the text
    text.setText([
        `Lives: ${lives}/8 `,
        `Kills: ${totalKills}/10`,
    ])
}