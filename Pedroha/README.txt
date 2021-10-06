README
------

Iterative process using Object-Oriented analysis and design.

Classes:

API
---

Engine is used for the game loop and references Game and Scene
Game contains a Scene
Scene handles the model and contains all the sprites
Scene contains a ScenePainter which contains a CanvasPainter
CanvasPainter paints on a Display (i.e. canvas context)

SpriteFactory creates Sprites such as: Ship, Enemy, Invader

InvaderArmy contains all instances of Invaders and common logic and operations
MissilePool handles the missile creation after a "fire" command

InputCommand(ship) handles commands such as: "fire", "moveRight", "moveLeft"
KeyInputBuffer remembers the state of the RIGHT, LEFT key arrows and queue spacebar ("fire") requests

----

Game.getScene()
Game.getInputCommand()
Game.isFinished()

Engine.updateModel()
Engine.displayModel()
Engine.finished()

SoundMachine.play()

Display.fillRect(rect)
Display.paintImage(bitmap)
Display.drawCenteredText(text, y, fontSize, color, bold)
Display.drawText(text, x, y, fontSize, color, bold)

CanvasPainter.paint(bitmap, drawImage)
CanvasPainter.paintBackground()
CanvasPainter.drawCenteredText(text, , y, fontSize, color, bold)
CanvasPainter.drawText(text, x, y, fontSize, color, bold)

ScenePainter(painter, ship, enemy)
ScenePainter.paintBackground()
ScenePainter.drawShip()
ScenePainter.drawEnemy()
ScenePainter.drawMissiles()
ScenePainter.drawGameStatus(score)
ScenePainter.drawTextOverlay(title, subtitle)
ScenePainter.drawText(text, x, y, fontSize, color, bold)

Scene.getShip()
Scene.updateScore(score)
Scene.addCollisionListener(listener)
Scene.updateModel()
Scene.allInvadersKilled()
Scene.invadersReachedBottom()
Scene.handleCollisions()

Sprite(x, y, w, h, speed, bounds)

SpriteFactory.createShip()
SpriteFactory.createInvader()
SpriteFactory.createMissile()

Ship(x, y, w, h, speed, bounds) <- Sprite()
Ship.moveRight()
Ship.moveLeft()
Ship.fire()

Missile(x, y, w, h, speed, bounds) <- Sprite()
Missile.isActive()
Missile.setActive(state)
Missile.position(x, y)
Missile.moveNext()
Missile.hits(invader)

Invader(x, y, w, h, speed, bounds) <- Sprite()
Invader.canMoveRight()
Invader.moveRight()
Invader.canMoveLeft()
Invader.moveLeft()
Invader.canMoveDown()
Invader.moveDown()

InvaderArmy.setupInvaders()
InvaderArmy.reachedBottom()
InvaderArmy.moveNext()

MissilePool(size)
MissilePool.createMissile(x, y)
MissilePool.getMissiles()

InputCommand(ship)
InputCommand.handlecommand(command)

KeyInputBuffer(inputCommand)
KeyInputBuffer.pressRightDown(state)
KeyInputBuffer.pressLeftDown(state)
KeyInputBuffer.pressSpaceBar()
KeyInputBuffer.handleInput()


------------