import { vec2 } from "gl-matrix";
import { BulletManager } from "./bullet-manager";
import { Content } from "./content";
import { Engine } from "./engine";
import { ExplosionManager } from "./explosion-manager";
import { Background } from "./game/background";
import { EnemyManager } from "./game/ememy-manager";
import { Player } from "./game/player";
import { HighScore } from "./game/high-score";
import { PowerUpManager } from "./game/power-up-manager";
import { PowerBoltManager } from "./game/power-bolt-manager";
import { GameOver } from "./game/game-over";
import { Rect } from "./rect";
import { Color } from "./Color";
import { ShapeManager } from "./shape-manager";

const engine = new Engine();

engine.initialize().then(async () => {
  const [width, height] = engine.gameBounds;
  const input = engine.inputManager;
  const spriteRenderer = engine.spriteRenderer;
  const shapeRenderer = engine.shapeRenderer;

  // Systems
  const highScore = new HighScore();
  const gameOverScreen = new GameOver();
  const explosionManager = new ExplosionManager();
  const background = new Background(width, height);

  // Dynamic State
  let player: Player;
  let bulletManager: BulletManager;
  let enemyBulletManager: BulletManager;
  let enemyManager: EnemyManager;
  let powerUpManager: PowerUpManager;
  let powerBoltManager: PowerBoltManager;
  let shapeManager: ShapeManager;

  const initGame = () => {
    player = new Player(input, width, height);
    bulletManager = new BulletManager(player, false);
    enemyBulletManager = new BulletManager(player, true);

    enemyManager = new EnemyManager(
      width,
      height,
      player,
      explosionManager,
      bulletManager,
      enemyBulletManager,
      highScore,
    );

    powerUpManager = new PowerUpManager(width, height, player);
    powerBoltManager = new PowerBoltManager(
      width,
      height,
      player,
      bulletManager,
    );
    shapeManager = new ShapeManager(width, height);

    highScore.currentScore = 0;
  };

  initGame();

  const bloomEffect = await engine.effectsfactory.createBloomEffect();

  engine.onUpdate = (dt: number) => {
    if (enemyManager.isGameOver) {
      gameOverScreen.currentScore = highScore.currentScore;
      if (input.isKeyDown("enter")) initGame();
      return;
    }

    background.update(dt);
    player.update(dt);
    enemyManager.update(dt);
    bulletManager.update(dt);
    explosionManager.update(dt);
    powerUpManager.update(dt);
    powerBoltManager.update(dt);
    shapeManager.update(dt);
  };

  engine.onDraw = (commandEncoder: GPUCommandEncoder) => {
    // Redirect engine rendering to the bloom effect's input textures
    engine.setDestinationTexture(bloomEffect.sceneTexture.texture);
    engine.setDestinationTexture2(bloomEffect.brightnessTexture.texture);

    // Draw World
    background.draw(spriteRenderer);
    player.draw(spriteRenderer);
    enemyManager.draw(spriteRenderer);
    bulletManager.draw(spriteRenderer);
    explosionManager.draw(spriteRenderer);
    powerUpManager.draw(spriteRenderer);
    powerBoltManager.draw(spriteRenderer);
    highScore.draw(spriteRenderer);
    shapeManager.draw(engine.shapeRenderer);

    if (enemyManager.isGameOver) {
      gameOverScreen.draw(spriteRenderer, width, height);
    }

    // Composite the scene and bloom textures back to the screen
    bloomEffect.draw(engine.getCanvasTexture().createView(), commandEncoder);
  };

  engine.draw();
});
