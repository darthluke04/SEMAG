window.onload = () => {
  const canvas = document.getElementById("MainCanvas");
  const context = canvas.getContext("2d");
  const fps = 30;
  const player = new Player(4);
  let cells = {};
  let barriers = [];
  document.addEventListener("keydown", move);
  const players = [];
  players.push(player);

  function start() {
    for(let x = 0; x <= 600; x += 4) {
      for(let y = 0; y <= 600; y += 4) {
        const key = `${x}_${y}`;
        cells[key] = false;
      }
    }
    console.log(Object.keys(cells))
  }

  function init() {
    context.beginPath();
    context.fillStyle = "#02217a";
    context.fillRect(0, 0, 600, 600);
  }

  function move(e) {
    let moveDirections = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowDown: 1
    }
    if(e.key == "ArrowLeft" || e.key == "ArrowRight") {
      player.xCoeficient = moveDirections[e.key];
      player.yCoeficient = 0;
    }
    else if(e.key == "ArrowDown" || e.key == "ArrowUp") {
      player.xCoeficient = 0;
      player.yCoeficient = moveDirections[e.key];
    }
  }

  function update() {
    checkBorderCollision();
    player.update();
    if(player.playerXPos != player.initialPos.x || player.playerYPos != player.initialPos.y) {
      checkColision();
    }
    barriers.push(player.getPos());
    const {x, y} = player.getPos();
    const key = `${x}_${y}`;
    cells[key] = true;
  }

  function draw() {
    context.clearRect(0, 0, 600, 600);
    init();
    const position = player.getPos();
    drawBarries();
    context.beginPath();
    context.fillStyle = "#ffffff";
    context.fillRect(position.x, position.y, 4, 4);
  }

  function drawBarries() {
    barriers.forEach(barrier => {
      context.beginPath();
      context.fillStyle = "#ffffff";
      context.fillRect(barrier.x, barrier.y, 4, 4);
    })
  }

  function checkColision() {
    const {x, y} = player.getPos();
    const key = `${x}_${y}`;
    if(cells[key] == true) {
      alert("Break");
      clearInterval(interval);
    }
  }

  function checkBorderCollision() {
    const {x, y} = player.getPos();
    if(x >= 600 || x <= 0 || y >= 600 || x <= 0) {
      clearInterval(interval);
      alert("Derrocada");
    }
  }

  start();
  const interval = setInterval(() => {
    update();
    draw();
  }, 1000 / fps);
}