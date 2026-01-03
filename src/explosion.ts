import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";
import { SoundManager } from "./sound-manager";

const TIME_TO_NEXT_FRAME = 1000 / 30;
export class Explosion {
  public playing = false;
  private timeToNextFrame = 0;

  private sourceRect: Rect;
  private drawRect: Rect;

  private curretColumn = 0;
  private currentRow = 0;

  private readonly cols = 8;
  private readonly rows = 3;

  constructor() {
    this.sourceRect = new Rect(0, 0, 64, 64);
    this.drawRect = new Rect(0, 0, 64, 85.3333333333);
  }

  public play(drawRect: Rect) {
    this.playing = true;
    this.timeToNextFrame = 0;
    this.curretColumn = 0;
    this.currentRow = 0;
    this.drawRect = drawRect.copy();
  }

  public update(dt: number) {
    if (!this.playing) return;

    this.timeToNextFrame += dt;
    if (this.timeToNextFrame > TIME_TO_NEXT_FRAME) {
      this.timeToNextFrame = 0;
      this.curretColumn += 1;

      if (this.curretColumn >= this.cols) {
        this.curretColumn = 0;
        this.currentRow += 1;
        if (this.currentRow >= this.rows) {
          this.currentRow = 0;
          this.playing = false;
        }
      }
    }
  }

  public draw(spriteRenderer: SpriteRenderer) {
    if (!this.playing) return;
    this.sourceRect.x = this.curretColumn * this.sourceRect.width;
    this.sourceRect.y = this.currentRow * this.sourceRect.height;
    spriteRenderer.drawSpriteSource(
      Content.explosionTexture,
      this.drawRect,
      this.sourceRect
    );
  }
}
