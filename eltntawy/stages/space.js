var spaceStage = {
	preload : function() {
		// game.load.image('astronaut', 'assets/space/astronaut.png');
		// game.load.image('asteroid', 'assets/space/asteroid.png');
		// game.load.image('helmet', 'assets/space/helmet.png');
	},

	create : function() {
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.stage.backgroundColor = "#6b6285";
		//asteroids
		this.obstecle = game.add.group();
		this.obstecle.enableBody = true;
		this.random_number = 1 + Math.random() * 2;
		for (var i = 0; i < this.random_number; i++) {
			this.rand = 100 * (1 + (Math.random() * 3));
			this.obs = this.obstecle.create(game.world.randomX, 20 + this.rand, 'asteroid');
			game.physics.enable(this.obs, Phaser.Physics.ARCADE);
			this.obs.body.collideWorldBounds = true;
			this.obs.body.immovable = true;
		}
		//helmet
		this.helmet = game.add.sprite(950, 550, 'helmet');
		game.physics.enable(this.helmet, Phaser.Physics.ARCADE);
		this.helmet.body.velocity.setTo(10 + Math.random() * 70, 10 + Math.random() * 70);
		this.helmet.body.collideWorldBounds = true;
		this.helmet.body.bounce.setTo(1, 1);
		//astronaut
		this.astronaut = game.add.sprite(game.world.randomX, 80, 'astronaut');
		game.physics.enable(this.astronaut, Phaser.Physics.ARCADE);
		this.astronaut.anchor.setTo(0.5, 0.5);
		this.astronaut.body.collideWorldBounds = true;
		this.astronaut.body.bounce.setTo(1, 1);
		// duration bar
		this.preloadBar = game.add.graphics(0, 3);
		this.preloadBar.lineStyle(3, 0xaa3300, 1);
		this.preloadBar.moveTo(0, 0);
		this.preloadBar.lineTo(game.width, 0);
		this.preloadBar.scale.x = 1;
		this.preloadBar.scale.y = 3;

		// set the time after which the game ends
		game.time.events.add(Phaser.Timer.SECOND * this.duration, this.loosing, this);

		// moves duration bar
		game.time.events.repeat(Phaser.Timer.SECOND / 20, this.duration * 20, this.decreaseTimer, this);
	},

	update : function() {
		game.physics.arcade.collide(this.helmet, this.obstecle);
		game.physics.arcade.collide(this.astronaut, this.obstecle);

		game.physics.arcade.collide(this.astronaut, this.helmet, this.catch_helmet, null, this);
		this.astronaut.rotation = game.physics.arcade.moveToPointer(this.astronaut, 60, game.input.activePointer, 800);
	},
	//loosing
	loosing : function() {
		globals.score -= 50;

        globals.lives --;
		this.endStage();
	},
	//winnig
	catch_helmet : function() {
		globals.score += 100;
		this.endStage();
	},
	// time allocated for stage
	duration : 5,

	endStage : function() {
		game.state.start('scoreStage');
	},

	decreaseTimer : function() {
		this.preloadBar.scale.x -= 1 / this.duration / 20;
	}
}