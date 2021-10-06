"use strict";

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