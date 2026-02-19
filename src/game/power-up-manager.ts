import { PowerUpShield } from "./power-up-shield";
import { Player } from "./player";
import { SpriteRenderer } from "../sprite-renderer";
import { SoundManager } from "../sound-manager";

export class PowerUpManager {
  private powerUps: PowerUpShield[] = [];
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 0;

  constructor(
    private gameWidth: number,
    private gameHeight: number,
    private player: Player,
  ) {
    this.setNextSpawnTime();
  }

  private setNextSpawnTime() {
    // Random time between 5000ms and 15000ms
    this.nextSpawnTime = Math.random() * (15000 - 5000) + 5000;
    this.spawnTimer = 0;
  }

  public update(dt: number) {
    // 1. Handle Spawning
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.powerUps.push(new PowerUpShield(this.gameWidth, this.gameHeight));
      this.setNextSpawnTime();
    }

    // 2. Update and Collision Check
    // Iterate backwards to safely remove items
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update(dt);

      // Check collision with player body
      if (p.active && p.circleCollider.intersects(this.player.circleCollider)) {
        this.applyPowerUp(p);
      }

      // Remove inactive powerups (either collected or off-screen)
      if (!p.active) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  private applyPowerUp(p: PowerUpShield) {
    p.active = false;

    // Activate the player's shield
    this.player.shield.activate();

    // Play a "powerup" sound
    SoundManager.play("powerup", 0.8);

    // Optional: Reset player health or add score
  }

  public draw(spriteRenderer: SpriteRenderer) {
    for (const p of this.powerUps) {
      p.draw(spriteRenderer);
    }
  }
}
