import { Rect } from "./rect";
import { CircleCollider } from "./circle-colider";

export class EllipticalCollider {
  public x: number = 0;
  public y: number = 0;
  public radiusX: number = 0;
  public radiusY: number = 0;

  // The bottom 1/3rd gap settings
  private readonly GAP_CENTER = Math.PI / 2;
  public gapWidth: number = 0;

  // Added this getter so CircleCollider can find "center.x"
  public get center() {
    return { x: this.x, y: this.y };
  }

  public update(drawRect: Rect) {
    this.radiusX = drawRect.width / 2;
    this.radiusY = drawRect.height / 2;
    this.x = drawRect.x + this.radiusX;
    this.y = drawRect.y + this.radiusY;
  }

  public intersects(other: CircleCollider): boolean {
    const dx = other.x - this.x;
    const dy = other.y - this.y;

    const combinedRX = this.radiusX + other.radius;
    const combinedRY = this.radiusY + other.radius;

    const normX = dx / combinedRX;
    const normY = dy / combinedRY;

    const distanceSq = normX * normX + normY * normY;

    if (distanceSq > 1) {
      return false;
    }

    const angle = Math.atan2(dy, dx);

    // GAP CHECK: If bullet/enemy is in the bottom opening, no collision
    if (
      angle > this.GAP_CENTER - this.gapWidth &&
      angle < this.GAP_CENTER + this.gapWidth
    ) {
      return false;
    }

    return true;
  }
}
