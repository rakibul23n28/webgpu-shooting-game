import { CircleCollider } from "../circle-colider";
import { Color } from "../Color";
import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Texture } from "../texture";

const POWERUP_SHIELD_SPEED_MIN = 0.15;
const POWERUP_SHIELD_SPEED_MAX = 0.25;

export class PowerUpShield {
  public active: boolean = true;
  public drawRect: Rect;
  public sourceRect: Rect;
  public texture: Texture;
  public circleCollider: CircleCollider = new CircleCollider();
  public color = new Color(1, 1, 1);
  private speed = POWERUP_SHIELD_SPEED_MIN;

  private aliveTime: number = 0; // Tracks total time existing

  constructor(
    private gameWidth: number,
    private gameHeight: number,
  ) {
    const sprite = Content.sprites["powerupGreen_shield"];
    this.texture = sprite.texture;
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();

    this.speed =
      POWERUP_SHIELD_SPEED_MIN +
      Math.random() * (POWERUP_SHIELD_SPEED_MAX - POWERUP_SHIELD_SPEED_MIN); // Randomize speed a bit for variety

    // Spawn at a random X position at the top
    this.drawRect.x = Math.random() * (this.gameWidth - this.drawRect.width);
    this.drawRect.y = -this.drawRect.height;
  }

  update(dt: number) {
    if (!this.active) return;

    this.aliveTime += dt;

    // 1. Movement: Fall downwards
    this.drawRect.y += this.speed * dt;

    // 2. Visual Effect: Pulse the color slightly so it glows
    // Using that sine wave logic we discussed!
    const pulse = (Math.sin(this.aliveTime * 0.005) + 1) / 2;
    this.color.g = 0.7 + 0.3 * pulse; // Pulses between light green and full white
    this.color.b = 0.7 + 0.3 * pulse;

    // 3. Update Collider
    this.circleCollider.update(this.drawRect);

    // 4. Bounds Check
    if (this.drawRect.y > this.gameHeight) {
      this.active = false;
    }
  }

  draw(spriteRenderer: SpriteRenderer) {
    if (!this.active) return;

    // FIXED: Swapped drawRect and sourceRect to the correct order
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect, // Destination
      this.sourceRect, // Source from spritesheet
      this.color,
    );
  }
}
