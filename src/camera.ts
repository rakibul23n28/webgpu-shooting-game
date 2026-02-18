import { mat4 } from "gl-matrix";

export class Camera {
  private projection!: mat4;
  private view!: mat4;
  public projectionViewMatrix: mat4 = mat4.create();

  constructor(
    public width: number,
    public height: number,
  ) {
    this.projectionViewMatrix = mat4.create();
  }

  public update() {
    this.projection = mat4.ortho(
      mat4.create(),
      0, // left
      this.width, // right
      this.height, // bottom
      0, // top
      -1, // near
      1, // far
    );

    this.view = mat4.lookAt(mat4.create(), [0, 0, 1], [0, 0, 0], [0, 1, 0]);

    mat4.multiply(this.projectionViewMatrix, this.projection, this.view);
  }
}
