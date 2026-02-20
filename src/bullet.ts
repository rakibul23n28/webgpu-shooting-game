import { CircleCollider } from "./circle-colider";
import { Content } from "./content";
import { Rect } from "./rect";
import { SoundManager } from "./sound-manager";
import { SpriteRenderer } from "./sprite-renderer";
import { Texture } from "./texture";

// Define two different speeds
const PLAYER_BULLET_SPEED = 0.75;
const ENEMY_BULLET_SPEED = 0.35; // Roughly half the speed of the player

export class Bullet {
  public readonly drawRect: Rect;
  private sourceRect: Rect;
  public active: boolean = false;
  public colider: CircleCollider = new CircleCollider();
  private texture: Texture;

  // Instance variables for movement
  private direction: number = -1;
  private speed: number = PLAYER_BULLET_SPEED;

  constructor() {
    const sprite = Content.sprites["laserBlue01"];
    this.drawRect = sprite.drawRect.copy();
    this.sourceRect = sprite.sourceRect.copy();
    this.texture = sprite.texture;
  }

  /**
   * Generalized spawn method
   * @param source The Rect of the entity firing (Player or Enemy)
   * @param isEnemy If true, moves down, uses red laser, and moves slower
   */
  public spawn(source: Rect, isEnemy: boolean = false) {
    this.active = true;
    this.direction = isEnemy ? 1 : -1;

    // --- APPLY DIFFERENT SPEEDS ---
    this.speed = isEnemy ? ENEMY_BULLET_SPEED : PLAYER_BULLET_SPEED;

    // Set Texture based on who is firing
    const spriteKey = isEnemy ? "laserRed01" : "laserBlue01";
    const sprite = Content.sprites[spriteKey];
    this.texture = sprite.texture;
    this.sourceRect = sprite.sourceRect.copy();

    // Position: Center on the source
    this.drawRect.x = source.x + source.width / 2 - this.drawRect.width / 2;

    // Y Position: Above if player, Below if enemy
    this.drawRect.y = isEnemy
      ? source.y + source.height
      : source.y - this.drawRect.height;

    this.colider.update(this.drawRect);

    // Play different sounds/pitches
    const pitch = isEnemy ? 0.2 : 0.05;
    SoundManager.playFor("laser", 0.2, pitch);
  }

  public update(dt: number, gameHeight: number = 2000) {
    if (!this.active) return;

    // Move based on direction and its specific assigned speed
    this.drawRect.y += this.speed * this.direction * dt;
    this.colider.update(this.drawRect);

    // Deactivate if off top or bottom of screen
    if (
      this.drawRect.y + this.drawRect.height < -100 ||
      this.drawRect.y > gameHeight + 100
    ) {
      this.active = false;
    }
  }

  public draw(spriteRenderer: SpriteRenderer) {
    if (!this.active) return;
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect,
    );
  }
}
