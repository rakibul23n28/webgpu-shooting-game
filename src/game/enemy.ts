import { vec2 } from "gl-matrix";
import { CircleCollider } from "../circle-colider";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Player } from "./player";

export interface Enemey {
  active: boolean;
  drawRect: Rect;
  reddishScale: number;
  readonly circleCollider: CircleCollider;
  update(dt: number, playerPos: vec2): void;
  draw(spriteRenderer: SpriteRenderer): void;
}
