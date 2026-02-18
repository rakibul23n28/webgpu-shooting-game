import { BulletManager } from "../bullet-manager";
import { ExplosionManager } from "../explosion-manager";
import { SoundManager } from "../sound-manager";
import { SpriteRenderer } from "../sprite-renderer";
import { Enemey } from "./enemy";
import { HighScore } from "./high-score";
import { MeteorEnemy } from "./meteor-enemy";
import { Player } from "./player";
import { vec2 } from "gl-matrix";

const SPAWN_INTERVAL = 1000; // spawn every 2 seconds

export class EnemyManager {
  private timeToSpawn = 0;
  private pool: Enemey[] = [];

  constructor(
    private gameWidht: number,
    private gameHeight: number,
    private readonly player: Player,
    private readonly explosionManager: ExplosionManager,
    private readonly bulletManager: BulletManager,
    private readonly highScore: HighScore,
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
        enemy.update(
          dt,
          vec2.fromValues(
            this.player.drawRect.x + this.player.drawRect.width / 2,
            this.player.drawRect.y + this.player.drawRect.height / 2,
          ),
        );
        //enemy player collision
        const collisionResult = enemy.circleCollider.intersects(
          this.player.circleCollider,
        );

        if (collisionResult) {
          enemy.active = false;

          //TODO : create explosion

          this.explosionManager.create(enemy.drawRect);
          SoundManager.play("lose", 1);
        }

        //enemy bullet collision

        if (this.bulletManager.intersectsEnemy(enemy)) {
          enemy.active = false;

          //TODO : create explosion

          this.explosionManager.create(enemy.drawRect);

          // Play explosion sound
          SoundManager.play("explosion", 0.6);
          this.highScore.currentScore++;
        }

        if (enemy.drawRect.y > this.gameHeight) {
          enemy.active = false;
        }
        if (
          enemy.drawRect.x > this.gameWidht + enemy.drawRect.width ||
          enemy.drawRect.x < -enemy.drawRect.width
        ) {
          enemy.active = false;
        }
      } else {
        this.pool.splice(this.pool.indexOf(enemy), 1);
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
