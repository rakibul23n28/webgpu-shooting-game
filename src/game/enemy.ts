import { CircleCollider } from "../circle-colider";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";

export interface Enemey {
  active: boolean;
  drawRect: Rect;
  readonly circleCollider: CircleCollider;
  update(dt: number): void;
  draw(spriteRenderer: SpriteRenderer): void;
}
