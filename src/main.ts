import { vec2 } from "gl-matrix";
import { Color } from "./Color";
import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";

class Renderer {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private renderPass!: GPURenderPassEncoder;

  private spriteRenderer!: SpriteRenderer;

  private canvas!: HTMLCanvasElement;

  constructor() {}

  public async initialize() {
    this.canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;

    if (!this.context) throw new Error("WebGPU not supported");

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });
    if (!adapter) throw new Error("No suitable GPU adapter found");

    this.device = await adapter.requestDevice();
    // Initialize content (load textures)
    await Content.initialize(this.device);

    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
    });

    this.spriteRenderer = new SpriteRenderer(
      this.device,
      this.canvas.width,
      this.canvas.height
    );
    this.spriteRenderer.initialize();
  }

  rotation = 0;

  public draw() {
    const commandEncoder = this.device.createCommandEncoder();

    this.renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.05, g: 0.07, b: 0.12, a: 1.0 },

          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    //begin draw
    this.spriteRenderer.framepass(this.renderPass);

    // for (let i = 0; i < 10000; i++) {
    //   this.spriteRenderer.drawSprite(
    //     Content.ufoRedTexture,
    //     new Rect(
    //       Math.random() * this.canvas.width,
    //       Math.random() * this.canvas.height,

    //       10,
    //       10
    //     )
    //   );
    // }
    // for (let i = 0; i < 10000; i++) {
    //   this.spriteRenderer.drawSprite(
    //     Content.playerTexture,
    //     new Rect(
    //       Math.random() * this.canvas.width,
    //       Math.random() * this.canvas.height,

    //       10,
    //       10
    //     )
    //   );
    // }
    this.rotation += 0.01;

    const playerTexture = Content.sprites["playerShip1_blue.png"];
    playerTexture.drawRect.x = 100;
    playerTexture.drawRect.y = 100;
    this.spriteRenderer.drawSpriteSource(
      playerTexture.texture,
      playerTexture.drawRect,
      playerTexture.sourceRect,
      new Color(1, 0, 0),
      this.rotation,
      vec2.fromValues(0.5, 0.5)
    );

    const shieldTexture = Content.sprites["shield1.png"];
    shieldTexture.drawRect.x = playerTexture.drawRect.x - 17;
    shieldTexture.drawRect.y = playerTexture.drawRect.y - 10;
    this.spriteRenderer.drawSpriteSource(
      shieldTexture.texture,
      shieldTexture.drawRect,
      shieldTexture.sourceRect,
      new Color(0.2, 0.6, 1.0),
      this.rotation,
      vec2.fromValues(0.5, 0.5)
    );

    this.spriteRenderer.flameEnd();

    //end draw

    this.renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
    window.requestAnimationFrame(() => this.draw());
  }
}

const renderer = new Renderer();
renderer.initialize().then(() => {
  renderer.draw();
});
