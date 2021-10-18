var runningStage = {
    preload: function() {
        // game.load.image('runner', 'assets/runningStage/runner.png');
        // game.load.image('hiddenButton', 'assets/runningStage/hiddenButton.png');
        // game.load.image('bg', 'assets/runningStage/bg.jpg');

        // game.load.atlasJSONHash('run_anim', 'assets/runningStage/run_anim.png', 'assets/runningStage/run_anim.json');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // game.stage.backgroundColor = "#34dbdb";
        this.background = game.add.tileSprite(0, 0, 800, 600, 'bg');

        // this.runner = game.add.sprite(game.world.centerX, game.world.centerY, 'runner');
        this.runner = game.add.sprite(game.world.centerX, game.world.centerY, 'run_anim');
        this.runner.animations.add('run_anim');
        this.runner.animations.play('run_anim');

        // this.runner.scale.x = 0.2;
        // this.runner.scale.y = 0.2;
        this.runner.anchor.set(0.5, 0.5);
        game.physics.arcade.enable(this.runner);
        // this.runner.body.collideWorldBounds = false;
        this.runner.body.velocity.y = 20;
        // this.runner.body.enableDrag = true;

        // this.runner = game.add.sprite(game.world.centerX, game.world.centerY, 'anim', 'running0000.jpg');
        // this.runner.scale.x = 2;
        // this.runner.scale.y = 2;
        
        this.hiddenButton = game.add.sprite(0, 0, 'hiddenButton');
        this.hiddenButton.inputEnabled = true;
        this.hiddenButton.events.onInputDown.add(this.tapped, this);


        // duration bar
        this.preloadBar = game.add.graphics(0, 3);
        this.preloadBar.lineStyle(3, 0xaa3300, 1);
        this.preloadBar.moveTo(0, 0);
        this.preloadBar.lineTo(game.width, 0);
        this.preloadBar.scale.x = 1;
        this.preloadBar.scale.y = 3;

        // set the time after which the game ends
        game.time.events.add(Phaser.Timer.SECOND * globals.duration, this.lose, this);

        // moves duration bar
        game.time.events.repeat(Phaser.Timer.SECOND / 20, globals.duration * 20, this.decreaseTimer, this);
    },

    update: function() {
        if (this.runner.body.position.y > 550) {
            console.log("win");
            globals.score += 100;
            this.endStage();
        }

        if (this.runner.body.velocity.y > 0) {
        	this.runner.body.velocity.y --;
        };
    },

    lose: function() {
    	globals.score -= 50;
    	globals.lives --;
    	this.endStage();
    },

    tapped: function() {
    	console.log("tapped");
    	this.runner.scale.x *= 1.04;
    	this.runner.scale.y *= 1.04;
    	this.runner.body.velocity.y += 20;
    	this.runner.animations.play('run_anim');
    	// game.add.tween(this.runner.scale).to( { x: this.runner.scale.x*1.05, y: this.runner.scale.y*1.05 }, 500, Phaser.Easing.Linear.None, true);
    },
    
    // time allocated for stage
    // duration: 5,

    endStage: function() {
        game.state.start('scoreStage');
    },

    decreaseTimer: function () {
        this.preloadBar.scale.x -= 1/globals.duration/20;
    }
}