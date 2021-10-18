/**
 * Created by eltntawy on 07/03/15.
 */


var boot = {
    preload: function () {
        game.load.image('preloaderBar','assets/boot/preloaderBar.png');
    },
    create: function () {
        this.input.maxPointers = 1;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize(true);
        this.state.start('preload');
    }
}