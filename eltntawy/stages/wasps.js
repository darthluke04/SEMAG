var waspsStage = {
	won : false,

	preload : function() {
		// game.load.image('sad', 'assets/wasps/sad.png');
		// game.load.image('wasp', 'assets/wasps/Wasp.png');

		// game.load.atlasJSONHash('win_anim', 'assets/wasps/win_anim.png', 'assets/wasps/win_anim.json');
		// game.load.atlasJSONHash('lose_anim', 'assets/wasps/lose_anim.png', 'assets/wasps/lose_anim.json');
	},

	create : function() {
		this.won = false;
		//  A simple background for our game
		game.add.sprite(0, 0, 'sad');
		//game.add.sprite(0, 0, 'sky');
		this.players = game.add.group();
		this.players.enableBody = true;
		this.random_number_butterflies = 1 + Math.random() * 10;
		this.beeskilled = this.random_number_butterflies;
		for (var i = 0; i < this.random_number_butterflies; i++) {
			/*var player = game.add.sprite(game.world.randomX, game.world.randomY, 'dude');

			 player.animations.add('left', [0, 1, 2, 3], 10, true);
			 player.animations.add('right', [5, 6, 7, 8], 10, true);
			 */
			this.player = game.add.sprite(game.world.randomX, game.world.randomY, 'wasp');
			this.players.add(this.player);
			this.player.body.collideWorldBounds = true;
			this.player.body.bounce.set(1);
			this.player.body.velocity.setTo(10 + Math.random() * 70, 10 + Math.random() * 70);
		}
		this.players.inputEnabled = true;
		game.physics.enable(this.players, Phaser.Physics.ARCADE);
		game.input.onDown.add(this.mouseclicked, this);
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

		// added animation of losing here because it doesn't play if added elsewhere
        this.win_anim = this.add.sprite(0, 0, 'win_anim');
        this.win_anim.animations.add('win_anim');
        // and hiding it from player
        this.win_anim.alpha = 0;

        // added animation of losing here because it doesn't play if added elsewhere
        this.lose_anim = this.add.sprite(0, 0, 'lose_anim');
        this.lose_anim.animations.add('lose_anim');
        // and hiding it from player
        this.lose_anim.alpha = 0;
	},
	endstage:false,
	update : function() {
		if (this.beeskilled <= 0 && !this.endstage) {
			this.winning();
			this.endstage=true;
		}
	},
	//winning
	winning : function() {
		if (! this.won) {
			globals.score += 100;
			this.win_anim.alpha = 1;
	        
	        this.win_anim.animations.play('win_anim');
	        game.time.events.add(Phaser.Timer.SECOND * 1.7, this.endStage, this);

	        this.won = true;
	    }

	},
	//loosing
	loosing : function() {
		globals.score -= 50;
		globals.lives --;

		this.lose_anim.alpha = 1;
        
        this.lose_anim.animations.play('lose_anim');
        game.time.events.add(Phaser.Timer.SECOND * 2.5, this.endStage, this);
	},
	killbee : function(item) {
		item.kill();
		this.beeskilled--;
	},
	//killing bees
	mouseclicked : function() {

		this.players.forEach(function(item) {
			if ((game.input.x >= item.position.x && game.input.x <= (item.position.x + item.width)) && (game.input.y >= item.position.y && game.input.y <= (item.position.y + item.height))) {
				this.killbee(item);
			}
		}, this);
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