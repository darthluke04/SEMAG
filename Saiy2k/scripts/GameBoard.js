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
    Handles all the game board logic, incuding managing
	and updating all the tiles
    
	@class
	@param	{context} 	ctx		2D drawing context to the HTML5 canvas
	@param	{int}		rows	number of rows
	@param	{int}		cols	number of cols
*/
TicTacToe.GameBoard		=	function(ctx, rows, cols) {
    /**	Player 1's Image
		@type	image
		@private */
    var xImage;
    
    /**	Player 2's Image
		@type	image
		@private */
    var oImage;
    
    /**	x co-ordinate of the board
		@type	double
		@private */
    var boardX;

    /**	y co-ordinate of the board
		@type	double
		@private */
    var boardY;
    
    /**	width of the board
		@type	double
		@private */
    var boardWidth;
    
    /**	height of the board
		@type	double
		@private */
    var boardHeight;
    
    /**	number of rows, as specified in GameState
		@type	int
		@private */
    var rowCount;
    
    /**	number of columns, as specified in GameState
		@type	int
		@private */
    var colCount;
    
    /**	width of a single tile ( = boardWidth / colCount )
		@type	double
		@private */
    var tileWidth;
    
    /**	height of a single tile ( = boardHeight / rowCount )
		@type	double
		@private */
    var tileHeight;
    
    /**	2D Array of tiles
		@type	BoardTile[][]
		@private */
    var tiles           =   [];
	
	
	/** Loads all the images appropriate for the board. Based on the screen
		size, either a high-res or low-res image is selected
		@private */
	var loadResources	=	function()
	{
		var strSize;
		
		if ( $(window).width() > 800 )
			strSize					=	'2X';
		else
			strSize					=	'';
		
		oImage						=   new Image();
		oImage.src					=   'images/oTile' + strSize + '.png';
		
		xImage                  	=   new Image();
		xImage.src					=   'images/xTile' + strSize + '.png';
	};
	
	/** Updates the x, y, width, height variables based on the current screen size
		@private */
	var refreshUI					=	function()
	{
		var	boardCanvas				=	document.getElementById('boardCanvas');
		
		if ( $(window).width() > 800 ) {
			boardWidth              =   480;
            boardHeight             =   480;
		}
		else {
			boardWidth              =   320;
            boardHeight             =   320;
		}
		
		boardCanvas.width			=	boardWidth;
		boardCanvas.height			=	boardHeight;
		
		tileWidth					=   boardWidth / colCount;
		tileHeight              	=   boardHeight / rowCount;
	};

	/** @returns	{double}	x co-ordinate of the board */
	this.x				=	function() {	return		boardX;			}
	
	/** @returns	{double}	y co-ordinate of the board */
	this.y				=	function() {	return		boardY;			}
	
	/** @returns	{double}	width of the board */
	this.width			=	function() {	return		boardWidth;		}
	
	/** @returns	{double}	height of the board */
	this.height			=	function() {	return		boardHeight;	}
	
	/** @returns	{double}	tile width of the board */
	this.tileWidth		=	function() {	return		tileWidth;		}
	
	/** @returns	{double}	tile height of the board */
	this.tileHeight		=	function() {	return		tileHeight;		}	
	
	/** refreshes the board layout based on the screen size	*/
	this.resize			=	function() {
		refreshUI();
		loadResources();
	};
	
	/** Updates the board state based on user input.
		Updates the tiles array
		@param	{point}		m		the current mouse co-ordinate
		@param	{bool}		clk		indicates if the mouse is clicked */
	this.update			=	function(m, clk) {
		var t			=	TicTacToe.GameState;
		var mx          =   (m.x - boardX);
		var my          =   (m.y - boardY);
		
		t.hoverTileX	=	-1;
		t.hoverTileY	=	-1;

		//if the mouse is hovered over the board, find the tile above which the mouse is placed
		if(mx > 0 && my > 0 && mx < boardWidth && my < boardHeight)
		{
			t.hoverTileX			=   Math.floor(my / tileHeight);
			t.hoverTileY			=   Math.floor(mx / tileWidth);
			
			if ( t.tiles[t.hoverTileX][t.hoverTileY] !== -1)
			{
				t.hoverTileX		=	-1;
				t.hoverTileY		=	-1;
			}
		}

		//if the mouse is clicked in a valid blank tile, then update the tiles[][] array appropriately
		if(clk !== null)
		{									
			if( t.hoverTileX != -1 )
			{
				t.selectedTileX	=	t.hoverTileX;
				t.selectedTileY	=	t.hoverTileY;
				t.tiles[t.selectedTileX][t.selectedTileY] =   t.currentPlayerID;
				tiles[t.selectedTileX][t.selectedTileY].setState(t.currentPlayerID);
				t.isValidMove	=	true;
			} else {
				t.isValidMove	=	false;
			}
		}
				
		if (t.highlightTiles.length != 0)
		{
			for(var z = 0; z < t.highlightTiles.length; z++)
			{
				tiles[t.highlightTiles[z].x][t.highlightTiles[z].y].highlight();
			}
			
			t.highlightTiles.length = 0;
            TicTacToe.AudioManager.chime();
		}

		for (var i = 0; i < rowCount; i++)
		{
			for (var j = 0; j < colCount; j++)
			{
				tiles[i][j].update();
			}
		}
	};
    
	/**	Draw the board and the tiles
		@param	{context} 	ctx		2D drawing context to the HTML5 canvas */
    this.draw           =   function(ctx) {
	
		//draws the background image
		ctx.clearRect(0, 0, boardWidth, boardHeight);
        
		//draw all the tiles
		for (var i = 0; i < rowCount; i++)
			for (var j = 0; j < colCount; j++)
				tiles[i][j].draw(ctx);
        
		//mark the hovered tile in red color
        ctx.fillStyle   =   'rgba(255, 0, 0, 0.5);';
        ctx.beginPath();
        ctx.rect(TicTacToe.GameState.hoverTileY*tileWidth, TicTacToe.GameState.hoverTileX*tileHeight, tileWidth, tileHeight);
        ctx.closePath();
        ctx.fill();
    };
	
	/** Resets the game board and its tiles */
	this.reset			=	function() {
		for (var i = 0; i < rowCount; i++)
		{
			tiles[i]    =   [];
			for (var j = 0; j < colCount; j++)
				tiles[i][j]	=	new TicTacToe.BoardTile(xImage, oImage, i, j, tileWidth, tileHeight);
		}
	};
	
	/** updates the ai's move from game logic class */
	this.updateAIMove	=	function(t) {

		tiles[t.aiTileX][t.aiTileY].setState(t.currentPlayerID);
		if (t.highlightTiles.length != 0)
		{
            TicTacToe.AudioManager.chime();

			for(var z = 0; z < t.highlightTiles.length; z++)
			{
				tiles[t.highlightTiles[z].x][t.highlightTiles[z].y].highlight();
			}
			
			t.highlightTiles.length = 0;
		}
	};
	
	rowCount        	=   rows;
	colCount        	=   cols;
	
	boardX          	=   $('#boardCanvas').offset().left;
	boardY          	=   $('#boardCanvas').offset().top;
	
	refreshUI();
	loadResources();
	
	this.reset();

    window.addEventListener('resize', resizeGame, false);
    window.addEventListener('orientationchange', resizeGame, false);
    
    function resizeGame() {
        refreshUI();
        loadResources();
		for (var i = 0; i < rowCount; i++)
            for (var j = 0; j < colCount; j++)
                tiles[i][j].updateRes(xImage, oImage, i, j, tileWidth, tileHeight);
        boardX         	=   $('#boardCanvas').offset().left;
        boardY         	=   $('#boardCanvas').offset().top;
    };
};
