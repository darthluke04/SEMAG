"use strict";

var NUM_MISSILES = (typeof NUM_MISSILES !== "undefine") ? NUM_MISSILES : 3;

var space_invaders = (typeof space_invaders !== "undefined") ? space_invaders : {};

space_invaders.spriteFactory = (function () {

    var spriteFactory = new SpriteFactory();

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
            ship: new Image(),
            invader1: new Image(),
            invader2: new Image(),
            invader3: new Image()
        };

        images.ship.src = "graphics/ship.png";
        images.invader1.src = "graphics/invader1.png";
        images.invader2.src = "graphics/invader2.png";
        images.invader3.src = "graphics/invader3.png";

        var spriteBounds = {
            top: 0,
            right: DISPLAY_WIDTH - 100,
            bottom: SHIP_GROUND_LEVEL,
            left: 50
        };

        this.createShip = function () {
            var x = 400;
            var y = SHIP_GROUND_LEVEL;
            var width = 30;
            var height = 20;

            var speed = 2;
            var ship = new Ship(x, y, width, height, speed, spriteBounds);
            ship.color = 'rgb(255, 64, 64)';
            ship.image = images.ship;
            return ship;
        };
        this.createInvader = function (type, x, y) {
            var color, points, width, img;

            if (type === 0) {
                color = '#64a242';
                points = 50;
                width = 20;
                img = images.invader1;
            } else if (type === 1) {
                color = '#abcabc';
                points = 20;
                width = 30;
                img = images.invader2;
            } else {
                color = '#bada55';
                points = 10;
                width = 30;
                img = images.invader3;
            }
            var height = 20;
            var speed = 5;
            var xcenter = x + (30 - width) / 2;

            var invader = new Invader(xcenter, y, width, height, speed, spriteBounds);
            invader.color = color;
            invader.image = img;
            invader.points = points;

            return invader;
        };
        this.createMissile = function () {
            var x = 0; // usually overwritten
            var y = SHIP_GROUND_LEVEL;
            var width = 5;
            var height = 15;
            var speed = 20;

            var missile = new Missile(x, y, width, height, speed, spriteBounds);

            missile.color = 'rgb(64, 255, 255)';
            return missile;
        };
    }

    function Ship(x, y, w, h, speed, bounds) {
        Sprite.apply(this, arguments);

        var missilePool = new MissilePool(NUM_MISSILES);
        var xmax = bounds.right;
        var xmin = bounds.left;

        this.moveRight = function () {
            if (this.x + this.speed < xmax) {
                this.x += this.speed;
            }
        };
        this.moveLeft = function () {
            if (this.x - this.speed > xmin) {
                this.x -= this.speed;
            }
        };
        this.fire = function () {
            var s = this;
            missilePool.createMissile(s.x + s.width / 2, s.y);
        };
        this.getMissiles = function () {
            return missilePool.getMissiles();
        };
    }

    function Invader(x, y, w, h, speed, bounds) {
        Sprite.apply(this, arguments);

        var xmax = bounds.right;
        var xmin = bounds.left;
        var ymax = bounds.bottom;

        this.canMoveRight = function () {
            var can = (this.x + this.width / 2 + this.speed < xmax);
            return can;
        };

        this.moveRight = function () {
            if (this.x + this.speed < xmax) {
                this.x += this.speed;
            }
        };

        this.canMoveLeft = function () {
            var can = (this.x - this.width / 2 - this.speed > xmin);
            return can;
        };

        this.moveLeft = function () {
            if (this.x - this.speed > xmin) {
                this.x -= this.speed;
            }
        };

        this.canMoveDown = function () {
            var can = (this.y + this.speed / 2 < ymax);
            return can;
        };

        this.moveDown = function () {
            if (this.y + this.speed / 2 < ymax) {
                this.y += this.speed / 2;
            }
        };
    }



    function Missile(x, y, w, h, speed, bounds) {
        Sprite.apply(this, arguments);

        var active = false; // protect this variable!
        this.isActive = function () {
            return active;
        };
        this.setActive = function (state) {
            active = state;
        };

        this.position = function (x, y) {
            if (!active) {
                active = true;
                this.y = y;
                this.x = x - this.width / 2;
            }
            return active;
        };

        this.moveNext = function () {
            if (active) {
                if (this.y - this.speed > bounds.top) {
                    this.y -= this.speed;
                } else {
                    active = false;
                }
            }
        };

        this.hits = function (invader) {
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
        };
    }

    function MissilePool(size) {
        var missiles = [];

        var count = size || 3;
        for (var j = 0; j < count; j++) {
            var m = spriteFactory.createMissile();
            missiles.push(m);
        }

        this.createMissile = function (x, y) {
            for (var j = 0; j < missiles.length; j++) {
                var missile = missiles[j];
                if (!missile.isActive()) {
                    space_invaders.util.soundMachine.play('shootSound');
                    missile.position(x, y);
                    break;
                }
            }
        };

        this.getMissiles = function () {
            return missiles;
        };
    }

    return spriteFactory;
})();
