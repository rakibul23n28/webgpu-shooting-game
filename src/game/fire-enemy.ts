import { vec2 } from "gl-matrix";
import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Texture } from "../texture";
import { Enemey } from "./enemy";
import { CircleCollider } from "../circle-colider";
import { Color } from "../Color";
import { BulletManager } from "../bullet-manager";

const ENEMY_KEYS = ["enemyBlack2", "enemyBlue1", "enemyGreen3", "enemyRed4"];
const METEOR_MIN_SPEED = 0.08;
const METEOR_MAX_SPEED = 0.15;

export class FireEnemy implements Enemey {
  public active: boolean = true;
  public reddishScale: number = 0;

  public drawRect: Rect;
  private texture: Texture;
  private sourceRect: Rect;
  private rotationOrigin = vec2.fromValues(0.5, 0.5);

  public circleCollider: CircleCollider = new CircleCollider();
  public speed = 0;

  // Zigzag Properties
  public totalTime = 0;
  public zigzagAmplitude = 150;
  public zigzagFrequency = 0.002;
  public startX = 0;
  public groupOffset = 0;

  // --- SHOOTING PROPERTIES (Slowed Down) ---
  // Player is 250ms. 2500ms means the enemy fires 10x slower than the player.
  private readonly shootInterval = 1500;
  private shootTimer = 0;

  private dangerDistance: number;
  private steepness = 0.005;

  constructor(
    private gameWidth: number,
    private gameHeight: number,
    private enemyBulletManager: BulletManager,
  ) {
    const key = ENEMY_KEYS[Math.floor(Math.random() * ENEMY_KEYS.length)];
    const sprite = Content.sprites[key];

    this.dangerDistance = this.gameHeight * 0.5;
    this.texture = sprite.texture;
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();
    //scale enemy size randomly between 0.5 and 1.0
    const scale = 0.5 + Math.random() * 0.5;
    this.drawRect.width *= scale;
    this.drawRect.height *= scale;

    this.speed =
      METEOR_MIN_SPEED + Math.random() * (METEOR_MAX_SPEED - METEOR_MIN_SPEED);

    // Give each enemy a random starting timer so they don't fire
    // the exact same millisecond they spawn.
    this.shootTimer = Math.random() * 1000;
  }

  public update(dt: number, playerPos: vec2): void {
    this.totalTime += dt;

    // 1. MOVEMENT
    this.drawRect.y += this.speed * dt;
    const centerLine = this.startX + this.groupOffset;
    this.drawRect.x =
      centerLine +
      Math.sin(this.totalTime * this.zigzagFrequency) * this.zigzagAmplitude;

    // 2. FIRING LOGIC (Using the slow interval)
    this.shootTimer += dt;
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.fire();
    }

    // 3. VISUALS & COLLIDERS
    this.circleCollider.update(this.drawRect);

    const dx = playerPos[0] - this.drawRect.x;
    const dy = playerPos[1] - this.drawRect.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const targetRed =
      1 / (1 + Math.exp(this.steepness * (distance - this.dangerDistance)));
    this.reddishScale += (targetRed - this.reddishScale) * 0.1;

    if (this.drawRect.y > this.gameHeight + 200) {
      this.active = false;
    }
  }

  private fire() {
    this.enemyBulletManager.createEnemyBullet(this.drawRect);
  }

  public draw(spriteRenderer: SpriteRenderer): void {
    const tint = new Color(
      1.0,
      1.0 - this.reddishScale,
      1.0 - this.reddishScale,
    );
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
      tint,
      0,
      this.rotationOrigin,
    );
  }
}
