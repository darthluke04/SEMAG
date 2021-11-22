window.requestAnimationFrame(function () {
  var game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
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
      inner.textContent = "H";
      break;
    case 4:
      inner.textContent = "He";
      break;
    case 8:
      inner.textContent = "Li";
      break;
    case 16:
      inner.textContent = "Be";
      break;
    case 32:
      inner.textContent = "B";
      break;
    case 64:
      inner.textContent = "C";
      break;
    case 128:
      inner.textContent = "N";
      break;
    case 256:
      inner.textContent = "O";
      break;
    case 512:
      inner.textContent = "F";
      break;
    case 1024:
      inner.textContent = "Ne";
      break;
    case 2048:
      inner.textContent = "Na";
      break;
    case 4096:
      inner.textContent = "Mg";
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
    game.restart();
});
