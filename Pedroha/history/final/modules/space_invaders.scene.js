"use strict";

var space_invaders = (typeof space_invaders !== "undefined") ? space_invaders : {};

space_invaders.scene = (function () {

    var sp = space_invaders;

    function Scene() {
        var ship = sp.spriteFactory.createShip();
        var enemy = new InvaderArmy();
        var canvasPainter = new sp.util.CanvasPainter();
        var scenePainter = new ScenePainter(canvasPainter, ship, enemy);
        var collisionListeners = [];

        // Mixin - Inherit: paintBackground, drawShip, drawEnemy, drawMissiles
        for (var p in scenePainter) {
            if (scenePainter.hasOwnProperty(p) && typeof scenePainter[p] === "function") {
                this[p] = scenePainter[p];
            }
        }

        this.getShip = function () {
            return ship;
        };

        /*
         this.updateScore = function (score) {
         var scoreElt = document.getElementById('score');
         scoreElt.innerHTML = game.score;
         };
         */

        this.addCollisionListener = function (listener) {
            collisionListeners.push(listener);
        };

        this.updateModel = function () {
            enemy.moveNext();

            var missiles = ship.getMissiles();
            for (var j = 0; j < missiles.length; j++) {
                var missile = missiles[j];
                missile.moveNext();
            }
            this.handleCollisions();
        };

        this.allInvadersKilled = function () {
            var allKilled = true;

            enemy.forEachInvader(function (invader) {
                if (invader.visible) {
                    allKilled = false;
                    return true;
                }
            });
            return allKilled;
        };

        this.invadersReachedBottom = function () {
            return enemy.reachedBottom();
        };

        var handleHit = function (missile, invader) {
            sp.util.soundMachine.play('invaderKilledSound');

            // Take out missile from view
            missile.setActive(false);

            // Explode Invader
            invader.color = 'yellow';
            invader.visible = false;

            for (var j = 0; j < collisionListeners.length; j++) {
                collisionListeners[j](invader);
            }
        };

        this.handleCollisions = function () {
            enemy.forEachInvader(function (invader) {
                var missiles = ship.getMissiles();

                for (var k = 0; k < missiles.length; k++) {
                    var missile = missiles[k];

                    if (missile.hits(invader)) {
                        handleHit(missile, invader);
                    }
                }
            });
        };
    }

    function InvaderArmy() {
        var MOVE_LEFT = 0;
        var MOVE_RIGHT = 1;
        var MOVE_DOWN = 2;

        var invaders = [];
        var enemyReachedBottom = false;

        var moveDir = MOVE_RIGHT
            , lastHorizontalDir = moveDir
        //,  dx = 0,
            , dy = 0
        //maxdx = 100 // move between -100 to 100
        //,
            , maxdy = 10 // increment depends on invader.moveDown()
            ;

        var getLeftMostInvader = function () {
            return invaders[0];
        };

        var getRightMostInvader = function () {
            return invaders[invaders.length - 1];
        };

        var forEachInvader = function (fn) {
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

        var getBottomInvader = function () {
            var last = forEachInvader(function (invader, j) {
                var back = invaders.length - j - 1;
                var invader = invaders[back];
                if (invader && invader.visible) {
                    return invader;
                }
            });
            return last;
        };

        this.setupInvaders = function (invadersPerRow) {
            var NUM_ROWS = 5;

            var deltaX = (DISPLAY_WIDTH - 200) / invadersPerRow;
            var deltaY = 30;

            var startX = 100;
            var y = 50;

            for (var row = 0; row < NUM_ROWS; row++) {
                var invaderType = Math.floor((row + 1) / 2);
                var x = startX;
                y += deltaY;
                for (var j = 0; j < invadersPerRow; j++) {
                    var invader = space_invaders.spriteFactory.createInvader(invaderType, x, y);
                    invaders.push(invader);
                    x += deltaX;
                }
            }
        };

        this.reachedBottom = function () {
            return enemyReachedBottom;
        };

        var handleArmyDirection = function () {
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
            } else if (moveDir === MOVE_DOWN) {
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

        this.moveNext = function () {
            var volunteer = invaders[0]; // pick an arbitrary invader
            var method = null;
            switch (moveDir) {
                case MOVE_RIGHT:
                    method = volunteer.moveRight;
                    break;
                case MOVE_LEFT:
                    method = volunteer.moveLeft;
                    break;
                case MOVE_DOWN:
                    method = volunteer.moveDown;
                    break;
                default:
            }
            if (method) {
                // sp.util.soundMachine.play('fastInvader3Sound');
                forEachInvader(function (invader) {
                    method.call(invader);
                });
            }
            handleArmyDirection();
        };
        this.setupInvaders(10);
    }


    function ScenePainter(painter, ship, enemy) {
        var paint = function (bitmap, drawImage) {
            painter.paint(bitmap, drawImage);
        };

        this.paintBackground = function () {
            painter.paintBackground();
        };

        this.drawShip = function () {
            paint(ship, true);
        };

        this.drawEnemy = function () {
            enemy.forEachInvader(function (invader) {
                paint(invader, true);
            });
        };

        this.drawMissiles = function () {
            var missiles = ship.getMissiles();
            for (var j = 0; j < missiles.length; j++) {
                var missile = missiles[j];
                if (missile.isActive()) {
                    paint(missile);
                }
            }
        };
        this.drawGameStatus = function (score) {
            painter.drawText("Score: " + score, 10, 30, 20, "#00ff00", true);
        };
        this.drawTextOverlay = function (title, subtitle) {
            painter.drawTextOverlay(title, subtitle);
        };
        this.drawText = function (text, x, y, fontSize, color, bold) {
            painter.drawText(text, x, y, fontSize, color, bold);
        };
    }

    return {
        Scene:Scene
    }

})();
