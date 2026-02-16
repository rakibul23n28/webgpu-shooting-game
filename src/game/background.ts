import { Content } from "../content";
import { Rect } from "../rect";
import { SpriteRenderer } from "../sprite-renderer";

const backGorund_SCROLL_SPEED = 0.25;

export class Background {
  private drawRect: Rect;
  private drawRect2: Rect;

  constructor(
    private gameWidth: number,
    private gameHeight: number,
  ) {
    this.drawRect = new Rect(0, 0, this.gameWidth, this.gameHeight);
    this.drawRect2 = new Rect(
      0,
      -this.gameHeight,
      this.gameWidth,
      this.gameHeight,
    );
  }
  public update(dt: number) {
    this.drawRect.y += backGorund_SCROLL_SPEED * dt;
    this.drawRect2.y = this.drawRect.y - this.gameHeight;

    if (this.drawRect.y > this.drawRect.height) {
      const temp = this.drawRect.copy();
      this.drawRect = this.drawRect2.copy();
      this.drawRect2 = temp;
    }
  }
  public draw(spriteRenderer: SpriteRenderer) {
    spriteRenderer.drawSprite(Content.backgroundTexture, this.drawRect);
    spriteRenderer.drawSprite(Content.backgroundTexture, this.drawRect2);
  }
}
