import { Bullet } from "./bullet";
import { Enemey } from "./game/enemy";
import { Player } from "./game/player";
import { SpriteRenderer } from "./sprite-renderer";

const NORMAL_SPAWN_TIME = 250;
const RAPID_SPAWN_TIME = 150; // Adjusted slightly for the 3-bullet burst

export class BulletManager {
  private pool: Bullet[] = [];
  private timeToNextSpawn = 0;
  private rapidFireTimer = 0;

  constructor(private readonly player: Player) {}

  public activateRapidFire(duration: number) {
    this.rapidFireTimer = duration;
  }

  /**
   * Modified to support Triple Shot
   */
  public create() {
    if (this.rapidFireTimer > 0) {
      // --- TRIPLE SHOT LOGIC ---
      // We spawn 3 bullets with different offsets
      this.spawnSingleBullet(-15); // Left bullet
      this.spawnSingleBullet(0); // Center bullet
      this.spawnSingleBullet(15); // Right bullet
    } else {
      // --- NORMAL SHOT ---
      this.spawnSingleBullet(0);
    }
  }

  /**
   * Helper to handle pooling and spawning with an offset
   */
  private spawnSingleBullet(offsetX: number) {
    let bullet = this.pool.find((b) => !b.active);
    if (!bullet) {
      bullet = new Bullet();
      this.pool.push(bullet);
    }

    bullet.spawn(this.player);
    // Apply horizontal offset so they are side-by-side
    bullet.drawRect.x += offsetX;
  }

  public intersectsEnemy(enemey: Enemey) {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const bullet = this.pool[i];
      if (bullet.active) {
        if (bullet.colider.intersects(enemey.circleCollider)) {
          bullet.active = false;
          return true;
        }
      } else {
        this.pool.splice(i, 1);
      }
    }
    return false;
  }

  public update(dt: number) {
    let currentSpawnInterval = NORMAL_SPAWN_TIME;

    if (this.rapidFireTimer > 0) {
      this.rapidFireTimer -= dt;
      currentSpawnInterval = RAPID_SPAWN_TIME;
    } else {
      this.rapidFireTimer = 0;
    }

    this.timeToNextSpawn += dt;
    if (this.timeToNextSpawn > currentSpawnInterval) {
      this.timeToNextSpawn = 0;
      this.create();
    }

    for (const bullet of this.pool) {
      if (bullet.active) bullet.update(dt);
    }
  }

  public draw(spriteRenderer: SpriteRenderer) {
    for (const bullet of this.pool) {
      if (bullet.active) bullet.draw(spriteRenderer);
    }
  }
}
