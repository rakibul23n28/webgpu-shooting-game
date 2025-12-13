import { vec2 } from "gl-matrix";
import { Color } from "./Color";
import { Content } from "./content";
import { Rect } from "./rect";
import { SpriteRenderer } from "./sprite-renderer";
import { InputManager } from "./input-manager";

export class Engine {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private renderPass!: GPURenderPassEncoder;

  public spriteRenderer!: SpriteRenderer;

  private canvas!: HTMLCanvasElement;
  public inputManager!: InputManager;
  public gameBounds = vec2.create();

  public onUpdate: (dt: number) => void = () => {};
  public onDraw: () => void = () => {};

  private lastTime = 0;

  constructor() {}

  public async initialize() {
    this.canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;

    this.gameBounds[0] = this.canvas.width;
    this.gameBounds[1] = this.canvas.height;

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

    this.inputManager = new InputManager();
  }

  /**
   * Draw the current frame of the engine.
   * This method is called internally by the engine's requestAnimationFrame callback.
   * It is responsible for clearing the canvas, rendering the sprites, and submitting the command buffer to the GPU.
   * If you need to perform custom drawing operations, you can call the onDraw method after calling this method.
   */
  public draw() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    this.onUpdate(dt);
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

    this.onDraw();

    this.spriteRenderer.flameEnd();

    //end draw

    this.renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
    window.requestAnimationFrame(() => this.draw());
  }
}
