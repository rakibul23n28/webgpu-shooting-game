import { CircleCollider } from "./circle-colider";
import { Content } from "./content";
import { Player } from "./game/player";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";
import { Texture } from "./texture";

const BULLET_SPEED = 0.75;

export class Bullet {
  public readonly drawRect: Rect;
  private sourceRect: Rect;
  public active: boolean = true;
  public colider: CircleCollider = new CircleCollider();
  private texture: Texture;

  constructor() {
    const spite = Content.sprites["laserBlue01"];
    this.drawRect = spite.drawRect.copy();
    this.sourceRect = spite.sourceRect.copy();
    this.texture = spite.texture;
  }

  public spawn(player: Player) {
    this.active = true;

    this.drawRect.x =
      player.drawRect.x + player.drawRect.width / 2 - this.drawRect.width / 2;

    this.drawRect.y = player.drawRect.y - this.drawRect.height;

    this.colider.update(this.drawRect); // important on spawn
  }

  public update(dt: number) {
    this.drawRect.y -= BULLET_SPEED * dt;
    this.colider.update(this.drawRect);
    if (this.drawRect.y + this.drawRect.height < 0) this.active = false;
  }
  public draw(spriteRenderer: SpriteRenderer) {
    if (!this.active) return;
    spriteRenderer.drawSpriteSource(
      this.texture,
      this.drawRect,
      this.sourceRect
    );
  }
}
