import { BulletManager } from "../bullet-manager";
import { ExplosionManager } from "../explosion-manager";
import { SpriteRenderer } from "../sprite-renderer";
import { Enemey } from "./enemy";
import { MeteorEnemy } from "./meteor-enemy";
import { Player } from "./player";

const SPAWN_INTERVAL = 1000; // spawn every 2 seconds

export class EnemyManager {
  private timeToSpawn = 0;
  private pool: Enemey[] = [];

  constructor(
    private gameWidht: number,
    private gameHeight: number,
    private readonly player: Player,
    private readonly explosionManager: ExplosionManager,
    private readonly bulletManager: BulletManager
  ) {}

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
        //enemy player collision
        if (enemy.circleCollider.intersects(this.player.circleCollider)) {
          enemy.active = false;

          //TODO : create explosion

          this.explosionManager.create(enemy.drawRect);
        }
        //enemy bullet collision

        if (this.bulletManager.intersectsEnemy(enemy)) {
          enemy.active = false;

          //TODO : create explosion

          this.explosionManager.create(enemy.drawRect);
        }

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
