import { Bullet } from "./bullet";
import { Enemey } from "./game/enemy";
import { Player } from "./game/player";
import { SpriteRenderer } from "./sprite-renderer";

const SPAWN_TIME = 250;

export class BulletManager {
  private pool: Bullet[] = [];
  private timeToNextSpawn = 0;
  constructor(private readonly player: Player) {}
  public create() {
    let bullet = this.pool.find((b) => !b.active);
    if (!bullet) {
      bullet = new Bullet();
      this.pool.push(bullet);
    }
    bullet.spawn(this.player);
  }

  public intersectsEnemy(enemey: Enemey) {
    for (const bullet of this.pool) {
      if (bullet.active && bullet.colider.intersects(enemey.circleCollider)) {
        bullet.active = false;
        return true;
      }
    }
    return false;
  }

  public update(dt: number) {
    this.timeToNextSpawn += dt;
    if (this.timeToNextSpawn > SPAWN_TIME) {
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
