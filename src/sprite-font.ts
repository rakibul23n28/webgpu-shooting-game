import { vec2 } from "gl-matrix";
import { Quad } from "./quad";
import { Texture } from "./texture";

export class SpriteFontChar {
  constructor(
    public textureCoords: Quad,
    public size: vec2,
    public advance: number,
    public offset: vec2
  ) {}
}

export class SpriteFont {
  private chars: { [id: number]: SpriteFontChar } = {};
  constructor(
    public readonly texture: Texture,
    public readonly lineHeight: number
  ) {}

  public getChar(id: number): SpriteFontChar | undefined {
    return this.chars[id];
  }
  public createChar(
    id: number,
    textureCoords: Quad,
    size: vec2,
    advance: number,
    offset: vec2
  ) {
    this.chars[id] = new SpriteFontChar(textureCoords, size, advance, offset);
  }
}
