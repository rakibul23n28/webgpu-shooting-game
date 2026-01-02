import { vec2 } from "gl-matrix";
import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";
import { Texture } from "../texture";
import { InputManager } from "../input-manager";
import { CircleCollider } from "../circle-colider";

const PLAYER_SPEED = 0.25;
const SHRINK_FACTOR = 0.5;
const SPEED_BOOST_MULTIPLIER = 1.2;

export class Player {
  private movementDirection = vec2.create();

  public drawRect: Rect;
  private sourceRect: Rect;
  private texture: Texture;

  private originalWidth: number;
  private originalHeight: number;

  private isShrunk = false;

  public readonly circleCollider: CircleCollider = new CircleCollider();

  constructor(
    private inputManager: InputManager,
    private gameWidth: number,
    private gameHeight: number
  ) {
    const playerSprite = Content.sprites["playerShip2_green"];

    this.texture = playerSprite.texture;
    this.drawRect = playerSprite.drawRect.copy();
    this.sourceRect = playerSprite.sourceRect.copy();

    // Save original size
    this.originalWidth = this.drawRect.width;
    this.originalHeight = this.drawRect.height;

    // Start position
    this.drawRect.x = this.gameWidth / 2 - this.drawRect.width / 2;
    this.drawRect.y = this.gameHeight - this.drawRect.height - 20;
  }

  private clampToBounds(): void {
    if (this.drawRect.x < 0) this.drawRect.x = 0;
    if (this.drawRect.y < 0) this.drawRect.y = 0;

    if (this.drawRect.x + this.drawRect.width > this.gameWidth) {
      this.drawRect.x = this.gameWidth - this.drawRect.width;
    }

    if (this.drawRect.y + this.drawRect.height > this.gameHeight) {
      this.drawRect.y = this.gameHeight - this.drawRect.height;
    }
  }

  public update(dt: number): void {
    // Reset movement direction
    this.movementDirection[0] = 0;
    this.movementDirection[1] = 0;

    // Horizontal input
    if (
      this.inputManager.isKeyDown("arrowright") ||
      this.inputManager.isKeyDown("d")
    ) {
      this.movementDirection[0] = 1;
    }

    if (
      this.inputManager.isKeyDown("arrowleft") ||
      this.inputManager.isKeyDown("a")
    ) {
      this.movementDirection[0] = -1;
    }

    // Vertical input
    if (
      this.inputManager.isKeyDown("arrowup") ||
      this.inputManager.isKeyDown("w")
    ) {
      this.movementDirection[1] = -1;
    }

    if (
      this.inputManager.isKeyDown("arrowdown") ||
      this.inputManager.isKeyDown("s")
    ) {
      this.movementDirection[1] = 1;
    }

    // Normalize diagonal movement
    if (this.movementDirection[0] !== 0 || this.movementDirection[1] !== 0) {
      vec2.normalize(this.movementDirection, this.movementDirection);
    }

    // ---- Right Mouse: Shrink + Speed Boost ----
    if (this.inputManager.isLeftMouseDown() && !this.isShrunk) {
      this.isShrunk = true;

      this.drawRect.width = this.originalWidth * SHRINK_FACTOR;
      this.drawRect.height = this.originalHeight * SHRINK_FACTOR;

      // Keep center position
      this.drawRect.x += this.originalWidth * (1 - SHRINK_FACTOR) * 0.5;
      this.drawRect.y += this.originalHeight * (1 - SHRINK_FACTOR) * 0.5;
    }

    if (this.inputManager.isLeftMouseReleased() && this.isShrunk) {
      this.isShrunk = false;

      this.drawRect.x -= this.originalWidth * (1 - SHRINK_FACTOR) * 0.5;
      this.drawRect.y -= this.originalHeight * (1 - SHRINK_FACTOR) * 0.5;

      this.drawRect.width = this.originalWidth;
      this.drawRect.height = this.originalHeight;
    }

    // Speed boost while right mouse is held
    const currentSpeed = this.inputManager.isRightMouseDown()
      ? PLAYER_SPEED * SPEED_BOOST_MULTIPLIER
      : PLAYER_SPEED;

    // Apply movement
    this.drawRect.x += this.movementDirection[0] * currentSpeed * dt;
    this.drawRect.y += this.movementDirection[1] * currentSpeed * dt;

    this.clampToBounds();

    this.circleCollider.update(this.drawRect);
  }

  public draw(spriteRenderer: SpriteRenderer): void {
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect
    );
  }
}
