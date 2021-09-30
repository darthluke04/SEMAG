class Player {
  moveDirections;
  constructor(speed,clientPlayer = true) {
    let xPos = Math.floor(Math.random() * 420) + 1;
    let yPos = Math.floor(Math.random() * 320) + 1; 
    this.playerXPos = xPos;
    this.playerYPos = yPos;
    this.initialPos = {x: xPos, y: yPos};
    console.log(this.playerXPos);
    this.xCoeficient = 0;
    this.yCoeficient = 0;
    this.speed = speed;
    this.clientPlayer = clientPlayer;
    this.moved = false;
  }

  getPos() {
    return {x: this.playerXPos, y: this.playerYPos};
  }

  update() {
    this.playerXPos += this.speed * this.xCoeficient;
    this.playerYPos += this.speed * this.yCoeficient;
    
  }
}