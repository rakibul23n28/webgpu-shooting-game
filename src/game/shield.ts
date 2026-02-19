import { CircleCollider } from "../circle-colider";
import { Color } from "../Color";
import { Content } from "../content";
import { EllipticalCollider } from "../elliptical-collider";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Texture } from "../texture";

export class Shield {
  public active: boolean = false;
  public drawRect: Rect;
  public sourceRect: Rect;
  public texture: Texture;
  public ellipticalCollider: EllipticalCollider = new EllipticalCollider();

  public color = new Color(1, 1, 1, 1);
  private hitTimer: number = 0;

  // Timer to track total shield duration
  private shieldDurationTimer: number = 0;
  private readonly MAX_SHIELD_TIME = 10000; // 10 seconds

  constructor() {
    const sprite = Content.sprites["shield1"];
    this.texture = sprite.texture;
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();
  }

  /**
   * Activates the shield and resets the 10-second timer.
   */
  public activate() {
    this.active = true;
    this.shieldDurationTimer = this.MAX_SHIELD_TIME;
  }

  /**
   * Triggers the red flashing effect when hit.
   */
  public onHit() {
    this.hitTimer = 1000; // 1 second flash
  }

  update(dt: number, playerRect: Rect, isShrunk: boolean) {
    // --- CRITICAL FIX: ALWAYS UPDATE POSITION ---
    // We update the position even if active is false so that when it
    // turns on, it doesn't "jump" from an old location.
    const padding = isShrunk ? 15 : 20;
    this.drawRect.width = playerRect.width + padding;
    this.drawRect.height = playerRect.height + padding;
    this.drawRect.x =
      playerRect.x - (this.drawRect.width - playerRect.width) / 2;
    this.drawRect.y =
      playerRect.y - (this.drawRect.height - playerRect.height) / 2;

    this.ellipticalCollider.update(this.drawRect);

    // If shield is not active, stop here (don't process timers or colors)
    if (!this.active) return;

    // 1. Handle Shield Life Duration
    this.shieldDurationTimer -= dt;
    if (this.shieldDurationTimer <= 0) {
      this.active = false;
      this.shieldDurationTimer = 0;
      return;
    }

    // 2. Handle Hit Flashing logic (Red <-> Normal)
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
      const flashSpeed = 15;
      const sineWave = Math.sin((performance.now() / 1000) * flashSpeed);
      const intensity = (sineWave + 1) / 2;

      this.color.r = 1.0;
      this.color.g = 1.0 - intensity;
      this.color.b = 1.0 - intensity;
    } else {
      this.hitTimer = 0;
      this.color.r = 1.0;
      this.color.g = 1.0;
      this.color.b = 1.0;
    }

    // 3. Expiration Warning: Flicker when less than 1.5s remains
    if (this.shieldDurationTimer < 1500) {
      const expireFlash = Math.sin(performance.now() * 0.02);
      this.color.a = expireFlash > 0 ? 1.0 : 0.3;
    } else {
      this.color.a = 1.0;
    }
  }

  draw(spriteRenderer: SpriteRenderer) {
    if (!this.active) return;

    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
      this.color,
    );
  }
}
