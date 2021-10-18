/**
 * Created by eltntawy on 24/02/15.
 */


/**************************************************************************************/
// Dont forget to load your script first in index.html by ordering of use
/**************************************************************************************/

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

game.state.add('preload', preloadStage);    // for resource loading
game.state.add('menu', menuStage);          // for menu stage and game entry point
game.state.add('scoreStage', scoreStage);          // the score stage

game.state.add('electricityStage', electricityStage);          // the cable stage
game.state.add('electricity_success', electricitySuccess);          // the game stage
game.state.add('electricity_fail', electricityFail);          // the game stage
game.state.add('forkStage', forkStage);            // the fork stage
game.state.add('runningStage', runningStage);            // the running stage
game.state.add('pokeTheBearStage', pokeTheBearStage); //the poke stage
game.state.add('spaceStage', spaceStage); //the space stage
game.state.add('waspsStage', waspsStage); //the space stage
game.state.add('gameoverStage',gameoverStage); // gameover stage
game.state.add('dontPressTheButtonStage',dontPressTheButtonStage); // gameover stage
game.state.add('electricityTestStage',electricityTestStage); // test stage
game.state.add('trainStage',trainStage); // test stage
game.state.add('boot', boot); // boot  stage
game.state.add('killThatDear', killThatDearStage);

// globals
var globals = {
	// add your stage to this stages array to make the game choose randomly from it
    stages: ['electricityStage', 'killThatDear', 'forkStage', 'runningStage', 'spaceStage', 'trainStage', 'waspsStage','dontPressTheButtonStage', 'pokeTheBearStage'],
    //stages: ['killThatDear'],
    score: 0,
    lives: 3 ,
    duration : 5,
    difficulty : 1,
    order: 0
};

$(document).ready(function () {
    // this stage for loading resources from the system and display loading progress user
    game.state.start('boot');
    //game.state.start('dontPressTheButtonStage');
    }
);