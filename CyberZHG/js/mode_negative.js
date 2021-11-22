var game;
window.requestAnimationFrame(function () {
  var size = 4;
  var container = document.getElementById('grid-container');
  var html = '';
  for (var i = 0; i < size; ++i) {
    html += '<div class="grid-row">';
    for (var j = 0; j < size; ++j) {
      html += '<div class="grid-cell"></div>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
  game = new GameManager(size, KeyboardInputManager, HTMLActuator, LocalScoreManager);
  tileNegative();
});

function changeRule(add, merge, win) {
  game.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
      var tile = new Tile(this.grid.randomAvailableCell(), add());
      this.grid.insertTile(tile);
    }
  };
  game.tileMatchesAvailable = function () {
    var self = this;
    var tile;
    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x: x, y: y });
        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell   = { x: x + vector.x, y: y + vector.y };
            var other  = self.grid.cellContent(cell);
            if (other && merge(other.value, tile.value)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  game.move = function (direction) {
    var self = this;
    if (this.over || this.won) return;
    var cell, tile;
    var vector     = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved      = false;
    this.prepareTiles();
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);
        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next      = self.grid.cellContent(positions.next);
          if (next && !next.mergedFrom && merge(next.value, tile.value)) {
            var merged = new Tile(positions.next, tile.value + next.value);
            merged.mergedFrom = [tile, next];
            self.grid.insertTile(merged);
            self.grid.removeTile(tile);
            tile.updatePosition(positions.next);
            self.score += merged.value;
            if (win(merge.value)) self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }
          if (!self.positionsEqual(cell, tile)) {
            moved = true; 
          }
        }
      });
    });
    if (moved) {
      this.addRandomTile();
      if (!this.movesAvailable()) {
        this.over = true; 
      }
      this.actuate();
    }
  };
  game.inputManager.events["move"] = [];
  game.inputManager.on("move", game.move.bind(game));
  game.restart();
}

function tileNegative() {
  game.actuator.addTile = function (tile) {
    var self = this;
    var wrapper   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    positionClass = this.positionClass(position);
    var classes = ["tile", "tile-" + (tile.value > 0 ? tile.value : -tile.value), positionClass];
    this.applyClasses(wrapper, classes);
    inner.classList.add("tile-inner");
    inner.textContent = tile.value;
    if (tile.previousPosition) {
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({ x: tile.x, y: tile.y });
        self.applyClasses(wrapper, classes); 
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);
      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }
    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
  };
  changeRule(function() { return Math.random() < 0.5 ? 1 : -1; }, 
    function(a, b) { return a === b || a === -b; }, 
    function(merged) { return false; });
}
