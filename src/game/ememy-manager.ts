import { BulletManager } from "../bullet-manager";
import { ExplosionManager } from "../explosion-manager";
import { SoundManager } from "../sound-manager";
import { SpriteRenderer } from "../sprite-renderer";
import { Enemey } from "./enemy";
import { HighScore } from "./high-score";
import { MeteorEnemy } from "./meteor-enemy";
import { FireEnemy } from "./fire-enemy";
import { Player } from "./player";
import { vec2 } from "gl-matrix";

const SPAWN_INTERVAL = 1200;

export class EnemyManager {
  private timeToSpawn = 0;
  private pool: Enemey[] = [];
  // Optimization: Track only active enemies to reduce loop iterations
  private activeEnemies: Enemey[] = [];
  public isGameOver = false;
  private readonly _tempPlayerCenter = vec2.create();

  constructor(
    private gameWidht: number,
    private gameHeight: number,
    private readonly player: Player,
    private readonly explosionManager: ExplosionManager,
    private readonly bulletManager: BulletManager,
    private readonly enemyBulletManager: BulletManager,
    private readonly highScore: HighScore,
  ) {}

  public spawnEnemy() {
    if (this.timeToSpawn > SPAWN_INTERVAL) {
      this.timeToSpawn = 0;
      const isFirePack = Math.random() > 0.7;

      if (isFirePack) {
        const spawnCount = Math.floor(Math.random() * 3) + 1;
        const sharedFreq = 0.0015 + Math.random() * 0.001;
        const sharedAmp = 80 + Math.random() * 100;
        const sharedX = 150 + Math.random() * (this.gameWidht - 300);
        const sharedSpeed = 0.08 + Math.random() * 0.05;

        for (let i = 0; i < spawnCount; i++) {
          const enemy = this.activateEnemyFromPool(true) as FireEnemy;
          enemy.zigzagFrequency = sharedFreq;
          enemy.zigzagAmplitude = sharedAmp;
          enemy.startX = sharedX;
          enemy.speed = sharedSpeed;
          enemy.totalTime = 0;
          enemy.groupOffset = (i - (spawnCount - 1) / 2) * 80;
          enemy.drawRect.y =
            -enemy.drawRect.height - Math.abs(enemy.groupOffset);
        }
      } else {
        this.activateEnemyFromPool(false);
      }
    }
  }

  private activateEnemyFromPool(isFireEnemy: boolean): Enemey {
    let enemy = this.pool.find(
      (e) =>
        !e.active &&
        (isFireEnemy ? e instanceof FireEnemy : e instanceof MeteorEnemy),
    );

    if (!enemy) {
      enemy = isFireEnemy
        ? new FireEnemy(
            this.gameWidht,
            this.gameHeight,
            this.enemyBulletManager,
          )
        : new MeteorEnemy(this.gameWidht, this.gameHeight);
      this.pool.push(enemy);
    }

    enemy.active = true;
    if (!(enemy instanceof FireEnemy)) {
      enemy.drawRect.x =
        Math.random() * (this.gameWidht - enemy.drawRect.width);
      enemy.drawRect.y = -enemy.drawRect.height;
    }

    // Maintain our active list for fast iteration
    this.activeEnemies.push(enemy);
    return enemy;
  }

  public update(dt: number) {
    if (this.isGameOver) return;

    this.timeToSpawn += dt;
    this.spawnEnemy();

    // 1. Update enemy bullets
    this.enemyBulletManager.update(dt);

    // Cache common references
    const player = this.player;
    const shield = player.shield;
    const isShieldActive = shield.active;

    // 2. Optimized Bullet vs Player check
    if (this.enemyBulletManager.intersectsPlayer(player)) {
      if (isShieldActive) {
        shield.onHit();
        SoundManager.play("shield_hit", 0.4);
      } else {
        this.isGameOver = true;
        SoundManager.play("lose", 0.6);
        return;
      }
    }

    // 3. Update cached player center
    this._tempPlayerCenter[0] = player.drawRect.x + player.drawRect.width * 0.5;
    this._tempPlayerCenter[1] =
      player.drawRect.y + player.drawRect.height * 0.5;

    // 4. Update Active Enemies Loop
    // Iterating backwards allows safe removal from activeEnemies list
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];

      enemy.update(dt, this._tempPlayerCenter);

      // --- Collision Logic ---
      let destroyed = false;

      // A. Shield vs Enemy Body
      if (
        isShieldActive &&
        shield.ellipticalCollider.intersects(enemy.circleCollider)
      ) {
        this.handleEnemyDestruction(enemy, "shield_hit", false);
        shield.onHit();
        destroyed = true;
      }
      // B. Player vs Enemy Body
      else if (enemy.circleCollider.intersects(player.circleCollider)) {
        if (isShieldActive) {
          this.handleEnemyDestruction(enemy, "shield_hit", false);
          shield.onHit();
        } else {
          this.handleEnemyDestruction(enemy, "lose", false);
          this.isGameOver = true;
        }
        destroyed = true;
      }
      // C. Player Bullets vs Enemy
      else if (this.bulletManager.intersectsEnemy(enemy)) {
        this.handleEnemyDestruction(enemy, "explosion", true);
        destroyed = true;
      }
      // D. Bounds check
      else if (enemy.drawRect.y > this.gameHeight + 200) {
        enemy.active = false;
        destroyed = true;
      }

      if (destroyed) {
        // Swap with last element and pop for O(1) removal performance
        this.activeEnemies[i] =
          this.activeEnemies[this.activeEnemies.length - 1];
        this.activeEnemies.pop();
      }
    }
  }

  private handleEnemyDestruction(
    enemy: Enemey,
    soundKey: string,
    awardPoint: boolean,
  ) {
    enemy.active = false;
    this.explosionManager.create(enemy.drawRect);
    SoundManager.play(soundKey, 0.6);
    if (awardPoint) this.highScore.currentScore++;
  }

  public draw(spriteRenderer: SpriteRenderer) {
    // Only draw active enemies
    for (let i = 0; i < this.activeEnemies.length; i++) {
      this.activeEnemies[i].draw(spriteRenderer);
    }
    this.enemyBulletManager.draw(spriteRenderer);
  }
}
