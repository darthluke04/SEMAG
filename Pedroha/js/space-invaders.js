(function() {

"use strict";

var DISPLAY_WIDTH  = 800;
var DISPLAY_HEIGHT = 600;

var SHIP_GROUND_LEVEL = DISPLAY_HEIGHT - 100;

var SOUND_ON = true;
var NUM_MISSILES = 3;

var DEBUG_BLOCK_PAINTER = false;

var TEXT_OVERLAY_COLOR = "#00ff00"; // "white";

window.onload = function() {

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
}

var soundMachine = new SoundMachine();
var spriteFactory = new SpriteFactory();

// Inspired and borrowed from: http://www.storiesinflight.com/html5/audio.html
function SoundMachine(maxChannels) {
    var count = maxChannels || 10;
    if (!SOUND_ON) {
        this.play = function() {
        }
    }
    else {
        var audioChannels = [];

        for (var a = 0; a < count; a++) {
            audioChannels[a] = {
                channel: new Audio(),
                finished: -1
            }
        }
        
        var play = function(channel, domElt) {                        
            channel.src = domElt.src;
            channel.load();
            channel.play();
        };

        this.play = function(soundId) {
            var domElt = document.getElementById(soundId);
            
            for (var a = 0; a < audioChannels.length; a++) {
                var now = new Date().getTime();
                if (audioChannels[a].finished < now) {
                    audioChannels[a].finished = now + 1000 * domElt.duration;
                    var channel = audioChannels[a].channel;
                    play(channel, domElt);
                    break;
                }
            }
        };
    }
}

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

function Display() {
    var canvas = document.getElementById('invaderCanvas');
    var ctx = canvas.getContext('2d');
    
    this.fillRect = function(bitmap) {
        ctx.fillStyle = bitmap.color;
        ctx.fillRect(bitmap.x, bitmap.y, bitmap.width, bitmap.height);
    }
    
    this.paintImage = function(bitmap) {
        // ctx.drawImage(bitmap.image, bitmap.x, bitmap.y);
        // stretched!        
        ctx.drawImage(bitmap.image, bitmap.x, bitmap.y, bitmap.width, bitmap.height);
    }

    this.drawCenteredText = function(text, y, fontSize, color, bold) {
        var size = fontSize || 14;
        var bold = (bold) ? "Bold " : "";
        
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = bold + fontSize + "pt Arial";
        var width = ctx.measureText(text).width;
        ctx.restore();
        
        var x = (DISPLAY_WIDTH - width) / 2;
        
        this.drawText(text, x, y, fontSize, color, bold);
    }
    
    this.drawText = function(text, x, y, fontSize, color, bold) {
        var size = fontSize || 14;
        var color = color || TEXT_OVERLAY_COLOR;
        var bold = (bold) ? "Bold " : "";

        ctx.save();
        ctx.fillStyle = color;
        ctx.font = bold + fontSize + "pt Arial";
        ctx.fillText(text, x, y);
        ctx.restore();
    }
}

function CanvasPainter() {
    var display = new Display();
    
    var debug = DEBUG_BLOCK_PAINTER;
    
    this.paint = function(bitmap, drawImage) {
        if (debug) {
            if (!bitmap.visible || !drawImage) {
                display.fillRect(bitmap);
            }
            if (drawImage) {
                display.paintImage(bitmap);
            }
        }
        if (bitmap.visible) {
            if (drawImage) {
                display.paintImage(bitmap);
            }
            else {
                display.fillRect(bitmap);
            }
        }
    }

    this.paintBackground = function() {
        display.fillRect({
          color: "black"
        , x: 0
        , y: 0
        , width: DISPLAY_WIDTH
        , height: DISPLAY_HEIGHT
        });
        
        var debug = false;
        if (debug) {
            
            display.fillRect({
              color: "rgb(64, 64, 64)"
            , x: spriteBounds.left
            , y: spriteBounds.top
            , width: spriteBounds.right // should be:  spriteBounds.right - spriteBounds.left?
            , height: spriteBounds.bottom - spriteBounds.top
            });
        }
    };
    
    this.drawText = function(text, x, y, fontSize, color, bold) {
        display.drawText(text, x, y, fontSize, color, bold);
    }
    
    this.drawTextOverlay = function(title, subtitle) {
        display.drawCenteredText(title, 200, 40, TEXT_OVERLAY_COLOR, true);
        display.drawCenteredText(subtitle, 250, 14);
    }
}

function ScenePainter(painter, ship, enemy) {
    var paint = function(bitmap, drawImage) {
        painter.paint(bitmap, drawImage);
    }
    
    this.paintBackground = function() {
        painter.paintBackground();
    };

    this.drawShip = function() {
        paint(ship, true);
    };
    
    this.drawEnemy = function() {
        enemy.forEachInvader(function(invader) {
            paint(invader, true);
        });
    }
    
    this.drawMissiles = function() {
        var missiles = ship.getMissiles();
        for (var j = 0; j < missiles.length; j++) {
            var missile = missiles[j];
            if (missile.isActive()) {
                paint(missile);
            }
        }
    }
    this.drawGameStatus = function(score) {
        painter.drawText("Score: " + score, 10, 30, 20, "#00ff00", true);
    }
    this.drawTextOverlay = function(title, subtitle) {
        painter.drawTextOverlay(title, subtitle);
    }
    this.drawText = function(text, x, y, fontSize, color, bold) {
        painter.drawText(text, x, y, fontSize, color, bold);
    }
}

function Sprite(x, y, w, h, speed, bounds) { // Ship, Missile, Invader
    this.x = x || 0;
    this.y = y || 0;
    this.width = w || 20;
    this.height = h || 20;
    this.speed = speed || 10;
    this.bounds = bounds;

    this.visible = true;
}

function SpriteFactory() {
    var images = {
        ship: new Image()
      , invader1: new Image()
      , invader2: new Image()
      , invader3: new Image()
    };

    images.ship.src     = "graphics/ship.png";
    images.invader1.src = "graphics/invader1.png";
    images.invader2.src = "graphics/invader2.png";
    images.invader3.src = "graphics/invader3.png";

    var spriteBounds = {
        top:    0
      , right:  DISPLAY_WIDTH - 100
      , bottom: SHIP_GROUND_LEVEL
      , left:   50
    };
    
    this.createShip = function() {
        var x = 400;
        var y = SHIP_GROUND_LEVEL;
        var width = 30;
        var height = 20;

        var speed = 2;
        var ship = new Ship(x, y, width, height, speed, spriteBounds);
        ship.color = 'rgb(255, 64, 64)';
        ship.image = images.ship;
        return ship; 
    }
    this.createInvader = function(type, x, y) {
        var color, points, width, img;

        if (type === 0) {
            color = '#64a242'; points = 50; width = 20; img = images.invader1;
        }
        else if (type === 1) {
            color = '#abcabc'; points = 20; width = 30; img = images.invader2;
        }
        else {
            color = '#bada55'; points = 10; width = 30; img = images.invader3;
        }
        var height = 20;
        var speed = 5;
        var xcenter = x + (30 - width) / 2;

        var invader = new Invader(xcenter, y, width, height, speed, spriteBounds);
        invader.color = color;
        invader.image = img;
        invader.points = points;

        return invader;
    }
    this.createMissile = function() {
        var x = 0; // usually overwritten
        var y = SHIP_GROUND_LEVEL;
        var width = 5;
        var height = 15;
        var speed = 20;

        var missile = new Missile(x, y, width, height, speed, spriteBounds);

        missile.color = 'rgb(64, 255, 255)';
        return missile;
    }
}

function Scene() {
    var ship = spriteFactory.createShip();
    var enemy = new InvaderArmy();
    var canvasPainter = new CanvasPainter();
    var scenePainter = new ScenePainter(canvasPainter, ship, enemy);
    var collisionListeners = [];

    // Inherit: paintBackground, drawShip, drawEnemy, drawMissiles
    for (var p in scenePainter) {
        if (typeof scenePainter[p] === "function") {
            this[p] = scenePainter[p];
        }
    }

    this.getShip = function() { return ship; }
    
    this.updateScore = function(score) {
        var scoreElt = document.getElementById('score');
        scoreElt.innerHTML = game.score;    
    }
    
    this.addCollisionListener = function(listener) {
        collisionListeners.push(listener);
    }

    this.updateModel = function() {
        enemy.moveNext();
        
        var missiles = ship.getMissiles();
        for (var j = 0; j < missiles.length; j++) {
            var missile = missiles[j];
            missile.moveNext();
        }
        this.handleCollisions();
    }
    
    this.allInvadersKilled = function() {
        var allKilled = true;

        enemy.forEachInvader(function(invader) {
            if (invader.visible) {
                allKilled = false;
                return true;
            }
        });
        return allKilled;
    }
    
    this.invadersReachedBottom = function() {
        return enemy.reachedBottom();
    }
    
    var handleHit = function(missile, invader) {
        soundMachine.play('invaderKilledSound');
        
        // Take out missile from view
        missile.setActive(false);
    
        // Explode Invader
        invader.color = 'yellow';
        invader.visible = false;
        
        for (var j = 0; j < collisionListeners.length; j++) {
            collisionListeners[j](invader);
        }
    };
    
    this.handleCollisions = function() {
        enemy.forEachInvader(function(invader) {
            var missiles = ship.getMissiles();
            
            for (var k = 0; k < missiles.length; k++) {
                var missile = missiles[k];

                if (missile.hits( invader )) {
                    handleHit(missile, invader);
                }
            }
        });
    }
};

function Ship(x, y, w, h, speed, bounds) {
    Sprite.apply(this, arguments);
    
    var missilePool = new MissilePool(NUM_MISSILES);
    var xmax = bounds.right;
    var xmin = bounds.left;

    this.moveRight =  function() {
        if (this.x + this.speed < xmax) {
            this.x += this.speed;
        }
    }
    this.moveLeft = function() {
        if (this.x - this.speed > xmin) {
            this.x -= this.speed;
        }
    }
    this.fire = function() {
        var s = this;
        missilePool.createMissile(s.x + s.width/2, s.y);
    }
    this.getMissiles = function() {
        return missilePool.getMissiles();
    }
}

function InvaderArmy() {
    var MOVE_LEFT   = 0;
    var MOVE_RIGHT  = 1;
    var MOVE_DOWN   = 2;
    
    var invaders = [];
    var enemyReachedBottom = false;
    
    var moveDir = MOVE_RIGHT
      , lastHorizontalDir = moveDir
      , dx = 0, dy = 0
      , maxdx = 100   // move between -100 to 100
      , maxdy = 10    // increment depends on invader.moveDown()
      ;
    
    var getLeftMostInvader = function() {
        return invaders[0];
    };

    var getRightMostInvader = function() {
        return invaders[invaders.length-1];
    };
    
    var forEachInvader = function(fn) {
        for (var j = 0; j < invaders.length; j++) {
            var invader = invaders[j];
            var value = fn(invader, j);
            if (value) {
                return value;
            }
        }
        return null;
    };
    this.forEachInvader = forEachInvader;
  
    var getBottomInvader = function() {
        var last = forEachInvader(function(invader, j) {
            var back = invaders.length - j - 1;
            var invader = invaders[back];
            if (invader && invader.visible) {
                return invader;
            }
        });
        return last;
    };
    
    this.setupInvaders = function(invadersPerRow) {
        var NUM_ROWS = 5;
        
        var deltaX = (DISPLAY_WIDTH-200) / invadersPerRow;
        var deltaY = 30;
        
        var startX = 100;
        var y = 50;
        
        for (var row = 0; row < NUM_ROWS; row++) {
            var invaderType = Math.floor( (row+1) / 2);
            var x = startX;
            y += deltaY;
            for (var j = 0; j < invadersPerRow; j++) {
                var invader = spriteFactory.createInvader(invaderType, x, y);
                invaders.push(invader);                    
                x += deltaX;
            }
        }
    }

    this.reachedBottom = function() {
        return enemyReachedBottom;
    };
    
    var handleArmyDirection = function() {
        if (moveDir !== MOVE_DOWN) {
            lastHorizontalDir = moveDir;
        }
        // Change direction?
        
        var leftmost = getLeftMostInvader();
        var rightmost = getRightMostInvader();
        var canMoveLeft = leftmost.canMoveLeft(); // definitely not [0]
        var canMoveRight = rightmost.canMoveRight();
        
        if ((moveDir === MOVE_RIGHT && !canMoveRight)
        || (moveDir === MOVE_LEFT && !canMoveLeft)) {
            moveDir = MOVE_DOWN;
        }
        else
        if (moveDir === MOVE_DOWN) {
            dy += leftmost.speed;
            
            if (dy > maxdy) {
                dy = 0;
                moveDir = (lastHorizontalDir === MOVE_LEFT) ? MOVE_RIGHT : MOVE_LEFT;
            }
            var bottom = getBottomInvader();
            if (!bottom.canMoveDown()) {
                enemyReachedBottom = true;
            }
        }            
    };

    this.moveNext = function() {
        var volunteer = invaders[0]; // pick an arbitrary invader
        var method = null;
        switch(moveDir) {
            case MOVE_RIGHT: method = volunteer.moveRight;    break;
            case MOVE_LEFT:  method = volunteer.moveLeft;     break;
            case MOVE_DOWN:  method = volunteer.moveDown;     break;
            default:
        }
        if (method) {
            // soundMachine.play('fastInvader3Sound');
            forEachInvader(function(invader) {
               method.call(invader);
            });
        }
        handleArmyDirection();
    };
    this.setupInvaders(10);
}

function Invader(x, y, w, h, speed, bounds) {
    Sprite.apply(this, arguments);
    
    var xmax = bounds.right;
    var xmin = bounds.left;
    var ymax = bounds.bottom;
    
    this.canMoveRight = function() {
        var can = (this.x + this.width/2 + this.speed < xmax);
        return can;
    }

    this.moveRight = function() {
        if (this.x + this.speed < xmax) {
            this.x += this.speed;
        }
    }
    
    this.canMoveLeft = function() {
        var can = (this.x - this.width/2 - this.speed > xmin);
        return can;
    }

    this.moveLeft = function() {
        if (this.x - this.speed > xmin) {
            this.x -= this.speed;
        }
    }
    
    this.canMoveDown = function() {
        var can = (this.y + this.speed/2 < ymax);
        return can;
    }

    this.moveDown = function() {
        if (this.y + this.speed/2 < ymax) {
            this.y += this.speed/2;
        }
    }        
}

function MissilePool(size) {
    var missiles = [];
    
    var count = size || 3;
    for (var j = 0; j < count; j++) {
        var m = spriteFactory.createMissile();
        missiles.push(m);
    }

    this.createMissile = function(x, y) {
        for (var j = 0; j < missiles.length; j++) {
            var missile = missiles[j];
            if (!missile.isActive()) {
                soundMachine.play('shootSound');
                missile.position(x, y);
                break;
            }
        }
    }
    
    this.getMissiles = function() {
        return missiles;
    }
}

function Missile(x, y, w, h, speed, bounds) {
    Sprite.apply(this, arguments);
    
    var active = false; // protect this variable!
    
    this.isActive = function() { return active; }
    this.setActive = function(state) { active = state; }

    this.position = function(x, y) {
        if (!active) {
            active = true;
            this.y = y;
            this.x = x - this.width/2;
        }
        return active;
    }

    this.moveNext = function() {
        if (active) {
            if (this.y - this.speed > bounds.top) {
                this.y -= this.speed;
            }
            else {
                active = false;
            }
        }
    }
    
    this.hits = function(invader) {
        if (!active || !invader.visible) {
            return false;
        }
        
        // Check for overlap between this.[x, y, w, h] and invader.[x, y, w, h]
        var collision = false;
        
        // We "know" that missiles are "thinner" than enemy ships.
        // Therefore, the missile "must" be within the width of the invader
        
        var m = this; // m: missile
        
        var xInside = (invader.x <= m.x && m.x + m.width <= invader.x + invader.width);
        if (xInside) {
            collision = true;
            
            var missileBelowInvader = (m.y > invader.y + invader.height);
            var invaderBelowMissile = (invader.y > m.y + m.height);
            
            if (missileBelowInvader || invaderBelowMissile) {
                collision = false;
            }
        }
        return collision;
    }
}

// -------------------------------------

// onKeyDown(space) -> fireQueue.push({});
// handleInput() -> pop 1 and fire

// onKeyDown(LEFT) -> MOVE_LEFT = TRUE;
// onKeyUp(LEFT) -> MOVE_LEFT = FALSE;

// onKeyDown(RIGHT) -> MOVE_RIGHT = TRUE;
// onKeyUp(RIGHT) -> MOVE_RIGHT = FALSE;

// handleInput() -> If MOVE_LEFT -> handleCommand(CMD_SHIP_LEFT)
// handleInput() -> If MOVE_RIGHT -> handleCommand(CMD_SHIP_RIGHT)

var CMD_FIRE = "fire";
var CMD_SHIP_LEFT = "ship-left";
var CMD_SHIP_RIGHT = "ship-right";

function InputCommand(ship) {
	this.handleCommand = function(command) {
	    switch(command) {
	        case CMD_FIRE       : ship.fire();     break;
	        case CMD_SHIP_LEFT  : ship.moveLeft();  break;
	        case CMD_SHIP_RIGHT : ship.moveRight(); break;
	        default:
	            throw new Error("Command not recognized: " + command);
	    }
	}        
}

function KeyInputBuffer(inputCommand) {
    if (!inputCommand) {
        throw new Error("KeyInputBuffer(inputCommand): missing inputCommand!");
    }
	var rightDown = false;
	var leftDown = false;
    var fireQueue = [];
	
    this.pressRightDown = function(state) {
        rightDown = state;
    }
    this.pressLeftDown = function(state) {
        leftDown = state;
    }
    this.pressSpaceBar = function() {
        fireQueue.push({});
    }        
    this.handleInput = function() {
	    if (rightDown) {
	        inputCommand.handleCommand(CMD_SHIP_RIGHT);
	    }
	    else if (leftDown) {
	        inputCommand.handleCommand(CMD_SHIP_LEFT);
	    }
	    if (fireQueue.length > 0) {
	        fireQueue.pop();
	        inputCommand.handleCommand(CMD_FIRE);
	    }
	};
}

function setupInputHandlers(inputCommand) {
	var KEY_SPACE = 32;
	var KEY_LEFT_ARROW = 37;
	var KEY_RIGHT_ARROW = 39;

    var kbd = new KeyInputBuffer(inputCommand);
    
    var onKeyDown = function(event) {
		switch (event.keyCode) {
			case KEY_SPACE:       kbd.pressSpaceBar();       break;
			case KEY_LEFT_ARROW:  kbd.pressLeftDown(true);   break;
			case KEY_RIGHT_ARROW: kbd.pressRightDown(true);  break;
		}
    };
	var onKeyUp = function(event) {
		switch (event.keyCode) {
			case KEY_LEFT_ARROW:  kbd.pressLeftDown(false);   break;
			case KEY_RIGHT_ARROW: kbd.pressRightDown(false);  break;
		}
	};
    document.addEventListener('keydown', onKeyDown, false);                
    document.addEventListener('keyup', onKeyUp, false);
    
    return kbd;
}

})();

