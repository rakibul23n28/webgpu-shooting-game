export class Color {
  constructor(
    public r = 1,
    public g = 1,
    public b = 1,
    public a = 1,
  ) {}
  public set(r: number, g: number, b: number, a: number = 1): void {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
