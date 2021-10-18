var gameoverStage = {
    preload: function () {



    },

    create: function() {


        game.add.sprite(0, 0, 'scoreBackground');
        var logo = game.add.sprite(game.world.width/2, 100,'logo');
        logo.anchor.setTo(.5,.5);

        var die = game.add.sprite(game.world.width / 2 - 100, game.world.height - 200, 'playerDie');
        die.scale.setTo(0.5, 0.5);
        die.anchor.setTo(0.5, 0.5);

        var die = game.add.sprite(game.world.width / 2, game.world.height - 200, 'playerDie');
        die.scale.setTo(0.5, 0.5);
        die.anchor.setTo(0.5, 0.5);


        var die = game.add.sprite(game.world.width / 2 + 100, game.world.height - 200, 'playerDie');
        die.scale.setTo(0.5, 0.5);
        die.anchor.setTo(0.5, 0.5);


        var txt = 'your score : ' + globals.score;
        scoreText = game.add.text(game.world.width / 2, game.world.height / 2 - 100, txt, {fontsize: 28,fill: 'white'});
        scoreText.anchor.setTo(0.5, 0.5);

        scoreText = game.add.text(game.world.width / 2, game.world.height / 2 , 'Game Over', {fontsize: 28,fill: 'black'});
        scoreText.anchor.setTo(0.5, 0.5);

        this.btn = game.add.button(game.world.centerX, game.world.height - 100, 'playButtonUnpressed',this.startGameAgain);
        this.btn.anchor.setTo(0.5,0.5);
    },

    update: function() {

    },
    startGameAgain : function () {

    	globals.score = 0;
        globals.lives =3;
        var nextLevel = globals.stages[game.rnd.integerInRange(0, globals.stages.length - 1)];
        game.state.start(nextLevel);
    }
}