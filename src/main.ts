import { vec2 } from "gl-matrix";
import { BulletManager } from "./bullet-manager";
import { Content } from "./content";
import { Engine } from "./engine";
import { ExplosionManager } from "./explosion-manager";
import { Background } from "./game/background";
import { EnemyManager } from "./game/ememy-manager";
import { Player } from "./game/player";
import { SpriteRenderer } from "./sprite-renderer";
import { HighScore } from "./game/high-score";
import { PowerUpManager } from "./game/power-up-manager";
import { PowerBoltManager } from "./game/power-bolt-manager";
import { GameOver } from "./game/game-over";

const engine = new Engine();

engine.initialize().then(async () => {
  // 1. Extract constants for cleaner access
  const [width, height] = engine.gameBounds;
  const input = engine.inputManager;
  const renderer = engine.spriteRenderer;

  // 2. Persistent Systems (Created once, reused forever)
  const highScore = new HighScore();
  const gameOverScreen = new GameOver();
  const explosionManager = new ExplosionManager();
  const background = new Background(width, height);

  // 3. Game State Variables
  let player: Player;
  let bulletManager: BulletManager;
  let enemyBulletManager: BulletManager;
  let enemyManager: EnemyManager;
  let powerUpManager: PowerUpManager;
  let powerBoltManager: PowerBoltManager;

  // 4. Initialization/Restart Logic
  const initGame = () => {
    // Create player
    player = new Player(input, width, height);

    // Initialize Managers
    // We recreate these to ensure a fresh state, but background/highScore persist
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

    // Reset persistent systems
    highScore.currentScore = 0;
    explosionManager.update(0); // Optional: clear existing explosions
  };

  // Run first initialization
  initGame();

  // 5. Effects Setup
  const postProcessEffect = await engine.effectsfactory.createBloomEffect();

  // 6. Main Update Loop
  engine.onUpdate = (dt: number) => {
    if (enemyManager.isGameOver) {
      gameOverScreen.currentScore = highScore.currentScore;
      if (input.isKeyDown("enter")) {
        initGame();
      }
      return;
    }

    // Parallel update logic
    background.update(dt);
    player.update(dt);
    enemyManager.update(dt);
    bulletManager.update(dt);
    explosionManager.update(dt);
    powerUpManager.update(dt);
    powerBoltManager.update(dt);
  };

  // 7. Main Draw Loop
  engine.onDraw = (commandEncoder: GPUCommandEncoder) => {
    // Prepare Post-Processing Buffers
    engine.setDestinationTexture(postProcessEffect.sceneTexture.texture);
    engine.setDestinationTexture2(postProcessEffect.brightnessTexture.texture);

    // Render Game World
    background.draw(renderer);
    player.draw(renderer);
    enemyManager.draw(renderer);
    bulletManager.draw(renderer);
    explosionManager.draw(renderer);
    powerUpManager.draw(renderer);
    powerBoltManager.draw(renderer);
    highScore.draw(renderer);

    // Render UI
    if (enemyManager.isGameOver) {
      gameOverScreen.draw(renderer, width, height);
    }

    // Final Composite to Canvas
    postProcessEffect.draw(
      engine.getCanvasTexture().createView(),
      commandEncoder,
    );
  };

  // Start Engine
  engine.draw();
});
