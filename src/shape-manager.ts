import { ShapeEntity } from "./shape-entity";
import { ShapeRenderer } from "./shape-renderer";
import { Color } from "./Color";

const MAX_SHAPES = 10000;

export class ShapeManager {
  private shapes: ShapeEntity[] = [];

  constructor(
    private gameWidth: number,
    private gameHeight: number,
  ) {
    // Start with one initial shape
    this.spawnShape(gameWidth / 2, 50);
  }

  private spawnShape(x: number, y: number) {
    // Limit shapes so the screen doesn't get too crowded (optional)
    if (this.shapes.length > MAX_SHAPES) return;

    const randomColor = new Color(Math.random(), Math.random(), Math.random());
    this.shapes.push(new ShapeEntity(x, y, randomColor));
  }

  public update(dt: number): void {
    let shapesToSpawn = 0;

    for (const shape of this.shapes) {
      const hitBottom = shape.update(dt, this.gameWidth, this.gameHeight);

      if (hitBottom) {
        shapesToSpawn++;
      }
    }

    // After updating all, spawn new ones for those that hit the bottom
    for (let i = 0; i < shapesToSpawn; i++) {
      this.spawnShape(Math.random() * (this.gameWidth - 50), 10);
    }
  }

  public draw(shapeRenderer: ShapeRenderer): void {
    for (const shape of this.shapes) {
      shape.draw(shapeRenderer);
    }
  }
}
