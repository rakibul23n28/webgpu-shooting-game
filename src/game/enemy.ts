import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";

export interface Enemey {
  active: boolean;
  drawRect: Rect;
  update(dt: number): void;
  draw(spriteRenderer: SpriteRenderer): void;
}
