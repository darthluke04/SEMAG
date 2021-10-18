var pokeTheBearStage = {
    preload: function(){

        game.load.image('pokeBar', 'assets/pokeTheBear/pokeBar.png');
        game.load.image('pokeSafe', 'assets/pokeTheBear/pokeSafe.png');
        game.load.image('bearFace', 'assets/pokeTheBear/bearFace.png');
        game.load.image('stick', 'assets/pokeTheBear/stick.png');


        game.load.atlasJSONHash('dummySprite', 'assets/pokeTheBear/dummy.png', 'assets/pokeTheBear/dummy.json');
        game.load.atlasJSONHash('bearBellySprite', 'assets/pokeTheBear/bearBelly.png', 'assets/pokeTheBear/bearBelly.json');
        game.load.atlasJSONHash('bearEatingSprite', 'assets/pokeTheBear/bearOpenEating.png', 'assets/pokeTheBear/bearOpenEating.json');

    },

    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = "#88bac3";

        this.initialStartX = game.world.centerX;
        this.trials = 0;
        this.win = false;

        this.dummy = game.add.sprite(this.game.world.centerX + 170, game.world.centerY + 10, 'dummySprite');
        this.dummy.anchor.set(.5,.5);
        this.dummy.animations.add('pokeAnime', [0, 1, 2, 3], 10);
        this.dummy.animations.add('dummyEaten', [4, 5, 6, 7], 10);
        this.dummy.animations.add('dummyLower', [8, 9, 10, 11, 12], 10);


        this.stick = game.add.sprite(game.world.centerX + 240, game.world.centerY - 32, 'stick');
        this.stick.anchor.set(0,0);
        this.stick.alpha = 0;

        this.bearBelly = game.add.sprite(this.game.world.width, 0, 'bearBellySprite');
        this.bearBelly.anchor.set(1,0);
        this.bearBelly.animations.add('bearBellyPoked', [], 5);

        this.pokeBar = game.add.sprite(this.initialStartX, game.world.height - 100, 'pokeBar');
        this.pokeBar.anchor.set(.5,.5);

        this.pokeSafe = game.add.sprite(this.initialStartX, game.world.height - 100, 'pokeSafe');
        this.pokeSafe.anchor.set(.5,.5);

        this.bearFace = game.add.sprite(this.initialStartX, game.world.height - 100, 'bearFace');
        this.bearFace.anchor.set(.5,.5);

        this.bearEating = game.add.sprite(game.world.centerX + 170, 0, 'bearEatingSprite');
        this.bearEating.anchor.set(0.5, 1);
        this.bearEating.animations.add('bearOpeningMouth', [], 9);

        game.physics.arcade.enable(this.bearFace);
        game.physics.arcade.enable(this.pokeSafe);
        game.physics.arcade.enable(this.bearEating);

        this.bearFace.body.velocity.x = 300;

        // duration bar
        this.preloadBar = game.add.graphics(0, 3);
        this.preloadBar.lineStyle(3, 0xaa3300, 1);
        this.preloadBar.moveTo(0, 0);
        this.preloadBar.lineTo(game.width, 0);
        this.preloadBar.scale.x = 1;
        this.preloadBar.scale.y = 3;

        // set the time after which the game ends
        game.time.events.add(Phaser.Timer.SECOND * this.duration, this.endStage, this);

        // moves duration bar
        game.time.events.repeat(Phaser.Timer.SECOND / 20, this.duration * 20, this.decreaseTimer, this);

    },

    update: function(){

        if(this.bearEating.position.y < 0){
            this.bearEating.body.velocity.y = 0;
            this.bearEating.body.velocity.x = 0;
            this.bearEating.position.x = game.world.centerX + 170;
            this.bearEating.position.y = 0;
        }

        if (this.bearFace.position.x >= this.initialStartX + (this.pokeBar.width / 2 - 40) && this.bearFace.body.velocity.x > 0)
            this.bearFace.body.velocity.x = this.bearFace.body.velocity.x * -1;
        else if(this.bearFace.position.x <= this.initialStartX - (this.pokeBar.width / 2 - 40) && this.bearFace.body.velocity.x < 0)
            this.bearFace.body.velocity.x = this.bearFace.body.velocity.x * -1;

        game.input.onDown.addOnce(this.poked, this);

    },

    poked: function(){


        this.stick.alpha = 1;
        this.bearBelly.animations.play('bearBellyPoked');


        this.bearEating.body.velocity.x = -200;
        this.bearEating.body.velocity.y = 700;
        this.bearEating.animations.play('bearOpeningMouth');
        this.bearEating.events.onAnimationComplete.add(function(){
            this.stick.alpha = 0;

            this.bearEating.body.velocity.y = -800;
            this.bearEating.body.velocity.x = 200;

        }, this);

        //dummy escaped the eating bear
        if(this.pokeSafe.getBounds().containsRect(this.bearFace.getBounds())){
            console.log("got it");

            this.dummy.animations.stop(null, true);
            this.dummy.animations.play('dummyLower');

            this.dummy.events.onAnimationComplete.add(function(){
                this.trials++;
                console.log(this.trials);
                if(this.trials == 2){
                    this.win = true;
                    this.endStage();
                }
            }, this);
        }
        else{
            this.dummy.animations.play('dummyEaten');
            this.dummy.events.onAnimationComplete.add(function(){
                this.endStage();
            }, this);

        }

    },
    // time allocated for stage
    duration: 5,

    endStage: function() {
        if (this.win == true)
        {
            globals.score += 100;
            game.state.start('scoreStage');
        }
        else{
            globals.score -= 50;
            globals.lives --;
            game.state.start('scoreStage');
        }
    },

    decreaseTimer: function () {
        this.preloadBar.scale.x -= 1/this.duration/20;
    }
};