/*
Copyright 2011 Saiyasodharan (http://saiy2k.blogspot.com/)

This file is part of the open source game, Tic Tac Toe Extended (https://github.com/saiy2k/Tic-Tac-Toe-Extended-HTML5-Game)

Tic Tac Toe Extended is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Tic Tac Toe Extended is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Tic Tac Toe Extended.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
    This class is used to visually represent a single tile
    
	@class
	@param	{image}	 	xImg	Image that represents X tile
	@param	{image}	 	oImg	Image that represents O tile
	@param	{int}		tX		x position of the tile in the tile array
	@param	{int}		tY		y position of the tile in the tile array
	@param	{double}	tWidth	width of the tile
	@param	{double}	tHeight	height of the tile
*/
TicTacToe.BoardTile		=	function(xImg, oImg, tX, tY, tWidth, tHeight) {
	
	/**	x image
		@type	image
		@private */
	var xImage;
	
	/**	o image
		@type	image
		@private */
	var oImage;
	
	/**	x co-ordinate of the tile in the grid
		@type	int
		@private */
    var tileX;

    /**	y co-ordinate of the tile in the grid
		@type	int
		@private */
    var tileY;
	
	/**	width of the tile
		@type	double
		@private */
    var tileWidth;
	
	/**	height of the tile
		@type	double
		@private */
    var tileHeight;

	/** State of the tile. Possible States:
		"empty", "x", "o", "toO", "toX", "blinkX", "blinkO"
		@type	string
		@private */
	var	tileState;
	
	/** Previous state of the tile. Possible States:
		"empty", "x", "o", "toO", "toX", "blinkX", "blinkO"
		@type	string
		@private */
	var	prevState;
	
	/**	Key value (ranges from 0.0 to 1.0). Used to animate the tile.
		@type	double
		@private */
	var	keyValue;
	
	/**	Updates the Key value if the tile is is animation state */
	this.update			=	function() {
		if (tileState	==	"blinkX")
		{		
			if (keyValue	>=	1.0)
				tileState	=	"x";
				
			keyValue		+=	0.03;
		}
		else if (tileState	==	"blinkO")
		{		
			if (keyValue	>=	1.0)
				tileState	=	"o";
				
			keyValue		+=	0.02;
		}
		else if (tileState	==	"toX")
		{
			if (keyValue	>=	1.0)
				tileState	=	"x";
			keyValue		+=	0.05;
		}
		else if (tileState	==	"toO")
		{
			if (keyValue	>=	1.0)
				tileState	=	"o";
			keyValue		+=	0.05;
		}
	};
    
	/**	Draws the current tile, based on the state and keyValue, if the tile is under animation
		@param	{context}	ctx		2D Drawing context of the Canvas */
    this.draw           =   function(ctx) {
		if (tileState	==	"x")
			ctx.drawImage(xImage, tileY*tileWidth, tileX*tileHeight, tileWidth, tileHeight);
		else if (tileState	==	"o")
			ctx.drawImage(oImage, tileY*tileWidth, tileX*tileHeight, tileWidth, tileHeight);
		else if (tileState	==	"blinkX")
		{
			ctx.globalAlpha	=	((keyValue * 100) % 20) / 20.0;
			ctx.drawImage(xImage, tileY*tileWidth, tileX*tileHeight, tileWidth, tileHeight);
			ctx.globalAlpha	=	1.0;
		}
		else if (tileState	==	"blinkO")
		{
			ctx.globalAlpha	=	((keyValue * 100) % 20) / 20.0;
			ctx.drawImage(oImage, tileY*tileWidth, tileX*tileHeight, tileWidth, tileHeight);
			ctx.globalAlpha	=	1.0;
		}
		else if (tileState	==	"toX")
		{
			ctx.globalAlpha	=	keyValue;
			ctx.drawImage(xImage, tileY*tileWidth, tileX*tileHeight, tileWidth / keyValue, tileHeight / keyValue);
			ctx.globalAlpha	=	1.0;
		}
		else if (tileState	==	"toO")
		{
			ctx.globalAlpha	=	keyValue;
			ctx.drawImage(oImage, tileY*tileWidth, tileX*tileHeight, tileWidth / keyValue, tileHeight / keyValue);
			ctx.globalAlpha	=	1.0;
		}
		
		ctx.textAlign	=	'center';
		ctx.font		=	'16px Arial Bold';
		
		/*
		ctx.fillText(tileX + ', ' + tileY, tileY*tileWidth + tileWidth/1.5, tileX*tileHeight + tileHeight/1.5);
		if (TicTacToe.GameState.tiles[tileX][tileY] != -1)
			ctx.fillText(TicTacToe.GameState.tiles[tileX][tileY], tileY*tileWidth + tileWidth/4, tileX*tileHeight + tileHeight/4);
		*/
		//if (TicTacToe.GameLogic.scoreTile[tileX][tileY] != 0)
		//	ctx.fillText(TicTacToe.GameLogic.scoreTile[tileX][tileY], tileY*tileWidth + tileWidth/4, tileX*tileHeight + tileHeight/2);
    };

	/** Sets the state of the tile. And resets the keyValue to 0.0
		@param	{int}		tState	state of the tile, where -1 is empty, 0 is X and 1 is O */
	this.setState		=	function(tState) {
		switch (tState)
		{
			case	-1:		tileState = "empty";		break;
			case	0:		tileState = "toX";			break;
			case	1:		tileState = "toO";			break;
		}
		
		keyValue		=	0.0;
	};
	
	this.highlight		=	function() {
		prevState		=	tileState;
		if (tileState == "x" || tileState	==	"toX")
			tileState		=	"blinkX";
		if (tileState == "o" || tileState	==	"toO")
			tileState		=	"blinkO";
		keyValue		=	0.0;
	};

    this.updateRes      =   function(xi, oi, tix, tiy, twid, thei) {
        xImage          =   xi;
        oImage          =   oi;
        tileX           =   tix;
        tileY           =   tiy;
        tileWidth       =   twid;
        tileHeight      =   thei;
    };

	
	tileState			=	"empty";
	xImage				=	xImg;
	oImage				=	oImg;
	tileX				=	tX;
	tileY				=	tY;
	tileWidth			=	tWidth;
	tileHeight			=	tHeight;
};
