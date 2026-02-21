import { vec2 } from "gl-matrix";
import { Content } from "./content";
import { MusicContent } from "./music-content";
import { SpriteRenderer } from "./sprite-renderer";
import { InputManager } from "./input-manager";
import { EffectsFactory } from "./effects-factory";
import { Texture } from "./texture";
import { ShapeRenderer } from "./shape-renderer";

export class Engine {
  private context!: GPUCanvasContext;
  private device!: GPUDevice;
  private renderPass!: GPURenderPassEncoder;

  public spriteRenderer!: SpriteRenderer;
  public shapeRenderer!: ShapeRenderer;
  public inputManager!: InputManager;
  public effectsfactory!: EffectsFactory;

  public gameBounds = vec2.create();
  public onUpdate: (dt: number) => void = () => {};
  public onDraw: (commandEncoder: GPUCommandEncoder) => void = () => {};

  private destinationTexture: GPUTexture | null = null;
  private destinationTexture2: GPUTexture | null = null;
  private lastTime = 0;

  public setDestinationTexture(texture: GPUTexture | null) {
    this.destinationTexture = texture;
  }

  public setDestinationTexture2(texture: GPUTexture | null) {
    this.destinationTexture2 = texture;
  }

  public getCanvasTexture(): GPUTexture {
    return this.context.getCurrentTexture();
  }

  public async initialize() {
    this.canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;

    if (!this.context) throw new Error("WebGPU not supported");

    this.gameBounds[0] = this.canvas.width;
    this.gameBounds[1] = this.canvas.height;

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });
    if (!adapter) throw new Error("No suitable GPU adapter found");

    this.device = await adapter.requestDevice();

    await Content.initialize(this.device);
    await MusicContent.initialize();

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    const bloomFormat = "bgra8unorm"; // Consistent format for brightness/bloom

    this.context.configure({
      device: this.device,
      format: canvasFormat,
    });

    // 1. Create Bloom Target Texture
    const bloomTexWrapper = await Texture.createEmptyTexture(
      this.device,
      this.canvas.width,
      this.canvas.height,
      bloomFormat,
    );
    this.destinationTexture2 = bloomTexWrapper.texture;

    // 2. Initialize Renderers with correct pipeline formats
    this.shapeRenderer = new ShapeRenderer(
      this.device,
      this.canvas.width,
      this.canvas.height,
    );
    this.shapeRenderer.initialize(canvasFormat, bloomFormat);

    this.spriteRenderer = new SpriteRenderer(
      this.device,
      this.canvas.width,
      this.canvas.height,
    );
    this.spriteRenderer.initialize(canvasFormat, bloomFormat);

    this.inputManager = new InputManager();
    this.effectsfactory = new EffectsFactory(
      this.device,
      this.canvas.width,
      this.canvas.height,
    );
  }

  private canvas!: HTMLCanvasElement;

  public draw() {
    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this.onUpdate(dt);

    const commandEncoder = this.device.createCommandEncoder();

    // Determine which texture to use for the main scene
    const mainView = this.destinationTexture
      ? this.destinationTexture.createView()
      : this.context.getCurrentTexture().createView();

    // This pass handles both the scene and the brightness map simultaneously
    this.renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: mainView,
          clearValue: { r: 0.05, g: 0.07, b: 0.12, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
        {
          view: this.destinationTexture2!.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    // Prep renderers for the current pass
    this.spriteRenderer.framepass(this.renderPass);
    this.shapeRenderer.begin(this.renderPass);

    // Execute user draw logic (which populates the batch data)
    this.onDraw(commandEncoder);

    // Finalize batches and submit to GPU
    this.spriteRenderer.flameEnd();
    this.shapeRenderer.flush();

    this.renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
    window.requestAnimationFrame(() => this.draw());
  }
}
