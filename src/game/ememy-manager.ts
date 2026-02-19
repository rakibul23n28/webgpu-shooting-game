import { BulletManager } from "../bullet-manager";
import { ExplosionManager } from "../explosion-manager";
import { SoundManager } from "../sound-manager";
import { SpriteRenderer } from "../sprite-renderer";
import { Enemey } from "./enemy";
import { HighScore } from "./high-score";
import { MeteorEnemy } from "./meteor-enemy";
import { Player } from "./player";
import { vec2 } from "gl-matrix";

const SPAWN_INTERVAL = 1000;

export class EnemyManager {
  private timeToSpawn = 0;
  private pool: Enemey[] = [];
  public isGameOver = false;

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
    if (this.isGameOver) return;
    this.timeToSpawn += dt;
    this.spawnEnemy();

    const playerCenter = vec2.fromValues(
      this.player.drawRect.x + this.player.drawRect.width / 2,
      this.player.drawRect.y + this.player.drawRect.height / 2,
    );

    for (let i = this.pool.length - 1; i >= 0; i--) {
      const enemy = this.pool[i];

      if (enemy.active) {
        enemy.update(dt, playerCenter);

        // 1. SHIELD COLLISION (Elliptical)
        // Check this first so the shield protects the player
        if (this.player.shield.active) {
          if (
            this.player.shield.ellipticalCollider.intersects(
              enemy.circleCollider,
            )
          ) {
            this.handleEnemyDestruction(enemy, "shield_hit", false);
            this.player.shield.onHit(); // Trigger shield hit effect
            continue; // Skip player collision check
          }
        }

        // 2. PLAYER COLLISION (Circle)
        if (enemy.circleCollider.intersects(this.player.circleCollider)) {
          this.handleEnemyDestruction(enemy, "lose", false);
          this.isGameOver = true;
          // Potential TODO: this.player.takeDamage() or GameOver()
          continue;
        }

        // 3. BULLET COLLISION
        if (this.bulletManager.intersectsEnemy(enemy)) {
          this.handleEnemyDestruction(enemy, "explosion", true);
          continue;
        }

        // 4. BOUNDS CHECK
        if (
          enemy.drawRect.y > this.gameHeight ||
          enemy.drawRect.x > this.gameWidht + enemy.drawRect.width ||
          enemy.drawRect.x < -enemy.drawRect.width
        ) {
          enemy.active = false;
        }
      }
    }
  }

  /**
   * Helper to handle common destruction logic
   */
  private handleEnemyDestruction(
    enemy: Enemey,
    soundKey: string,
    awardPoint: boolean,
  ) {
    enemy.active = false;
    this.explosionManager.create(enemy.drawRect);
    SoundManager.play(soundKey, 0.6);

    if (awardPoint) {
      this.highScore.currentScore++;
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
