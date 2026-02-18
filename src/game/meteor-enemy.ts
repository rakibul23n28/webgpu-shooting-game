import { vec2 } from "gl-matrix";
import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Texture } from "../texture";
import { Enemey } from "./enemy";
import { CircleCollider } from "../circle-colider";
import { Color } from "../Color";

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

type AIState = "wander" | "attack";

export class MeteorEnemy implements Enemey {
  public active: boolean = true;
  public reddishScale: number = 0;

  public drawRect: Rect;
  private texture: Texture;
  private sourceRect: Rect;

  private rotation = 0;
  private rotationOrigin = vec2.fromValues(0.5, 0.5);
  private rotationSpeed = 0;

  public circleCollider: CircleCollider = new CircleCollider();

  private speed = 0;

  // -----------------------
  // AI settings
  // -----------------------
  private state: AIState = "wander";

  private wanderDrift = (Math.random() - 0.5) * 0.2;
  private wanderTimer = 0;

  private attackStrength = 0.0025 / 2;

  private attackDistance = 220;

  // redness (logistic)
  private dangerDistance;
  private steepness = 0.005;

  constructor(
    private gameWidht: number,
    private gameHeight: number,
  ) {
    const key = ENEMY_KEYS[Math.floor(Math.random() * ENEMY_KEYS.length)];
    const sprite = Content.sprites[key];
    this.dangerDistance = this.gameHeight * 0.5;

    this.texture = sprite.texture;
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();

    this.speed =
      METEOR_MIN_SPEED + Math.random() * (METEOR_MAX_SPEED - METEOR_MIN_SPEED);

    this.rotationSpeed = (Math.random() - 0.5) * 0.005;
  }

  /**
   * Wander + Attack Zone AI
   */
  update(dt: number, playerPos: vec2): void {
    const myPos = vec2.fromValues(this.drawRect.x, this.drawRect.y);

    const dx = playerPos[0] - myPos[0];
    const dy = playerPos[1] - myPos[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    // -----------------------
    // STATE SWITCH
    // -----------------------
    this.state = distance < this.attackDistance ? "attack" : "wander";

    // -----------------------
    // WANDER MODE
    // -----------------------
    if (this.state === "wander") {
      // fall down
      this.drawRect.y += this.speed * dt;

      // random side drift
      this.wanderTimer -= dt;

      if (this.wanderTimer <= 0) {
        this.wanderTimer = 800 + Math.random() * 1200;
        this.wanderDrift = (Math.random() - 0.5) * 0.25;
      }

      this.drawRect.x += this.wanderDrift * dt;
    }

    // -----------------------
    // ATTACK MODE (chase)
    // -----------------------
    else {
      this.drawRect.x += dx * this.attackStrength * dt;
      this.drawRect.y += dy * this.attackStrength * dt;
    }

    // -----------------------
    // ROTATION
    // -----------------------
    this.rotation += this.rotationSpeed * dt;

    // -----------------------
    // COLLIDER
    // -----------------------
    this.circleCollider.update(this.drawRect);

    // -----------------------
    // REDNESS (logistic proximity)
    // r(d)=1/(1+e^(k(d-D)))
    // -----------------------
    const targetRed =
      1 / (1 + Math.exp(this.steepness * (distance - this.dangerDistance)));

    // smooth interpolation
    this.reddishScale += (targetRed - this.reddishScale) * 0.1;

    // -----------------------
    // deactivate if off screen
    // -----------------------
    if (
      this.drawRect.y > this.gameHeight + 200 ||
      this.drawRect.x < -200 ||
      this.drawRect.x > this.gameWidht + 200
    ) {
      this.active = false;
    }
  }

  draw(spriteRenderer: SpriteRenderer): void {
    const tint = new Color();

    // 0–1 RGB
    // white → red
    tint.r = 1.0;
    tint.g = 1.0 - this.reddishScale;
    tint.b = 1.0 - this.reddishScale;

    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
      tint,
      this.rotation,
      this.rotationOrigin,
    );
  }
}
