var handle1;
var handle2;

var line1;

var electricityTestStage = {
    preload: function () {

        game.load.image('ball', 'assets/Electricity/1_up.png');

    },


    create: function () {

        game.stage.backgroundColor = '#124184';

        handle1 = game.add.sprite(100, 200, 'balls', 0);
        handle1.anchor.set(0.5);
        handle1.inputEnabled = true;
        handle1.input.enableDrag(true);

        handle2 = game.add.sprite(400, 300, 'balls', 0);
        handle2.anchor.set(0.5);
        handle2.inputEnabled = true;
        handle2.input.enableDrag(true);

        line1 = new Phaser.Line(handle1.x, handle1.y, handle2.x, handle2.y);

    }

    ,
    update: function () {


        line1.fromSprite(handle1, handle2, false);

    },
     render : function() {

         game.debug.geom(line1);
         //game.debug.lineInfo(line1, 32, 32);

         //game.debug.text("Drag the handles", 32, 550);

}
} 

