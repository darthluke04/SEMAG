
var killThatDearStage = {

    preload: function(){
        game.load.image('cut', 'assets/killThatDear/cut.png');
        game.load.image('blood', 'assets/killThatDear/blood.png');
    },

    create: function(){
        game.stage.backgroundColor = "#89d14f";

        this.letters = ['Q', 'A', 'L', 'H','B','R','I', 'P'];
        this.win = false;
        this.changeCut = true;
        this.cutX = 0;
        this.cutY = 0;
        this.cutNumber = 0;
        this.cutCount = 0;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.cutNumber = game.rnd.integerInRange(2, 5);

        this.bloodTimer = game.time.create(false);

        this.bloodTimer.loop(200, this.updateBlood, this);

        this.qKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.qKey.onDown.add(this.gotItQ, this);
        this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.aKey.onDown.add(this.gotItA, this);
        this.lKey = game.input.keyboard.addKey(Phaser.Keyboard.L);
        this.lKey.onDown.add(this.gotItL, this);
        this.hKey = game.input.keyboard.addKey(Phaser.Keyboard.H);
        this.hKey.onDown.add(this.gotItH, this);
        this.bKey = game.input.keyboard.addKey(Phaser.Keyboard.B);
        this.bKey.onDown.add(this.gotItB, this);
        this.rKey = game.input.keyboard.addKey(Phaser.Keyboard.R);
        this.rKey.onDown.add(this.gotItR, this);
        this.iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);
        this.iKey.onDown.add(this.gotItI, this);
        this.pKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.pKey.onDown.add(this.gotItP, this);

        // duration bar
        this.preloadBar = game.add.graphics(0, 3);
        this.preloadBar.lineStyle(3, 0xaa3300, 1);
        this.preloadBar.moveTo(0, 0);
        this.preloadBar.lineTo(game.width, 0);
        this.preloadBar.scale.x = 1;
        this.preloadBar.scale.y = 3;

        // set the time after which the game ends
        game.time.events.add(Phaser.Timer.SECOND * this.duration, this.endStage, this);

        // moves duration bar
        game.time.events.repeat(Phaser.Timer.SECOND / 20, this.duration * 20, this.decreaseTimer, this);
    },

    update: function(){
        var style = { font: "32px Arial", fill: "white", align: "Left" };
        if(this.changeCut == true && this.cutCount < this.cutNumber){
            this.cutX = game.rnd.integerInRange(50, 750);
            this.cutY = game.rnd.integerInRange(50, 550);
            var cutSprite = game.add.sprite(this.cutX, this.cutY, 'cut');
            cutSprite.anchor.setTo(0.5,0.5);

            this.bloodTimer.start();

            this.cutKeyChar = this.letters[game.rnd.integerInRange(0, this.letters.length - 1)];
            console.log(this.cutKeyChar);


            var cutKey = game.add.text(this.cutX, this.cutY, this.cutKeyChar, style);

            cutKey.anchor.setTo(0.75, 0.5);
            this.changeCut = false;
            this.cutCount++;
        }

        //this.game.input.keyboard.onDownCallback =  this.keyHit;
    },

    updateBlood: function(){
        var cutBlood = game.add.sprite(this.cutX, this.cutY, 'blood');
        cutBlood.anchor.setTo(0.5, 0.1);
        game.physics.arcade.enable(cutBlood);
        cutBlood.body.allowGravity = true;
        cutBlood.body.velocity.x = 30;
        cutBlood.body.gravity.y=500;
    },

    keyHit: function(e) {
        console.log(e.keyCode);
        console.log(this.cutKeyChar);
        if (e.keyCode == this.cutKeyChar) {
            console.log('got it');
            this.changeCut = true;
            if (this.cutCount == this.cutNumber)
                this.bloodTimer.stop();
        }
    },

    gotItQ: function(){
        if(this.cutKeyChar == 'Q')
            this.gotIt();
    },

    gotItA: function(){
        if(this.cutKeyChar == 'A')
            this.gotIt();
    },

    gotItL: function(){
        if(this.cutKeyChar == 'L')
            this.gotIt();
    },

    gotItH: function(){
        if(this.cutKeyChar == 'H')
            this.gotIt();
    },

    gotItB: function(){
        if(this.cutKeyChar == 'B')
            this.gotIt();
    },

    gotItR: function(){
        if(this.cutKeyChar == 'R')
            this.gotIt();
    },

    gotItI: function(){
        if(this.cutKeyChar == 'I')
            this.gotIt();
    },

    gotItP: function(){
        if(this.cutKeyChar == 'P')
            this.gotIt();
    },

    gotIt: function(){
        console.log('got it');
        this.changeCut = true;
        if (this.cutCount == this.cutNumber){
            this.bloodTimer.stop();
            this.win = true;
            this.endStage();
        }
    },

    // time allocated for stage
    duration: 5,

    endStage: function() {
        if (this.win == true)
        {
            globals.score += 100;
            game.state.start('scoreStage');
        }
        else{
            globals.score -= 50;
            globals.lives--;
            game.state.start('scoreStage');
        }
    },

    decreaseTimer: function () {
        this.preloadBar.scale.x -= 1/this.duration/20;
    }
};