window.requestAnimationFrame(function () {
  var maxValue = 4;
  var game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
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
          if (next && !next.mergedFrom && next.value === tile.value) {
            var merged = new Tile(positions.next, tile.value + next.value);
            merged.mergedFrom = [tile, next];
            self.grid.insertTile(merged);
            self.grid.removeTile(tile);
            tile.updatePosition(positions.next);
            self.score += merged.value;
            if (merged.value > maxValue) {
              maxValue = merged.value;
            }
            if (merged.value === 4096) self.won = true;
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
  game.actuator.addTile = function (tile) {
    var self = this;
    var wrapper   = document.createElement("div");
    var inner     = document.createElement("div");
    var position  = tile.previousPosition || { x: tile.x, y: tile.y };
    positionClass = this.positionClass(position);
    var classes = ["tile", "tile-" + tile.value, positionClass];
    this.applyClasses(wrapper, classes);
    inner.classList.add("tile-inner");
    switch (tile.value) {
    case 2:
      inner.textContent = "魔法时代";
      break;
    case 4:
      inner.textContent = "黄金时代";
      break;
    case 8:
      inner.textContent = "危机纪元";
      break;
    case 16:
      inner.textContent = "威摄纪元";
      break;
    case 32:
      inner.textContent = "威摄后";
      break;
    case 64:
      inner.textContent = "广播纪元";
      break;
    case 128:
      inner.textContent = "掩体纪元";
      break;
    case 256:
      inner.textContent = "银河纪元";
      break;
    case 512:
      inner.textContent = "黑域纪元";
      break;
    case 1024:
      inner.textContent = "647宇宙";
      break;
    case 2048:
      inner.textContent = "死神永生";
      break;
    case 4096:
      inner.textContent = "";
      break;
    }
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
    game.actuator.message = function (won) {
      var type    = won ? "game-won" : "game-over";
      var message = "";
      switch (maxValue) {
      case 4:
        message = "程心的祖先活了下来";
        break;
      case 8:
        message = "程心毕业了";
        break;
      case 16:
        message = "程心没按按钮";
        break;
      case 32:
        message = "程心被土著保护";
        break;
      case 64:
        message = "程心听云天明讲故事";
        break;
      case 128:
        message = "程心成功离开太阳系";
        break;
      case 256:
        message = "程心发现死线";
        break;
      case 512:
        message = "程心在黑域中活了下来";
        break;
      case 1024:
        message = "程心保留了鱼缸";
        break;
      case 2048:
        message = "程心永生";
        break;
      case 4096:
        message = "死神永生";
        break;
      }
      this.messageContainer.classList.add(type);
      this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };
    game.restart = function () {
      maxValue = 4;
      this.actuator.restart();
      this.setup();
    };
    game.restart();
});

