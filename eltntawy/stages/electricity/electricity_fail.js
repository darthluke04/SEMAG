/**
 * Created by eltntawy on 02/03/15.
 */
/**
 * Created by eltntawy on 02/03/15.
 */
/**
 * Created by eltntawy on 24/02/15.
 */

var electricityFail = {
    preload: function () {

        /**************************************************************************************/
        // background, score and sound
        /**************************************************************************************/
        /**************************************************************************************/
    },

    create: function () {


        /**************************************************************************************/
        // background, score and sounds
        /**************************************************************************************/
        var background = game.add.sprite(0, 0, 'electricityFail');
        background.scale.setTo(1.4,1.4);
        var fireAnimation = background.animations.add('fire',[0 ,1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9
            ,10 ,11 ,12 ,13 ,14 ,15 ,16 ,17 ,18 ,19 ,20 ,21 ,22 ,23 ,24 ,25 ,26 ,27 ,28 ,29 ,30 ,31 ,32 ,33],6);
        //background.animations.play();
        background.play('fire');

        fireAnimation.killOnComplete = true;
        fireAnimation.onComplete.add(function () {
            globals.score -= 50;
            globals.lives --;
            game.state.start('scoreStage');
        });

        /**************************************************************************************/

    },

    update: function () {

    }
}