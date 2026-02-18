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

  public color = new Color(1, 1, 1);
  private hitTimer: number = 0;

  constructor() {
    const sprite = Content.sprites["shield1"];
    this.texture = sprite.texture;
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();
  }

  public onHit() {
    this.hitTimer = 1000; // 1 second flash duration
  }

  update(dt: number, playerRect: Rect, isShrunk: boolean) {
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;

      // 1. Calculate flashing speed
      // Increase '15' to flash faster, decrease to flash slower
      const flashSpeed = 15;

      // Math.sin oscillates between -1 and 1.
      // We transform it to 0 and 1.
      const sineWave = Math.sin((performance.now() / 1000) * flashSpeed);

      const intensity = (sineWave + 1) / 2; // Maps -1..1 to 0..1

      // 2. Apply Colors
      // When intensity is 1 -> Red (1, 0.2, 0.2)
      // When intensity is 0 -> White (1, 1, 1)
      this.color.r = 1.0;
      this.color.g = 1.0 - intensity;
      this.color.b = 1.0 - intensity;
    } else {
      this.hitTimer = 0;
      this.color.r = 1.0;
      this.color.g = 1.0;
      this.color.b = 1.0;
    }

    // Padding and Positioning
    const padding = isShrunk ? 15 : 20;
    this.drawRect.width = playerRect.width + padding;
    this.drawRect.height = playerRect.height + padding;
    this.drawRect.x =
      playerRect.x - (this.drawRect.width - playerRect.width) / 2;
    this.drawRect.y =
      playerRect.y - (this.drawRect.height - playerRect.height) / 2;

    this.ellipticalCollider.update(this.drawRect);
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
