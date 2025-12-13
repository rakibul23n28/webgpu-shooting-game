import { Engine } from "./engine";
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

  const backGorund = new Background(engine.gameBounds[0], engine.gameBounds[1]);
  const enemyManager = new EnemyManager(
    engine.gameBounds[0],
    engine.gameBounds[1]
  );

  engine.onUpdate = (dt: number) => {
    player.update(dt);
    backGorund.update(dt);
    enemyManager.update(dt);
  };
  engine.onDraw = () => {
    backGorund.draw(engine.spriteRenderer);
    player.draw(engine.spriteRenderer);
    enemyManager.draw(engine.spriteRenderer);
  };
  engine.draw();
});
