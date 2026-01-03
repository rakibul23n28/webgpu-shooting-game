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

const engine = new Engine();
engine.initialize().then(() => {
  const player = new Player(
    engine.inputManager,
    engine.gameBounds[0],
    engine.gameBounds[1]
  );
  const explosionManager = new ExplosionManager();
  const bulletManager = new BulletManager(player);
  const highScore = new HighScore();

  const backGorund = new Background(engine.gameBounds[0], engine.gameBounds[1]);
  const enemyManager = new EnemyManager(
    engine.gameBounds[0],
    engine.gameBounds[1],
    player,
    explosionManager,
    bulletManager,
    highScore
  );

  engine.onUpdate = (dt: number) => {
    player.update(dt);
    backGorund.update(dt);
    enemyManager.update(dt);
    explosionManager.update(dt);
    bulletManager.update(dt);
  };
  engine.onDraw = () => {
    backGorund.draw(engine.spriteRenderer);
    player.draw(engine.spriteRenderer);
    enemyManager.draw(engine.spriteRenderer);
    bulletManager.draw(engine.spriteRenderer);
    explosionManager.draw(engine.spriteRenderer);

    highScore.draw(engine.spriteRenderer);
  };
  engine.draw();
});
