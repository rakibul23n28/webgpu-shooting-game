import { Rect } from "./rect";

export class CircleCollider {
  public radius: number = 0;
  public x: number = 0;
  public y: number = 0;

  update(drawRect: Rect) {
    let redius = Math.max(drawRect.width, drawRect.height) / 2;
    this.radius = redius;
    this.x = drawRect.x + this.radius;
    this.y = drawRect.y + this.radius;
  }

  public intersects(other: CircleCollider) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const r = this.radius + other.radius;
    return distance < r;
  }
}
