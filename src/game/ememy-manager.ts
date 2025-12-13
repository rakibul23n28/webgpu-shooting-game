import { SpriteRenderer } from "../sprite-renderer";
import { Enemey } from "./enemy";
import { MeteorEnemy } from "./meteor-enemy";

const SPAWN_INTERVAL = 1000; // spawn every 2 seconds

export class EnemyManager {
  private timeToSpawn = 0;
  private pool: Enemey[] = [];

  constructor(private gameWidht: number, private gameHeight: number) {}

  public spawnEnemy() {
    if (this.timeToSpawn > SPAWN_INTERVAL) {
      this.timeToSpawn = 0;
      let enemy = this.pool.find((e) => !e.active);
      if (!enemy) {
        enemy = new MeteorEnemy(this.gameWidht, this.gameHeight);
        this.pool.push(enemy);
      }
      enemy.active = true;
      enemy.drawRect.x =
        Math.random() * (this.gameWidht - enemy.drawRect.width);

      enemy.drawRect.y = -enemy.drawRect.height;
    }
  }

  public update(dt: number) {
    this.timeToSpawn += dt;
    this.spawnEnemy();

    for (const enemy of this.pool) {
      if (enemy.active) {
        enemy.update(dt);
        if (enemy.drawRect.y > this.gameHeight) {
          enemy.active = false;
        }
      }
    }
  }

  public draw(spriteRenderer: SpriteRenderer) {
    for (const enemy of this.pool) {
      if (enemy.active) {
        enemy.draw(spriteRenderer);
      }
    }
  }
}
