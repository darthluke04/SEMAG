/**
 * Created by eltntawy on 21/02/15.
 */

var menuStage = {
    preload : function () {
        game.load.image('playButtonUnpressed', 'assets/menu/playButtonUnpressed.png');
        game.load.image('playButtonPressed', 'assets/menu/playButtonPressed.png');

        game.load.image('soundPressed', 'assets/menu/soundPressed.png');
        game.load.image('soundUnpressed', 'assets/menu/soundUnpressed.png');

        game.load.image('noSoundPressed', 'assets/menu/noSoundPressed.png');
        game.load.image('noSoundUnpressed', 'assets/menu/noSoundUnpressed.png');

        game.load.image('station', 'assets/menu/station.png');

        game.load.audio('music', 'assets/menu/music.mp3');
    } ,
    
    create : function() {


        /**************************************************************************************/
        // start the P2JS physics system
        /**************************************************************************************/
        game.physics.startSystem(Phaser.Physics.P2JS);
        
        /**************************************************************************************/
        // for just developing add button hear and set an action for that button to start your stage
        // ex :
        /**************************************************************************************/
        this.background = game.add.tileSprite(0, 0, 800, 600, 'station');
        // background.anchor.setTo(0.5,0.5);

        this.btn = game.add.button(game.world.centerX, game.world.height - 100, 'playButtonUnpressed',this.startGame, this);
        this.btn.anchor.setTo(0.5,0.5);

        this.soundBtn = game.add.button(game.world.width - 100, game.world.height - 100, 'soundUnpressed',this.toggleSound);
        this.soundBtn.anchor.setTo(0.5,0.5);

        game.music = game.add.audio('music');
        game.music.play('', 0, 1, true);
        /**************************************************************************************/
    }, 
    update : function () {

        
    },

    // use this if you want stages to appear in order
    order: 0,

    startGame : function () {
        /**************************************************************************************/
        // start the game stage
        /**************************************************************************************/

        //game.state.start('electricityStage');
        //game.state.start('pokeTheBearStage');
        // these are for debugging single stages
        // game.state.start('runningStage');
        // game.state.start('forkStage');
        //game.state.start('scoreStage');
        //game.state.start('spaceStage');
        // game.state.start('waspsStage');
        // game.state.start('trainStage');
        // game.state.start('dontPressTheButtonStage');

        // make levels choose randomly
        // var nextLevel = globals.stages[game.rnd.integerInRange(0, globals.stages.length - 1)];

        // make levels choose in order
        console.log(this.order);
        var nextLevel = globals.stages[globals.order];
        globals.order ++;

        game.state.start(nextLevel);

        /**************************************************************************************/
        // logger
        console.log('menuStage : gameStage is started');
    },

    toggleSound : function () {
        // game.music.pause() || game.music.resume();
        // this.soundBtnPressed = game.add.sprite('soundPressed', 200, 200);
        if (game.music.volume === 1)
            game.music.volume = 0;
        else
            game.music.volume = 1;
    }
}