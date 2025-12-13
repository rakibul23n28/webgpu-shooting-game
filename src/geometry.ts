export class Geometry {
  public vertices: number[];
  public indices: number[];

  constructor() {
    const x = 100;
    const y = 100;
    const w = 99;
    const h = 75;

    this.vertices = [
      x,
      y,
      0,
      0,
      1,
      1,
      1, // vertex 0
      x + w,
      y,
      1,
      0,
      1,
      1,
      1, // vertex 1
      x,
      y + h,
      0,
      1,
      1,
      1,
      1, // vertex 2
      x + w,
      y + h,
      1,
      1,
      1,
      1,
      1, // vertex 3
    ];

    this.indices = [0, 1, 2, 1, 2, 3];
  }
}
