import { vec2 } from "gl-matrix";
import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Texture } from "../texture";
import { Enemey } from "./enemy";

const ENEMY_KEYS = [
  "meteorBrown_big1",
  "meteorBrown_big2",
  "meteorBrown_big3",
  "meteorBrown_big4",
  "meteorBrown_med1",
  "meteorBrown_med3",

  "meteorGrey_big1",
  "meteorGrey_big2",
  "meteorGrey_big3",
  "meteorGrey_big4",
  "meteorGrey_med1",
  "meteorGrey_med2",
];

const METEOR_MIN_SPEED = 0.05;
const METEOR_MAX_SPEED = 0.25;

export class MeteorEnemy implements Enemey {
  public active: boolean = true;
  public drawRect: Rect;
  private texture: Texture;
  private sourceRect: Rect;
  private rotation = 0;
  private rotationOrigin = vec2.fromValues(0.5, 0.5);
  private rotationSpeed = 0;

  private speed = 0;
  constructor(private gameWidht: number, private gameHeight: number) {
    const key = ENEMY_KEYS[Math.floor(Math.random() * ENEMY_KEYS.length)];
    const sprite = Content.sprites[key];
    this.texture = sprite.texture;
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();

    this.speed =
      METEOR_MIN_SPEED + Math.random() * (METEOR_MAX_SPEED - METEOR_MIN_SPEED);
    this.rotationSpeed = (Math.random() - 0.5) * 0.005;
  }
  update(dt: number): void {
    this.drawRect.y += this.speed * dt;
    this.rotation += this.rotationSpeed * dt;
  }
  draw(spriteRenderer: SpriteRenderer): void {
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
      undefined,
      this.rotation,
      this.rotationOrigin
    );
  }
}
