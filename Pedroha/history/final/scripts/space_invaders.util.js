"use strict";

var DISPLAY_WIDTH  = 800;
var DISPLAY_HEIGHT = 600;

var SHIP_GROUND_LEVEL = DISPLAY_HEIGHT - 100;

var soundMachine = new SoundMachine();


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