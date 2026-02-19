import { PowerBolt } from "./power-bolt";
import { Player } from "./player";
import { SpriteRenderer } from "../sprite-renderer";
import { SoundManager } from "../sound-manager";
import { BulletManager } from "../bullet-manager";

export class PowerBoltManager {
  private bolts: PowerBolt[] = [];
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 0;

  constructor(
    private gameWidth: number,
    private gameHeight: number,
    private player: Player,
    private bulletManager: BulletManager,
  ) {
    this.setNextSpawnTime();
  }

  private setNextSpawnTime() {
    // Spawns every 10 to 20 seconds (Bolt specific frequency)
    this.nextSpawnTime = Math.random() * (20000 - 10000) + 10000;
    this.spawnTimer = 0;
  }

  public update(dt: number) {
    // 1. Spawning
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.bolts.push(new PowerBolt(this.gameWidth, this.gameHeight));
      this.setNextSpawnTime();
    }

    // 2. Collision & Update
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const bolt = this.bolts[i];
      bolt.update(dt);

      // Check collision with player body
      if (
        bolt.active &&
        bolt.circleCollider.intersects(this.player.circleCollider)
      ) {
        this.applyPowerUp(bolt);
      }

      // Cleanup
      if (!bolt.active) {
        this.bolts.splice(i, 1);
      }
    }
  }

  private applyPowerUp(bolt: PowerBolt) {
    bolt.active = false;

    // Trigger Rapid Fire on player (e.g., for 7 seconds)
    this.bulletManager.activateRapidFire(7000);

    // Sound effect for collecting the bolt
    SoundManager.play("powerup", 0.8);
  }

  public draw(spriteRenderer: SpriteRenderer) {
    for (const bolt of this.bolts) {
      bolt.draw(spriteRenderer);
    }
  }
}
