import { EllipticalCollider } from "./elliptical-collider";
import { Rect } from "./rect";

export class CircleCollider {
  public radius: number = 0;
  public x: number = 0;
  public y: number = 0;
  public prevDistance: number = Number.MAX_VALUE;

  update(drawRect: Rect) {
    // Standard radius calculation
    this.radius = Math.max(drawRect.width, drawRect.height) / 2;
    this.x = drawRect.x + drawRect.width / 2;
    this.y = drawRect.y + drawRect.height / 2;
  }

  public intersects(other: CircleCollider): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const rSum = this.radius + other.radius;
    return distance < rSum;
  }
}
