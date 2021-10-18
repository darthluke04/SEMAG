

var trainStage = {
    number_of_secure: 0,

    preload: function() { 
        
        game.load.image('before', 'assets/train/before.jpg'); 
        game.load.image('after', 'assets/train/after.jpg'); 
        game.load.image('char2', 'assets/train/char2.png');
       // game.load.image('invisibleObj', 'assets/invisibleObj.png');
       game.load.image('floor', 'assets/train/floor.png'); 
       game.load.image('hole', 'assets/train/hole.png'); 
       game.load.image('worried', 'assets/train/worried.png');
       
       game.load.image('secure', 'assets/train/secure1.jpg');
       game.load.image('worriedTrain', 'assets/train/worriedTrain.png');
       game.load.image('mobile', 'assets/train/mobile.png');
       game.load.image('falling', 'assets/train/falling.png');


       // game.load.audio('dumpWaysToDie', 'assets/train/dumpWaysToDie.mp3'); 

       

    },

    create: function() { 
        this.number_of_secure = 0;
        game.physics.startSystem(Phaser.Physics.ARCADE);  

        this.floor = game.add.sprite(9,450,'floor');
        game.physics.arcade.enable(this.floor);
        this.floor.body.immovable = true;

        this.hole = game.add.sprite(622,447,'hole');
        game.physics.arcade.enable(this.hole);
        this.hole.body.immovable = true;

        this.before = game.add.sprite(0,0,'before');

        this.secure = game.add.sprite(690,310,'secure');
        game.physics.arcade.enable(this.secure);
        this.secure.body.immovable = true;



       // this.invisibleObj = game.add.sprite(347,177,'invisibleObj');
       // game.physics.arcade.enable(this.invisibleObj);
       // this.invisibleObj.body.immovable = true;


        //character
        this.char2 = game.add.group();
        //this.char2.scale.setTo(.77,.77);
        this.char2.enableBody = true;
        //this.char1 = this.game.add.sprite(0, 200, 'char1');
        this.char2.createMultiple(10, 'char2');  
        //game.physics.arcade.enable(this.char1);

         
        this.timer = this.game.time.events.loop(2000, this.addOneCharacter, this); 

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this); 
        

        this.after = game.add.sprite(690,0,'after');
        
        // this.dumpWaysToDie = game.add.audio('dumpWaysToDie');
        //this.dumpWaysToDie.play();

    },

    update: function() {

            
        game.physics.arcade.collide( this.mobile, this.floor, this.hitMob, null, this);

          this.char2.forEach(function(item) {
            
            game.physics.arcade.enable(item);
            game.physics.arcade.collide( this.floor,item);
            game.physics.arcade.collide(item, this.hole,this.hitHole, null, this);
            game.physics.arcade.collide(item, this.secure, this.hitSecure, null, this);

            
        }, this);

    },


    jump: function() {

        //this.char1.body.velocity.x = 200;
        //this.char1.body.velocity.y = 200;
        //game.add.tween(this.char1).to({angle:-20},100).start();

        this.char2.forEach(function(item) {

            if(item.body.velocity.y == 0){

                item.body.velocity.x = 170;
                item.body.velocity.y = -230;

            } 
            
        }, this);

    },


addOneCharacter: function() {

        var chars1 = this.char2.getFirstDead();

        chars1.reset(-23, 120);
        chars1.body.velocity.x = 100;  
        chars1.body.velocity.y = 0; 
        chars1.body.gravity.y=300;   
        //chars1.checkWorldBounds = true;
        //chars1.outOfBoundsKill = true;

       
          
    },

     hitHole: function(char2){

        
        char2.kill();

        this.falling = game.add.sprite(620,270,'falling');
        game.physics.arcade.enable(this.falling);
        this.falling.body.velocity.y = 200;
        this.falling.body.velocity.x = 77;
        this.falling.body.gravity.y = 30;
        //this.falling.kill();
         game.add.sprite(690,0,'after');

        // Prevent new char1 from appearing
        game.time.events.remove(this.timer);

        // Go through all the char1, and stop their movement
        this.char2.forEachAlive(function(p){
            p.body.velocity.x = 0;
            //p.kill();
           this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
           p.loadTexture('worried', 0, false);
        }, this);

        game.add.sprite(620,270,'worriedTrain');

        this.mobile = game.add.sprite(619,427,'mobile');
        game.physics.arcade.enable(this.mobile);
        this.mobile.body.velocity.y = -200;
        this.mobile.body.velocity.x = -70;
        this.mobile.body.gravity.y = 200;
        this.mobile.angle =45; 

        // lose
        globals.score -= 50;
        globals.lives --;

        game.time.events.add(Phaser.Timer.SECOND * 1.5, this.endStage, this);
        
    },


    hitMob:function(mobile){

        this.mobile.body.velocity.y = 0;
        this.mobile.body.velocity.x = 0;

    },


    hitSecure: function(char2){
        this.number_of_secure ++;
         char2.kill();
         if (this.number_of_secure === 3) {
            globals.score += 100;

            this.endStage();
         };

    },

    endStage : function() {
        game.state.start('scoreStage');
    }




};