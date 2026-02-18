import { Rect } from "./rect";
import { CircleCollider } from "./circle-colider";

export class EllipticalCollider {
  public x: number = 0;
  public y: number = 0;
  public radiusX: number = 0;
  public radiusY: number = 0;

  // The bottom 1/3rd gap settings
  // Math.PI / 2 is 90 degrees (pointing straight down)
  private readonly GAP_CENTER = Math.PI / 2;
  // Width of the opening. 1.05 radians is roughly 60 degrees (1/3 of the bottom half)
  public gapWidth: number = 1.05;

  public update(drawRect: Rect) {
    this.radiusX = drawRect.width / 2;
    this.radiusY = drawRect.height / 2;
    this.x = drawRect.x + this.radiusX;
    this.y = drawRect.y + this.radiusY;
  }

  /**
   * Checks if a CircleCollider intersects the elliptical boundary.
   */
  public intersects(other: CircleCollider): boolean {
    const dx = other.x - this.x;
    const dy = other.y - this.y;

    /**
     * 1. Ellipse Equation Check
     * A point (x, y) is inside an ellipse if:
     * (x²/rx²) + (y²/ry²) <= 1
     * We add the other object's radius to our radii to account for its size.
     */
    const combinedRX = this.radiusX + other.radius;
    const combinedRY = this.radiusY + other.radius;

    const normX = dx / combinedRX;
    const normY = dy / combinedRY;

    // Distance check in normalized elliptical space
    const distanceSq = normX * normX + normY * normY;

    if (distanceSq > 1) {
      return false; // Definitely outside the ellipse
    }

    /**
     * 2. Bottom 1/3rd Gap Check
     * atan2 returns the angle in radians from -PI to PI
     */
    const angle = Math.atan2(dy, dx);

    // If the angle falls within the bottom gap, the object passes through
    if (
      angle > this.GAP_CENTER - this.gapWidth &&
      angle < this.GAP_CENTER + this.gapWidth
    ) {
      return false; // Object is in the "open" part of the shield
    }

    return true; // Valid collision with the shield arc
  }
}
