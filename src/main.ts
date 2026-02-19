import { vec2 } from "gl-matrix";
import { BulletManager } from "./bullet-manager";
import { Content } from "./content";
import { Engine } from "./engine";
import { ExplosionManager } from "./explosion-manager";
import { Background } from "./game/background";
import { EnemyManager } from "./game/ememy-manager";
import { MeteorEnemy } from "./game/meteor-enemy";
import { Player } from "./game/player";
import { SpriteRenderer } from "./sprite-renderer";
import { Color } from "./Color";
import { HighScore } from "./game/high-score";
import { PowerUpManager } from "./game/power-up-manager";
import { PowerBoltManager } from "./game/power-bolt-manager";
import { GameOver } from "./game/game-over"; // Added GameOver Import

const engine = new Engine();

engine.initialize().then(async () => {
  let player = new Player(
    engine.inputManager,
    engine.gameBounds[0],
    engine.gameBounds[1],
  );
  let explosionManager = new ExplosionManager();
  let bulletManager = new BulletManager(player);
  let highScore = new HighScore();
  let gameOverScreen = new GameOver(); // Added

  const backGorund = new Background(engine.gameBounds[0], engine.gameBounds[1]);
  let enemyManager = new EnemyManager(
    engine.gameBounds[0],
    engine.gameBounds[1],
    player,
    explosionManager,
    bulletManager,
    highScore,
  );
  let powerUpManager = new PowerUpManager(
    engine.gameBounds[0],
    engine.gameBounds[1],
    player,
  );

  let powerBoltManager = new PowerBoltManager(
    engine.gameBounds[0],
    engine.gameBounds[1],
    player,
    bulletManager,
  );

  const postProcessEffect = await engine.effectsfactory.createBloomEffect();
  // postProcessEffect.setCombineTexture(Content.iceTexture);

  // document.getElementById("mix-value")?.addEventListener("input", (event) => {
  //   const target = event.target as HTMLInputElement;
  //   const value = parseFloat(target.value);
  //   postProcessEffect.mixValue = value;
  // });

  // document
  //   .getElementById("horizontal-pass")
  //   ?.addEventListener("change", (event) => {
  //     const target = event.target as HTMLInputElement;
  //     postProcessEffect.doHorizontalPass = target.checked;
  //   });
  // document
  //   .getElementById("vertical-pass")
  //   ?.addEventListener("change", (event) => {
  //     const target = event.target as HTMLInputElement;
  //     postProcessEffect.doVerticalPass = target.checked;
  //   });

  // Helper for restarting the game state
  const restartGame = () => {
    player = new Player(
      engine.inputManager,
      engine.gameBounds[0],
      engine.gameBounds[1],
    );
    explosionManager = new ExplosionManager();
    bulletManager = new BulletManager(player);
    highScore = new HighScore();
    enemyManager = new EnemyManager(
      engine.gameBounds[0],
      engine.gameBounds[1],
      player,
      explosionManager,
      bulletManager,
      highScore,
    );
    powerUpManager = new PowerUpManager(
      engine.gameBounds[0],
      engine.gameBounds[1],
      player,
    );
    powerBoltManager = new PowerBoltManager(
      engine.gameBounds[0],
      engine.gameBounds[1],
      player,
      bulletManager,
    );
    enemyManager.isGameOver = false;
  };

  engine.onUpdate = (dt: number) => {
    // Check for Game Over State
    if (enemyManager.isGameOver) {
      gameOverScreen.currentScore = highScore.currentScore;

      // If Game Over, listen for Enter to restart
      if (engine.inputManager.isKeyDown("enter")) {
        restartGame();
      }
      return; // Freeze game updates
    }

    player.update(dt);
    backGorund.update(dt);
    enemyManager.update(dt);
    explosionManager.update(dt);
    bulletManager.update(dt);
    powerUpManager.update(dt);
    powerBoltManager.update(dt);
  };

  engine.onDraw = () => {
    // if (postProcessEffect.getRenderTexture()) {
    //   engine.setDestinationTexture(
    //     postProcessEffect.getRenderTexture()!.texture,
    //   );
    // } else {
    //   engine.setDestinationTexture(null);
    // }

    engine.setDestinationTexture(postProcessEffect.sceneTexture.texture);
    engine.setDestinationTexture2(postProcessEffect.brightnessTexture.texture);

    backGorund.draw(engine.spriteRenderer);
    player.draw(engine.spriteRenderer);
    enemyManager.draw(engine.spriteRenderer);
    bulletManager.draw(engine.spriteRenderer);
    explosionManager.draw(engine.spriteRenderer);

    highScore.draw(engine.spriteRenderer);
    powerUpManager.draw(engine.spriteRenderer);
    powerBoltManager.draw(engine.spriteRenderer);

    // Draw Game Over UI on top of everything before post-processing
    if (enemyManager.isGameOver) {
      gameOverScreen.draw(
        engine.spriteRenderer,
        engine.gameBounds[0],
        engine.gameBounds[1],
      );
    }

    // engine.setDestinationTexture(null);

    // if (postProcessEffect.getRenderTexture()) {
    //   postProcessEffect.draw(engine.getCanvasTexture().createView());
    // }
    postProcessEffect.draw(engine.getCanvasTexture().createView());
  };
  engine.draw();
});
