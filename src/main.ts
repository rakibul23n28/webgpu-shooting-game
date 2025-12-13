import { BulletManager } from "./bullet-manager";
import { Engine } from "./engine";
import { ExplosionManager } from "./explosion-manager";
import { Background } from "./game/background";
import { EnemyManager } from "./game/ememy-manager";
import { MeteorEnemy } from "./game/meteor-enemy";
import { Player } from "./game/player";

const engine = new Engine();
engine.initialize().then(() => {
  const player = new Player(
    engine.inputManager,
    engine.gameBounds[0],
    engine.gameBounds[1]
  );
  const explosionManager = new ExplosionManager();
  const bulletManager = new BulletManager(player);

  const backGorund = new Background(engine.gameBounds[0], engine.gameBounds[1]);
  const enemyManager = new EnemyManager(
    engine.gameBounds[0],
    engine.gameBounds[1],
    player,
    explosionManager,
    bulletManager
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
  };
  engine.draw();
});
