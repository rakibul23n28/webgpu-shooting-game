import { Bullet } from "./bullet";
import { Enemey } from "./game/enemy";
import { Player } from "./game/player";
import { Shield } from "./game/shield"; // Added Import
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";

const NORMAL_SPAWN_TIME = 250;
const RAPID_SPAWN_TIME = 150;

export class BulletManager {
  private pool: Bullet[] = [];
  private timeToNextSpawn = 0;
  private rapidFireTimer = 0;

  constructor(
    private readonly player: Player,
    private readonly isEnemyManager: boolean = false,
  ) {}

  public activateRapidFire(duration: number) {
    this.rapidFireTimer = duration;
  }

  public create() {
    if (this.rapidFireTimer > 0) {
      this.spawnSingleBullet(this.player.drawRect, -15, false);
      this.spawnSingleBullet(this.player.drawRect, 0, false);
      this.spawnSingleBullet(this.player.drawRect, 15, false);
    } else {
      this.spawnSingleBullet(this.player.drawRect, 0, false);
    }
  }

  public createEnemyBullet(sourceRect: Rect) {
    this.spawnSingleBullet(sourceRect, 0, true);
  }

  private spawnSingleBullet(source: Rect, offsetX: number, isEnemy: boolean) {
    let bullet = this.pool.find((b) => !b.active);
    if (!bullet) {
      bullet = new Bullet();
      this.pool.push(bullet);
    }
    bullet.spawn(source, isEnemy);
    bullet.drawRect.x += offsetX;
  }

  public intersectsEnemy(enemey: Enemey): boolean {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const bullet = this.pool[i];
      if (bullet.active && bullet.colider.intersects(enemey.circleCollider)) {
        bullet.active = false;
        return true;
      }
    }
    return false;
  }

  public intersectsPlayer(player: Player): boolean {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const bullet = this.pool[i];
      if (bullet.active && bullet.colider.intersects(player.circleCollider)) {
        bullet.active = false;
        return true;
      }
    }
    return false;
  }

  public update(dt: number) {
    if (!this.isEnemyManager) {
      let currentSpawnInterval =
        this.rapidFireTimer > 0 ? RAPID_SPAWN_TIME : NORMAL_SPAWN_TIME;
      if (this.rapidFireTimer > 0) this.rapidFireTimer -= dt;

      this.timeToNextSpawn += dt;
      if (this.timeToNextSpawn > currentSpawnInterval) {
        this.timeToNextSpawn = 0;
        this.create();
      }
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
