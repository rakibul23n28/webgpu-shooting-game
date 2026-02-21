import { vec2 } from "gl-matrix";
import { Color } from "./Color";
import { Rect } from "./rect";
import { ShapeRenderer } from "./shape-renderer";
import { Content } from "./content";

export class ShapeEntity {
  public position: vec2;
  public velocity: vec2;
  public size: number;
  public color: Color;

  constructor(x: number, y: number, color: Color) {
    this.position = vec2.fromValues(x, y);
    // Random initial velocity
    this.velocity = vec2.fromValues(
      (Math.random() - 0.5) * 0.4,
      Math.random() * 0.3 + 0.2, // Start moving downwards
    );
    this.size = 5 + Math.random() * 2;
    this.color = color;
  }

  public update(dt: number, gameWidth: number, gameHeight: number): boolean {
    this.position[0] += this.velocity[0] * dt;
    this.position[1] += this.velocity[1] * dt;

    let hitBottom = false;

    // Bounce Left/Right
    if (this.position[0] <= 0 || this.position[0] + this.size >= gameWidth) {
      this.velocity[0] *= -1;
    }

    // Bounce Top
    if (this.position[1] <= 0) {
      this.velocity[1] *= -1;
    }

    // Bounce Bottom
    if (this.position[1] + this.size >= gameHeight) {
      this.velocity[1] *= -1;
      this.position[1] = gameHeight - this.size; // Prevent getting stuck
      hitBottom = true;
    }

    return hitBottom;
  }

  public draw(shapeRenderer: ShapeRenderer): void {
    shapeRenderer.drawTexturedCircle(
      Content.iceTexture, // Using player texture or any loaded texture
      new Rect(this.position[0], this.position[1], this.size, this.size),
      this.color,
    );
  }
}
