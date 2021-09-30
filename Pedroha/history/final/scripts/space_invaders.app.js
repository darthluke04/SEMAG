"use strict";


function Game() {
    this.score = 0;
    this.lives = 3;
    this.player = "Captain Kirk"; // "Voldemor";
    
    var scene = new Scene();
    var ship = scene.getShip();
    var inputCommand = new InputCommand(ship);
    
    this.getScene = function() {
        return scene;
    }

    this.getInputCommand = function() {
        return inputCommand;
    }

    this.isFinished = function() {
        var done = scene.allInvadersKilled() || scene.invadersReachedBottom();
        return done;
    }
}


var game = new Game();
var scene = game.getScene();

scene.addCollisionListener(function updateScore(invader) {
    game.score += invader.points;
});

var engine = {
    updateModel: function() {
        scene.updateModel();
    },
    displayModel: function() {
        scene.paintBackground();
        scene.drawMissiles();
        scene.drawShip();
        scene.drawEnemy();
        scene.drawGameStatus(game.score);
    },
    finished: function() {
        return game.isFinished();
    }
};

var inputCommand = game.getInputCommand();
var inputHandler = setupInputHandlers(inputCommand);

engine.displayModel();

if (1) { // It's possible to optimized with some common timed event queue model
    var modelLoop = function() {
        engine.updateModel();
        if (!engine.finished()) {
            setTimeout(modelLoop, 100); // coordinate with Invader.speed
        }
    };

    var inputLoop = function() {
        inputHandler.handleInput();
        if (!engine.finished()) {
            setTimeout(inputLoop, 5); // coordinate with Ship.speed
        }
    };

    var displayLoop = function() {
        engine.displayModel();
        if (!engine.finished()) {
            setTimeout(displayLoop, 33); 
        }
    };

    var gameLoop = function() {
        if (!engine.finished()) {
            setTimeout(gameLoop, 1000); 
        }
        else {
            setTimeout(function() {
                gameCompleted();
            }, 1000);
        }
    };
    displayLoop();
    modelLoop();
    inputLoop();
    gameLoop();            
}

function gameCompleted() {
    var playerWon = scene.allInvadersKilled();
    if (playerWon) {
        scene.drawTextOverlay("YOU WON", "Congratulations " + game.player + "!");
    }
    else {
        scene.drawTextOverlay("GAME OVER", "Too bad... " + game.player);
    }
}

